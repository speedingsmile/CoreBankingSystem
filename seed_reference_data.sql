-- Seed Currencies
INSERT INTO currencies (code, numeric_code, name, decimals, is_active) VALUES
('USD', 840, 'United States Dollar', 2, TRUE),
('EUR', 978, 'Euro', 2, TRUE),
('GBP', 826, 'Pound Sterling', 2, TRUE),
('CHF', 756, 'Swiss Franc', 2, TRUE),
('JPY', 392, 'Japanese Yen', 0, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed Countries
INSERT INTO countries (alpha2, alpha3, name, risk_score, phone_prefix) VALUES
('US', 'USA', 'United States', 10, '+1'),
('GB', 'GBR', 'United Kingdom', 10, '+44'),
('CH', 'CHE', 'Switzerland', 5, '+41'),
('DE', 'DEU', 'Germany', 10, '+49'),
('FR', 'FRA', 'France', 10, '+33')
ON CONFLICT (alpha2) DO NOTHING;
