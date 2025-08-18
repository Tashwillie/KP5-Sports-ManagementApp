import apiClient from '@/lib/apiClient';

export interface Match {
  id: string;
  title: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: any;
  awayTeam?: any;
  tournamentId?: string;
  tournament?: any;
  startTime: string;
  endTime?: string;
  location: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  refereeId?: string;
  referee?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchWithStats extends Match {
  // Additional stats can be added here
}

class MatchesService {
  async getMatches(): Promise<MatchWithStats[]> {
    try {
      console.log('🔍 Fetching matches...');
      const response = await apiClient.getMatches();
      
      if (!response.success) {
        throw new Error('Failed to fetch matches');
      }

      console.log('✅ Matches response:', response);
      
      // Ensure we get an array of matches
      let matches: any[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          matches = response.data;
        } else if (response.data.matches && Array.isArray(response.data.matches)) {
          matches = response.data.matches;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          matches = response.data.data;
        } else {
          console.warn('Matches data is not in expected format:', response.data);
          matches = [];
        }
      }

      console.log('✅ Matches extracted:', matches);
      return Array.isArray(matches) ? matches.map((match: any) => ({
        id: match.id,
        title: match.title,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        tournamentId: match.tournamentId,
        tournament: match.tournament,
        startTime: match.startTime,
        endTime: match.endTime,
        location: match.location,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        refereeId: match.refereeId,
        referee: match.referee,
        notes: match.notes,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      })) : [];
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      throw error;
    }
  }

  async getMatch(id: string): Promise<MatchWithStats> {
    try {
      console.log('🔍 Fetching match:', id);
      const response = await apiClient.getMatch(id);
      
      if (!response.success) {
        throw new Error('Failed to fetch match');
      }

      const match = response.data.match;
      return {
        id: match.id,
        title: match.title,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        tournamentId: match.tournamentId,
        tournament: match.tournament,
        startTime: match.startTime,
        endTime: match.endTime,
        location: match.location,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        refereeId: match.refereeId,
        referee: match.referee,
        notes: match.notes,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      };
    } catch (error) {
      console.error('❌ Error fetching match:', error);
      throw error;
    }
  }

  async createMatch(matchData: any): Promise<MatchWithStats> {
    try {
      console.log('🔍 Creating match:', matchData);
      const response = await apiClient.createMatch(matchData);
      
      if (!response.success) {
        throw new Error('Failed to create match');
      }

      console.log('✅ Match created successfully:', response.data.match);
      return this.getMatch(response.data.match.id);
    } catch (error) {
      console.error('❌ Error creating match:', error);
      throw error;
    }
  }

  async updateMatch(id: string, matchData: any): Promise<MatchWithStats> {
    try {
      console.log('🔍 Updating match:', id, matchData);
      const response = await apiClient.updateMatch(id, matchData);
      
      if (!response.success) {
        throw new Error('Failed to update match');
      }

      console.log('✅ Match updated successfully:', response.data.match);
      return this.getMatch(id);
    } catch (error) {
      console.error('❌ Error updating match:', error);
      throw error;
    }
  }

  async deleteMatch(id: string): Promise<void> {
    try {
      console.log('🔍 Deleting match:', id);
      const response = await apiClient.deleteMatch(id);
      
      if (!response.success) {
        throw new Error('Failed to delete match');
      }

      console.log('✅ Match deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting match:', error);
      throw error;
    }
  }

  // Get matches by status
  async getMatchesByStatus(status: string): Promise<MatchWithStats[]> {
    const matches = await this.getMatches();
    return matches.filter(match => match.status === status);
  }

  // Get upcoming matches
  async getUpcomingMatches(): Promise<MatchWithStats[]> {
    const matches = await this.getMatches();
    const now = new Date();
    return matches.filter(match => 
      match.status === 'SCHEDULED' && 
      new Date(match.startTime) > now
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  // Get recent matches
  async getRecentMatches(limit: number = 10): Promise<MatchWithStats[]> {
    const matches = await this.getMatches();
    return matches
      .filter(match => match.status === 'COMPLETED')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
}

export default new MatchesService();
