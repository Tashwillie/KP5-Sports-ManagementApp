import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import TeamStatisticsService from '../services/teamStatisticsService';
import TeamAnalyticsService from '../services/teamAnalyticsService';

const prisma = new PrismaClient();
const teamStatisticsService = new TeamStatisticsService(prisma);
const teamAnalyticsService = new TeamAnalyticsService(prisma);

export class TeamStatisticsController {
  /**
   * Get team performance metrics
   */
  async getTeamPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, startDate, endDate } = req.query;

      let period;
      if (startDate && endDate) {
        period = {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        };
      }

      const performance = await teamStatisticsService.calculateTeamPerformance(
        teamId,
        season as string,
        period
      );

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Error getting team performance:', error);
      next(error);
    }
  }

  /**
   * Compare team performance with other teams
   */
  async compareTeamPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { comparisonType, season } = req.query;

      if (!comparisonType || !['league', 'division', 'tournament'].includes(comparisonType as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid comparison type. Must be league, division, or tournament'
        });
        return;
      }

      const comparison = await teamStatisticsService.compareTeamPerformance(
        teamId,
        comparisonType as 'league' | 'division' | 'tournament',
        season as string
      );

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Error comparing team performance:', error);
      next(error);
    }
  }

  /**
   * Get team performance insights
   */
  async getTeamInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season } = req.query;

      const insights = await teamStatisticsService.getTeamInsights(
        teamId,
        season as string
      );

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error getting team insights:', error);
      next(error);
    }
  }

  /**
   * Get team performance trends
   */
  async getTeamTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, period } = req.query;

      if (period && !['week', 'month', 'quarter'].includes(period as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid period. Must be week, month, or quarter'
        });
        return;
      }

      const trends = await teamStatisticsService.getTeamTrends(
        teamId,
        season as string,
        period as 'week' | 'month' | 'quarter'
      );

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Error getting team trends:', error);
      next(error);
    }
  }

  /**
   * Generate team performance report
   */
  async generateTeamReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, includeRecommendations } = req.query;

      const report = await teamStatisticsService.generateTeamReport(
        teamId,
        season as string,
        includeRecommendations === 'true'
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating team report:', error);
      next(error);
    }
  }

  /**
   * Get league table
   */
  async getLeagueTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { season, tournamentId } = req.query;

      const leagueTable = await teamAnalyticsService.generateLeagueTable(
        season as string,
        tournamentId as string
      );

      res.json({
        success: true,
        data: leagueTable
      });
    } catch (error) {
      console.error('Error getting league table:', error);
      next(error);
    }
  }

  /**
   * Analyze team form
   */
  async analyzeTeamForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, tournamentId } = req.query;

      const formAnalysis = await teamAnalyticsService.analyzeTeamForm(
        teamId,
        season as string,
        tournamentId as string
      );

      res.json({
        success: true,
        data: formAnalysis
      });
    } catch (error) {
      console.error('Error analyzing team form:', error);
      next(error);
    }
  }

  /**
   * Calculate team efficiency metrics
   */
  async calculateTeamEfficiency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season } = req.query;

      const efficiency = await teamAnalyticsService.calculateTeamEfficiency(
        teamId,
        season as string
      );

      res.json({
        success: true,
        data: efficiency
      });
    } catch (error) {
      console.error('Error calculating team efficiency:', error);
      next(error);
    }
  }

  /**
   * Compare team with league
   */
  async compareTeamWithLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, tournamentId } = req.query;

      const comparison = await teamAnalyticsService.compareTeamWithLeague(
        teamId,
        season as string,
        tournamentId as string
      );

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Error comparing team with league:', error);
      next(error);
    }
  }

  /**
   * Get top teams by metric
   */
  async getTopTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metric, season, limit, tournamentId } = req.query;

      if (!metric || !['points', 'goals', 'cleanSheets', 'winPercentage', 'efficiency'].includes(metric as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid metric. Must be points, goals, cleanSheets, winPercentage, or efficiency'
        });
        return;
      }

      const topTeams = await teamAnalyticsService.getTopTeams(
        season as string,
        metric as 'points' | 'goals' | 'cleanSheets' | 'winPercentage' | 'efficiency',
        limit ? parseInt(limit as string) : 10,
        tournamentId as string
      );

      res.json({
        success: true,
        data: topTeams
      });
    } catch (error) {
      console.error('Error getting top teams:', error);
      next(error);
    }
  }

  /**
   * Update team statistics
   */
  async updateTeamStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId, matchId } = req.body;

      if (!teamId || !matchId) {
        res.status(400).json({
          success: false,
          error: 'Team ID and Match ID are required'
        });
        return;
      }

      await teamStatisticsService.updateTeamStatistics(teamId, matchId);

      res.json({
        success: true,
        message: 'Team statistics updated successfully'
      });
    } catch (error) {
      console.error('Error updating team statistics:', error);
      next(error);
    }
  }

  /**
   * Get team statistics summary
   */
  async getTeamStatisticsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season } = req.query;

      // Get comprehensive team statistics
      const [performance, insights, trends, efficiency] = await Promise.all([
        teamStatisticsService.calculateTeamPerformance(teamId, season as string),
        teamStatisticsService.getTeamInsights(teamId, season as string),
        teamStatisticsService.getTeamTrends(teamId, season as string),
        teamAnalyticsService.calculateTeamEfficiency(teamId, season as string)
      ]);

      const summary = {
        teamId,
        season: season as string,
        performance,
        insights,
        trends,
        efficiency,
        lastUpdated: new Date()
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting team statistics summary:', error);
      next(error);
    }
  }

  /**
   * Get multiple teams comparison
   */
  async compareMultipleTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamIds, season, tournamentId } = req.body;

      if (!teamIds || !Array.isArray(teamIds) || teamIds.length < 2) {
        res.status(400).json({
          success: false,
          error: 'At least 2 team IDs are required for comparison'
        });
        return;
      }

      // Get performance data for all teams
      const teamPerformances = await Promise.all(
        teamIds.map(async (teamId: string) => {
          const performance = await teamStatisticsService.calculateTeamPerformance(
            teamId,
            season
          );
          const efficiency = await teamAnalyticsService.calculateTeamEfficiency(
            teamId,
            season
          );
          return { teamId, performance, efficiency };
        })
      );

      // Calculate comparison metrics
      const comparison = this.calculateMultipleTeamsComparison(teamPerformances);

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Error comparing multiple teams:', error);
      next(error);
    }
  }

  /**
   * Export team statistics
   */
  async exportTeamStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { season, format } = req.query;

      if (!format || !['csv', 'json', 'pdf'].includes(format as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid format. Must be csv, json, or pdf'
        });
        return;
      }

      // Get comprehensive team data
      const [performance, insights, trends, efficiency] = await Promise.all([
        teamStatisticsService.calculateTeamPerformance(teamId, season as string),
        teamStatisticsService.getTeamInsights(teamId, season as string),
        teamStatisticsService.getTeamTrends(teamId, season as string),
        teamAnalyticsService.calculateTeamEfficiency(teamId, season as string)
      ]);

      const exportData = {
        teamId,
        season: season as string,
        exportDate: new Date(),
        performance,
        insights,
        trends,
        efficiency
      };

      // Set appropriate headers for download
      const filename = `team-${teamId}-statistics-${season}-${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
          res.send(this.convertToCSV(exportData));
          break;
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
          res.json(exportData);
          break;
        case 'pdf':
          res.status(501).json({
            success: false,
            error: 'PDF export not yet implemented'
          });
          break;
      }
    } catch (error) {
      console.error('Error exporting team statistics:', error);
      next(error);
    }
  }

  // Private helper methods
  private calculateMultipleTeamsComparison(teamPerformances: any[]) {
    // This would calculate comparison between multiple teams
    return {
      teams: teamPerformances,
      comparison: {
        bestPerforming: teamPerformances[0],
        worstPerforming: teamPerformances[teamPerformances.length - 1],
        averagePerformance: {},
        rankings: []
      }
    };
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const flattenObject = (obj: any, prefix = ''): string[] => {
      return Object.keys(obj).reduce((acc: string[], key: string) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          acc.push(...flattenObject(obj[key], pre + key));
        } else {
          acc.push(`${pre}${key},${obj[key]}`);
        }
        return acc;
      }, []);
    };

    const flattened = flattenObject(data);
    return flattened.join('\n');
  }
}

export default TeamStatisticsController;
