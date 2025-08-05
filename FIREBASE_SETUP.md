# 🔥 Firebase Setup Guide for KP5 Academy

This guide will help you set up Firebase for the KP5 Academy sports management platform.

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Firebase account
- Firebase CLI installed globally: `npm install -g firebase-tools`

## 🚀 Quick Setup

### 1. Automated Setup (Recommended)

Run the automated setup script:

```bash
npm run firebase:setup
```

This will prompt you for your Firebase configuration and create the necessary environment files.

### 2. Manual Setup

If you prefer to set up manually, follow these steps:

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "KP5 Academy"
4. Enable Google Analytics (optional)
5. Choose your Analytics account
6. Click "Create project"

#### Step 2: Add Web App

1. In your Firebase project, click "Add app" → "Web"
2. Register app with nickname: "KP5 Academy Web"
3. Copy the configuration object

#### Step 3: Add Mobile App

1. Click "Add app" → "Android"
2. Android package name: `com.kp5academy.app`
3. App nickname: "KP5 Academy Mobile"
4. Download `google-services.json` and place it in `mobile/` directory

#### Step 4: Add iOS App (Optional)

1. Click "Add app" → "iOS"
2. iOS bundle ID: `com.kp5academy.app`
3. App nickname: "KP5 Academy iOS"
4. Download `GoogleService-Info.plist` and place it in `mobile/` directory

#### Step 5: Enable Services

1. **Authentication**: Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in
   - Enable Phone authentication

2. **Firestore Database**: Go to Firestore Database → Create database
   - Start in test mode (we'll add security rules later)
   - Choose a location close to your users

3. **Storage**: Go to Storage → Get started
   - Start in test mode
   - Choose a location close to your users

4. **Functions**: Go to Functions → Get started
   - Choose a location close to your users

5. **Messaging**: Go to Cloud Messaging
   - Generate a VAPID key for web push notifications

#### Step 6: Configure Environment Files

Create `web/.env.local`:

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

Create `mobile/.env`:

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

#### Step 7: Update Mobile Configuration

Update `mobile/app.json` with your Firebase configuration:

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "your-api-key",
      "firebaseAuthDomain": "your-project.firebaseapp.com",
      "firebaseProjectId": "your-project-id",
      "firebaseStorageBucket": "your-project.appspot.com",
      "firebaseMessagingSenderId": "123456789",
      "firebaseAppId": "your-app-id",
      "firebaseVapidKey": "your-vapid-key"
    }
  }
}
```

## 🔧 Firebase CLI Setup

### 1. Login to Firebase

```bash
npm run firebase:login
```

### 2. Initialize Firebase

```bash
npm run firebase:init
```

Select the following options:
- Choose your project
- Enable Firestore
- Enable Functions
- Enable Storage
- Enable Hosting
- Use existing project

### 3. Deploy Firebase Configuration

```bash
npm run firebase:deploy
```

## 🧪 Development with Emulators

### 1. Start Emulators

```bash
npm run firebase:emulators
```

### 2. Enable Emulators in Development

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` in your environment files.

### 3. Access Emulator UI

Open [http://localhost:4000](http://localhost:4000) to access the Firebase Emulator UI.

## 📱 Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Add Firebase Files

- Place `google-services.json` in `mobile/` directory (Android)
- Place `GoogleService-Info.plist` in `mobile/` directory (iOS)

### 3. Start Development

```bash
npm run dev:mobile
```

## 🌐 Web App Setup

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Start Development

```bash
npm run dev:web
```

## 🔐 Security Rules

### 1. Firestore Rules

The Firestore security rules are already configured in `firebase/firestore.rules`.

### 2. Storage Rules

The Storage security rules are already configured in `firebase/storage.rules`.

### 3. Deploy Rules

```bash
firebase deploy --only firestore:rules,storage
```

## 🚀 Production Deployment

### 1. Build Applications

```bash
npm run build:web
npm run build:mobile
```

### 2. Deploy to Firebase

```bash
npm run firebase:deploy
```

### 3. Update Environment Variables

For production, update your environment variables with production values:

- Use production Firebase project
- Use production Stripe keys
- Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`

## 🛠️ Troubleshooting

### Common Issues

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

### Getting Help

- Check Firebase Console for project status
- Review Firebase documentation
- Check browser console for web app errors
- Check Expo logs for mobile app errors

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## 🔄 Next Steps

After setting up Firebase:

1. Implement Firebase Cloud Functions
2. Set up Stripe payment processing
3. Configure push notifications
4. Add real-time features
5. Implement offline support
6. Set up analytics and monitoring 