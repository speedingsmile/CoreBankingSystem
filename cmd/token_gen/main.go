package main

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/nathanmocogni/core-banking-system/internal/auth"
)

func main() {
	// Create a new token object, specifying signing method and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  "test-user",
		"role": "admin",
		"exp":  time.Now().Add(time.Hour * 24).Unix(), // Expires in 24 hours
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString(auth.SecretKey)
	if err != nil {
		fmt.Println("Error generating token:", err)
		return
	}

	fmt.Println(tokenString)
}
