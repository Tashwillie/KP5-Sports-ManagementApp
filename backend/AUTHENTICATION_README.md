# 🔐 KP5 Academy Authentication System

This document describes the complete authentication system implemented for the KP5 Academy sports management platform.

## 🚀 Features

### ✅ **Email/Password Authentication**
- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Password reset via email
- Account verification

### ✅ **OAuth Authentication**
- Google OAuth integration
- Automatic account creation/linking
- Profile synchronization
- Secure token handling

### ✅ **Phone Authentication**
- OTP-based phone verification
- Phone number login
- Account linking for existing users
- Rate limiting and expiration

### ✅ **Security Features**
- JWT token management
- Token refresh mechanism
- Role-based access control
- Input validation and sanitization
- Rate limiting protection

## 🏗️ Architecture

### **Database Models**

```sql
-- Users table (existing)
users (
  id, email, password, displayName, firstName, lastName,
  phone, role, isActive, emailVerified, phoneVerified,
  createdAt, updatedAt
)

-- OAuth accounts
oauth_accounts (
  id, userId, provider, providerAccountId,
  accessToken, refreshToken, expiresAt,
  scope, tokenType, createdAt, updatedAt
)

-- Phone verifications
phone_verifications (
  id, phone, code, expiresAt, verified,
  userId, createdAt
)

-- Password reset tokens
password_reset_tokens (
  id, userId, token, expiresAt, used, createdAt
)
```

### **Service Layer**

- **EmailService**: Handles password reset and verification emails
- **OAuthService**: Manages Google OAuth authentication
- **PhoneAuthService**: Handles phone verification and OTP
- **AuthController**: Main authentication logic

## 📡 API Endpoints

### **Authentication Routes**

```typescript
// User registration and login
POST /api/auth/register     - Create new user account
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
POST /api/auth/refresh      - Refresh JWT token

// Profile management
GET  /api/auth/me           - Get current user
PUT  /api/auth/profile      - Update user profile

// Password management
POST /api/auth/forgot-password  - Request password reset
POST /api/auth/reset-password   - Reset password with token

// OAuth authentication
POST /api/auth/google           - Google OAuth login

// Phone authentication
POST /api/auth/phone/send-otp      - Send OTP to phone
POST /api/auth/phone/verify-otp   - Verify OTP and login
POST /api/auth/phone/resend-otp   - Resend OTP
POST /api/auth/phone/link         - Link phone to existing user

// OAuth management
GET  /api/auth/oauth/accounts     - Get user's OAuth accounts
POST /api/auth/oauth/unlink       - Unlink OAuth account
```

## 🔧 Setup Instructions

### **1. Environment Configuration**

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kp5_academy"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3003

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@kp5academy.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
BCRYPT_ROUNDS=12
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Database Setup**

```bash
# Create new authentication tables
node scripts/migrate-auth.js

# Or use Prisma migrations
npx prisma migrate dev --name add_auth_tables
npx prisma generate
```

### **4. Start the Server**

```bash
npm run dev
```

## 🧪 Testing

### **Run Comprehensive Tests**

```bash
node test-auth-complete.js
```

### **Test Individual Features**

```bash
# Test basic authentication
node test-auth.js

# Test database connection
node test-db.js

# Test environment variables
node test-env.js
```

## 🔐 OAuth Setup

### **Google OAuth Configuration**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` file

### **Frontend Integration**

```typescript
// Example Google OAuth login
const handleGoogleLogin = async (googleToken: string) => {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: googleToken })
    });
    
    const data = await response.json();
    if (data.success) {
      // Handle successful login
      localStorage.setItem('token', data.data.token);
    }
  } catch (error) {
    console.error('Google login failed:', error);
  }
};
```

## 📱 Phone Authentication

### **SMS Service Integration**

Currently, OTP codes are logged to the console. For production:

1. **Twilio**: Integrate with Twilio SMS API
2. **AWS SNS**: Use Amazon Simple Notification Service
3. **Custom SMS Gateway**: Implement your own SMS service

### **Example SMS Integration**

```typescript
// In phoneAuthService.ts
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async sendSMS(phone: string, message: string) {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    logger.error('SMS sending failed:', error);
    return false;
  }
}
```

## 🔒 Security Considerations

### **JWT Token Security**
- Tokens expire after 24 hours
- Refresh tokens for extended sessions
- Secure token storage (httpOnly cookies recommended)

### **Password Security**
- Bcrypt hashing with configurable rounds
- Strong password requirements
- Rate limiting on login attempts

### **OAuth Security**
- Verify OAuth tokens server-side
- Store minimal OAuth data
- Secure token handling

### **Phone Verification**
- OTP expiration (10 minutes)
- Rate limiting on OTP requests
- Secure OTP generation

## 🚀 Production Deployment

### **Environment Variables**
- Use strong, unique secrets for JWT
- Configure production SMTP settings
- Set up production OAuth credentials
- Enable HTTPS in production

### **Database Security**
- Use connection pooling
- Implement database backups
- Monitor database performance

### **Monitoring**
- Log authentication attempts
- Monitor failed login attempts
- Track OAuth usage patterns

## 📚 API Documentation

### **Request/Response Examples**

#### **User Registration**
```typescript
// Request
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "PLAYER"
}

// Response
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token-here"
  }
}
```

#### **Google OAuth Login**
```typescript
// Request
POST /api/auth/google
{
  "idToken": "google-id-token-here"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token-here",
    "isNewUser": false
  }
}
```

## 🆘 Troubleshooting

### **Common Issues**

1. **Database Connection Errors**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database permissions

2. **OAuth Errors**
   - Verify Google OAuth credentials
   - Check redirect URIs configuration
   - Ensure Google+ API is enabled

3. **Email Sending Issues**
   - Verify SMTP credentials
   - Check firewall/network settings
   - Test SMTP connection

4. **Phone Verification Issues**
   - Check phone number format
   - Verify OTP expiration
   - Check server logs for OTP codes

### **Debug Mode**

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## 📞 Support

For authentication system support:
- Check server logs for detailed error messages
- Verify environment configuration
- Test individual endpoints with provided test scripts
- Review this documentation for setup instructions

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: KP5 Academy Development Team
