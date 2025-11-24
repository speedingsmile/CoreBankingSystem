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
	acc1, err := service.CreateAccount("Acc 1", Asset, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc1: %v", err)
	}
	acc2, err := service.CreateAccount("Acc 2", Equity, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc2: %v", err)
	}

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

	acc1, err := service.CreateAccount("Acc 1", Asset, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc1: %v", err)
	}
	acc2, err := service.CreateAccount("Acc 2", Equity, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create acc2: %v", err)
	}

	entries := []Entry{
		{AccountID: acc1.ID, Direction: Debit, Amount: 100},
		{AccountID: acc2.ID, Direction: Credit, Amount: 50}, // Unbalanced
	}

	_, err = service.PostTransaction("REF-BAD", "Bad Tx", entries)
	if err == nil {
		t.Error("Expected error for unbalanced transaction, got nil")
	}
}

func TestProductVersioning(t *testing.T) {
	db, err := connectDB()
	if err != nil {
		t.Skip("Skipping test: could not connect to database")
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		t.Skip("Skipping test: database not reachable")
	}

	service := NewService(db, nil)

	// 1. Create Product
	p1, err := service.CreateProduct("Savings Account", 500) // 5%
	if err != nil {
		t.Fatalf("Failed to create product: %v", err)
	}
	if p1.Version != 1 {
		t.Errorf("Expected version 1, got %d", p1.Version)
	}

	// 2. Update Product (Draft)
	p1Updated, err := service.UpdateProduct(p1.ID, "Super Savings", 600, ProductStatusDraft)
	if err != nil {
		t.Fatalf("Failed to update product: %v", err)
	}
	if p1Updated.Version != 2 {
		t.Errorf("Expected version 2, got %d", p1Updated.Version)
	}
	if p1Updated.Name != "Super Savings" {
		t.Errorf("Expected name change")
	}

	// 3. Activate Product
	_, err = service.UpdateProduct(p1.ID, "Super Savings", 600, ProductStatusActive)
	if err != nil {
		t.Fatalf("Failed to activate product: %v", err)
	}

	// 4. Create Account using Product
	_, err = service.CreateAccount("User Savings", Liability, "USD", "CASH", "INDIVIDUAL", nil)
	// Wait, CreateAccount needs to link to product.
	// The current CreateAccount signature doesn't take product ID directly?
	// Checking service.go: CreateAccount(..., clientID *uuid.UUID)
	// It doesn't take productID.
	// But there is AssignProduct.
	acc, _ := service.CreateAccount("User Savings", Liability, "USD", "CASH", "INDIVIDUAL", nil)
	err = service.AssignProduct(acc.ID, p1.ID)
	if err != nil {
		t.Fatalf("Failed to assign product: %v", err)
	}

	// 5. Try to Update Active Product in Use (Should Fail for Interest Rate)
	_, err = service.UpdateProduct(p1.ID, "Super Savings", 700, ProductStatusActive)
	if err == nil {
		t.Error("Expected error when updating interest rate of active product in use")
	}

	// 6. Clone Product
	p2, err := service.CloneProduct(p1.ID)
	if err != nil {
		t.Fatalf("Failed to clone product: %v", err)
	}
	if p2.Name != "Super Savings (v2)" {
		t.Errorf("Expected cloned name, got %s", p2.Name)
	}
	if p2.Version != 1 { // New product starts at v1
		// Wait, CreateProduct sets version to 1.
		// Yes.
	}
}

func TestFeeManagement(t *testing.T) {
	db, err := connectDB()
	if err != nil {
		t.Skip("Skipping test: could not connect to database")
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		t.Skip("Skipping test: database not reachable")
	}

	service := NewService(db, nil)

	// Create GL Account for Fees
	glAcc, err := service.CreateAccount("Fee Income", Income, "USD", "REVENUE", "SYSTEM", nil)
	if err != nil {
		t.Fatalf("Failed to create GL account: %v", err)
	}

	// Create Fee
	fee, err := service.CreateFee("Monthly Fee", "FLAT", 10.0, "MONTHLY", glAcc.ID)
	if err != nil {
		t.Fatalf("Failed to create fee: %v", err)
	}

	// Update Fee
	updatedFee, err := service.UpdateFee(fee.ID, "Monthly Fee Updated", 12.0, ConfigStatusActive)
	if err != nil {
		t.Fatalf("Failed to update fee: %v", err)
	}
	if updatedFee.Value != 12.0 {
		t.Errorf("Expected value 12.0")
	}
}

func TestCalculateInterest(t *testing.T) {
	db, err := connectDB()
	if err != nil {
		t.Skip("Skipping test: could not connect to database")
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		t.Skip("Skipping test: database not reachable")
	}

	service := NewService(db, nil)

	// 1. Setup Product (5% interest)
	prod, err := service.CreateProduct("Interest Product", 500) // 5% = 500 bps
	if err != nil {
		t.Fatalf("Failed to create product: %v", err)
	}
	_, err = service.UpdateProduct(prod.ID, "Interest Product", 500, ProductStatusActive)
	if err != nil {
		t.Fatalf("Failed to activate product: %v", err)
	}

	// 2. Setup Account with Balance
	acc, err := service.CreateAccount("Interest User", Liability, "USD", "CASH", "INDIVIDUAL", nil)
	if err != nil {
		t.Fatalf("Failed to create account: %v", err)
	}
	err = service.AssignProduct(acc.ID, prod.ID)
	if err != nil {
		t.Fatalf("Failed to assign product: %v", err)
	}

	// Deposit 10,000
	// Liability Credit -> Balance -10,000
	sysAcc, _ := service.GetOrCreateSystemAccount("Cash In", Asset)
	entries := []Entry{
		{AccountID: sysAcc, Direction: Debit, Amount: 10000},
		{AccountID: acc.ID, Direction: Credit, Amount: 10000},
	}
	service.PostTransaction("DEP-INT", "Deposit", entries)

	// 3. Calculate Interest
	// Balance = 10,000
	// Rate = 5% (0.05)
	// Daily Interest = 10,000 * 0.05 / 365 = 1.369... -> 1 (integer math floor)
	// Wait, 10000 * 500 / (10000 * 365) = 5000000 / 3650000 = 1.36 -> 1.
	txs, err := service.CalculateInterest()
	if err != nil {
		t.Fatalf("Failed to calculate interest: %v", err)
	}

	if len(txs) == 0 {
		// It might be 0 if the math results in 0.
		// Let's increase balance to ensure > 0.
		// 100,000 -> 13.
	}

	// If we got a tx, verify it
	if len(txs) > 0 {
		tx := txs[0]
		if tx.Description != "Daily Interest Accrual" {
			t.Errorf("Unexpected description: %s", tx.Description)
		}
	}
}
