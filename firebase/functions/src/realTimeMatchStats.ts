import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Real-time match statistics update function
export const updateRealTimeMatchStats = functions.firestore
  .document('matchEvents/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const eventId = context.params.eventId;

    try {
      console.log(`Processing real-time match event: ${eventId}`);

      // Update match statistics in real-time
      await updateMatchStatistics(eventData);
      
      // Update player statistics
      if (eventData.playerId) {
        await updatePlayerStatistics(eventData);
      }
      
      // Update team statistics
      await updateTeamStatistics(eventData);
      
      // Send real-time notifications
      await sendRealTimeNotifications(eventData);
      
      // Update match timeline
      await updateMatchTimeline(eventData);
      
      // Trigger analytics events
      await triggerAnalyticsEvents(eventData);

      console.log(`Successfully processed real-time match event: ${eventId}`);
    } catch (error) {
      console.error(`Error processing real-time match event ${eventId}:`, error);
      throw error;
    }
  });

// Update match statistics in real-time
async function updateMatchStatistics(eventData: any) {
  const matchRef = db.collection('liveMatches').doc(eventData.matchId);
  const matchDoc = await matchRef.get();
  
  if (!matchDoc.exists) {
    throw new Error(`Match ${eventData.matchId} not found`);
  }
  
  const matchData = matchDoc.data()!;
  const updatedStats = { ...matchData.stats };
  
  // Determine which team the event belongs to
  const isHomeTeam = eventData.teamId === matchData.homeTeamId;
  const teamKey = isHomeTeam ? 'homeTeam' : 'awayTeam';
  
  // Update statistics based on event type
  switch (eventData.type) {
    case 'goal':
      updatedStats[teamKey].goals += 1;
      updatedStats[teamKey].shotsOnTarget += 1;
      if (eventData.data?.goalType === 'penalty') {
        updatedStats[teamKey].penaltyGoals = (updatedStats[teamKey].penaltyGoals || 0) + 1;
      }
      break;
      
    case 'assist':
      updatedStats[teamKey].assists += 1;
      break;
      
    case 'yellow_card':
      updatedStats[teamKey].yellowCards += 1;
      updatedStats[teamKey].fouls += 1;
      break;
      
    case 'red_card':
      updatedStats[teamKey].redCards += 1;
      updatedStats[teamKey].fouls += 1;
      break;
      
    case 'substitution_in':
      updatedStats[teamKey].substitutions = (updatedStats[teamKey].substitutions || 0) + 1;
      break;
      
    case 'injury':
      updatedStats[teamKey].injuries = (updatedStats[teamKey].injuries || 0) + 1;
      break;
  }
  
  // Update match document with new statistics
  await matchRef.update({
    stats: updatedStats,
    lastEventTime: admin.firestore.FieldValue.serverTimestamp(),
    lastEventId: eventData.id,
  });
}

// Update player statistics in real-time
async function updatePlayerStatistics(eventData: any) {
  const playerRef = db.collection('players').doc(eventData.playerId);
  const playerDoc = await playerRef.get();
  
  if (!playerDoc.exists) {
    console.warn(`Player ${eventData.playerId} not found`);
    return;
  }
  
  const playerData = playerDoc.data()!;
  const updatedStats = { ...playerData.stats };
  
  // Update player statistics based on event type
  switch (eventData.type) {
    case 'goal':
      updatedStats.goals += 1;
      updatedStats.shotsOnTarget += 1;
      break;
      
    case 'assist':
      updatedStats.assists += 1;
      break;
      
    case 'yellow_card':
      updatedStats.yellowCards += 1;
      updatedStats.fouls += 1;
      break;
      
    case 'red_card':
      updatedStats.redCards += 1;
      updatedStats.fouls += 1;
      break;
      
    case 'substitution_in':
      // Player came on - update minutes played
      updatedStats.matchesPlayed += 1;
      break;
  }
  
  // Update player document
  await playerRef.update({
    stats: updatedStats,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Update team statistics in real-time
async function updateTeamStatistics(eventData: any) {
  const teamRef = db.collection('teams').doc(eventData.teamId);
  const teamDoc = await teamRef.get();
  
  if (!teamDoc.exists) {
    console.warn(`Team ${eventData.teamId} not found`);
    return;
  }
  
  const teamData = teamDoc.data()!;
  const updatedStats = { ...teamData.stats };
  
  // Update team statistics based on event type
  switch (eventData.type) {
    case 'goal':
      updatedStats.goalsFor += 1;
      break;
      
    case 'yellow_card':
      updatedStats.yellowCards = (updatedStats.yellowCards || 0) + 1;
      break;
      
    case 'red_card':
      updatedStats.redCards = (updatedStats.redCards || 0) + 1;
      break;
  }
  
  // Update team document
  await teamRef.update({
    stats: updatedStats,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Send real-time notifications
async function sendRealTimeNotifications(eventData: any) {
  const matchRef = db.collection('liveMatches').doc(eventData.matchId);
  const matchDoc = await matchRef.get();
  
  if (!matchDoc.exists) return;
  
  const matchData = matchDoc.data()!;
  
  // Create notification data
  const notificationData = {
    title: getEventTitle(eventData.type),
    body: getEventDescription(eventData),
    type: 'match_event',
    data: {
      matchId: eventData.matchId,
      eventId: eventData.id,
      eventType: eventData.type,
      teamId: eventData.teamId,
      playerId: eventData.playerId,
    },
    recipients: getNotificationRecipients(matchData),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // Send to all recipients
  for (const recipientId of notificationData.recipients) {
    await db.collection('notifications').add({
      ...notificationData,
      userId: recipientId,
      read: false,
    });
  }
  
  // Send push notifications if enabled
  await sendPushNotifications(notificationData);
}

// Update match timeline
async function updateMatchTimeline(eventData: any) {
  const timelineRef = db.collection('matchTimelines').doc(eventData.matchId);
  
  await timelineRef.set({
    events: admin.firestore.FieldValue.arrayUnion({
      id: eventData.id,
      type: eventData.type,
      minute: eventData.minute,
      playerId: eventData.playerId,
      teamId: eventData.teamId,
      timestamp: eventData.timestamp,
      data: eventData.data,
    }),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

// Trigger analytics events
async function triggerAnalyticsEvents(eventData: any) {
  const analyticsData = {
    event: 'match_event',
    matchId: eventData.matchId,
    eventType: eventData.type,
    teamId: eventData.teamId,
    playerId: eventData.playerId,
    minute: eventData.minute,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await db.collection('analytics').add(analyticsData);
}

// Helper functions
function getEventTitle(eventType: string): string {
  switch (eventType) {
    case 'goal':
      return '⚽ Goal Scored!';
    case 'yellow_card':
      return '🟨 Yellow Card';
    case 'red_card':
      return '🟥 Red Card';
    case 'substitution_in':
      return '🔄 Substitution';
    case 'injury':
      return '🏥 Injury';
    default:
      return 'Match Event';
  }
}

function getEventDescription(eventData: any): string {
  const playerName = eventData.playerName || 'Player';
  const minute = eventData.minute;
  
  switch (eventData.type) {
    case 'goal':
      return `${playerName} scored in the ${minute}th minute!`;
    case 'yellow_card':
      return `${playerName} received a yellow card in the ${minute}th minute`;
    case 'red_card':
      return `${playerName} received a red card in the ${minute}th minute`;
    case 'substitution_in':
      return `${playerName} came on in the ${minute}th minute`;
    case 'injury':
      return `${playerName} was injured in the ${minute}th minute`;
    default:
      return `Event in the ${minute}th minute`;
  }
}

function getNotificationRecipients(matchData: any): string[] {
  const recipients = new Set<string>();
  
  // Add team members
  if (matchData.homeTeamId) {
    // Add home team players, coaches, and admins
    recipients.add(matchData.homeTeamId);
  }
  
  if (matchData.awayTeamId) {
    // Add away team players, coaches, and admins
    recipients.add(matchData.awayTeamId);
  }
  
  // Add referee
  if (matchData.refereeId) {
    recipients.add(matchData.refereeId);
  }
  
  // Add match admin
  if (matchData.adminId) {
    recipients.add(matchData.adminId);
  }
  
  return Array.from(recipients);
}

async function sendPushNotifications(notificationData: any) {
  try {
    // Get FCM tokens for recipients
    const tokens = await getFCMTokens(notificationData.recipients);
    
    if (tokens.length === 0) return;
    
    // Send push notification
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      data: notificationData.data,
      tokens: tokens,
    };
    
    const response = await admin.messaging().sendMulticast(message);
    console.log(`Push notification sent to ${response.successCount} devices`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

async function getFCMTokens(userIds: string[]): Promise<string[]> {
  const tokens: string[] = [];
  
  for (const userId of userIds) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data()!;
        if (userData.fcmToken) {
          tokens.push(userData.fcmToken);
        }
      }
    } catch (error) {
      console.error(`Error getting FCM token for user ${userId}:`, error);
    }
  }
  
  return tokens;
}

// Export the function
export { updateRealTimeMatchStats }; 