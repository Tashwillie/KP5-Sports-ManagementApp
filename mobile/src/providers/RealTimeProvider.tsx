import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import MobileRealTimeService from '../services/realTimeService';
import { RealTimeConfig } from '@kp5-academy/shared';

export interface MobileRealTimeContextType {
  service: MobileRealTimeService | null;
  isConnected: boolean;
  connectionState: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendLocationUpdate: (latitude: number, longitude: number) => Promise<void>;
  sendDeviceInfo: () => Promise<void>;
}

const MobileRealTimeContext = createContext<MobileRealTimeContextType>({
  service: null,
  isConnected: false,
  connectionState: 'disconnected',
  error: null,
  connect: async () => {},
  disconnect: () => {},
  sendLocationUpdate: async () => {},
  sendDeviceInfo: async () => {},
});

export const useMobileRealTimeContext = () => useContext(MobileRealTimeContext);

interface MobileRealTimeProviderProps {
  children: ReactNode;
  config: RealTimeConfig;
  autoConnect?: boolean;
}

export const MobileRealTimeProvider: React.FC<MobileRealTimeProviderProps> = ({ 
  children, 
  config, 
  autoConnect = false 
}) => {
  const [service, setService] = useState<MobileRealTimeService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mobileRealTimeService = new MobileRealTimeService(config);
    setService(mobileRealTimeService);

    // Set up connection state listeners
    mobileRealTimeService.on('connect', () => {
      setIsConnected(true);
      setConnectionState('connected');
      setError(null);
    });

    mobileRealTimeService.on('disconnect', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    });

    mobileRealTimeService.on('connect_error', (event) => {
      setError(event.data?.message || 'Connection failed');
      setConnectionState('error');
    });

    mobileRealTimeService.on('reconnect', () => {
      setConnectionState('reconnecting');
    });

    // Auto-connect if enabled
    if (autoConnect) {
      mobileRealTimeService.connect().catch((err) => {
        setError(err.message);
      });
    }

    return () => {
      mobileRealTimeService.disconnect();
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

  const sendLocationUpdate = async (latitude: number, longitude: number) => {
    if (service) {
      await service.sendLocationUpdate(latitude, longitude);
    }
  };

  const sendDeviceInfo = async () => {
    if (service) {
      await service.sendDeviceInfo();
    }
  };

  const value: MobileRealTimeContextType = {
    service,
    isConnected,
    connectionState,
    error,
    connect,
    disconnect,
    sendLocationUpdate,
    sendDeviceInfo,
  };

  return (
    <MobileRealTimeContext.Provider value={value}>
      {children}
    </MobileRealTimeContext.Provider>
  );
};
