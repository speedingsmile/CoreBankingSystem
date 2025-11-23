package ledger

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/nathanmocogni/core-banking-system/internal/integration"
)

type Security struct {
	ID                 uuid.UUID       `json:"id"`
	Symbol             string          `json:"symbol"`
	Name               string          `json:"name"`
	Type               string          `json:"type"`
	Currency           string          `json:"currency"`
	ISIN               sql.NullString  `json:"isin"`
	CUSIP              sql.NullString  `json:"cusip"`
	SEDOL              sql.NullString  `json:"sedol"`
	BloomReutersCode   sql.NullString  `json:"bloom_reuters_code"`
	AssetClass         sql.NullString  `json:"asset_class"`
	CountryOfIssue     sql.NullString  `json:"country_of_issue"`
	QuotationalBasis   sql.NullString  `json:"quotational_basis"`
	CouponRate         sql.NullFloat64 `json:"coupon_rate"`
	CouponType         sql.NullString  `json:"coupon_type"`
	Frequency          sql.NullString  `json:"frequency"`
	DayCountConvention sql.NullString  `json:"day_count_convention"`
	IssueDate          sql.NullTime    `json:"issue_date"`
	MaturityDate       sql.NullTime    `json:"maturity_date"`
	PrimaryExchange    sql.NullString  `json:"primary_exchange"`
	TradingLotSize     sql.NullInt64   `json:"trading_lot_size"`
	PriceSource        sql.NullString  `json:"price_source"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
}

type SecurityPrice struct {
	ID         uuid.UUID `json:"id"`
	SecurityID uuid.UUID `json:"security_id"`
	Price      float64   `json:"price"`
	Currency   string    `json:"currency"`
	Timestamp  time.Time `json:"timestamp"`
	Source     string    `json:"source"`
}

type SecurityRepository interface {
	CreateSecurity(ctx context.Context, sec *Security) error
	GetSecurity(ctx context.Context, symbol string) (*Security, error)
	ListSecurities(ctx context.Context) ([]Security, error)
	AddPrice(ctx context.Context, price *SecurityPrice) error
	GetLatestPrice(ctx context.Context, securityID uuid.UUID) (*SecurityPrice, error)
}

type PostgresSecurityRepository struct {
	DB *sql.DB
}

func NewPostgresSecurityRepository(db *sql.DB) *PostgresSecurityRepository {
	return &PostgresSecurityRepository{DB: db}
}

func (r *PostgresSecurityRepository) CreateSecurity(ctx context.Context, sec *Security) error {
	query := `
		INSERT INTO securities (
			symbol, name, type, currency, isin, cusip, sedol, bloom_reuters_code,
			asset_class, country_of_issue, quotational_basis, coupon_rate, coupon_type,
			frequency, day_count_convention, issue_date, maturity_date, primary_exchange,
			trading_lot_size, price_source
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13,
			$14, $15, $16, $17, $18,
			$19, $20
		)
		RETURNING id, created_at, updated_at
	`
	return r.DB.QueryRowContext(ctx, query,
		sec.Symbol, sec.Name, sec.Type, sec.Currency, sec.ISIN, sec.CUSIP, sec.SEDOL, sec.BloomReutersCode,
		sec.AssetClass, sec.CountryOfIssue, sec.QuotationalBasis, sec.CouponRate, sec.CouponType,
		sec.Frequency, sec.DayCountConvention, sec.IssueDate, sec.MaturityDate, sec.PrimaryExchange,
		sec.TradingLotSize, sec.PriceSource,
	).Scan(&sec.ID, &sec.CreatedAt, &sec.UpdatedAt)
}

func (r *PostgresSecurityRepository) GetSecurity(ctx context.Context, symbol string) (*Security, error) {
	query := `
		SELECT
			id, symbol, name, type, currency, isin, cusip, sedol, bloom_reuters_code,
			asset_class, country_of_issue, quotational_basis, coupon_rate, coupon_type,
			frequency, day_count_convention, issue_date, maturity_date, primary_exchange,
			trading_lot_size, price_source, created_at, updated_at
		FROM securities
		WHERE symbol = $1
	`
	var sec Security
	err := r.DB.QueryRowContext(ctx, query, symbol).
		Scan(
			&sec.ID, &sec.Symbol, &sec.Name, &sec.Type, &sec.Currency, &sec.ISIN, &sec.CUSIP, &sec.SEDOL, &sec.BloomReutersCode,
			&sec.AssetClass, &sec.CountryOfIssue, &sec.QuotationalBasis, &sec.CouponRate, &sec.CouponType,
			&sec.Frequency, &sec.DayCountConvention, &sec.IssueDate, &sec.MaturityDate, &sec.PrimaryExchange,
			&sec.TradingLotSize, &sec.PriceSource, &sec.CreatedAt, &sec.UpdatedAt,
		)
	if err != nil {
		return nil, err
	}
	return &sec, nil
}

func (r *PostgresSecurityRepository) ListSecurities(ctx context.Context) ([]Security, error) {
	query := `
		SELECT
			id, symbol, name, type, currency, isin, cusip, sedol, bloom_reuters_code,
			asset_class, country_of_issue, quotational_basis, coupon_rate, coupon_type,
			frequency, day_count_convention, issue_date, maturity_date, primary_exchange,
			trading_lot_size, price_source, created_at, updated_at
		FROM securities
		ORDER BY symbol
	`
	rows, err := r.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var securities []Security
	for rows.Next() {
		var sec Security
		if err := rows.Scan(
			&sec.ID, &sec.Symbol, &sec.Name, &sec.Type, &sec.Currency, &sec.ISIN, &sec.CUSIP, &sec.SEDOL, &sec.BloomReutersCode,
			&sec.AssetClass, &sec.CountryOfIssue, &sec.QuotationalBasis, &sec.CouponRate, &sec.CouponType,
			&sec.Frequency, &sec.DayCountConvention, &sec.IssueDate, &sec.MaturityDate, &sec.PrimaryExchange,
			&sec.TradingLotSize, &sec.PriceSource, &sec.CreatedAt, &sec.UpdatedAt,
		); err != nil {
			return nil, err
		}
		securities = append(securities, sec)
	}
	return securities, nil
}

func (r *PostgresSecurityRepository) AddPrice(ctx context.Context, price *SecurityPrice) error {
	query := `
		INSERT INTO security_prices (security_id, price, currency, source)
		VALUES ($1, $2, $3, $4)
		RETURNING id, timestamp
	`
	return r.DB.QueryRowContext(ctx, query, price.SecurityID, price.Price, price.Currency, price.Source).
		Scan(&price.ID, &price.Timestamp)
}

func (r *PostgresSecurityRepository) GetLatestPrice(ctx context.Context, securityID uuid.UUID) (*SecurityPrice, error) {
	query := `
		SELECT id, security_id, price, currency, timestamp, source
		FROM security_prices
		WHERE security_id = $1
		ORDER BY timestamp DESC
		LIMIT 1
	`
	var price SecurityPrice
	err := r.DB.QueryRowContext(ctx, query, securityID).
		Scan(&price.ID, &price.SecurityID, &price.Price, &price.Currency, &price.Timestamp, &price.Source)
	if err != nil {
		return nil, err
	}
	return &price, nil
}

type SecurityService struct {
	Repo       SecurityRepository
	MarketData integration.MarketDataProvider
}

func NewSecurityService(repo SecurityRepository, marketData integration.MarketDataProvider) *SecurityService {
	return &SecurityService{
		Repo:       repo,
		MarketData: marketData,
	}
}

func (s *SecurityService) CreateSecurity(ctx context.Context, sec *Security) (*Security, error) {
	if err := s.Repo.CreateSecurity(ctx, sec); err != nil {
		return nil, err
	}
	return sec, nil
}

func (s *SecurityService) SyncPrice(ctx context.Context, symbol string) (*SecurityPrice, error) {
	sec, err := s.Repo.GetSecurity(ctx, symbol)
	if err != nil {
		return nil, fmt.Errorf("security not found: %w", err)
	}

	priceVal, err := s.MarketData.GetPrice(ctx, symbol)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch price: %w", err)
	}

	price := &SecurityPrice{
		SecurityID: sec.ID,
		Price:      priceVal,
		Currency:   sec.Currency, // Assuming price is in same currency for simplicity
		Source:     "MARKET_DATA",
	}

	if err := s.Repo.AddPrice(ctx, price); err != nil {
		return nil, fmt.Errorf("failed to save price: %w", err)
	}

	return price, nil
}
