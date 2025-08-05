# 🚀 Firebase Cloud Functions Deployment Guide

## 📋 Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Node.js 18+** and npm 9+

3. **Firebase Project** created in Firebase Console

4. **Stripe Account** (for payments)

5. **Twilio Account** (for SMS)

6. **Gmail App Password** (for email)

## 🔧 Setup Steps

### 1. **Install Dependencies**
```bash
cd firebase/functions
npm install
```

### 2. **Configure Environment Variables**

Create a `.env` file in `firebase/functions/`:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# App Configuration
APP_URL=https://your-app-domain.com
APP_NAME=KP5 Academy

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true

# Environment
NODE_ENV=production
```

### 3. **Set Firebase Environment Variables**
```bash
firebase functions:config:set stripe.secret_key="sk_test_your-stripe-secret-key"
firebase functions:config:set stripe.webhook_secret="whsec_your-stripe-webhook-secret"
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"
firebase functions:config:set twilio.account_sid="your-twilio-account-sid"
firebase functions:config:set twilio.auth_token="your-twilio-auth-token"
firebase functions:config:set twilio.phone_number="+1234567890"
firebase functions:config:set app.url="https://your-app-domain.com"
firebase functions:config:set app.name="KP5 Academy"
```

### 4. **Build Functions**
```bash
npm run build
```

### 5. **Test Locally (Optional)**
```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, test functions
npm run serve
```

### 6. **Deploy Functions**
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName
```

## 🔐 Security Setup

### 1. **Firestore Security Rules**
Update `firebase/firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        (resource.data.role == 'super_admin' || resource.data.role == 'club_admin');
    }
    
    // Teams - members can read, admins can write
    match /teams/{teamId} {
      allow read: if request.auth != null && 
        (resource.data.members[request.auth.uid] != null || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'club_admin']);
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'club_admin'];
    }
    
    // Matches - authenticated users can read, referees/admins can write
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['super_admin', 'club_admin', 'referee'];
    }
  }
}
```

### 2. **Storage Security Rules**
Update `firebase/storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own profile pictures
    match /users/{userId}/profile.jpg {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Team media - team members can read, admins can write
    match /teams/{teamId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/teams/$(teamId)) &&
        get(/databases/$(database)/documents/teams/$(teamId)).data.members[request.auth.uid] != null;
    }
  }
}
```

## 🔗 External Service Setup

### 1. **Stripe Webhook**
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-region-your-project.cloudfunctions.net/handleStripeWebhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.created`, etc.
4. Copy webhook secret to environment variables

### 2. **Twilio Verify Service**
1. Go to Twilio Console > Verify
2. Create a new service
3. Copy service SID to environment variables

### 3. **Gmail App Password**
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate app password for "Mail"
4. Use app password in SMTP configuration

## 📊 Monitoring & Logs

### 1. **View Function Logs**
```bash
firebase functions:log
```

### 2. **Monitor Performance**
- Go to Firebase Console > Functions
- View execution times, memory usage, and errors

### 3. **Set Up Alerts**
- Configure error notifications in Firebase Console
- Set up monitoring for failed function executions

## 🧪 Testing

### 1. **Test Authentication Functions**
```bash
# Test user creation
curl -X POST "https://your-region-your-project.cloudfunctions.net/onUserCreated" \
  -H "Content-Type: application/json" \
  -d '{"uid": "test-user-id"}'
```

### 2. **Test Payment Functions**
```bash
# Test payment intent creation
curl -X POST "https://your-region-your-project.cloudfunctions.net/createPaymentIntent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{"amount": 1000, "currency": "usd"}'
```

### 3. **Test Notifications**
```bash
# Test push notification
curl -X POST "https://your-region-your-project.cloudfunctions.net/sendPushNotification" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{"userId": "user-id", "title": "Test", "body": "Test message"}'
```

## 🚨 Troubleshooting

### Common Issues:

1. **Function Timeout**
   - Increase timeout in function configuration
   - Optimize function code

2. **Memory Issues**
   - Increase memory allocation
   - Optimize data processing

3. **Cold Start Delays**
   - Use function warmup techniques
   - Consider function consolidation

4. **Permission Errors**
   - Check Firestore security rules
   - Verify user authentication

### Debug Commands:
```bash
# Check function status
firebase functions:list

# View function configuration
firebase functions:config:get

# Redeploy specific function
firebase deploy --only functions:functionName --force
```

## 📈 Performance Optimization

1. **Use Connection Pooling** for database connections
2. **Implement Caching** for frequently accessed data
3. **Batch Operations** for multiple database writes
4. **Optimize Dependencies** - remove unused packages
5. **Use Appropriate Memory** allocation for functions

## 🔄 CI/CD Integration

### GitHub Actions Example:
```yaml
name: Deploy Functions
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g firebase-tools
      - run: cd firebase/functions && npm install
      - run: cd firebase/functions && npm run build
      - run: firebase deploy --only functions --token ${{ secrets.FIREBASE_TOKEN }}
```

## 📞 Support

For issues with:
- **Firebase Functions**: Check Firebase documentation
- **Stripe Integration**: Contact Stripe support
- **Twilio Integration**: Contact Twilio support
- **Custom Logic**: Review function logs and error messages 