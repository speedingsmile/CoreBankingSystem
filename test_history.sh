#!/bin/bash


# Ensure we are in the script's directory so relative paths work
cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Generate Token
TOKEN=$(go run cmd/token_gen/main.go)

echo "1. Creating Account..."
ACC_ID=$(curl -s -X POST $BASE_URL/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "History Test", "type": "ASSET", "currency": "USD"}' | jq -r '.id')
echo "Account ID: $ACC_ID"

echo "2. Creating Counterparty Account..."
ACC2_ID=$(curl -s -X POST $BASE_URL/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Counterparty", "type": "EQUITY", "currency": "USD"}' | jq -r '.id')

echo "3. Posting Transaction 1..."
REF1="REF-$(date +%s)-1"
curl -s -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"reference\": \"$REF1\",
    \"description\": \"Tx 1\",
    \"entries\": [
        {\"account_id\": \"$ACC_ID\", \"direction\": \"DEBIT\", \"amount\": 100},
        {\"account_id\": \"$ACC2_ID\", \"direction\": \"CREDIT\", \"amount\": 100}
    ]
}" | jq -r '.id'

echo "4. Posting Transaction 2..."
REF2="REF-$(date +%s)-2"
curl -s -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"reference\": \"$REF2\",
    \"description\": \"Tx 2\",
    \"entries\": [
        {\"account_id\": \"$ACC_ID\", \"direction\": \"DEBIT\", \"amount\": 200},
        {\"account_id\": \"$ACC2_ID\", \"direction\": \"CREDIT\", \"amount\": 200}
    ]
}" | jq -r '.id'

echo "5. Fetching Transaction History..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/transactions?account_id=$ACC_ID" | jq .
