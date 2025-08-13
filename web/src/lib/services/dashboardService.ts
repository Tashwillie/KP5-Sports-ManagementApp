import apiClient from '@/lib/apiClient';

export interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalMatches: number;
  totalClubs: number;
  totalTournaments: number;
  activeMatches: number;
  upcomingMatches: number;
  completedMatches: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  userName: string;
  userId: string;
}

export interface UpcomingMatch {
  id: string;
  title: string;
  startTime: string;
  location?: string;
  homeTeam?: { id: string; name: string };
  awayTeam?: { id: string; name: string };
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  upcomingMatches: UpcomingMatch[];
  recentMatches: any[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('🔍 Fetching dashboard data...');
      console.log('🔐 Authentication status:', apiClient.isAuthenticated());
      console.log('🔑 Token:', apiClient.getToken() ? 'Present' : 'Missing');
      
      // Check if we have a token before making API calls
      if (!apiClient.isAuthenticated()) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Use the correct apiClient methods to fetch data
      console.log('📡 Making API calls...');
      const [usersResponse, teamsResponse, matchesResponse, clubsResponse, tournamentsResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getTeams(),
        apiClient.getMatches(),
        apiClient.getClubs(),
        apiClient.getTournaments()
      ]);

      console.log('📊 API Responses:', {
        users: usersResponse,
        teams: teamsResponse,
        matches: matchesResponse,
        clubs: clubsResponse,
        tournaments: tournamentsResponse
      });

      // Check if any response failed
      if (!usersResponse.success) {
        throw new Error('Users API failed');
      }
      if (!teamsResponse.success) {
        throw new Error('Teams API failed');
      }
      if (!matchesResponse.success) {
        throw new Error('Matches API failed');
      }
      if (!clubsResponse.success) {
        throw new Error('Clubs API failed');
      }
      if (!tournamentsResponse.success) {
        throw new Error('Tournaments API failed');
      }

      // Extract data from responses
      const users = usersResponse.data.users || [];
      const teams = teamsResponse.data.teams || [];
      const matches = matchesResponse.data.matches || [];
      const clubs = clubsResponse.data.clubs || [];
      const tournaments = tournamentsResponse.data.tournaments || [];

      console.log('📈 Extracted data:', {
        usersCount: users.length,
        teamsCount: teams.length,
        matchesCount: matches.length,
        clubsCount: clubs.length,
        tournamentsCount: tournaments.length
      });

      // Calculate stats
      const stats: DashboardStats = {
        totalUsers: users.length,
        totalTeams: teams.length,
        totalMatches: matches.length,
        totalClubs: clubs.length,
        totalTournaments: tournaments.length,
        activeMatches: matches.filter(m => m.status === 'IN_PROGRESS').length,
        upcomingMatches: matches.filter(m => m.status === 'SCHEDULED').length,
        completedMatches: matches.filter(m => m.status === 'COMPLETED').length
      };

      console.log('📊 Calculated stats:', stats);

      // Generate recent activities from the data
      const recentActivities: RecentActivity[] = [
        ...users.slice(0, 3).map(user => ({
          id: `user-${user.id}`,
          type: 'user_registered',
          title: 'New User Registered',
          description: `${user.displayName || user.email} joined the platform`,
          timestamp: new Date(user.createdAt),
          userName: user.displayName || 'System',
          userId: user.id
        })),
        ...teams.slice(0, 3).map(team => ({
          id: `team-${team.id}`,
          type: 'team_created',
          title: 'New Team Created',
          description: `${team.name} team has been created`,
          timestamp: new Date(team.createdAt),
          userName: 'System',
          userId: 'system'
        })),
        ...matches.slice(0, 3).map(match => ({
          id: `match-${match.id}`,
          type: 'match_created',
          title: 'New Match Scheduled',
          description: `${match.title} - ${new Date(match.startTime).toLocaleDateString()}`,
          timestamp: new Date(match.createdAt),
          userName: 'System',
          userId: 'system'
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

      // Get upcoming matches
      const upcomingMatches: UpcomingMatch[] = matches
        .filter(match => match.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5)
        .map(match => ({
          id: match.id,
          title: match.title,
          startTime: match.startTime,
          location: match.location,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam
        }));

      const result = {
        stats,
        recentActivities,
        upcomingMatches,
        recentMatches: matches.filter(m => m.status === 'COMPLETED').slice(0, 5)
      };

      console.log('✅ Dashboard data prepared:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export default new DashboardService();
