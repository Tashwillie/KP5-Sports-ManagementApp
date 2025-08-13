import { useEffect, useState } from 'react';
import usersService, { UiUser } from '@/lib/services/usersService';
import { useAuth } from '@/contexts/AuthContext';

export const useUsers = (params?: { role?: string; isActive?: boolean; search?: string }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getUsers(params);
      setUsers(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUsers(); else { setUsers([]); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params?.role, params?.isActive, params?.search]);

  return { users, loading, error, refetch: fetchUsers };
};

