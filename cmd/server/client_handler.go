package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/nathanmocogni/core-banking-system/internal/ledger"
)

type ClientHandler struct {
	Service *ledger.ClientService
}

func NewClientHandler(service *ledger.ClientService) *ClientHandler {
	return &ClientHandler{Service: service}
}

func (h *ClientHandler) CreateClient(w http.ResponseWriter, r *http.Request) {
	var req ledger.Client
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	client, err := h.Service.CreateClient(r.Context(), &req)
	if err != nil {
		http.Error(w, "Failed to create client: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(client)
}

func (h *ClientHandler) ListClients(w http.ResponseWriter, r *http.Request) {
	clients, err := h.Service.Repo.ListClients(r.Context())
	if err != nil {
		http.Error(w, "Failed to list clients: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clients)
}

func (h *ClientHandler) GetClient(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Client ID is required", http.StatusBadRequest)
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid Client ID", http.StatusBadRequest)
		return
	}

	client, err := h.Service.Repo.GetClient(r.Context(), id)
	if err != nil {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(client)
}

func (h *ClientHandler) HandleClients(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		h.CreateClient(w, r)
	} else if r.Method == http.MethodGet {
		if r.URL.Query().Get("id") != "" {
			h.GetClient(w, r)
		} else {
			h.ListClients(w, r)
		}
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
