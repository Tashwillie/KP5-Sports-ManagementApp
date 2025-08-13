# Team Statistics System

## Overview

The Team Statistics System is a comprehensive solution for calculating, analyzing, and presenting team performance metrics in sports management. It provides real-time statistics, advanced analytics, performance insights, and actionable recommendations for teams, coaches, and administrators.

## Features

### 🏆 Core Team Statistics
- **Basic Match Stats**: Matches played, won, drawn, lost, points, win percentages
- **Goal Statistics**: Goals for/against, goal difference, average goals, clean sheets
- **Performance Metrics**: Possession, shots, passes, tackles, distance, sprints
- **Advanced Metrics**: Shot accuracy, pass accuracy, tackle success, defensive efficiency

### 📊 Analytics & Insights
- **Performance Trends**: Week/month/quarter performance analysis
- **Form Analysis**: Current form, streaks, form scores, performance ratings
- **Efficiency Metrics**: Attack, defense, and possession efficiency calculations
- **Home/Away Performance**: Separate analysis for home and away matches
- **Season Progress**: Current position, promotion/relegation chances

### 🔄 Real-Time Updates
- **Live Statistics**: Real-time metric updates during matches
- **WebSocket Integration**: Instant statistics synchronization
- **Automatic Calculations**: Real-time performance metric computation
- **Event-Driven Updates**: Statistics updates triggered by match events

### 📈 Reporting & Export
- **Performance Reports**: Comprehensive team performance summaries
- **League Tables**: Team rankings with detailed statistics
- **Data Export**: CSV, JSON, and PDF export capabilities
- **Custom Filters**: Season, date range, tournament filtering

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Team Statistics System                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend Components  │  Backend Services  │  Data Layer   │
├─────────────────────────────────────────────────────────────┤
│ • Web Dashboard       │ • TeamStatistics   │ • PostgreSQL  │
│ • Mobile Cards        │   Service          │ • Prisma ORM  │
│ • Export Tools        │ • TeamAnalytics    │ • Redis Cache │
│ • Real-time UI        │   Service          │ • WebSockets  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Match Events** → **Statistics Service** → **Team Statistics Update**
2. **Statistics Service** → **Database** → **Cache Layer**
3. **WebSocket Events** → **Real-time Updates** → **Frontend Components**
4. **API Requests** → **Controllers** → **Services** → **Database**

## Backend Services

### 1. TeamStatisticsService

The core service for calculating and managing team performance metrics.

#### Key Methods

```typescript
// Calculate comprehensive team performance
async calculateTeamPerformance(
  teamId: string,
  season?: string,
  period?: { startDate: Date; endDate: Date }
): Promise<TeamPerformanceMetrics>

// Compare team performance with others
async compareTeamPerformance(
  teamId: string,
  comparisonType: 'league' | 'division' | 'tournament',
  season?: string
): Promise<TeamComparison>

// Get performance insights
async getTeamInsights(
  teamId: string,
  season?: string
): Promise<TeamInsights>

// Update statistics from match events
async updateTeamStatistics(teamId: string, matchId: string): Promise<void>
```

#### Performance Metrics Calculation

```typescript
// Basic metrics
const basicMetrics = {
  matchesPlayed: totalMatches,
  matchesWon: totalWins,
  matchesDrawn: totalDraws,
  matchesLost: totalLosses,
  points: totalPoints,
  winPercentage: (totalWins / totalMatches) * 100,
  goalDifference: totalGoalsFor - totalGoalsAgainst
};

// Performance metrics
const performanceMetrics = {
  averagePossession: totals.possession / matchCount,
  averageShots: totals.shots / matchCount,
  shotAccuracy: (totals.shotsOnTarget / totals.shots) * 100,
  passAccuracy: (totals.passesCompleted / totals.passes) * 100
};
```

### 2. TeamAnalyticsService

Advanced analytics service for team performance analysis and insights.

#### Key Methods

```typescript
// Generate league table
async generateLeagueTable(
  season: string,
  tournamentId?: string
): Promise<LeagueTable>

// Analyze team form
async analyzeTeamForm(
  teamId: string,
  season: string,
  tournamentId?: string
): Promise<TeamFormAnalysis>

// Calculate efficiency metrics
async calculateTeamEfficiency(
  teamId: string,
  season: string
): Promise<TeamEfficiencyMetrics>

// Get top performing teams
async getTopTeams(
  season: string,
  metric: 'points' | 'goals' | 'cleanSheets' | 'winPercentage' | 'efficiency',
  limit: number = 10,
  tournamentId?: string
): Promise<Array<TeamRanking>>
```

#### Form Analysis

```typescript
// Calculate form score (weighted average of recent performances)
const formScore = recentMatches.reduce((score, match, index) => {
  const weight = 5 - index; // More recent matches have higher weight
  return score + (match.performance * weight);
}, 0) / totalWeight;

// Determine current form
const currentForm = formScore >= 8 ? 'excellent' :
                   formScore >= 6 ? 'good' :
                   formScore >= 4 ? 'average' :
                   formScore >= 2 ? 'poor' : 'terrible';
```

#### Efficiency Calculations

```typescript
// Attack efficiency
const attackEfficiency = {
  goalsPerShot: goals / shots,
  goalsPerPossession: goals / (possession / 100),
  conversionRate: (goals / shots) * 100,
  setPieceEfficiency: setPieceGoals / setPieceAttempts
};

// Defense efficiency
const defenseEfficiency = {
  tacklesPerGoal: tackles / goalsConceded,
  cleanSheetRate: cleanSheets / matchesPlayed,
  savePercentage: saves / (saves + goalsConceded) * 100
};
```

## API Endpoints

### Team Performance Routes

```
GET /api/team-statistics/team/:teamId/performance
GET /api/team-statistics/team/:teamId/insights
GET /api/team-statistics/team/:teamId/trends
GET /api/team-statistics/team/:teamId/report
GET /api/team-statistics/team/:teamId/efficiency
GET /api/team-statistics/team/:teamId/league-comparison
GET /api/team-statistics/team/:teamId/summary
```

### League and Analytics Routes

```
GET /api/team-statistics/league/table
GET /api/team-statistics/league/top-teams
GET /api/team-statistics/team/:teamId/form
POST /api/team-statistics/teams/compare
```

### Export and Update Routes

```
GET /api/team-statistics/team/:teamId/export
POST /api/team-statistics/team/update
```

## Frontend Components

### 1. Web Dashboard (TeamStatisticsDashboard)

Comprehensive web interface for displaying team statistics with multiple tabs and detailed views.

#### Features
- **Overview Tab**: Key metrics, form analysis, home/away performance
- **Analytics Tab**: Efficiency metrics, season progress, performance trends
- **Insights Tab**: Strengths, weaknesses, opportunities, recommendations
- **Trends Tab**: Performance trends over time

#### Usage

```typescript
import TeamStatisticsDashboard from '@/components/team/TeamStatisticsDashboard';

<TeamStatisticsDashboard
  teamId="team-123"
  teamName="FC Barcelona"
  season="2024"
  onExport={(format) => handleExport(format)}
/>
```

### 2. Mobile Component (TeamStatisticsCard)

Touch-friendly mobile component for displaying team statistics in a compact format.

#### Features
- **Expandable Design**: Tap to show/hide detailed metrics
- **Form Indicators**: Visual form badges with color coding
- **Progress Bars**: Visual representation of efficiency metrics
- **Responsive Layout**: Optimized for mobile screens

#### Usage

```typescript
import TeamStatisticsCard from '../components/TeamStatisticsCard';

<TeamStatisticsCard
  metrics={teamMetrics}
  teamName="FC Barcelona"
  season="2024"
  showDetails={showDetails}
  onToggleDetails={() => setShowDetails(!showDetails)}
/>
```

## Data Models

### TeamPerformanceMetrics

```typescript
interface TeamPerformanceMetrics {
  // Basic Match Stats
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  points: number;
  winPercentage: number;
  
  // Goal Statistics
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  
  // Performance Metrics
  averagePossession: number;
  averageShots: number;
  averagePassAccuracy: number;
  
  // Form and Trends
  currentForm: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  formScore: number;
  unbeatenStreak: number;
  
  // Home/Away Performance
  homeStats: HomeAwayStats;
  awayStats: HomeAwayStats;
  
  // Season Progress
  seasonProgress: SeasonProgress;
}
```

### TeamInsights

```typescript
interface TeamInsights {
  strengths: Array<{
    category: string;
    metric: string;
    value: number;
    benchmark: number;
    description: string;
  }>;
  weaknesses: Array<{
    category: string;
    metric: string;
    value: number;
    benchmark: number;
    description: string;
  }>;
  opportunities: Array<{
    area: string;
    currentValue: number;
    potentialValue: number;
    action: string;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    expectedImpact: string;
    timeline: string;
  }>;
}
```

## Real-Time Updates

### WebSocket Events

```typescript
// Team statistics updated
socket.on('team-statistics-updated', (data) => {
  const { teamId, matchId, timestamp, data: updateData } = data;
  // Update local state with new statistics
  updateTeamStatistics(teamId, updateData);
});

// Join team room for real-time updates
socket.emit('join-team', { teamId: 'team-123' });
```

### Event-Driven Updates

```typescript
// Update team statistics when match events occur
const updateTeamStats = async (teamId: string, matchId: string) => {
  await teamStatisticsService.updateTeamStatistics(teamId, matchId);
  
  // Emit update event
  socket.emit('team-statistics-updated', {
    teamId,
    matchId,
    timestamp: new Date()
  });
};
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache team statistics with TTL
const cacheKey = `team:${teamId}:season:${season}`;
const cachedStats = await redis.get(cacheKey);

if (cachedStats) {
  return JSON.parse(cachedStats);
}

const stats = await calculateTeamPerformance(teamId, season);
await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 minutes TTL
```

### Database Optimization

```typescript
// Use database indexes for common queries
CREATE INDEX idx_team_season_stats_team_season ON team_season_stats(team_id, season);
CREATE INDEX idx_team_match_stats_team_match ON team_match_stats(team_id, match_id);
CREATE INDEX idx_matches_season_date ON matches(season, created_at);

// Optimize queries with proper joins
const teamStats = await prisma.teamSeasonStats.findMany({
  where: { season },
  include: {
    team: true,
    matchStats: {
      include: { match: true }
    }
  }
});
```

## Security

### Authentication & Authorization

```typescript
// Protect all team statistics routes
router.use(authenticateToken);

// Role-based access control
const canViewTeamStats = (user, teamId) => {
  return user.role === 'ADMIN' || 
         user.role === 'COACH' || 
         user.teams.includes(teamId);
};
```

### Data Validation

```typescript
// Validate input parameters
const validateTeamStatsRequest = (req, res, next) => {
  const { teamId, season } = req.params;
  
  if (!teamId || !isValidUUID(teamId)) {
    return res.status(400).json({ error: 'Invalid team ID' });
  }
  
  if (season && !isValidSeason(season)) {
    return res.status(400).json({ error: 'Invalid season format' });
  }
  
  next();
};
```

## Testing

### Test Script

Run the comprehensive test suite:

```bash
# Test the complete team statistics system
npm run test:team-statistics

# Or run directly
node test-team-statistics-system.js
```

### Test Coverage

The test suite covers:
- ✅ Backend health and authentication
- ✅ All API endpoints
- ✅ Team statistics calculations
- ✅ Team analytics calculations
- ✅ WebSocket connectivity and events
- ✅ Data validation and error handling
- ✅ Performance optimization
- ✅ Export functionality

## Deployment

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sports_db"

# Redis
REDIS_URL="redis://localhost:6379"

# API Configuration
API_BASE_URL="https://api.yoursportsapp.com"
WEBSOCKET_URL="wss://api.yoursportsapp.com"

# Security
JWT_SECRET="your-jwt-secret"
CORS_ORIGIN="https://yoursportsapp.com"
```

### Docker Deployment

```dockerfile
# Dockerfile for team statistics service
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  team-statistics:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
```

## Monitoring & Analytics

### Performance Metrics

```typescript
// Track API response times
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // Send to monitoring service
    metrics.histogram('api_response_time', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  
  next();
};
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connectivity
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        websocket: 'active'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Troubleshooting

### Common Issues

#### 1. Statistics Not Updating

**Problem**: Team statistics not updating after match events.

**Solution**:
```typescript
// Check if match events are being processed
console.log('Match event received:', event);

// Verify team statistics service is running
const isServiceRunning = await teamStatisticsService.isHealthy();
console.log('Service health:', isServiceRunning);

// Check database connections
const dbConnection = await prisma.$queryRaw`SELECT 1`;
console.log('Database connection:', dbConnection);
```

#### 2. Performance Issues

**Problem**: Slow response times for statistics endpoints.

**Solution**:
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Add database indexes
CREATE INDEX CONCURRENTLY idx_team_stats_performance ON team_season_stats(team_id, season, points);

// Implement caching
const cachedStats = await redis.get(cacheKey);
if (cachedStats) return JSON.parse(cachedStats);
```

#### 3. WebSocket Connection Issues

**Problem**: Real-time updates not working.

**Solution**:
```typescript
// Check WebSocket connection status
socket.on('connect', () => {
  console.log('WebSocket connected');
});

socket.on('disconnect', (reason) => {
  console.log('WebSocket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});
```

### Debug Mode

Enable debug logging:

```typescript
// Set debug environment variable
process.env.DEBUG = 'team-statistics:*';

// Or enable specific debug categories
process.env.DEBUG = 'team-statistics:service,team-statistics:websocket';
```

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - Predictive analytics for match outcomes
   - Player performance predictions
   - Team strategy recommendations

2. **Advanced Visualizations**
   - Interactive charts and graphs
   - Heat maps for player positioning
   - 3D match replay analysis

3. **Mobile App Features**
   - Push notifications for statistics updates
   - Offline statistics viewing
   - Social sharing of team achievements

4. **API Enhancements**
   - GraphQL support for flexible queries
   - Webhook notifications for real-time updates
   - Rate limiting and API versioning

### Performance Improvements

1. **Database Optimization**
   - Partitioning for large datasets
   - Read replicas for analytics queries
   - Advanced indexing strategies

2. **Caching Strategy**
   - Multi-level caching (Redis + CDN)
   - Intelligent cache invalidation
   - Cache warming for popular queries

3. **Scalability**
   - Horizontal scaling with load balancers
   - Microservices architecture
   - Event-driven architecture with message queues

## Support & Documentation

### Getting Help

- **Documentation**: This document and API reference
- **Issues**: GitHub issues for bug reports
- **Discussions**: GitHub discussions for questions
- **Support**: Email support for enterprise customers

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code style
- **Prettier**: Automatic code formatting
- **Testing**: Minimum 80% test coverage

## Conclusion

The Team Statistics System provides a comprehensive solution for team performance analysis in sports management. With real-time updates, advanced analytics, and actionable insights, it empowers teams, coaches, and administrators to make data-driven decisions and improve performance.

The system is designed to be scalable, performant, and easy to integrate with existing sports management platforms. Whether you're tracking a local team or managing a professional league, the Team Statistics System provides the tools you need to succeed.
