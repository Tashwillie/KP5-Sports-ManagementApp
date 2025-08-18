# Stable Backend Startup Script for KP5 Academy
# This script ensures the backend stays running

Write-Host "🚀 Starting KP5 Academy Backend Server..." -ForegroundColor Green

# Check if backend is already running
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($existingProcess) {
    Write-Host "⚠️  Backend is already running. Stopping existing process..." -ForegroundColor Yellow
    Stop-Process -Id $existingProcess.Id -Force
    Start-Sleep -Seconds 2
}

# Check if dist folder exists
if (-not (Test-Path "dist/index.js")) {
    Write-Host "❌ Compiled backend not found. Building first..." -ForegroundColor Red
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
    
    Write-Host "🔨 Building backend..." -ForegroundColor Blue
    npm run build
    
    if (-not (Test-Path "dist/index.js")) {
        Write-Host "❌ Build failed! Please check for errors." -ForegroundColor Red
        exit 1
    }
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Creating default configuration..." -ForegroundColor Red
    @"
DATABASE_URL="postgresql://kp5_user:kp5_password@localhost:5432/kp5_academy"
JWT_SECRET=6b5095af764de1fd439e7fed149a30f
JWT_REFRESH_SECRET=80efda9297966fe9e0758378dfc1e89f3e8d804471b9e56d003b853c0f65505125cb16ef4dce48daf7c2cfa3ce59e0a3fd95d4082d94da0ca6fa52276d053347
FRONTEND_URL=http://localhost:3003
PORT=3001
NODE_ENV=development
BCRYPT_ROUNDS=12
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Start the backend server
Write-Host "🚀 Starting backend server on port 3001..." -ForegroundColor Green
Write-Host "📡 API will be available at: http://localhost:3001/api" -ForegroundColor Blue
Write-Host "🏥 Health check: http://localhost:3001/health" -ForegroundColor Blue
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server and keep it running
try {
    node dist/index.js
} catch {
    Write-Host "❌ Failed to start backend server" -ForegroundColor Red
    Write-Host "💡 Try running: npm run build" -ForegroundColor Yellow
    exit 1
}
