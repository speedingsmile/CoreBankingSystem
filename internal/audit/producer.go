package audit

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
)

type AuditProducer struct {
	writer *kafka.Writer
}

func NewAuditProducer(brokers []string, topic string) *AuditProducer {
	w := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}
	return &AuditProducer{writer: w}
}

func (p *AuditProducer) PublishAudit(ctx context.Context, log AuditLog) error {
	payload, err := json.Marshal(log)
	if err != nil {
		return fmt.Errorf("failed to marshal audit log: %w", err)
	}

	err = p.writer.WriteMessages(ctx,
		kafka.Message{
			Key:   []byte(log.EntityID.String()), // Ensure ordering by entity if needed
			Value: payload,
			Time:  time.Now(),
		},
	)
	if err != nil {
		return fmt.Errorf("failed to write audit log to kafka: %w", err)
	}

	return nil
}

func (p *AuditProducer) Close() error {
	return p.writer.Close()
}
