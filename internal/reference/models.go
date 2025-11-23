package reference

type Currency struct {
	Code        string `json:"code"`         // PK, 3-char ISO
	NumericCode int    `json:"numeric_code"` // ISO 4217 numeric code
	Name        string `json:"name"`
	Decimals    int    `json:"decimals"`
	IsActive    bool   `json:"is_active"`
}

type Country struct {
	Alpha2      string `json:"alpha2"` // PK, 2-char ISO
	Alpha3      string `json:"alpha3"`
	Name        string `json:"name"`
	RiskScore   int    `json:"risk_score"` // 0-100
	PhonePrefix string `json:"phone_prefix"`
}

type Language struct {
	Code      string `json:"code"` // e.g., "en-US"
	Name      string `json:"name"`
	Direction string `json:"direction"` // LTR/RTL
}
