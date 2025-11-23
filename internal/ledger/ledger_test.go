package ledger

import (
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

// TestMain handles setup and teardown for the test suite.
func TestMain(m *testing.M) {
	// Ensure we are running in an environment where we can connect to the DB.
	// For local testing, we assume the docker container is running on port 5433 (mapped).
	// If running inside docker, it might be different.
	// We'll skip if DB connection fails.
	code := m.Run()
	os.Exit(code)
}

func connectDB() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5433"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "user"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "password"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "ledger"
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	return sql.Open("postgres", connStr)
}

func TestCreateAccount(t *testing.T) {
	db, err := connectDB()
	if err != nil {
		t.Skip("Skipping test: could not connect to database")
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Skip("Skipping test: database not reachable")
	}

	service := NewService(db, nil)

	name := fmt.Sprintf("Test Account %d", time.Now().UnixNano())
	acc, err := service.CreateAccount(name, Asset, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create account: %v", err)
	}

	if acc.ID == uuid.Nil {
		t.Error("Expected non-nil Account ID")
	}
	if acc.Balance != 0 {
		t.Errorf("Expected initial balance 0, got %d", acc.Balance)
	}
}

func TestPostTransaction_Balanced(t *testing.T) {
	db, err := connectDB()
	if err != nil {
		t.Skip("Skipping test: could not connect to database")
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		t.Skip("Skipping test: database not reachable")
	}

	service := NewService(db, nil)

	// Setup accounts
	// Setup accounts
	acc1, _ := service.CreateAccount("Acc 1", Asset, "USD", "CASH", "INDIVIDUAL", nil)
	acc2, _ := service.CreateAccount("Acc 2", Equity, "USD", "CASH", "INDIVIDUAL", nil)

	// Post Transaction
	entries := []Entry{
		{AccountID: acc1.ID, Direction: Debit, Amount: 100},
		{AccountID: acc2.ID, Direction: Credit, Amount: 100},
	}

	ref := fmt.Sprintf("REF-%d", time.Now().UnixNano())
	tx, err := service.PostTransaction(ref, "Test Tx", entries)
	if err != nil {
		t.Fatalf("Failed to post transaction: %v", err)
	}

	if tx.ID == uuid.Nil {
		t.Error("Expected non-nil Transaction ID")
	}

	// Verify Balances
	updatedAcc1, _ := service.GetAccount(acc1.ID)
	updatedAcc2, _ := service.GetAccount(acc2.ID)

	if updatedAcc1.Balance != 100 {
		t.Errorf("Expected Acc1 balance 100, got %d", updatedAcc1.Balance)
	}
	if updatedAcc2.Balance != -100 { // Equity increases with Credit (which is negative in our signed balance model? Wait, let's check logic)
		// Logic check:
		// Debit increases Asset (+).
		// Credit increases Equity (-).
		// Wait, in my service.go:
		// if Debit -> amountChange = amount
		// if Credit -> amountChange = -amount
		// So Credit to Equity means balance becomes negative.
		// Correct.
		t.Errorf("Expected Acc2 balance -100, got %d", updatedAcc2.Balance)
	}
}

func TestPostTransaction_Unbalanced(t *testing.T) {
	db, err := connectDB()
	if err != nil {
		t.Skip("Skipping test: could not connect to database")
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		t.Skip("Skipping test: database not reachable")
	}

	service := NewService(db, nil)

	acc1, _ := service.CreateAccount("Acc 1", Asset, "USD", "CASH", "INDIVIDUAL", nil)
	acc2, _ := service.CreateAccount("Acc 2", Equity, "USD", "CASH", "INDIVIDUAL", nil)

	entries := []Entry{
		{AccountID: acc1.ID, Direction: Debit, Amount: 100},
		{AccountID: acc2.ID, Direction: Credit, Amount: 50}, // Unbalanced
	}

	_, err = service.PostTransaction("REF-BAD", "Bad Tx", entries)
	if err == nil {
		t.Error("Expected error for unbalanced transaction, got nil")
	}
}
