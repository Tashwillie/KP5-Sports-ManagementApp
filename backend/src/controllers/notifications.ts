import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { NotificationType, TeamRole, ClubRole } from '@prisma/client';

// Get all notifications with pagination and filtering
export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user.id;

    // Build where clause
    const where: any = {
      recipientId: userId,
    };

    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: {
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
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              startTime: true,
            },
          },
          match: {
            select: {
              id: true,
              title: true,
              startTime: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    next(error);
  }
};

// Get single notification by ID
export const getNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: userId,
      },
      include: {
        sender: {
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
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        match: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    logger.error('Error fetching notification:', error);
    next(error);
  }
};

// Create new notification
export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      message,
      type,
      recipientId,
      teamId,
      clubId,
      eventId,
      matchId,
      data,
    } = req.body;

    const userId = (req as any).user.id;

    // Validate that user has permission to send notifications
    if (recipientId) {
      // Check if recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
      });

      if (!recipient) {
        res.status(400).json({
          success: false,
          message: 'Recipient not found',
        });
        return;
      }
    }

    if (teamId) {
      // Check if user is member/admin of the team
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId,
          role: { in: [TeamRole.COACH, TeamRole.MANAGER] },
        },
      });

      if (!teamMember) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to send team notifications',
        });
        return;
      }
    }

    if (clubId) {
      // Check if user is member/admin of the club
      const clubMember = await prisma.clubMember.findFirst({
        where: {
          clubId,
          userId,
          role: { in: [ClubRole.ADMIN, ClubRole.COACH] },
        },
      });

      if (!clubMember) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to send club notifications',
        });
        return;
      }
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        senderId: userId,
        recipientId,
        teamId,
        clubId,
        eventId,
        matchId,
        data,
      },
      include: {
        sender: {
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
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        match: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully',
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    next(error);
  }
};

// Update notification
export const updateNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;
    const updateData = { ...req.body };

    // Check if user is the recipient or sender
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { recipientId: userId },
          { senderId: userId },
        ],
      },
    });

    if (!notification) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this notification',
      });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
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
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        match: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notification updated successfully',
    });
  } catch (error) {
    logger.error('Error updating notification:', error);
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    // Check if user is the recipient or sender
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { recipientId: userId },
          { senderId: userId },
        ],
      },
    });

    if (!notification) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this notification',
      });
      return;
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Notification ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    await prisma.notification.updateMany({
      where: {
        id,
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    next(error);
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const preferences = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        eventReminders: true,
        matchUpdates: true,
        teamMessages: true,
        clubAnnouncements: true,
        tournamentUpdates: true,
      },
    });

    res.json({
      success: true,
      data: preferences || {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        eventReminders: true,
        matchUpdates: true,
        teamMessages: true,
        clubAnnouncements: true,
        tournamentUpdates: true,
      },
    });
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    next(error);
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const updateData = { ...req.body };

    const preferences = await prisma.userProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        eventReminders: true,
        matchUpdates: true,
        teamMessages: true,
        clubAnnouncements: true,
        tournamentUpdates: true,
      },
    });

    res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    next(error);
  }
};

// Send push notification
export const sendPushNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      message,
      recipientIds,
      teamId,
      clubId,
      data,
    } = req.body;

    const userId = (req as any).user.id;

    // Validate permissions
    if (teamId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId,
          role: { in: [TeamRole.COACH, TeamRole.MANAGER] },
        },
      });

      if (!teamMember) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to send team push notifications',
        });
        return;
      }
    }

    if (clubId) {
      const clubMember = await prisma.clubMember.findFirst({
        where: {
          clubId,
          userId,
          role: { in: [ClubRole.ADMIN, ClubRole.COACH] },
        },
      });

      if (!clubMember) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to send club push notifications',
        });
        return;
      }
    }

    // Get recipients
    let recipients: string[] = [];

    if (recipientIds && Array.isArray(recipientIds)) {
      recipients = recipientIds;
    } else if (teamId) {
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId },
        select: { userId: true },
      });
      recipients = teamMembers.map(member => member.userId);
    } else if (clubId) {
      const clubMembers = await prisma.clubMember.findMany({
        where: { clubId },
        select: { userId: true },
      });
      recipients = clubMembers.map(member => member.userId);
    }

    if (recipients.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No recipients found',
      });
      return;
    }

    // Create notifications for all recipients
    const notifications = recipients.map(recipientId => ({
      title,
      message,
      type: NotificationType.INFO,
      senderId: userId,
      recipientId,
      teamId,
      clubId,
      data,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // TODO: Implement actual push notification sending
    // This would integrate with services like Firebase Cloud Messaging
    // or Expo Push Notifications for mobile apps

    res.json({
      success: true,
      message: `Push notification sent to ${recipients.length} recipients`,
      data: {
        recipientsCount: recipients.length,
        title,
        message,
      },
    });
  } catch (error) {
    logger.error('Error sending push notification:', error);
    next(error);
  }
};
