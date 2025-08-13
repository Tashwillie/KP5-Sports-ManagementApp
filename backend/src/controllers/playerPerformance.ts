import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PlayerPerformanceService from '../services/playerPerformanceService';
import PerformanceAnalyticsService from '../services/performanceAnalyticsService';

const prisma = new PrismaClient();
const playerPerformanceService = new PlayerPerformanceService(prisma);
const performanceAnalyticsService = new PerformanceAnalyticsService(prisma);

export class PlayerPerformanceController {
  /**
   * Get player performance metrics
   */
  async getPlayerPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { season, startDate, endDate } = req.query;

      if (!playerId) {
        res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
        return;
      }

      // Parse date range if provided
      let period;
      if (startDate && endDate) {
        period = {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        };
      }

      const metrics = await playerPerformanceService.calculatePlayerPerformance(
        playerId,
        season as string,
        period
      );

      res.json({
        success: true,
        data: {
          playerId,
          metrics,
          period: period ? `${startDate} to ${endDate}` : season || 'All time'
        }
      });
    } catch (error) {
      console.error('Error getting player performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance comparison for a player
   */
  async getPlayerComparison(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { comparisonType, season } = req.query;

      if (!playerId) {
        res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
        return;
      }

      if (!comparisonType || !['team', 'league', 'position'].includes(comparisonType as string)) {
        res.status(400).json({
          success: false,
          message: 'Comparison type must be one of: team, league, position'
        });
        return;
      }

      const comparison = await playerPerformanceService.comparePlayerPerformance(
        playerId,
        comparisonType as 'team' | 'league' | 'position',
        season as string
      );

      res.json({
        success: true,
        data: {
          playerId,
          comparisonType,
          season: season || 'All time',
          comparison
        }
      });
    } catch (error) {
      console.error('Error getting player comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player comparison',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance insights for a player
   */
  async getPlayerInsights(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { season } = req.query;

      if (!playerId) {
        res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
        return;
      }

      const insights = await playerPerformanceService.getPerformanceInsights(
        playerId,
        season as string
      );

      res.json({
        success: true,
        data: {
          playerId,
          season: season || 'All time',
          insights
        }
      });
    } catch (error) {
      console.error('Error getting player insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player insights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get team performance analytics
   */
  async getTeamPerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, startDate, endDate } = req.query;

      if (!teamId) {
        res.status(400).json({
          success: false,
          message: 'Team ID is required'
        });
        return;
      }

      const filters = {
        teamId,
        season: season as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const analytics = await performanceAnalyticsService.generatePerformanceAnalytics(filters);

      res.json({
        success: true,
        data: {
          teamId,
          filters,
          analytics
        }
      });
    } catch (error) {
      console.error('Error getting team performance analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get team performance analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get league/tournament performance analytics
   */
  async getLeaguePerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { season, startDate, endDate, minMatches } = req.query;

      const filters = {
        season: season as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        minMatches: minMatches ? parseInt(minMatches as string) : undefined
      };

      const analytics = await performanceAnalyticsService.generatePerformanceAnalytics(filters);

      res.json({
        success: true,
        data: {
          filters,
          analytics
        }
      });
    } catch (error) {
      console.error('Error getting league performance analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get league performance analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(req: Request, res: Response): Promise<void> {
    try {
      const { season, startDate, endDate, teamId, minMatches } = req.query;

      const filters = {
        season: season as string,
        teamId: teamId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        minMatches: minMatches ? parseInt(minMatches as string) : undefined
      };

      const report = await performanceAnalyticsService.generatePerformanceReport(filters);

      res.json({
        success: true,
        data: {
          filters,
          report
        }
      });
    } catch (error) {
      console.error('Error getting performance report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Compare multiple players
   */
  async comparePlayers(req: Request, res: Response): Promise<void> {
    try {
      const { playerIds, metrics, season, startDate, endDate } = req.body;

      if (!playerIds || !Array.isArray(playerIds) || playerIds.length < 2) {
        res.status(400).json({
          success: false,
          message: 'At least 2 player IDs are required for comparison'
        });
        return;
      }

      if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one metric is required for comparison'
        });
        return;
      }

      const filters = {
        season: season as string,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };

      const comparisons = await performanceAnalyticsService.comparePlayers(
        playerIds,
        metrics,
        filters
      );

      res.json({
        success: true,
        data: {
          playerIds,
          metrics,
          filters,
          comparisons
        }
      });
    } catch (error) {
      console.error('Error comparing players:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to compare players',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export performance analytics
   */
  async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { season, startDate, endDate, teamId, minMatches, format } = req.query;

      if (!format || !['csv', 'json', 'pdf'].includes(format as string)) {
        res.status(400).json({
          success: false,
          message: 'Export format must be one of: csv, json, pdf'
        });
        return;
      }

      const filters = {
        season: season as string,
        teamId: teamId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        minMatches: minMatches ? parseInt(minMatches as string) : undefined
      };

      const exportData = await performanceAnalyticsService.exportAnalytics(
        filters,
        format as 'csv' | 'json' | 'pdf'
      );

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="performance-analytics.csv"');
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="performance-analytics.json"');
      } else if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="performance-analytics.pdf"');
      }

      res.send(exportData);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get player performance history
   */
  async getPlayerPerformanceHistory(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      if (!playerId) {
        res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
        return;
      }

      const matchStats = await prisma.playerMatchStats.findMany({
        where: { playerId },
        include: {
          match: {
            select: {
              id: true,
              date: true,
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
              homeScore: true,
              awayScore: true
            }
          },
          team: { select: { name: true } }
        },
        orderBy: { match: { date: 'desc' } },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.playerMatchStats.count({
        where: { playerId }
      });

      res.json({
        success: true,
        data: {
          playerId,
          matchStats,
          pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: total > parseInt(limit as string) + parseInt(offset as string)
          }
        }
      });
    } catch (error) {
      console.error('Error getting player performance history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player performance history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get player season statistics
   */
  async getPlayerSeasonStats(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { season } = req.query;

      if (!playerId) {
        res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
        return;
      }

      const whereClause: any = { playerId };
      if (season) {
        whereClause.season = season;
      }

      const seasonStats = await prisma.playerSeasonStats.findMany({
        where: whereClause,
        include: {
          team: { select: { name: true } }
        },
        orderBy: { season: 'desc' }
      });

      res.json({
        success: true,
        data: {
          playerId,
          seasonStats
        }
      });
    } catch (error) {
      console.error('Error getting player season stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get player season stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update player performance (triggered by match events)
   */
  async updatePlayerPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { playerId, matchId } = req.body;

      if (!playerId || !matchId) {
        res.status(400).json({
          success: false,
          message: 'Player ID and Match ID are required'
        });
        return;
      }

      await playerPerformanceService.updatePlayerPerformance(playerId, matchId);

      res.json({
        success: true,
        message: 'Player performance updated successfully',
        data: { playerId, matchId }
      });
    } catch (error) {
      console.error('Error updating player performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update player performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get performance leaderboards
   */
  async getPerformanceLeaderboards(req: Request, res: Response): Promise<void> {
    try {
      const { season, teamId, position, minMatches = 3 } = req.query;

      const filters = {
        season: season as string,
        teamId: teamId as string,
        position: position as string,
        minMatches: parseInt(minMatches as string)
      };

      const analytics = await performanceAnalyticsService.generatePerformanceAnalytics(filters);

      res.json({
        success: true,
        data: {
          filters,
          leaderboards: {
            topScorers: analytics.topScorers,
            topAssists: analytics.topAssists,
            topRated: analytics.topRated,
            teamRankings: analytics.teamRankings
          }
        }
      });
    } catch (error) {
      console.error('Error getting performance leaderboards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance leaderboards',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default PlayerPerformanceController;
