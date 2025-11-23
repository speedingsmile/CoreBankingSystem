package audit

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"

	"github.com/segmentio/kafka-go"
)

type AuditConsumer struct {
	reader *kafka.Reader
	db     *sql.DB
}

func NewAuditConsumer(brokers []string, topic string, groupID string, db *sql.DB) *AuditConsumer {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  brokers,
		GroupID:  groupID,
		Topic:    topic,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})
	return &AuditConsumer{reader: r, db: db}
}

func (c *AuditConsumer) Start(ctx context.Context) {
	for {
		m, err := c.reader.ReadMessage(ctx)
		if err != nil {
			// Check if context was cancelled
			if ctx.Err() != nil {
				return
			}
			log.Printf("error reading audit message: %v", err)
			continue
		}

		var auditLog AuditLog
		if err := json.Unmarshal(m.Value, &auditLog); err != nil {
			log.Printf("error unmarshalling audit log: %v", err)
			continue
		}

		if err := c.insertAuditLog(ctx, auditLog); err != nil {
			log.Printf("error inserting audit log to db: %v", err)
			// In a real system, we might want to retry or DLQ here
		}
	}
}

func (c *AuditConsumer) insertAuditLog(ctx context.Context, log AuditLog) error {
	query := `
		INSERT INTO audit_logs (id, entity_name, entity_id, action, actor_id, timestamp, changes)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := c.db.ExecContext(ctx, query,
		log.ID, log.EntityName, log.EntityID, log.Action, log.ActorID, log.Timestamp, log.Changes,
	)
	return err
}

func (c *AuditConsumer) Close() error {
	return c.reader.Close()
}
