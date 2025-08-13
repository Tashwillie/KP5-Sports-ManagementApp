# Real-Time Statistics System

## Overview

The Real-Time Statistics System provides comprehensive, live-updating statistics for players, teams, and matches in the sports management platform. It integrates seamlessly with the WebSocket system to deliver instant updates as match events occur, while maintaining a robust REST API for data retrieval and a sophisticated caching system for performance optimization.

## Architecture

### Core Components

1. **StatisticsService** - Backend service for managing statistics updates and caching
2. **StatisticsController** - REST API controller for statistics endpoints
3. **RealTimeStatisticsService** - Frontend service for real-time statistics
4. **useRealTimeStatistics** - React hook for easy integration
5. **Database Models** - Comprehensive statistics tracking tables

### Data Flow

```
Match Event → WebSocket → StatisticsService → Database Update → Cache Invalidation → WebSocket Broadcast → Frontend Update
```

## Database Schema

### Player Match Statistics (`player_match_stats`)

Tracks individual player performance for each match:

```sql
CREATE TABLE player_match_stats (
  id TEXT PRIMARY KEY,
  playerId TEXT NOT NULL,
  matchId TEXT NOT NULL,
  teamId TEXT NOT NULL,
  minutesPlayed INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  shotsOnTarget INTEGER DEFAULT 0,
  yellowCards INTEGER DEFAULT 0,
  redCards INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  foulsSuffered INTEGER DEFAULT 0,
  offsides INTEGER DEFAULT 0,
  passes INTEGER DEFAULT 0,
  passesCompleted INTEGER DEFAULT 0,
  tackles INTEGER DEFAULT 0,
  tacklesWon INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  clearances INTEGER DEFAULT 0,
  saves INTEGER, -- For goalkeepers
  goalsConceded INTEGER, -- For goalkeepers
  cleanSheet BOOLEAN, -- For goalkeepers
  rating REAL DEFAULT 6.0,
  distance INTEGER DEFAULT 0, -- Distance covered in meters
  sprints INTEGER DEFAULT 0, -- Number of sprints
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Team Match Statistics (`team_match_stats`)

Tracks team performance for each match:

```sql
CREATE TABLE team_match_stats (
  id TEXT PRIMARY KEY,
  teamId TEXT NOT NULL,
  matchId TEXT NOT NULL,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  shotsOnTarget INTEGER DEFAULT 0,
  corners INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  yellowCards INTEGER DEFAULT 0,
  redCards INTEGER DEFAULT 0,
  possession INTEGER DEFAULT 50,
  passes INTEGER DEFAULT 0,
  passesCompleted INTEGER DEFAULT 0,
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  offsides INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clearances INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  distance INTEGER DEFAULT 0,
  sprints INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Player Season Statistics (`player_season_stats`)

Aggregates player performance across a season:

```sql
CREATE TABLE player_season_stats (
  id TEXT PRIMARY KEY,
  playerId TEXT NOT NULL,
  season TEXT NOT NULL,
  teamId TEXT NOT NULL,
  matchesPlayed INTEGER DEFAULT 0,
  matchesStarted INTEGER DEFAULT 0,
  minutesPlayed INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellowCards INTEGER DEFAULT 0,
  redCards INTEGER DEFAULT 0,
  cleanSheets INTEGER DEFAULT 0, -- For goalkeepers
  goalsConceded INTEGER DEFAULT 0, -- For goalkeepers
  saves INTEGER DEFAULT 0, -- For goalkeepers
  averageRating REAL DEFAULT 6.0,
  totalDistance INTEGER DEFAULT 0,
  totalSprints INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Team Season Statistics (`team_season_stats`)

Aggregates team performance across a season:

```sql
CREATE TABLE team_season_stats (
  id TEXT PRIMARY KEY,
  teamId TEXT NOT NULL,
  season TEXT NOT NULL,
  matchesPlayed INTEGER DEFAULT 0,
  matchesWon INTEGER DEFAULT 0,
  matchesDrawn INTEGER DEFAULT 0,
  matchesLost INTEGER DEFAULT 0,
  goalsFor INTEGER DEFAULT 0,
  goalsAgainst INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  cleanSheets INTEGER DEFAULT 0,
  goalsConceded INTEGER DEFAULT 0,
  averageGoalsPerGame REAL DEFAULT 0,
  averageGoalsAgainstPerGame REAL DEFAULT 0,
  winPercentage REAL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Match Statistics (`match_statistics`)

Comprehensive match overview with aggregated data:

```sql
CREATE TABLE match_statistics (
  id TEXT PRIMARY KEY,
  matchId TEXT UNIQUE NOT NULL,
  homeTeamId TEXT NOT NULL,
  awayTeamId TEXT NOT NULL,
  homeTeamStats JSONB NOT NULL, -- TeamMatchStats as JSON
  awayTeamStats JSONB NOT NULL, -- TeamMatchStats as JSON
  playerStats JSONB DEFAULT '[]', -- PlayerMatchStats[] as JSON
  totalEvents INTEGER DEFAULT 0,
  totalGoals INTEGER DEFAULT 0,
  totalCards INTEGER DEFAULT 0,
  totalSubstitutions INTEGER DEFAULT 0,
  matchDuration INTEGER DEFAULT 0, -- in minutes
  averagePossession REAL DEFAULT 50,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Backend Implementation

### StatisticsService

The core service that handles all statistics operations:

```typescript
export class StatisticsService {
  // Singleton pattern
  private static instance: StatisticsService;
  
  // Update player statistics for a match event
  public async updatePlayerStats(
    playerId: string, 
    matchId: string, 
    eventType: string, 
    eventData: any
  ): Promise<void>
  
  // Update team statistics for a match event
  public async updateTeamStats(
    teamId: string, 
    matchId: string, 
    eventType: string, 
    eventData: any
  ): Promise<void>
  
  // Update match statistics
  public async updateMatchStats(matchId: string, eventType: string, eventData: any): Promise<void>
  
  // Get cached statistics or fetch from database
  public async getCachedStats<T>(key: string, fetchFn: () => Promise<T>): Promise<T>
  
  // Subscribe to statistics updates
  public subscribe(entityType: string, entityId: string, callback: (update: StatisticsUpdate) => void): () => void
}
```

### Supported Event Types

The system automatically updates statistics for these match events:

- **GOAL** - Increments goals, updates shot accuracy
- **ASSIST** - Increments assists
- **SHOT** - Increments shots, tracks on-target shots
- **PASS** - Increments passes, tracks completed passes
- **TACKLE** - Increments tackles, tracks won tackles
- **INTERCEPTION** - Increments interceptions
- **CLEARANCE** - Increments clearances
- **SAVE** - Increments saves (goalkeeper)
- **FOUL** - Increments fouls
- **FOUL_SUFFERED** - Increments fouls suffered
- **OFFSIDE** - Increments offsides
- **YELLOW_CARD** - Increments yellow cards
- **RED_CARD** - Increments red cards
- **DISTANCE** - Tracks distance covered
- **SPRINT** - Tracks sprint count

### REST API Endpoints

#### Player Statistics

```http
GET /api/statistics/players/:playerId/matches/:matchId
GET /api/statistics/players/:playerId/seasons/:season
```

#### Team Statistics

```http
GET /api/statistics/teams/:teamId/matches/:matchId
GET /api/statistics/teams/:teamId/seasons/:season
```

#### Match Statistics

```http
GET /api/statistics/matches/:matchId
GET /api/statistics/matches/:matchId/overview
```

#### Season Statistics

```http
GET /api/statistics/seasons/:season/top-performers?limit=10
GET /api/statistics/seasons/:season/standings
```

#### Performance Comparisons

```http
GET /api/statistics/seasons/:season/players/compare?playerIds=id1,id2,id3
GET /api/statistics/seasons/:season/teams/compare?teamIds=id1,id2,id3
```

## Frontend Implementation

### RealTimeStatisticsService

Client-side service for real-time statistics:

```typescript
export class RealTimeStatisticsService {
  constructor(realTimeService: RealTimeService)
  
  // Subscribe to real-time statistics updates
  public subscribe(
    entityType: string,
    entityId: string,
    callback: (update: StatisticsUpdate) => void
  ): () => void
  
  // Subscribe to specific entity types
  public subscribeToMatch(matchId: string, callback?: (update: StatisticsUpdate) => void): () => void
  public subscribeToPlayer(playerId: string, callback?: (update: StatisticsUpdate) => void): () => void
  public subscribeToTeam(teamId: string, callback?: (update: StatisticsUpdate) => void): () => void
  
  // Data fetching with caching
  public async getPlayerMatchStats(playerId: string, matchId: string): Promise<PlayerMatchStats | null>
  public async getTeamMatchStats(teamId: string, matchId: string): Promise<TeamMatchStats | null>
  public async getMatchStats(matchId: string): Promise<MatchStatistics | null>
  
  // Cache management
  public clearCache(key?: string): void
  public clearAllCache(): void
}
```

### useRealTimeStatistics Hook

React hook for easy integration:

```typescript
export function useRealTimeStatistics(
  statisticsService: RealTimeStatisticsService,
  options: UseRealTimeStatisticsOptions = {}
): UseRealTimeStatisticsReturn

interface UseRealTimeStatisticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
}

interface UseRealTimeStatisticsReturn {
  // Data states
  playerMatchStats: PlayerMatchStats | null;
  teamMatchStats: TeamMatchStats | null;
  matchStats: MatchStatistics | null;
  topPerformers: any | null;
  teamStandings: any[] | null;
  
  // Loading states
  loading: { player: boolean; team: boolean; match: boolean; /* ... */ };
  
  // Error states
  errors: { player: string | null; team: string | null; /* ... */ };
  
  // Actions
  subscribeToMatch: (matchId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  subscribeToPlayer: (playerId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  subscribeToTeam: (teamId: string, callback?: (update: StatisticsUpdate) => void) => () => void;
  
  // Data fetching
  fetchPlayerMatchStats: (playerId: string, matchId: string) => Promise<void>;
  fetchTeamMatchStats: (teamId: string, matchId: string) => Promise<void>;
  fetchMatchStats: (matchId: string) => Promise<void>;
  
  // Cache management
  clearCache: (key?: string) => void;
  clearAllCache: () => void;
  
  // Refresh
  refreshAll: () => Promise<void>;
}
```

## Usage Examples

### Basic Statistics Display

```typescript
import { useRealTimeStatistics } from '../hooks/useRealTimeStatistics';
import { RealTimeStatisticsService } from '../services/realTimeStatisticsService';

function MatchStatistics({ matchId, statisticsService }) {
  const {
    matchStats,
    loading,
    errors,
    subscribeToMatch,
    fetchMatchStats
  } = useRealTimeStatistics(statisticsService);

  useEffect(() => {
    fetchMatchStats(matchId);
    const unsubscribe = subscribeToMatch(matchId);
    return unsubscribe;
  }, [matchId]);

  if (loading.match) return <div>Loading match statistics...</div>;
  if (errors.match) return <div>Error: {errors.match}</div>;
  if (!matchStats) return <div>No statistics available</div>;

  return (
    <div>
      <h3>Match Statistics</h3>
      <p>Total Goals: {matchStats.totalGoals}</p>
      <p>Total Cards: {matchStats.totalCards}</p>
      <p>Average Possession: {matchStats.averagePossession}%</p>
    </div>
  );
}
```

### Real-Time Player Statistics

```typescript
function PlayerStatistics({ playerId, matchId, statisticsService }) {
  const {
    playerMatchStats,
    loading,
    errors,
    subscribeToPlayer,
    fetchPlayerMatchStats
  } = useRealTimeStatistics(statisticsService);

  useEffect(() => {
    fetchPlayerMatchStats(playerId, matchId);
    const unsubscribe = subscribeToPlayer(playerId);
    return unsubscribe;
  }, [playerId, matchId]);

  if (loading.player) return <div>Loading player statistics...</div>;
  if (errors.player) return <div>Error: {errors.player}</div>;
  if (!playerMatchStats) return <div>No player statistics available</div>;

  return (
    <div>
      <h3>Player Performance</h3>
      <p>Goals: {playerMatchStats.goals}</p>
      <p>Assists: {playerMatchStats.assists}</p>
      <p>Shots: {playerMatchStats.shots}</p>
      <p>Rating: {playerMatchStats.rating}/10</p>
    </div>
  );
}
```

### Team Performance Comparison

```typescript
function TeamComparison({ teamIds, season, statisticsService }) {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await fetch(
          `/api/statistics/seasons/${season}/teams/compare?teamIds=${teamIds.join(',')}`
        );
        const data = await response.json();
        if (data.success) {
          setComparison(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch team comparison:', error);
      }
    };

    fetchComparison();
  }, [teamIds, season]);

  if (!comparison) return <div>Loading comparison...</div>;

  return (
    <div>
      <h3>Team Performance Comparison</h3>
      {comparison.teams.map(team => (
        <div key={team.teamId}>
          <h4>{team.teamId}</h4>
          <p>Points: {team.points}</p>
          <p>Goals For: {team.goalsFor}</p>
          <p>Goals Against: {team.goalsAgainst}</p>
        </div>
      ))}
    </div>
  );
}
```

## WebSocket Events

### Client to Server

```typescript
// Join player statistics room
socket.emit('join-player-stats', { playerId: 'player-123' });

// Join team statistics room
socket.emit('join-team-stats', { teamId: 'team-456' });

// Refresh statistics
socket.emit('refresh-statistics', { entityType: 'player', entityId: 'player-123' });
```

### Server to Client

```typescript
// General statistics update
socket.on('statistics-update', (update: StatisticsUpdate) => {
  console.log('Statistics updated:', update);
});

// Match-specific statistics update
socket.on('match-statistics-update', (update: StatisticsUpdate) => {
  console.log('Match statistics updated:', update);
});

// Player-specific statistics update
socket.on('player-statistics-update', (update: StatisticsUpdate) => {
  console.log('Player statistics updated:', update);
});

// Team-specific statistics update
socket.on('team-statistics-update', (update: StatisticsUpdate) => {
  console.log('Team statistics updated:', update);
});
```

## Caching Strategy

### Cache Levels

1. **Service Level Cache** - In-memory cache in StatisticsService (5-minute TTL)
2. **Client Level Cache** - Frontend cache in RealTimeStatisticsService (5-minute TTL)
3. **Database Level** - Persistent storage with optimized queries

### Cache Invalidation

- Automatic invalidation on statistics updates
- Manual cache clearing via API endpoints
- Time-based expiration (TTL)
- Event-driven invalidation

### Cache Keys

```typescript
// Player statistics
`player:${playerId}:match:${matchId}`
`player:${playerId}:season:${season}`

// Team statistics
`team:${teamId}:match:${matchId}`
`team:${teamId}:season:${season}`

// Match statistics
`match:${matchId}`
`match:${matchId}:overview`

// Season statistics
`topPerformers:${season}:${limit}`
`teamStandings:${season}`
```

## Performance Considerations

### Database Optimization

- Composite indexes on frequently queried fields
- JSONB storage for flexible statistics data
- Efficient aggregation queries
- Connection pooling

### Caching Strategy

- Multi-level caching (service, client, database)
- Intelligent cache invalidation
- Configurable TTL values
- Memory-efficient storage

### Real-Time Updates

- WebSocket-based push notifications
- Efficient room-based broadcasting
- Minimal data transfer
- Connection pooling

## Security

### Authentication

- JWT-based authentication required for all endpoints
- Role-based access control
- User permission validation

### Data Validation

- Input sanitization and validation
- SQL injection prevention
- XSS protection
- Rate limiting

### Privacy

- User consent for statistics tracking
- GDPR compliance
- Data anonymization options
- Secure data transmission

## Testing

### Test Script

Run the comprehensive test script:

```bash
node test-real-time-statistics.js
```

### Test Coverage

- REST API endpoints
- WebSocket real-time updates
- Statistics service functionality
- Cache operations
- Error handling

### Manual Testing

1. Start the backend server
2. Run the test script
3. Monitor WebSocket connections
4. Verify statistics updates
5. Check cache invalidation

## Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sports_db

# Redis (for scaling)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3001
NODE_ENV=production
```

### Database Migration

```bash
# Run the statistics tables migration
psql -d sports_db -f backend/prisma/migrations/add_statistics_tables.sql

# Or use Prisma
npx prisma migrate dev --name add_statistics_tables
```

### Scaling Considerations

- Horizontal scaling with Redis
- Load balancing for WebSocket connections
- Database connection pooling
- Cache distribution across instances

## Monitoring and Maintenance

### Health Checks

- Service health monitoring
- Database connection status
- Cache performance metrics
- WebSocket connection counts

### Performance Metrics

- Response times
- Cache hit rates
- Database query performance
- Memory usage

### Error Handling

- Comprehensive error logging
- Graceful degradation
- Automatic retry mechanisms
- User-friendly error messages

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Machine learning insights
   - Performance predictions
   - Trend analysis
   - Comparative analytics

2. **Enhanced Statistics**
   - Heat maps
   - Movement tracking
   - Advanced metrics
   - Custom calculations

3. **Real-Time Dashboards**
   - Live match tracking
   - Performance monitoring
   - Alert systems
   - Mobile optimization

4. **Integration Features**
   - Third-party statistics providers
   - Export capabilities
   - API rate limiting
   - Webhook support

### Technical Improvements

1. **Performance**
   - GraphQL implementation
   - Advanced caching strategies
   - Database optimization
   - CDN integration

2. **Scalability**
   - Microservices architecture
   - Event sourcing
   - CQRS pattern
   - Kubernetes deployment

3. **Reliability**
   - Circuit breakers
   - Retry mechanisms
   - Fallback strategies
   - Disaster recovery

## Troubleshooting

### Common Issues

1. **Statistics Not Updating**
   - Check WebSocket connection
   - Verify event emission
   - Check database permissions
   - Monitor service logs

2. **Cache Issues**
   - Clear cache manually
   - Check TTL settings
   - Monitor memory usage
   - Verify cache invalidation

3. **Performance Problems**
   - Check database indexes
   - Monitor query performance
   - Optimize cache strategy
   - Scale horizontally

### Debug Tools

- Service logs
- Database query logs
- WebSocket connection monitoring
- Cache performance metrics
- Performance profiling

### Support

- Check service documentation
- Review error logs
- Test with minimal setup
- Contact development team

## Conclusion

The Real-Time Statistics System provides a robust, scalable, and performant solution for tracking sports statistics in real-time. With its comprehensive API, intelligent caching, and seamless WebSocket integration, it delivers an excellent user experience while maintaining high performance and reliability.

The system is designed to handle high-traffic scenarios, provide accurate statistics, and scale efficiently as the platform grows. Its modular architecture makes it easy to extend and customize for specific requirements.
