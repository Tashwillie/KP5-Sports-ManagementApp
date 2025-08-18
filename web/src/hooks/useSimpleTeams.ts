import { useState, useEffect } from 'react';
import enhancedApiClient from '@/lib/enhancedApiClient';

interface SimpleTeam {
  id: string;
  name: string;
  description?: string;
  clubId?: string;
  createdAt: string;
  updatedAt: string;
}

export function useSimpleTeams() {
  const [teams, setTeams] = useState<SimpleTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await enhancedApiClient.get('/teams');
      
      if (response.success && response.data) {
        // Handle both array and object responses
        const teamsData = Array.isArray(response.data) ? response.data : response.data.teams || [];
        setTeams(teamsData);
      } else {
        setError(response.message || 'Failed to load teams');
      }
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    data: teams,
    isLoading: loading,
    error: error ? new Error(error) : null,
    refetch: fetchTeams
  };
}
