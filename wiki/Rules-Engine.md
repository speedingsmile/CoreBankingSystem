# Rules Engine

## Overview
The **Rules Engine** is a core component of the Core Banking System designed to externalize business logic from the application code. It acts as a centralized configuration store where business rules can be defined, versioned, and managed dynamically without redeploying the backend services.

## Core Concepts

### Rule Definition
A Rule consists of four main components:
1.  **Name**: A unique identifier for the rule (e.g., "High Value Transfer Check").
2.  **Description**: A human-readable explanation of what the rule does.
3.  **Condition**: A JSON-based logic expression that determines *when* the rule applies.
4.  **Action**: A JSON-based definition of *what* happens when the condition is met.

### Versioning
Rules are versioned to ensure auditability and safe rollbacks.
-   **DRAFT**: New rules start here. They can be edited freely but are not used in production logic.
-   **ACTIVE**: The version currently in use. Active rules are immutable regarding their core logic (Condition/Action) to prevent runtime inconsistencies.
-   **ARCHIVED**: Old versions that are no longer in use but kept for historical records.

To update an Active rule, a new Draft version is created (cloned), modified, and then promoted to Active.

## Integration with Workflow Engine
Currently, the primary consumer of the Rules Engine is the **Workflow Engine**.
-   **Workflow Steps** can reference a Rule to determine if a specific approval step is required.
-   **Example**: A "Manager Approval" step might have a Logic Rule `amount > 10000`. The Workflow Engine evaluates this rule against the transaction payload. If true, the step is activated.

## Data Structure
Rules are stored in the `rules` table in PostgreSQL.

### Condition JSON Example
```json
{
  "variable": "amount",
  "operator": ">",
  "value": 10000
}
```

### Action JSON Example
```json
{
  "type": "REQUIRE_APPROVAL",
  "role": "MANAGER"
}
```

## Future Use Cases
The Rules Engine is designed to be extensible for various banking scenarios:
-   **Fee Waivers**: "If Account Balance > $50,000, waive monthly maintenance fee."
-   **Fraud Detection**: "If 3 transactions occur within 1 minute, flag account."
-   **Dynamic Pricing**: "If Customer Segment is 'VIP', apply 0.5% bonus interest rate."
