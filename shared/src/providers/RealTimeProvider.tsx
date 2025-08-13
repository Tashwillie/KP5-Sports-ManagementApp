import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RealTimeService, RealTimeConfig } from '../services/realTimeService';

export interface RealTimeContextType {
  service: RealTimeService | null;
  isConnected: boolean;
  connectionState: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const RealTimeContext = createContext<RealTimeContextType>({
  service: null,
  isConnected: false,
  connectionState: 'disconnected',
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useRealTimeContext = () => useContext(RealTimeContext);

interface RealTimeProviderProps {
  children: ReactNode;
  config: RealTimeConfig;
  autoConnect?: boolean;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ 
  children, 
  config, 
  autoConnect = false 
}) => {
  const [service, setService] = useState<RealTimeService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const realTimeService = new RealTimeService(config);
    setService(realTimeService);

    // Set up connection state listeners
    realTimeService.on('connect', () => {
      setIsConnected(true);
      setConnectionState('connected');
      setError(null);
    });

    realTimeService.on('disconnect', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    realTimeService.on('connect_error', (event) => {
      setError(event.data?.message || 'Connection failed');
      setConnectionState('error');
    });

    realTimeService.on('reconnect', () => {
      setConnectionState('reconnecting');
    });

    // Auto-connect if enabled
    if (autoConnect) {
      realTimeService.connect().catch((err) => {
        setError(err instanceof Error ? err.message : 'Connection failed');
      });
    }

    return () => {
      realTimeService.disconnect();
    };
  }, [config, autoConnect]);

  const connect = async () => {
    if (service) {
      try {
        await service.connect();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
        throw err;
      }
    }
  };

  const disconnect = () => {
    if (service) {
      service.disconnect();
    }
  };

  const value: RealTimeContextType = {
    service,
    isConnected,
    connectionState,
    error,
    connect,
    disconnect,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
