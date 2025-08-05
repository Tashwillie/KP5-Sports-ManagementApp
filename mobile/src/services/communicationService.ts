import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@shared/utils/firebase';
import {
  Message,
  MessageType,
  MessageAttachment,
  ChatRoom,
  ChatRoomType,
  ChatParticipant,
  ChatRoomSettings,
  Announcement,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementAttachment,
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  NotificationData,
  PushNotification,
  NotificationSettings,
  EmailNotificationSettings,
  PushNotificationSettings,
  InAppNotificationSettings,
  SmsNotificationSettings,
  QuietHoursSettings,
  MessageReaction,
  MessageThread,
  ChatInvitation,
  MessageSearchResult,
  NotificationTemplate,
  NotificationDeliveryLog,
  UserPresence,
  ChatAnalytics,
} from '@shared/types/communication';

export class CommunicationService {
  // Message Management
  async sendMessage(
    chatRoomId: string,
    content: string,
    type: MessageType = 'text',
    attachments: MessageAttachment[] = [],
    replyTo?: string,
    threadId?: string
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Unknown User',
      senderAvatar: user.photoURL,
      content,
      type,
      attachments,
      readBy: [user.uid],
      deliveredTo: [user.uid],
      replyTo,
      threadId,
      isEdited: false,
      isDeleted: false,
    };

    const messageRef = await addDoc(
      collection(db, 'chatRooms', chatRoomId, 'messages'),
      {
        ...messageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );

    // Update chat room last message
    await updateDoc(doc(db, 'chatRooms', chatRoomId), {
      lastMessage: {
        id: messageRef.id,
        content,
        senderName: messageData.senderName,
        createdAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    // Update unread count for other participants
    const chatRoom = await this.getChatRoom(chatRoomId);
    if (chatRoom) {
      const otherParticipants = chatRoom.participants
        .filter(p => p.userId !== user.uid)
        .map(p => p.userId);

      const batch = writeBatch(db);
      otherParticipants.forEach(participantId => {
        const userDoc = doc(db, 'users', participantId);
        batch.update(userDoc, {
          [`unreadCounts.${chatRoomId}`]: increment(1),
        });
      });
      await batch.commit();
    }

    return messageRef.id;
  }

  async getMessages(
    chatRoomId: string,
    limitCount: number = 50,
    lastMessageId?: string
  ): Promise<Message[]> {
    let q = query(
      collection(db, 'chatRooms', chatRoomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastMessageId) {
      const lastMessage = await getDoc(
        doc(db, 'chatRooms', chatRoomId, 'messages', lastMessageId)
      );
      if (lastMessage.exists()) {
        q = query(
          collection(db, 'chatRooms', chatRoomId, 'messages'),
          orderBy('createdAt', 'desc'),
          where('createdAt', '<', lastMessage.data().createdAt),
          limit(limitCount)
        );
      }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Message[];
  }

  async markMessageAsRead(
    chatRoomId: string,
    messageId: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await updateDoc(
      doc(db, 'chatRooms', chatRoomId, 'messages', messageId),
      {
        readBy: arrayUnion(user.uid),
      }
    );
  }

  async editMessage(
    chatRoomId: string,
    messageId: string,
    newContent: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const messageRef = doc(db, 'chatRooms', chatRoomId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }

    const messageData = messageDoc.data();
    if (messageData.senderId !== user.uid) {
      throw new Error('You can only edit your own messages');
    }

    await updateDoc(messageRef, {
      content: newContent,
      isEdited: true,
      editedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async deleteMessage(chatRoomId: string, messageId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const messageRef = doc(db, 'chatRooms', chatRoomId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }

    const messageData = messageDoc.data();
    if (messageData.senderId !== user.uid) {
      throw new Error('You can only delete your own messages');
    }

    await updateDoc(messageRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Chat Room Management
  async createChatRoom(
    name: string,
    type: ChatRoomType,
    participants: string[],
    description?: string,
    settings?: Partial<ChatRoomSettings>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const defaultSettings: ChatRoomSettings = {
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowLocationSharing: true,
      requireApproval: false,
      maxParticipants: 100,
      autoArchive: false,
      archiveAfterDays: 30,
      enableReactions: true,
      enableThreading: true,
      enablePolls: true,
    };

    const chatRoomData: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description,
      type,
      participants: participants.map(userId => ({
        userId,
        role: userId === user.uid ? 'admin' : 'member',
        joinedAt: new Date(),
        isMuted: false,
        isBlocked: false,
      })),
      unreadCount: 0,
      isActive: true,
      isPrivate: type === 'direct',
      admins: [user.uid],
      settings: { ...defaultSettings, ...settings },
      createdBy: user.uid,
    };

    const chatRoomRef = await addDoc(collection(db, 'chatRooms'), {
      ...chatRoomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return chatRoomRef.id;
  }

  async getChatRoom(chatRoomId: string): Promise<ChatRoom | null> {
    const doc = await getDoc(doc(db, 'chatRooms', chatRoomId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as ChatRoom;
  }

  async getUserChatRooms(): Promise<ChatRoom[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ChatRoom[];
  }

  async addParticipantToChatRoom(
    chatRoomId: string,
    userId: string,
    role: 'admin' | 'moderator' | 'member' | 'readonly' = 'member'
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const chatRoom = await this.getChatRoom(chatRoomId);
    if (!chatRoom) throw new Error('Chat room not found');

    if (!chatRoom.admins.includes(user.uid)) {
      throw new Error('Only admins can add participants');
    }

    const participant: ChatParticipant = {
      userId,
      role,
      joinedAt: new Date(),
      isMuted: false,
      isBlocked: false,
    };

    await updateDoc(doc(db, 'chatRooms', chatRoomId), {
      participants: arrayUnion(participant),
      updatedAt: serverTimestamp(),
    });
  }

  async removeParticipantFromChatRoom(
    chatRoomId: string,
    userId: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const chatRoom = await this.getChatRoom(chatRoomId);
    if (!chatRoom) throw new Error('Chat room not found');

    if (!chatRoom.admins.includes(user.uid)) {
      throw new Error('Only admins can remove participants');
    }

    const participant = chatRoom.participants.find(p => p.userId === userId);
    if (!participant) throw new Error('Participant not found');

    await updateDoc(doc(db, 'chatRooms', chatRoomId), {
      participants: arrayRemove(participant),
      updatedAt: serverTimestamp(),
    });
  }

  // Announcement Management
  async createAnnouncement(
    title: string,
    content: string,
    type: AnnouncementType,
    priority: AnnouncementPriority,
    recipientType: 'all' | 'club' | 'team' | 'division' | 'specific',
    recipientIds: string[],
    attachments: AnnouncementAttachment[] = [],
    options?: {
      isPinned?: boolean;
      isUrgent?: boolean;
      expiresAt?: Date;
      requiresAcknowledgment?: boolean;
      acknowledgmentDeadline?: Date;
    }
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content,
      type,
      priority,
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Unknown User',
      recipientType,
      recipientIds,
      attachments,
      readBy: [],
      acknowledgedBy: [],
      isPinned: options?.isPinned || false,
      isUrgent: options?.isUrgent || false,
      expiresAt: options?.expiresAt,
      requiresAcknowledgment: options?.requiresAcknowledgment || false,
      acknowledgmentDeadline: options?.acknowledgmentDeadline,
      createdBy: user.uid,
    };

    const announcementRef = await addDoc(collection(db, 'announcements'), {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Send notifications to recipients
    await this.sendAnnouncementNotifications(announcementRef.id, recipientIds);

    return announcementRef.id;
  }

  async getAnnouncements(
    recipientIds: string[],
    limitCount: number = 20
  ): Promise<Announcement[]> {
    const q = query(
      collection(db, 'announcements'),
      where('recipientIds', 'array-contains-any', recipientIds),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
      acknowledgmentDeadline: doc.data().acknowledgmentDeadline?.toDate(),
    })) as Announcement[];
  }

  async markAnnouncementAsRead(announcementId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'announcements', announcementId), {
      readBy: arrayUnion(user.uid),
    });
  }

  async acknowledgeAnnouncement(announcementId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'announcements', announcementId), {
      acknowledgedBy: arrayUnion(user.uid),
    });
  }

  // Notification Management
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data: NotificationData,
    priority: NotificationPriority = 'normal',
    category: NotificationCategory = 'communication',
    options?: {
      actionUrl?: string;
      actionData?: Record<string, any>;
      expiresAt?: Date;
    }
  ): Promise<string> {
    const notificationData: Omit<Notification, 'id' | 'createdAt'> = {
      userId,
      type,
      title,
      body,
      data,
      recipientType: 'user',
      isRead: false,
      isDelivered: false,
      expiresAt: options?.expiresAt,
      priority,
      category,
      actionUrl: options?.actionUrl,
      actionData: options?.actionData,
    };

    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp(),
    });

    return notificationRef.id;
  }

  async getUserNotifications(
    limitCount: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      deliveredAt: doc.data().deliveredAt?.toDate(),
      readAt: doc.data().readAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
    })) as Notification[];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      readAt: serverTimestamp(),
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const unreadNotifications = await this.getUserNotifications(1000, true);
    const batch = writeBatch(db);

    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  // Push Notification Management
  async sendPushNotification(
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android' | 'web',
    title: string,
    body: string,
    data: NotificationData,
    options?: {
      badge?: number;
      sound?: string;
      image?: string;
      actionUrl?: string;
    }
  ): Promise<string> {
    const pushNotificationData: Omit<PushNotification, 'id' | 'createdAt'> = {
      userId,
      deviceToken,
      platform,
      title,
      body,
      data,
      badge: options?.badge,
      sound: options?.sound,
      image: options?.image,
      actionUrl: options?.actionUrl,
      isSent: false,
      isDelivered: false,
      isRead: false,
      retryCount: 0,
      maxRetries: 3,
    };

    const pushNotificationRef = await addDoc(
      collection(db, 'pushNotifications'),
      {
        ...pushNotificationData,
        createdAt: serverTimestamp(),
      }
    );

    return pushNotificationRef.id;
  }

  // Notification Settings Management
  async getNotificationSettings(): Promise<NotificationSettings | null> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const doc = await getDoc(doc(db, 'notificationSettings', user.uid));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as NotificationSettings;
  }

  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'notificationSettings', user.uid), {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  }

  // Real-time Listeners
  subscribeToChatRoom(
    chatRoomId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'chatRooms', chatRoomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Message[];
      callback(messages);
    });
  }

  subscribeToUserNotifications(
    callback: (notifications: Notification[]) => void
  ): () => void {
    const user = this.getCurrentUser();
    if (!user) return () => {};

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        deliveredAt: doc.data().deliveredAt?.toDate(),
        readAt: doc.data().readAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Notification[];
      callback(notifications);
    });
  }

  subscribeToAnnouncements(
    recipientIds: string[],
    callback: (announcements: Announcement[]) => void
  ): () => void {
    const q = query(
      collection(db, 'announcements'),
      where('recipientIds', 'array-contains-any', recipientIds),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        acknowledgmentDeadline: doc.data().acknowledgmentDeadline?.toDate(),
      })) as Announcement[];
      callback(announcements);
    });
  }

  // File Upload
  async uploadMessageAttachment(
    file: File,
    chatRoomId: string
  ): Promise<MessageAttachment> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${chatRoomId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `chat-attachments/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const attachment: MessageAttachment = {
      id: snapshot.ref.name,
      name: file.name,
      url: downloadURL,
      type: this.getFileType(file.type),
      size: file.size,
      uploadedAt: new Date(),
    };

    return attachment;
  }

  async uploadAnnouncementAttachment(
    file: File
  ): Promise<AnnouncementAttachment> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `announcement-attachments/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const attachment: AnnouncementAttachment = {
      id: snapshot.ref.name,
      name: file.name,
      url: downloadURL,
      type: this.getFileType(file.type),
      size: file.size,
      uploadedAt: new Date(),
    };

    return attachment;
  }

  // Utility Methods
  private async getCurrentUser() {
    // This would be implemented based on your auth provider
    // For now, returning null - implement based on your auth setup
    return null;
  }

  private async sendAnnouncementNotifications(
    announcementId: string,
    recipientIds: string[]
  ): Promise<void> {
    // Implementation for sending notifications to announcement recipients
    // This would integrate with your notification system
  }

  private getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'location' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // Message Reactions
  async addMessageReaction(
    chatRoomId: string,
    messageId: string,
    reaction: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const reactionData: Omit<MessageReaction, 'id' | 'createdAt'> = {
      messageId,
      userId: user.uid,
      reaction,
    };

    await addDoc(
      collection(db, 'chatRooms', chatRoomId, 'messages', messageId, 'reactions'),
      {
        ...reactionData,
        createdAt: serverTimestamp(),
      }
    );
  }

  async removeMessageReaction(
    chatRoomId: string,
    messageId: string,
    reaction: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'chatRooms', chatRoomId, 'messages', messageId, 'reactions'),
      where('userId', '==', user.uid),
      where('reaction', '==', reaction)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  // User Presence
  async updateUserPresence(
    status: 'online' | 'offline' | 'away' | 'busy' | 'do_not_disturb',
    customStatus?: string
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const presenceData: Omit<UserPresence, 'id' | 'createdAt'> = {
      userId: user.uid,
      status,
      lastSeen: new Date(),
      isTyping: false,
      customStatus,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };

    await updateDoc(doc(db, 'userPresence', user.uid), {
      ...presenceData,
      updatedAt: serverTimestamp(),
    });
  }

  async setTypingStatus(
    chatRoomId: string,
    isTyping: boolean
  ): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'userPresence', user.uid), {
      isTyping,
      typingIn: isTyping ? chatRoomId : null,
      updatedAt: serverTimestamp(),
    });
  }

  // Search
  async searchMessages(
    chatRoomId: string,
    query: string,
    limitCount: number = 20
  ): Promise<MessageSearchResult[]> {
    // This would implement full-text search
    // For now, returning empty array - implement based on your search solution
    return [];
  }

  // Analytics
  async getChatAnalytics(
    chatRoomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ChatAnalytics[]> {
    const q = query(
      collection(db, 'chatAnalytics'),
      where('chatRoomId', '==', chatRoomId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
    })) as ChatAnalytics[];
  }
}

export const communicationService = new CommunicationService(); 