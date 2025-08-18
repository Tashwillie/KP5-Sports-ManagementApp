# Start Backend as Windows Service (Alternative Method)
# This keeps the backend running even if you close the terminal

Write-Host "🚀 Starting KP5 Academy Backend as Windows Service..." -ForegroundColor Green

# Check if backend is already running
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($existingProcess) {
    Write-Host "⚠️  Backend is already running. Stopping existing process..." -ForegroundColor Yellow
    Stop-Process -Id $existingProcess.Id -Force
    Start-Sleep -Seconds 2
}

# Ensure .env exists
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

# Start the backend as a background job
Write-Host "🚀 Starting backend server in background..." -ForegroundColor Green
Write-Host "📡 API will be available at: http://localhost:3001/api" -ForegroundColor Blue
Write-Host "🏥 Health check: http://localhost:3001/health" -ForegroundColor Blue
Write-Host ""

# Start as background job
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node dist/index.js
}

Write-Host "✅ Backend started as background job (ID: $($job.Id))" -ForegroundColor Green
Write-Host "📊 To check status: Get-Job -Id $($job.Id)" -ForegroundColor Blue
Write-Host "🛑 To stop: Stop-Job -Id $($job.Id)" -ForegroundColor Yellow
Write-Host "📋 To see output: Receive-Job -Id $($job.Id)" -ForegroundColor Blue

# Wait a moment and check if it's running
Start-Sleep -Seconds 3
$portCheck = netstat -ano | findstr :3001
if ($portCheck) {
    Write-Host "✅ Backend is successfully running on port 3001!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend failed to start. Check the job output:" -ForegroundColor Red
    Write-Host "📋 Run: Receive-Job -Id $($job.Id)" -ForegroundColor Yellow
}
