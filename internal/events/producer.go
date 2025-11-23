package events

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(brokers []string, topic string) *Producer {
	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}
	return &Producer{writer: writer}
}

func (p *Producer) Publish(ctx context.Context, key string, payload interface{}) error {
	value, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	err = p.writer.WriteMessages(ctx,
		kafka.Message{
			Key:   []byte(key),
			Value: value,
			Time:  time.Now(),
		},
	)
	if err != nil {
		return fmt.Errorf("failed to write message to kafka: %w", err)
	}

	log.Printf("Published event to %s: %s", p.writer.Topic, key)
	return nil
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
