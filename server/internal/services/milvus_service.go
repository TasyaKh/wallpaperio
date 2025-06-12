package services

import (
	"context"
	"fmt"
	"math"

	schema "wallpaperio/server/internal/schema/milvus"
	"wallpaperio/server/pkg/database"

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
		index, err := entity.NewIndexIvfFlat(entity.IP, 1024)
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
func (s *MilvusService) StoreFeatures(wallpaperID uint, features []float32) (int64, error) {
	// Ensure features match the dimension
	if len(features) != schema.Dimension {
		return 0, fmt.Errorf("features dimension mismatch: got %d, expected %d", len(features), schema.Dimension)
	}

	fmt.Printf("Storing features for wallpaper %d, features length: %d\n", wallpaperID, len(features))

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
	fmt.Printf("Successfully stored features for wallpaper %d with feature ID: %d\n", wallpaperID, featureID)
	return featureID, nil
}

// FindSimilar finds similar wallpapers based on features
func (s *MilvusService) FindSimilar(features []float32, limit int, excludeID uint64) ([]uint64, error) {
	// Create search parameters for IVF_FLAT
	searchParams, err := entity.NewIndexIvfFlatSearchParam(1024) // nlist=1024 for good balance
	if err != nil {
		return nil, fmt.Errorf("failed to create search parameters: %w", err)
	}

	// Create expression to exclude current ID
	expr := ""
	if excludeID > 0 {
		expr = fmt.Sprintf("id != %d", excludeID)
	}

	// Execute search
	results, err := s.client.Search(
		context.Background(),
		schema.CollectionName, // Collection name
		[]string{},            // Partition list (empty for all partitions)
		expr,                  // Boolean expression to exclude current ID
		[]string{"id"},        // Output fields
		[]entity.Vector{entity.FloatVector(features)}, // Query vectors
		"features",   // Vector field name
		entity.IP,    // Metric type
		limit,        // TopK
		searchParams, // Search parameters
	)
	if err != nil {
		return nil, fmt.Errorf("failed to search similar wallpapers: %w", err)
	}

	// Extract IDs from results with similarity threshold
	var wallpaperIDs []uint64
	const similarityThreshold = 30.0 // Only include results with similarity > 30%

	for _, hit := range results {
		// Get IDs and scores
		ids := hit.IDs.(*entity.ColumnInt64).Data()
		for i, id := range ids {
			// Calculate similarity (0-100%)
			similarity := 100.0 * (1.0 - math.Min(1.0, float64(hit.Scores[i])/1000.0))

			// Only include results above threshold
			if similarity > similarityThreshold {
				wallpaperIDs = append(wallpaperIDs, uint64(id))
				fmt.Printf("ID: %d, Similarity: %.1f%%\n", id, similarity)
			}
		}
	}

	fmt.Println("wallpaperIDs", wallpaperIDs)

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
	// Create query parameters
	expr := fmt.Sprintf("id == %d", featureID)
	outputFields := []string{"features"}

	// Query the collection
	results, err := s.client.Query(context.Background(),
		schema.CollectionName, []string{}, expr, outputFields)
	if err != nil {
		return nil, fmt.Errorf("failed to query features: %w", err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no features found for feature ID %d", featureID)
	}

	// Extract the vector column
	featuresCol, ok := results[0].(*entity.ColumnFloatVector)
	if !ok {
		return nil, fmt.Errorf("expected float vector column but got different type")
	}
	data := featuresCol.Data()

	if len(data) == 0 {
		return nil, fmt.Errorf("no features found for feature ID %d", featureID)
	}
	vector := data[0]

	return vector, nil
}

// Close closes the Milvus connection
func (s *MilvusService) Close() error {
	return s.client.Close()
}
