@echo off
REM Mpiloshini RMH 24 - Vibration Analysis System Setup Script (Windows)
REM This script sets up the entire application using Docker

echo 🚀 Setting up Mpiloshini RMH 24 Vibration Analysis System...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    echo Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

REM Create .env file for backend if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating backend .env file...
    (
        echo # Supabase Configuration ^(Optional - for cloud storage^)
        echo SUPABASE_URL=your_supabase_url_here
        echo SUPABASE_KEY=your_supabase_anon_key_here
        echo SUPABASE_BUCKET=vibration-files
        echo.
        echo # Application Settings
        echo ENVIRONMENT=development
        echo DEBUG=true
    ) > backend\.env
    echo ✅ Created backend/.env file. Please update with your Supabase credentials if needed.
)

REM Parse command line arguments
set MODE=%1
if "%MODE%"=="" set MODE=dev

if "%MODE%"=="dev" goto :setup_development
if "%MODE%"=="development" goto :setup_development
if "%MODE%"=="prod" goto :setup_production
if "%MODE%"=="production" goto :setup_production
if "%MODE%"=="clean" goto :cleanup
if "%MODE%"=="logs" goto :show_logs

echo Usage: %0 [dev^|prod^|clean^|logs]
echo   dev  - Setup development environment ^(default^)
echo   prod - Setup production environment
echo   clean - Clean up all Docker resources
echo   logs - Show application logs
pause
exit /b 1

:setup_development
echo 🔧 Setting up development environment...

REM Build and start services
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...

REM Check backend
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    docker-compose logs backend
    pause
    exit /b 1
) else (
    echo ✅ Backend is running at http://localhost:8000
)

REM Check frontend
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend health check failed
    docker-compose logs frontend
    pause
    exit /b 1
) else (
    echo ✅ Frontend is running at http://localhost:3000
)

echo.
echo 🎉 Development environment is ready!
echo 📊 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo 📝 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
pause
exit /b 0

:setup_production
echo 🏭 Setting up production environment...

REM Build and start services
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

echo 🔍 Checking service health...

REM Check backend
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    docker-compose -f docker-compose.prod.yml logs backend
    pause
    exit /b 1
) else (
    echo ✅ Backend is running at http://localhost:8000
)

REM Check frontend
curl -f http://localhost >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend health check failed
    docker-compose -f docker-compose.prod.yml logs frontend
    pause
    exit /b 1
) else (
    echo ✅ Frontend is running at http://localhost
)

echo.
echo 🎉 Production environment is ready!
echo 🌐 Application: http://localhost
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo 📝 To view logs: docker-compose -f docker-compose.prod.yml logs -f
echo 🛑 To stop: docker-compose -f docker-compose.prod.yml down
pause
exit /b 0

:cleanup
echo 🧹 Cleaning up Docker resources...
docker-compose down --remove-orphans --volumes
docker-compose -f docker-compose.prod.yml down --remove-orphans --volumes
docker system prune -f
echo ✅ Cleanup complete
pause
exit /b 0

:show_logs
echo 📝 Showing logs...
docker-compose logs -f
exit /b 0