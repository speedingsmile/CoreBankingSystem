package ledger

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type AccountType string

const (
	Asset     AccountType = "ASSET"
	Liability AccountType = "LIABILITY"
	Equity    AccountType = "EQUITY"
	Income    AccountType = "INCOME"
	Expense   AccountType = "EXPENSE"
)

type Account struct {
	ID              uuid.UUID      `json:"id"`
	Name            string         `json:"name"`
	Type            AccountType    `json:"type"`
	Currency        string         `json:"currency"`
	Balance         int64          `json:"balance"` // In minor units (e.g., cents)
	ProductID       *uuid.UUID     `json:"product_id,omitempty"`
	AccountCategory sql.NullString `json:"account_category"`
	ClientID        uuid.NullUUID  `json:"client_id"`
	OwnershipType   sql.NullString `json:"ownership_type"`
	FeeScheduleID   sql.NullString `json:"fee_schedule_id"`
	CreatedAt       time.Time      `json:"created_at"`
}

type ProductStatus string

const (
	ProductStatusDraft    ProductStatus = "DRAFT"
	ProductStatusActive   ProductStatus = "ACTIVE"
	ProductStatusArchived ProductStatus = "ARCHIVED"
)

type Product struct {
	ID              uuid.UUID     `json:"id"`
	Name            string        `json:"name"`
	InterestRateBPS int64         `json:"interest_rate_bps"` // Basis points (e.g. 500 = 5.00%)
	Status          ProductStatus `json:"status"`
	Version         int           `json:"version"`
	ParentProductID *uuid.UUID    `json:"parent_product_id,omitempty"`
	CreatedAt       time.Time     `json:"created_at"`
}

type Transaction struct {
	ID          uuid.UUID `json:"id"`
	Reference   string    `json:"reference"`
	Description string    `json:"description"`
	PostedAt    time.Time `json:"posted_at"`
	Entries     []Entry   `json:"entries"`
}

type EntryDirection string

const (
	Debit  EntryDirection = "DEBIT"
	Credit EntryDirection = "CREDIT"
)

type Entry struct {
	ID            uuid.UUID      `json:"id"`
	TransactionID uuid.UUID      `json:"transaction_id"`
	AccountID     uuid.UUID      `json:"account_id"`
	Direction     EntryDirection `json:"direction"`
	Amount        int64          `json:"amount"`
	CreatedAt     time.Time      `json:"created_at"`
}

type ConfigStatus string

const (
	ConfigStatusDraft    ConfigStatus = "DRAFT"
	ConfigStatusActive   ConfigStatus = "ACTIVE"
	ConfigStatusArchived ConfigStatus = "ARCHIVED"
)

type Fee struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Method      string       `json:"method"` // FLAT, PERCENTAGE
	Value       float64      `json:"value"`
	Frequency   string       `json:"frequency"` // REALTIME, PERIODIC
	GLAccountID uuid.UUID    `json:"gl_account_id"`
	Status      ConfigStatus `json:"status"`
	Version     int          `json:"version"`
	ParentFeeID *uuid.UUID   `json:"parent_fee_id,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
}

type Rule struct {
	ID           uuid.UUID    `json:"id"`
	Name         string       `json:"name"`
	Description  string       `json:"description"`
	Condition    string       `json:"condition_json"` // JSON string for simplicity in prototype
	Action       string       `json:"action_json"`    // JSON string
	Status       ConfigStatus `json:"status"`
	Version      int          `json:"version"`
	ParentRuleID *uuid.UUID   `json:"parent_rule_id,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
}
