// Local API hook for web application
// This hook provides API access without Firebase dependencies

import { useState, useEffect } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import AuthService from '@/lib/services/authService';

interface ApiState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

export const useLocalApi = () => {
  const { user, loading: authLoading } = useEnhancedAuthContext();
  const [state, setState] = useState<ApiState>({
    loading: false,
    error: null,
    data: null,
  });

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      setState({ loading: false, error: null, data });
      return data;
    } catch (error: any) {
      setState({ loading: false, error: error.message, data: null });
      throw error;
    }
  };

  const get = (endpoint: string) => apiCall(endpoint, { method: 'GET' });
  const post = (endpoint: string, body: any) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) });
  const put = (endpoint: string, body: any) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  const del = (endpoint: string) => apiCall(endpoint, { method: 'DELETE' });

  return {
    user,
    loading: authLoading || state.loading,
    error: state.error,
    data: state.data,
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
};

// Local authentication hook
export const useLocalAuth = () => {
  const { user, loading, error } = useLocalApi();
  const authService = new AuthService();

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
};

// Local clubs hook
export const useLocalClubs = () => {
  const { get, post, put, delete: del, loading, error } = useLocalApi();
  const [clubs, setClubs] = useState<any[]>([]);

  const fetchClubs = async () => {
    try {
      const data = await get('/clubs');
      setClubs(data.data?.clubs || []);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    }
  };

  const createClub = async (clubData: any) => {
    try {
      const data = await post('/clubs', clubData);
      await fetchClubs();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateClub = async (id: string, clubData: any) => {
    try {
      const data = await put(`/clubs/${id}`, clubData);
      await fetchClubs();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteClub = async (id: string) => {
    try {
      await del(`/clubs/${id}`);
      await fetchClubs();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return {
    clubs,
    loading,
    error,
    fetchClubs,
    createClub,
    updateClub,
    deleteClub,
  };
};

// Local teams hook
export const useLocalTeams = () => {
  const { get, post, put, delete: del, loading, error } = useLocalApi();
  const [teams, setTeams] = useState<any[]>([]);

  const fetchTeams = async () => {
    try {
      const data = await get('/teams');
      setTeams(data.data?.teams || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const createTeam = async (teamData: any) => {
    try {
      const data = await post('/teams', teamData);
      await fetchTeams();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateTeam = async (id: string, teamData: any) => {
    try {
      const data = await put(`/teams/${id}`, teamData);
      await fetchTeams();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await del(`/teams/${id}`);
      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
};

// Local events hook
export const useLocalEvents = () => {
  const { get, post, put, delete: del, loading, error } = useLocalApi();
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      const data = await get('/events');
      setEvents(data.data?.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const createEvent = async (eventData: any) => {
    try {
      const data = await post('/events', eventData);
      await fetchEvents();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateEvent = async (id: string, eventData: any) => {
    try {
      const data = await put(`/events/${id}`, eventData);
      await fetchEvents();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await del(`/events/${id}`);
      await fetchEvents();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

// Local matches hook
export const useLocalMatches = () => {
  const { get, post, put, delete: del, loading, error } = useLocalApi();
  const [matches, setMatches] = useState<any[]>([]);

  const fetchMatches = async () => {
    try {
      const data = await get('/matches');
      setMatches(data.data?.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const createMatch = async (matchData: any) => {
    try {
      const data = await post('/matches', matchData);
      await fetchMatches();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateMatch = async (id: string, matchData: any) => {
    try {
      const data = await put(`/matches/${id}`, matchData);
      await fetchMatches();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      await del(`/matches/${id}`);
      await fetchMatches();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    fetchMatches,
    createMatch,
    updateMatch,
    deleteMatch,
  };
}; 