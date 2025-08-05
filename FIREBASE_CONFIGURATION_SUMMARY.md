# 🔥 Firebase Configuration Setup - Complete

## ✅ What's Been Implemented

### 1. **Environment Configuration Files**
- ✅ `web/env.example` - Template for web app environment variables
- ✅ `mobile/env.example` - Template for mobile app environment variables
- ✅ `scripts/setup-firebase.js` - Automated setup script

### 2. **Firebase Configuration Files**
- ✅ `web/src/lib/firebase.ts` - Updated with proper environment validation and emulator support
- ✅ `mobile/src/lib/firebase.ts` - Updated with Expo Constants support and emulator configuration
- ✅ `shared/src/utils/firebase.ts` - Refactored to provide types and utilities without direct Firebase imports

### 3. **Mobile App Configuration**
- ✅ `mobile/app.json` - Updated with Firebase plugins and configuration
- ✅ Added support for Google Services files (Android/iOS)

### 4. **Development Scripts**
- ✅ `package.json` - Added Firebase-related npm scripts
- ✅ `FIREBASE_SETUP.md` - Comprehensive setup guide
- ✅ Automated setup script with interactive prompts

### 5. **Features Implemented**

#### **Environment Validation**
- Automatic validation of required Firebase environment variables
- Clear error messages for missing configuration
- Support for both development and production environments

#### **Emulator Support**
- Full Firebase emulator suite integration
- Automatic connection to Auth, Firestore, Storage, and Functions emulators
- Environment-based emulator configuration

#### **Push Notifications**
- Firebase Cloud Messaging (FCM) setup
- VAPID key configuration
- Cross-platform notification support

#### **Mobile App Integration**
- Expo Constants integration for configuration
- Support for both Android and iOS Firebase files
- Development and production environment handling

## 🚀 How to Use

### **Quick Start (Recommended)**

1. **Run the automated setup:**
   ```bash
   npm run firebase:setup
   ```

2. **Follow the prompts to enter your Firebase configuration**

3. **Start development:**
   ```bash
   npm run dev
   ```

### **Manual Setup**

1. **Create Firebase project** in [Firebase Console](https://console.firebase.google.com/)

2. **Copy environment templates:**
   ```bash
   cp web/env.example web/.env.local
   cp mobile/env.example mobile/.env
   ```

3. **Update configuration files** with your Firebase project details

4. **Add Firebase files to mobile directory:**
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)

## 🔧 Configuration Options

### **Environment Variables**

#### **Web App (.env.local)**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase VAPID Key for Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Emulator Configuration (Development Only)
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=8080
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST=9199
NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST=5001

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_APP_NAME=KP5 Academy
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT=true

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### **Mobile App (.env)**
```env
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id

# Firebase VAPID Key for Push Notifications
FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Emulator Configuration (Development Only)
USE_FIREBASE_EMULATORS=false
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_FIRESTORE_EMULATOR_HOST=8080
FIREBASE_STORAGE_EMULATOR_HOST=9199
FIREBASE_FUNCTIONS_EMULATOR_HOST=5001

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# App Configuration
APP_URL=http://localhost:3002
APP_NAME=KP5 Academy
APP_VERSION=1.0.0

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_OFFLINE_SUPPORT=true

# External Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SENTRY_DSN=your-sentry-dsn
```

### **Available Scripts**

```bash
# Firebase Setup
npm run firebase:setup          # Interactive Firebase configuration
npm run firebase:init           # Initialize Firebase project
npm run firebase:login          # Login to Firebase
npm run firebase:use            # Switch Firebase projects
npm run firebase:emulators      # Start Firebase emulators
npm run firebase:deploy         # Deploy to Firebase

# Development
npm run dev                     # Start all services (web + mobile + emulators)
npm run dev:web                 # Start web app only
npm run dev:mobile              # Start mobile app only

# Build
npm run build:web               # Build web app
npm run build:mobile            # Build mobile app

# Utilities
npm run setup                   # Install all dependencies
npm run setup:firebase          # Setup Firebase configuration
npm run clean                   # Clean build artifacts
npm run reset                   # Clean and reinstall everything
```

## 🧪 Development with Emulators

### **Enable Emulators**
Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` in your environment files.

### **Start Emulators**
```bash
npm run firebase:emulators
```

### **Access Emulator UI**
Open [http://localhost:4000](http://localhost:4000) to access the Firebase Emulator UI.

## 🔐 Security Features

### **Environment Validation**
- Automatic validation of required Firebase configuration
- Clear error messages for missing environment variables
- Type-safe configuration handling

### **Emulator Support**
- Full local development environment
- Isolated testing without affecting production data
- Real-time emulator status logging

### **Cross-Platform Support**
- Web app (Next.js) configuration
- Mobile app (React Native + Expo) configuration
- Shared utilities and types

## 📱 Mobile App Features

### **Expo Integration**
- Firebase plugins configured in `app.json`
- Support for Google Services files
- Environment-based configuration

### **Push Notifications**
- FCM integration ready
- VAPID key configuration
- Cross-platform notification support

## 🌐 Web App Features

### **Next.js Integration**
- Environment variable validation
- Development and production configurations
- Firebase service initialization

### **Real-time Features**
- Firestore real-time listeners
- Authentication state management
- Storage integration

## 🔄 Next Steps

After completing Firebase configuration:

1. **Implement Firebase Cloud Functions**
   - Payment processing with Stripe
   - User role management
   - Push notification sending

2. **Set up Authentication**
   - Email/password authentication
   - Google OAuth integration
   - Phone authentication

3. **Configure Security Rules**
   - Firestore security rules
   - Storage security rules
   - Role-based access control

4. **Add Real-time Features**
   - Live match data entry
   - Real-time chat
   - Live score updates

5. **Implement Push Notifications**
   - FCM token management
   - Notification sending
   - Cross-platform support

## 🛠️ Troubleshooting

### **Common Issues**

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the correct directory
   - Restart your development server
   - Check for typos in variable names

2. **Firebase Initialization Errors**
   - Verify your Firebase configuration
   - Check that all required environment variables are set
   - Ensure Firebase project is properly configured

3. **Emulator Connection Issues**
   - Check that emulators are running
   - Verify emulator ports in configuration
   - Restart development servers

4. **Mobile App Issues**
   - Verify `google-services.json` is in the correct location
   - Check Expo configuration
   - Clear Expo cache: `expo r -c`

### **Getting Help**

- Check Firebase Console for project status
- Review Firebase documentation
- Check browser console for web app errors
- Check Expo logs for mobile app errors

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed setup guide

---

**🎉 Firebase configuration is now complete and ready for development!** 