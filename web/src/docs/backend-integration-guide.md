# Backend Integration Guide

This guide explains how to test the backend connection and use real data instead of mock data in the Advanced Features demo.

## 🚀 Quick Start

### 1. Start the Backend Server

First, ensure your PostgreSQL backend is running:

```bash
cd backend
npm run dev
```

The backend should be running on `http://localhost:3001` (or your configured port).

### 2. Test Backend Connection

Navigate to `/test-backend-connection` in your web app to verify the connection:

- **Overview Tab**: Shows connection status and data summary
- **Tournaments Tab**: Displays available tournaments from the database
- **Matches Tab**: Shows all matches with their current status
- **Teams Tab**: Lists all teams with their details
- **Clubs Tab**: Displays club information

### 3. Use Advanced Features with Real Data

Once connected, visit `/advanced-features-demo` to see the features using real data from your backend.

## 🔧 Configuration

### Environment Variables

Ensure your web app has the correct backend URL configured:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### API Endpoints

The system expects these backend endpoints to be available:

- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Get specific tournament
- `GET /api/matches` - List all matches
- `GET /api/teams` - List all teams
- `GET /api/clubs` - List all clubs
- `PATCH /api/matches/:id` - Update match status/score
- `POST /api/matches/:id/events` - Add match events

## 📊 Data Structure

### Backend Models

The system maps backend data to frontend interfaces:

#### Tournament
```typescript
interface BackendTournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS';
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  maxTeams?: number;
  // ... other fields
}
```

#### Match
```typescript
interface BackendMatch {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  homeScore?: number;
  awayScore?: number;
  homeTeamId?: string;
  awayTeamId?: string;
  // ... other fields
}
```

### Data Transformation

The system automatically transforms backend data to match frontend expectations:

- **Format Mapping**: `SINGLE_ELIMINATION` → `KNOCKOUT`
- **Status Mapping**: `UPCOMING` → `DRAFT`
- **Field Mapping**: `location` → `venue`

## 🧪 Testing

### 1. Connection Test

Visit `/test-backend-connection` to verify:
- ✅ Backend connectivity
- ✅ Data availability
- ✅ API endpoint responses
- ✅ Error handling

### 2. Feature Testing

Test each advanced feature with real data:

#### Tournament Bracket
- View tournament structure
- Check match statuses
- Test referee controls

#### Live Match Tracker
- Start/pause/end matches
- Record goals and cards
- Update match statistics

#### Real-Time Statistics
- View live match data
- Check player statistics
- Monitor team performance

### 3. Error Scenarios

Test error handling:
- Backend offline
- Network timeouts
- Invalid data responses
- Authentication failures

## 🔄 Data Flow

### 1. Data Fetching
```
Frontend → React Query → AdvancedFeaturesDataService → Backend API
```

### 2. Real-Time Updates
```
Backend → WebSocket → useWebSocket Hook → Component State
```

### 3. Data Mutations
```
Component → Mutation Hook → Data Service → Backend API → Cache Invalidation
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Failed
- Check backend server status
- Verify API base URL configuration
- Check network connectivity
- Review CORS settings

#### 2. No Data Displayed
- Verify database has seed data
- Check API endpoint responses
- Review data transformation logic
- Check browser console for errors

#### 3. Real-Time Updates Not Working
- Verify WebSocket connection
- Check backend WebSocket implementation
- Review event subscription logic

### Debug Steps

1. **Check Browser Console**
   - Look for API errors
   - Verify network requests
   - Check WebSocket connection status

2. **Verify Backend Logs**
   - Check server startup
   - Review API request logs
   - Verify database connections

3. **Test API Endpoints**
   - Use Postman or curl
   - Verify response format
   - Check authentication

## 📈 Performance

### Optimization Features

- **React Query Caching**: Automatic data caching and invalidation
- **Stale Time Configuration**: Optimized refetch intervals
- **Background Updates**: Non-blocking data synchronization
- **Error Boundaries**: Graceful error handling

### Monitoring

- Connection status indicators
- Data loading states
- Error message display
- Performance metrics

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Caching**
   - Redis integration
   - Persistent cache storage
   - Cache warming strategies

2. **Real-Time Analytics**
   - Live performance metrics
   - Predictive analytics
   - Advanced visualizations

3. **Multi-Device Sync**
   - Cross-device state synchronization
   - Offline support
   - Conflict resolution

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Prisma Database Guide](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify backend server status
4. Check database connectivity
5. Review API endpoint responses

For additional help, refer to the project documentation or create an issue in the repository.
