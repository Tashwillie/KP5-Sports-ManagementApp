import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all tournaments with pagination and filtering
export const getTournaments = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      format,
      clubId,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (status) where.status = status;
    if (format) where.format = format;
    if (clubId) where.clubId = clubId;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate as string);
      if (endDate) where.startDate.lte = new Date(endDate as string);
    }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        include: {
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          teams: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
          matches: {
            include: {
              match: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  homeScore: true,
                  awayScore: true,
                },
              },
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.tournament.count({ where }),
    ]);

    res.json({
      success: true,
      data: tournaments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching tournaments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments',
    });
  }
};

// Get single tournament by ID
export const getTournament = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                logo: true,
                description: true,
              },
            },
          },
          orderBy: { seed: 'asc' },
        },
        matches: {
          include: {
            match: {
              select: {
                id: true,
                title: true,
                status: true,
                homeScore: true,
                awayScore: true,
                startTime: true,
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
            },
          },
          orderBy: { round: 'asc' },
        },
      },
    });

    if (!tournament) {
      res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
      return;
    }

    res.json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    logger.error('Error fetching tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament',
    });
  }
};

// Create new tournament
export const createTournament = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      format,
      maxTeams,
      registrationDeadline,
      clubId,
    } = req.body;

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        format,
        maxTeams,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        clubId,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: tournament,
      message: 'Tournament created successfully',
    });
  } catch (error) {
    logger.error('Error creating tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tournament',
    });
  }
};

// Update tournament
export const updateTournament = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const updateData = { ...req.body };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);

    const tournament = await prisma.tournament.update({
      where: { id },
      data: updateData,
      include: {
        club: {
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
      data: tournament,
      message: 'Tournament updated successfully',
    });
  } catch (error) {
    logger.error('Error updating tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tournament',
    });
  }
};

// Delete tournament (soft delete)
export const deleteTournament = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    await prisma.tournament.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Tournament deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tournament',
    });
  }
};

// Get tournament teams
export const getTournamentTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: tournamentId } = req.params;
    if (!tournamentId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const teams = await prisma.tournamentTeam.findMany({
      where: {
        tournamentId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
          },
        },
      },
      orderBy: [
        { seed: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    logger.error('Error fetching tournament teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament teams',
    });
  }
};

// Add tournament team
export const addTournamentTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: tournamentId } = req.params;
    if (!tournamentId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const { teamId, seed } = req.body;

    // Check if team is already registered
    const existingTeam = await prisma.tournamentTeam.findFirst({
      where: {
        tournamentId,
        teamId,
      },
    });

    if (existingTeam) {
      res.status(400).json({
        success: false,
        message: 'Team is already registered in this tournament',
      });
      return;
    }

    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId,
        seed,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: tournamentTeam,
      message: 'Team added to tournament successfully',
    });
  } catch (error) {
    logger.error('Error adding tournament team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add team to tournament',
    });
  }
};

// Update tournament team
export const updateTournamentTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tournamentId, teamId } = req.params;
    if (!tournamentId || !teamId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID and Team ID are required',
      });
      return;
    }

    const updateData = { ...req.body };

    const tournamentTeam = await prisma.tournamentTeam.update({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: tournamentTeam,
      message: 'Tournament team updated successfully',
    });
  } catch (error) {
    logger.error('Error updating tournament team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tournament team',
    });
  }
};

// Remove tournament team
export const removeTournamentTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tournamentId, teamId } = req.params;
    if (!tournamentId || !teamId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID and Team ID are required',
      });
      return;
    }

    await prisma.tournamentTeam.delete({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
    });

    res.json({
      success: true,
      message: 'Team removed from tournament successfully',
    });
  } catch (error) {
    logger.error('Error removing tournament team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team from tournament',
    });
  }
};

// Get tournament matches
export const getTournamentMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: tournamentId } = req.params;
    if (!tournamentId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const matches = await prisma.tournamentMatch.findMany({
      where: {
        tournamentId,
      },
      include: {
        match: {
          select: {
            id: true,
            title: true,
            status: true,
            homeScore: true,
            awayScore: true,
            startTime: true,
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
        },
      },
      orderBy: [
        { round: 'asc' },
        { match: { startTime: 'asc' } },
      ],
    });

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    logger.error('Error fetching tournament matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament matches',
    });
  }
};

// Generate tournament brackets
export const generateBrackets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: tournamentId } = req.params;
    if (!tournamentId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const { format } = req.body;

    // Get tournament and teams
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: {
          include: {
            team: true,
          },
          orderBy: { seed: 'asc' },
        },
      },
    });

    if (!tournament) {
      res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
      return;
    }

    if (tournament.teams.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Tournament needs at least 2 teams to generate brackets',
      });
      return;
    }

    // Simple bracket generation logic (can be enhanced)
    const teams = tournament.teams.map((tt, index) => ({
      id: tt.team.id,
      name: tt.team.name,
      seed: tt.seed || index + 1,
    }));

         // Generate matches based on format
     const matches = [];
     const tournamentFormat = format || tournament.format;
     const userId = (req as any).user.id;

     if (tournamentFormat === 'SINGLE_ELIMINATION') {
       // Generate single elimination brackets
       for (let i = 0; i < teams.length / 2; i++) {
         const homeTeam = teams[i];
         const awayTeam = teams[teams.length - 1 - i];
         
         if (homeTeam && awayTeam) {
           const match = await prisma.match.create({
             data: {
               title: `${homeTeam.name} vs ${awayTeam.name}`,
               startTime: tournament.startDate,
               homeTeamId: homeTeam.id,
               awayTeamId: awayTeam.id,
               status: 'SCHEDULED',
               creatorId: userId,
             },
           });

          await prisma.tournamentMatch.create({
            data: {
              tournamentId,
              matchId: match.id,
              round: 1,
              bracket: 'main',
            },
          });

          matches.push(match);
        }
      }
    }

    res.json({
      success: true,
      data: {
        tournament,
        matches,
        format: tournamentFormat,
      },
      message: 'Tournament brackets generated successfully',
    });
  } catch (error) {
    logger.error('Error generating tournament brackets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tournament brackets',
    });
  }
};

// Update tournament status
export const updateTournamentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: tournamentId } = req.params;
    if (!tournamentId) {
      res.status(400).json({
        success: false,
        message: 'Tournament ID is required',
      });
      return;
    }

    const { status } = req.body;

    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status },
      include: {
        club: {
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
      data: tournament,
      message: 'Tournament status updated successfully',
    });
  } catch (error) {
    logger.error('Error updating tournament status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tournament status',
    });
  }
};
