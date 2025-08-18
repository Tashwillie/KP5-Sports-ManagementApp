import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import matchRoomManager from '../services/matchRoomManager';

const router = Router();

// Validation schemas
const createRoomSchema = [
  body('matchId').isUUID(),
  body('maxParticipants').optional().isInt({ min: 1, max: 100 }),
  body('settings').optional().isObject(),
];

const updateRoomSchema = [
  body('maxParticipants').optional().isInt({ min: 1, max: 100 }),
  body('settings').optional().isObject(),
];

const addParticipantSchema = [
  body('userId').isUUID(),
  body('role').isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('permissions').optional().isArray(),
];

const updateParticipantSchema = [
  body('role').optional().isIn(['PLAYER', 'COACH', 'REFEREE', 'SPECTATOR']),
  body('permissions').optional().isArray(),
  body('isMuted').optional().isBoolean(),
  body('isVideoEnabled').optional().isBoolean(),
  body('isAudioEnabled').optional().isBoolean(),
];

const paramSchema = [
  param('roomId').isUUID(),
];

const participantParamSchema = [
  param('roomId').isUUID(),
  param('userId').isUUID(),
];

// Routes
router.post('/', createRoomSchema, validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { matchId, maxParticipants, settings } = req.body;
    const creatorId = (req as any).user.id;

    const room = await matchRoomManager.createRoom(matchId, creatorId, {
      maxParticipants,
      settings,
    });

    res.status(201).json({
      success: true,
      data: room,
      message: 'Match room created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create match room',
    });
  }
});

router.get('/:roomId', paramSchema, validateRequest, authenticate, requirePermission('matches.view'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await matchRoomManager.getRoom(roomId);

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Match room not found',
      });
      return;
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get match room',
    });
  }
});

router.put('/:roomId', [...paramSchema, ...updateRoomSchema], validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const updateData = req.body;
    const userId = (req as any).user.id;

    const room = await matchRoomManager.updateRoom(roomId, userId, updateData);

    res.json({
      success: true,
      data: room,
      message: 'Match room updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update match room',
    });
  }
});

router.delete('/:roomId', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;

    await matchRoomManager.deleteRoom(roomId, userId);

    res.json({
      success: true,
      message: 'Match room deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete match room',
    });
  }
});

// Participant management routes
router.post('/:roomId/participants', [...paramSchema, ...addParticipantSchema], validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, role, permissions } = req.body;
    const adminId = (req as any).user.id;

    const participant = await matchRoomManager.addParticipant(roomId, userId, role, permissions, adminId);

    res.status(201).json({
      success: true,
      data: participant,
      message: 'Participant added successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add participant',
    });
  }
});

router.put('/:roomId/participants/:userId', [...participantParamSchema, ...updateParticipantSchema], validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const updateData = req.body;
    const adminId = (req as any).user.id;

    const participant = await matchRoomManager.updateParticipant(roomId, userId, updateData, adminId);

    res.json({
      success: true,
      data: participant,
      message: 'Participant updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update participant',
    });
  }
});

router.delete('/:roomId/participants/:userId', participantParamSchema, validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const adminId = (req as any).user.id;

    await matchRoomManager.removeParticipant(roomId, userId, adminId);

    res.json({
      success: true,
      message: 'Participant removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove participant',
    });
  }
});

// Room control routes
router.post('/:roomId/start', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;

    const room = await matchRoomManager.startRoom(roomId, userId);

    res.json({
      success: true,
      data: room,
      message: 'Match room started successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start match room',
    });
  }
});

router.post('/:roomId/pause', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;

    const room = await matchRoomManager.pauseRoom(roomId, userId);

    res.json({
      success: true,
      data: room,
      message: 'Match room paused successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to pause match room',
    });
  }
});

router.post('/:roomId/end', paramSchema, validateRequest, authenticate, requirePermission('matches.manage'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = (req as any).user.id;

    const room = await matchRoomManager.endRoom(roomId, userId);

    res.json({
      success: true,
      data: room,
      message: 'Match room ended successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to end match room',
    });
  }
});

// Room analytics routes
router.get('/:roomId/analytics', paramSchema, validateRequest, authenticate, requirePermission('matches.view'), async (req, res) => {
  try {
    const { roomId } = req.params;
    const analytics = await matchRoomManager.getRoomAnalytics(roomId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get room analytics',
    });
  }
});

// List all match rooms
router.get('/', authenticate, requirePermission('matches.view'), async (req, res) => {
  try {
    const rooms = await matchRoomManager.getAllRooms();

    res.json({
      success: true,
      data: rooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get match rooms',
    });
  }
});

export default router;
