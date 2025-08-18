import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import MatchHistoryService from '../services/matchHistoryService';

const prisma = new PrismaClient();
const matchHistoryService = new MatchHistoryService(prisma);

export class MatchHistoryController {
  /**
   * Get match history with filters
   */
  async getMatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        teamId,
        playerId,
        tournamentId,
        matchStatus,
        eventTypes,
        location,
        limit,
        offset,
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId: teamId as string,
        playerId: playerId as string,
        tournamentId: tournamentId as string,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes]) as string[] : undefined,
        location: location as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const matches = await matchHistoryService.getMatchHistory(filters);

      res.json({
        success: true,
        data: matches,
        message: `Found ${matches.length} matches`,
      });
    } catch (error) {
      console.error('Error in getMatchHistory:', error);
      next(error);
    }
  }

  /**
   * Get detailed match information
   */
  async getMatchDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matchId } = req.params;

      if (!matchId) {
        res.status(400).json({
          success: false,
          error: 'Match ID is required',
        });
        return;
      }

      const match = await matchHistoryService.getMatchDetail(matchId);

      if (!match) {
        res.status(404).json({
          success: false,
          error: 'Match not found',
        });
        return;
      }

      res.json({
        success: true,
        data: match,
        message: 'Match details retrieved successfully',
      });
    } catch (error) {
      console.error('Error in getMatchDetail:', error);
      next(error);
    }
  }

  /**
   * Generate comprehensive match report
   */
  async generateMatchReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        teamId,
        playerId,
        tournamentId,
        matchStatus,
        eventTypes,
        location,
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId: teamId as string,
        playerId: playerId as string,
        tournamentId: tournamentId as string,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes]) as string[] : undefined,
        location: location as string,
      };

      const report = await matchHistoryService.generateMatchReport(filters);

      res.json({
        success: true,
        data: report,
        message: 'Match report generated successfully',
      });
    } catch (error) {
      console.error('Error in generateMatchReport:', error);
      next(error);
    }
  }

  /**
   * Get historical trends
   */
  async getHistoricalTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period } = req.params;
      const {
        startDate,
        endDate,
        teamId,
        playerId,
        tournamentId,
        matchStatus,
        eventTypes,
        location,
      } = req.query;

      if (!period || !['week', 'month', 'quarter', 'year'].includes(period)) {
        res.status(400).json({
          success: false,
          error: 'Valid period is required (week, month, quarter, year)',
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId: teamId as string,
        playerId: playerId as string,
        tournamentId: tournamentId as string,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes]) as string[] : undefined,
        location: location as string,
      };

      const trends = await matchHistoryService.getHistoricalTrends(
        period as 'week' | 'month' | 'quarter' | 'year',
        filters
      );

      res.json({
        success: true,
        data: trends,
        message: `Historical trends for ${period} period retrieved successfully`,
      });
    } catch (error) {
      console.error('Error in getHistoricalTrends:', error);
      next(error);
    }
  }

  /**
   * Compare two matches
   */
  async compareMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matchId1, matchId2 } = req.params;

      if (!matchId1 || !matchId2) {
        res.status(400).json({
          success: false,
          error: 'Both match IDs are required',
        });
        return;
      }

      const comparison = await matchHistoryService.compareMatches(matchId1, matchId2);

      res.json({
        success: true,
        data: comparison,
        message: 'Matches compared successfully',
      });
    } catch (error) {
      console.error('Error in compareMatches:', error);
      next(error);
    }
  }

  /**
   * Search matches by various criteria
   */
  async searchMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.params;
      const {
        startDate,
        endDate,
        teamId,
        playerId,
        tournamentId,
        matchStatus,
        eventTypes,
        location,
        limit,
        offset,
      } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId: teamId as string,
        playerId: playerId as string,
        tournamentId: tournamentId as string,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes]) as string[] : undefined,
        location: location as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const matches = await matchHistoryService.searchMatches(query, filters);

      res.json({
        success: true,
        data: matches,
        message: `Found ${matches.length} matches for query: ${query}`,
      });
    } catch (error) {
      console.error('Error in searchMatches:', error);
      next(error);
    }
  }

  /**
   * Export match data
   */
  async exportMatchData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format } = req.params;
      const {
        startDate,
        endDate,
        teamId,
        playerId,
        tournamentId,
        matchStatus,
        eventTypes,
        location,
      } = req.query;

      if (!format || !['csv', 'json', 'pdf'].includes(format)) {
        res.status(400).json({
          success: false,
          error: 'Valid export format is required (csv, json, pdf)',
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId: teamId as string,
        playerId: playerId as string,
        tournamentId: tournamentId as string,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes : [eventTypes]) as string[] : undefined,
        location: location as string,
      };

      const data = await matchHistoryService.exportMatchData(
        filters,
        format as 'csv' | 'json' | 'pdf'
      );

      // Set appropriate headers based on format
      const filename = `match-history-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data as string);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data as string);
      } else if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data as Buffer);
      }
    } catch (error) {
      console.error('Error in exportMatchData:', error);
      next(error);
    }
  }

  /**
   * Get match statistics summary
   */
  async getMatchStatisticsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        teamId,
        tournamentId,
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId: teamId as string,
        tournamentId: tournamentId as string,
      };

      // Get basic statistics
      const matches = await matchHistoryService.getMatchHistory(filters);
      
      const summary = {
        totalMatches: matches.length,
        completedMatches: matches.filter(m => m.status === 'COMPLETED').length,
        cancelledMatches: matches.filter(m => m.status === 'CANCELLED').length,
        postponedMatches: matches.filter(m => m.status === 'POSTPONED').length,
        totalGoals: matches.reduce((sum, m) => sum + (m.homeTeam?.score || 0) + (m.awayTeam?.score || 0), 0),
        averageGoalsPerMatch: matches.length > 0 
          ? Math.round((matches.reduce((sum, m) => sum + (m.homeTeam?.score || 0) + (m.awayTeam?.score || 0), 0) / matches.length) * 100) / 100
          : 0,
        totalParticipants: matches.reduce((sum, m) => sum + m.totalParticipants, 0),
        averageParticipantsPerMatch: matches.length > 0
          ? Math.round((matches.reduce((sum, m) => sum + m.totalParticipants, 0) / matches.length) * 100) / 100
          : 0,
        totalDuration: matches.reduce((sum, m) => sum + (m.duration || 0), 0),
        averageMatchDuration: matches.length > 0
          ? Math.round((matches.reduce((sum, m) => sum + (m.duration || 0), 0) / matches.length) * 100) / 100
          : 0,
      };

      res.json({
        success: true,
        data: summary,
        message: 'Match statistics summary retrieved successfully',
      });
    } catch (error) {
      console.error('Error in getMatchStatisticsSummary:', error);
      next(error);
    }
  }

  /**
   * Get team match history
   */
  async getTeamMatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const {
        startDate,
        endDate,
        matchStatus,
        limit,
        offset,
      } = req.query;

      if (!teamId) {
        res.status(400).json({
          success: false,
          error: 'Team ID is required',
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        teamId,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const matches = await matchHistoryService.getMatchHistory(filters);

      res.json({
        success: true,
        data: matches,
        message: `Found ${matches.length} matches for team`,
      });
    } catch (error) {
      console.error('Error in getTeamMatchHistory:', error);
      next(error);
    }
  }

  /**
   * Get player match history
   */
  async getPlayerMatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { playerId } = req.params;
      const {
        startDate,
        endDate,
        matchStatus,
        limit,
        offset,
      } = req.query;

      if (!playerId) {
        res.status(400).json({
          success: false,
          error: 'Player ID is required',
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        playerId,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const matches = await matchHistoryService.getMatchHistory(filters);

      res.json({
        success: true,
        data: matches,
        message: `Found ${matches.length} matches for player`,
      });
    } catch (error) {
      console.error('Error in getPlayerMatchHistory:', error);
      next(error);
    }
  }

  /**
   * Get tournament match history
   */
  async getTournamentMatchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tournamentId } = req.params;
      const {
        startDate,
        endDate,
        matchStatus,
        limit,
        offset,
      } = req.query;

      if (!tournamentId) {
        res.status(400).json({
          success: false,
          error: 'Tournament ID is required',
        });
        return;
      }

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        tournamentId,
        matchStatus: matchStatus ? (Array.isArray(matchStatus) ? matchStatus : [matchStatus]) as string[] : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const matches = await matchHistoryService.getMatchHistory(filters);

      res.json({
        success: true,
        data: matches,
        message: `Found ${matches.length} matches for tournament`,
      });
    } catch (error) {
      console.error('Error in getTournamentMatchHistory:', error);
      next(error);
    }
  }
}

export default MatchHistoryController;
