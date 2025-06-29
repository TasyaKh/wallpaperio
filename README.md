# WallpaperIO

A modern wallpaper generation and management platform with AI-powered image generation capabilities.

## 🚀 Features

- AI-powered wallpaper generation
- Real-time image processing
- RESTful API for wallpaper management
- Modern web frontend
- SSL/HTTPS support
- Automatic certificate renewal

## 🏗️ Architecture

- **Frontend**: React/Vite application
- **Backend**: Go server with REST API
- **Image Generator**: Python service with AI models
- **Database**: PostgreSQL
- **Cache**: Redis
- **Vector Database**: Milvus
- **Reverse Proxy**: Nginx with SSL
- **Container Orchestration**: Docker Compose

## 📋 Prerequisites

- Docker and Docker Compose
- Domain name pointing to your server
- At least 4GB RAM (for Milvus)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd wallpaperio
```

### 2. Set up environment variables
Create `.env` files in the following directories:
- `server/.env.prod`
- `server_generator/.env.prod`

### 3. Start the services
```bash
docker-compose up -d
```

## 🔒 SSL Certificate Setup

### Initial Certificate Generation

**Step 1:** Create directories for certbot
```bash
mkdir -p certbot/conf certbot/www
```

**Step 2:** Generate SSL certificates
```bash
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email AkitaSpam@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d wallpaperio.online \
  -d www.wallpaperio.online
```

**Step 3:** Restart nginx to load SSL certificates
```bash
docker-compose restart nginx
```

**Step 4:** Verify SSL is working
```bash
curl -I https://wallpaperio.online
```

### Automatic Certificate Renewal
Add to crontab for monthly renewal:
```bash
crontab -e
```

Add this line:
```
0 12 1 * * cd /root/projects/wallpaperio && docker-compose run --rm certbot renew && docker-compose restart nginx
```

This renews certificates on the 1st of every month at 12:00 PM UTC.

## 🌐 Access Points

- **Frontend**: https://wallpaperio.online
- **API**: https://wallpaperio.online/api/
- **Milvus Attu**: http://localhost:8000

## 📁 Project Structure

```
wallpaperio/
├── frontend/                 # React frontend
├── server/                   # Go backend API
├── server_generator/         # Python image generation service
├── data/                     # Persistent data storage
├── certbot/                  # SSL certificates
│   ├── conf/                 # Certificate configuration
│   └── www/                  # Webroot for validation
├── nginx.conf               # Nginx configuration
├── docker-compose.yml       # Container orchestration
└── README.md               # This file
```

## 🔧 Configuration

### Nginx Configuration
The `nginx.conf` file handles:
- HTTP to HTTPS redirects
- SSL certificate configuration
- API proxy to Go server
- Frontend proxy to React app

### Docker Compose Services
- **nginx**: Reverse proxy with SSL
- **frontend**: React application
- **go_server**: Go API server
- **python_generator_server**: AI image generation
- **celery_worker**: Background task processing
- **postgres**: Database
- **redis**: Cache and message broker
- **milvus**: Vector database
- **etcd**: Milvus dependency
- **minio**: Milvus dependency
- **attu**: Milvus management UI

## 🚀 Deployment

### Production Deployment
1. Set up your domain DNS to point to your server
2. Configure environment variables
3. Generate SSL certificates
4. Start services:
   ```bash
   docker-compose up -d
   ```

### SSL Certificate Management
- **Manual renewal**: `docker-compose run --rm certbot renew`
- **Check certificate status**: `docker-compose run --rm certbot certificates`
- **Force renewal**: `docker-compose run --rm certbot renew --force-renewal`

## 🔍 Monitoring

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs nginx
docker-compose logs go_server
docker-compose logs python_generator_server
```

### SSL Certificate Status
```bash
# Check certificate expiration
openssl x509 -in certbot/conf/live/wallpaperio.online/fullchain.pem -text -noout | grep -A 2 "Validity"
```

## 🛡️ Security

- SSL/TLS encryption enabled
- Automatic certificate renewal
- Containerized services
- Environment variable configuration
- No hardcoded secrets

## 🔄 Maintenance

### Regular Tasks
- Monitor certificate expiration
- Check service logs for errors
- Update Docker images periodically
- Backup database data

### Troubleshooting
- **SSL issues**: Check certificate paths and nginx configuration
- **Service not starting**: Check logs with `docker-compose logs <service>`
- **Certificate renewal fails**: Verify domain DNS settings
