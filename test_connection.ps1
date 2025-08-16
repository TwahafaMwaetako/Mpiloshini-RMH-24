# PowerShell script to test the connection between frontend and backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Mpiloshini RMH 24 Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Backend Health
Write-Host "1. Testing Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
    Write-Host "✓ Backend is running: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not responding. Make sure it's running on port 8000" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test Backend API Documentation
Write-Host "2. Checking API Documentation..." -ForegroundColor Yellow
Write-Host "   API Docs available at: http://localhost:8000/docs" -ForegroundColor Cyan

Write-Host ""

# Test Frontend
Write-Host "3. Frontend Status..." -ForegroundColor Yellow
Write-Host "   Frontend should be running at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Alternative port: http://localhost:5173" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Services Instructions:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend (in new terminal):" -ForegroundColor Green
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\.venv\Scripts\Activate" -ForegroundColor White
Write-Host "  uvicorn app.main:app --reload --port 8000" -ForegroundColor White
Write-Host ""
Write-Host "Frontend (in new terminal):" -ForegroundColor Green
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
