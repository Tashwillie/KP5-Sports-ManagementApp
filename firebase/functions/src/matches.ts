import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const matchFunctions = {
  // Triggered when a match is created
  onMatchCreated: functions.firestore
    .document('matches/{matchId}')
    .onCreate(async (snap, context) => {
      try {
        const matchData = snap.data();
        const matchId = context.params.matchId;

        console.log(`New match created: ${matchId}`);

        // Initialize match stats
        await db.collection('matches').doc(matchId).update({
          stats: {
            homeTeam: {
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
              shots: 0,
              shotsOnTarget: 0,
              possession: 50,
              fouls: 0,
              corners: 0,
              offsides: 0
            },
            awayTeam: {
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
              shots: 0,
              shotsOnTarget: 0,
              possession: 50,
              fouls: 0,
              corners: 0,
              offsides: 0
            },
            match: {
              totalGoals: 0,
              totalCards: 0,
              totalShots: 0,
              totalFouls: 0,
              totalCorners: 0,
              totalOffsides: 0
            }
          },
          events: [],
          isLive: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Send notifications to team members
        await sendMatchCreatedNotifications(matchData);

        console.log(`Match ${matchId} initialized successfully`);
      } catch (error) {
        console.error('Error initializing match:', error);
      }
    }),

  // Triggered when a match is updated
  onMatchUpdated: functions.firestore
    .document('matches/{matchId}')
    .onUpdate(async (change, context) => {
      try {
        const before = change.before.data();
        const after = change.after.data();
        const matchId = context.params.matchId;

        console.log(`Match updated: ${matchId}`);

        // Check if match status changed
        if (before.status !== after.status) {
          await handleMatchStatusChange(matchId, before.status, after.status);
        }

        // Check if match became live
        if (!before.isLive && after.isLive) {
          await handleMatchStarted(matchId, after);
        }

        // Check if match ended
        if (before.isLive && !after.isLive && after.status === 'completed') {
          await handleMatchEnded(matchId, after);
        }

        // Update match timestamp
        await db.collection('matches').doc(matchId).update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Match ${matchId} updated successfully`);
      } catch (error) {
        console.error('Error updating match:', error);
      }
    }),

  // Triggered when a match event is added
  onMatchEventAdded: functions.firestore
    .document('matches/{matchId}/events/{eventId}')
    .onCreate(async (snap, context) => {
      try {
        const eventData = snap.data();
        const matchId = context.params.matchId;
        const eventId = context.params.eventId;

        console.log(`New match event: ${eventId} for match: ${matchId}`);

        // Update match stats based on event
        await updateMatchStats(matchId, eventData);

        // Update player stats
        if (eventData.playerId) {
          await updatePlayerStats(eventData.playerId, eventData);
        }

        // Update team stats
        await updateTeamStats(eventData.teamId, eventData);

        // Send real-time notifications
        await sendMatchEventNotification(matchId, eventData);

        // Update match events array
        await db.collection('matches').doc(matchId).update({
          events: admin.firestore.FieldValue.arrayUnion({
            id: eventId,
            ...eventData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          })
        });

        console.log(`Match event ${eventId} processed successfully`);
      } catch (error) {
        console.error('Error processing match event:', error);
      }
    }),

  // HTTP function to update match stats
  updateMatchStats: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { matchId, stats } = data;

      if (!matchId || !stats) {
        throw new functions.https.HttpsError('invalid-argument', 'Match ID and stats are required');
      }

      // Check if user has permission to update match stats
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !['super_admin', 'club_admin', 'coach', 'referee'].includes(userData.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      // Update match stats
      await db.collection('matches').doc(matchId).update({
        stats,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating match stats:', error);
      throw new functions.https.HttpsError('internal', 'Failed to update match stats');
    }
  }),

  // HTTP function to calculate player stats
  calculatePlayerStats: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { playerId, matchId } = data;

      if (!playerId || !matchId) {
        throw new functions.https.HttpsError('invalid-argument', 'Player ID and match ID are required');
      }

      // Get all events for the player in this match
      const eventsSnapshot = await db.collection('matches').doc(matchId)
        .collection('events')
        .where('playerId', '==', playerId)
        .get();

      const events = eventsSnapshot.docs.map(doc => doc.data());

      // Calculate player stats
      const playerStats = {
        goals: events.filter(e => e.type === 'goal').length,
        assists: events.filter(e => e.type === 'assist').length,
        yellowCards: events.filter(e => e.type === 'yellow_card').length,
        redCards: events.filter(e => e.type === 'red_card').length,
        shots: events.filter(e => e.type === 'shot').length,
        shotsOnTarget: events.filter(e => e.type === 'shot_on_target').length,
        fouls: events.filter(e => e.type === 'foul').length,
        minutesPlayed: calculateMinutesPlayed(events)
      };

      // Update player stats in the match
      await db.collection('matches').doc(matchId).update({
        [`playerStats.${playerId}`]: playerStats
      });

      return { playerStats };
    } catch (error) {
      console.error('Error calculating player stats:', error);
      throw new functions.https.HttpsError('internal', 'Failed to calculate player stats');
    }
  }),

  // HTTP function to update team standings
  updateTeamStandings: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { tournamentId } = data;

      if (!tournamentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Tournament ID is required');
      }

      // Get all matches for the tournament
      const matchesSnapshot = await db.collection('matches')
        .where('tournamentId', '==', tournamentId)
        .where('status', '==', 'completed')
        .get();

      const matches = matchesSnapshot.docs.map(doc => doc.data());

      // Calculate team standings
      const standings = calculateTeamStandings(matches);

      // Update tournament standings
      await db.collection('tournaments').doc(tournamentId).update({
        standings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { standings };
    } catch (error) {
      console.error('Error updating team standings:', error);
      throw new functions.https.HttpsError('internal', 'Failed to update team standings');
    }
  }),

  // HTTP function to generate match report
  generateMatchReport: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { matchId } = data;

      if (!matchId) {
        throw new functions.https.HttpsError('invalid-argument', 'Match ID is required');
      }

      // Get match data
      const matchDoc = await db.collection('matches').doc(matchId).get();
      if (!matchDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Match not found');
      }

      const matchData = matchDoc.data();

      // Generate match report
      const report = {
        matchId,
        homeTeam: matchData!.homeTeam,
        awayTeam: matchData!.awayTeam,
        score: `${matchData!.homeScore} - ${matchData!.awayScore}`,
        stats: matchData!.stats,
        events: matchData!.events,
        duration: calculateMatchDuration(matchData!.startTime, matchData!.endTime),
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Save report to Firestore
      await db.collection('matchReports').add(report);

      return { reportId: report.matchId };
    } catch (error) {
      console.error('Error generating match report:', error);
      throw new functions.https.HttpsError('internal', 'Failed to generate match report');
    }
  })
};

// Helper functions
async function sendMatchCreatedNotifications(matchData: any) {
  try {
    const { homeTeamId, awayTeamId, scheduledDate } = matchData;

    // Get team members
    const [homeTeamDoc, awayTeamDoc] = await Promise.all([
      db.collection('teams').doc(homeTeamId).get(),
      db.collection('teams').doc(awayTeamId).get()
    ]);

    const homeTeam = homeTeamDoc.data();
    const awayTeam = awayTeamDoc.data();

    // Send notifications to team members
    const allMembers = [...(homeTeam?.members || []), ...(awayTeam?.members || [])];

    for (const memberId of allMembers) {
      const message = {
        notification: {
          title: 'New Match Scheduled',
          body: `${homeTeam?.name} vs ${awayTeam?.name} on ${new Date(scheduledDate).toLocaleDateString()}`
        },
        data: {
          type: 'match_scheduled',
          matchId: matchData.id,
          homeTeamId,
          awayTeamId
        },
        token: memberId // This would be the user's FCM token
      };

      await admin.messaging().send(message);
    }
  } catch (error) {
    console.error('Error sending match notifications:', error);
  }
}

async function handleMatchStatusChange(matchId: string, oldStatus: string, newStatus: string) {
  console.log(`Match ${matchId} status changed from ${oldStatus} to ${newStatus}`);
  
  // Send status change notifications
  const message = {
    notification: {
      title: 'Match Status Updated',
      body: `Match status changed to ${newStatus}`
    },
    data: {
      type: 'match_status_change',
      matchId,
      oldStatus,
      newStatus
    },
    topic: `match_${matchId}`
  };

  await admin.messaging().send(message);
}

async function handleMatchStarted(matchId: string, matchData: any) {
  console.log(`Match ${matchId} started`);
  
  // Send match started notifications
  const message = {
    notification: {
      title: 'Match Started',
      body: `${matchData.homeTeam} vs ${matchData.awayTeam} has begun!`
    },
    data: {
      type: 'match_started',
      matchId
    },
    topic: `match_${matchId}`
  };

  await admin.messaging().send(message);
}

async function handleMatchEnded(matchId: string, matchData: any) {
  console.log(`Match ${matchId} ended`);
  
  // Calculate final stats
  await updateMatchStats(matchId, matchData.stats);
  
  // Update team standings
  if (matchData.tournamentId) {
    await updateTeamStandings({ tournamentId: matchData.tournamentId });
  }
  
  // Send match ended notifications
  const message = {
    notification: {
      title: 'Match Ended',
      body: `Final Score: ${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}`
    },
    data: {
      type: 'match_ended',
      matchId,
      homeScore: matchData.homeScore.toString(),
      awayScore: matchData.awayScore.toString()
    },
    topic: `match_${matchId}`
  };

  await admin.messaging().send(message);
}

async function updateMatchStats(matchId: string, eventData: any) {
  const matchRef = db.collection('matches').doc(matchId);
  
  // Update match stats based on event type
  const updates: any = {};
  
  switch (eventData.type) {
    case 'goal':
      updates[`stats.${eventData.teamId === 'home' ? 'homeTeam' : 'awayTeam'}.goals`] = admin.firestore.FieldValue.increment(1);
      updates['stats.match.totalGoals'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'assist':
      updates[`stats.${eventData.teamId === 'home' ? 'homeTeam' : 'awayTeam'}.assists`] = admin.firestore.FieldValue.increment(1);
      break;
    case 'yellow_card':
      updates[`stats.${eventData.teamId === 'home' ? 'homeTeam' : 'awayTeam'}.yellowCards`] = admin.firestore.FieldValue.increment(1);
      updates['stats.match.totalCards'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'red_card':
      updates[`stats.${eventData.teamId === 'home' ? 'homeTeam' : 'awayTeam'}.redCards`] = admin.firestore.FieldValue.increment(1);
      updates['stats.match.totalCards'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'shot':
      updates[`stats.${eventData.teamId === 'home' ? 'homeTeam' : 'awayTeam'}.shots`] = admin.firestore.FieldValue.increment(1);
      updates['stats.match.totalShots'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'foul':
      updates[`stats.${eventData.teamId === 'home' ? 'homeTeam' : 'awayTeam'}.fouls`] = admin.firestore.FieldValue.increment(1);
      updates['stats.match.totalFouls'] = admin.firestore.FieldValue.increment(1);
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    await matchRef.update(updates);
  }
}

async function updatePlayerStats(playerId: string, eventData: any) {
  const userRef = db.collection('users').doc(playerId);
  
  const updates: any = {};
  
  switch (eventData.type) {
    case 'goal':
      updates['stats.totalGoals'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'assist':
      updates['stats.totalAssists'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'yellow_card':
    case 'red_card':
      updates['stats.totalCards'] = admin.firestore.FieldValue.increment(1);
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    await userRef.update(updates);
  }
}

async function updateTeamStats(teamId: string, eventData: any) {
  const teamRef = db.collection('teams').doc(teamId);
  
  const updates: any = {};
  
  switch (eventData.type) {
    case 'goal':
      updates['stats.totalGoals'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'assist':
      updates['stats.totalAssists'] = admin.firestore.FieldValue.increment(1);
      break;
    case 'yellow_card':
    case 'red_card':
      updates['stats.totalCards'] = admin.firestore.FieldValue.increment(1);
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    await teamRef.update(updates);
  }
}

async function sendMatchEventNotification(matchId: string, eventData: any) {
  try {
    const message = {
      notification: {
        title: getEventTitle(eventData.type),
        body: getEventDescription(eventData)
      },
      data: {
        type: 'match_event',
        matchId,
        eventType: eventData.type,
        playerId: eventData.playerId || '',
        teamId: eventData.teamId || ''
      },
      topic: `match_${matchId}`
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending match event notification:', error);
  }
}

function getEventTitle(eventType: string): string {
  switch (eventType) {
    case 'goal': return 'Goal!';
    case 'assist': return 'Assist!';
    case 'yellow_card': return 'Yellow Card';
    case 'red_card': return 'Red Card';
    case 'substitution': return 'Substitution';
    default: return 'Match Event';
  }
}

function getEventDescription(eventData: any): string {
  switch (eventData.type) {
    case 'goal': return `${eventData.playerName || 'Player'} scored!`;
    case 'assist': return `${eventData.playerName || 'Player'} with the assist!`;
    case 'yellow_card': return `${eventData.playerName || 'Player'} received a yellow card`;
    case 'red_card': return `${eventData.playerName || 'Player'} received a red card`;
    case 'substitution': return `${eventData.playerOut} replaced by ${eventData.playerIn}`;
    default: return eventData.description || 'Match event occurred';
  }
}

function calculateMinutesPlayed(events: any[]): number {
  // This would calculate actual minutes played based on substitution events
  return 90; // Default to full match
}

function calculateTeamStandings(matches: any[]): any[] {
  const teamStats: { [key: string]: any } = {};
  
  matches.forEach(match => {
    const homeTeam = match.homeTeamId;
    const awayTeam = match.awayTeamId;
    const homeScore = match.homeScore;
    const awayScore = match.awayScore;
    
    // Initialize team stats if not exists
    if (!teamStats[homeTeam]) {
      teamStats[homeTeam] = { teamId: homeTeam, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    }
    if (!teamStats[awayTeam]) {
      teamStats[awayTeam] = { teamId: awayTeam, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    }
    
    // Update stats
    teamStats[homeTeam].played++;
    teamStats[awayTeam].played++;
    teamStats[homeTeam].goalsFor += homeScore;
    teamStats[homeTeam].goalsAgainst += awayScore;
    teamStats[awayTeam].goalsFor += awayScore;
    teamStats[awayTeam].goalsAgainst += homeScore;
    
    if (homeScore > awayScore) {
      teamStats[homeTeam].won++;
      teamStats[homeTeam].points += 3;
      teamStats[awayTeam].lost++;
    } else if (homeScore < awayScore) {
      teamStats[awayTeam].won++;
      teamStats[awayTeam].points += 3;
      teamStats[homeTeam].lost++;
    } else {
      teamStats[homeTeam].drawn++;
      teamStats[homeTeam].points += 1;
      teamStats[awayTeam].drawn++;
      teamStats[awayTeam].points += 1;
    }
  });
  
  // Convert to array and sort by points
  return Object.values(teamStats).sort((a: any, b: any) => b.points - a.points);
}

function calculateMatchDuration(startTime: any, endTime: any): string {
  if (!startTime || !endTime) return 'Unknown';
  
  const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
  const minutes = Math.floor(duration / (1000 * 60));
  
  return `${minutes} minutes`;
} 