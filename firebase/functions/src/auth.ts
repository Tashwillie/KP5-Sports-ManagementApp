import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const auth = admin.auth();

export const authFunctions = {
  // Triggered when a new user is created
  onUserCreated: functions.auth.user().onCreate(async (user) => {
    try {
      console.log(`New user created: ${user.uid}`);

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        emailVerified: user.emailVerified,
        role: 'player', // Default role
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisible: true,
            statsVisible: true
          }
        },
        stats: {
          totalMatches: 0,
          totalGoals: 0,
          totalAssists: 0,
          totalCards: 0,
          totalMinutes: 0
        }
      };

      await db.collection('users').doc(user.uid).set(userProfile);

      // Send welcome email
      if (user.email) {
        await sendWelcomeEmail(user.email, user.displayName || 'User');
      }

      // Send welcome push notification
      await sendWelcomeNotification(user.uid);

      console.log(`User profile created for: ${user.uid}`);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }),

  // Triggered when a user is deleted
  onUserDeleted: functions.auth.user().onDelete(async (user) => {
    try {
      console.log(`User deleted: ${user.uid}`);

      // Delete user data from Firestore
      const batch = db.batch();

      // Delete user profile
      batch.delete(db.collection('users').doc(user.uid));

      // Delete user's teams
      const teamsSnapshot = await db.collection('teams')
        .where('members', 'array-contains', user.uid)
        .get();

      teamsSnapshot.docs.forEach(doc => {
        const teamData = doc.data();
        const updatedMembers = teamData.members.filter((memberId: string) => memberId !== user.uid);
        batch.update(doc.ref, { members: updatedMembers });
      });

      // Delete user's clubs
      const clubsSnapshot = await db.collection('clubs')
        .where('members', 'array-contains', user.uid)
        .get();

      clubsSnapshot.docs.forEach(doc => {
        const clubData = doc.data();
        const updatedMembers = clubData.members.filter((memberId: string) => memberId !== user.uid);
        batch.update(doc.ref, { members: updatedMembers });
      });

      // Delete user's registrations
      const registrationsSnapshot = await db.collection('registrations')
        .where('userId', '==', user.uid)
        .get();

      registrationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`User data deleted for: ${user.uid}`);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }),

  // Triggered when a user is updated
  onUserUpdated: functions.auth.user().onUpdate(async (change) => {
    try {
      const before = change.before;
      const after = change.after;

      console.log(`User updated: ${after.uid}`);

      // Update user profile in Firestore
      const updates: any = {
        email: after.email,
        displayName: after.displayName || '',
        photoURL: after.photoURL || '',
        phoneNumber: after.phoneNumber || '',
        emailVerified: after.emailVerified,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('users').doc(after.uid).update(updates);

      // If email was verified, send confirmation
      if (!before.emailVerified && after.emailVerified) {
        await sendEmailVerificationConfirmation(after.email!, after.displayName || 'User');
      }

      console.log(`User profile updated for: ${after.uid}`);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }),

  // HTTP function to set user role
  setUserRole: functions.https.onCall(async (data, context) => {
    try {
      // Check if user is authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { userId, role } = data;

      // Validate role
      const validRoles = ['super_admin', 'club_admin', 'coach', 'player', 'parent', 'referee'];
      if (!validRoles.includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role');
      }

      // Check if current user has permission to set roles
      const currentUserDoc = await db.collection('users').doc(context.auth.uid).get();
      const currentUserData = currentUserDoc.data();

      if (!currentUserData || !['super_admin', 'club_admin'].includes(currentUserData.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      // Update user role
      await db.collection('users').doc(userId).update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Set custom claims
      await auth.setCustomUserClaims(userId, { role });

      console.log(`Role updated for user ${userId} to ${role}`);

      return { success: true, role };
    } catch (error) {
      console.error('Error setting user role:', error);
      throw new functions.https.HttpsError('internal', 'Failed to set user role');
    }
  }),

  // HTTP function to verify user email
  verifyUserEmail: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { email } = data;

      // Verify email format
      if (!email || !email.includes('@')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
      }

      // Send email verification
      const actionCodeSettings = {
        url: `${process.env.APP_URL}/auth/verify-email`,
        handleCodeInApp: true
      };

      await auth.generateEmailVerificationLink(email, actionCodeSettings);

      return { success: true };
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send email verification');
    }
  }),

  // HTTP function to send password reset email
  sendPasswordResetEmail: functions.https.onCall(async (data, context) => {
    try {
      const { email } = data;

      if (!email || !email.includes('@')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
      }

      const actionCodeSettings = {
        url: `${process.env.APP_URL}/auth/reset-password`,
        handleCodeInApp: true
      };

      await auth.generatePasswordResetLink(email, actionCodeSettings);

      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send password reset email');
    }
  }),

  // HTTP function to create custom token
  createCustomToken: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { uid, customClaims } = data;

      // Check if current user has permission
      const currentUserDoc = await db.collection('users').doc(context.auth.uid).get();
      const currentUserData = currentUserDoc.data();

      if (!currentUserData || currentUserData.role !== 'super_admin') {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      const customToken = await auth.createCustomToken(uid, customClaims);

      return { customToken };
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create custom token');
    }
  })
};

// Helper functions
async function sendWelcomeEmail(email: string, displayName: string) {
  // This would integrate with your email service
  console.log(`Sending welcome email to ${email} for ${displayName}`);
}

async function sendWelcomeNotification(userId: string) {
  try {
    const message = {
      notification: {
        title: 'Welcome to KP5 Academy!',
        body: 'Thank you for joining our sports management platform.'
      },
      data: {
        type: 'welcome',
        userId: userId
      },
      token: userId // This would be the user's FCM token
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
}

async function sendEmailVerificationConfirmation(email: string, displayName: string) {
  // This would integrate with your email service
  console.log(`Sending email verification confirmation to ${email} for ${displayName}`);
} 