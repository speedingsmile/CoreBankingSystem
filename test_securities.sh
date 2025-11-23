#!/bin/bash

# Base URL
URL="http://localhost:8080"

# Function to check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Output will be raw JSON."
    JQ_CMD="cat"
else
    JQ_CMD="jq ."
fi

# 1. Login
echo "Logging in..."
LOGIN_RESP=$(curl -s -X POST $URL/login -d '{"username":"admin","password":"password"}')
TOKEN=$(echo $LOGIN_RESP | grep -o '"token": *"[^"]*"' | sed 's/"token": "//;s/"//')

if [ -z "$TOKEN" ]; then
    echo "Login failed: $LOGIN_RESP"
    exit 1
fi
echo "Token obtained."

# 2. Create Security
echo "Creating Security AAPL..."
curl -s -X POST $URL/securities \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"symbol":"AAPL","name":"Apple Inc.","type":"STOCK","currency":"USD"}' | $JQ_CMD

# 3. List Securities
echo "Listing Securities..."
curl -s -X GET $URL/securities \
  -H "Authorization: Bearer $TOKEN" | $JQ_CMD

# 4. Sync Price
echo "Syncing Price for AAPL..."
curl -s -X POST $URL/securities/sync \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"symbol":"AAPL"}' | $JQ_CMD

# 5. Get Security Details
echo "Getting Security Details for AAPL..."
curl -s -X GET "$URL/securities?symbol=AAPL" \
  -H "Authorization: Bearer $TOKEN" | $JQ_CMD
