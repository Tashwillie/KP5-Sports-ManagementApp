import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get dashboard statistics (public endpoint for testing)
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get counts from database
    const [
      userCount,
      teamCount,
      matchCount,
      clubCount,
      tournamentCount,
      activeMatches,
      upcomingMatches,
      completedMatches
    ] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.match.count(),
      prisma.club.count(),
      prisma.tournament.count(),
      prisma.match.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.match.count({ where: { status: 'SCHEDULED' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } })
    ]);

    // Get recent data for activities
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true
      }
    });

    const recentTeams = await prisma.team.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    const recentMatches = await prisma.match.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        startTime: true,
        createdAt: true
      }
    });

    const upcomingMatches = await prisma.match.findMany({
      where: { status: 'SCHEDULED' },
      take: 5,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        title: true,
        startTime: true,
        location: true
      }
    });

    // Generate recent activities
    const recentActivities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registered',
        title: 'New User Registered',
        description: `${user.displayName || user.email} joined the platform`,
        timestamp: user.createdAt,
        userName: user.displayName || 'System',
        userId: user.id
      })),
      ...recentTeams.map(team => ({
        id: `team-${team.id}`,
        type: 'team_created',
        title: 'New Team Created',
        description: `${team.name} team has been created`,
        timestamp: team.createdAt,
        userName: 'System',
        userId: 'system'
      })),
      ...recentMatches.map(match => ({
        id: `match-${match.id}`,
        type: 'match_created',
        title: 'New Match Scheduled',
        description: `${match.title} - ${new Date(match.startTime).toLocaleDateString()}`,
        timestamp: match.createdAt,
        userName: 'System',
        userId: 'system'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

    const stats = {
      totalUsers: userCount,
      totalTeams: teamCount,
      totalMatches: matchCount,
      totalClubs: clubCount,
      totalTournaments: tournamentCount,
      activeMatches,
      upcomingMatches,
      completedMatches
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivities,
        upcomingMatches
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics.',
    });
  }
};
