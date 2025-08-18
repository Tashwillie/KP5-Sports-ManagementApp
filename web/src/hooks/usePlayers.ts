import { useEffect, useState } from 'react';
import usersService, { UiUser } from '@/lib/services/usersService';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export interface UiPlayer extends UiUser {
  teamName?: string;
  status?: 'active' | 'inactive' | 'injured' | 'suspended';
  position?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
}

export const usePlayers = () => {
  const { user } = useEnhancedAuthContext();
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

