import enhancedApiClient from '@/lib/enhancedApiClient';

export interface QuickMatchData {
  title: string;
  homeTeamId: string;
  awayTeamId: string;
  startTime: string;
  location: string;
}

export interface QuickTeamData {
  name: string;
  clubId: string;
  description?: string;
}

export interface QuickTournamentData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  format: 'ROUND_ROBIN' | 'KNOCKOUT' | 'LEAGUE';
}

class QuickActionsService {
  // Quick create match
  async createQuickMatch(data: QuickMatchData) {
    try {
      console.log('🚀 Creating quick match:', data);
      const response = await enhancedApiClient.post('/matches', {
        ...data,
        status: 'SCHEDULED',
        isActive: true
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to create quick match:', error);
      throw error;
    }
  }

  // Quick create team
  async createQuickTeam(data: QuickTeamData) {
    try {
      console.log('🚀 Creating quick team:', data);
      const response = await enhancedApiClient.post('/teams', {
        ...data,
        isActive: true
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to create quick team:', error);
      throw error;
    }
  }

  // Quick create tournament
  async createQuickTournament(data: QuickTournamentData) {
    try {
      console.log('🚀 Creating quick tournament:', data);
      const response = await enhancedApiClient.post('/tournaments', {
        ...data,
        status: 'UPCOMING',
        isActive: true
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to create quick tournament:', error);
      throw error;
    }
  }

  // Get available teams for quick actions
  async getAvailableTeams() {
    try {
      const response = await enhancedApiClient.get('/teams?limit=50');
      return response.data || [];
    } catch (error) {
      console.error('❌ Failed to get teams:', error);
      return [];
    }
  }

  // Get available clubs for quick actions
  async getAvailableClubs() {
    try {
      const response = await enhancedApiClient.get('/clubs?limit=50');
      return response.data || [];
    } catch (error) {
      console.error('❌ Failed to get clubs:', error);
      return [];
    }
  }

  // Start live match tracking
  async startLiveMatch(matchId: string) {
    try {
      console.log('🔴 Starting live match tracking:', matchId);
      const response = await enhancedApiClient.put(`/matches/${matchId}/start`, {
        status: 'LIVE'
      });
      return response;
    } catch (error) {
      console.error('❌ Failed to start live match:', error);
      throw error;
    }
  }

  // Get system health for admin dashboard
  async getSystemHealth() {
    try {
      const response = await enhancedApiClient.get('/system/health');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get system health:', error);
      return {
        database: 'unknown',
        redis: 'unknown',
        api: 'unknown',
        uptime: 0
      };
    }
  }
}

export default new QuickActionsService();
