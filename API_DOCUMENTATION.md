# Core Banking System API Documentation

This document provides a comprehensive reference for the Core Banking System's REST API.

## Base URL
`http://localhost:8080`

## Authentication

All protected endpoints require a Bearer Token in the `Authorization` header.

### Login
**POST** `/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Accounts

### Create Account
**POST** `/accounts`

Creates a new ledger account.

**Request Body:**
```json
{
  "name": "John Doe Savings",
  "type": "LIABILITY",
  "currency": "USD",
  "account_category": "Retail",
  "ownership_type": "Individual",
  "client_id": "uuid-string"
}
```
*   `type`: `ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, `EXPENSE`

**Response:**
```json
{
  "id": "uuid-string",
  "name": "John Doe Savings",
  "type": "LIABILITY",
  "currency": "USD",
  "balance": 0,
  "created_at": "2023-10-27T10:00:00Z"
}
```

### List Accounts
**GET** `/accounts`

Returns a list of all accounts.

**Response:**
```json
[
  {
    "id": "uuid-string",
    "name": "John Doe Savings",
    "type": "LIABILITY",
    "currency": "USD",
    "balance": 1000,
    "created_at": "..."
  }
]
```

### Get Account Details
**GET** `/accounts?id={account_id}`

Returns details for a specific account.

**Response:**
Same as Create Account response.

---

## Transactions

### Post Transaction (Manual Ledger Entry)
**POST** `/transactions`

Records a double-entry transaction. Debits must equal Credits.

**Request Body:**
```json
{
  "reference": "REF-001",
  "description": "Opening Balance",
  "entries": [
    {
      "account_id": "uuid-debit-account",
      "direction": "DEBIT",
      "amount": 1000
    },
    {
      "account_id": "uuid-credit-account",
      "direction": "CREDIT",
      "amount": 1000
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid-transaction",
  "reference": "REF-001",
  "posted_at": "..."
}
```

### Get Transaction History
**GET** `/transactions?account_id={account_id}&limit=10&offset=0`

Returns transaction history for a specific account.

**Response:**
```json
[
  {
    "id": "uuid-transaction",
    "reference": "REF-001",
    "description": "Opening Balance",
    "posted_at": "...",
    "entries": [...]
  }
]
```

---

## Payments (Simplified Operations)

### Deposit
**POST** `/payments/deposit`

Adds funds to an account (Debit Cash/Bank Asset, Credit User Liability).

**Request Body:**
```json
{
  "account_id": "uuid-account",
  "amount": 5000,
  "currency": "USD"
}
```

### Withdraw
**POST** `/payments/withdraw`

Removes funds from an account (Debit User Liability, Credit Cash/Bank Asset).

**Request Body:**
```json
{
  "account_id": "uuid-account",
  "amount": 2000,
  "currency": "USD"
}
```

### Transfer
**POST** `/payments/transfer`

Moves funds between two accounts.

**Request Body:**
```json
{
  "from_account_id": "uuid-source",
  "to_account_id": "uuid-dest",
  "amount": 1000,
  "currency": "USD"
}
```

---

## Products & Interest

### Create Product
**POST** `/products`

Defines a financial product with an interest rate.

**Request Body:**
```json
{
  "name": "High Yield Savings",
  "interest_rate_bps": 500
}
```
*   `interest_rate_bps`: Basis points (500 = 5.00%)

### Assign Product
**POST** `/accounts/product`

Links an account to a product.

**Request Body:**
```json
{
  "account_id": "uuid-account",
  "product_id": "uuid-product"
}
```

### Calculate Interest
**POST** `/interest/calculate`

Triggers the daily interest accrual process for all eligible accounts.

**Response:**
Returns a list of generated interest transactions.

---

## Securities

### Create Security
**POST** `/securities`

Adds a new tradable security to the master file.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "asset_class": "Equity",
  "exchange": "NASDAQ"
}
```

### List Securities
**GET** `/securities`

Returns all configured securities.

### Get Security Details
**GET** `/securities?symbol={symbol}`

Returns security details and the latest market price.

### Sync Price
**POST** `/securities/sync`

Manually triggers a price update from the market data provider.

**Request Body:**
```json
{
  "symbol": "AAPL"
}
```

---

## Clients

### Create Client
**POST** `/clients`

Onboards a new client.

**Request Body:**
```json
{
  "external_id": "EXT-123",
  "name": "Acme Corp",
  "type": "Corporate",
  "status": "Active",
  "risk_rating": "Low",
  "tax_domicile": "US",
  "classification": "Retail"
}
```

### List Clients
**GET** `/clients`

Returns all clients.

### Get Client Details
**GET** `/clients?id={id}`

Returns details for a specific client.
