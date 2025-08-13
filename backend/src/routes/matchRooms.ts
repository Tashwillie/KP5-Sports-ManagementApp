import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import matchRoomManager from '../services/matchRoomManager';
import { webSocketService } from '../index';

const router = Router();

// Validation schemas
const roomSettingsSchema = [
  body('allowChat').optional().isBoolean(),
  body('allowSpectators').optional().isBoolean(),
  body('maxSpectators').optional().isInt({ min: 1, max: 1000 }),
  body('requireApproval').optional().isBoolean(),
  body('autoKickInactive').optional().isBoolean(),
  body('inactivityTimeout').optional().isInt({ min: 1, max: 120 }),
  body('enableTypingIndicators').optional().isBoolean(),
  body('enableReadReceipts').optional().isBoolean()
];

const participantManagementSchema = [
  body('action').isIn(['kick', 'mute', 'promote', 'demote', 'ban']),
  body('targetUserId').isUUID(),
  body('reason').optional().isString().trim().isLength({ max: 500 }),
  body('duration').optional().isInt({ min: 1, max: 1440 }) // minutes, max 24 hours
];

const joinRoomSchema = [
  body('role').isIn(['PARTICIPANT', 'SPECTATOR', 'REFEREE', 'COACH', 'ADMIN']),
  body('teamId').optional().isUUID(),
  body('permissions').optional().isArray(),
  body('permissions.*').optional().isString()
];

// Get all active match rooms
router.get('/', authenticate, requirePermission('matches.view'), async (req, res) => {
  try {
    const rooms = matchRoomManager.getAllMatchRooms();
    const roomInfos = Array.from(rooms.entries()).map(([matchId, room]) => ({
      matchId,
      roomName: room.roomName,
      participantCount: matchRoomManager.getParticipantCount(matchId),
      isActive: room.isActive,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      metadata: room.metadata
    }));

    res.json({
      success: true,
      data: {
        totalRooms: roomInfos.length,
        rooms: roomInfos
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match rooms'
    });
  }
});

// Get specific match room information
router.get('/:matchId', [param('matchId').isUUID()], validateRequest, authenticate, requirePermission('matches.view'), async (req, res) => {
  try {
    const { matchId } = req.params;
    const roomInfo = matchRoomManager.getRoomInfo(matchId);
    
    res.json({
      success: true,
      data: roomInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room information'
    });
  }
});

// Create or join match room
router.post('/:matchId/join', [
  param('matchId').isUUID(),
  ...joinRoomSchema
], validateRequest, authenticate, requirePermission('matches.view'), async (req, res) => {
  try {
    const { matchId } = req.params;
    const { role, teamId, permissions = [] } = req.body;
    const userId = (req as any).user.id;
    
    // Get or create match room
    const matchRoom = await matchRoomManager.getOrCreateMatchRoom(matchId);
    
    // Create participant object
    const participant = {
      userId,
      socketId: '', // Will be set by WebSocket service
      userRole: (req as any).user.role,
      userEmail: (req as any).user.email,
      displayName: (req as any).user.email.split('@')[0],
      teamId,
      joinedAt: new Date(),
      lastActivity: new Date(),
      permissions,
      isTyping: false,
      isOnline: true
    };
    
    // Add participant to room
    const success = matchRoomManager.addParticipant(matchId, participant, role);
    
    if (success) {
      res.json({
        success: true,
        message: 'Successfully joined match room',
        data: {
          matchId,
          role,
          roomName: matchRoom.roomName,
          settings: matchRoom.settings,
          metadata: matchRoom.metadata
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to join room (possibly at spectator capacity)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join match room'
    });
  }
});

// Leave match room
router.post('/:matchId/leave', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = (req as any).user.id;
    
    const success = matchRoomManager.removeParticipant(matchId, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Successfully left match room'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found in room'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to leave match room'
    });
  }
});

// Get room participants
router.get('/:matchId/participants', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const participants = matchRoomManager.getAllParticipants(matchId);
    
    res.json({
      success: true,
      data: {
        matchId,
        participantCount: participants.length,
        participants: participants.map(p => ({
          userId: p.userId,
          userEmail: p.userEmail,
          userRole: p.userRole,
          displayName: p.displayName,
          category: p.category,
          teamId: p.teamId,
          joinedAt: p.joinedAt,
          lastActivity: p.lastActivity,
          isTyping: p.isTyping,
          isOnline: p.isOnline,
          permissions: p.permissions
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room participants'
    });
  }
});

// Get room analytics
router.get('/:matchId/analytics', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const analytics = matchRoomManager.getRoomAnalytics(matchId);
    
    if (!analytics) {
      res.status(404).json({
        success: false,
        message: 'Room analytics not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        matchId,
        analytics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room analytics'
    });
  }
});

// Update room settings
router.put('/:matchId/settings', [
  param('matchId').isUUID(),
  ...roomSettingsSchema
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const settings = req.body;
    const userId = (req as any).user.id;
    
    // Check if user has admin permissions
    if (!matchRoomManager.hasAdminPermissions(userId, matchId)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update room settings'
      });
      return;
    }
    
    const success = matchRoomManager.updateRoomSettings(matchId, settings);
    
    if (success) {
      // Broadcast settings update via WebSocket
      const room = `match:${matchId}`;
      webSocketService.broadcastToRoom(room, 'room-settings-updated', {
        settings: matchRoomManager.getRoomSettings(matchId),
        updatedBy: userId,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        message: 'Room settings updated successfully',
        data: {
          matchId,
          settings: matchRoomManager.getRoomSettings(matchId)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update room settings'
    });
  }
});

// Get room settings
router.get('/:matchId/settings', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const settings = matchRoomManager.getRoomSettings(matchId);
    
    if (!settings) {
      res.status(404).json({
        success: false,
        message: 'Room settings not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        matchId,
        settings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room settings'
    });
  }
});

// Manage room participants
router.post('/:matchId/participants/manage', [
  param('matchId').isUUID(),
  ...participantManagementSchema
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { action, targetUserId, reason, duration } = req.body;
    const userId = (req as any).user.id;
    
    // Check if user has admin permissions
    if (!matchRoomManager.hasAdminPermissions(userId, matchId)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to manage participants'
      });
      return;
    }
    
    // Check if target user exists in room
    const targetParticipant = matchRoomManager.findParticipant(matchId, targetUserId);
    if (!targetParticipant) {
      res.status(404).json({
        success: false,
        message: 'Target participant not found in room'
      });
      return;
    }
    
    // Perform action
    let success = false;
    let message = '';
    
    switch (action) {
      case 'kick':
        success = matchRoomManager.removeParticipant(matchId, targetUserId);
        message = 'Participant kicked from room';
        break;
      case 'mute':
        // Add mute permission
        targetParticipant.permissions.push('MUTED');
        success = true;
        message = 'Participant muted';
        break;
      case 'promote':
        // Move to coaches category
        matchRoomManager.removeParticipant(matchId, targetUserId);
        targetParticipant.category = 'COACH';
        success = matchRoomManager.addParticipant(matchId, targetParticipant, 'COACH');
        message = 'Participant promoted to coach';
        break;
      case 'demote':
        // Move to spectators category
        matchRoomManager.removeParticipant(matchId, targetUserId);
        targetParticipant.category = 'SPECTATOR';
        success = matchRoomManager.addParticipant(matchId, targetParticipant, 'SPECTATOR');
        message = 'Participant demoted to spectator';
        break;
      case 'ban':
        // Add ban permission and remove from room
        targetParticipant.permissions.push('BANNED');
        success = matchRoomManager.removeParticipant(matchId, targetUserId);
        message = 'Participant banned from room';
        break;
    }
    
    if (success) {
      // Broadcast participant management action via WebSocket
      const room = `match:${matchId}`;
      webSocketService.broadcastToRoom(room, 'participant-managed', {
        action,
        targetUserId,
        reason,
        duration,
        managedBy: userId,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        message,
        data: {
          matchId,
          action,
          targetUserId,
          reason,
          duration
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to perform action'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to manage participant'
    });
  }
});

// Get room metadata
router.get('/:matchId/metadata', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const metadata = matchRoomManager.getRoomMetadata(matchId);
    
    if (!metadata) {
      res.status(404).json({
        success: false,
        message: 'Room metadata not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        matchId,
        metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room metadata'
    });
  }
});

// Update room metadata
router.put('/:matchId/metadata', [
  param('matchId').isUUID(),
  body('weather').optional().isString().trim(),
  body('pitchCondition').optional().isString().trim(),
  body('expectedDuration').optional().isInt({ min: 30, max: 180 })
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const updates = req.body;
    const userId = (req as any).user.id;
    
    // Check if user has admin permissions
    if (!matchRoomManager.hasAdminPermissions(userId, matchId)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update room metadata'
      });
      return;
    }
    
    // For now, we'll just return success since the metadata is read-only
    // In a real implementation, you might want to store this in the database
    res.json({
      success: true,
      message: 'Room metadata updated successfully',
      data: {
        matchId,
        updates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update room metadata'
    });
  }
});

// Get room statistics
router.get('/:matchId/stats', [
  param('matchId').isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const participantCount = matchRoomManager.getParticipantCount(matchId);
    const activeCount = matchRoomManager.getActiveParticipantCount(matchId);
    const analytics = matchRoomManager.getRoomAnalytics(matchId);
    
    res.json({
      success: true,
      data: {
        matchId,
        stats: {
          totalParticipants: participantCount,
          activeParticipants: activeCount,
          inactiveParticipants: participantCount - activeCount,
          analytics: analytics || {}
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room statistics'
    });
  }
});

// Search participants in room
router.get('/:matchId/participants/search', [
  param('matchId').isUUID(),
  query('query').isString().trim().isLength({ min: 1, max: 100 }),
  query('category').optional().isIn(['PARTICIPANT', 'SPECTATOR', 'REFEREE', 'COACH', 'ADMIN']),
  query('teamId').optional().isUUID()
], validateRequest, authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { query, category, teamId } = req.query;
    
    const participants = matchRoomManager.getAllParticipants(matchId);
    
    // Filter participants based on search criteria
    let filteredParticipants = participants.filter(p => {
      const matchesQuery = p.displayName.toLowerCase().includes(query.toLowerCase()) ||
                          p.userEmail.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || p.category === category;
      const matchesTeam = !teamId || p.teamId === teamId;
      
      return matchesQuery && matchesCategory && matchesTeam;
    });
    
    res.json({
      success: true,
      data: {
        matchId,
        query,
        filters: { category, teamId },
        results: filteredParticipants,
        totalResults: filteredParticipants.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search participants'
    });
  }
});

// Export router
export default router;
