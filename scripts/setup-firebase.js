#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupFirebase() {
  console.log('🔥 Firebase Configuration Setup for KP5 Academy\n');
  
  try {
    // Get Firebase configuration
    const firebaseConfig = {};
    
    firebaseConfig.apiKey = await question('Enter your Firebase API Key: ');
    firebaseConfig.authDomain = await question('Enter your Firebase Auth Domain: ');
    firebaseConfig.projectId = await question('Enter your Firebase Project ID: ');
    firebaseConfig.storageBucket = await question('Enter your Firebase Storage Bucket: ');
    firebaseConfig.messagingSenderId = await question('Enter your Firebase Messaging Sender ID: ');
    firebaseConfig.appId = await question('Enter your Firebase App ID: ');
    
    const vapidKey = await question('Enter your Firebase VAPID Key (optional, press Enter to skip): ');
    const stripePublishableKey = await question('Enter your Stripe Publishable Key (optional, press Enter to skip): ');
    const stripeSecretKey = await question('Enter your Stripe Secret Key (optional, press Enter to skip): ');
    
    // Create web .env.local file
    const webEnvContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseConfig.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${firebaseConfig.appId}

# Firebase VAPID Key for Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=${vapidKey || 'your-vapid-key'}

# Firebase Emulator Configuration (Development Only)
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=8080
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST=9199
NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST=5001

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey || 'pk_test_your-stripe-publishable-key'}
STRIPE_SECRET_KEY=${stripeSecretKey || 'sk_test_your-stripe-secret-key'}
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
`;

    // Create mobile .env file
    const mobileEnvContent = `# Firebase Configuration
FIREBASE_API_KEY=${firebaseConfig.apiKey}
FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
FIREBASE_APP_ID=${firebaseConfig.appId}

# Firebase VAPID Key for Push Notifications
FIREBASE_VAPID_KEY=${vapidKey || 'your-vapid-key'}

# Firebase Emulator Configuration (Development Only)
USE_FIREBASE_EMULATORS=false
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_FIRESTORE_EMULATOR_HOST=8080
FIREBASE_STORAGE_EMULATOR_HOST=9199
FIREBASE_FUNCTIONS_EMULATOR_HOST=5001

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=${stripePublishableKey || 'pk_test_your-stripe-publishable-key'}

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
`;

    // Write files
    fs.writeFileSync(path.join(__dirname, '../web/.env.local'), webEnvContent);
    fs.writeFileSync(path.join(__dirname, '../mobile/.env'), mobileEnvContent);
    
    console.log('\n✅ Firebase configuration files created successfully!');
    console.log('\n📁 Files created:');
    console.log('  - web/.env.local');
    console.log('  - mobile/.env');
    
    console.log('\n📋 Next steps:');
    console.log('  1. Update mobile/app.json with your Firebase configuration');
    console.log('  2. Add google-services.json to mobile/ directory (for Android)');
    console.log('  3. Add GoogleService-Info.plist to mobile/ directory (for iOS)');
    console.log('  4. Run "npm run dev:web" to start the web app');
    console.log('  5. Run "npm run dev:mobile" to start the mobile app');
    
  } catch (error) {
    console.error('❌ Error setting up Firebase configuration:', error);
  } finally {
    rl.close();
  }
}

setupFirebase(); 