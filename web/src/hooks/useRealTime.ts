import { useRealTimeContext } from '@kp5-academy/shared';
import { useEffect } from 'react';
import { useAuth } from './useAuth';

export const useRealTime = () => {
  const realTime = useRealTimeContext();
  const { user } = useAuth();

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && realTime.service && !realTime.isConnected) {
      realTime.connect().catch(console.error);
    }
  }, [user, realTime.service, realTime.isConnected, realTime.connect]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user && realTime.isConnected) {
      realTime.disconnect();
    }
  }, [user, realTime.isConnected, realTime.disconnect]);

  return realTime;
};
