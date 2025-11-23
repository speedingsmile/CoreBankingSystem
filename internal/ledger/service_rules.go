package ledger

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// CreateRule creates a new rule definition
func (s *Service) CreateRule(name, description, condition, action string) (*Rule, error) {
	id := uuid.New()
	now := time.Now()
	rule := &Rule{
		ID:          id,
		Name:        name,
		Description: description,
		Condition:   condition,
		Action:      action,
		Status:      ConfigStatusDraft,
		Version:     1,
		CreatedAt:   now,
	}

	query := `
		INSERT INTO rules (id, name, description, condition_json, action_json, status, version, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := s.db.Exec(query, rule.ID, rule.Name, rule.Description, rule.Condition, rule.Action, rule.Status, rule.Version, rule.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create rule: %w", err)
	}

	return rule, nil
}

// UpdateRule updates an existing rule.
// Safe Edit Logic:
// - If Status is DRAFT: Full edit allowed.
// - If Status is ACTIVE:
//   - Prevent changing Condition or Action (critical logic).
//   - Allow changing Name, Description.
//   - Allow changing Status (e.g. to ARCHIVED).
func (s *Service) UpdateRule(id uuid.UUID, name, description, condition, action string, status ConfigStatus) (*Rule, error) {
	currentRule := &Rule{}
	err := s.db.QueryRow("SELECT id, name, description, condition_json, action_json, status, version FROM rules WHERE id = $1", id).
		Scan(&currentRule.ID, &currentRule.Name, &currentRule.Description, &currentRule.Condition, &currentRule.Action, &currentRule.Status, &currentRule.Version)
	if err != nil {
		return nil, fmt.Errorf("rule not found: %w", err)
	}

	// Safe Edit Logic
	if currentRule.Status == ConfigStatusActive {
		if condition != currentRule.Condition || action != currentRule.Action {
			return nil, fmt.Errorf("cannot change condition or action of an active rule. Create a new version instead")
		}
	}

	query := `
		UPDATE rules
		SET name = $1, description = $2, condition_json = $3, action_json = $4, status = $5, version = version + 1
		WHERE id = $6
		RETURNING version
	`
	err = s.db.QueryRow(query, name, description, condition, action, status, id).Scan(&currentRule.Version)
	if err != nil {
		return nil, fmt.Errorf("failed to update rule: %w", err)
	}

	currentRule.Name = name
	currentRule.Description = description
	currentRule.Condition = condition
	currentRule.Action = action
	currentRule.Status = status

	return currentRule, nil
}

// CloneRule creates a new DRAFT version of an existing rule
func (s *Service) CloneRule(id uuid.UUID) (*Rule, error) {
	original := &Rule{}
	err := s.db.QueryRow("SELECT name, description, condition_json, action_json FROM rules WHERE id = $1", id).
		Scan(&original.Name, &original.Description, &original.Condition, &original.Action)
	if err != nil {
		return nil, fmt.Errorf("original rule not found: %w", err)
	}

	newVersionName := fmt.Sprintf("%s (v2)", original.Name)
	// In a real app, we'd have smarter version naming or a separate version column that increments
	// For now, appending (v2) or similar is a simple indicator.

	newRule, err := s.CreateRule(newVersionName, original.Description, original.Condition, original.Action)
	if err != nil {
		return nil, err
	}

	// Link to parent
	_, err = s.db.Exec("UPDATE rules SET parent_rule_id = $1 WHERE id = $2", id, newRule.ID)
	if err != nil {
		// Log error but don't fail the operation as the new rule is created
		fmt.Printf("failed to link parent rule: %v\n", err)
	}

	return newRule, nil
}

// ListRules returns all rules
func (s *Service) ListRules() ([]Rule, error) {
	rows, err := s.db.Query("SELECT id, name, description, condition_json, action_json, status, version, created_at FROM rules ORDER BY created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("failed to list rules: %w", err)
	}
	defer rows.Close()

	var rules []Rule
	for rows.Next() {
		var r Rule
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Condition, &r.Action, &r.Status, &r.Version, &r.CreatedAt); err != nil {
			return nil, err
		}
		rules = append(rules, r)
	}
	return rules, nil
}
