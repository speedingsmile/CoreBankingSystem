package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"strings"

	"github.com/nathanmocogni/core-banking-system/internal/audit"
	"github.com/nathanmocogni/core-banking-system/internal/auth"
	"github.com/nathanmocogni/core-banking-system/internal/database"
	"github.com/nathanmocogni/core-banking-system/internal/events"
	"github.com/nathanmocogni/core-banking-system/internal/integration"
	"github.com/nathanmocogni/core-banking-system/internal/ledger"
	"github.com/nathanmocogni/core-banking-system/internal/payment"
)

func main() {
	fmt.Println("Core Banking System - Ledger Service")

	dbHost := os.Getenv("DB_HOST")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPortStr := os.Getenv("DB_PORT")
	if dbPortStr == "" {
		dbPortStr = "5432" // Default inside container
	}
	dbPort, _ := strconv.Atoi(dbPortStr)

	db, err := database.Connect(dbHost, dbUser, dbPassword, dbName, dbPort)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer db.Close()

	// Kafka Setup
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	var producer *events.Producer
	if kafkaBrokers != "" {
		brokers := strings.Split(kafkaBrokers, ",")
		producer = events.NewProducer(brokers, "ledger-transactions")
		defer producer.Close()
		fmt.Printf("Kafka Producer initialized for brokers: %v\n", brokers)
	} else {
		fmt.Println("Warning: KAFKA_BROKERS not set, events will not be published.")
	}

	// Audit Consumer Setup
	if kafkaBrokers != "" {
		brokers := strings.Split(kafkaBrokers, ",")
		auditConsumer := audit.NewAuditConsumer(brokers, "system.audits", "audit-worker-group", db)
		// Start consumer in a background goroutine
		go func() {
			fmt.Println("Starting Audit Consumer...")
			auditConsumer.Start(context.Background())
		}()
	}

	fmt.Println("Starting server on :8080...")

	service := ledger.NewService(db, producer)
	handler := NewHandler(service)
	paymentService := payment.NewService(service)
	paymentHandler := NewPaymentHandler(paymentService)

	// Security Service Setup
	marketData := integration.NewMockMarketDataProvider()
	securityRepo := ledger.NewPostgresSecurityRepository(db)
	securityService := ledger.NewSecurityService(securityRepo, marketData)
	securityHandler := NewSecurityHandler(securityService)

	// Client Service Setup
	clientRepo := ledger.NewPostgresClientRepository(db)
	clientService := ledger.NewClientService(clientRepo)
	clientHandler := NewClientHandler(clientService)

	// Public Endpoints
	http.HandleFunc("/login", handler.Login)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Protected Endpoints
	// We wrap the mux with CORS, but individual handlers need Auth.
	// Actually, standard http.ServeMux doesn't support middleware groups easily.
	// Let's wrap individual handlers.

	http.Handle("/accounts", auth.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handler.CreateAccount(w, r)
		} else if r.Method == http.MethodGet {
			if r.URL.Query().Get("id") != "" {
				handler.GetAccount(w, r)
			} else {
				handler.ListAccounts(w, r)
			}
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	http.Handle("/transactions", auth.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			handler.PostTransaction(w, r)
		} else if r.Method == http.MethodGet {
			handler.GetTransactions(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))
	http.Handle("/products", auth.Middleware(http.HandlerFunc(handler.CreateProduct)))
	http.Handle("/accounts/product", auth.Middleware(http.HandlerFunc(handler.AssignProduct)))
	http.Handle("/interest/calculate", auth.Middleware(http.HandlerFunc(handler.CalculateInterest)))

	http.Handle("/payments/deposit", auth.Middleware(http.HandlerFunc(paymentHandler.Deposit)))
	http.Handle("/payments/withdraw", auth.Middleware(http.HandlerFunc(paymentHandler.Withdraw)))
	http.Handle("/payments/transfer", auth.Middleware(http.HandlerFunc(paymentHandler.Transfer)))

	http.Handle("/securities", auth.Middleware(http.HandlerFunc(securityHandler.HandleSecurities)))
	http.Handle("/securities/sync", auth.Middleware(http.HandlerFunc(securityHandler.SyncPrice)))

	http.Handle("/clients", auth.Middleware(http.HandlerFunc(clientHandler.HandleClients)))

	if err := http.ListenAndServe(":8080", corsMiddleware(http.DefaultServeMux)); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// corsMiddleware adds CORS headers to the response.
// WARNING: This implementation allows all origins ("*") which is insecure for production.
// In a real environment, you must restrict this to trusted domains.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: Change "*" to your specific domain in production
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
