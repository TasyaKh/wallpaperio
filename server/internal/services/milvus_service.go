package services

import (
	"context"
	"fmt"
	"log"
	"time"

	schema "wallpaperio/server/internal/schema/milvus"
	"wallpaperio/server/internal/services/database"

	"github.com/milvus-io/milvus-sdk-go/v2/client"
	"github.com/milvus-io/milvus-sdk-go/v2/entity"
)

type MilvusService struct {
	client client.Client
	config *database.MilvusConfig
}

func NewMilvusService() (*MilvusService, error) {
	cfg := database.NewMilvusConfig()

	// Connect to Milvus
	milvusClient, err := client.NewGrpcClient(context.Background(), cfg.GetAddress())
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Milvus: %w", err)
	}

	// Create collection if it doesn't exist
	hasCollection, err := milvusClient.HasCollection(context.Background(), schema.CollectionName)
	if err != nil {
		return nil, fmt.Errorf("failed to check collection: %w", err)
	}

	if !hasCollection {
		// Create collection
		err = milvusClient.CreateCollection(context.Background(), schema.GetWallpaperSchema(), 2) // 2 shards
		if err != nil {
			return nil, fmt.Errorf("failed to create collection: %w", err)
		}

		// Create index
		index, err := entity.NewIndexIvfFlat(entity.COSINE, 1024)
		if err != nil {
			return nil, fmt.Errorf("failed to create index: %w", err)
		}
		err = milvusClient.CreateIndex(context.Background(), schema.CollectionName, "features", index, false)
		if err != nil {
			return nil, fmt.Errorf("failed to create index: %w", err)
		}
	}

	return &MilvusService{
		client: milvusClient,
		config: cfg,
	}, nil
}

// StoreFeatures stores wallpaper features in Milvus and returns the feature ID
func (s *MilvusService) StoreFeatures(features []float32) (int64, error) {
	// Ensure features match the dimension
	if len(features) != schema.Dimension {
		return 0, fmt.Errorf("features dimension mismatch: got %d, expected %d", len(features), schema.Dimension)
	}

	data := []entity.Column{
		entity.NewColumnFloatVector("features", schema.Dimension, [][]float32{features}),
	}

	// Insert and get the primary keys
	primaryKeys, err := s.client.Insert(context.Background(), schema.CollectionName, "", data...)
	if err != nil {
		fmt.Printf("Insert error: %v\n", err)
		return 0, fmt.Errorf("failed to insert features: %w", err)
	}

	// Convert primary keys to int64 slice
	ids, ok := primaryKeys.(*entity.ColumnInt64)
	if !ok {
		return 0, fmt.Errorf("unexpected primary key type")
	}

	if ids.Len() == 0 {
		return 0, fmt.Errorf("no primary key returned from insert")
	}

	featureID := ids.Data()[0]
	return featureID, nil
}

// FindSimilar finds similar wallpapers based on features
func (s *MilvusService) FindSimilar(features []float32, limit int, excludeID uint64) ([]uint64, error) {
	searchParams, err := entity.NewIndexIvfFlatSearchParam(1024)
	if err != nil {
		return nil, fmt.Errorf("failed to create search parameters: %w", err)
	}

	expr := ""
	if excludeID > 0 {
		expr = fmt.Sprintf("id != %d", excludeID)
	}

	similarityThreshold := float32(0.5)

	results, err := s.client.Search(
		context.Background(),
		schema.CollectionName, // Collection name
		[]string{},            // Partition list (empty for all partitions)
		expr,                  // Boolean expression to exclude current ID
		[]string{"id"},        // Output fields
		[]entity.Vector{entity.FloatVector(features)}, // Query vectors
		"features",           // Vector field name
		entity.COSINE,        // Use cosine similarity
		limit,                // TopK
		searchParams,         // Search parameters
		client.WithOffset(0), // Set offset to 0
	)
	if err != nil {
		return nil, fmt.Errorf("failed to search similar wallpapers: %w", err)
	}

	var wallpaperIDs []uint64
	if len(results) > 0 {
		result := results[0]
		resultIDs := result.IDs.(*entity.ColumnInt64).Data()
		scores := result.Scores

		for i, id := range resultIDs {
			if scores[i] > similarityThreshold {
				wallpaperIDs = append(wallpaperIDs, uint64(id))
			}
		}
	}

	return wallpaperIDs, nil
}

// DeleteFeatures deletes features for a wallpaper
func (s *MilvusService) DeleteFeatures(wallpaperID uint) error {
	expr := fmt.Sprintf("id == %d", wallpaperID)
	err := s.client.Delete(context.Background(), schema.CollectionName, "_default", expr)
	if err != nil {
		return fmt.Errorf("failed to delete features: %w", err)
	}
	return nil
}

// GetFeaturesOneWallpaper retrieves features for a wallpaper using its feature ID
func (s *MilvusService) GetFeaturesOneWallpaper(featureID uint) ([]float32, error) {
	const (
		maxRetries = 2
		timeout    = 10 * time.Second
	)

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	for attempt := 0; attempt < maxRetries; attempt++ {
		features, err := s.queryFeatures(ctx, featureID)
		if err == nil {
			return features, nil
		}

		// Log attempt failure
		log.Printf("Attempt %d/%d failed: %v", attempt+1, maxRetries, err)

		// Don't sleep on last attempt
		if attempt < maxRetries-1 {
			time.Sleep(time.Second * time.Duration(attempt+1))
		}
	}

	return nil, fmt.Errorf("failed to get features after %d attempts", maxRetries)
}

// queryFeatures performs a single query attempt to get features
func (s *MilvusService) queryFeatures(ctx context.Context, featureID uint) ([]float32, error) {
	expr := fmt.Sprintf("id == %d", featureID)
	outputFields := []string{"features"}

	results, err := s.client.Query(ctx, schema.CollectionName, []string{}, expr, outputFields)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no results found for feature ID %d", featureID)
	}

	featuresCol, ok := results[0].(*entity.ColumnFloatVector)
	if !ok {
		return nil, fmt.Errorf("invalid result type: expected float vector")
	}

	data := featuresCol.Data()
	if len(data) == 0 {
		return nil, fmt.Errorf("empty feature vector for ID %d", featureID)
	}

	return data[0], nil
}

// Close closes the Milvus connection
func (s *MilvusService) Close() error {
	return s.client.Close()
}
