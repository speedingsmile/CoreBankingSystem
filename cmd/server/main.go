package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("Core Banking System - Ledger Service")
	fmt.Println("Starting server on :8080...")

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
