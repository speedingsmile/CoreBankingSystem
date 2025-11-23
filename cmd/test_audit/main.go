package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/nathanmocogni/core-banking-system/internal/audit"
)

func main() {
	// 1. Setup Connections
	dbHost := "localhost"
	dbPort := 5433 // External port
	dbUser := "user"
	dbPassword := "password"
	dbName := "ledger"
	kafkaBrokers := []string{"localhost:9093"} // External port

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// 2. Initialize Producer
	producer := audit.NewAuditProducer(kafkaBrokers, "system.audits")
	defer producer.Close()

	// 3. Publish Test Audit Log
	testID := uuid.New()
	logEntry := audit.AuditLog{
		ID:         uuid.New(),
		EntityName: "TEST_ENTITY",
		EntityID:   testID,
		Action:     "CREATE",
		ActorID:    uuid.New(),
		Timestamp:  time.Now(),
		Changes:    []byte(`{"field": "old", "new": "value"}`),
	}

	fmt.Println("Publishing audit log to Kafka...")
	if err := producer.PublishAudit(context.Background(), logEntry); err != nil {
		log.Fatalf("Failed to publish audit: %v", err)
	}
	fmt.Println("Audit log published successfully.")

	// 4. Verify in Database (Poll for up to 10 seconds)
	fmt.Println("Waiting for audit log to appear in database...")
	for i := 0; i < 20; i++ {
		var id uuid.UUID
		err := db.QueryRow("SELECT id FROM audit_logs WHERE entity_id = $1", testID).Scan(&id)
		if err == nil {
			fmt.Printf("SUCCESS: Audit log found in database! ID: %s\n", id)
			return
		}
		time.Sleep(500 * time.Millisecond)
	}

	fmt.Println("FAILURE: Audit log did not appear in database after 10 seconds.")
	os.Exit(1)
}
