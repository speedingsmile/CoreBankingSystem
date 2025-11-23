#!/bin/bash


# Ensure we are in the script's directory so relative paths work
cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-http://localhost:8080}"

# Generate Token
TOKEN=$(go run cmd/token_gen/main.go)
echo "Generated Token: $TOKEN"

echo "1. Creating Asset Account (Cash)..."
RESPONSE=$(curl -s -X POST $BASE_URL/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Bank Cash", "type": "ASSET", "currency": "USD"}')
echo "Response: $RESPONSE"
ACC1=$(echo $RESPONSE | jq -r '.id')
echo "Cash Account ID: $ACC1"

echo "2. Creating Equity Account (Owner's Capital)..."
EQUITY_ACC=$(curl -s -X POST $BASE_URL/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Owner Capital", "type": "EQUITY", "currency": "USD"}' | jq -r '.id')
echo "Equity Account ID: $EQUITY_ACC"

echo "3. Posting Transaction (Deposit $100)..."
# Debit Cash (Increase Asset), Credit Equity (Increase Equity)
REF="REF-$(date +%s)"
curl -s -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"reference\": \"$REF\",
    \"description\": \"Initial Capital Deposit\",
    \"entries\": [
        {\"account_id\": \"$ACC1\", \"direction\": \"DEBIT\", \"amount\": 10000},
        {\"account_id\": \"$EQUITY_ACC\", \"direction\": \"CREDIT\", \"amount\": 10000}
    ]
}" | jq .

echo "4. Verifying Balances..."
echo "Cash Account:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/accounts?id=$ACC1" | jq .
echo "Equity Account:"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/accounts?id=$EQUITY_ACC" | jq .
# Note: I haven't implemented GET /accounts/{id} in the handler yet! I only implemented CreateAccount and PostTransaction.
# I need to add GetAccount to the handler.
