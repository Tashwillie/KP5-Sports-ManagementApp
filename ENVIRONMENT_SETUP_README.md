# 🌍 Environment Configuration Setup Guide

This guide explains how to set up environment variables for all parts of the KP5 Academy application.

## 📁 Environment Files Structure

```
kp5-Academy/
├── env.example                    # Master reference file (all variables)
├── backend/
│   ├── env.example              # Backend-specific variables
│   └── .env                     # Your actual backend config (create this)
├── web/
│   ├── env.example              # Web app-specific variables
│   └── .env.local               # Your actual web config (create this)
└── mobile/
    ├── env.example              # Mobile app-specific variables
    └── .env                     # Your actual mobile config (create this)
```

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

#### For Windows (PowerShell):
```powershell
.\setup-env.ps1
```

#### For macOS/Linux:
```bash
chmod +x setup-env.sh
./setup-env.sh
```

### Option 2: Manual Setup

1. **Backend**: Copy `backend/env.example` to `backend/.env`
2. **Web App**: Copy `web/env.example` to `web/.env.local`
3. **Mobile App**: Copy `mobile/env.example` to `mobile/.env`

## 🔐 Essential Configuration

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Secrets (already generated for you!)
JWT_SECRET=6b5095af764de1fd439e7fed149a30f
JWT_REFRESH_SECRET=80efda9297966fe9e0758378dfc1e89f3e8d804471b9e56d003b853c0f65505125cb16ef4dce48daf7c2cfa3ce59e0a3fd95d4082d94da0ca6fa52276d053347

# Server
PORT=3001
NODE_ENV=development
```

### Web App (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3002/ws

# App Configuration
NEXT_PUBLIC_APP_NAME="KP5 Academy"
NEXT_PUBLIC_DEBUG_MODE=true
```

### Mobile App (.env)
```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_WEBSOCKET_URL=ws://localhost:3002/ws

# App Configuration
EXPO_PUBLIC_APP_NAME="KP5 Academy"
EXPO_PUBLIC_DEBUG_MODE=true
```

## 🔑 Required API Keys & Services

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to both backend and frontend configs

### Stripe (Payments)
1. Sign up at [Stripe](https://stripe.com/)
2. Get your publishable and secret keys
3. Add to backend and frontend configs

### Firebase (Optional)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add web and mobile apps
4. Download configuration files

### Twilio (SMS)
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Add to backend config

## 🌍 Environment-Specific Configs

### Development
```bash
NODE_ENV=development
LOG_LEVEL=debug
DEBUG_MODE=true
```

### Staging
```bash
NODE_ENV=staging
LOG_LEVEL=warn
DEBUG_MODE=false
```

### Production
```bash
NODE_ENV=production
LOG_LEVEL=error
DEBUG_MODE=false
```

## 🔒 Security Best Practices

### ✅ DO:
- Use strong, unique secrets for each environment
- Rotate JWT secrets regularly in production
- Use environment-specific .env files
- Validate environment variables on startup
- Use secrets management services in production

### ❌ DON'T:
- Commit .env files to version control
- Use the same secrets across environments
- Share secrets in code or documentation
- Use weak or default passwords
- Store secrets in client-side code

## 🚨 Critical Security Variables

These variables must be set with strong, unique values:

```bash
# Backend
JWT_SECRET=your-very-long-random-string
JWT_REFRESH_SECRET=your-very-long-random-string
SESSION_SECRET=your-session-secret
BCRYPT_ROUNDS=12

# Database
DATABASE_URL=your-secure-database-connection-string

# OAuth
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CLIENT_ID=your-google-client-id
```

## 🔍 Environment Variable Validation

### Backend Validation
The backend automatically validates required environment variables on startup. Check the console for any missing variables.

### Frontend Validation
Next.js will show build errors if required `NEXT_PUBLIC_*` variables are missing.

### Mobile Validation
Expo will show runtime errors if required `EXPO_PUBLIC_*` variables are missing.

## 🛠 Troubleshooting

### Common Issues

1. **"JWT_SECRET is not defined"**
   - Ensure `backend/.env` exists and contains JWT_SECRET
   - Restart your backend server

2. **"API_BASE_URL is not defined"**
   - Check that `web/.env.local` exists
   - Ensure variable names start with `NEXT_PUBLIC_`

3. **"Environment variable not found"**
   - Verify the .env file is in the correct location
   - Check for typos in variable names
   - Restart your application

### Debug Commands

```bash
# Check if .env files exist
ls -la backend/.env
ls -la web/.env.local
ls -la mobile/.env

# View environment variables (backend)
cd backend && node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"

# Check Next.js environment (web)
cd web && npm run dev
# Look for environment variable warnings in console
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Node.js Environment Variables](https://nodejs.org/docs/latest/api/process.html#processenv)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all required variables are set
3. Ensure .env files are in the correct locations
4. Restart your applications after making changes
5. Check the console for specific error messages

---

**Remember**: Never commit your actual `.env` files to version control! Only the `.env.example` files should be tracked.
