import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all matches with pagination and filtering
export const getMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      homeTeamId,
      awayTeamId,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (status) where.status = status;
    if (homeTeamId) where.homeTeamId = homeTeamId;
    if (awayTeamId) where.awayTeamId = awayTeamId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          homeTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          events: {
            orderBy: { createdAt: 'asc' },
            take: 5, // Get last 5 events
          },
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.match.count({ where }),
    ]);

    res.json({
      success: true,
      data: matches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching matches:', error);
    next(error);
  }
};

// Get single match by ID
export const getMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        matchStatistics: true,
      },
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    logger.error('Error fetching match:', error);
    next(error);
  }
};

// Create new match
export const createMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      address,
      homeTeamId,
      awayTeamId,
      participants,
    } = req.body;

    // Validate required fields
    if (!title || !startTime || !homeTeamId || !awayTeamId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, startTime, homeTeamId, awayTeamId',
      });
      return;
    }

    // Check if teams exist
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: homeTeamId } }),
      prisma.team.findUnique({ where: { id: awayTeamId } }),
    ]);

    if (!homeTeam || !awayTeam) {
      res.status(400).json({
        success: false,
        message: 'One or both teams not found',
      });
      return;
    }

    // Create match with participants
    const match = await prisma.match.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location,
        address,
        homeTeamId,
        awayTeamId,
        creatorId: (req as any).user.id,
        participants: participants ? {
          create: participants.map((participant: any) => ({
            userId: participant.userId,
            teamId: participant.teamId,
            role: participant.role || 'PLAYER',
            status: participant.status || 'PENDING',
          })),
        } : undefined,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.emit('match-created', match);
    }

    res.status(201).json({
      success: true,
      data: match,
      message: 'Match created successfully',
    });
  } catch (error) {
    logger.error('Error creating match:', error);
    next(error);
  }
};

// Update match
export const updateMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.creatorId;

    // Handle date fields
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    const match = await prisma.match.update({
      where: { id },
      data: updateData,
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('match-updated', match);
    }

    res.json({
      success: true,
      data: match,
      message: 'Match updated successfully',
    });
  } catch (error) {
    logger.error('Error updating match:', error);
    next(error);
  }
};

// Delete match
export const deleteMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.match.update({
      where: { id },
      data: { isActive: false },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('match-deleted', { id });
    }

    res.json({
      success: true,
      message: 'Match deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting match:', error);
    next(error);
  }
};

// Start match
export const startMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await prisma.match.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('match-started', match);
    }

    res.json({
      success: true,
      data: match,
      message: 'Match started successfully',
    });
  } catch (error) {
    logger.error('Error starting match:', error);
    next(error);
  }
};

// Pause match
export const pauseMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await prisma.match.update({
      where: { id },
      data: { status: 'PAUSED' },
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('match-paused', match);
    }

    res.json({
      success: true,
      data: match,
      message: 'Match paused successfully',
    });
  } catch (error) {
    logger.error('Error pausing match:', error);
    next(error);
  }
};

// Resume match
export const resumeMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const match = await prisma.match.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('match-resumed', match);
    }

    res.json({
      success: true,
      data: match,
      message: 'Match resumed successfully',
    });
  } catch (error) {
    logger.error('Error resuming match:', error);
    next(error);
  }
};

// End match
export const endMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { homeScore, awayScore } = req.body;

    const match = await prisma.match.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        homeScore: homeScore ? parseInt(homeScore) : null,
        awayScore: awayScore ? parseInt(awayScore) : null,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('match-ended', match);
    }

    res.json({
      success: true,
      data: match,
      message: 'Match ended successfully',
    });
  } catch (error) {
    logger.error('Error ending match:', error);
    next(error);
  }
};

// Add match participant
export const addMatchParticipant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { userId, teamId, role, status } = req.body;

    // Check if participant already exists
    const existingParticipant = await prisma.matchParticipant.findUnique({
      where: {
        matchId_userId: {
          matchId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      res.status(400).json({
        success: false,
        message: 'Participant already exists in this match',
      });
      return;
    }

    const participant = await prisma.matchParticipant.create({
      data: {
        matchId,
        userId,
        teamId,
        role: role || 'PLAYER',
        status: status || 'PENDING',
      },
      include: {
        user: true,
        team: true,
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${matchId}`).emit('participant-added', participant);
    }

    res.status(201).json({
      success: true,
      data: participant,
      message: 'Participant added successfully',
    });
  } catch (error) {
    logger.error('Error adding match participant:', error);
    next(error);
  }
};

// Update match participant
export const updateMatchParticipant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matchId, userId } = req.params;
    const updateData = req.body;

    const participant = await prisma.matchParticipant.update({
      where: {
        matchId_userId: {
          matchId,
          userId,
        },
      },
      data: updateData,
      include: {
        user: true,
        team: true,
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${matchId}`).emit('participant-updated', participant);
    }

    res.json({
      success: true,
      data: participant,
      message: 'Participant updated successfully',
    });
  } catch (error) {
    logger.error('Error updating match participant:', error);
    next(error);
  }
};

// Remove match participant
export const removeMatchParticipant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matchId, userId } = req.params;

    await prisma.matchParticipant.delete({
      where: {
        matchId_userId: {
          matchId,
          userId,
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${matchId}`).emit('participant-removed', { matchId, userId });
    }

    res.json({
      success: true,
      message: 'Participant removed successfully',
    });
  } catch (error) {
    logger.error('Error removing match participant:', error);
    next(error);
  }
};

// Get match statistics
export const getMatchStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matchId } = req.params;

    const statistics = await prisma.matchStatistics.findUnique({
      where: { matchId },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    });

    if (!statistics) {
      res.status(404).json({
        success: false,
        message: 'Match statistics not found',
      });
      return;
    }

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    logger.error('Error fetching match statistics:', error);
    next(error);
  }
};

// Update match score
export const updateMatchScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { homeScore, awayScore } = req.body;

    const match = await prisma.match.update({
      where: { id },
      data: {
        homeScore: homeScore ? parseInt(homeScore) : null,
        awayScore: awayScore ? parseInt(awayScore) : null,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        participants: {
          include: {
            user: true,
            team: true,
          },
        },
      },
    });

    // Emit real-time update via WebSocket
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`match-${id}`).emit('score-updated', {
        matchId: id,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      });
    }

    res.json({
      success: true,
      data: match,
      message: 'Match score updated successfully',
    });
  } catch (error) {
    logger.error('Error updating match score:', error);
    next(error);
  }
};
