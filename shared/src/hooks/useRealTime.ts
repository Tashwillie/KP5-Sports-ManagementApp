import { useEffect, useRef, useState, useCallback } from 'react';
import { RealTimeService, RealTimeConfig, RealTimeCallback } from '../services/realTimeService';
import { RealTimeEvent } from '../types';

export interface UseRealTimeOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useRealTime(
  config: RealTimeConfig,
  options: UseRealTimeOptions = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const realTimeServiceRef = useRef<RealTimeService | null>(null);
  const eventCallbacksRef = useRef<Map<string, RealTimeCallback[]>>(new Map());

  const { autoConnect = true, reconnectInterval, maxReconnectAttempts } = options;

  // Initialize real-time service
  useEffect(() => {
    if (!realTimeServiceRef.current) {
      realTimeServiceRef.current = new RealTimeService({
        ...config,
        reconnectInterval: reconnectInterval || config.reconnectInterval,
        maxReconnectAttempts: maxReconnectAttempts || config.maxReconnectAttempts
      });
    }

    return () => {
      if (realTimeServiceRef.current) {
        realTimeServiceRef.current.disconnect();
        realTimeServiceRef.current = null;
      }
    };
  }, [config.url, config.token, reconnectInterval, maxReconnectAttempts]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && realTimeServiceRef.current && !isConnected) {
      connect();
    }
  }, [autoConnect, isConnected]);

  // Connection management
  const connect = useCallback(async () => {
    if (!realTimeServiceRef.current) return;

    try {
      setConnectionState('connecting');
      setError(null);
      
      await realTimeServiceRef.current.connect();
      setIsConnected(true);
      setConnectionState('connected');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Connection failed'));
      setConnectionState('disconnected');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (realTimeServiceRef.current) {
      realTimeServiceRef.current.disconnect();
      setIsConnected(false);
      setConnectionState('disconnected');
      setError(null);
    }
  }, []);

  // Event subscription
  const subscribe = useCallback((eventName: string, callback: RealTimeCallback) => {
    if (!realTimeServiceRef.current) return () => {};

    if (!eventCallbacksRef.current.has(eventName)) {
      eventCallbacksRef.current.set(eventName, []);
    }
    eventCallbacksRef.current.get(eventName)!.push(callback);

    const unsubscribe = realTimeServiceRef.current.on(eventName, callback);

    return () => {
      unsubscribe();
      const callbacks = eventCallbacksRef.current.get(eventName);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          eventCallbacksRef.current.delete(eventName);
        }
      }
    };
  }, []);

  // Room management
  const joinRoom = useCallback((room: string) => {
    if (realTimeServiceRef.current && isConnected) {
      realTimeServiceRef.current.joinRoom(room);
    }
  }, [isConnected]);

  const leaveRoom = useCallback((room: string) => {
    if (realTimeServiceRef.current && isConnected) {
      realTimeServiceRef.current.leaveRoom(room);
    }
  }, [isConnected]);

  // Event emission
  const emit = useCallback((eventName: string, data: any) => {
    if (realTimeServiceRef.current && isConnected) {
      realTimeServiceRef.current.emit(eventName, data);
    }
  }, [isConnected]);

  const emitMatchEvent = useCallback((matchId: string, eventData: any) => {
    if (realTimeServiceRef.current && isConnected) {
      realTimeServiceRef.current.emitMatchEvent(matchId, eventData);
    }
  }, [isConnected]);

  const emitChatMessage = useCallback((roomId: string, message: string, metadata?: any) => {
    if (realTimeServiceRef.current && isConnected) {
      realTimeServiceRef.current.emitChatMessage(roomId, message, metadata);
    }
  }, [isConnected]);

  const emitNotification = useCallback((targetUserId: string, notification: any) => {
    if (realTimeServiceRef.current && isConnected) {
      realTimeServiceRef.current.emitNotification(targetUserId, notification);
    }
  }, [isConnected]);

  return {
    // Connection state
    isConnected,
    connectionState,
    error,
    
    // Connection management
    connect,
    disconnect,
    
    // Event management
    subscribe,
    
    // Room management
    joinRoom,
    leaveRoom,
    
    // Event emission
    emit,
    emitMatchEvent,
    emitChatMessage,
    emitNotification,
    
    // Service access
    service: realTimeServiceRef.current
  };
}

// Hook for subscribing to specific events
export function useRealTimeEvent(
  realTime: ReturnType<typeof useRealTime>,
  eventName: string,
  callback: RealTimeCallback
) {
  useEffect(() => {
    if (realTime.isConnected) {
      return realTime.subscribe(eventName, callback);
    }
  }, [realTime.isConnected, eventName, callback]);
}

// Hook for match events
export function useMatchEvents(
  realTime: ReturnType<typeof useRealTime>,
  matchId: string,
  onEvent?: (event: RealTimeEvent) => void
) {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    if (realTime.isConnected && matchId) {
      // Join match room
      realTime.joinRoom(`match:${matchId}`);

      // Subscribe to match events
      const unsubscribe = realTime.subscribe('match-event', (event) => {
        if (event.data.matchId === matchId) {
          setEvents(prev => [...prev, event]);
          onEvent?.(event);
        }
      });

      return () => {
        unsubscribe();
        realTime.leaveRoom(`match:${matchId}`);
      };
    }
  }, [realTime.isConnected, matchId, onEvent]);

  const addEvent = useCallback((eventData: any) => {
    realTime.emitMatchEvent(matchId, eventData);
  }, [realTime, matchId]);

  return {
    events,
    addEvent,
    clearEvents: () => setEvents([])
  };
}

// Hook for chat messages
export function useChatMessages(
  realTime: ReturnType<typeof useRealTime>,
  roomId: string,
  onMessage?: (event: RealTimeEvent) => void
) {
  const [messages, setMessages] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    if (realTime.isConnected && roomId) {
      // Join chat room
      realTime.joinRoom(`chat:${roomId}`);

      // Subscribe to chat messages
      const unsubscribe = realTime.subscribe('chat-message', (event) => {
        if (event.data.roomId === roomId) {
          setMessages(prev => [...prev, event]);
          onMessage?.(event);
        }
      });

      return () => {
        unsubscribe();
        realTime.leaveRoom(`chat:${roomId}`);
      };
    }
  }, [realTime.isConnected, roomId, onMessage]);

  const sendMessage = useCallback((message: string, metadata?: any) => {
    realTime.emitChatMessage(roomId, message, metadata);
  }, [realTime, roomId]);

  return {
    messages,
    sendMessage,
    clearMessages: () => setMessages([])
  };
}

// Hook for real-time notifications
export function useRealTimeNotifications(
  realTime: ReturnType<typeof useRealTime>,
  onNotification?: (event: RealTimeEvent) => void
) {
  const [notifications, setNotifications] = useState<RealTimeEvent[]>([]);

  useEffect(() => {
    if (realTime.isConnected) {
      const unsubscribe = realTime.subscribe('notification', (event) => {
        setNotifications(prev => [...prev, event]);
        onNotification?.(event);
      });

      return unsubscribe;
    }
  }, [realTime.isConnected, onNotification]);

  const sendNotification = useCallback((targetUserId: string, notification: any) => {
    realTime.emitNotification(targetUserId, notification);
  }, [realTime]);

  return {
    notifications,
    sendNotification,
    clearNotifications: () => setNotifications([])
  };
}
