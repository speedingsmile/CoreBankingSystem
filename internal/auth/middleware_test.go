package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGenerateToken(t *testing.T) {
	token, err := GenerateToken("testuser")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}
	if token == "" {
		t.Error("Expected non-empty token")
	}
}

func TestMiddleware(t *testing.T) {
	// Create a valid token
	token, err := GenerateToken("testuser")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
	}{
		{
			name:           "Valid Token",
			authHeader:     "Bearer " + token,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Missing Header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Format",
			authHeader:     "Basic " + token,
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "Invalid Token",
			authHeader:     "Bearer invalid-token",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}
			w := httptest.NewRecorder()

			handler := Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))

			handler.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}
