import { logger } from '../utils/logger';
import prisma from '../config/database';

interface RoomSettings {
  allowChat: boolean;
  allowSpectators: boolean;
  maxSpectators: number;
  requireApproval: boolean;
  autoKickInactive: boolean;
  inactivityTimeout: number;
  enableTypingIndicators: boolean;
  enableReadReceipts: boolean;
}

interface RoomMetadata {
  weather?: string;
  pitchCondition?: string;
  expectedDuration?: number;
}

interface RoomAnalytics {
  totalParticipants: number;
  activeParticipants: number;
  messagesSent: number;
  eventsRecorded: number;
  uptime: number;
  lastActivity: Date;
}

interface RoomParticipant {
  userId: string;
  socketId: string;
  userRole: string;
  userEmail: string;
  displayName: string;
  teamId?: string;
  joinedAt: Date;
  lastActivity: Date;
  permissions: string[];
  isTyping: boolean;
  isOnline: boolean;
  category: 'PARTICIPANT' | 'SPECTATOR' | 'REFEREE' | 'COACH' | 'ADMIN';
}

interface MatchRoom {
  matchId: string;
  roomName: string;
  participants: Map<string, RoomParticipant>;
  settings: RoomSettings;
  metadata: RoomMetadata;
  analytics: RoomAnalytics;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export class MatchRoomManager {
  private matchRooms: Map<string, MatchRoom> = new Map();
  private roomAnalytics: Map<string, RoomAnalytics> = new Map();

  constructor() {
    logger.info('MatchRoomManager initialized');
    this.startCleanupInterval();
  }

  // Create a new match room
  public async createRoom(matchId: string, creatorId: string, options?: { maxParticipants?: number; settings?: Partial<RoomSettings> }): Promise<MatchRoom> {
    const room: MatchRoom = {
      matchId,
      roomName: `match-${matchId}`,
      participants: new Map(),
      settings: {
        ...this.getDefaultRoomSettings(),
        ...options?.settings,
      },
      metadata: this.getDefaultMetadata(),
      analytics: this.getDefaultAnalytics(),
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.matchRooms.set(matchId, room);
    logger.info(`Created match room for match ${matchId}`);
    return room;
  }

  // Get a specific room
  public async getRoom(roomId: string): Promise<MatchRoom | null> {
    return this.matchRooms.get(roomId) || null;
  }

  // Update room settings
  public async updateRoom(roomId: string, userId: string, updateData: Partial<RoomSettings>): Promise<MatchRoom | null> {
    const room = this.matchRooms.get(roomId);
    if (!room) return null;

    // Check if user has admin permissions
    const participant = room.participants.get(userId);
    if (!participant || !participant.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to update room');
    }

    room.settings = { ...room.settings, ...updateData };
    room.lastActivity = new Date();
    
    logger.info(`Updated room ${roomId} by user ${userId}`);
    return room;
  }

  // Delete a room
  public async deleteRoom(roomId: string, userId: string): Promise<void> {
    const room = this.matchRooms.get(roomId);
    if (!room) return;

    // Check if user has admin permissions
    const participant = room.participants.get(userId);
    if (!participant || !participant.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to delete room');
    }

    this.matchRooms.delete(roomId);
    logger.info(`Deleted room ${roomId} by user ${userId}`);
  }

  // Add participant to room
  public async addParticipant(roomId: string, userId: string, role: string, permissions: string[] = [], adminId: string): Promise<RoomParticipant> {
    const room = this.matchRooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Check if admin has permissions
    const admin = room.participants.get(adminId);
    if (!admin || !admin.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to add participant');
    }

    const participant: RoomParticipant = {
      userId,
      socketId: '',
      userRole: role,
      userEmail: '',
      displayName: '',
      joinedAt: new Date(),
      lastActivity: new Date(),
      permissions,
      isTyping: false,
      isOnline: true,
      category: 'PARTICIPANT',
    };

    room.participants.set(userId, participant);
    room.lastActivity = new Date();
    this.updateRoomAnalytics(roomId, 'totalParticipants');

    logger.info(`Added participant ${userId} to room ${roomId}`);
    return participant;
  }

  // Update participant
  public async updateParticipant(roomId: string, userId: string, updateData: Partial<RoomParticipant>, adminId: string): Promise<RoomParticipant | null> {
    const room = this.matchRooms.get(roomId);
    if (!room) return null;

    // Check if admin has permissions
    const admin = room.participants.get(adminId);
    if (!admin || !admin.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to update participant');
    }

    const participant = room.participants.get(userId);
    if (!participant) return null;

    Object.assign(participant, updateData);
    participant.lastActivity = new Date();
    room.lastActivity = new Date();

    logger.info(`Updated participant ${userId} in room ${roomId}`);
    return participant;
  }

  // Remove participant from room
  public async removeParticipant(roomId: string, userId: string, adminId: string): Promise<void> {
    const room = this.matchRooms.get(roomId);
    if (!room) return;

    // Check if admin has permissions
    const admin = room.participants.get(adminId);
    if (!admin || !admin.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to remove participant');
    }

    room.participants.delete(userId);
    room.lastActivity = new Date();
    this.updateRoomAnalytics(roomId, 'totalParticipants');

    logger.info(`Removed participant ${userId} from room ${roomId}`);
  }

  // Start room
  public async startRoom(roomId: string, userId: string): Promise<MatchRoom | null> {
    const room = this.matchRooms.get(roomId);
    if (!room) return null;

    // Check if user has admin permissions
    const participant = room.participants.get(userId);
    if (!participant || !participant.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to start room');
    }

    room.isActive = true;
    room.lastActivity = new Date();
    
    logger.info(`Started room ${roomId} by user ${userId}`);
    return room;
  }

  // Pause room
  public async pauseRoom(roomId: string, userId: string): Promise<MatchRoom | null> {
    const room = this.matchRooms.get(roomId);
    if (!room) return null;

    // Check if user has admin permissions
    const participant = room.participants.get(userId);
    if (!participant || !participant.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to pause room');
    }

    room.isActive = false;
    room.lastActivity = new Date();
    
    logger.info(`Paused room ${roomId} by user ${userId}`);
    return room;
  }

  // End room
  public async endRoom(roomId: string, userId: string): Promise<MatchRoom | null> {
    const room = this.matchRooms.get(roomId);
    if (!room) return null;

    // Check if user has admin permissions
    const participant = room.participants.get(userId);
    if (!participant || !participant.permissions.includes('ADMIN')) {
      throw new Error('Insufficient permissions to end room');
    }

    room.isActive = false;
    room.lastActivity = new Date();
    
    logger.info(`Ended room ${roomId} by user ${userId}`);
    return room;
  }

  // Get room analytics
  public async getRoomAnalytics(roomId: string): Promise<RoomAnalytics | null> {
    const room = this.matchRooms.get(roomId);
    if (!room) return null;

    return {
      ...room.analytics,
      totalParticipants: room.participants.size,
      activeParticipants: Array.from(room.participants.values()).filter(p => this.isParticipantActive(p)).length,
      uptime: this.calculateRoomUptime(roomId),
    };
  }

  // Get all rooms
  public async getAllRooms(): Promise<MatchRoom[]> {
    return Array.from(this.matchRooms.values());
  }

  // Private helper methods
  private isParticipantActive(participant: RoomParticipant): boolean {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    return (now.getTime() - participant.lastActivity.getTime()) < inactiveThreshold;
  }

  private calculateRoomUptime(matchId: string): number {
    const room = this.matchRooms.get(matchId);
    if (!room) return 0;
    
    const now = new Date();
    return Math.floor((now.getTime() - room.createdAt.getTime()) / 1000);
  }

  private getDefaultRoomSettings(): RoomSettings {
    return {
      allowChat: true,
      allowSpectators: true,
      maxSpectators: 100,
      requireApproval: false,
      autoKickInactive: true,
      inactivityTimeout: 10,
      enableTypingIndicators: true,
      enableReadReceipts: true,
    };
  }

  private getDefaultMetadata(): RoomMetadata {
    return {
      weather: 'Unknown',
      pitchCondition: 'Unknown',
      expectedDuration: 90,
    };
  }

  private getDefaultAnalytics(): RoomAnalytics {
    return {
      totalParticipants: 0,
      activeParticipants: 0,
      messagesSent: 0,
      eventsRecorded: 0,
      uptime: 0,
      lastActivity: new Date(),
    };
  }

  private updateRoomAnalytics(roomId: string, metric: keyof RoomAnalytics): void {
    const room = this.matchRooms.get(roomId);
    if (!room) return;

    switch (metric) {
      case 'totalParticipants':
        room.analytics.totalParticipants = room.participants.size;
        break;
      case 'activeParticipants':
        room.analytics.activeParticipants = Array.from(room.participants.values()).filter(p => this.isParticipantActive(p)).length;
        break;
      case 'messagesSent':
        room.analytics.messagesSent++;
        break;
      case 'eventsRecorded':
        room.analytics.eventsRecorded++;
        break;
    }
    
    room.analytics.lastActivity = new Date();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.performCleanup();
    }, 60000); // Clean up every minute
  }

  private performCleanup(): void {
    for (const [matchId, room] of this.matchRooms.entries()) {
      if (this.shouldCleanupRoom(room)) {
        this.cleanupMatchRoom(matchId);
      }
    }
  }

  private shouldCleanupRoom(room: MatchRoom): boolean {
    const now = new Date();
    const cleanupThreshold = 30 * 60 * 1000; // 30 minutes
    return !room.isActive && (now.getTime() - room.lastActivity.getTime()) > cleanupThreshold;
  }

  private cleanupMatchRoom(matchId: string): void {
    this.matchRooms.delete(matchId);
    logger.info(`Cleaned up inactive match room: ${matchId}`);
  }

  // Cleanup method for graceful shutdown
  public cleanup(): void {
    this.matchRooms.clear();
    this.roomAnalytics.clear();
    logger.info('MatchRoomManager cleaned up');
  }
}

export default new MatchRoomManager();
