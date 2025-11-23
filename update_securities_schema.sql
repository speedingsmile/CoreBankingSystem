-- Enhanced Securities Table
ALTER TABLE securities
ADD COLUMN isin VARCHAR(12),
ADD COLUMN cusip VARCHAR(9),
ADD COLUMN sedol VARCHAR(7),
ADD COLUMN bloom_reuters_code VARCHAR(50),
ADD COLUMN asset_class VARCHAR(50), -- Equity, Fixed Income, etc.
ADD COLUMN country_of_issue CHAR(2), -- ISO Country Code
ADD COLUMN quotational_basis VARCHAR(20), -- Per Unit, Percentage of Par
ADD COLUMN coupon_rate DECIMAL(10, 6),
ADD COLUMN coupon_type VARCHAR(20), -- Fixed, Floating, Zero
ADD COLUMN frequency VARCHAR(20), -- Annual, Semi-Annual
ADD COLUMN day_count_convention VARCHAR(20), -- 30/360, Actual/360
ADD COLUMN issue_date DATE,
ADD COLUMN maturity_date DATE,
ADD COLUMN primary_exchange VARCHAR(50),
ADD COLUMN trading_lot_size INTEGER,
ADD COLUMN price_source VARCHAR(50);

-- Indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_securities_isin ON securities(isin);
CREATE INDEX IF NOT EXISTS idx_securities_asset_class ON securities(asset_class);
