#!/bin/bash

# Mpiloshini RMH 24 - Vibration Analysis System Setup Script
# This script sets up the entire application using Docker

set -e

echo "🚀 Setting up Mpiloshini RMH 24 Vibration Analysis System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create .env file for backend if it doesn't exist
if [ ! -f "./backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > ./backend/.env << EOF
# Supabase Configuration (Optional - for cloud storage)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET=vibration-files

# Application Settings
ENVIRONMENT=development
DEBUG=true
EOF
    echo "✅ Created backend/.env file. Please update with your Supabase credentials if needed."
fi

# Function to run development setup
setup_development() {
    echo "🔧 Setting up development environment..."
    
    # Build and start services
    docker-compose down --remove-orphans
    docker-compose build --no-cache
    docker-compose up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check if services are healthy
    echo "🔍 Checking service health..."
    
    # Check backend
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is running at http://localhost:8000"
    else
        echo "❌ Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is running at http://localhost:3000"
    else
        echo "❌ Frontend health check failed"
        docker-compose logs frontend
        exit 1
    fi
    
    echo ""
    echo "🎉 Development environment is ready!"
    echo "📊 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "📝 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
}

# Function to run production setup
setup_production() {
    echo "🏭 Setting up production environment..."
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 15
    
    # Check if services are healthy
    echo "🔍 Checking service health..."
    
    # Check backend
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is running at http://localhost:8000"
    else
        echo "❌ Backend health check failed"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        echo "✅ Frontend is running at http://localhost"
    else
        echo "❌ Frontend health check failed"
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    fi
    
    echo ""
    echo "🎉 Production environment is ready!"
    echo "🌐 Application: http://localhost"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "📝 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
}

# Parse command line arguments
case "${1:-dev}" in
    "dev"|"development")
        setup_development
        ;;
    "prod"|"production")
        setup_production
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down --remove-orphans --volumes
        docker-compose -f docker-compose.prod.yml down --remove-orphans --volumes
        docker system prune -f
        echo "✅ Cleanup complete"
        ;;
    "logs")
        echo "📝 Showing logs..."
        docker-compose logs -f
        ;;
    *)
        echo "Usage: $0 [dev|prod|clean|logs]"
        echo "  dev  - Setup development environment (default)"
        echo "  prod - Setup production environment"
        echo "  clean - Clean up all Docker resources"
        echo "  logs - Show application logs"
        exit 1
        ;;
esac