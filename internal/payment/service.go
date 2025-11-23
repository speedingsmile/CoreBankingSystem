package payment

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/nathanmocogni/core-banking-system/internal/ledger"
)

type Service struct {
	ledger *ledger.Service
}

func NewService(l *ledger.Service) *Service {
	return &Service{ledger: l}
}

// Deposit simulates receiving money from an external source (e.g. Stripe)
// and crediting the user's account.
// It performs the following steps:
// 1. Simulates an external gateway call.
// 2. Gets or creates the settlement account (Asset).
// 3. Posts a transaction debiting the settlement account and crediting the user account.
func (s *Service) Deposit(accountID uuid.UUID, amount int64, currency string) (*ledger.Transaction, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}

	// 1. Simulate External Gateway Call
	if err := s.mockExternalGateway(); err != nil {
		return nil, fmt.Errorf("external gateway failed: %w", err)
	}

	// 2. Get/Create Settlement Account (Asset)
	// This represents the money held by the Payment Processor on our behalf.
	settlementID, err := s.ledger.GetOrCreateSystemAccount("Payment Gateway Settlement", ledger.Asset)
	if err != nil {
		return nil, fmt.Errorf("failed to get settlement account: %w", err)
	}

	// 3. Post Transaction
	// Debit: Settlement Account (Asset increases)
	// Credit: User Account (Liability increases)
	entries := []ledger.Entry{
		{AccountID: settlementID, Direction: ledger.Debit, Amount: amount},
		{AccountID: accountID, Direction: ledger.Credit, Amount: amount},
	}

	ref := fmt.Sprintf("DEP-%s", uuid.New().String())
	return s.ledger.PostTransaction(ref, "External Deposit", entries)
}

// Withdraw simulates sending money to an external bank account.
// It performs the following steps:
// 1. Gets or creates the settlement account.
// 2. Posts a transaction debiting the user account and crediting the settlement account.
// 3. Simulates an external gateway call.
func (s *Service) Withdraw(accountID uuid.UUID, amount int64, currency string) (*ledger.Transaction, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}

	// 1. Check Balance (Optional, PostTransaction will fail if we enforce overdraft rules,
	// but currently we allow negative balances for Liabilities.
	// In a real app, we'd check available funds here).

	// 2. Get/Create Settlement Account
	settlementID, err := s.ledger.GetOrCreateSystemAccount("Payment Gateway Settlement", ledger.Asset)
	if err != nil {
		return nil, fmt.Errorf("failed to get settlement account: %w", err)
	}

	// 3. Post Transaction (Hold Funds / Execute)
	// Debit: User Account (Liability decreases)
	// Credit: Settlement Account (Asset decreases)
	entries := []ledger.Entry{
		{AccountID: accountID, Direction: ledger.Debit, Amount: amount},
		{AccountID: settlementID, Direction: ledger.Credit, Amount: amount},
	}

	ref := fmt.Sprintf("WD-%s", uuid.New().String())
	tx, err := s.ledger.PostTransaction(ref, "External Withdrawal", entries)
	if err != nil {
		return nil, fmt.Errorf("transaction failed: %w", err)
	}

	// 4. Simulate External Gateway Call
	// If this fails, we should technically reverse the transaction (Saga pattern),
	// but for this prototype we assume success or panic.
	if err := s.mockExternalGateway(); err != nil {
		// TODO: Reverse transaction
		return nil, fmt.Errorf("external gateway failed: %w", err)
	}

	return tx, nil
}

func (s *Service) mockExternalGateway() error {
	// Simulate network latency
	time.Sleep(200 * time.Millisecond)
	return nil
}

// Transfer moves funds between two internal accounts.
func (s *Service) Transfer(fromAccountID, toAccountID uuid.UUID, amount int64, currency string) (*ledger.Transaction, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be positive")
	}
	if fromAccountID == toAccountID {
		return nil, fmt.Errorf("cannot transfer to same account")
	}

	// Debit FromAccount, Credit ToAccount
	// Note: For Liability accounts (Customer accounts), Debit decreases balance (money leaving),
	// Credit increases balance (money arriving).
	// Wait, standard accounting:
	// Liability Credit = Increase (Deposit)
	// Liability Debit = Decrease (Withdrawal)
	// So:
	// FromAccount (Liability) -> Debit (Decrease)
	// ToAccount (Liability) -> Credit (Increase)

	entries := []ledger.Entry{
		{AccountID: fromAccountID, Direction: ledger.Debit, Amount: amount},
		{AccountID: toAccountID, Direction: ledger.Credit, Amount: amount},
	}

	ref := fmt.Sprintf("TRF-%s", uuid.New().String())
	return s.ledger.PostTransaction(ref, fmt.Sprintf("Transfer from %s to %s", fromAccountID, toAccountID), entries)
}
