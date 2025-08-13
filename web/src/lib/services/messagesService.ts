import apiClient from '@/lib/apiClient';

export interface RawMessage {
  id: string;
  content: string;
  type: string;
  sender: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  recipients: Array<{
    recipient: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    }
  }>;
  team?: { id: string; name: string; logo?: string | null } | null;
  club?: { id: string; name: string; logo?: string | null } | null;
  replyTo?: any | null;
  createdAt: string;
  updatedAt: string;
}

export type UiMessageType = 'direct' | 'team' | 'club' | 'announcement' | 'system';

export interface UiMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientIds: string[];
  type: UiMessageType;
  content: string;
  attachments: any[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

class MessagesService {
  async getMessages(): Promise<UiMessage[]> {
    const response: any = await apiClient.getMessages();
    const data: RawMessage[] = Array.isArray(response.data) ? response.data : response.data?.messages || [];

    return data.map((m) => {
      const senderName = [m.sender?.firstName, m.sender?.lastName].filter(Boolean).join(' ') || m.sender?.email || 'User';
      let uiType: UiMessageType = 'direct';
      if (m.team) uiType = 'team';
      else if (m.club) uiType = 'club';
      else if (m.type === 'SYSTEM') uiType = 'system';
      else uiType = 'direct';

      return {
        id: m.id,
        senderId: m.sender?.id,
        senderName,
        senderAvatar: m.sender?.avatar || '',
        recipientIds: (m.recipients || []).map(r => r.recipient.id),
        type: uiType,
        content: m.content,
        attachments: [],
        readBy: [],
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      };
    });
  }
}

export default new MessagesService();

