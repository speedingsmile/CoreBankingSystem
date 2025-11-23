# Core Banking System Documentation

## Project Overview
The Core Banking System is a robust, full-stack application designed to handle essential banking operations. It features a high-performance Go backend for ledger management and transaction processing, coupled with a modern, responsive React frontend for user interaction. The system is containerized using Docker and supports event-driven architecture via Kafka.

## Technical Stack

### Backend
- **Language**: Go (v1.23)
- **Database**: PostgreSQL (v15)
- **Messaging**: Apache Kafka (with Zookeeper)
- **Authentication**: JWT (JSON Web Tokens)
- **Dependencies**:
  - `github.com/lib/pq`: PostgreSQL driver
  - `github.com/segmentio/kafka-go`: Kafka client
  - `github.com/golang-jwt/jwt/v5`: JWT handling
  - `github.com/google/uuid`: UUID generation

### Frontend
- **Framework**: React (v19)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router DOM

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (manifests in `k8s/`)
- **CI/CD**: GitHub Actions (workflows in `.github/`)

## Features

### 1. Account Management
- **Create Accounts**: Support for various account types (Asset, Liability, Equity, Income, Expense).
- **Interest Calculation**: Automated interest calculation for accounts.
- **Client Management**: Manage client profiles and link them to accounts.

### 2. System Configuration & Product Factory
A comprehensive module for defining the banking system's behavior:
- **Product Factory**:
  - **Chart of Accounts (COA)**: Define the General Ledger hierarchy.
  - **Event Mapping**: Map business events (e.g., Deposit, Withdrawal) to specific Debit/Credit GL accounts.
  - **Fee Engine**: Configure flat or percentage-based fees and attach them to products with waiver logic.
- **Client Administration**:
  - **KYC Framework**: Define customer types (Retail, Corporate) and mandatory documentation rules.
  - **Data Constraints**: Enforce specific data fields based on customer type.
- **Securities Configuration**:
  - **Asset Classes**: Define asset types (Equity, Bond, ETF) and settlement cycles.
  - **Market Setup**: Configure trading markets (MIC, Currency, Timezone).
  - **Valuation Logic**: Set rules for asset valuation (e.g., Last Traded Price, Mid Price).
- **Security & Access Control**:
  - **RBAC**: Role-Based Access Control with granular permission registry.
  - **Approval Limits**: Set transaction limits per role and currency.
  - **User Management**: Onboard staff and assign roles.

### 3. Transaction Processing
- **Core Transactions**: Double-entry ledger recording.
- **Payments**:
  - **Deposit**: Add funds to an account.
  - **Withdraw**: Remove funds from an account.
  - **Transfer**: Move funds between internal accounts.
- **Transaction History**: View detailed transaction logs for auditing.

### 4. Securities & Trading
- **Security Master File**: Manage a list of tradable securities.
- **Market Data Integration**: Sync real-time (mocked) market prices.
- **Portfolio Management**: Track security holdings (integrated with ledger).

### 5. Security & Operations
- **Authentication**: Secure login with JWT issuance and validation.
- **Role-Based Access**: Protected API endpoints.
- **Event Streaming**: Publishes transaction events to Kafka for downstream processing.

## Project Structure

```
.
├── cmd/
│   └── server/          # Entry point for the Go backend
├── frontend/            # React application source code
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages (Dashboard, Accounts, etc.)
│   │   └── ...
├── internal/            # Private application code
│   ├── auth/            # Authentication logic
│   ├── database/        # Database connection and helpers
│   ├── events/          # Kafka producer/consumer logic
│   ├── integration/     # External service integrations (e.g., Market Data)
│   ├── ledger/          # Core banking logic (Accounts, Transactions, Securities)
│   └── payment/         # Payment processing logic
├── k8s/                 # Kubernetes deployment manifests
├── db/                  # Database schema and migration scripts
├── docker-compose.yml   # Local development environment setup
└── go.mod               # Go module definition
```

## API Endpoints

### Public
- `POST /login`: Authenticate and receive a JWT.
- `GET /health`: Health check endpoint.

### Protected (Requires Bearer Token)
- **Accounts**
  - `GET /accounts`: List all accounts.
  - `POST /accounts`: Create a new account.
  - `GET /accounts?id={id}`: Get account details.
  - `POST /products`: Create a new product.
  - `POST /accounts/product`: Assign a product to an account.
  - `POST /interest/calculate`: Trigger interest calculation.

- **Transactions & Payments**
  - `GET /transactions`: Get transaction history.
  - `POST /transactions`: Post a raw ledger transaction.
  - `POST /payments/deposit`: Perform a deposit.
  - `POST /payments/withdraw`: Perform a withdrawal.
  - `POST /payments/transfer`: Perform a transfer.

- **Securities**
  - `GET /securities`: List securities.
  - `POST /securities`: Create a security.
  - `POST /securities/sync`: Sync market prices.

- **Clients**
  - `GET /clients`: List clients.
  - `POST /clients`: Create a client.

## Setup & Running

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Go (v1.23+) (optional, for local backend dev)

### Running with Docker (Recommended)
1. **Start Backend & Database**:
   ```bash
   docker-compose up --build
   ```
   This starts Postgres, Kafka, Zookeeper, and the Ledger Service (Backend).

2. **Start Frontend**:
   Open a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

### Running Tests
- **Backend Unit Tests**: `go test ./internal/...`
- **Feature Scripts**: Run `./test_ledger.sh`, `./test_payment.sh`, etc., to verify specific functionalities.
