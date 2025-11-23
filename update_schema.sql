-- Securities Table
CREATE TABLE IF NOT EXISTS securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'STOCK', 'BOND', 'ETF'
    currency CHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security Prices Table
CREATE TABLE IF NOT EXISTS security_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    security_id UUID NOT NULL REFERENCES securities(id),
    price DECIMAL(19, 4) NOT NULL,
    currency CHAR(3) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) NOT NULL -- e.g., 'MOCK', 'YAHOO'
);

CREATE INDEX IF NOT EXISTS idx_security_prices_security_id ON security_prices(security_id);
CREATE INDEX IF NOT EXISTS idx_security_prices_timestamp ON security_prices(timestamp);
