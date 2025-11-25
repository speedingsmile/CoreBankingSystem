package batch

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/nathanmocogni/core-banking-system/internal/ledger"
)

type JobStatus string

const (
	StatusRunning   JobStatus = "RUNNING"
	StatusCompleted JobStatus = "COMPLETED"
	StatusFailed    JobStatus = "FAILED"
)

type BatchRecord struct {
	ID        uuid.UUID
	JobName   string
	StartTime time.Time
	EndTime   *time.Time
	Status    JobStatus
	ErrorLog  string
}

type Job interface {
	Name() string
	Run(ctx context.Context) error
}

type Engine struct {
	db            *sql.DB
	ledgerService *ledger.Service
	jobs          map[string]Job
	mu            sync.Mutex
}

func NewEngine(db *sql.DB, ledgerService *ledger.Service) *Engine {
	return &Engine{
		db:            db,
		ledgerService: ledgerService,
		jobs:          make(map[string]Job),
	}
}

func (e *Engine) RegisterJob(job Job) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.jobs[job.Name()] = job
}

func (e *Engine) RunJob(ctx context.Context, name string) (*BatchRecord, error) {
	e.mu.Lock()
	job, exists := e.jobs[name]
	e.mu.Unlock()

	if !exists {
		return nil, fmt.Errorf("job %s not found", name)
	}

	// Create Batch Record
	record := &BatchRecord{
		ID:        uuid.New(),
		JobName:   name,
		StartTime: time.Now(),
		Status:    StatusRunning,
	}

	if err := e.logStart(record); err != nil {
		return nil, err
	}

	// Run Job
	go func() {
		err := job.Run(ctx)
		endTime := time.Now()
		record.EndTime = &endTime

		if err != nil {
			record.Status = StatusFailed
			record.ErrorLog = err.Error()
			log.Printf("Job %s failed: %v", name, err)
		} else {
			record.Status = StatusCompleted
			log.Printf("Job %s completed successfully", name)
		}

		if updateErr := e.logEnd(record); updateErr != nil {
			log.Printf("Failed to update batch record for %s: %v", name, updateErr)
		}
	}()

	return record, nil
}

func (e *Engine) logStart(record *BatchRecord) error {
	query := `INSERT INTO batches (id, job_name, start_time, status) VALUES ($1, $2, $3, $4)`
	_, err := e.db.Exec(query, record.ID, record.JobName, record.StartTime, record.Status)
	return err
}

func (e *Engine) logEnd(record *BatchRecord) error {
	query := `UPDATE batches SET end_time = $1, status = $2, error_log = $3 WHERE id = $4`
	_, err := e.db.Exec(query, record.EndTime, record.Status, record.ErrorLog, record.ID)
	return err
}

func (e *Engine) GetHistory() ([]*BatchRecord, error) {
	query := `SELECT id, job_name, start_time, end_time, status, error_log FROM batches ORDER BY start_time DESC LIMIT 50`
	rows, err := e.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*BatchRecord
	for rows.Next() {
		var r BatchRecord
		var errLog sql.NullString
		if err := rows.Scan(&r.ID, &r.JobName, &r.StartTime, &r.EndTime, &r.Status, &errLog); err != nil {
			return nil, err
		}
		r.ErrorLog = errLog.String
		history = append(history, &r)
	}
	return history, nil
}

// --- Specific Jobs ---

type DailyAccrualJob struct {
	service *ledger.Service
}

func NewDailyAccrualJob(s *ledger.Service) *DailyAccrualJob {
	return &DailyAccrualJob{service: s}
}

func (j *DailyAccrualJob) Name() string { return "Daily Accrual" }

func (j *DailyAccrualJob) Run(ctx context.Context) error {
	// Call the existing CalculateInterest method in ledger service
	// Note: In a real system, we might want to pass a date or handle idempotency better
	txs, err := j.service.CalculateInterest()
	if err != nil {
		return err
	}
	log.Printf("Accrual Job: Processed %d transactions", len(txs))
	return nil
}

type CapitalizationJob struct {
	service *ledger.Service
}

func NewCapitalizationJob(s *ledger.Service) *CapitalizationJob {
	return &CapitalizationJob{service: s}
}

func (j *CapitalizationJob) Name() string { return "Capitalization" }

func (j *CapitalizationJob) Run(ctx context.Context) error {
	// Placeholder logic for Capitalization
	// 1. Find all accounts with accrued interest (Liability accounts)
	// 2. Move from Accrued Interest Payable (Liability) to Customer Account (Liability - Credit)
	// For prototype, we'll just log
	log.Println("Running Capitalization Job (Mock)...")
	time.Sleep(2 * time.Second) // Simulate work
	return nil
}

type FeeSweeperJob struct {
	service *ledger.Service
}

func NewFeeSweeperJob(s *ledger.Service) *FeeSweeperJob {
	return &FeeSweeperJob{service: s}
}

func (j *FeeSweeperJob) Name() string { return "Fee Sweeper" }

func (j *FeeSweeperJob) Run(ctx context.Context) error {
	log.Println("Running Fee Sweeper Job (Mock)...")
	// Logic: Find accounts with periodic fees due -> Post Fee Transaction
	time.Sleep(1 * time.Second)
	return nil
}
