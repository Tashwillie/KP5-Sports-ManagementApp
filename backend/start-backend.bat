@echo off
echo 🚀 Starting KP5 Academy Backend Server...
echo.

REM Check if backend is already running
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Backend is already running on port 3001
    echo 🛑 Stopping existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM Check if .env exists, create if not
if not exist ".env" (
    echo ❌ .env file not found. Creating default configuration...
    (
        echo DATABASE_URL="postgresql://kp5_user:kp5_password@localhost:5432/kp5_academy"
        echo JWT_SECRET=6b5095af764de1fd439e7fed149a30f
        echo JWT_REFRESH_SECRET=80efda9297966fe9e0758378dfc1e89f3e8d804471b9e56d003b853c0f65505125cb16ef4dce48daf7c2cfa3ce59e0a3fd95d4082d94da0ca6fa52276d053347
        echo FRONTEND_URL=http://localhost:3003
        echo PORT=3001
        echo NODE_ENV=development
        echo BCRYPT_ROUNDS=12
    ) > .env
    echo ✅ .env file created
)

REM Check if dist folder exists
if not exist "dist\index.js" (
    echo ❌ Compiled backend not found. Building first...
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
    
    echo 🔨 Building backend...
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Build failed! Please check for errors.
        pause
        exit /b 1
    )
)

echo 🚀 Starting backend server on port 3001...
echo 📡 API will be available at: http://localhost:3001/api
echo 🏥 Health check: http://localhost:3001/health
echo ⏹️  Press Ctrl+C to stop the server
echo.

REM Start the backend server
node dist/index.js

echo.
echo ❌ Backend server stopped. Press any key to exit...
pause >nul
