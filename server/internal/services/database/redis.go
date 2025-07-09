// Requires: go get github.com/go-redis/redis/v8
package database

import (
	"github.com/go-redis/redis/v8"
)

func NewRedisClient() *redis.Client {
	host := getEnvOrDefault("REDIS_HOST", "localhost")
	port := getEnvOrDefault("REDIS_PORT", "6379")
	password := getEnvOrDefault("REDIS_PASSWORD", "")
	addr := host + ":" + port

	return redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})
}
