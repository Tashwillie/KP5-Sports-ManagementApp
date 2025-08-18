import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all users with pagination and filtering
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { displayName: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          profile: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      data: {
        users: usersWithoutPasswords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

// Get single user by ID
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        teams: {
          include: {
            team: true,
          },
        },
        clubs: {
          include: {
            club: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

// Create new user
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, displayName, firstName, lastName, phone, role = 'PLAYER' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
      });
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        firstName,
        lastName,
        phone,
        role,
        profile: {
          create: {
            bio: null,
            height: null,
            weight: null,
            position: null,
            jerseyNumber: null,
            emergencyContact: null,
            medicalInfo: null,
            preferences: {},
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { displayName, firstName, lastName, phone, role, isActive } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        profile: user.profile,
      },
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { bio, height, weight, position, jerseyNumber, emergencyContact, medicalInfo, preferences } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (position !== undefined) updateData.position = position;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (medicalInfo !== undefined) updateData.medicalInfo = medicalInfo;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Update profile (create if doesn't exist)
    const profile = await prisma.userProfile.upsert({
      where: { userId: id },
      update: updateData,
      create: {
        userId: id,
        ...updateData,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        profile,
      },
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    next(error);
  }
};
