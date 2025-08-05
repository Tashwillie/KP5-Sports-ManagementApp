export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId?: string; // For direct messages
  recipientType: 'user' | 'team' | 'club' | 'all';
  recipientIds?: string[]; // For group messages
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  readBy: string[]; // User IDs who have read the message
  deliveredTo: string[]; // User IDs who have received the message
  replyTo?: string; // Message ID this is replying to
  threadId?: string; // For message threads
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'location'
  | 'system'
  | 'announcement';

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'location';
  size: number;
  thumbnailUrl?: string;
  duration?: number; // For audio/video
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedAt: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: ChatRoomType;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  isPrivate: boolean;
  admins: string[]; // User IDs who can manage the chat
  settings: ChatRoomSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type ChatRoomType = 
  | 'direct'
  | 'group'
  | 'team'
  | 'club'
  | 'announcement'
  | 'support';

export interface ChatParticipant {
  userId: string;
  role: 'admin' | 'moderator' | 'member' | 'readonly';
  joinedAt: Date;
  lastSeen?: Date;
  isMuted: boolean;
  isBlocked: boolean;
  nickname?: string;
}

export interface ChatRoomSettings {
  allowFileSharing: boolean;
  allowVoiceMessages: boolean;
  allowLocationSharing: boolean;
  requireApproval: boolean;
  maxParticipants: number;
  autoArchive: boolean;
  archiveAfterDays: number;
  enableReactions: boolean;
  enableThreading: boolean;
  enablePolls: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  senderId: string;
  senderName: string;
  recipientType: 'all' | 'club' | 'team' | 'division' | 'specific';
  recipientIds: string[];
  attachments: AnnouncementAttachment[];
  readBy: string[]; // User IDs who have read
  acknowledgedBy: string[]; // User IDs who have acknowledged
  isPinned: boolean;
  isUrgent: boolean;
  expiresAt?: Date;
  requiresAcknowledgment: boolean;
  acknowledgmentDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type AnnouncementType = 
  | 'general'
  | 'urgent'
  | 'event'
  | 'schedule'
  | 'weather'
  | 'safety'
  | 'policy'
  | 'achievement';

export type AnnouncementPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'link';
  size?: number;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  recipientType: 'user' | 'team' | 'club' | 'all';
  recipientIds?: string[];
  isRead: boolean;
  isDelivered: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  priority: NotificationPriority;
  category: NotificationCategory;
  actionUrl?: string;
  actionData?: Record<string, any>;
  createdAt: Date;
}

export type NotificationType = 
  | 'message'
  | 'announcement'
  | 'event'
  | 'match'
  | 'tournament'
  | 'registration'
  | 'payment'
  | 'reminder'
  | 'achievement'
  | 'system';

export type NotificationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export type NotificationCategory = 
  | 'communication'
  | 'events'
  | 'sports'
  | 'financial'
  | 'system'
  | 'marketing';

export interface NotificationData {
  messageId?: string;
  announcementId?: string;
  eventId?: string;
  matchId?: string;
  tournamentId?: string;
  userId?: string;
  teamId?: string;
  clubId?: string;
  customData?: Record<string, any>;
}

export interface PushNotification {
  id: string;
  userId: string;
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
  title: string;
  body: string;
  data: NotificationData;
  badge?: number;
  sound?: string;
  image?: string;
  actionUrl?: string;
  isSent: boolean;
  sentAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  isRead: boolean;
  readAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  inAppNotifications: InAppNotificationSettings;
  smsNotifications: SmsNotificationSettings;
  quietHours: QuietHoursSettings;
  updatedAt: Date;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  messageNotifications: boolean;
  announcementNotifications: boolean;
  eventNotifications: boolean;
  matchNotifications: boolean;
  tournamentNotifications: boolean;
  registrationNotifications: boolean;
  paymentNotifications: boolean;
  reminderNotifications: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  digestEnabled: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  messageNotifications: boolean;
  announcementNotifications: boolean;
  eventNotifications: boolean;
  matchNotifications: boolean;
  tournamentNotifications: boolean;
  registrationNotifications: boolean;
  paymentNotifications: boolean;
  reminderNotifications: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  messageNotifications: boolean;
  announcementNotifications: boolean;
  eventNotifications: boolean;
  matchNotifications: boolean;
  tournamentNotifications: boolean;
  registrationNotifications: boolean;
  paymentNotifications: boolean;
  reminderNotifications: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  showBanner: boolean;
  showBadge: boolean;
  autoDismiss: boolean;
  dismissDelay: number; // seconds
}

export interface SmsNotificationSettings {
  enabled: boolean;
  urgentAnnouncements: boolean;
  criticalAlerts: boolean;
  emergencyNotifications: boolean;
  phoneNumber?: string;
  verified: boolean;
}

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  allowUrgent: boolean;
  allowEmergency: boolean;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reaction: string; // emoji or text
  createdAt: Date;
}

export interface MessageThread {
  id: string;
  parentMessageId: string;
  participants: string[]; // User IDs
  messages: string[]; // Message IDs
  lastMessageAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface ChatInvitation {
  id: string;
  chatRoomId: string;
  inviterId: string;
  inviteeId: string;
  message?: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  respondedAt?: Date;
  createdAt: Date;
}

export interface MessageSearchResult {
  messageId: string;
  chatRoomId: string;
  content: string;
  senderName: string;
  timestamp: Date;
  relevance: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  variables: string[]; // Template variables like {{userName}}, {{eventName}}
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  userId: string;
  deliveryMethod: 'email' | 'push' | 'sms' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
}

export interface UserPresence {
  id: string;
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'do_not_disturb';
  lastSeen: Date;
  isTyping: boolean;
  typingIn?: string; // Chat room ID where user is typing
  customStatus?: string;
  expiresAt: Date;
}

export interface ChatAnalytics {
  id: string;
  chatRoomId: string;
  date: Date;
  totalMessages: number;
  activeParticipants: number;
  messageTypes: Record<MessageType, number>;
  averageResponseTime: number; // minutes
  peakActivityHour: number;
  totalAttachments: number;
  attachmentTypes: Record<string, number>;
} 