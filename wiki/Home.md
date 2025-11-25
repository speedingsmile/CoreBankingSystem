# Welcome to the Core Banking System Wiki

## Project Overview
The **Core Banking System** is a robust, full-stack application designed to handle essential banking operations with high performance and scalability. It features a **Go** backend for ledger management and transaction processing, coupled with a modern, responsive **React** frontend.

## Key Features
- **Double-Entry Ledger**: Immutable transaction recording with full audit trails.
- **Account Management**: Support for Asset, Liability, Equity, Income, and Expense accounts.
- **Product Factory**: Flexible configuration for banking products, fees, and interest rules.
- **Rules Engine**: A dynamic configuration store for defining business logic and decision trees.
- **Workflow Engine**: Configurable approval workflows for high-value transactions.
- **Payments Engine**: Handle deposits, withdrawals, and internal transfers seamlessly.
- **Securities & Trading**: Integrated Security Master File and portfolio tracking.
- **Event-Driven Architecture**: Built on Apache Kafka for real-time event streaming.

## Architecture
The system follows a microservices-ready architecture:
- **Backend**: Go (v1.23) with PostgreSQL (v15) and Apache Kafka.
- **Frontend**: React (v19) with TypeScript and TailwindCSS.
- **Infrastructure**: Docker Compose for local dev, Kubernetes for deployment.

## Quick Links
- [Rules Engine Documentation](Rules-Engine)
- [API Documentation](../DOCUMENTATION.md)
- [GitHub Repository](https://github.com/nathanmocogni/core-banking-system)
