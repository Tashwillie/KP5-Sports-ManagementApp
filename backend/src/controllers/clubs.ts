import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all clubs with pagination and filtering
export const getClubs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      city,
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
        { city: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get clubs with pagination
    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
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
          _count: {
            select: {
              members: true,
              teams: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.club.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        clubs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get clubs error:', error);
    next(error);
  }
};

// Get single club by ID
export const getClub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
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
              },
            },
          },
        },
        teams: {
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            teams: true,
            events: true,
            tournaments: true,
          },
        },
      },
    });

    if (!club) {
      res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        club,
      },
    });
  } catch (error) {
    logger.error('Get club error:', error);
    next(error);
  }
};

// Create new club
export const createClub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      description,
      website,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
    } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    // Create club
    const club = await prisma.club.create({
      data: {
        name,
        description,
        website,
        address,
        city,
        state,
        country,
        postalCode,
        phone,
        email,
        creatorId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'OWNER',
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Club created successfully.',
      data: {
        club,
      },
    });
  } catch (error) {
    logger.error('Create club error:', error);
    next(error);
  }
};

// Update club
export const updateClub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }
    const {
      name,
      description,
      website,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      isActive,
    } = req.body;

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id },
    });

    if (!existingClub) {
      res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update club
    const club = await prisma.club.update({
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
      },
    });

    res.status(200).json({
      success: true,
      message: 'Club updated successfully.',
      data: {
        club,
      },
    });
  } catch (error) {
    logger.error('Update club error:', error);
    next(error);
  }
};

// Delete club
export const deleteClub = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id },
    });

    if (!existingClub) {
      res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
      return;
    }

    // Soft delete by setting isActive to false
    await prisma.club.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Club deleted successfully.',
    });
  } catch (error) {
    logger.error('Delete club error:', error);
    next(error);
  }
};

// Get club members
export const getClubMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: clubId } = req.params;

    if (!clubId) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Check if club exists
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

    // Get members with pagination
    const [members, total] = await Promise.all([
      prisma.clubMember.findMany({
        where: { clubId },
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
      prisma.clubMember.count({ where: { clubId } }),
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
    logger.error('Get club members error:', error);
    next(error);
  }
};

// Add club member
export const addClubMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: clubId } = req.params;

    if (!clubId) {
      res.status(400).json({
        success: false,
        message: 'Club ID is required.',
      });
      return;
    }
    const { userId, role = 'MEMBER' } = req.body;

    // Check if club exists
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
    const existingMember = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    });

    if (existingMember) {
      res.status(409).json({
        success: false,
        message: 'User is already a member of this club.',
      });
      return;
    }

    // Add member
    const member = await prisma.clubMember.create({
      data: {
        clubId,
        userId,
        role,
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
    logger.error('Add club member error:', error);
    next(error);
  }
};

// Update club member
export const updateClubMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clubId, userId } = req.params;

    if (!clubId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Club ID and User ID are required.',
      });
      return;
    }
    const { role, isActive } = req.body;

    // Check if member exists
    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    });

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Club member not found.',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update member
    const updatedMember = await prisma.clubMember.update({
      where: {
        clubId_userId: {
          clubId,
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
    logger.error('Update club member error:', error);
    next(error);
  }
};

// Remove club member
export const removeClubMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clubId, userId } = req.params;

    if (!clubId || !userId) {
      res.status(400).json({
        success: false,
        message: 'Club ID and User ID are required.',
      });
      return;
    }

    // Check if member exists
    const member = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    });

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Club member not found.',
      });
      return;
    }

    // Remove member
    await prisma.clubMember.delete({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully.',
    });
  } catch (error) {
    logger.error('Remove club member error:', error);
    next(error);
  }
};
