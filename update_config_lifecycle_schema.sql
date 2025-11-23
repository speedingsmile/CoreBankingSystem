-- Add status and version columns to fees table
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL, -- FLAT, PERCENTAGE
    value DECIMAL(15, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- REALTIME, PERIODIC
    gl_account_id UUID, -- Link to income GL
    status VARCHAR(20) DEFAULT 'DRAFT',
    version INT DEFAULT 1,
    parent_fee_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add status and version columns to rules table (if it exists, or create it)
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_json JSONB NOT NULL, -- e.g. {"field": "balance", "operator": ">", "value": 1000}
    action_json JSONB NOT NULL, -- e.g. {"type": "waive_fee", "fee_id": "..."}
    status VARCHAR(20) DEFAULT 'DRAFT',
    version INT DEFAULT 1,
    parent_rule_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add status and version columns to reference data tables
ALTER TABLE currencies ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE'; -- Reference data usually starts active
ALTER TABLE countries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE languages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
