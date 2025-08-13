import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import matchesService, { MatchWithStats } from '@/lib/services/matchesService';

export interface UseMatchesReturn {
  matches: MatchWithStats[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMatches = (): UseMatchesReturn => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    console.log('🔄 Fetching matches...');
    console.log('👤 User state:', user ? 'Present' : 'Not present');

    if (!user) {
      console.log('❌ No user, setting error');
      setError('User not authenticated');
      return;
    }

    try {
      console.log('✅ User authenticated, starting API calls');
      setLoading(true);
      setError(null);
      const matchesData = await matchesService.getMatches();
      console.log('📊 Matches data received:', matchesData);
      setMatches(matchesData);
    } catch (err: any) {
      console.error('❌ Matches fetch error:', err);
      setError(err.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useMatches useEffect triggered');
    console.log('👤 User changed:', user ? 'Present' : 'Not present');

    if (user) {
      console.log('✅ User present, fetching matches data');
      fetchMatches();
    } else {
      console.log('❌ No user, clearing data');
      setMatches([]);
      setError(null);
    }
  }, [user]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches
  };
};
