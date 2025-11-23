-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL, -- For mapping to external CRM
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- Individual, Corporate
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- Active, Suspended, Pending
    risk_rating VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- Low, Medium, High
    tax_domicile CHAR(2) NOT NULL, -- ISO Country Code
    classification VARCHAR(20) NOT NULL DEFAULT 'RETAIL', -- Retail, Professional, Institutional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table Updates (Enhancing existing table)
-- We need to check if columns exist before adding to avoid errors in re-runs, 
-- but for this script we'll assume we are adding to the base schema.
-- Since 'accounts' already exists, we will ALTER it.

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS account_category VARCHAR(20) DEFAULT 'CASH', -- Cash, Custody
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(20) DEFAULT 'INDIVIDUAL', -- Individual, Joint
ADD COLUMN IF NOT EXISTS fee_schedule_id VARCHAR(50); -- Placeholder for Fee Schedule link

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_external_id ON clients(external_id);
CREATE INDEX IF NOT EXISTS idx_accounts_client_id ON accounts(client_id);
