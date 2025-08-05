# Firebase Integration for Real-Time Match Data System

## Overview

This document describes the Firebase integration for the sports management platform's real-time match data entry system. The system provides live match tracking, event recording, and automatic statistics calculation with real-time synchronization across web and mobile applications.

## Architecture

### Core Components

1. **LiveMatchService** - Firebase service layer for match operations
2. **useLiveMatch Hook** - React hook for real-time match data
3. **Cloud Functions** - Automatic stats aggregation and notifications
4. **Firestore Security Rules** - Role-based access control
5. **Real-time Listeners** - Live data synchronization

### Data Flow

```
Match Event Entry → Firestore → Cloud Functions → Stats Update → Real-time UI Update
```

## Firebase Collections

### liveMatches
Stores active and completed match data.

```typescript
{
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location: Location;
  events: LiveMatchEvent[];
  stats: MatchStats;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### matchEvents
Individual match events (goals, cards, substitutions, etc.).

```typescript
{
  id: string;
  matchId: string;
  type: LiveMatchEventType;
  timestamp: Date;
  minute: number;
  playerId?: string;
  teamId: string;
  data: any;
  createdBy: string;
  createdAt: Date;
}
```

### playerMatchStats
Player performance statistics per match.

```typescript
{
  playerId: string;
  matchId: string;
  teamId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  foulsSuffered: number;
  offsides: number;
  passes: number;
  passesCompleted: number;
  tackles: number;
  tacklesWon: number;
  interceptions: number;
  clearances: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### teamSeasonStats
Team performance statistics per season.

```typescript
{
  teamId: string;
  season: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Setup Instructions

### 1. Firebase Project Configuration

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Cloud Functions
4. Set up Authentication (if not already configured)

### 2. Environment Variables

Create `.env.local` files in both web and mobile directories:

```bash
# Web (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Mobile (.env)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

### 3. Install Dependencies

```bash
# Web
cd web
npm install firebase

# Mobile
cd mobile
npm install firebase

# Shared
cd shared
npm install firebase
```

### 4. Deploy Cloud Functions

```bash
cd firebase/functions
npm install
firebase deploy --only functions
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Usage Examples

### Web Application

#### Basic Match Management

```typescript
import { useLiveMatch } from '../../shared/src/hooks/useLiveMatch';

function MatchComponent({ matchId }: { matchId: string }) {
  const { 
    match, 
    events, 
    loading, 
    error, 
    startMatch, 
    endMatch, 
    addEvent 
  } = useLiveMatch({ matchId });

  const handleStartMatch = async () => {
    const success = await startMatch();
    if (success) {
      console.log('Match started successfully');
    }
  };

  const handleAddGoal = async () => {
    const success = await addEvent({
      type: 'goal',
      minute: 25,
      playerId: 'player123',
      teamId: 'team1',
      data: { goalType: 'open_play' }
    });
    
    if (success) {
      console.log('Goal added successfully');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!match) return <div>Match not found</div>;

  return (
    <div>
      <h1>Match: {match.homeTeamId} vs {match.awayTeamId}</h1>
      <p>Status: {match.status}</p>
      <p>Score: {match.stats.homeTeam.goals} - {match.stats.awayTeam.goals}</p>
      
      <button onClick={handleStartMatch}>Start Match</button>
      <button onClick={handleAddGoal}>Add Goal</button>
    </div>
  );
}
```

#### Real-time Event Display

```typescript
function EventsList({ matchId }: { matchId: string }) {
  const { events } = useLiveMatch({ matchId });

  return (
    <div>
      <h2>Match Events</h2>
      {events.map(event => (
        <div key={event.id}>
          <span>{event.minute}'</span>
          <span>{event.type}</span>
          <span>{event.playerId}</span>
        </div>
      ))}
    </div>
  );
}
```

### Mobile Application

#### Live Match Control

```typescript
import { useLiveMatch } from '../../shared/src/hooks/useLiveMatch';

function LiveMatchScreen({ matchId }: { matchId: string }) {
  const { 
    match, 
    events, 
    loading, 
    startMatch, 
    endMatch, 
    addEvent 
  } = useLiveMatch({ matchId });

  const handleQuickGoal = async (teamId: string) => {
    await addEvent({
      type: 'goal',
      minute: getCurrentMinute(),
      teamId,
      data: { goalType: 'quick_entry' }
    });
  };

  return (
    <View>
      <Text>Live Match Control</Text>
      <Text>Score: {match?.stats.homeTeam.goals} - {match?.stats.awayTeam.goals}</Text>
      
      <TouchableOpacity onPress={() => handleQuickGoal(match?.homeTeamId!)}>
        <Text>Home Goal</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleQuickGoal(match?.awayTeamId!)}>
        <Text>Away Goal</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Cloud Functions

### Automatic Stats Aggregation

The system includes Cloud Functions that automatically:

1. **Update match statistics** when events are added
2. **Calculate player performance** metrics
3. **Update team season statistics** when matches complete
4. **Generate match reports** with key moments
5. **Send real-time notifications** for important events

### Function Triggers

- `onMatchEventCreated` - Triggered when a new match event is created
- `onMatchCompleted` - Triggered when a match status changes to completed

## Security Rules

### Firestore Security Rules

The system implements role-based access control:

```javascript
// Only referees and admins can create/update match events
match /matchEvents/{eventId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    (request.auth.token.role == 'referee' || 
     request.auth.token.role == 'admin' ||
     request.auth.token.role == 'super_admin');
}

// Match data access based on user role and team membership
match /liveMatches/{matchId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    (request.auth.token.role == 'referee' || 
     request.auth.token.role == 'admin' ||
     request.auth.token.role == 'super_admin');
}
```

## Real-time Features

### Live Updates

The system provides real-time updates through Firestore listeners:

- **Match status changes** (start, pause, end)
- **Live score updates** as goals are scored
- **Event timeline** with chronological ordering
- **Statistics updates** in real-time
- **Player performance** tracking

### Offline Support

- **Mobile app** supports offline event entry with sync when online
- **Web app** shows cached data when offline
- **Conflict resolution** for simultaneous updates

## Performance Considerations

### Optimization Strategies

1. **Indexed queries** for efficient data retrieval
2. **Pagination** for large event lists
3. **Selective updates** to minimize data transfer
4. **Caching** for frequently accessed data
5. **Batch operations** for multiple updates

### Monitoring

- **Firebase Analytics** for usage tracking
- **Cloud Functions logs** for error monitoring
- **Performance monitoring** for query optimization
- **Real-time database** usage metrics

## Testing

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Run tests
npm test

# Test Cloud Functions locally
firebase functions:shell
```

### Integration Testing

1. **Create test matches** with sample data
2. **Simulate events** to test stats calculation
3. **Verify real-time updates** across multiple clients
4. **Test offline functionality** and sync behavior

## Troubleshooting

### Common Issues

1. **Permission denied errors** - Check Firestore security rules
2. **Real-time updates not working** - Verify listener setup
3. **Cloud Functions not triggering** - Check function deployment
4. **Performance issues** - Review query optimization

### Debug Tools

- **Firebase Console** for data inspection
- **Cloud Functions logs** for server-side debugging
- **Browser DevTools** for client-side debugging
- **Firebase Emulator Suite** for local testing

## Next Steps

### Planned Enhancements

1. **Video highlights** integration
2. **AI-powered insights** and analytics
3. **Advanced statistics** and heat maps
4. **Social features** and commentary
5. **Tournament brackets** and standings
6. **Mobile push notifications** for live events

### Scalability Considerations

1. **Sharding** for high-traffic matches
2. **CDN integration** for global performance
3. **Database optimization** for large datasets
4. **Load balancing** for concurrent users
5. **Caching strategies** for improved performance

## Support

For technical support or questions about the Firebase integration:

1. Check the Firebase documentation
2. Review the Cloud Functions logs
3. Test with the Firebase Emulator Suite
4. Contact the development team

---

This integration provides a robust foundation for real-time sports management with automatic statistics calculation, role-based access control, and seamless synchronization across web and mobile platforms. 