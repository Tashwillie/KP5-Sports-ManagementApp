import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import statisticsService from '../services/statisticsService';

export class StatisticsController {
  // Get player match statistics
  static async getPlayerMatchStats(req: Request, res: Response) {
    try {
      const { playerId, matchId } = req.params;
      
      if (!playerId || !matchId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Player ID and Match ID are required' 
        });
      }

      const stats = await statisticsService.getPlayerMatchStats(playerId, matchId);
      
      if (!stats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Player match statistics not found' 
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting player match stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get team match statistics
  static async getTeamMatchStats(req: Request, res: Response) {
    try {
      const { teamId, matchId } = req.params;
      
      if (!teamId || !matchId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Team ID and Match ID are required' 
        });
      }

      const stats = await statisticsService.getTeamMatchStats(teamId, matchId);
      
      if (!stats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Team match statistics not found' 
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting team match stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get match statistics
  static async getMatchStats(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      
      if (!matchId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Match ID is required' 
        });
      }

      const stats = await statisticsService.getMatchStats(matchId);
      
      if (!stats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Match statistics not found' 
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting match stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get player season statistics
  static async getPlayerSeasonStats(req: Request, res: Response) {
    try {
      const { playerId, season } = req.params;
      
      if (!playerId || !season) {
        return res.status(400).json({ 
          success: false, 
          message: 'Player ID and Season are required' 
        });
      }

      const stats = await statisticsService.getPlayerSeasonStats(playerId, season);
      
      if (!stats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Player season statistics not found' 
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting player season stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get team season statistics
  static async getTeamSeasonStats(req: Request, res: Response) {
    try {
      const { teamId, season } = req.params;
      
      if (!teamId || !season) {
        return res.status(400).json({ 
          success: false, 
          message: 'Team ID and Season are required' 
        });
      }

      const stats = await statisticsService.getTeamSeasonStats(teamId, season);
      
      if (!stats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Team season statistics not found' 
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting team season stats:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get top performers for a season
  static async getTopPerformers(req: Request, res: Response) {
    try {
      const { season } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!season) {
        return res.status(400).json({ 
          success: false, 
          message: 'Season is required' 
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({ 
          success: false, 
          message: 'Limit must be between 1 and 100' 
        });
      }

      const topPerformers = await statisticsService.getTopPerformers(season, limit);

      res.json({
        success: true,
        data: topPerformers
      });
    } catch (error) {
      logger.error('Error getting top performers:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get team standings for a season
  static async getTeamStandings(req: Request, res: Response) {
    try {
      const { season } = req.params;
      
      if (!season) {
        return res.status(400).json({ 
          success: false, 
          message: 'Season is required' 
        });
      }

      const standings = await statisticsService.getTeamStandings(season);

      res.json({
        success: true,
        data: standings
      });
    } catch (error) {
      logger.error('Error getting team standings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get statistics overview for a match
  static async getMatchStatisticsOverview(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      
      if (!matchId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Match ID is required' 
        });
      }

      const [matchStats, homeTeamStats, awayTeamStats] = await Promise.all([
        statisticsService.getMatchStats(matchId),
        statisticsService.getTeamMatchStats(req.query.homeTeamId as string, matchId),
        statisticsService.getTeamMatchStats(req.query.awayTeamId as string, matchId)
      ]);

      if (!matchStats) {
        return res.status(404).json({ 
          success: false, 
          message: 'Match statistics not found' 
        });
      }

      const overview = {
        match: matchStats,
        homeTeam: homeTeamStats,
        awayTeam: awayTeamStats,
        summary: {
          totalGoals: matchStats.totalGoals,
          totalCards: matchStats.totalCards,
          totalSubstitutions: matchStats.totalSubstitutions,
          averagePossession: matchStats.averagePossession,
          matchDuration: matchStats.matchDuration
        }
      };

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      logger.error('Error getting match statistics overview:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get player performance comparison
  static async getPlayerPerformanceComparison(req: Request, res: Response) {
    try {
      const { playerIds } = req.query;
      const { season } = req.params;
      
      if (!playerIds || !season) {
        return res.status(400).json({ 
          success: false, 
          message: 'Player IDs and Season are required' 
        });
      }

      const playerIdArray = (playerIds as string).split(',');
      
      if (playerIdArray.length < 2 || playerIdArray.length > 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Must compare between 2 and 10 players' 
        });
      }

      const playerStats = await Promise.all(
        playerIdArray.map(id => statisticsService.getPlayerSeasonStats(id.trim(), season))
      );

      const validStats = playerStats.filter(stat => stat !== null);

      if (validStats.length < 2) {
        return res.status(404).json({ 
          success: false, 
          message: 'Insufficient player statistics found for comparison' 
        });
      }

      const comparison = {
        season,
        players: validStats,
        metrics: {
          goals: validStats.map(p => ({ playerId: p.playerId, value: p.goals })),
          assists: validStats.map(p => ({ playerId: p.playerId, value: p.assists })),
          averageRating: validStats.map(p => ({ playerId: p.playerId, value: p.averageRating })),
          matchesPlayed: validStats.map(p => ({ playerId: p.playerId, value: p.matchesPlayed }))
        }
      };

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      logger.error('Error getting player performance comparison:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Get team performance comparison
  static async getTeamPerformanceComparison(req: Request, res: Response) {
    try {
      const { teamIds } = req.query;
      const { season } = req.params;
      
      if (!teamIds || !season) {
        return res.status(400).json({ 
          success: false, 
          message: 'Team IDs and Season are required' 
        });
      }

      const teamIdArray = (teamIds as string).split(',');
      
      if (teamIdArray.length < 2 || teamIdArray.length > 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Must compare between 2 and 10 teams' 
        });
      }

      const teamStats = await Promise.all(
        teamIdArray.map(id => statisticsService.getTeamSeasonStats(id.trim(), season))
      );

      const validStats = teamStats.filter(stat => stat !== null);

      if (validStats.length < 2) {
        return res.status(404).json({ 
          success: false, 
          message: 'Insufficient team statistics found for comparison' 
        });
      }

      const comparison = {
        season,
        teams: validStats,
        metrics: {
          points: validStats.map(t => ({ teamId: t.teamId, value: t.points })),
          goalsFor: validStats.map(t => ({ teamId: t.teamId, value: t.goalsFor })),
          goalsAgainst: validStats.map(t => ({ teamId: t.teamId, value: t.goalsAgainst })),
          winPercentage: validStats.map(t => ({ teamId: t.teamId, value: t.winPercentage }))
        }
      };

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      logger.error('Error getting team performance comparison:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
}
