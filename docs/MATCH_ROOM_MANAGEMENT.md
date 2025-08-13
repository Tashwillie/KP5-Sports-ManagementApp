# Match Room Management System

This document describes the comprehensive match room management system for the KP5 Academy sports management platform. The system provides advanced room management capabilities for real-time match events, participant management, and room analytics.

## Overview

The Match Room Management System provides:

- **Advanced Room Management**: Create, manage, and monitor match rooms
- **Participant Management**: Add, remove, and manage participants with different roles
- **Room Settings**: Configurable room behavior and permissions
- **Real-time Analytics**: Track room usage, participant activity, and performance metrics
- **Security & Permissions**: Role-based access control and participant management
- **Automatic Cleanup**: Intelligent room lifecycle management

## Architecture

### Core Components

1. **MatchRoomManager** (`backend/src/services/matchRoomManager.ts`)
   - Central service for room management
   - Participant tracking and categorization
   - Room analytics and statistics
   - Automatic cleanup and maintenance

2. **Match Room Routes** (`backend/src/routes/matchRooms.ts`)
   - REST API endpoints for room management
   - Participant management operations
   - Room settings and metadata management

3. **WebSocket Integration** (`backend/src/services/websocketService.ts`)
   - Real-time room updates
   - Participant status broadcasting
   - Room event notifications

### Room Structure

```typescript
interface MatchRoom {
  matchId: string;
  roomName: string;
  participants: Map<string, RoomParticipant>;
  spectators: Map<string, RoomParticipant>;
  referees: Map<string, RoomParticipant>;
  coaches: Map<string, RoomParticipant>;
  admins: Map<string, RoomParticipant>;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  settings: RoomSettings;
  metadata: RoomMetadata;
}
```

## Room Categories

### 1. **Referees**
- Match officials with full control
- Can modify match events and status
- Manage room settings and participants

### 2. **Coaches**
- Team coaches with match control
- Can add match events for their team
- View team-specific analytics

### 3. **Admins**
- Room administrators with management privileges
- Can modify room settings and manage participants
- Full participant control (kick, mute, promote, demote)

### 4. **Participants**
- Active match participants
- Can send messages and view match updates
- Limited room management capabilities

### 5. **Spectators**
- View-only participants
- Can observe match events and chat
- Subject to spectator limits and restrictions

## Room Settings

### Configurable Options

```typescript
interface RoomSettings {
  allowChat: boolean;              // Enable/disable chat functionality
  allowSpectators: boolean;        // Allow spectator participation
  maxSpectators: number;           // Maximum spectator capacity
  requireApproval: boolean;        // Require approval for room entry
  autoKickInactive: boolean;       // Automatically remove inactive users
  inactivityTimeout: number;       // Inactivity timeout in minutes
  enableTypingIndicators: boolean; // Show typing indicators
  enableReadReceipts: boolean;     // Show message read receipts
}
```

### Default Settings

```typescript
const defaultSettings = {
  allowChat: true,
  allowSpectators: true,
  maxSpectators: 100,
  requireApproval: false,
  autoKickInactive: true,
  inactivityTimeout: 30,
  enableTypingIndicators: true,
  enableReadReceipts: false
};
```

## API Endpoints

### Room Management

#### Get All Match Rooms
```http
GET /api/match-rooms
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRooms": 5,
    "rooms": [
      {
        "matchId": "uuid",
        "roomName": "match:uuid",
        "participantCount": 12,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastActivity": "2024-01-01T12:00:00Z",
        "metadata": { ... }
      }
    ]
  }
}
```

#### Get Room Information
```http
GET /api/match-rooms/:matchId
Authorization: Bearer <token>
```

#### Join Match Room
```http
POST /api/match-rooms/:matchId/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "COACH",
  "teamId": "uuid",
  "permissions": ["SEND_MESSAGES", "VIEW_ANALYTICS"]
}
```

#### Leave Match Room
```http
POST /api/match-rooms/:matchId/leave
Authorization: Bearer <token>
```

### Participant Management

#### Get Room Participants
```http
GET /api/match-rooms/:matchId/participants
Authorization: Bearer <token>
```

#### Manage Participants
```http
POST /api/match-rooms/:matchId/participants/manage
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "mute",
  "targetUserId": "uuid",
  "reason": "Inappropriate behavior",
  "duration": 30
}
```

**Available Actions:**
- `kick` - Remove participant from room
- `mute` - Prevent participant from sending messages
- `promote` - Promote participant to higher role
- `demote` - Demote participant to lower role
- `ban` - Ban participant from room

#### Search Participants
```http
GET /api/match-rooms/:matchId/participants/search?query=john&category=COACH&teamId=uuid
Authorization: Bearer <token>
```

### Room Settings

#### Get Room Settings
```http
GET /api/match-rooms/:matchId/settings
Authorization: Bearer <token>
```

#### Update Room Settings
```http
PUT /api/match-rooms/:matchId/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "allowChat": false,
  "maxSpectators": 50,
  "inactivityTimeout": 15
}
```

### Room Analytics

#### Get Room Analytics
```http
GET /api/match-rooms/:matchId/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchId": "uuid",
    "analytics": {
      "totalParticipants": 15,
      "activeParticipants": 12,
      "messagesSent": 45,
      "eventsRecorded": 8,
      "averageResponseTime": 2.3,
      "peakConcurrency": 20,
      "roomUptime": 120
    }
  }
}
```

#### Get Room Statistics
```http
GET /api/match-rooms/:matchId/stats
Authorization: Bearer <token>
```

### Room Metadata

#### Get Room Metadata
```http
GET /api/match-rooms/:matchId/metadata
Authorization: Bearer <token>
```

#### Update Room Metadata
```http
PUT /api/match-rooms/:matchId/metadata
Authorization: Bearer <token>
Content-Type: application/json

{
  "weather": "Sunny",
  "pitchCondition": "Excellent",
  "expectedDuration": 90
}
```

## WebSocket Events

### Room Events

#### Participant Joined
```typescript
socket.on('participant-joined', (data) => {
  // data includes: userId, userEmail, userRole, role, teamId, timestamp
});
```

#### Participant Left
```typescript
socket.on('participant-left', (data) => {
  // data includes: userId, userEmail, userRole, timestamp
});
```

#### Participant Managed
```typescript
socket.on('participant-managed', (data) => {
  // data includes: action, targetUserId, reason, duration, managedBy, timestamp
});
```

#### Room Settings Updated
```typescript
socket.on('room-settings-updated', (data) => {
  // data includes: settings, updatedBy, timestamp
});
```

#### Participant Online/Offline
```typescript
socket.on('participant-online', (data) => {
  // data includes: userId, timestamp
});

socket.on('participant-offline', (data) => {
  // data includes: userId, timestamp
});
```

## Usage Examples

### Frontend Implementation

#### 1. Join Match Room

```typescript
import { matchRoomService } from './services/matchRoomService';

// Join room as coach
const joinRoom = async (matchId: string, teamId: string) => {
  try {
    const response = await matchRoomService.joinRoom(matchId, {
      role: 'COACH',
      teamId,
      permissions: ['SEND_MESSAGES', 'VIEW_ANALYTICS', 'MANAGE_TEAM']
    });
    
    if (response.success) {
      console.log('Successfully joined room:', response.data);
      // Subscribe to room updates
      subscribeToRoomUpdates(matchId);
    }
  } catch (error) {
    console.error('Failed to join room:', error);
  }
};
```

#### 2. Manage Participants

```typescript
// Mute a participant
const muteParticipant = async (matchId: string, userId: string, reason: string) => {
  try {
    const response = await matchRoomService.manageParticipant(matchId, {
      action: 'mute',
      targetUserId: userId,
      reason,
      duration: 30 // minutes
    });
    
    if (response.success) {
      console.log('Participant muted successfully');
    }
  } catch (error) {
    console.error('Failed to mute participant:', error);
  }
};

// Promote a participant
const promoteParticipant = async (matchId: string, userId: string) => {
  try {
    const response = await matchRoomService.manageParticipant(matchId, {
      action: 'promote',
      targetUserId: userId,
      reason: 'Outstanding performance'
    });
    
    if (response.success) {
      console.log('Participant promoted successfully');
    }
  } catch (error) {
    console.error('Failed to promote participant:', error);
  }
};
```

#### 3. Update Room Settings

```typescript
// Update room settings
const updateRoomSettings = async (matchId: string, settings: Partial<RoomSettings>) => {
  try {
    const response = await matchRoomService.updateRoomSettings(matchId, settings);
    
    if (response.success) {
      console.log('Room settings updated successfully');
      // Settings update will be broadcasted via WebSocket
    }
  } catch (error) {
    console.error('Failed to update room settings:', error);
  }
};

// Example: Disable chat and reduce spectator limit
await updateRoomSettings(matchId, {
  allowChat: false,
  maxSpectators: 25
});
```

#### 4. Monitor Room Analytics

```typescript
// Get room analytics
const getRoomAnalytics = async (matchId: string) => {
  try {
    const response = await matchRoomService.getRoomAnalytics(matchId);
    
    if (response.success) {
      const analytics = response.data.analytics;
      console.log(`Room has ${analytics.totalParticipants} participants`);
      console.log(`Room uptime: ${analytics.roomUptime} minutes`);
      console.log(`Messages sent: ${analytics.messagesSent}`);
    }
  } catch (error) {
    console.error('Failed to get room analytics:', error);
  }
};

// Real-time analytics updates
socket.on('room-analytics-updated', (data) => {
  console.log('Analytics updated:', data);
  updateAnalyticsDisplay(data);
});
```

### Backend Integration

#### 1. Room Service Integration

```typescript
import matchRoomManager from '../services/matchRoomManager';

// In your controller
export const createMatchRoom = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    
    // Create or get existing room
    const matchRoom = await matchRoomManager.getOrCreateMatchRoom(matchId);
    
    // Add initial participant (match creator)
    const participant = {
      userId: req.user.id,
      socketId: '',
      userRole: req.user.role,
      userEmail: req.user.email,
      displayName: req.user.email.split('@')[0],
      joinedAt: new Date(),
      lastActivity: new Date(),
      permissions: ['ADMIN'],
      isTyping: false,
      isOnline: true
    };
    
    matchRoomManager.addParticipant(matchId, participant, 'ADMIN');
    
    res.json({
      success: true,
      message: 'Match room created successfully',
      data: {
        matchId,
        roomName: matchRoom.roomName,
        settings: matchRoom.settings,
        metadata: matchRoom.metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create match room'
    });
  }
};
```

#### 2. WebSocket Integration

```typescript
import { webSocketService } from '../services/websocketService';
import matchRoomManager from '../services/matchRoomManager';

// Broadcast room updates
export const broadcastRoomUpdate = (matchId: string, event: string, data: any) => {
  const room = `match:${matchId}`;
  
  // Update room analytics
  matchRoomManager.updateRoomAnalytics(matchId, 'messagesSent');
  
  // Broadcast to room
  webSocketService.broadcastToRoom(room, event, {
    ...data,
    timestamp: new Date()
  });
};

// Handle participant management
export const handleParticipantAction = async (matchId: string, action: string, targetUserId: string) => {
  try {
    switch (action) {
      case 'kick':
        matchRoomManager.removeParticipant(matchId, targetUserId);
        break;
      case 'mute':
        const participant = matchRoomManager.findParticipant(matchId, targetUserId);
        if (participant) {
          participant.permissions.push('MUTED');
        }
        break;
      // ... other actions
    }
    
    // Broadcast action to room
    broadcastRoomUpdate(matchId, 'participant-managed', {
      action,
      targetUserId,
      timestamp: new Date()
    });
    
  } catch (error) {
    logger.error('Failed to handle participant action:', error);
  }
};
```

## Security & Permissions

### Role-Based Access Control

#### Super Admin
- Full access to all rooms
- Can manage any participant
- Can modify any room settings

#### Club Admin
- Access to club-related match rooms
- Can manage participants in club matches
- Can modify room settings for club matches

#### Referee
- Full control over assigned match rooms
- Can manage participants and settings
- Can modify match events and status

#### Coach
- Access to team match rooms
- Limited participant management
- Can view team-specific analytics

#### Player
- Access to match rooms as participant
- Limited room interaction
- Can send messages and view updates

#### Spectator
- Read-only access to match rooms
- Subject to spectator limits
- Limited chat permissions

### Permission System

```typescript
interface ParticipantPermissions {
  SEND_MESSAGES: boolean;      // Can send chat messages
  VIEW_ANALYTICS: boolean;     // Can view room analytics
  MANAGE_TEAM: boolean;        // Can manage team participants
  MODIFY_MATCH: boolean;       // Can modify match events
  MANAGE_ROOM: boolean;        // Can modify room settings
  MANAGE_PARTICIPANTS: boolean; // Can manage other participants
}
```

## Performance & Scalability

### Memory Management
- Room states cached in memory for fast access
- Automatic cleanup of inactive rooms
- Efficient participant tracking with Maps

### Room Limits
- Configurable spectator limits per room
- Automatic participant cleanup
- Room lifecycle management

### Analytics Optimization
- Real-time analytics updates
- Efficient metric calculation
- Minimal database queries

## Monitoring & Maintenance

### Automatic Cleanup
- Inactive participant detection
- Empty room cleanup
- Memory usage optimization

### Health Checks
- Room status monitoring
- Participant activity tracking
- Performance metrics collection

### Logging
- Comprehensive activity logging
- Error tracking and reporting
- Performance monitoring

## Testing

### Test Scripts

#### WebSocket Testing
```bash
cd backend
npm run test:websocket
```

#### Room Management Testing
```bash
node test-match-room-management.js
```

### Test Coverage

The test suite covers:
- Room creation and management
- Participant operations
- Settings management
- Analytics and statistics
- Permission validation
- Error handling
- WebSocket integration

## Troubleshooting

### Common Issues

#### 1. **Room Not Found**
- Verify match ID exists
- Check room creation process
- Verify user permissions

#### 2. **Participant Management Fails**
- Check user admin permissions
- Verify target participant exists
- Check room state

#### 3. **Settings Not Updating**
- Verify user has admin role
- Check WebSocket connection
- Verify room exists

#### 4. **Analytics Not Updating**
- Check room activity
- Verify participant tracking
- Check cleanup processes

### Debug Logging

```typescript
// Enable debug logging
logger.setLevel('debug');

// Monitor room operations
matchRoomManager.on('room-created', (room) => {
  logger.debug('Room created:', room);
});

matchRoomManager.on('participant-added', (participant) => {
  logger.debug('Participant added:', participant);
});
```

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Real-time performance metrics
   - Predictive analytics
   - Custom metric definitions

2. **Enhanced Permissions**
   - Time-based permissions
   - Conditional access control
   - Permission inheritance

3. **Room Templates**
   - Predefined room configurations
   - Quick room setup
   - Standardized settings

4. **Integration Features**
   - Calendar integration
   - Notification systems
   - Third-party integrations

### Scalability Improvements

1. **Distributed Room Management**
   - Multi-server support
   - Load balancing
   - Room distribution

2. **Database Persistence**
   - Room state persistence
   - Analytics storage
   - Historical data

3. **Advanced Caching**
   - Redis integration
   - Multi-level caching
   - Cache invalidation

## Conclusion

The Match Room Management System provides a robust, scalable foundation for managing real-time match events and participant interactions. With comprehensive room management, participant control, and analytics capabilities, it enables efficient and engaging sports management experiences.

The system is designed with security, performance, and scalability in mind, making it suitable for both small local matches and large tournament events. The modular architecture allows for easy extension and customization to meet specific requirements.
