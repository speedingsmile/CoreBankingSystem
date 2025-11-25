package workflow

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

type Engine struct {
	db *sql.DB
}

func NewEngine(db *sql.DB) *Engine {
	return &Engine{db: db}
}

type WorkflowDefinition struct {
	ID           uuid.UUID
	Name         string
	TriggerEvent string
}

type WorkflowStep struct {
	ID           uuid.UUID
	DefinitionID uuid.UUID
	Sequence     int
	RoleRequired string
	LogicRule    string // JSON string
}

type WorkflowInstance struct {
	ID            uuid.UUID
	DefinitionID  uuid.UUID
	CurrentStepID *uuid.UUID
	Status        string
	Payload       string // JSON string
	CreatedAt     time.Time
}

// LogicRule structure matching the JSON
type LogicRule struct {
	Variable string      `json:"variable"`
	Operator string      `json:"operator"`
	Value    interface{} `json:"value"`
}

// CheckWorkflow determines if an event triggers a workflow
func (e *Engine) CheckWorkflow(event string, payload map[string]interface{}) (*WorkflowDefinition, error) {
	// 1. Find definitions for this event
	query := `SELECT id, name, trigger_event FROM workflow_definitions WHERE trigger_event = $1`
	rows, err := e.db.Query(query, event)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var def WorkflowDefinition
		if err := rows.Scan(&def.ID, &def.Name, &def.TriggerEvent); err != nil {
			return nil, err
		}

		// 2. Check if any step's logic rule matches the payload (Start Condition)
		// For simplicity in this prototype, we assume if the Trigger matches, we start the workflow.
		// In a real system, we might evaluate a "Start Condition" on the definition itself.
		// Or we check the first step.
		// Let's check the first step's rule to see if it applies.
		firstStep, err := e.getFirstStep(def.ID)
		if err != nil {
			continue // No steps? Skip
		}

		match, err := e.EvaluateRule(payload, firstStep.LogicRule)
		if err != nil {
			log.Printf("Error evaluating rule: %v", err)
			continue
		}
		if match {
			return &def, nil
		}
	}

	return nil, nil // No matching workflow
}

func (e *Engine) getFirstStep(defID uuid.UUID) (*WorkflowStep, error) {
	query := `SELECT id, definition_id, sequence_order, role_required, logic_rule 
	          FROM workflow_steps 
	          WHERE definition_id = $1 
	          ORDER BY sequence_order ASC LIMIT 1`
	var step WorkflowStep
	err := e.db.QueryRow(query, defID).Scan(&step.ID, &step.DefinitionID, &step.Sequence, &step.RoleRequired, &step.LogicRule)
	if err != nil {
		return nil, err
	}
	return &step, nil
}

func (e *Engine) StartWorkflow(defID uuid.UUID, payload map[string]interface{}, requesterID *uuid.UUID) (*WorkflowInstance, error) {
	payloadBytes, _ := json.Marshal(payload)

	// Get first step
	firstStep, err := e.getFirstStep(defID)
	if err != nil {
		return nil, fmt.Errorf("cannot start workflow without steps: %w", err)
	}

	inst := &WorkflowInstance{
		ID:            uuid.New(),
		DefinitionID:  defID,
		CurrentStepID: &firstStep.ID,
		Status:        "PENDING",
		Payload:       string(payloadBytes),
		CreatedAt:     time.Now(),
	}

	query := `INSERT INTO workflow_instances (id, definition_id, current_step_id, status, payload, requester_id, created_at)
	          VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err = e.db.Exec(query, inst.ID, inst.DefinitionID, inst.CurrentStepID, inst.Status, inst.Payload, requesterID, inst.CreatedAt)
	if err != nil {
		return nil, err
	}
	return inst, nil
}

func (e *Engine) EvaluateRule(payload map[string]interface{}, ruleJSON string) (bool, error) {
	var rule LogicRule
	if err := json.Unmarshal([]byte(ruleJSON), &rule); err != nil {
		return false, fmt.Errorf("invalid rule json: %w", err)
	}

	val, exists := payload[rule.Variable]
	if !exists {
		return false, nil // Variable not in payload, assume false
	}

	// Simple comparison logic
	// Note: Type assertion is tricky with JSON numbers (float64)
	switch rule.Operator {
	case ">":
		return toFloat(val) > toFloat(rule.Value), nil
	case "<":
		return toFloat(val) < toFloat(rule.Value), nil
	case "=":
		return val == rule.Value, nil
	default:
		return false, fmt.Errorf("unknown operator: %s", rule.Operator)
	}
}

func toFloat(v interface{}) float64 {
	switch i := v.(type) {
	case float64:
		return i
	case int:
		return float64(i)
	case int64:
		return float64(i)
	default:
		return 0
	}
}

func (e *Engine) GetPendingApprovals(role string) ([]*WorkflowInstance, error) {
	query := `
		SELECT i.id, i.definition_id, i.status, i.payload, i.created_at, s.role_required
		FROM workflow_instances i
		JOIN workflow_steps s ON i.current_step_id = s.id
		WHERE i.status = 'PENDING' AND s.role_required = $1
	`
	rows, err := e.db.Query(query, role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var instances []*WorkflowInstance
	for rows.Next() {
		var i WorkflowInstance
		var roleReq string
		if err := rows.Scan(&i.ID, &i.DefinitionID, &i.Status, &i.Payload, &i.CreatedAt, &roleReq); err != nil {
			return nil, err
		}
		instances = append(instances, &i)
	}
	return instances, nil
}

func (e *Engine) Approve(instanceID uuid.UUID, approverID uuid.UUID) error {
	// 1. Get current state
	var currentStepID uuid.UUID
	var defID uuid.UUID
	err := e.db.QueryRow("SELECT current_step_id, definition_id FROM workflow_instances WHERE id = $1", instanceID).Scan(&currentStepID, &defID)
	if err != nil {
		return err
	}

	// 2. Log Approval
	_, err = e.db.Exec("INSERT INTO workflow_approvals (instance_id, step_id, approver_id, status) VALUES ($1, $2, $3, 'APPROVED')", instanceID, currentStepID, approverID)
	if err != nil {
		return err
	}

	// 3. Find Next Step
	var currentSeq int
	err = e.db.QueryRow("SELECT sequence_order FROM workflow_steps WHERE id = $1", currentStepID).Scan(&currentSeq)
	if err != nil {
		return err
	}

	query := `SELECT id FROM workflow_steps WHERE definition_id = $1 AND sequence_order > $2 ORDER BY sequence_order ASC LIMIT 1`
	var nextStepID uuid.UUID
	err = e.db.QueryRow(query, defID, currentSeq).Scan(&nextStepID)

	if err == sql.ErrNoRows {
		// No more steps -> Workflow Completed
		_, err = e.db.Exec("UPDATE workflow_instances SET status = 'APPROVED', current_step_id = NULL, updated_at = NOW() WHERE id = $1", instanceID)
		// Here we would trigger the actual execution of the suspended transaction
		// For prototype, we just mark as APPROVED
	} else if err != nil {
		return err
	} else {
		// Move to next step
		_, err = e.db.Exec("UPDATE workflow_instances SET current_step_id = $1, updated_at = NOW() WHERE id = $2", nextStepID, instanceID)
	}

	return err
}

func (e *Engine) Reject(instanceID uuid.UUID, approverID uuid.UUID, reason string) error {
	// Log Rejection
	// Mark Instance as REJECTED
	_, err := e.db.Exec("UPDATE workflow_instances SET status = 'REJECTED', current_step_id = NULL, updated_at = NOW() WHERE id = $1", instanceID)
	return err
}
