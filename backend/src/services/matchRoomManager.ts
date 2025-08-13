import { logger } from '../utils/logger';
import prisma from '../config/database';

export interface RoomParticipant {
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
}

export interface RoomSettings {
  allowChat: boolean;
  allowSpectators: boolean;
  maxSpectators: number;
  requireApproval: boolean;
  autoKickInactive: boolean;
  inactivityTimeout: number; // minutes
  enableTypingIndicators: boolean;
  enableReadReceipts: boolean;
}

export interface RoomMetadata {
  matchTitle: string;
  homeTeamName: string;
  awayTeamName: string;
  tournamentName?: string;
  location?: string;
  startTime?: Date;
  expectedDuration: number; // minutes
  weather?: string;
  pitchCondition?: string;
}

export interface RoomAnalytics {
  totalParticipants: number;
  activeParticipants: number;
  messagesSent: number;
  eventsRecorded: number;
  averageResponseTime: number;
  peakConcurrency: number;
  roomUptime: number; // minutes
}

export interface MatchRoom {
  matchId: string;
  roomName: string;
  participants: Map<string, RoomParticipant>;
  spectators: Map<string, RoomParticipant>;
  referees: Map<string, RoomParticipant>;
  coaches: Map<string, RoomParticipant>;
  admins: Map<string, RoomParticipant>;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  settings: RoomSettings;
  metadata: RoomMetadata;
}

export class MatchRoomManager {
  private matchRooms: Map<string, MatchRoom> = new Map();
  private roomAnalytics: Map<string, RoomAnalytics> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.startCleanupInterval();
    logger.info('MatchRoomManager initialized');
  }

  // Create a new match room
  async createMatchRoom(matchId: string): Promise<MatchRoom> {
    try {
      // Fetch match information from database
      const match = await prisma.match.findFirst({
        where: { id: matchId },
        include: {
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          tournamentMatches: { include: { tournament: { select: { name: true } } } }
        }
      });
      
      if (!match) {
        throw new Error(`Match ${matchId} not found`);
      }
      
      const room: MatchRoom = {
        matchId,
        roomName: `match:${matchId}`,
        participants: new Map(),
        spectators: new Map(),
        referees: new Map(),
        coaches: new Map(),
        admins: new Map(),
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date(),
        settings: this.getDefaultRoomSettings(),
        metadata: {
          matchTitle: match.title || 'Match',
          homeTeamName: match.homeTeam?.name || 'Home Team',
          awayTeamName: match.awayTeam?.name || 'Away Team',
          tournamentName: match.tournamentMatches?.[0]?.tournament?.name,
          location: match.location,
          startTime: match.startTime,
          expectedDuration: 90,
          weather: 'Unknown',
          pitchCondition: 'Unknown'
        }
      };
      
      // Initialize room analytics
      this.roomAnalytics.set(room.roomName, this.getDefaultAnalytics());
      
      this.matchRooms.set(matchId, room);
      logger.info(`Created match room: ${matchId}`);
      
      return room;
      
    } catch (error) {
      logger.error('Error creating match room:', error);
      throw error;
    }
  }

  // Get or create match room
  async getOrCreateMatchRoom(matchId: string): Promise<MatchRoom> {
    let matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) {
      matchRoom = await this.createMatchRoom(matchId);
    }
    return matchRoom;
  }

  // Add participant to room
  addParticipant(matchId: string, participant: RoomParticipant, role: string = 'PARTICIPANT'): boolean {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) {
      return false;
    }

    // Check spectator limits
    if (role === 'SPECTATOR' && !this.canAddSpectator(matchRoom)) {
      return false;
    }

    // Add to appropriate category
    switch (role.toUpperCase()) {
      case 'REFEREE':
        matchRoom.referees.set(participant.userId, participant);
        break;
      case 'COACH':
        matchRoom.coaches.set(participant.userId, participant);
        break;
      case 'ADMIN':
        matchRoom.admins.set(participant.userId, participant);
        break;
      case 'SPECTATOR':
        matchRoom.spectators.set(participant.userId, participant);
        break;
      default:
        matchRoom.participants.set(participant.userId, participant);
    }

    // Update analytics
    this.updateRoomAnalytics(matchId, 'totalParticipants');
    matchRoom.lastActivity = new Date();

    logger.info(`Added participant ${participant.userId} to room ${matchId} as ${role}`);
    return true;
  }

  // Remove participant from room
  removeParticipant(matchId: string, userId: string): boolean {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) {
      return false;
    }

    // Remove from all categories
    const removed = matchRoom.referees.delete(userId) ||
                   matchRoom.coaches.delete(userId) ||
                   matchRoom.admins.delete(userId) ||
                   matchRoom.spectators.delete(userId) ||
                   matchRoom.participants.delete(userId);

    if (removed) {
      // Update analytics
      this.updateRoomAnalytics(matchId, 'totalParticipants');
      matchRoom.lastActivity = new Date();
      
      // Clean up if room is empty
      if (this.shouldCleanupRoom(matchRoom)) {
        this.cleanupMatchRoom(matchId);
      }
    }

    return removed;
  }

  // Find participant in room
  findParticipant(matchId: string, userId: string): RoomParticipant | null {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return null;

    return matchRoom.referees.get(userId) ||
           matchRoom.coaches.get(userId) ||
           matchRoom.admins.get(userId) ||
           matchRoom.spectators.get(userId) ||
           matchRoom.participants.get(userId) ||
           null;
  }

  // Update participant activity
  updateParticipantActivity(matchId: string, userId: string): void {
    const participant = this.findParticipant(matchId, userId);
    if (participant) {
      participant.lastActivity = new Date();
      participant.isOnline = true;
    }
  }

  // Update participant typing status
  updateParticipantTyping(matchId: string, userId: string, isTyping: boolean): void {
    const participant = this.findParticipant(matchId, userId);
    if (participant) {
      participant.isTyping = isTyping;
      participant.lastActivity = new Date();
    }
  }

  // Check if user has admin permissions
  hasAdminPermissions(userId: string, matchId: string): boolean {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return false;

    return matchRoom.admins.has(userId) || 
           matchRoom.referees.has(userId);
  }

  // Check if user can send messages
  canUserSendMessage(userId: string, matchId: string): boolean {
    const participant = this.findParticipant(matchId, userId);
    if (!participant) return false;

    return !participant.permissions.includes('MUTED');
  }

  // Check if can add spectator
  private canAddSpectator(matchRoom: MatchRoom): boolean {
    if (!matchRoom.settings.allowSpectators) return false;
    
    const currentSpectators = matchRoom.spectators.size;
    return currentSpectators < matchRoom.settings.maxSpectators;
  }

  // Update room settings
  updateRoomSettings(matchId: string, settings: Partial<RoomSettings>): boolean {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return false;

    Object.assign(matchRoom.settings, settings);
    matchRoom.lastActivity = new Date();
    
    logger.info(`Updated room settings for match ${matchId}`);
    return true;
  }

  // Get room settings
  getRoomSettings(matchId: string): RoomSettings | null {
    const matchRoom = this.matchRooms.get(matchId);
    return matchRoom?.settings || null;
  }

  // Get room metadata
  getRoomMetadata(matchId: string): RoomMetadata | null {
    const matchRoom = this.matchRooms.get(matchId);
    return matchRoom?.metadata || null;
  }

  // Get room analytics
  getRoomAnalytics(matchId: string): RoomAnalytics | null {
    const roomName = `match:${matchId}`;
    return this.roomAnalytics.get(roomName) || null;
  }

  // Update room analytics
  updateRoomAnalytics(matchId: string, metric: keyof RoomAnalytics): void {
    const roomName = `match:${matchId}`;
    const analytics = this.roomAnalytics.get(roomName);
    
    if (analytics) {
      switch (metric) {
        case 'totalParticipants':
          analytics.totalParticipants = this.getParticipantCount(matchId);
          break;
        case 'activeParticipants':
          analytics.activeParticipants = this.getActiveParticipantCount(matchId);
          break;
        case 'messagesSent':
          analytics.messagesSent++;
          break;
        case 'eventsRecorded':
          analytics.eventsRecorded++;
          break;
      }
      
      analytics.roomUptime = this.calculateRoomUptime(matchId);
      this.roomAnalytics.set(roomName, analytics);
    }
  }

  // Get participant count
  getParticipantCount(matchId: string): number {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return 0;

    return matchRoom.participants.size +
           matchRoom.spectators.size +
           matchRoom.referees.size +
           matchRoom.coaches.size +
           matchRoom.admins.size;
  }

  // Get active participant count
  getActiveParticipantCount(matchId: string): number {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return 0;

    let activeCount = 0;
    const allParticipants = [
      ...matchRoom.participants.values(),
      ...matchRoom.spectators.values(),
      ...matchRoom.referees.values(),
      ...matchRoom.coaches.values(),
      ...matchRoom.admins.values()
    ];

    for (const participant of allParticipants) {
      if (participant.isOnline && this.isParticipantActive(participant)) {
        activeCount++;
      }
    }

    return activeCount;
  }

  // Check if participant is active
  private isParticipantActive(participant: RoomParticipant): boolean {
    const now = new Date();
    const lastActivity = new Date(participant.lastActivity);
    const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    
    return minutesSinceLastActivity < 5; // Consider active if last activity was within 5 minutes
  }

  // Calculate room uptime
  private calculateRoomUptime(matchId: string): number {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return 0;

    const now = new Date();
    const createdAt = new Date(matchRoom.createdAt);
    const uptimeMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    return Math.floor(uptimeMinutes);
  }

  // Get all participants in a room
  getAllParticipants(matchId: string): any[] {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return [];

    const allParticipants = [
      ...Array.from(matchRoom.participants.values()).map(p => ({ ...p, category: 'PARTICIPANT' })),
      ...Array.from(matchRoom.spectators.values()).map(p => ({ ...p, category: 'SPECTATOR' })),
      ...Array.from(matchRoom.referees.values()).map(p => ({ ...p, category: 'REFEREE' })),
      ...Array.from(matchRoom.coaches.values()).map(p => ({ ...p, category: 'COACH' })),
      ...Array.from(matchRoom.admins.values()).map(p => ({ ...p, category: 'ADMIN' }))
    ];

    return allParticipants.map(p => ({
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
    }));
  }

  // Get room info
  getRoomInfo(matchId: string): any {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) {
      return {
        matchId,
        exists: false,
        userCount: 0,
        users: []
      };
    }

    const allParticipants = this.getAllParticipants(matchId);

    return {
      matchId,
      exists: true,
      roomName: matchRoom.roomName,
      userCount: allParticipants.length,
      users: allParticipants.map(p => ({
        userId: p.userId,
        role: p.userRole,
        email: p.userEmail,
        category: p.category,
        teamId: p.teamId,
        isOnline: p.isOnline,
        isTyping: p.isTyping
      })),
      settings: matchRoom.settings,
      metadata: matchRoom.metadata,
      analytics: this.getRoomAnalytics(matchId)
    };
  }

  // Check if room should be cleaned up
  private shouldCleanupRoom(matchRoom: MatchRoom): boolean {
    const now = new Date();
    const lastActivity = new Date(matchRoom.lastActivity);
    const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    
    // Clean up if no activity for 1 hour and no participants
    return minutesSinceLastActivity > 60 && 
           matchRoom.participants.size === 0 &&
           matchRoom.spectators.size === 0 &&
           matchRoom.referees.size === 0 &&
           matchRoom.coaches.size === 0 &&
           matchRoom.admins.size === 0;
  }

  // Cleanup match room
  private cleanupMatchRoom(matchId: string): void {
    const matchRoom = this.matchRooms.get(matchId);
    if (!matchRoom) return;

    // Remove room analytics
    this.roomAnalytics.delete(matchRoom.roomName);

    // Remove match room
    this.matchRooms.delete(matchId);

    logger.info(`Cleaned up match room: ${matchId}`);
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Perform cleanup
  private performCleanup(): void {
    for (const [matchId, matchRoom] of this.matchRooms.entries()) {
      // Check for inactive participants
      if (matchRoom.settings.autoKickInactive) {
        this.cleanupInactiveParticipants(matchRoom);
      }
      
      // Check if room should be cleaned up
      if (this.shouldCleanupRoom(matchRoom)) {
        this.cleanupMatchRoom(matchId);
      }
    }
    
    logger.info('Match room cleanup completed');
  }

  // Cleanup inactive participants
  private cleanupInactiveParticipants(matchRoom: MatchRoom): void {
    const now = new Date();
    const timeoutMinutes = matchRoom.settings.inactivityTimeout;
    
    const allParticipants = [
      ...Array.from(matchRoom.participants.entries()),
      ...Array.from(matchRoom.spectators.entries()),
      ...Array.from(matchRoom.coaches.entries())
    ];

    for (const [userId, participant] of allParticipants) {
      const lastActivity = new Date(participant.lastActivity);
      const minutesSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (minutesSinceLastActivity > timeoutMinutes) {
        // Mark as offline
        participant.isOnline = false;
        participant.lastActivity = new Date();
      }
    }
  }

  // Get default room settings
  private getDefaultRoomSettings(): RoomSettings {
    return {
      allowChat: true,
      allowSpectators: true,
      maxSpectators: 100,
      requireApproval: false,
      autoKickInactive: true,
      inactivityTimeout: 30,
      enableTypingIndicators: true,
      enableReadReceipts: false
    };
  }

  // Get default analytics
  private getDefaultAnalytics(): RoomAnalytics {
    return {
      totalParticipants: 0,
      activeParticipants: 0,
      messagesSent: 0,
      eventsRecorded: 0,
      averageResponseTime: 0,
      peakConcurrency: 0,
      roomUptime: 0
    };
  }

  // Get all match rooms
  getAllMatchRooms(): Map<string, MatchRoom> {
    return new Map(this.matchRooms);
  }

  // Get match room
  getMatchRoom(matchId: string): MatchRoom | undefined {
    return this.matchRooms.get(matchId);
  }

  // Check if room exists
  roomExists(matchId: string): boolean {
    return this.matchRooms.has(matchId);
  }

  // Get room count
  getRoomCount(): number {
    return this.matchRooms.size;
  }

  // Cleanup on shutdown
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.matchRooms.clear();
    this.roomAnalytics.clear();
    logger.info('MatchRoomManager cleaned up');
  }
}

export default new MatchRoomManager();
