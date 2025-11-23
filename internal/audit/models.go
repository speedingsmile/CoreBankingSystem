package audit

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID         uuid.UUID       `json:"id"`
	EntityName string          `json:"entity_name"`
	EntityID   uuid.UUID       `json:"entity_id"`
	Action     string          `json:"action"` // CREATE, UPDATE, DELETE
	ActorID    uuid.UUID       `json:"actor_id"`
	Timestamp  time.Time       `json:"timestamp"`
	Changes    json.RawMessage `json:"changes"` // JSONB
}
