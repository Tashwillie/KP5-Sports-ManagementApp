import { useEffect, useState } from 'react';
import messagesService, { UiMessage } from '@/lib/services/messagesService';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export interface UseMessagesReturn {
  messages: UiMessage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMessages = (): UseMessagesReturn => {
  const { user } = useEnhancedAuthContext();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await messagesService.getMessages();
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    } else {
      setMessages([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { messages, loading, error, refetch: fetchMessages };
};

