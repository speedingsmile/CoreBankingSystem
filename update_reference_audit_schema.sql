-- Reference Data Tables

CREATE TABLE IF NOT EXISTS currencies (
    code CHAR(3) PRIMARY KEY,
    numeric_code INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    decimals INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS countries (
    alpha2 CHAR(2) PRIMARY KEY,
    alpha3 CHAR(3) NOT NULL,
    name VARCHAR(100) NOT NULL,
    risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    phone_prefix VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    direction VARCHAR(3) DEFAULT 'LTR' CHECK (direction IN ('LTR', 'RTL'))
);

-- Audit Log Table

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    actor_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changes JSONB
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
∑
