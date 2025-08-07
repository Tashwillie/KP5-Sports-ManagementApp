import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { authFunctions } from './auth';
import { paymentFunctions } from './payments';
import { notificationFunctions } from './notifications';
import { matchFunctions } from './matches';
import { realTimeMatchStats } from './realTimeMatchStats';
import { tournamentFunctions } from './tournaments';
import { userFunctions } from './users';
import { clubFunctions } from './clubs';
import { teamFunctions } from './teams';
import { eventFunctions } from './events';
import { mediaFunctions } from './media';
import { analyticsFunctions } from './analytics';
import { emailFunctions } from './email';
import { smsFunctions } from './sms';
import { cronFunctions } from './cron';

// Export all functions
export const {
  onUserCreated,
  onUserDeleted,
  onUserUpdated,
  setUserRole,
  verifyUserEmail,
  sendPasswordResetEmail,
  createCustomToken
} = authFunctions;

export const {
  createPaymentIntent,
  confirmPayment,
  createSubscription,
  cancelSubscription,
  processRefund,
  handleStripeWebhook,
  generateInvoice,
  sendPaymentReminder
} = paymentFunctions;

export const {
  sendPushNotification,
  sendBulkNotifications,
  subscribeToTopic,
  unsubscribeFromTopic,
  onNotificationSent,
  scheduleNotification
} = notificationFunctions;

export const {
  onMatchCreated,
  onMatchUpdated,
  onMatchEventAdded,
  updateMatchStats,
  calculatePlayerStats,
  updateTeamStandings,
  generateMatchReport
} = matchFunctions;

export const {
  updateRealTimeMatchStats
} = realTimeMatchStats;

export const {
  onTournamentCreated,
  onTournamentUpdated,
  generateTournamentBrackets,
  updateTournamentStandings,
  scheduleTournamentMatches,
  sendTournamentNotifications
} = tournamentFunctions;

export const {
  onUserProfileUpdated,
  updateUserStats,
  syncUserData,
  exportUserData,
  deleteUserData
} = userFunctions;

export const {
  onClubCreated,
  onClubUpdated,
  onClubDeleted,
  updateClubStats,
  generateClubReport
} = clubFunctions;

export const {
  onTeamCreated,
  onTeamUpdated,
  onTeamDeleted,
  updateTeamStats,
  syncTeamRoster
} = teamFunctions;

export const {
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  sendEventReminders,
  updateEventAttendance,
  generateEventReport
} = eventFunctions;

export const {
  onMediaUploaded,
  processImage,
  generateThumbnail,
  deleteMedia,
  updateMediaMetadata
} = mediaFunctions;

export const {
  generateAnalytics,
  updateDailyStats,
  generateMonthlyReport,
  trackUserActivity,
  calculateEngagementMetrics
} = analyticsFunctions;

export const {
  sendWelcomeEmail,
  sendEventInvitation,
  sendPaymentConfirmation,
  sendRegistrationConfirmation,
  sendPasswordReset,
  sendBulkEmail
} = emailFunctions;

export const {
  sendSMS,
  sendBulkSMS,
  verifyPhoneNumber,
  sendEventReminderSMS
} = smsFunctions;

export const {
  dailyStatsUpdate,
  weeklyReportGeneration,
  monthlyCleanup,
  sendScheduledNotifications,
  updateExpiredSubscriptions
} = cronFunctions;

// HTTP Functions
export const api = functions.https.onRequest((req, res) => {
  res.json({ message: 'KP5 Academy API is running!' });
});

// Health check endpoint
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Export admin for use in other modules
export { admin }; 