# =============================================================================
# KP5 Academy Environment Setup Script (PowerShell)
# =============================================================================
# This script helps you set up environment files for all parts of the application

Write-Host "🚀 Setting up KP5 Academy environment files..." -ForegroundColor Green

# Create backend .env file
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating backend\.env from env.example..." -ForegroundColor Yellow
    Copy-Item "backend\env.example" "backend\.env"
    Write-Host "✅ Backend .env file created" -ForegroundColor Green
    Write-Host "⚠️  Remember to update backend\.env with your actual values!" -ForegroundColor Red
} else {
    Write-Host "ℹ️  backend\.env already exists, skipping..." -ForegroundColor Blue
}

# Create web app .env.local file
if (-not (Test-Path "web\.env.local")) {
    Write-Host "📝 Creating web\.env.local from env.example..." -ForegroundColor Yellow
    Copy-Item "web\env.example" "web\.env.local"
    Write-Host "✅ Web app .env.local file created" -ForegroundColor Green
    Write-Host "⚠️  Remember to update web\.env.local with your actual values!" -ForegroundColor Red
} else {
    Write-Host "ℹ️  web\.env.local already exists, skipping..." -ForegroundColor Blue
}

# Create mobile app .env file
if (-not (Test-Path "mobile\.env")) {
    Write-Host "📝 Creating mobile\.env from env.example..." -ForegroundColor Yellow
    Copy-Item "mobile\env.example" "mobile\.env"
    Write-Host "✅ Mobile app .env file created" -ForegroundColor Green
    Write-Host "⚠️  Remember to update mobile\.env with your actual values!" -ForegroundColor Red
} else {
    Write-Host "ℹ️  mobile\.env already exists, skipping..." -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎉 Environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend\.env with your database and JWT secrets" -ForegroundColor White
Write-Host "2. Update web\.env.local with your API keys and configuration" -ForegroundColor White
Write-Host "3. Update mobile\.env with your Expo and API configuration" -ForegroundColor White
Write-Host "4. Never commit .env files to version control!" -ForegroundColor Red
Write-Host ""
Write-Host "🔐 Your JWT secrets are already set in backend\.env" -ForegroundColor Green
Write-Host "🌐 Use the master env.example file as a reference for all variables" -ForegroundColor Blue
