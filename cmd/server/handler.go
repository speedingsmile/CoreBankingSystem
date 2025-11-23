package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/nathanmocogni/core-banking-system/internal/auth"
	"github.com/nathanmocogni/core-banking-system/internal/ledger"
	"github.com/nathanmocogni/core-banking-system/internal/payment"
)

type Handler struct {
	service *ledger.Service
}

func NewHandler(service *ledger.Service) *Handler {
	return &Handler{service: service}
}

type CreateAccountRequest struct {
	Name            string             `json:"name"`
	Type            ledger.AccountType `json:"type"`
	Currency        string             `json:"currency"`
	AccountCategory string             `json:"account_category"`
	OwnershipType   string             `json:"ownership_type"`
	ClientID        string             `json:"client_id"`
}

func (h *Handler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var clientID *uuid.UUID
	if req.ClientID != "" {
		id, err := uuid.Parse(req.ClientID)
		if err != nil {
			http.Error(w, "Invalid Client ID", http.StatusBadRequest)
			return
		}
		clientID = &id
	}

	account, err := h.service.CreateAccount(req.Name, req.Type, req.Currency, req.AccountCategory, req.OwnershipType, clientID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(account)
}

func (h *Handler) GetAccount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path (simple approach for now)
	// Path: /accounts?id=...
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid UUID", http.StatusBadRequest)
		return
	}

	account, err := h.service.GetAccount(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if account == nil {
		http.Error(w, "Account not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(account)
}

func (h *Handler) ListAccounts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	accounts, err := h.service.ListAccounts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(accounts)
}

type PostTransactionRequest struct {
	Reference   string         `json:"reference"`
	Description string         `json:"description"`
	Entries     []ledger.Entry `json:"entries"`
}

func (h *Handler) PostTransaction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PostTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := h.service.PostTransaction(req.Reference, req.Description, req.Entries)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transaction)
}

type CreateProductRequest struct {
	Name            string `json:"name"`
	InterestRateBPS int64  `json:"interest_rate_bps"`
}

func (h *Handler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	product, err := h.service.CreateProduct(req.Name, req.InterestRateBPS)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

type AssignProductRequest struct {
	AccountID uuid.UUID `json:"account_id"`
	ProductID uuid.UUID `json:"product_id"`
}

func (h *Handler) AssignProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AssignProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := h.service.AssignProduct(req.AccountID, req.ProductID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "assigned"}`))
}

func (h *Handler) CalculateInterest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	transactions, err := h.service.CalculateInterest()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

// Payment Handler

type PaymentHandler struct {
	service *payment.Service
}

func NewPaymentHandler(s *payment.Service) *PaymentHandler {
	return &PaymentHandler{service: s}
}

type PaymentRequest struct {
	AccountID uuid.UUID `json:"account_id"`
	Amount    int64     `json:"amount"`
	Currency  string    `json:"currency"`
}

func (h *PaymentHandler) Deposit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tx, err := h.service.Deposit(req.AccountID, req.Amount, req.Currency)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tx)
}

func (h *PaymentHandler) Withdraw(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tx, err := h.service.Withdraw(req.AccountID, req.Amount, req.Currency)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tx)
}

type TransferRequest struct {
	FromAccountID uuid.UUID `json:"from_account_id"`
	ToAccountID   uuid.UUID `json:"to_account_id"`
	Amount        int64     `json:"amount"`
	Currency      string    `json:"currency"`
}

func (h *PaymentHandler) Transfer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req TransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tx, err := h.service.Transfer(req.FromAccountID, req.ToAccountID, req.Amount, req.Currency)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tx)
}

func (h *Handler) GetTransactions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse Account ID
	// Path: /accounts/{id}/transactions (but we are using query params for now: /transactions?account_id=...)
	// Let's stick to query params for simplicity in this prototype: /transactions?account_id=...
	accountIDStr := r.URL.Query().Get("account_id")
	if accountIDStr == "" {
		http.Error(w, "Missing account_id parameter", http.StatusBadRequest)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		http.Error(w, "Invalid account_id", http.StatusBadRequest)
		return
	}

	// Parse Limit & Offset
	limit := 10
	if l := r.URL.Query().Get("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			limit = val
		}
	}

	offset := 0
	if o := r.URL.Query().Get("offset"); o != "" {
		if val, err := strconv.Atoi(o); err == nil && val >= 0 {
			offset = val
		}
	}

	transactions, err := h.service.GetTransactions(accountID, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Mock authentication - accept any non-empty username/password
	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password required", http.StatusUnauthorized)
		return
	}

	token, err := auth.GenerateToken(req.Username)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(`{"token": "%s"}`, token)))
}
