import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Get all messages with pagination and filtering
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      teamId,
      clubId,
      recipientId,
      startDate,
      endDate,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user.id;

    // Build where clause
    const where: any = {
      OR: [
        { senderId: userId },
        { recipients: { some: { recipientId: userId } } },
      ],
    };

    if (type) where.type = type;
    if (teamId) where.teamId = teamId;
    if (clubId) where.clubId = clubId;
    if (recipientId) {
      where.OR = [
        { senderId: userId, recipients: { some: { recipientId: recipientId as string } } },
        { senderId: recipientId, recipients: { some: { recipientId: userId } } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
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
          recipients: {
            include: {
              recipient: {
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
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.message.count({ where }),
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

// Get single message by ID
export const getMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    const message = await prisma.message.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { recipients: { some: { recipientId: userId } } },
        ],
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
        recipients: {
          include: {
            recipient: {
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
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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
      },
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found',
      });
      return;
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
    });
  }
};

// Create new message
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      content,
      type,
      recipientId,
      teamId,
      clubId,
      replyToId,
    } = req.body;

    const userId = (req as any).user.id;

    // Validate that user can send to recipient/team/club
    if (recipientId) {
      // Check if recipient exists and user has permission to message them
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
      // Check if user is member of the team
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId,
        },
      });

      if (!teamMember) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this team',
        });
        return;
      }
    }

    if (clubId) {
      // Check if user is member of the club
      const clubMember = await prisma.clubMember.findFirst({
        where: {
          clubId,
          userId,
        },
      });

      if (!clubMember) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this club',
        });
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: userId,
        teamId,
        clubId,
        replyToId,
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
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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
      },
    });

    // Add recipients
    if (recipientId) {
      // Direct message
      await prisma.messageRecipient.create({
        data: {
          messageId: message.id,
          recipientId,
        },
      });
    } else if (teamId) {
      // Team message - add all team members as recipients
      const teamMembers = await prisma.teamMember.findMany({
        where: {
          teamId,
          userId: { not: userId }, // Exclude sender
        },
      });

      const recipients = teamMembers.map(member => ({
        messageId: message.id,
        recipientId: member.userId,
      }));

      if (recipients.length > 0) {
        await prisma.messageRecipient.createMany({
          data: recipients,
        });
      }
    } else if (clubId) {
      // Club message - add all club members as recipients
      const clubMembers = await prisma.clubMember.findMany({
        where: {
          clubId,
          userId: { not: userId }, // Exclude sender
        },
      });

      const recipients = clubMembers.map(member => ({
        messageId: message.id,
        recipientId: member.userId,
      }));

      if (recipients.length > 0) {
        await prisma.messageRecipient.createMany({
          data: recipients,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error) {
    logger.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// Update message
export const updateMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;
    const updateData = { ...req.body };

    // Check if user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: userId,
      },
    });

    if (!message) {
      res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
      return;
    }

    // Mark as edited
    updateData.isEdited = true;

    const updatedMessage = await prisma.message.update({
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
        recipients: {
          include: {
            recipient: {
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
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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
      },
    });

    res.json({
      success: true,
      data: updatedMessage,
      message: 'Message updated successfully',
    });
  } catch (error) {
    logger.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
    });
  }
};

// Delete message
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    // Check if user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: userId,
      },
    });

    if (!message) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
      return;
    }

    // Delete message recipients first
    await prisma.messageRecipient.deleteMany({
      where: { messageId: id },
    });

    // Delete the message
    await prisma.message.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};

// Get conversations list
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get all conversations (direct messages and team/club chats)
    const conversations = await prisma.message.groupBy({
      by: ['teamId', 'clubId'],
      where: {
        OR: [
          { senderId: userId },
          { recipients: { some: { recipientId: userId } } },
        ],
        AND: [
          {
            OR: [
              { teamId: { not: null } },
              { clubId: { not: null } },
            ],
          },
        ],
      },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
    });

    // Get direct message conversations
    const directConversations = await prisma.messageRecipient.groupBy({
      by: ['recipientId'],
      where: {
        OR: [
          { recipientId: userId },
          { message: { senderId: userId } },
        ],
      },
      _count: {
        messageId: true,
      },
    });

    // Get unread counts
    const unreadCounts = await prisma.messageRecipient.groupBy({
      by: ['recipientId'],
      where: {
        recipientId: userId,
        isRead: false,
      },
      _count: {
        messageId: true,
      },
    });

    const unreadMap = new Map(
      unreadCounts.map(item => [item.recipientId, item._count.messageId])
    );

    // Format conversations
    const formattedConversations = [];

    // Add team/club conversations
    for (const conv of conversations) {
      if (conv.teamId) {
        const team = await prisma.team.findUnique({
          where: { id: conv.teamId },
          select: {
            id: true,
            name: true,
            logo: true,
          },
        });

        if (team) {
          formattedConversations.push({
            id: `team_${team.id}`,
            type: 'team',
            name: team.name,
            logo: team.logo,
            lastMessageAt: conv._max.createdAt,
            messageCount: conv._count.id,
            unreadCount: 0, // Team messages don't have individual read status
          });
        }
      } else if (conv.clubId) {
        const club = await prisma.club.findUnique({
          where: { id: conv.clubId },
          select: {
            id: true,
            name: true,
            logo: true,
          },
        });

        if (club) {
          formattedConversations.push({
            id: `club_${club.id}`,
            type: 'club',
            name: club.name,
            logo: club.logo,
            lastMessageAt: conv._max.createdAt,
            messageCount: conv._count.id,
            unreadCount: 0, // Club messages don't have individual read status
          });
        }
      }
    }

    // Add direct message conversations
    for (const conv of directConversations) {
      const user = await prisma.user.findUnique({
        where: { id: conv.recipientId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });

      if (user) {
        // Get the last message in this conversation
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipients: { some: { recipientId: user.id } } },
              { senderId: user.id, recipients: { some: { recipientId: userId } } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        });

        formattedConversations.push({
          id: `user_${user.id}`,
          type: 'direct',
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: user.avatar,
          lastMessageAt: lastMessage?.createdAt || null,
          messageCount: conv._count?.messageId || 0,
          unreadCount: unreadMap.get(user.id) || 0,
        });
      }
    }

    // Sort by last message date
    formattedConversations.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    res.json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};

// Get conversation with specific user
export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientId } = req.params;
    if (!recipientId) {
      res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get messages between the two users
    const where = {
      OR: [
        { senderId: userId, recipients: { some: { recipientId } } },
        { senderId: recipientId, recipients: { some: { recipientId: userId } } },
      ],
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
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
          recipients: {
            include: {
              recipient: {
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
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.message.count({ where }),
    ]);

    // Mark messages as read
    await prisma.messageRecipient.updateMany({
      where: {
        messageId: { in: messages.map(m => m.id) },
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
    });
  }
};

// Mark message as read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    await prisma.messageRecipient.updateMany({
      where: {
        messageId: id,
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    logger.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
    });
  }
};

// Mark all messages as read
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { recipientId, teamId, clubId } = req.body;

    let where: any = {
      recipientId: userId,
      isRead: false,
    };

    if (recipientId) {
      where.message = {
        OR: [
          { senderId: recipientId },
          { senderId: userId },
        ],
      };
    } else if (teamId) {
      where.message = { teamId };
    } else if (clubId) {
      where.message = { clubId };
    }

    await prisma.messageRecipient.updateMany({
      where,
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All messages marked as read',
    });
  } catch (error) {
    logger.error('Error marking all messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
    });
  }
};
