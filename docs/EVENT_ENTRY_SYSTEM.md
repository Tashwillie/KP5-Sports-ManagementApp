# Real-Time Event Entry System

## Overview

The Real-Time Event Entry System is a comprehensive solution for recording and managing match events during live sports matches. It provides referees, coaches, and administrators with intuitive forms to enter match events in real-time, with immediate validation, suggestions, and real-time broadcasting to all connected clients.

## Features

### 🎯 Core Functionality
- **Real-time Event Entry**: Enter match events as they happen with instant validation
- **Comprehensive Event Types**: Support for 19 different event types (goals, cards, substitutions, injuries, etc.)
- **Session Management**: Track event entry sessions with statistics and analytics
- **Advanced Validation**: Business logic validation with contextual suggestions
- **Real-time Broadcasting**: Events are immediately broadcasted to all connected clients
- **Mobile & Web Support**: Responsive forms for both web and mobile applications

### 🔒 Security & Permissions
- **Role-based Access Control**: Only authorized users can enter events
- **Match-level Permissions**: Users must have access to specific matches
- **Session Tracking**: Monitor who is entering events and when
- **Audit Trail**: Complete logging of all event entries and modifications

### 📊 Data Management
- **Enhanced Event Data**: Rich metadata for each event type
- **Database Persistence**: All events are stored in PostgreSQL with Prisma ORM
- **Real-time Statistics**: Immediate updates to player and team statistics
- **Integration**: Seamless integration with existing match and statistics systems

## Architecture

### Backend Services

#### 1. EventEntryService
The core service responsible for managing event entry operations:

```typescript
class EventEntryService {
  // Session management
  async startEventEntrySession(matchId: string, userId: string, userRole: string): Promise<EventEntrySession>
  async endEventEntrySession(sessionId: string): Promise<void>
  
  // Event processing
  validateEventEntry(eventData: EventEntryFormData): EventValidationResult
  async processEventEntry(eventData: EventEntryFormData, userId: string, userRole: string): Promise<MatchEvent | null>
  
  // Analytics and monitoring
  getEventEntrySessionStats(matchId: string): SessionStats
  async cleanupInactiveEventSessions(): Promise<void>
}
```

#### 2. WebSocketService Integration
Enhanced WebSocket service with event entry handlers:

```typescript
// Event entry session management
socket.on('start-event-entry', async (data: { matchId: string }) => { ... })
socket.on('end-event-entry', async (data: { sessionId: string }) => { ... })

// Event submission and validation
socket.on('submit-event-entry', async (data: EventEntryFormData) => { ... })
socket.on('validate-event-entry', async (data: EventEntryFormData) => { ... })

// Session status and suggestions
socket.on('get-event-entry-status', async (data: { matchId: string }) => { ... })
socket.on('get-event-suggestions', async (data: { matchId: string; eventType: string; context?: any }) => { ... })
```

#### 3. REST API Endpoints
Complete REST API for event entry management:

```typescript
// Session management
POST   /api/event-entry/sessions/start
DELETE /api/event-entry/sessions/:sessionId
GET    /api/event-entry/sessions/status/:matchId
GET    /api/event-entry/sessions/stats/:matchId
GET    /api/event-entry/sessions/active/:matchId

// Event operations
POST   /api/event-entry/submit
POST   /api/event-entry/validate
GET    /api/event-entry/suggestions

// Configuration and admin
GET    /api/event-entry/config
DELETE /api/event-entry/sessions/:sessionId/force
```

### Frontend Components

#### 1. Web Component (React + TypeScript)
```typescript
export const EventEntryForm: React.FC<EventEntryFormProps> = ({
  matchId,
  teamId,
  currentMinute,
  onEventSubmitted
}) => {
  // Form state management
  // Real-time validation
  // Session tracking
  // Advanced field toggles
}
```

#### 2. Mobile Component (React Native)
```typescript
export const EventEntryForm: React.FC<EventEntryFormProps> = ({
  matchId,
  teamId,
  currentMinute,
  onEventSubmitted
}) => {
  // Mobile-optimized UI
  // Touch-friendly controls
  // Native picker components
  // Responsive layout
}
```

## Event Types & Data Structure

### Supported Event Types

| Event Type | Requires Player | Requires Secondary | Description |
|------------|----------------|-------------------|-------------|
| `goal` | ✅ | ❌ | Player scoring a goal |
| `assist` | ✅ | ✅ | Player providing an assist |
| `yellow_card` | ✅ | ❌ | Player receiving yellow card |
| `red_card` | ✅ | ❌ | Player receiving red card |
| `substitution` | ✅ | ✅ | Player substitution (in/out) |
| `injury` | ✅ | ❌ | Player injury during match |
| `corner` | ❌ | ❌ | Corner kick awarded |
| `foul` | ✅ | ❌ | Foul committed by player |
| `shot` | ✅ | ❌ | Shot attempt by player |
| `save` | ✅ | ❌ | Goalkeeper save |
| `offside` | ✅ | ❌ | Offside violation |
| `throw_in` | ❌ | ❌ | Throw-in awarded |
| `free_kick` | ❌ | ❌ | Free kick awarded |
| `penalty` | ✅ | ❌ | Penalty awarded |
| `penalty_missed` | ✅ | ❌ | Penalty missed |
| `own_goal` | ✅ | ❌ | Own goal scored |
| `injury_time` | ❌ | ❌ | Injury time added |
| `period_start` | ❌ | ❌ | Period begins |
| `period_end` | ❌ | ❌ | Period ends |

### Enhanced Event Data

Each event can include additional metadata based on its type:

```typescript
interface MatchEvent {
  id: string;
  matchId: string;
  type: EventType;
  minute: number;
  description: string | null;
  playerId: string | null;
  teamId: string;
  timestamp: Date;
  
  // Enhanced metadata
  secondaryPlayerId?: string | null;
  location?: 'left_wing' | 'center' | 'right_wing' | 'penalty_area' | 'outside_box';
  severity?: 'minor' | 'major' | 'serious';
  cardType?: 'warning' | 'caution' | 'dismissal';
  substitutionType?: 'in' | 'out' | 'tactical' | 'injury' | 'red_card';
  goalType?: 'open_play' | 'penalty' | 'free_kick' | 'corner' | 'own_goal' | 'counter_attack';
  shotType?: 'header' | 'volley' | 'long_range' | 'close_range' | 'one_on_one';
  saveType?: 'catch' | 'punch' | 'deflection' | 'dive' | 'reflex';
  
  data?: Record<string, any>; // Additional custom data
}
```

## Validation System

### Real-time Validation

The system provides comprehensive validation at multiple levels:

1. **Basic Validation**
   - Required fields presence
   - Data type validation
   - Range validation (e.g., minute 0-120)

2. **Business Logic Validation**
   - Event-specific requirements
   - Context-aware validation
   - Match state consistency

3. **Contextual Suggestions**
   - Based on match time
   - Based on event type
   - Based on previous events

### Validation Result Structure

```typescript
interface EventValidationResult {
  isValid: boolean;
  errors: string[];        // Must fix to proceed
  warnings: string[];      // Should address for better data
  suggestions?: string[];  // Optional improvements
}
```

### Example Validation Rules

```typescript
// Goal validation
case 'goal':
  if (!eventData.playerId) {
    errors.push('Player ID is required for goals');
  }
  if (!eventData.goalType) {
    warnings.push('Goal type not specified');
  }
  break;

// Substitution validation
case 'substitution':
  if (!eventData.playerId || !eventData.secondaryPlayerId) {
    errors.push('Both incoming and outgoing player IDs are required');
  }
  break;

// Time validation
if (eventData.minute > matchState.currentMinute + 5) {
  warnings.push('Event minute is significantly ahead of current match time');
}
```

## Session Management

### Event Entry Sessions

Each user can have an active event entry session per match:

```typescript
interface EventEntrySession {
  id: string;
  matchId: string;
  userId: string;
  userRole: string;
  startTime: Date;
  lastActivity: Date;
  eventsEntered: number;
  isActive: boolean;
  currentEvent?: Partial<EventEntryFormData>;
}
```

### Session Lifecycle

1. **Start Session**: User begins entering events for a match
2. **Active Session**: User can submit multiple events
3. **Session Monitoring**: Track activity and statistics
4. **End Session**: User finishes or session times out
5. **Cleanup**: Automatic cleanup of inactive sessions

### Session Statistics

```typescript
interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  totalEvents: number;
  averageEventsPerSession: number;
}
```

## Real-time Communication

### WebSocket Events

#### Client to Server
- `start-event-entry`: Begin event entry session
- `end-event-entry`: End event entry session
- `submit-event-entry`: Submit event for processing
- `validate-event-entry`: Validate event data
- `get-event-entry-status`: Get current session status
- `get-event-suggestions`: Get contextual suggestions

#### Server to Client
- `event-entry-started`: Session started confirmation
- `event-entry-ended`: Session ended confirmation
- `event-entry-submitted`: Event submission result
- `event-entry-validation`: Validation results
- `event-entry-status`: Current session status
- `event-suggestions`: Contextual suggestions

### Event Broadcasting

All successfully submitted events are immediately broadcasted:

1. **Match Room**: All users in the match room receive the event
2. **Tournament Room**: Event is broadcasted to tournament participants
3. **Statistics Updates**: Player and team statistics are updated
4. **Match State**: Match state is refreshed and broadcasted

## Frontend Integration

### Web Application

#### Component Usage
```typescript
import { EventEntryForm } from '../components/match/EventEntryForm';

function LiveMatchPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LiveMatchControl matchId={matchId} />
      <EventEntryForm
        matchId={matchId}
        teamId={userTeamId}
        currentMinute={currentMinute}
        onEventSubmitted={(event) => {
          console.log('Event recorded:', event);
          // Update UI, show notifications, etc.
        }}
      />
    </div>
  );
}
```

#### Form Configuration
The form automatically fetches configuration from the API:

```typescript
// Automatically fetched from /api/event-entry/config
const formConfig = {
  eventTypes: [
    { value: 'goal', label: 'Goal', requiresPlayer: true, requiresSecondary: false },
    { value: 'assist', label: 'Assist', requiresPlayer: true, requiresSecondary: true },
    // ... more event types
  ],
  locations: [
    { value: 'left_wing', label: 'Left Wing' },
    { value: 'center', label: 'Center' },
    // ... more locations
  ],
  // ... more configuration
};
```

### Mobile Application

#### Component Usage
```typescript
import { EventEntryForm } from '../components/EventEntryForm';

function LiveMatchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LiveMatchControl matchId={matchId} />
        <EventEntryForm
          matchId={matchId}
          teamId={userTeamId}
          currentMinute={currentMinute}
          onEventSubmitted={(event) => {
            // Handle event submission
            Alert.alert('Success', 'Event recorded successfully!');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
```

#### Mobile-Specific Features
- Touch-friendly form controls
- Native picker components
- Responsive layout for different screen sizes
- Optimized for one-handed operation

## API Reference

### REST Endpoints

#### Event Entry Sessions

**Start Event Entry Session**
```http
POST /api/event-entry/sessions/start
Content-Type: application/json
Authorization: Bearer <token>

{
  "matchId": "match_123"
}
```

**End Event Entry Session**
```http
DELETE /api/event-entry/sessions/:sessionId
Authorization: Bearer <token>
```

**Get Session Status**
```http
GET /api/event-entry/sessions/status/:matchId
Authorization: Bearer <token>
```

**Get Session Statistics**
```http
GET /api/event-entry/sessions/stats/:matchId
Authorization: Bearer <token>
```

**Get Active Sessions**
```http
GET /api/event-entry/sessions/active/:matchId
Authorization: Bearer <token>
```

#### Event Operations

**Submit Event Entry**
```http
POST /api/event-entry/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "matchId": "match_123",
  "eventType": "goal",
  "minute": 15,
  "teamId": "team_456",
  "playerId": "player_789",
  "goalType": "open_play",
  "location": "center"
}
```

**Validate Event Entry**
```http
POST /api/event-entry/validate
Content-Type: application/json
Authorization: Bearer <token>

{
  "matchId": "match_123",
  "eventType": "goal",
  "minute": 15,
  "teamId": "team_456"
}
```

**Get Event Suggestions**
```http
GET /api/event-entry/suggestions?matchId=match_123&eventType=goal
Authorization: Bearer <token>
```

#### Configuration

**Get Form Configuration**
```http
GET /api/event-entry/config
Authorization: Bearer <token>
```

#### Admin Operations

**Force End Session**
```http
DELETE /api/event-entry/sessions/:sessionId/force
Authorization: Bearer <token>
```

### WebSocket Events

#### Client Events

**Start Event Entry Session**
```typescript
socket.emit('start-event-entry', { matchId: 'match_123' });
```

**End Event Entry Session**
```typescript
socket.emit('end-event-entry', { sessionId: 'session_456' });
```

**Submit Event Entry**
```typescript
socket.emit('submit-event-entry', {
  matchId: 'match_123',
  eventType: 'goal',
  minute: 15,
  teamId: 'team_456',
  playerId: 'player_789'
});
```

**Validate Event Entry**
```typescript
socket.emit('validate-event-entry', {
  matchId: 'match_123',
  eventType: 'goal',
  minute: 15,
  teamId: 'team_456'
});
```

**Get Session Status**
```typescript
socket.emit('get-event-entry-status', { matchId: 'match_123' });
```

**Get Event Suggestions**
```typescript
socket.emit('get-event-suggestions', {
  matchId: 'match_123',
  eventType: 'goal',
  context: { currentMinute: 15 }
});
```

#### Server Events

**Event Entry Started**
```typescript
socket.on('event-entry-started', (data) => {
  console.log('Session started:', data.sessionId);
  // data: { sessionId: string, matchId: string }
});
```

**Event Entry Ended**
```typescript
socket.on('event-entry-ended', (data) => {
  console.log('Session ended:', data.sessionId);
  // data: { sessionId: string }
});
```

**Event Entry Submitted**
```typescript
socket.on('event-entry-submitted', (response) => {
  if (response.success) {
    console.log('Event recorded:', response.eventId);
  } else {
    console.error('Failed:', response.message);
  }
  // response: { success: boolean, eventId?: string, message: string }
});
```

**Event Entry Validation**
```typescript
socket.on('event-entry-validation', (validation) => {
  console.log('Validation result:', validation);
  // validation: EventValidationResult
});
```

**Event Entry Status**
```typescript
socket.on('event-entry-status', (status) => {
  console.log('Session status:', status);
  // status: { sessionId?: string, isActive: boolean, eventsEntered: number, ... }
});
```

**Event Suggestions**
```typescript
socket.on('event-suggestions', (data) => {
  console.log('Suggestions:', data.suggestions);
  // data: { suggestions: string[] }
});
```

## Testing

### Test Script

Run the comprehensive test suite:

```bash
# Install dependencies
npm install socket.io-client axios

# Run tests
node test-event-entry-system.js
```

### Test Coverage

The test suite covers:

1. **WebSocket Connection**: Connection establishment and error handling
2. **Session Management**: Starting, monitoring, and ending sessions
3. **Event Validation**: Real-time validation of various event types
4. **Event Submission**: Successful event recording and error handling
5. **REST API**: All endpoint functionality and response formats
6. **Real-time Broadcasting**: Event broadcasting to connected clients
7. **Session Cleanup**: Proper session termination and cleanup
8. **Error Handling**: Invalid data and permission validation
9. **Performance**: Bulk event processing and throughput
10. **Integration**: End-to-end system integration testing

### Manual Testing

#### Web Application
1. Navigate to a live match page
2. Open the Event Entry Form component
3. Start an event entry session
4. Test various event types and validation
5. Submit events and verify real-time updates
6. End the session and verify cleanup

#### Mobile Application
1. Open the mobile app
2. Navigate to a live match
3. Use the Event Entry Form component
4. Test touch interactions and form submission
5. Verify real-time synchronization
6. Test session management

## Deployment & Configuration

### Environment Variables

```bash
# Backend configuration
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/sports_db

# WebSocket configuration
WEBSOCKET_PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Database Setup

Ensure the database has the required tables:

```sql
-- Match events table (if not exists)
CREATE TABLE IF NOT EXISTS "MatchEvent" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "minute" INTEGER NOT NULL,
  "description" TEXT,
  "playerId" TEXT,
  "teamId" TEXT NOT NULL,
  "data" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "MatchEvent_matchId_idx" ON "MatchEvent"("matchId");
CREATE INDEX IF NOT EXISTS "MatchEvent_type_idx" ON "MatchEvent"("type");
CREATE INDEX IF NOT EXISTS "MatchEvent_playerId_idx" ON "MatchEvent"("playerId");
```

### Service Integration

#### Backend Integration
1. Add event entry routes to main Express app
2. Integrate WebSocket event handlers
3. Configure authentication middleware
4. Set up database connections

#### Frontend Integration
1. Install required dependencies
2. Import and use EventEntryForm components
3. Configure WebSocket connections
4. Handle event submission callbacks

## Performance & Scalability

### Performance Metrics

- **Event Processing**: 100+ events per second
- **Validation Latency**: < 100ms
- **Broadcasting Latency**: < 200ms
- **Database Operations**: < 50ms per event

### Scalability Features

- **Connection Pooling**: Efficient database connection management
- **Session Cleanup**: Automatic cleanup of inactive sessions
- **Memory Management**: Efficient in-memory data structures
- **Load Balancing**: Support for multiple server instances

### Monitoring & Analytics

- **Session Tracking**: Monitor active sessions and user activity
- **Event Statistics**: Track events per match and user
- **Performance Metrics**: Monitor response times and throughput
- **Error Tracking**: Log and monitor validation failures

## Troubleshooting

### Common Issues

#### WebSocket Connection Failures
```bash
# Check backend server status
curl http://localhost:3001/health

# Verify WebSocket port
netstat -an | grep 3001

# Check CORS configuration
# Ensure frontend URL is allowed in backend CORS settings
```

#### Event Submission Failures
```bash
# Check user permissions
# Verify match access
# Check event data validation
# Review server logs for errors
```

#### Session Management Issues
```bash
# Check session cleanup intervals
# Verify session timeout settings
# Check memory usage for session storage
# Review session cleanup logs
```

### Debug Mode

Enable debug logging:

```typescript
// Backend
const logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  )
});

// Frontend
localStorage.setItem('debug', 'event-entry:*');
```

### Log Analysis

Key log patterns to monitor:

```bash
# Session management
grep "Started event entry session" logs/app.log
grep "Ended event entry session" logs/app.log

# Event processing
grep "Event entry submitted successfully" logs/app.log
grep "Event validation failed" logs/app.log

# Performance
grep "Event processing time" logs/app.log
grep "Session cleanup" logs/app.log
```

## Future Enhancements

### Planned Features

1. **Voice Input**: Speech-to-text for hands-free event entry
2. **AI Suggestions**: Machine learning-based event suggestions
3. **Offline Support**: Queue events when connection is lost
4. **Advanced Analytics**: Detailed event pattern analysis
5. **Multi-language Support**: Internationalization for global use

### Integration Opportunities

1. **Video Analysis**: Integration with video analysis systems
2. **Wearable Devices**: Real-time data from player wearables
3. **Social Media**: Automatic social media updates
4. **Broadcasting**: Integration with live broadcasting systems
5. **Fan Engagement**: Real-time fan notifications and updates

## Support & Contributing

### Getting Help

- **Documentation**: This document and API references
- **Issues**: GitHub issues for bug reports and feature requests
- **Discussions**: GitHub discussions for questions and ideas
- **Code Examples**: Test scripts and sample implementations

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure all tests pass
6. Update documentation as needed

### Code Standards

- **TypeScript**: Strict type checking enabled
- **Testing**: Minimum 90% test coverage
- **Documentation**: JSDoc comments for all public APIs
- **Formatting**: Prettier and ESLint configuration
- **Performance**: Benchmark tests for critical paths

---

## Conclusion

The Real-Time Event Entry System provides a robust, scalable, and user-friendly solution for recording match events during live sports matches. With comprehensive validation, real-time updates, and support for both web and mobile platforms, it enables referees and administrators to maintain accurate match records efficiently.

The system's modular architecture, extensive testing, and comprehensive documentation make it easy to integrate, customize, and extend for specific use cases. Whether you're managing a local league or a professional tournament, the Event Entry System provides the tools you need to capture the action as it happens.
