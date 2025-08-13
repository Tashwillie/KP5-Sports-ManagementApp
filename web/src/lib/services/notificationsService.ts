import apiClient from '@/lib/apiClient';

export interface UiNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
}

class NotificationsService {
  async getNotifications(): Promise<UiNotification[]> {
    const response: any = await apiClient.getNotifications();
    const data = Array.isArray(response.data) ? response.data : response.data?.notifications || response.data || [];
    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: (n.type || 'INFO').toString(),
      isRead: !!n.isRead,
      createdAt: n.createdAt,
      senderName: [n.sender?.firstName, n.sender?.lastName].filter(Boolean).join(' ') || n.sender?.email,
    }));
  }
}

export default new NotificationsService();

