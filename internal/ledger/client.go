package ledger

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Client struct {
	ID             uuid.UUID `json:"id"`
	ExternalID     string    `json:"external_id"`
	Name           string    `json:"name"`
	Type           string    `json:"type"`
	Status         string    `json:"status"`
	RiskRating     string    `json:"risk_rating"`
	TaxDomicile    string    `json:"tax_domicile"`
	Classification string    `json:"classification"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ClientRepository interface {
	CreateClient(ctx context.Context, client *Client) error
	GetClient(ctx context.Context, id uuid.UUID) (*Client, error)
	ListClients(ctx context.Context) ([]Client, error)
}

type PostgresClientRepository struct {
	DB *sql.DB
}

func NewPostgresClientRepository(db *sql.DB) *PostgresClientRepository {
	return &PostgresClientRepository{DB: db}
}

func (r *PostgresClientRepository) CreateClient(ctx context.Context, client *Client) error {
	query := `
		INSERT INTO clients (external_id, name, type, status, risk_rating, tax_domicile, classification)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	return r.DB.QueryRowContext(ctx, query,
		client.ExternalID, client.Name, client.Type, client.Status,
		client.RiskRating, client.TaxDomicile, client.Classification,
	).Scan(&client.ID, &client.CreatedAt, &client.UpdatedAt)
}

func (r *PostgresClientRepository) GetClient(ctx context.Context, id uuid.UUID) (*Client, error) {
	query := `
		SELECT id, external_id, name, type, status, risk_rating, tax_domicile, classification, created_at, updated_at
		FROM clients
		WHERE id = $1
	`
	var client Client
	err := r.DB.QueryRowContext(ctx, query, id).Scan(
		&client.ID, &client.ExternalID, &client.Name, &client.Type, &client.Status,
		&client.RiskRating, &client.TaxDomicile, &client.Classification,
		&client.CreatedAt, &client.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &client, nil
}

func (r *PostgresClientRepository) ListClients(ctx context.Context) ([]Client, error) {
	query := `
		SELECT id, external_id, name, type, status, risk_rating, tax_domicile, classification, created_at, updated_at
		FROM clients
		ORDER BY name
	`
	rows, err := r.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []Client
	for rows.Next() {
		var c Client
		if err := rows.Scan(
			&c.ID, &c.ExternalID, &c.Name, &c.Type, &c.Status,
			&c.RiskRating, &c.TaxDomicile, &c.Classification,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		clients = append(clients, c)
	}
	return clients, nil
}

type ClientService struct {
	Repo ClientRepository
}

func NewClientService(repo ClientRepository) *ClientService {
	return &ClientService{Repo: repo}
}

func (s *ClientService) CreateClient(ctx context.Context, client *Client) (*Client, error) {
	if err := s.Repo.CreateClient(ctx, client); err != nil {
		return nil, err
	}
	return client, nil
}
