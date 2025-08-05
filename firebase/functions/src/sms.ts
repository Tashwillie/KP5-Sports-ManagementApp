import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as twilio from 'twilio';
import { config } from './config';

const db = admin.firestore();

// Initialize Twilio client
const twilioClient = twilio(config.sms.accountSid, config.sms.authToken);

export const smsFunctions = {
  // Send SMS
  sendSMS: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { phoneNumber, message } = data;

      if (!phoneNumber || !message) {
        throw new functions.https.HttpsError('invalid-argument', 'Phone number and message are required');
      }

      // Send SMS
      const smsResponse = await twilioClient.messages.create({
        body: message,
        from: config.sms.phoneNumber,
        to: phoneNumber
      });

      // Log SMS
      await db.collection('sms').add({
        to: phoneNumber,
        message,
        status: smsResponse.status,
        sid: smsResponse.sid,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, sid: smsResponse.sid };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send SMS');
    }
  }),

  // Send bulk SMS
  sendBulkSMS: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { phoneNumbers, message } = data;

      if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Phone numbers array is required');
      }

      if (!message) {
        throw new functions.https.HttpsError('invalid-argument', 'Message is required');
      }

      // Check permissions
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !['super_admin', 'club_admin'].includes(userData.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      const results = [];

      for (const phoneNumber of phoneNumbers) {
        try {
          const smsResponse = await twilioClient.messages.create({
            body: message,
            from: config.sms.phoneNumber,
            to: phoneNumber
          });

          results.push({
            phoneNumber,
            success: true,
            sid: smsResponse.sid
          });

          // Log individual SMS
          await db.collection('sms').add({
            to: phoneNumber,
            message,
            status: smsResponse.status,
            sid: smsResponse.sid,
            sentBy: context.auth.uid,
            type: 'bulk',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } catch (error) {
          results.push({
            phoneNumber,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send bulk SMS');
    }
  }),

  // Verify phone number
  verifyPhoneNumber: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { phoneNumber } = data;

      if (!phoneNumber) {
        throw new functions.https.HttpsError('invalid-argument', 'Phone number is required');
      }

      // Create verification
      const verification = await twilioClient.verify.v2
        .services(config.sms.verifyServiceSid || 'default')
        .verifications.create({
          to: phoneNumber,
          channel: 'sms'
        });

      return { success: true, status: verification.status };
    } catch (error) {
      console.error('Error verifying phone number:', error);
      throw new functions.https.HttpsError('internal', 'Failed to verify phone number');
    }
  }),

  // Send event reminder SMS
  sendEventReminderSMS: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { phoneNumber, eventName, eventDate, eventLocation } = data;

      if (!phoneNumber || !eventName || !eventDate) {
        throw new functions.https.HttpsError('invalid-argument', 'Phone number, event name, and date are required');
      }

      const message = `Reminder: ${eventName} on ${new Date(eventDate).toLocaleDateString()} at ${new Date(eventDate).toLocaleTimeString()}. ${eventLocation ? `Location: ${eventLocation}` : ''}`;

      // Send SMS
      const smsResponse = await twilioClient.messages.create({
        body: message,
        from: config.sms.phoneNumber,
        to: phoneNumber
      });

      // Log SMS
      await db.collection('sms').add({
        to: phoneNumber,
        message,
        status: smsResponse.status,
        sid: smsResponse.sid,
        type: 'event_reminder',
        eventName,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, sid: smsResponse.sid };
    } catch (error) {
      console.error('Error sending event reminder SMS:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send event reminder SMS');
    }
  })
}; 