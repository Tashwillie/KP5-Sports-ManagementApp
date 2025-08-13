import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMediaFiles = async (req: Request, res: Response) => {
  try {
    // For now, return a combination of club logos, team logos, and user avatars
    // In a real implementation, you'd have a dedicated Media model
    const [clubs, teams, users] = await Promise.all([
      prisma.club.findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
          city: true,
          state: true,
        },
        where: {
          logo: { not: null }
        }
      }),
      prisma.team.findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
          ageGroup: true,
          gender: true,
        },
        where: {
          logo: { not: null }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          displayName: true,
          avatar: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        where: {
          avatar: { not: null }
        }
      })
    ]);

    // Transform the data to match the expected media interface
    const mediaFiles = [
      ...clubs.map(club => ({
        id: `club-${club.id}`,
        type: 'image' as const,
        name: `${club.name} Logo`,
        url: club.logo!,
        thumbnail: club.logo!,
        description: club.description || '',
        category: 'club',
        metadata: {
          clubId: club.id,
          clubName: club.name,
          location: [club.city, club.state].filter(Boolean).join(', ')
        },
        uploadedAt: new Date(),
        uploadedBy: 'system'
      })),
      ...teams.map(team => ({
        id: `team-${team.id}`,
        type: 'image' as const,
        name: `${team.name} Logo`,
        url: team.logo!,
        thumbnail: team.logo!,
        description: team.description || '',
        category: 'team',
        metadata: {
          teamId: team.id,
          teamName: team.name,
          ageGroup: team.ageGroup,
          gender: team.gender
        },
        uploadedAt: new Date(),
        uploadedBy: 'system'
      })),
      ...users.map(user => ({
        id: `user-${user.id}`,
        type: 'image' as const,
        name: `${user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email} Avatar`,
        url: user.avatar!,
        thumbnail: user.avatar!,
        description: 'User profile picture',
        category: 'avatar',
        metadata: {
          userId: user.id,
          userName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        },
        uploadedAt: new Date(),
        uploadedBy: 'system'
      }))
    ];

    res.json({
      success: true,
      data: {
        mediaFiles,
        total: mediaFiles.length
      }
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
