import enhancedApiClient from '@/lib/enhancedApiClient';

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
      
      // Use the dashboard stats endpoint for aggregated data
      console.log('📡 Fetching dashboard stats...');
      const dashboardResponse = await enhancedApiClient.get<{
        stats: DashboardStats;
        recentActivities: any[];
        upcomingMatches: any[];
      }>('/dashboard/stats');

      console.log('📊 Dashboard Response:', dashboardResponse);

      // Check if response succeeded
      if (!dashboardResponse.success || !dashboardResponse.data) {
        throw new Error('Dashboard API failed');
      }

      // Extract data from response
      const { stats, recentActivities, upcomingMatches } = dashboardResponse.data;

      console.log('📈 Dashboard stats:', stats);
      console.log('📊 Recent activities:', recentActivities?.length || 0);
      console.log('🗓️ Upcoming matches:', upcomingMatches?.length || 0);

      // Format the data according to our interface
      const dashboardStats: DashboardStats = {
        totalUsers: stats.totalUsers || 0,
        totalTeams: stats.totalTeams || 0,
        totalMatches: stats.totalMatches || 0,
        totalClubs: stats.totalClubs || 0,
        totalTournaments: stats.totalTournaments || 0,
        activeMatches: stats.activeMatches || 0,
        upcomingMatches: stats.upcomingMatches || 0,
        completedMatches: stats.completedMatches || 0
      };

      // Format recent activities with proper types
      const formattedActivities: RecentActivity[] = (recentActivities || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: new Date(activity.timestamp),
        userName: activity.userName,
        userId: activity.userId
      }));

      // Format upcoming matches
      const formattedUpcomingMatches: UpcomingMatch[] = (upcomingMatches || []).map((match: any) => ({
        id: match.id,
        title: match.title,
        startTime: match.startTime,
        location: match.location,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam
      }));

      // For now, we don't have recent matches from the stats endpoint
      // In the future, we might want to add another endpoint or include them in the stats
      const recentMatches: any[] = [];

      const result = {
        stats: dashboardStats,
        recentActivities: formattedActivities,
        upcomingMatches: formattedUpcomingMatches,
        recentMatches
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
