# Core Banking System - Frontend

This is the frontend for the Core Banking System, built with React, TypeScript, Vite, and TailwindCSS.

## Features

- **Authentication**: Login using username (mock authentication).
- **Dashboard**: View all accounts, their types, currencies, and balances.
- **Account Management**: Create new accounts (Asset, Liability, Equity, Income, Expense).
- **Transactions**: Deposit and Withdraw funds from accounts.
- **Transfers**: Transfer funds between internal accounts.
- **History**: View transaction history for each account.

## Prerequisites

- Node.js (v18+)
- Go Backend running on `http://localhost:8080`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Usage

1. Ensure the Go backend is running (`go run cmd/server/main.go` or via Docker).
2. Open `http://localhost:5173` in your browser.
3. Login with any username (e.g., `admin`) and password.
4. Use the dashboard to manage accounts and transactions.
