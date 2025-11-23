package payment

import (
	"database/sql"
	"fmt"
	"os"
	"testing"

	_ "github.com/lib/pq"
	"github.com/nathanmocogni/core-banking-system/internal/ledger"
)

func connectDB(t *testing.T) *sql.DB {
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
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		t.Skipf("Skipping test: could not connect to database: %v", err)
	}
	if err := db.Ping(); err != nil {
		t.Skipf("Skipping test: database not reachable: %v", err)
	}
	return db
}

func TestDeposit(t *testing.T) {
	db := connectDB(t)
	defer db.Close()

	ledgerService := ledger.NewService(db, nil)
	paymentService := NewService(ledgerService)

	// Create a user account
	acc, err := ledgerService.CreateAccount("Test User Deposit", ledger.Liability, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create account: %v", err)
	}

	// Deposit
	amount := int64(1000)
	tx, err := paymentService.Deposit(acc.ID, amount, "USD")
	if err != nil {
		t.Fatalf("Failed to deposit: %v", err)
	}

	if tx == nil {
		t.Fatal("Expected transaction, got nil")
	}

	// Verify Balance
	updatedAcc, _ := ledgerService.GetAccount(acc.ID)
	// Liability account: Credit increases balance (money arriving)
	// Wait, in ledger logic:
	// Credit -> amountChange = -amount
	// So balance becomes -1000.
	// Let's check the logic in payment service:
	// Deposit -> Credit User Account.
	// If User Account is Liability, Credit means we owe them more money.
	// In standard accounting, Liability Credit is Increase.
	// But in our signed integer model, Credit is negative.
	// So balance should be -1000.
	if updatedAcc.Balance != -amount {
		t.Errorf("Expected balance %d, got %d", -amount, updatedAcc.Balance)
	}
}

func TestWithdraw(t *testing.T) {
	db := connectDB(t)
	defer db.Close()

	ledgerService := ledger.NewService(db, nil)
	paymentService := NewService(ledgerService)

	// Create a user account
	acc, err := ledgerService.CreateAccount("Test User Withdraw", ledger.Liability, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create account: %v", err)
	}

	// Initial Deposit to have funds
	_, err = paymentService.Deposit(acc.ID, 2000, "USD")
	if err != nil {
		t.Fatalf("Failed to deposit: %v", err)
	}

	// Withdraw
	amount := int64(500)
	tx, err := paymentService.Withdraw(acc.ID, amount, "USD")
	if err != nil {
		t.Fatalf("Failed to withdraw: %v", err)
	}

	if tx == nil {
		t.Fatal("Expected transaction, got nil")
	}

	// Verify Balance
	updatedAcc, _ := ledgerService.GetAccount(acc.ID)
	// Initial: -2000
	// Withdraw: Debit User Account (Liability decreases)
	// Debit -> amountChange = +amount
	// New Balance = -2000 + 500 = -1500
	expected := int64(-1500)
	if updatedAcc.Balance != expected {
		t.Errorf("Expected balance %d, got %d", expected, updatedAcc.Balance)
	}
}

func TestTransfer(t *testing.T) {
	db := connectDB(t)
	defer db.Close()

	ledgerService := ledger.NewService(db, nil)
	paymentService := NewService(ledgerService)

	// Create two accounts
	acc1, err := ledgerService.CreateAccount("User 1", ledger.Liability, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc1: %v", err)
	}
	acc2, err := ledgerService.CreateAccount("User 2", ledger.Liability, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc2: %v", err)
	}

	// Deposit to Acc1
	_, err = paymentService.Deposit(acc1.ID, 1000, "USD")
	if err != nil {
		t.Fatalf("Failed to deposit: %v", err)
	}

	// Transfer
	amount := int64(300)
	tx, err := paymentService.Transfer(acc1.ID, acc2.ID, amount, "USD")
	if err != nil {
		t.Fatalf("Failed to transfer: %v", err)
	}

	if tx == nil {
		t.Fatal("Expected transaction, got nil")
	}

	// Verify Balances
	uAcc1, _ := ledgerService.GetAccount(acc1.ID)
	uAcc2, _ := ledgerService.GetAccount(acc2.ID)

	// Acc1: -1000 + 300 (Debit) = -700
	if uAcc1.Balance != -700 {
		t.Errorf("Expected Acc1 balance -700, got %d", uAcc1.Balance)
	}

	// Acc2: 0 - 300 (Credit) = -300
	if uAcc2.Balance != -300 {
		t.Errorf("Expected Acc2 balance -300, got %d", uAcc2.Balance)
	}
}

func TestTransfer_SameAccount(t *testing.T) {
	db := connectDB(t)
	defer db.Close()

	ledgerService := ledger.NewService(db, nil)
	paymentService := NewService(ledgerService)

	acc1, err := ledgerService.CreateAccount("User Same", ledger.Liability, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc1: %v", err)
	}

	_, err = paymentService.Transfer(acc1.ID, acc1.ID, 100, "USD")
	if err == nil {
		t.Error("Expected error when transferring to same account")
	}
}
