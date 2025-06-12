package database

import (
	"fmt"
	"os"
)

type MilvusConfig struct {
	Host     string
	Port     string
	Username string
	Password string
}

func NewMilvusConfig() *MilvusConfig {
	return &MilvusConfig{
		Host:     getEnvOrDefault("MILVUS_HOST", "localhost"),
		Port:     getEnvOrDefault("MILVUS_PORT", "19530"),
		Username: getEnvOrDefault("MILVUS_USERNAME", ""),
		Password: getEnvOrDefault("MILVUS_PASSWORD", ""),
	}
}

func (c *MilvusConfig) GetAddress() string {
	return fmt.Sprintf("%s:%s", c.Host, c.Port)
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
