#!/bin/bash


# Ensure we are in the script's directory so relative paths work
cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Generate Token
TOKEN=$(go run cmd/token_gen/main.go)

echo "1. Creating User Account..."
USER_ACC=$(curl -s -X POST $BASE_URL/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Alice Payment", "type": "LIABILITY", "currency": "USD"}' | jq -r '.id')
echo "User Account ID: $USER_ACC"

echo "2. Depositing $50.00 (External Payment)..."
curl -s -X POST $BASE_URL/payments/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"account_id\": \"$USER_ACC\", \"amount\": 5000, \"currency\": \"USD\"}" | jq .

echo "3. Verifying User Balance (Should be 5000)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/accounts?id=$USER_ACC" | jq .

echo "4. Withdrawing $20.00 (External Payment)..."
curl -s -X POST $BASE_URL/payments/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"account_id\": \"$USER_ACC\", \"amount\": 2000, \"currency\": \"USD\"}" | jq .

echo "5. Verifying User Balance (Should be 3000)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/accounts?id=$USER_ACC" | jq .
