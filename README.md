# Core Banking System

![Go](https://img.shields.io/badge/Go-1.23-00ADD8?style=flat&logo=go)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-Event%20Streaming-231F20?style=flat&logo=apachekafka)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker)

A robust, full-stack Core Banking System designed for scalability and performance. This project features a high-performance Go backend for ledger management and transaction processing, coupled with a modern, responsive React frontend.

## 🚀 Features

- **Double-Entry Ledger**: Immutable transaction recording with full audit trails.
- **Account Management**: Support for Asset, Liability, Equity, Income, and Expense accounts.
- **System Configuration**: Comprehensive Product Factory, Fee Engine, KYC Rules, and Role-Based Access Control.
- **Payments Engine**: Handle deposits, withdrawals, and internal transfers seamlessly.
- **Securities & Trading**: Integrated Security Master File and portfolio tracking.
- **Event-Driven**: Built on Apache Kafka for real-time event streaming and integration.
- **Modern Frontend**: A sleek dashboard built with React, TypeScript, and TailwindCSS.

## 📚 Documentation

For detailed information on architecture, API endpoints, and advanced configuration, please refer to the **[Full Documentation](DOCUMENTATION.md)**.

## 🛠️ Quick Start

The easiest way to run the system is using Docker Compose.

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+) (for local frontend development)

### Running the System

1. **Clone the repository**
   ```bash
   git clone https://github.com/nathanmocogni/core-banking-system.git
   cd core-banking-system
   ```

2. **Start Backend Services**
   This will start the Go Ledger Service, PostgreSQL, Kafka, and Zookeeper.
   ```bash
   docker-compose up --build
   ```

3. **Start the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Access the application at `http://localhost:5173`.

## 🏗️ Project Structure

- **`cmd/server`**: Entry point for the Go backend service.
- **`internal/`**: Core business logic (Ledger, Auth, Payments, Securities).
- **`frontend/`**: React application source code.
- **`k8s/`**: Kubernetes deployment manifests.
- **`db/`**: Database schemas and migrations.

## 🧪 Testing

Run the backend unit tests:
```bash
go test ./internal/...
```

Run the end-to-end feature scripts:
```bash
./test_ledger.sh
./test_payment.sh
```

## 📄 License

This project is licensed under the MIT License.
