// Firebase Cloud Functions Configuration
export const config = {
  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'kp5-academy',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  // Email (Nodemailer)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: false,
  },

  // SMS (Twilio)
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // App
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    name: process.env.APP_NAME || 'KP5 Academy',
  },

  // Feature Flags
  features: {
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validation
export function validateConfig() {
  const required = [
    'stripe.secretKey',
    'stripe.webhookSecret',
    'email.user',
    'email.pass',
    'sms.accountSid',
    'sms.authToken',
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });

  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }

  return missing.length === 0;
} 