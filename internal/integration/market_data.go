package integration

import (
	"context"
	"fmt"
	"math/rand"
	"time"
)

// MarketDataProvider defines the interface for fetching market data
type MarketDataProvider interface {
	GetPrice(ctx context.Context, symbol string) (float64, error)
}

// MockMarketDataProvider is a mock implementation for testing/dev
type MockMarketDataProvider struct{}

func NewMockMarketDataProvider() *MockMarketDataProvider {
	return &MockMarketDataProvider{}
}

func (m *MockMarketDataProvider) GetPrice(ctx context.Context, symbol string) (float64, error) {
	// Simulate network delay
	time.Sleep(100 * time.Millisecond)

	// Generate a random price between 10 and 1000
	// In a real mock, we might want deterministic values or a map of symbol -> price
	rand.Seed(time.Now().UnixNano())
	price := 10.0 + rand.Float64()*(1000.0-10.0)

	// Round to 2 decimal places
	return float64(int(price*100)) / 100, nil
}

// YahooFinanceProvider would be a real implementation
type YahooFinanceProvider struct {
	APIKey string
}

func (y *YahooFinanceProvider) GetPrice(ctx context.Context, symbol string) (float64, error) {
	return 0, fmt.Errorf("not implemented")
}
