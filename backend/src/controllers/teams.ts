import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all teams with pagination and filtering
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      clubId,
      level,
      gender,
      isActive,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { ageGroup: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (clubId) {
      where.clubId = clubId;
    }

    if (level) {
      where.level = level;
    }

    if (gender) {
      where.gender = gender;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get teams with pagination
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          club: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.team.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        teams,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams.',
    });
  }
};

// Get single team by ID
export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
            matches: true,
          },
        },
      },
    });

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    logger.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team.',
    });
  }
};

// Create new team
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      ageGroup,
      gender,
      level = 'BEGINNER',
      clubId,
    } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Check if club exists if clubId is provided
    if (clubId) {
      const club = await prisma.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        res.status(404).json({
          success: false,
          message: 'Club not found.',
        });
        return;
      }
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        description,
        ageGroup,
        gender,
        level,
        clubId,
        creatorId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'COACH',
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      data: {
        team,
      },
    });
  } catch (error) {
    logger.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team.',
    });
  }
};

// Update team
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }
    const {
      name,
      description,
      ageGroup,
      gender,
      level,
      isActive,
    } = req.body;

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;
    if (gender !== undefined) updateData.gender = gender;
    if (level !== undefined) updateData.level = level;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update team
    const team = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Team updated successfully.',
      data: {
        team,
      },
    });
  } catch (error) {
    logger.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team.',
    });
  }
};

// Delete team
export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
      return;
    }

    // Soft delete by setting isActive to false
    await prisma.team.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully.',
    });
  } catch (error) {
    logger.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team.',
    });
  }
};

// Get team members
export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
      return;
    }

    // Get members with pagination
    const [members, total] = await Promise.all([
      prisma.teamMember.findMany({
        where: { teamId },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'desc',
        },
      }),
      prisma.teamMember.count({ where: { teamId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        members,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members.',
    });
  }
};

// Add team member
export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: teamId } = req.params;

    if (!teamId) {
      res.status(400).json({
        success: false,
        message: 'Team ID is required.',
      });
      return;
    }
    const { userId, role = 'PLAYER', jerseyNumber } = req.body;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existingMember) {
      res.status(409).json({
        success: false,
        message: 'User is already a member of this team.',
      });
      return;
    }

    // Add member
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
        jerseyNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Member added successfully.',
      data: {
        member,
      },
    });
  } catch (error) {
    logger.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member.',
    });
  }
};

// Update team member
export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, userId } = req.params;

    if (!teamId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Team ID and User ID are required.',
      });
      return;
    }
    const { role, jerseyNumber, isActive } = req.body;

    // Check if member exists
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Team member not found.',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update member
    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Member updated successfully.',
      data: {
        member: updatedMember,
      },
    });
  } catch (error) {
    logger.error('Update team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member.',
    });
  }
};

// Remove team member
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, userId } = req.params;

    if (!teamId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Team ID and User ID are required.',
      });
      return;
    }

    // Check if member exists
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Team member not found.',
      });
      return;
    }

    // Remove member
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully.',
    });
  } catch (error) {
    logger.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member.',
    });
  }
};
