package http

import (
	"github.com/gin-gonic/gin"

	"wallpaperio/server/internal/handlers"
)

// Router holds all the handlers for the application
type Router struct {
	handlers map[string]interface{}
}

// NewRouter creates a new Router instance
func NewRouter() *Router {
	return &Router{handlers: make(map[string]interface{})}
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
		authHandler := r.handlers["auth"].(*handlers.AuthHandler)
		auth.GET("/google", authHandler.InitiateGoogleAuth)
		auth.GET("/google/callback", authHandler.GoogleCallback)
	}

	// Image generation route
	router.POST("/api/images/generate", func(c *gin.Context) {
		imageHandler := r.handlers["image"].(*handlers.ImageHandler)
		imageHandler.GenerateImage(c)
	})

	// Category routes
	router.GET("/api/categories", func(c *gin.Context) {
		categoryHandler := r.handlers["category"].(*handlers.CategoryHandler)
		categoryHandler.GetAllCategories(c)
	})

	// Wallpaper routes
	router.GET("/api/wallpapers", func(c *gin.Context) {
		wallpaperHandler := r.handlers["wallpaper"].(*handlers.WallpaperHandler)
		wallpaperHandler.GetWallpapers(c)
	})
}
