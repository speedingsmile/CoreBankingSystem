package ledger

import (
	"context"
	"database/sql"
	"fmt"

	"time"

	"github.com/google/uuid"
	"github.com/nathanmocogni/core-banking-system/internal/events"
)

type Service struct {
	db       *sql.DB
	producer *events.Producer
}

func NewService(db *sql.DB, producer *events.Producer) *Service {
	return &Service{
		db:       db,
		producer: producer,
	}
}

// CreateAccount creates a new account in the ledger.
func (s *Service) CreateAccount(name string, accType AccountType, currency string, category, ownership string, clientID *uuid.UUID) (*Account, error) {
	// Validate inputs
	if name == "" {
		return nil, fmt.Errorf("account name is required")
	}
	if len(currency) != 3 {
		return nil, fmt.Errorf("invalid currency code")
	}

	account := &Account{
		Name:            name,
		Type:            accType,
		Currency:        currency,
		AccountCategory: sql.NullString{String: category, Valid: category != ""},
		OwnershipType:   sql.NullString{String: ownership, Valid: ownership != ""},
	}
	if clientID != nil {
		account.ClientID = uuid.NullUUID{UUID: *clientID, Valid: true}
	}

	query := `
		INSERT INTO accounts (name, type, currency, account_category, ownership_type, client_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, balance, created_at
	`

	err := s.db.QueryRow(query, account.Name, account.Type, account.Currency, account.AccountCategory, account.OwnershipType, account.ClientID).Scan(
		&account.ID, &account.Balance, &account.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create account: %w", err)
	}

	return account, nil
}

// GetAccount retrieves an account by its ID.
func (s *Service) GetAccount(id uuid.UUID) (*Account, error) {
	query := `
		SELECT id, name, type, currency, balance, account_category, ownership_type, client_id, created_at
		FROM accounts
		WHERE id = $1
	`

	account := &Account{}
	err := s.db.QueryRow(query, id).Scan(
		&account.ID, &account.Name, &account.Type, &account.Currency, &account.Balance,
		&account.AccountCategory, &account.OwnershipType, &account.ClientID, &account.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil // Not found
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get account: %w", err)
	}

	return account, nil
}

// ListAccounts retrieves all accounts.
func (s *Service) ListAccounts() ([]*Account, error) {
	query := `
		SELECT id, name, type, currency, balance, account_category, ownership_type, client_id, created_at
		FROM accounts
		ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list accounts: %w", err)
	}
	defer rows.Close()

	var accounts []*Account
	for rows.Next() {
		var account Account
		if err := rows.Scan(
			&account.ID, &account.Name, &account.Type, &account.Currency, &account.Balance,
			&account.AccountCategory, &account.OwnershipType, &account.ClientID, &account.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan account: %w", err)
		}
		accounts = append(accounts, &account)
	}

	return accounts, nil
}

// PostTransaction records a new transaction in the ledger.
// It enforces double-entry accounting rules (Debits == Credits) and ACID properties.
func (s *Service) PostTransaction(reference string, description string, entries []Entry) (*Transaction, error) {
	// 1. Validate: Debits must equal Credits
	var totalDebit, totalCredit int64
	for _, entry := range entries {
		if entry.Amount <= 0 {
			return nil, fmt.Errorf("entry amount must be positive")
		}
		if entry.Direction == Debit {
			totalDebit += entry.Amount
		} else {
			totalCredit += entry.Amount
		}
	}

	if totalDebit != totalCredit {
		return nil, fmt.Errorf("transaction is not balanced: debits=%d, credits=%d", totalDebit, totalCredit)
	}

	// 2. Start Database Transaction (ACID)
	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback() // Rollback if not committed

	// 3. Insert Transaction Header
	transactionID := uuid.New()
	txQuery := `
		INSERT INTO transactions (id, reference, description)
		VALUES ($1, $2, $3)
		RETURNING posted_at
	`
	var postedAt time.Time
	err = tx.QueryRow(txQuery, transactionID, reference, description).Scan(&postedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to insert transaction: %w", err)
	}

	// 4. Insert Entries and Update Balances
	entryQuery := `
		INSERT INTO entries (transaction_id, account_id, direction, amount)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	for i := range entries {
		entries[i].TransactionID = transactionID
		err = tx.QueryRow(entryQuery, transactionID, entries[i].AccountID, entries[i].Direction, entries[i].Amount).Scan(
			&entries[i].ID, &entries[i].CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to insert entry: %w", err)
		}

		// Update Account Balance (Read Model)
		var amountChange int64
		if entries[i].Direction == Debit {
			amountChange = entries[i].Amount
		} else {
			amountChange = -entries[i].Amount
		}

		_, err = tx.Exec(`UPDATE accounts SET balance = balance + $1 WHERE id = $2`, amountChange, entries[i].AccountID)
		if err != nil {
			return nil, fmt.Errorf("failed to update account balance: %w", err)
		}
	}

	// 5. Commit
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// 6. Publish Event (Best Effort)
	// In a real system, use Outbox Pattern.
	if s.producer != nil {
		go func() {
			err := s.producer.Publish(context.Background(), transactionID.String(), map[string]interface{}{
				"event":          "TransactionPosted",
				"transaction_id": transactionID,
				"reference":      reference,
				"posted_at":      postedAt,
				"entries":        entries,
			})
			if err != nil {
				fmt.Printf("Failed to publish event: %v\n", err)
			}
		}()
	}

	return &Transaction{
		ID:          transactionID,
		Reference:   reference,
		Description: description,
		PostedAt:    postedAt,
		Entries:     entries,
	}, nil
}

func (s *Service) CreateProduct(name string, interestRateBPS int64) (*Product, error) {
	product := &Product{
		Name:            name,
		InterestRateBPS: interestRateBPS,
		Status:          ProductStatusDraft,
		Version:         1,
	}

	query := `
		INSERT INTO products (name, interest_rate_bps, status, version)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	err := s.db.QueryRow(query, product.Name, product.InterestRateBPS, product.Status, product.Version).Scan(&product.ID, &product.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}
	return product, nil
}

func (s *Service) UpdateProduct(id uuid.UUID, name string, interestRateBPS int64, status ProductStatus) (*Product, error) {
	// 1. Fetch current product state
	currentProduct := &Product{}
	err := s.db.QueryRow("SELECT id, name, interest_rate_bps, status, version FROM products WHERE id = $1", id).
		Scan(&currentProduct.ID, &currentProduct.Name, &currentProduct.InterestRateBPS, &currentProduct.Status, &currentProduct.Version)
	if err != nil {
		return nil, fmt.Errorf("product not found: %w", err)
	}

	// 2. Check Usage Count
	var usageCount int
	err = s.db.QueryRow("SELECT COUNT(*) FROM accounts WHERE product_id = $1", id).Scan(&usageCount)
	if err != nil {
		return nil, fmt.Errorf("failed to check product usage: %w", err)
	}

	// 3. Apply Rules
	if currentProduct.Status == ProductStatusActive && usageCount > 0 {
		// Scenario B: In Use - Block critical changes
		if interestRateBPS != currentProduct.InterestRateBPS {
			return nil, fmt.Errorf("cannot change interest rate of an active product in use. Create a new version instead")
		}
		// Allow name change or status change (e.g. to Archived)
	}

	// 4. Update
	query := `
		UPDATE products
		SET name = $1, interest_rate_bps = $2, status = $3, version = version + 1
		WHERE id = $4
		RETURNING version
	`
	err = s.db.QueryRow(query, name, interestRateBPS, status, id).Scan(&currentProduct.Version)
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	currentProduct.Name = name
	currentProduct.InterestRateBPS = interestRateBPS
	currentProduct.Status = status

	return currentProduct, nil
}

func (s *Service) CloneProduct(id uuid.UUID) (*Product, error) {
	// 1. Fetch original
	original := &Product{}
	err := s.db.QueryRow("SELECT name, interest_rate_bps FROM products WHERE id = $1", id).
		Scan(&original.Name, &original.InterestRateBPS)
	if err != nil {
		return nil, fmt.Errorf("original product not found: %w", err)
	}

	// 2. Create new version (Draft)
	newVersionName := fmt.Sprintf("%s (v2)", original.Name) // Simplified naming logic
	return s.CreateProduct(newVersionName, original.InterestRateBPS)
}

func (s *Service) ListProducts() ([]*Product, error) {
	query := `
		SELECT id, name, interest_rate_bps, status, version, parent_product_id, created_at
		FROM products
		ORDER BY name, version DESC
	`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list products: %w", err)
	}
	defer rows.Close()

	var products []*Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.InterestRateBPS, &p.Status, &p.Version, &p.ParentProductID, &p.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, &p)
	}
	return products, nil
}

// --- Fee Management ---

func (s *Service) CreateFee(name, method string, value float64, frequency string, glAccountID uuid.UUID) (*Fee, error) {
	fee := &Fee{
		Name:        name,
		Method:      method,
		Value:       value,
		Frequency:   frequency,
		GLAccountID: glAccountID,
		Status:      ConfigStatusDraft,
		Version:     1,
	}

	query := `
		INSERT INTO fees (name, method, value, frequency, gl_account_id, status, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at
	`
	err := s.db.QueryRow(query, fee.Name, fee.Method, fee.Value, fee.Frequency, fee.GLAccountID, fee.Status, fee.Version).
		Scan(&fee.ID, &fee.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create fee: %w", err)
	}
	return fee, nil
}

func (s *Service) UpdateFee(id uuid.UUID, name string, value float64, status ConfigStatus) (*Fee, error) {
	// 1. Fetch current state
	current := &Fee{}
	err := s.db.QueryRow("SELECT id, name, value, status, version FROM fees WHERE id = $1", id).
		Scan(&current.ID, &current.Name, &current.Value, &current.Status, &current.Version)
	if err != nil {
		return nil, fmt.Errorf("fee not found: %w", err)
	}

	// 2. Check Usage (Mocked for now, assuming usage check logic similar to products)
	// In real world, check if fee is attached to any active products or transactions
	usageCount := 0 // Placeholder

	// 3. Apply Rules
	if current.Status == ConfigStatusActive && usageCount > 0 {
		if value != current.Value {
			return nil, fmt.Errorf("cannot change value of an active fee in use. Create a new version instead")
		}
	}

	// 4. Update
	query := `
		UPDATE fees
		SET name = $1, value = $2, status = $3, version = version + 1
		WHERE id = $4
		RETURNING version
	`
	err = s.db.QueryRow(query, name, value, status, id).Scan(&current.Version)
	if err != nil {
		return nil, fmt.Errorf("failed to update fee: %w", err)
	}

	current.Name = name
	current.Value = value
	current.Status = status

	return current, nil
}

func (s *Service) CloneFee(id uuid.UUID) (*Fee, error) {
	original := &Fee{}
	err := s.db.QueryRow("SELECT name, method, value, frequency, gl_account_id FROM fees WHERE id = $1", id).
		Scan(&original.Name, &original.Method, &original.Value, &original.Frequency, &original.GLAccountID)
	if err != nil {
		return nil, fmt.Errorf("original fee not found: %w", err)
	}

	newVersionName := fmt.Sprintf("%s (v2)", original.Name)
	return s.CreateFee(newVersionName, original.Method, original.Value, original.Frequency, original.GLAccountID)
}

func (s *Service) ListFees() ([]*Fee, error) {
	query := `
		SELECT id, name, method, value, frequency, gl_account_id, status, version, created_at
		FROM fees
		ORDER BY name, version DESC
	`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list fees: %w", err)
	}
	defer rows.Close()

	var fees []*Fee
	for rows.Next() {
		var f Fee
		if err := rows.Scan(&f.ID, &f.Name, &f.Method, &f.Value, &f.Frequency, &f.GLAccountID, &f.Status, &f.Version, &f.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan fee: %w", err)
		}
		fees = append(fees, &f)
	}
	return fees, nil
}

func (s *Service) AssignProduct(accountID uuid.UUID, productID uuid.UUID) error {
	query := `UPDATE accounts SET product_id = $1 WHERE id = $2`
	_, err := s.db.Exec(query, productID, accountID)
	if err != nil {
		return fmt.Errorf("failed to assign product: %w", err)
	}
	return nil
}

// CalculateInterest iterates over all accounts with a product and accrues interest.
// It calculates daily interest based on the account balance and the product's interest rate.
// A transaction is posted for each eligible account, debiting the system expense account and crediting the user account.
func (s *Service) CalculateInterest() ([]*Transaction, error) {
	// 1. Fetch eligible accounts
	// Note: Liability accounts have negative balance. We calculate interest on the absolute amount.
	query := `
		SELECT a.id, a.balance, p.interest_rate_bps
		FROM accounts a
		JOIN products p ON a.product_id = p.id
		WHERE p.interest_rate_bps > 0 AND a.balance != 0
	`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch accounts for interest: %w", err)
	}
	defer rows.Close()

	var transactions []*Transaction

	// Get or create the system account for "Interest Expense".
	systemExpenseID, err := s.GetOrCreateSystemAccount("Bank Interest Expense", Expense)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var accountID uuid.UUID
		var balance int64
		var rateBPS int64
		if err := rows.Scan(&accountID, &balance, &rateBPS); err != nil {
			continue
		}

		// 2. Calculate Daily Interest
		// Use Absolute Balance to handle Liability accounts (negative balance) correctly.
		absBalance := balance
		if absBalance < 0 {
			absBalance = -absBalance
		}

		// Formula: Balance * (RateBPS / 10000) / 365
		// We use integer math: (Balance * RateBPS) / (10000 * 365)
		dailyInterest := (absBalance * rateBPS) / (10000 * 365)

		if dailyInterest <= 0 {
			continue
		}

		// 3. Post Transaction
		// Debit: Bank Interest Expense (Expense increases)
		// Credit: User Account (Liability increases, effectively paying interest to the user)
		entries := []Entry{
			{AccountID: systemExpenseID, Direction: Debit, Amount: dailyInterest},
			{AccountID: accountID, Direction: Credit, Amount: dailyInterest},
		}

		tx, err := s.PostTransaction(fmt.Sprintf("INT-%s-%d", accountID, time.Now().UnixNano()), "Daily Interest Accrual", entries)
		if err != nil {
			// Log error but continue processing other accounts
			fmt.Printf("Failed to post interest for account %s: %v\n", accountID, err)
			continue
		}
		transactions = append(transactions, tx)
	}

	return transactions, nil
}

func (s *Service) GetOrCreateSystemAccount(name string, accType AccountType) (uuid.UUID, error) {
	var id uuid.UUID
	err := s.db.QueryRow("SELECT id FROM accounts WHERE name = $1", name).Scan(&id)
	if err == sql.ErrNoRows {
		// Create it
		acc, err := s.CreateAccount(name, accType, "USD", "SYSTEM", "SYSTEM", nil)
		if err != nil {
			return uuid.Nil, err
		}
		return acc.ID, nil
	}
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

// GetTransactions retrieves the transaction history for a specific account.
func (s *Service) GetTransactions(accountID uuid.UUID, limit, offset int) ([]*Transaction, error) {
	// Query to fetch transactions where the account was involved in an entry.
	// We join with entries to filter by account_id, but we want the transaction details.
	// Note: This is a simplified query. In a real system, we might want to return the specific entry for this account
	// or the full transaction with all entries. Let's return the full transaction.
	query := `
		SELECT DISTINCT t.id, t.reference, t.description, t.posted_at
		FROM transactions t
		JOIN entries e ON t.id = e.transaction_id
		WHERE e.account_id = $1
		ORDER BY t.posted_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(query, accountID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	defer rows.Close()

	var transactions []*Transaction
	for rows.Next() {
		var t Transaction
		if err := rows.Scan(&t.ID, &t.Reference, &t.Description, &t.PostedAt); err != nil {
			return nil, fmt.Errorf("failed to scan transaction: %w", err)
		}
		transactions = append(transactions, &t)
	}

	// Fetch entries for each transaction (N+1 problem, but okay for prototype with small limit)
	// Optimization: Fetch all entries in one go using IN clause if needed.
	for _, t := range transactions {
		entryQuery := `SELECT id, account_id, direction, amount, created_at FROM entries WHERE transaction_id = $1`
		entryRows, err := s.db.Query(entryQuery, t.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch entries: %w", err)
		}
		defer entryRows.Close()

		for entryRows.Next() {
			var e Entry
			e.TransactionID = t.ID
			if err := entryRows.Scan(&e.ID, &e.AccountID, &e.Direction, &e.Amount, &e.CreatedAt); err != nil {
				return nil, fmt.Errorf("failed to scan entry: %w", err)
			}
			t.Entries = append(t.Entries, e)
		}
	}

	return transactions, nil
}
