import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { config } from './config';

const db = admin.firestore();

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const emailFunctions = {
  // Send welcome email
  sendWelcomeEmail: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { email, displayName } = data;

      if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
      }

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.user}>`,
        to: email,
        subject: `Welcome to ${config.app.name}!`,
        html: `
          <h1>Welcome to ${config.app.name}!</h1>
          <p>Hi ${displayName || 'there'},</p>
          <p>Thank you for joining our sports management platform. We're excited to have you on board!</p>
          <p>Get started by:</p>
          <ul>
            <li>Completing your profile</li>
            <li>Joining a team or club</li>
            <li>Exploring upcoming events</li>
          </ul>
          <p>Best regards,<br>The ${config.app.name} Team</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Log email
      await db.collection('emails').add({
        to: email,
        subject: mailOptions.subject,
        type: 'welcome',
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send welcome email');
    }
  }),

  // Send event invitation
  sendEventInvitation: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { email, eventName, eventDate, eventLocation, eventDescription } = data;

      if (!email || !eventName || !eventDate) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, event name, and date are required');
      }

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.user}>`,
        to: email,
        subject: `You're invited: ${eventName}`,
        html: `
          <h1>You're Invited!</h1>
          <h2>${eventName}</h2>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(eventDate).toLocaleTimeString()}</p>
          ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
          ${eventDescription ? `<p><strong>Description:</strong> ${eventDescription}</p>` : ''}
          <p>Please RSVP to confirm your attendance.</p>
          <p>Best regards,<br>The ${config.app.name} Team</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Log email
      await db.collection('emails').add({
        to: email,
        subject: mailOptions.subject,
        type: 'event_invitation',
        eventName,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending event invitation:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send event invitation');
    }
  }),

  // Send payment confirmation
  sendPaymentConfirmation: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { email, amount, description, transactionId } = data;

      if (!email || !amount || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, amount, and description are required');
      }

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.user}>`,
        to: email,
        subject: 'Payment Confirmation',
        html: `
          <h1>Payment Confirmation</h1>
          <p>Thank you for your payment!</p>
          <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
          <p><strong>Description:</strong> ${description}</p>
          ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
          <p>Your payment has been processed successfully.</p>
          <p>Best regards,<br>The ${config.app.name} Team</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Log email
      await db.collection('emails').add({
        to: email,
        subject: mailOptions.subject,
        type: 'payment_confirmation',
        amount,
        transactionId,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send payment confirmation');
    }
  }),

  // Send registration confirmation
  sendRegistrationConfirmation: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { email, eventName, eventDate, registrationId } = data;

      if (!email || !eventName || !eventDate) {
        throw new functions.https.HttpsError('invalid-argument', 'Email, event name, and date are required');
      }

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.user}>`,
        to: email,
        subject: `Registration Confirmed: ${eventName}`,
        html: `
          <h1>Registration Confirmed!</h1>
          <h2>${eventName}</h2>
          <p>Your registration has been confirmed.</p>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(eventDate).toLocaleTimeString()}</p>
          ${registrationId ? `<p><strong>Registration ID:</strong> ${registrationId}</p>` : ''}
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>The ${config.app.name} Team</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Log email
      await db.collection('emails').add({
        to: email,
        subject: mailOptions.subject,
        type: 'registration_confirmation',
        eventName,
        registrationId,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending registration confirmation:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send registration confirmation');
    }
  }),

  // Send password reset
  sendPasswordReset: functions.https.onCall(async (data, context) => {
    try {
      const { email, resetLink } = data;

      if (!email || !resetLink) {
        throw new functions.https.HttpsError('invalid-argument', 'Email and reset link are required');
      }

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.user}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your ${config.app.name} account.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The ${config.app.name} Team</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // Log email
      await db.collection('emails').add({
        to: email,
        subject: mailOptions.subject,
        type: 'password_reset',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send password reset email');
    }
  }),

  // Send bulk email
  sendBulkEmail: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { emails, subject, htmlContent } = data;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Emails array is required');
      }

      if (!subject || !htmlContent) {
        throw new functions.https.HttpsError('invalid-argument', 'Subject and HTML content are required');
      }

      // Check permissions
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !['super_admin', 'club_admin'].includes(userData.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      const mailOptions = {
        from: `"${config.app.name}" <${config.email.user}>`,
        to: emails.join(', '),
        subject,
        html: htmlContent
      };

      await transporter.sendMail(mailOptions);

      // Log bulk email
      await db.collection('emails').add({
        to: emails,
        subject,
        type: 'bulk',
        recipientCount: emails.length,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, sentTo: emails.length };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send bulk email');
    }
  })
}; 