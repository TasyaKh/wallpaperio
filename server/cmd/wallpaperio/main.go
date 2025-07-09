package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"

	"wallpaperio/server/internal/config"
	"wallpaperio/server/internal/delivery/http"
	"wallpaperio/server/internal/handlers"
	"wallpaperio/server/internal/services"
	"wallpaperio/server/internal/services/database"
	"wallpaperio/server/pkg/auth"

	"github.com/gin-gonic/gin"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or error loading .env file")
	}
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := database.NewPostgresDB(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize services
	googleAuth := auth.NewGoogleAuth(&cfg.Google)
	jwtService := auth.NewJWTService(cfg.JWT.Secret)
	categorySvc := services.NewCategoryService(db.DB, cfg.Server.GeneratorImagesHostURL)
	tagSvc := services.NewTagService(db.DB)
	featureSvc := services.NewFeatureService()
	redisClient := database.NewRedisClient()
	wallpaperSvc, err := services.NewWallpaperService(db.DB, tagSvc, featureSvc, redisClient)
	if err != nil {
		log.Fatalf("Failed to initialize wallpaper service: %v", err)
	}

	// Initialize handlers
	authHandler := handlers.NewGoogleAuthHandler(googleAuth, db, jwtService)
	imageCfg := config.LoadImageGeneratorConfig()
	imageHandler := handlers.NewImageHandler(imageCfg, db.DB)
	categoryHandler := handlers.NewCategoryHandler(categorySvc)
	wallpaperHandler := handlers.NewWallpaperHandler(wallpaperSvc, featureSvc, tagSvc, db.DB)

	// Initialize router
	router := gin.Default()
	// wallpaperio.online
	// if err := router.SetTrustedProxies([]string{"127.0.0.1", "148.253.208.178"}); err != nil {
	// 	log.Printf("Failed to set trusted proxies: %v", err)
	// }
	appRouter := http.NewRouter(jwtService, cfg.Server.APIKey)
	appRouter.AddHandler("auth", authHandler)
	appRouter.AddHandler("image", imageHandler)
	appRouter.AddHandler("category", categoryHandler)
	appRouter.AddHandler("wallpaper", wallpaperHandler)
	appRouter.Setup(router)

	if _, err := os.Stat("static"); os.IsNotExist(err) {
		if err := os.Mkdir("static", 0o755); err != nil {
			log.Fatalf("Failed to create static directory: %v", err)
		}
	}

	// Start server
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := router.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
