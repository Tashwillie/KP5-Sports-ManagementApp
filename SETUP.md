# KP5 Academy Sports Management Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase account

## 📱 Mobile App Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server:**
   ```bash
   npx expo start
   ```

3. **Run on device/simulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 🌐 Web App Setup

1. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Open http://localhost:3002 in your browser

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, Storage, and Functions

### 2. Configure Web App
1. Add a web app to your Firebase project
2. Copy the configuration object
3. Update `web/.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Configure Mobile App
1. Add an Android/iOS app to your Firebase project
2. Update `mobile/src/lib/firebase.ts` with your Firebase credentials

### 4. Deploy Firebase Rules
```bash
cd firebase
firebase deploy
```

## 🏗️ Project Structure

```
kp5-Academy/
├── web/                 # Next.js web application
├── mobile/              # React Native mobile app
├── shared/              # Shared TypeScript types and utilities
└── firebase/            # Firebase configuration and rules
```

## 🎯 Features

### ✅ Implemented
- Landing page with modern UI
- Authentication system
- User management dashboard
- Club and team management
- Event scheduling
- Tournament management
- Real-time messaging
- Payment integration
- Media management
- Public profiles

### 🔄 In Progress
- Firebase backend integration
- Real-time match data entry
- Push notifications
- Offline support

## 🛠️ Development

### Web App
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript
- **State Management:** Zustand + React Query

### Mobile App
- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **UI:** React Native Paper

### Backend
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions
- **Hosting:** Firebase Hosting

## 📝 Environment Variables

### Web App (.env.local)
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_APP_NAME=KP5 Academy
```

## 🚀 Deployment

### Web App
```bash
cd web
npm run build
npm run start
```

### Mobile App
```bash
cd mobile
npx expo build:android  # or build:ios
```

## 📞 Support

For issues or questions:
1. Check the Firebase console for backend issues
2. Review the browser console for web app errors
3. Check Expo logs for mobile app issues

## 🔐 Security

- All Firebase rules are configured in `firebase/firestore.rules`
- Authentication is handled by Firebase Auth
- Role-based access control is implemented
- Environment variables are used for sensitive data 