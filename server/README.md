# WallpaperIO Server

A Go-based server for managing wallpapers with Google authentication, built using Gin framework and PostgreSQL.

## Features

- Google OAuth2 Authentication
- PostgreSQL Database Integration
- Wallpaper Management (CRUD operations)
- Category and Tag-based Organization
- Search Functionality
- RESTful API

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- Google OAuth2 credentials

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=wallpaperio
DB_SSLMODE=disable
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   go mod download
   ```
3. Set up your environment variables
4. Run the server:
   ```bash
   go run cmd/api/main.go
   ```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth2 login
- `GET /auth/google/callback` - Google OAuth2 callback

### Wallpapers
- `GET /api/wallpapers` - List wallpapers
- `GET /api/wallpapers/:id` - Get wallpaper details
- `POST /api/wallpapers` - Create new wallpaper
- `PUT /api/wallpapers/:id` - Update wallpaper
- `DELETE /api/wallpapers/:id` - Delete wallpaper

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create new category

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create new tag

## Project Structure

```
server/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── config/
│   ├── domain/
│   ├── repository/
│   ├── usecase/
│   ├── delivery/
│   └── middleware/
├── pkg/
│   ├── database/
│   ├── auth/
│   └── logger/
└── go.mod
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 