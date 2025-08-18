import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { RegistrationStatus } from '@prisma/client';

// Get all registrations with pagination and filtering
export const getRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      waiverSigned,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user.id;

    // Build where clause
    const where: any = {
      userId,
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (waiverSigned !== undefined) where.waiverSigned = waiverSigned === 'true';
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.registration.count({ where }),
    ]);

    res.json({
      success: true,
      data: registrations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching registrations:', error);
    next(error);
  }
};

// Get single registration by ID
export const getRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    const registration = await prisma.registration.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
      return;
    }

    res.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    logger.error('Error fetching registration:', error);
    next(error);
  }
};

// Create new registration
export const createRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      type,
      formData,
      waiverSigned = false,
      paymentId,
    } = req.body;

    const userId = (req as any).user.id;

    const registration = await prisma.registration.create({
      data: {
        type,
        formData,
        waiverSigned,
        paymentId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Registration created successfully',
    });
  } catch (error) {
    logger.error('Error creating registration:', error);
    next(error);
  }
};

// Update registration
export const updateRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;
    const updateData = { ...req.body };

    // Check if user owns the registration
    const registration = await prisma.registration.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!registration) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this registration',
      });
      return;
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedRegistration,
      message: 'Registration updated successfully',
    });
  } catch (error) {
    logger.error('Error updating registration:', error);
    next(error);
  }
};

// Delete registration (soft delete by setting status to CANCELLED)
export const deleteRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    // Check if user owns the registration
    const registration = await prisma.registration.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!registration) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this registration',
      });
      return;
    }

    // Soft delete by setting status to CANCELLED
    await prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.CANCELLED },
    });

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    logger.error('Error deleting registration:', error);
    next(error);
  }
};

// Approve registration (admin only)
export const approveRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['SUPER_ADMIN', 'CLUB_ADMIN'].includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to approve registrations',
      });
      return;
    }

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
      return;
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.APPROVED },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedRegistration,
      message: 'Registration approved successfully',
    });
  } catch (error) {
    logger.error('Error approving registration:', error);
    next(error);
  }
};

// Reject registration (admin only)
export const rejectRegistration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['SUPER_ADMIN', 'CLUB_ADMIN'].includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to reject registrations',
      });
      return;
    }

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
      return;
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.REJECTED },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedRegistration,
      message: 'Registration rejected successfully',
    });
  } catch (error) {
    logger.error('Error rejecting registration:', error);
    next(error);
  }
};

// Sign waiver
export const signWaiver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID is required',
      });
      return;
    }

    const { waiverText, signature } = req.body;
    const userId = (req as any).user.id;

    // Check if user owns the registration
    const registration = await prisma.registration.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!registration) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to sign this waiver',
      });
      return;
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: {
        waiverSigned: true,
        formData: {
          ...(registration.formData as any || {}),
          waiver: {
            signed: true,
            signedAt: new Date().toISOString(),
            waiverText,
            signature,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedRegistration,
      message: 'Waiver signed successfully',
    });
  } catch (error) {
    logger.error('Error signing waiver:', error);
    next(error);
  }
};

// Get registration form templates
export const getRegistrationForms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Define form templates for different registration types
    const formTemplates = {
      PLAYER: {
        title: 'Player Registration Form',
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
          { name: 'gender', label: 'Gender', type: 'select', options: ['MALE', 'FEMALE', 'OTHER'], required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'emergencyContact', label: 'Emergency Contact', type: 'text', required: true },
          { name: 'medicalConditions', label: 'Medical Conditions', type: 'textarea', required: false },
          { name: 'experience', label: 'Playing Experience', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], required: true },
        ],
        waiver: {
          required: true,
          text: 'I acknowledge that participation in sports activities involves inherent risks...',
        },
      },
      TEAM: {
        title: 'Team Registration Form',
        fields: [
          { name: 'teamName', label: 'Team Name', type: 'text', required: true },
          { name: 'teamLevel', label: 'Team Level', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'], required: true },
          { name: 'coachName', label: 'Coach Name', type: 'text', required: true },
          { name: 'coachEmail', label: 'Coach Email', type: 'email', required: true },
          { name: 'coachPhone', label: 'Coach Phone', type: 'tel', required: true },
          { name: 'teamDescription', label: 'Team Description', type: 'textarea', required: false },
        ],
        waiver: {
          required: true,
          text: 'The team acknowledges responsibility for all team members...',
        },
      },
      TOURNAMENT: {
        title: 'Tournament Registration Form',
        fields: [
          { name: 'tournamentName', label: 'Tournament Name', type: 'text', required: true },
          { name: 'category', label: 'Category', type: 'text', required: true },
          { name: 'ageGroup', label: 'Age Group', type: 'text', required: true },
          { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], required: true },
          { name: 'previousExperience', label: 'Previous Tournament Experience', type: 'textarea', required: false },
        ],
        waiver: {
          required: true,
          text: 'I understand the tournament rules and agree to abide by them...',
        },
      },
      EVENT: {
        title: 'Event Registration Form',
        fields: [
          { name: 'eventName', label: 'Event Name', type: 'text', required: true },
          { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
          { name: 'participantCount', label: 'Number of Participants', type: 'number', required: true },
          { name: 'specialRequirements', label: 'Special Requirements', type: 'textarea', required: false },
        ],
        waiver: {
          required: true,
          text: 'I acknowledge participation in this event and understand the risks involved...',
        },
      },
    };

    res.json({
      success: true,
      data: formTemplates,
    });
  } catch (error) {
    logger.error('Error fetching registration forms:', error);
    next(error);
  }
};

// Submit registration form
export const submitRegistrationForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      type,
      formData,
      waiverSigned,
    } = req.body;

    const userId = (req as any).user.id;

    // Validate waiver signature if required
    if (!waiverSigned) {
      res.status(400).json({
        success: false,
        message: 'Waiver must be signed to complete registration',
      });
      return;
    }

    const registration = await prisma.registration.create({
      data: {
        type,
        formData,
        waiverSigned,
        status: RegistrationStatus.PENDING,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Registration form submitted successfully',
    });
  } catch (error) {
    logger.error('Error submitting registration form:', error);
    next(error);
  }
};
