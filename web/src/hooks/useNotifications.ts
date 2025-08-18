import { useEffect, useState } from 'react';
import notificationsService, { UiNotification } from '@/lib/services/notificationsService';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export interface UseNotificationsReturn {
  notifications: UiNotification[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useEnhancedAuthContext();
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { notifications, loading, error, refetch: fetchNotifications };
};

