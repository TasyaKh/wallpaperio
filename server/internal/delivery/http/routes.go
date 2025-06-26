package http

import (
	"github.com/gin-gonic/gin"

	"wallpaperio/server/internal/handlers"
	"wallpaperio/server/internal/middleware"
	"wallpaperio/server/pkg/auth"
)

// Router holds all the handlers for the application
type Router struct {
	handlers   map[string]interface{}
	jwtService *auth.JWTService
	apiKey     string
}

// NewRouter creates a new Router instance
func NewRouter(jwtService *auth.JWTService, apiKey string) *Router {
	return &Router{
		handlers:   make(map[string]interface{}),
		jwtService: jwtService,
		apiKey:     apiKey,
	}
}

func (r *Router) AddHandler(name string, handler interface{}) {
	r.handlers[name] = handler
}

// Setup configures all the routes for the application
func (r *Router) Setup(router *gin.Engine) {
	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Serve static files
	router.Static("/static", "./static")

	// Auth routes
	auth := router.Group("/auth")
	{
		authHandler := r.handlers["auth"].(*handlers.GoogleAuthHandler)
		auth.GET("/google", authHandler.InitiateGoogleAuth)
		auth.GET("/google/callback", authHandler.GoogleCallback)
	}

	// Image routes
	images := router.Group("/api/images")
	{
		imageHandler := r.handlers["image"].(*handlers.ImageHandler)
		images.POST("/generate", imageHandler.GenerateImage)
		images.GET("/generators", imageHandler.GetAvailableGenerators)
		images.GET("/status/:task_id", imageHandler.GetGenerationStatus)
	}

	// Category routes
	router.GET("/api/categories", func(c *gin.Context) {
		categoryHandler := r.handlers["category"].(*handlers.CategoryHandler)
		categoryHandler.GetAllCategories(c)
	})

	// Wallpaper routes
	wallpaper := router.Group("/api/wallpapers")
	{
		wallpaperHandler := r.handlers["wallpaper"].(*handlers.WallpaperHandler)
		wallpaper.GET("", wallpaperHandler.GetWallpapers)
		wallpaper.GET("/:id/next", wallpaperHandler.GetNextWallpaper)
		wallpaper.GET("/:id/previous", wallpaperHandler.GetPreviousWallpaper)
		wallpaper.GET("/:id/similar", wallpaperHandler.GetSimilarWallpapers)
		wallpaper.POST("", middleware.RequireAdminOrAPIKey(r.jwtService, r.apiKey), wallpaperHandler.CreateWallpaper)
		wallpaper.DELETE("/:id", middleware.RequireAdminOrAPIKey(r.jwtService, r.apiKey), wallpaperHandler.DeleteWallpaper)
	}
}
