import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTeam { id: string; name: string; clubName?: string }
export interface SupportTournament { id: string; name: string }
export interface SupportReferee { id: string; displayName: string }

export const useMatchSupportData = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<SupportTeam[]>([]);
  const [tournaments, setTournaments] = useState<SupportTournament[]>([]);
  const [referees, setReferees] = useState<SupportReferee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!user) { setError('User not authenticated'); return; }
    try {
      setLoading(true);
      setError(null);
      const [teamsResp, tournamentsResp, usersResp] = await Promise.all([
        apiClient.getTeams(),
        apiClient.getTournaments(),
        apiClient.getUsers(),
      ]);
      const tms = (teamsResp.data?.teams || []).map((t: any) => ({ id: t.id, name: t.name, clubName: t.club?.name }));
      const tours = (tournamentsResp.data?.tournaments || []).map((tr: any) => ({ id: tr.id, name: tr.name }));
      const refs = (usersResp.data?.users || [])
        .filter((u: any) => (u.role || '').toUpperCase() === 'REFEREE')
        .map((u: any) => ({ id: u.id, displayName: u.displayName || u.email }));
      setTeams(tms);
      setTournaments(tours);
      setReferees(refs);
    } catch (e: any) {
      setError(e.message || 'Failed to load match support data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchAll(); else { setTeams([]); setTournaments([]); setReferees([]); setError(null); } }, [user]);

  return { teams, tournaments, referees, loading, error, refetch: fetchAll };
};

