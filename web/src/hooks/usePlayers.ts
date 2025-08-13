import { useEffect, useState } from 'react';
import usersService, { UiUser } from '@/lib/services/usersService';
import { useAuth } from '@/contexts/AuthContext';

export interface UiPlayer extends UiUser {
  teamName?: string;
}

export const usePlayers = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<UiPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getUsers({ role: 'PLAYER' });
      setPlayers(data as UiPlayer[]);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPlayers(); else { setPlayers([]); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { players, loading, error, refetch: fetchPlayers };
};

