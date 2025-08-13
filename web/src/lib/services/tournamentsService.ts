import apiClient from '@/lib/apiClient';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  type: string;
  maxTeams: number;
  currentTeams: number;
  venue: string;
  prize: string;
  organizer: string;
  organizerId: string;
  registrationDeadline: Date;
  entryFee: number;
  rules: string;
}

export interface TournamentWithStats extends Tournament {
  // Additional stats can be added here
}

class TournamentsService {
  async getTournaments(): Promise<TournamentWithStats[]> {
    try {
      console.log('🔍 Fetching tournaments...');
      const response = await apiClient.getTournaments();
      
      if (!response.success) {
        throw new Error('Failed to fetch tournaments');
      }

      console.log('✅ Tournaments fetched successfully:', response.data.tournaments);
      return response.data.tournaments.map((tournament: any) => ({
        id: tournament.id,
        name: tournament.name,
        description: tournament.description || '',
        startDate: new Date(tournament.startDate),
        endDate: new Date(tournament.endDate),
        status: tournament.status || 'upcoming',
        type: tournament.type || 'league',
        maxTeams: tournament.maxTeams || 16,
        currentTeams: tournament.teams?.length || 0,
        venue: tournament.venue || '',
        prize: tournament.prize || '',
        organizer: tournament.organizer?.displayName || 'Unknown',
        organizerId: tournament.organizerId || '',
        registrationDeadline: new Date(tournament.registrationDeadline),
        entryFee: tournament.entryFee || 0,
        rules: tournament.rules || '',
      }));
    } catch (error) {
      console.error('❌ Error fetching tournaments:', error);
      throw error;
    }
  }

  async getTournament(id: string): Promise<TournamentWithStats> {
    try {
      console.log('🔍 Fetching tournament:', id);
      const response = await apiClient.getTournament(id);
      
      if (!response.success) {
        throw new Error('Failed to fetch tournament');
      }

      const tournament = response.data.tournament;
      return {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description || '',
        startDate: new Date(tournament.startDate),
        endDate: new Date(tournament.endDate),
        status: tournament.status || 'upcoming',
        type: tournament.type || 'league',
        maxTeams: tournament.maxTeams || 16,
        currentTeams: tournament.teams?.length || 0,
        venue: tournament.venue || '',
        prize: tournament.prize || '',
        organizer: tournament.organizer?.displayName || 'Unknown',
        organizerId: tournament.organizerId || '',
        registrationDeadline: new Date(tournament.registrationDeadline),
        entryFee: tournament.entryFee || 0,
        rules: tournament.rules || '',
      };
    } catch (error) {
      console.error('❌ Error fetching tournament:', error);
      throw error;
    }
  }

  async createTournament(tournamentData: any): Promise<TournamentWithStats> {
    try {
      console.log('🔍 Creating tournament:', tournamentData);
      const response = await apiClient.createTournament(tournamentData);
      
      if (!response.success) {
        throw new Error('Failed to create tournament');
      }

      console.log('✅ Tournament created successfully:', response.data.tournament);
      return this.getTournament(response.data.tournament.id);
    } catch (error) {
      console.error('❌ Error creating tournament:', error);
      throw error;
    }
  }

  async updateTournament(id: string, tournamentData: any): Promise<TournamentWithStats> {
    try {
      console.log('🔍 Updating tournament:', id, tournamentData);
      const response = await apiClient.updateTournament(id, tournamentData);
      
      if (!response.success) {
        throw new Error('Failed to update tournament');
      }

      console.log('✅ Tournament updated successfully:', response.data.tournament);
      return this.getTournament(id);
    } catch (error) {
      console.error('❌ Error updating tournament:', error);
      throw error;
    }
  }

  async deleteTournament(id: string): Promise<void> {
    try {
      console.log('🔍 Deleting tournament:', id);
      const response = await apiClient.deleteTournament(id);
      
      if (!response.success) {
        throw new Error('Failed to delete tournament');
      }

      console.log('✅ Tournament deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting tournament:', error);
      throw error;
    }
  }

  // Get tournaments by status
  async getTournamentsByStatus(status: string): Promise<TournamentWithStats[]> {
    const tournaments = await this.getTournaments();
    return tournaments.filter(tournament => tournament.status === status);
  }

  // Get active tournaments
  async getActiveTournaments(): Promise<TournamentWithStats[]> {
    return this.getTournamentsByStatus('active');
  }

  // Get upcoming tournaments
  async getUpcomingTournaments(): Promise<TournamentWithStats[]> {
    const tournaments = await this.getTournaments();
    const now = new Date();
    return tournaments.filter(tournament => 
      tournament.status === 'upcoming' && 
      tournament.startDate > now
    ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }
}

export default new TournamentsService();
