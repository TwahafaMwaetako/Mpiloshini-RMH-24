# 🐳 Docker Setup Guide - Mpiloshini RMH 24 Vibration Analysis System

This guide will help you set up the entire Vibration Analysis System using Docker for easy installation and deployment.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (to clone the repository)

### Install Docker

#### Windows/Mac
1. Download Docker Desktop from [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. Install and start Docker Desktop
3. Verify installation: `docker --version`

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows
```cmd
# Run the setup script
setup.bat

# Or for production
setup.bat prod
```

#### Linux/Mac
```bash
# Make script executable
chmod +x setup.sh

# Run the setup script
./setup.sh

# Or for production
./setup.sh prod
```

### Option 2: Manual Setup

#### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd mpiloshini-rmh-24

# Create backend environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Build and start services
docker-compose up --build -d

# Check status
docker-compose ps
```

#### Production Environment
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Supabase Configuration (Optional - for cloud storage)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET=vibration-files

# Application Settings
ENVIRONMENT=development
DEBUG=true
```

### Frontend Configuration

The frontend automatically connects to the backend through Docker networking. No additional configuration needed.

## 📊 Access Points

### Development Mode
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

### Production Mode
- **Application**: http://localhost (port 80)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠 Common Commands

### Development
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build -d

# View service status
docker-compose ps
```

### Production
```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Rebuild services
docker-compose -f docker-compose.prod.yml up --build -d
```

### Maintenance
```bash
# Clean up everything
docker-compose down --volumes --remove-orphans
docker system prune -f

# View resource usage
docker stats

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 📁 Volume Management

### Data Persistence
- **Backend uploads**: Stored in `backend_uploads` Docker volume
- **Development**: Code changes are reflected immediately via bind mounts

### Backup Data
```bash
# Backup uploads volume
docker run --rm -v backend_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restore uploads volume
docker run --rm -v backend_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :8000
# or
lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

#### Services Not Starting
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check service health
docker-compose ps
```

#### Permission Issues (Linux)
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in

# Fix file permissions
sudo chown -R $USER:$USER .
```

#### Out of Disk Space
```bash
# Clean up Docker resources
docker system prune -a -f
docker volume prune -f
```

### Health Checks

Both services include health checks:
- **Backend**: `curl -f http://localhost:8000/health`
- **Frontend**: `curl -f http://localhost/`

### Performance Tuning

#### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 🔒 Security Considerations

### Production Deployment
1. **Environment Variables**: Use Docker secrets or external secret management
2. **Network Security**: Use reverse proxy (nginx/traefik) with SSL
3. **Container Security**: Run containers as non-root user
4. **Image Security**: Regularly update base images

### Example Production Setup with SSL
```yaml
# docker-compose.prod.yml with SSL
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
```

## 📈 Monitoring

### Container Monitoring
```bash
# Resource usage
docker stats

# Container logs
docker-compose logs -f --tail=100

# Health status
docker-compose ps
```

### Application Monitoring
- Backend health endpoint: `/health`
- Frontend served from nginx with health checks
- Logs available through Docker logging drivers

## 🚀 Deployment Options

### Local Development
- Use `docker-compose.yml` with hot reload
- Bind mounts for code changes
- Debug mode enabled

### Production Deployment
- Use `docker-compose.prod.yml`
- Optimized builds
- No bind mounts
- Health checks enabled

### Cloud Deployment
The Docker setup is compatible with:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Kubernetes** (with additional manifests)

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify Docker installation: `docker --version`
3. Check system resources: `docker system df`
4. Review this documentation
5. Check the main project README.md

## 🎯 Next Steps

After successful setup:
1. Access the frontend at http://localhost:3000 (dev) or http://localhost (prod)
2. Upload your .mat vibration files
3. View analysis results and health scores
4. Explore the API documentation at http://localhost:8000/docs

Happy analyzing! 🎉