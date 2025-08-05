import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Triggered when a match event is created
export const onMatchEventCreated = functions.firestore
  .document('matchEvents/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const eventId = context.params.eventId;

    try {
      // Update match stats
      await updateMatchStats(eventData);
      
      // Update player stats
      if (eventData.playerId) {
        await updatePlayerStats(eventData);
      }
      
      // Send real-time notification
      await sendMatchEventNotification(eventData);
      
      console.log(`Successfully processed match event: ${eventId}`);
    } catch (error) {
      console.error(`Error processing match event ${eventId}:`, error);
      throw error;
    }
  });

// Triggered when a match is completed
export const onMatchCompleted = functions.firestore
  .document('liveMatches/{matchId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const matchId = context.params.matchId;

    // Check if match status changed to completed
    if (beforeData.status !== 'completed' && afterData.status === 'completed') {
      try {
        // Calculate final match statistics
        await calculateFinalMatchStats(matchId);
        
        // Update team season stats
        await updateTeamSeasonStats(matchId);
        
        // Generate match report
        await generateMatchReport(matchId);
        
        // Send completion notifications
        await sendMatchCompletionNotifications(matchId);
        
        console.log(`Successfully processed match completion: ${matchId}`);
      } catch (error) {
        console.error(`Error processing match completion ${matchId}:`, error);
        throw error;
      }
    }
  });

// Update match statistics based on event
async function updateMatchStats(eventData: any) {
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
  
  // Update stats based on event type
  switch (eventData.type) {
    case 'goal':
      updatedStats[teamKey].goals += 1;
      if (eventData.data?.goalType === 'penalty') {
        updatedStats[teamKey].penaltyGoals = (updatedStats[teamKey].penaltyGoals || 0) + 1;
      }
      break;
      
    case 'assist':
      updatedStats[teamKey].assists += 1;
      break;
      
    case 'yellow_card':
      updatedStats[teamKey].yellowCards += 1;
      break;
      
    case 'red_card':
      updatedStats[teamKey].redCards += 1;
      break;
      
    case 'substitution_in':
      updatedStats[teamKey].substitutions = (updatedStats[teamKey].substitutions || 0) + 1;
      break;
      
    case 'injury':
      updatedStats[teamKey].injuries = (updatedStats[teamKey].injuries || 0) + 1;
      break;
      
    case 'corner':
      updatedStats[teamKey].corners += 1;
      break;
      
    case 'foul':
      updatedStats[teamKey].fouls += 1;
      break;
      
    case 'shot':
      updatedStats[teamKey].shots += 1;
      if (eventData.data?.onTarget) {
        updatedStats[teamKey].shotsOnTarget += 1;
      }
      break;
  }
  
  // Update possession if provided
  if (eventData.data?.possession) {
    updatedStats.possession = eventData.data.possession;
  }
  
  // Update the match document
  await matchRef.update({
    stats: updatedStats,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Update player statistics
async function updatePlayerStats(eventData: any) {
  const playerStatsRef = db.collection('playerMatchStats');
  const playerStatId = `${eventData.playerId}_${eventData.matchId}`;
  
  const playerStatDoc = await playerStatsRef.doc(playerStatId).get();
  let playerStats = playerStatDoc.exists ? playerStatDoc.data()! : {
    playerId: eventData.playerId,
    matchId: eventData.matchId,
    teamId: eventData.teamId,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    yellowCards: 0,
    redCards: 0,
    fouls: 0,
    foulsSuffered: 0,
    offsides: 0,
    passes: 0,
    passesCompleted: 0,
    tackles: 0,
    tacklesWon: 0,
    interceptions: 0,
    clearances: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // Update stats based on event type
  switch (eventData.type) {
    case 'goal':
      playerStats.goals += 1;
      break;
      
    case 'assist':
      playerStats.assists += 1;
      break;
      
    case 'yellow_card':
      playerStats.yellowCards += 1;
      break;
      
    case 'red_card':
      playerStats.redCards += 1;
      break;
      
    case 'shot':
      playerStats.shots += 1;
      if (eventData.data?.onTarget) {
        playerStats.shotsOnTarget += 1;
      }
      break;
      
    case 'foul':
      playerStats.fouls += 1;
      break;
      
    case 'foul_suffered':
      playerStats.foulsSuffered += 1;
      break;
      
    case 'offside':
      playerStats.offsides += 1;
      break;
      
    case 'pass':
      playerStats.passes += 1;
      if (eventData.data?.completed) {
        playerStats.passesCompleted += 1;
      }
      break;
      
    case 'tackle':
      playerStats.tackles += 1;
      if (eventData.data?.won) {
        playerStats.tacklesWon += 1;
      }
      break;
      
    case 'interception':
      playerStats.interceptions += 1;
      break;
      
    case 'clearance':
      playerStats.clearances += 1;
      break;
  }
  
  // Update the player stats document
  await playerStatsRef.doc(playerStatId).set({
    ...playerStats,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

// Calculate final match statistics
async function calculateFinalMatchStats(matchId: string) {
  const matchRef = db.collection('liveMatches').doc(matchId);
  const matchDoc = await matchRef.get();
  
  if (!matchDoc.exists) {
    throw new Error(`Match ${matchId} not found`);
  }
  
  const matchData = matchDoc.data()!;
  const eventsSnapshot = await db.collection('matchEvents')
    .where('matchId', '==', matchId)
    .orderBy('minute', 'asc')
    .get();
  
  const events = eventsSnapshot.docs.map(doc => doc.data());
  
  // Calculate additional statistics
  const finalStats = {
    ...matchData.stats,
    totalEvents: events.length,
    averageEventsPerMinute: events.length / 90, // Assuming 90-minute match
    firstGoalMinute: events.find(e => e.type === 'goal')?.minute || null,
    lastGoalMinute: events.filter(e => e.type === 'goal').pop()?.minute || null,
    totalCards: matchData.stats.homeTeam.yellowCards + matchData.stats.homeTeam.redCards + 
                matchData.stats.awayTeam.yellowCards + matchData.stats.awayTeam.redCards,
  };
  
  // Update match with final stats
  await matchRef.update({
    finalStats,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Update team season statistics
async function updateTeamSeasonStats(matchId: string) {
  const matchRef = db.collection('liveMatches').doc(matchId);
  const matchDoc = await matchRef.get();
  
  if (!matchDoc.exists) {
    throw new Error(`Match ${matchId} not found`);
  }
  
  const matchData = matchDoc.data()!;
  const season = '2024'; // This should be dynamic based on match date
  
  // Calculate results for both teams
  const homeTeamWon = matchData.stats.homeTeam.goals > matchData.stats.awayTeam.goals;
  const awayTeamWon = matchData.stats.awayTeam.goals > matchData.stats.homeTeam.goals;
  const isDraw = matchData.stats.homeTeam.goals === matchData.stats.awayTeam.goals;
  
  // Update home team stats
  await updateTeamStats(matchData.homeTeamId, season, {
    matchesPlayed: 1,
    wins: homeTeamWon ? 1 : 0,
    draws: isDraw ? 1 : 0,
    losses: awayTeamWon ? 1 : 0,
    goalsFor: matchData.stats.homeTeam.goals,
    goalsAgainst: matchData.stats.awayTeam.goals,
    goalDifference: matchData.stats.homeTeam.goals - matchData.stats.awayTeam.goals,
    points: homeTeamWon ? 3 : isDraw ? 1 : 0,
  });
  
  // Update away team stats
  await updateTeamStats(matchData.awayTeamId, season, {
    matchesPlayed: 1,
    wins: awayTeamWon ? 1 : 0,
    draws: isDraw ? 1 : 0,
    losses: homeTeamWon ? 1 : 0,
    goalsFor: matchData.stats.awayTeam.goals,
    goalsAgainst: matchData.stats.homeTeam.goals,
    goalDifference: matchData.stats.awayTeam.goals - matchData.stats.homeTeam.goals,
    points: awayTeamWon ? 3 : isDraw ? 1 : 0,
  });
}

// Update individual team statistics
async function updateTeamStats(teamId: string, season: string, matchStats: any) {
  const teamStatsRef = db.collection('teamSeasonStats');
  const teamStatId = `${teamId}_${season}`;
  
  const teamStatDoc = await teamStatsRef.doc(teamStatId).get();
  let teamStats = teamStatDoc.exists ? teamStatDoc.data()! : {
    teamId,
    season,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // Add match statistics to season totals
  teamStats.matchesPlayed += matchStats.matchesPlayed;
  teamStats.wins += matchStats.wins;
  teamStats.draws += matchStats.draws;
  teamStats.losses += matchStats.losses;
  teamStats.goalsFor += matchStats.goalsFor;
  teamStats.goalsAgainst += matchStats.goalsAgainst;
  teamStats.goalDifference += matchStats.goalDifference;
  teamStats.points += matchStats.points;
  
  // Update the team stats document
  await teamStatsRef.doc(teamStatId).set({
    ...teamStats,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

// Generate match report
async function generateMatchReport(matchId: string) {
  const matchRef = db.collection('liveMatches').doc(matchId);
  const matchDoc = await matchRef.get();
  
  if (!matchDoc.exists) {
    throw new Error(`Match ${matchId} not found`);
  }
  
  const matchData = matchDoc.data()!;
  const eventsSnapshot = await db.collection('matchEvents')
    .where('matchId', '==', matchId)
    .orderBy('minute', 'asc')
    .get();
  
  const events = eventsSnapshot.docs.map(doc => doc.data());
  
  // Generate report data
  const report = {
    matchId,
    summary: `Match between ${matchData.homeTeamId} and ${matchData.awayTeamId} ended ${matchData.stats.homeTeam.goals}-${matchData.stats.awayTeam.goals}`,
    keyMoments: events.filter(e => ['goal', 'red_card', 'penalty_goal'].includes(e.type))
      .map(e => `${e.minute}': ${e.type.replace('_', ' ')}`),
    totalEvents: events.length,
    totalCards: matchData.stats.homeTeam.yellowCards + matchData.stats.homeTeam.redCards + 
                matchData.stats.awayTeam.yellowCards + matchData.stats.awayTeam.redCards,
    totalGoals: matchData.stats.homeTeam.goals + matchData.stats.awayTeam.goals,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // Save match report
  await db.collection('matchReports').doc(matchId).set(report);
}

// Send real-time notification for match event
async function sendMatchEventNotification(eventData: any) {
  const notification = {
    type: 'match_event',
    title: 'Match Event',
    body: `${eventData.type.replace('_', ' ')} at ${eventData.minute}'`,
    data: {
      matchId: eventData.matchId,
      eventType: eventData.type,
      minute: eventData.minute,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // Send to all users following this match
  // This would typically involve querying for users who should receive notifications
  // For now, we'll just log the notification
  console.log('Match event notification:', notification);
}

// Send match completion notifications
async function sendMatchCompletionNotifications(matchId: string) {
  const notification = {
    type: 'match_completed',
    title: 'Match Completed',
    body: 'A match has been completed. View the final results.',
    data: {
      matchId,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  // Send to relevant users (team members, coaches, etc.)
  console.log('Match completion notification:', notification);
} 