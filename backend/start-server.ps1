# KP5 Academy Backend Server Startup Script
# This script provides a robust way to start and monitor the backend server

Write-Host "🚀 Starting KP5 Academy Backend Server..." -ForegroundColor Green

# Check if port 3001 is already in use
$portCheck = netstat -ano | findstr :3001
if ($portCheck) {
    Write-Host "⚠️  Port 3001 is already in use. Stopping existing process..." -ForegroundColor Yellow
    
    # Extract PID from the port check
    $lines = $portCheck -split "`n"
    foreach ($line in $lines) {
        if ($line -match "LISTENING\s+(\d+)") {
            $processId = $matches[1]
            Write-Host "🛑 Stopping process PID: $processId" -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            break
        }
    }
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Please create one from env.example" -ForegroundColor Red
    exit 1
}

# Start the server with nodemon for better development experience
Write-Host "📡 Starting server with nodemon..." -ForegroundColor Cyan
Write-Host "💡 Use 'rs' in the terminal to restart the server manually" -ForegroundColor Cyan
Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

try {
    npm run dev:watch
} catch {
    Write-Host "❌ Failed to start server with nodemon, trying regular dev mode..." -ForegroundColor Yellow
    try {
        npm run dev
    } catch {
        Write-Host "❌ Failed to start server. Check for errors above." -ForegroundColor Red
        exit 1
    }
}
