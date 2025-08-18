# 🚀 Backend Server Management Guide

## Quick Start Options

### Option 1: Use the PowerShell Script (Recommended)
```powershell
.\start-server.ps1
```

### Option 2: Use nodemon with auto-restart
```bash
npm run dev:watch
```

### Option 3: Standard development mode
```bash
npm run dev
```

## 🛠️ What We Fixed

### 1. **Port Conflicts**
- The script automatically detects and resolves port conflicts
- Kills existing processes on port 3001 before starting

### 2. **Server Stability**
- Added graceful shutdown handling
- Better error handling for uncaught exceptions
- Process monitoring and recovery

### 3. **Development Experience**
- Auto-restart on file changes with nodemon
- Better logging and error messages
- Health check endpoint at `/health`

## 🔧 Server Commands

### Start Server
```bash
npm run dev:watch    # With auto-restart (recommended)
npm run dev          # Standard mode
npm start            # Production mode
```

### Manual Restart (when using nodemon)
- Type `rs` in the terminal to restart manually
- Press `Ctrl+C` to stop the server

### Check Server Status
```bash
# Check if server is running
netstat -ano | findstr :3001

# Test health endpoint
curl http://localhost:3001/health
```

## 🚨 Troubleshooting

### Server Won't Start
1. **Port in use**: Run `.\start-server.ps1` to auto-resolve
2. **Missing .env**: Copy from `env.example` to `.env`
3. **Dependencies**: Run `npm install`

### Server Keeps Crashing
1. **Check logs**: Look for error messages in terminal
2. **Database connection**: Ensure PostgreSQL is running
3. **Environment variables**: Verify `.env` file is correct

### Server Stops Unexpectedly
1. **Use nodemon**: `npm run dev:watch` for auto-restart
2. **Check process**: Use Task Manager or `netstat` to see if it's still running
3. **Restart manually**: Use the PowerShell script

## 📁 File Structure

```
backend/
├── start-server.ps1          # PowerShell startup script
├── nodemon.json              # Nodemon configuration
├── package.json              # Dependencies and scripts
├── src/
│   └── index.ts             # Main server file (enhanced)
└── .env                      # Environment variables
```

## 🔄 Auto-Restart Features

- **File watching**: Automatically restarts when you save changes
- **Error recovery**: Handles crashes gracefully
- **Port management**: Automatically resolves conflicts
- **Environment validation**: Checks for required files

## 💡 Best Practices

1. **Always use `.\start-server.ps1`** for the most reliable startup
2. **Keep the terminal open** when running the server
3. **Use `npm run dev:watch`** during development for auto-restart
4. **Check the `/health` endpoint** to verify server status
5. **Monitor the console** for any error messages

## 🆘 Emergency Restart

If the server becomes unresponsive:

1. **Close all terminals** running the server
2. **Kill any processes** on port 3001:
   ```powershell
   netstat -ano | findstr :3001
   Stop-Process -Id <PID> -Force
   ```
3. **Run the startup script**:
   ```powershell
   .\start-server.ps1
   ```

---

**Your backend server should now be much more stable and easier to manage!** 🎉
