package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/nathanmocogni/core-banking-system/internal/ledger"
)

type SecurityHandler struct {
	Service *ledger.SecurityService
}

func NewSecurityHandler(service *ledger.SecurityService) *SecurityHandler {
	return &SecurityHandler{Service: service}
}

func (h *SecurityHandler) CreateSecurity(w http.ResponseWriter, r *http.Request) {
	var req ledger.Security
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	sec, err := h.Service.CreateSecurity(r.Context(), &req)
	if err != nil {
		http.Error(w, "Failed to create security: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sec)
}

func (h *SecurityHandler) ListSecurities(w http.ResponseWriter, r *http.Request) {
	securities, err := h.Service.Repo.ListSecurities(r.Context())
	if err != nil {
		http.Error(w, "Failed to list securities: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(securities)
}

func (h *SecurityHandler) GetSecurity(w http.ResponseWriter, r *http.Request) {
	// Extract symbol from URL path or query.
	// Assuming /securities/{symbol} is not easily supported by http.ServeMux without parsing path manually
	// or using a query param /securities?symbol=AAPL
	// Let's support query param for simplicity with standard mux, or parse path if we use /securities/AAPL

	// If we use /securities?symbol=AAPL
	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		// Try to parse from path if we decide to use /securities/AAPL
		// But main.go uses http.Handle("/securities", ...)
		http.Error(w, "Symbol is required", http.StatusBadRequest)
		return
	}

	sec, err := h.Service.Repo.GetSecurity(r.Context(), symbol)
	if err != nil {
		http.Error(w, "Security not found", http.StatusNotFound)
		return
	}

	// Also fetch latest price
	price, _ := h.Service.Repo.GetLatestPrice(r.Context(), sec.ID)

	resp := struct {
		*ledger.Security
		LatestPrice *ledger.SecurityPrice `json:"latest_price,omitempty"`
	}{
		Security:    sec,
		LatestPrice: price,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *SecurityHandler) SyncPrice(w http.ResponseWriter, r *http.Request) {
	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		// Try path parsing if needed, but let's stick to query param for now or handle in main.go
		// Actually, for POST /securities/{symbol}/sync, we need path parsing.
		// Let's assume we pass symbol in body or query for simplicity unless we write a router.
		// Let's use body for POST.
		var req struct {
			Symbol string `json:"symbol"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err == nil && req.Symbol != "" {
			symbol = req.Symbol
		}
	}

	if symbol == "" {
		// Fallback to path parsing if we use /securities/sync?symbol=AAPL
		http.Error(w, "Symbol is required", http.StatusBadRequest)
		return
	}

	price, err := h.Service.SyncPrice(r.Context(), symbol)
	if err != nil {
		http.Error(w, "Failed to sync price: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(price)
}

// HandleSecurities dispatches based on method
func (h *SecurityHandler) HandleSecurities(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		if strings.Contains(r.URL.Path, "/sync") {
			h.SyncPrice(w, r)
			return
		}
		h.CreateSecurity(w, r)
	} else if r.Method == http.MethodGet {
		if r.URL.Query().Get("symbol") != "" {
			h.GetSecurity(w, r)
		} else {
			h.ListSecurities(w, r)
		}
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
