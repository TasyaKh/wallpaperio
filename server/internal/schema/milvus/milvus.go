package schema

import (
	"fmt"

	"github.com/milvus-io/milvus-sdk-go/v2/entity"
)

const (
	CollectionName = "wallpaper_features"
	Dimension      = 1280 // EfficientNet feature dimension
)

// GetWallpaperSchema returns the schema for the wallpaper features collection
func GetWallpaperSchema() *entity.Schema {
	return &entity.Schema{
		CollectionName: CollectionName,
		Fields: []*entity.Field{
			{
				Name:       "id",
				DataType:   entity.FieldTypeInt64,
				PrimaryKey: true,
				AutoID:     true,
			},
			{
				Name:     "features",
				DataType: entity.FieldTypeFloatVector,
				TypeParams: map[string]string{
					"dim": fmt.Sprintf("%d", Dimension),
				},
			},
		},
	}
}
