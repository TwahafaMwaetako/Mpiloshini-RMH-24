# PowerShell script to start both frontend and backend services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Mpiloshini RMH 24 Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$(Get-Location)\backend'
    Write-Host 'Activating Python Virtual Environment...' -ForegroundColor Green
    .\.venv\Scripts\Activate
    Write-Host 'Starting FastAPI Backend on http://localhost:8000' -ForegroundColor Green
    Write-Host 'API Documentation: http://localhost:8000/docs' -ForegroundColor Cyan
    uvicorn app.main:app --reload --port 8000
"@

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend Development Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$(Get-Location)\frontend'
    Write-Host 'Starting React Frontend...' -ForegroundColor Green
    npm run dev
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Services Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please wait a few seconds for services to initialize..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:8080 (or http://localhost:5173)" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To stop services, close the opened terminal windows." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
