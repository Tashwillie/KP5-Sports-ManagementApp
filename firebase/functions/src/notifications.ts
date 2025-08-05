import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const notificationFunctions = {
  // Send push notification to a specific user
  sendPushNotification: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { userId, title, body, data: notificationData = {} } = data;

      if (!userId || !title || !body) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID, title, and body are required');
      }

      // Get user's FCM token
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData || !userData.fcmToken) {
        throw new functions.https.HttpsError('not-found', 'User FCM token not found');
      }

      // Send notification
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...notificationData,
          timestamp: new Date().toISOString()
        },
        token: userData.fcmToken
      };

      const response = await admin.messaging().send(message);

      // Log notification
      await db.collection('notifications').add({
        userId,
        title,
        body,
        data: notificationData,
        type: 'push',
        status: 'sent',
        fcmResponse: response,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send push notification');
    }
  }),

  // Send bulk notifications to multiple users
  sendBulkNotifications: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { userIds, title, body, data: notificationData = {} } = data;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'User IDs array is required');
      }

      if (!title || !body) {
        throw new functions.https.HttpsError('invalid-argument', 'Title and body are required');
      }

      // Get FCM tokens for all users
      const userDocs = await Promise.all(
        userIds.map(userId => db.collection('users').doc(userId).get())
      );

      const tokens = userDocs
        .map(doc => doc.data()?.fcmToken)
        .filter(token => token);

      if (tokens.length === 0) {
        throw new functions.https.HttpsError('not-found', 'No valid FCM tokens found');
      }

      // Send bulk notification
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...notificationData,
          timestamp: new Date().toISOString()
        },
        tokens
      };

      const response = await admin.messaging().sendMulticast(message);

      // Log notifications
      const notifications = userIds.map(userId => ({
        userId,
        title,
        body,
        data: notificationData,
        type: 'bulk_push',
        status: response.successCount > 0 ? 'sent' : 'failed',
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }));

      await Promise.all(
        notifications.map(notification => 
          db.collection('notifications').add(notification)
        )
      );

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send bulk notifications');
    }
  }),

  // Subscribe user to a topic
  subscribeToTopic: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { topic } = data;

      if (!topic) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic is required');
      }

      // Get user's FCM token
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !userData.fcmToken) {
        throw new functions.https.HttpsError('not-found', 'User FCM token not found');
      }

      // Subscribe to topic
      await admin.messaging().subscribeToTopic(userData.fcmToken, topic);

      // Update user's topic subscriptions
      await db.collection('users').doc(context.auth.uid).update({
        topicSubscriptions: admin.firestore.FieldValue.arrayUnion(topic),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw new functions.https.HttpsError('internal', 'Failed to subscribe to topic');
    }
  }),

  // Unsubscribe user from a topic
  unsubscribeFromTopic: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { topic } = data;

      if (!topic) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic is required');
      }

      // Get user's FCM token
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !userData.fcmToken) {
        throw new functions.https.HttpsError('not-found', 'User FCM token not found');
      }

      // Unsubscribe from topic
      await admin.messaging().unsubscribeFromTopic(userData.fcmToken, topic);

      // Update user's topic subscriptions
      await db.collection('users').doc(context.auth.uid).update({
        topicSubscriptions: admin.firestore.FieldValue.arrayRemove(topic),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw new functions.https.HttpsError('internal', 'Failed to unsubscribe from topic');
    }
  }),

  // Send notification to topic
  sendTopicNotification: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { topic, title, body, data: notificationData = {} } = data;

      if (!topic || !title || !body) {
        throw new functions.https.HttpsError('invalid-argument', 'Topic, title, and body are required');
      }

      // Check if user has permission to send topic notifications
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !['super_admin', 'club_admin', 'coach'].includes(userData.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      // Send topic notification
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...notificationData,
          timestamp: new Date().toISOString()
        },
        topic
      };

      const response = await admin.messaging().send(message);

      // Log notification
      await db.collection('notifications').add({
        topic,
        title,
        body,
        data: notificationData,
        type: 'topic',
        status: 'sent',
        fcmResponse: response,
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send topic notification');
    }
  }),

  // Triggered when a notification is sent
  onNotificationSent: functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
      try {
        const notificationData = snap.data();
        const notificationId = context.params.notificationId;

        console.log(`Notification sent: ${notificationId}`);

        // Update notification status
        await db.collection('notifications').doc(notificationId).update({
          status: 'delivered',
          deliveredAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Track notification metrics
        await updateNotificationMetrics(notificationData);

        console.log(`Notification ${notificationId} processed successfully`);
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    }),

  // Schedule a notification for later
  scheduleNotification: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { userId, title, body, scheduledAt, data: notificationData = {} } = data;

      if (!userId || !title || !body || !scheduledAt) {
        throw new functions.https.HttpsError('invalid-argument', 'User ID, title, body, and scheduled time are required');
      }

      // Create scheduled notification
      const scheduledNotification = {
        userId,
        title,
        body,
        data: notificationData,
        type: 'scheduled',
        status: 'scheduled',
        scheduledAt: new Date(scheduledAt),
        sentBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('scheduledNotifications').add(scheduledNotification);

      return { success: true, scheduledNotificationId: docRef.id };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw new functions.https.HttpsError('internal', 'Failed to schedule notification');
    }
  }),

  // Update user's FCM token
  updateFCMToken: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { fcmToken } = data;

      if (!fcmToken) {
        throw new functions.https.HttpsError('invalid-argument', 'FCM token is required');
      }

      // Update user's FCM token
      await db.collection('users').doc(context.auth.uid).update({
        fcmToken,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw new functions.https.HttpsError('internal', 'Failed to update FCM token');
    }
  }),

  // Get user's notification history
  getNotificationHistory: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { limit = 50, offset = 0 } = data;

      // Get user's notifications
      const notificationsSnapshot = await db.collection('notifications')
        .where('userId', '==', context.auth.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { notifications };
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw new functions.https.HttpsError('internal', 'Failed to get notification history');
    }
  }),

  // Mark notification as read
  markNotificationAsRead: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { notificationId } = data;

      if (!notificationId) {
        throw new functions.https.HttpsError('invalid-argument', 'Notification ID is required');
      }

      // Mark notification as read
      await db.collection('notifications').doc(notificationId).update({
        readAt: admin.firestore.FieldValue.serverTimestamp(),
        isRead: true
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new functions.https.HttpsError('internal', 'Failed to mark notification as read');
    }
  })
};

// Helper functions
async function updateNotificationMetrics(notificationData: any) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const metricsRef = db.collection('notificationMetrics').doc(today);

    await metricsRef.set({
      totalSent: admin.firestore.FieldValue.increment(1),
      byType: {
        [notificationData.type]: admin.firestore.FieldValue.increment(1)
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating notification metrics:', error);
  }
}

// Scheduled function to send scheduled notifications
export const processScheduledNotifications = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    try {
      const now = new Date();
      
      // Get scheduled notifications that are due
      const scheduledNotificationsSnapshot = await db.collection('scheduledNotifications')
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<=', now)
        .limit(100)
        .get();

      const notifications = scheduledNotificationsSnapshot.docs;

      for (const doc of notifications) {
        const notification = doc.data();

        try {
          // Get user's FCM token
          const userDoc = await db.collection('users').doc(notification.userId).get();
          const userData = userDoc.data();

          if (userData && userData.fcmToken) {
            // Send notification
            const message = {
              notification: {
                title: notification.title,
                body: notification.body
              },
              data: {
                ...notification.data,
                timestamp: new Date().toISOString()
              },
              token: userData.fcmToken
            };

            const response = await admin.messaging().send(message);

            // Update scheduled notification status
            await doc.ref.update({
              status: 'sent',
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              fcmResponse: response
            });

            // Create notification record
            await db.collection('notifications').add({
              userId: notification.userId,
              title: notification.title,
              body: notification.body,
              data: notification.data,
              type: 'scheduled',
              status: 'sent',
              fcmResponse: response,
              scheduledNotificationId: doc.id,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          } else {
            // Mark as failed if no FCM token
            await doc.ref.update({
              status: 'failed',
              error: 'No FCM token found'
            });
          }
        } catch (error) {
          console.error(`Error processing scheduled notification ${doc.id}:`, error);
          
          // Mark as failed
          await doc.ref.update({
            status: 'failed',
            error: error.message
          });
        }
      }

      console.log(`Processed ${notifications.length} scheduled notifications`);
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }); 