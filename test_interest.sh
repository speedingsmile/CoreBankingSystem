#!/bin/bash


# Ensure we are in the script's directory so relative paths work
cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Generate Token
TOKEN=$(go run cmd/token_gen/main.go)

echo "1. Creating Product (Gold Savings - 10% APY)..."
PROD_ID=$(curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Gold Savings", "interest_rate_bps": 1000}' | jq -r '.id')
echo "Product ID: $PROD_ID"

echo "2. Creating Account..."
ACC_ID=$(curl -s -X POST $BASE_URL/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "My Savings", "type": "LIABILITY", "currency": "USD"}' | jq -r '.id')
echo "Account ID: $ACC_ID"

echo "3. Assigning Product..."
curl -s -X POST $BASE_URL/accounts/product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"account_id\": \"$ACC_ID\", \"product_id\": \"$PROD_ID\"}"

echo "4. Depositing $1,000.00..."
curl -s -X POST $BASE_URL/payments/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"account_id\": \"$ACC_ID\", \"amount\": 100000, \"currency\": \"USD\"}" | jq .

echo "5. Triggering Interest Calculation..."
curl -s -X POST $BASE_URL/interest/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{}" | jq .

echo "6. Verifying Balance (Should be 100000 + 27 = 100027)..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/accounts?id=$ACC_ID" | jq .
