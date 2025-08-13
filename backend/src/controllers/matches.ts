import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { webSocketService } from '../index';

// Get all matches with pagination and filtering
export const getMatches = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
    });
  }
};

// Get single match by ID
export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const match = await prisma.match.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
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
                phone: true,
              },
            },
          },
        },
                 events: {
           orderBy: { createdAt: 'asc' },
         },
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match',
    });
  }
};

// Create new match
export const createMatch = async (req: Request, res: Response): Promise<void> => {
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
    } = req.body;

    const userId = (req as any).user.id;

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
        creatorId: userId,
      },
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
      },
    });

    // Add creator as referee
    await prisma.matchParticipant.create({
      data: {
        matchId: match.id,
        userId,
        role: 'REFEREE',
        status: 'CONFIRMED',
      },
    });

    res.status(201).json({
      success: true,
      data: match,
      message: 'Match created successfully',
    });
  } catch (error) {
    logger.error('Error creating match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create match',
    });
  }
};

// Update match
export const updateMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const updateData = { ...req.body };
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

    const match = await prisma.match.update({
      where: { id },
      data: updateData,
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
      },
    });

    res.json({
      success: true,
      data: match,
      message: 'Match updated successfully',
    });
  } catch (error) {
    logger.error('Error updating match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update match',
    });
  }
};

// Delete match (soft delete)
export const deleteMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    await prisma.match.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Match deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match',
    });
  }
};

// Get match participants
export const getMatchParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const participants = await prisma.matchParticipant.findMany({
      where: {
        matchId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { user: { firstName: 'asc' } },
      ],
    });

    res.json({
      success: true,
      data: participants,
    });
  } catch (error) {
    logger.error('Error fetching match participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match participants',
    });
  }
};

// Add match participant
export const addMatchParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const { userId, teamId, role, status } = req.body;

    // Check if participant already exists
    const existingParticipant = await prisma.matchParticipant.findFirst({
      where: {
        matchId,
        userId,
      },
    });

    if (existingParticipant) {
      res.status(400).json({
        success: false,
        message: 'User is already a participant in this match',
      });
      return;
    }

    const participant = await prisma.matchParticipant.create({
      data: {
        matchId,
        userId,
        teamId,
        role,
        status,
      },
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
    });

    res.status(201).json({
      success: true,
      data: participant,
      message: 'Participant added successfully',
    });
  } catch (error) {
    logger.error('Error adding match participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
    });
  }
};

// Update match participant
export const updateMatchParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, userId } = req.params;
    if (!matchId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Match ID and User ID are required',
      });
      return;
    }

    const updateData = { ...req.body };

    const participant = await prisma.matchParticipant.update({
      where: {
        matchId_userId: {
          matchId,
          userId,
        },
      },
      data: updateData,
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
    });

    res.json({
      success: true,
      data: participant,
      message: 'Participant updated successfully',
    });
  } catch (error) {
    logger.error('Error updating match participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update participant',
    });
  }
};

// Remove match participant
export const removeMatchParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, userId } = req.params;
    if (!matchId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Match ID and User ID are required',
      });
      return;
    }

    await prisma.matchParticipant.delete({
      where: {
        matchId_userId: {
          matchId,
          userId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Participant removed successfully',
    });
  } catch (error) {
    logger.error('Error removing match participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant',
    });
  }
};

// Get match events
export const getMatchEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

         const events = await prisma.matchEvent.findMany({
       where: {
         matchId,
       },
       orderBy: { createdAt: 'asc' },
     });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    logger.error('Error fetching match events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match events',
    });
  }
};

// Add match event
export const addMatchEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const {
      type,
      minute,
      description,
      playerId,
      teamId,
      data,
    } = req.body;

    // Validate match exists and is in progress
    const match = await prisma.match.findFirst({
      where: { id: matchId, isActive: true }
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    if (match.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        message: 'Match must be in progress to add events',
      });
      return;
    }

    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        type,
        minute,
        description,
        playerId,
        teamId,
        data,
      },
    });

    // Update player stats if applicable
    if (playerId && (type === 'GOAL' || type === 'YELLOW_CARD' || type === 'RED_CARD')) {
      await updatePlayerStats(playerId, type);
    }

    // Update team stats if applicable
    if (teamId && type === 'GOAL') {
      await updateTeamStats(teamId, matchId);
    }

    // Broadcast event via WebSocket
    try {
      const room = `match:${matchId}`;
      const broadcastData = {
        ...event,
        timestamp: new Date(),
        userId: (req as any).user.id,
        userRole: (req as any).user.role,
        userEmail: (req as any).user.email
      };
      
      webSocketService.broadcastToRoom(room, 'match-event', broadcastData);
      
      // Update match state in WebSocket service
      await webSocketService.refreshMatchState(matchId);
      
      logger.info(`Match event broadcasted via WebSocket: ${event.type} for match ${matchId}`);
    } catch (wsError) {
      logger.error('WebSocket broadcast error:', wsError);
      // Don't fail the request if WebSocket fails
    }

    res.status(201).json({
      success: true,
      data: event,
      message: 'Match event added successfully',
    });
  } catch (error) {
    logger.error('Error adding match event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add match event',
    });
  }
};

// Start match
export const startMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, isActive: true }
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    if (match.status !== 'SCHEDULED') {
      res.status(400).json({
        success: false,
        message: 'Match can only be started when scheduled',
      });
      return;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
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
      },
    });

    // Broadcast match status change via WebSocket
    try {
      const room = `match:${matchId}`;
      const broadcastData = {
        matchId,
        status: 'in_progress',
        timestamp: new Date(),
        userId: (req as any).user.id,
        userRole: (req as any).user.role,
        userEmail: (req as any).user.email,
        match: updatedMatch
      };
      
      webSocketService.broadcastToRoom(room, 'match-status-change', broadcastData);
      
      // Update match state in WebSocket service
      await webSocketService.refreshMatchState(matchId);
      
      logger.info(`Match started and broadcasted via WebSocket: ${matchId}`);
    } catch (wsError) {
      logger.error('WebSocket broadcast error:', wsError);
    }

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Match started successfully',
    });
  } catch (error) {
    logger.error('Error starting match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start match',
    });
  }
};

// Pause match
export const pauseMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, isActive: true }
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    if (match.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        message: 'Match can only be paused when in progress',
      });
      return;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'PAUSED',
      },
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
      },
    });

    // Broadcast match status change via WebSocket
    try {
      const room = `match:${matchId}`;
      const broadcastData = {
        matchId,
        status: 'paused',
        timestamp: new Date(),
        userId: (req as any).user.id,
        userRole: (req as any).user.role,
        userEmail: (req as any).user.email,
        match: updatedMatch
      };
      
      webSocketService.broadcastToRoom(room, 'match-status-change', broadcastData);
      
      // Update match state in WebSocket service
      await webSocketService.refreshMatchState(matchId);
      
      logger.info(`Match paused and broadcasted via WebSocket: ${matchId}`);
    } catch (wsError) {
      logger.error('WebSocket broadcast error:', wsError);
    }

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Match paused successfully',
    });
  } catch (error) {
    logger.error('Error pausing match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause match',
    });
  }
};

// Resume match
export const resumeMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, isActive: true }
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    if (match.status !== 'PAUSED') {
      res.status(400).json({
        success: false,
        message: 'Match can only be resumed when paused',
      });
      return;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'IN_PROGRESS',
      },
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
      },
    });

    // Broadcast match status change via WebSocket
    try {
      const room = `match:${matchId}`;
      const broadcastData = {
        matchId,
        status: 'in_progress',
        timestamp: new Date(),
        userId: (req as any).user.id,
        userRole: (req as any).user.role,
        userEmail: (req as any).user.email,
        match: updatedMatch
      };
      
      webSocketService.broadcastToRoom(room, 'match-status-change', broadcastData);
      
      // Update match state in WebSocket service
      await webSocketService.refreshMatchState(matchId);
      
      logger.info(`Match resumed and broadcasted via WebSocket: ${matchId}`);
    } catch (wsError) {
      logger.error('WebSocket broadcast error:', wsError);
    }

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Match resumed successfully',
    });
  } catch (error) {
    logger.error('Error resuming match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume match',
    });
  }
};

// End match
export const endMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: matchId } = req.params;
    const { homeScore, awayScore } = req.body;
    
    if (!matchId) {
      res.status(400).json({
        success: false,
        message: 'Match ID is required',
      });
      return;
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, isActive: true }
    });

    if (!match) {
      res.status(404).json({
        success: false,
        message: 'Match not found',
      });
      return;
    }

    if (match.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        message: 'Match is already completed',
      });
      return;
    }

    const updateData: any = {
      status: 'COMPLETED',
      endTime: new Date(),
    };

    if (homeScore !== undefined && awayScore !== undefined) {
      updateData.homeScore = homeScore;
      updateData.awayScore = awayScore;
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
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
      },
    });

    // Update team standings if this is a tournament match
    if (match.tournamentId) {
      await updateTournamentStandings(match.tournamentId, matchId);
    }

    // Broadcast match completion via WebSocket
    try {
      const room = `match:${matchId}`;
      const broadcastData = {
        matchId,
        status: 'completed',
        timestamp: new Date(),
        userId: (req as any).user.id,
        userRole: (req as any).user.role,
        userEmail: (req as any).user.email,
        match: updatedMatch,
        homeScore,
        awayScore
      };
      
      webSocketService.broadcastToRoom(room, 'match-status-change', broadcastData);
      
      // Update match state in WebSocket service
      await webSocketService.refreshMatchState(matchId);
      
      logger.info(`Match completed and broadcasted via WebSocket: ${matchId}`);
    } catch (wsError) {
      logger.error('WebSocket broadcast error:', wsError);
    }

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Match ended successfully',
    });
  } catch (error) {
    logger.error('Error ending match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end match',
    });
  }
};

// Update match event
export const updateMatchEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, eventId } = req.params;
    if (!matchId || !eventId) {
      res.status(400).json({
        success: false,
        message: 'Match ID and Event ID are required',
      });
      return;
    }

    const updateData = { ...req.body };

         const event = await prisma.matchEvent.update({
       where: { id: eventId },
       data: updateData,
     });

    res.json({
      success: true,
      data: event,
      message: 'Match event updated successfully',
    });
  } catch (error) {
    logger.error('Error updating match event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update match event',
    });
  }
};

// Delete match event
export const deleteMatchEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, eventId } = req.params;
    if (!matchId || !eventId) {
      res.status(400).json({
        success: false,
        message: 'Match ID and Event ID are required',
      });
      return;
    }

    await prisma.matchEvent.delete({
      where: { id: eventId },
    });

    res.json({
      success: true,
      message: 'Match event deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting match event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match event',
    });
  }
};

// Helper function to update player stats
async function updatePlayerStats(playerId: string, eventType: string): Promise<void> {
  try {
    const player = await prisma.userProfile.findFirst({
      where: { userId: playerId }
    });

    if (!player) return;

    const updateData: any = {};
    
    switch (eventType) {
      case 'GOAL':
        updateData.goals = { increment: 1 };
        break;
      case 'YELLOW_CARD':
        updateData.yellowCards = { increment: 1 };
        break;
      case 'RED_CARD':
        updateData.redCards = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.userProfile.update({
        where: { userId: playerId },
        data: updateData
      });
    }
  } catch (error) {
    logger.error('Error updating player stats:', error);
  }
}

// Helper function to update team stats
async function updateTeamStats(teamId: string, matchId: string): Promise<void> {
  try {
    const match = await prisma.match.findFirst({
      where: { id: matchId },
      include: { events: true }
    });

    if (!match) return;

    const homeTeamGoals = match.events.filter(e => e.teamId === match.homeTeamId && e.type === 'GOAL').length;
    const awayTeamGoals = match.events.filter(e => e.teamId === match.awayTeamId && e.type === 'GOAL').length;

    // Update home team stats
    if (match.homeTeamId) {
      await prisma.team.update({
        where: { id: match.homeTeamId },
        data: {
          goalsFor: { increment: homeTeamGoals },
          goalsAgainst: { increment: awayTeamGoals }
        }
      });
    }

    // Update away team stats
    if (match.awayTeamId) {
      await prisma.team.update({
        where: { id: match.awayTeamId },
        data: {
          goalsFor: { increment: awayTeamGoals },
          goalsAgainst: { increment: homeTeamGoals }
        }
      });
    }
  } catch (error) {
    logger.error('Error updating team stats:', error);
  }
}

// Helper function to update tournament standings
async function updateTournamentStandings(tournamentId: string, matchId: string): Promise<void> {
  try {
    // This would implement tournament standings logic
    // For now, just log that it's needed
    logger.info(`Tournament standings update needed for tournament ${tournamentId} after match ${matchId}`);
  } catch (error) {
    logger.error('Error updating tournament standings:', error);
  }
}
