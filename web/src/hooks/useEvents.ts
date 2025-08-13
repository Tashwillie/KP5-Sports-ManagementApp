import { useEffect, useState } from 'react';
import eventsService, { EventWithRelations } from '@/lib/services/eventsService';
import { useAuth } from '@/contexts/AuthContext';

export interface UseEventsReturn {
  events: EventWithRelations[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setEvents([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { events, loading, error, refetch: fetchEvents };
};

