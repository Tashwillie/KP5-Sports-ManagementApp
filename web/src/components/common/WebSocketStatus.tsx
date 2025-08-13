'use client';

import React from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { Badge, Button, Alert } from 'react-bootstrap';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface WebSocketStatusProps {
  showControls?: boolean;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export default function WebSocketStatus({ 
  showControls = true, 
  variant = 'detailed',
  className = '' 
}: WebSocketStatusProps) {
  const {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    error
  } = useWebSocketContext();

  const getStatusVariant = () => {
    switch (connectionStatus) {
      case 'OPEN':
        return 'success';
      case 'CONNECTING':
        return 'warning';
      case 'CLOSING':
        return 'warning';
      case 'CLOSED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'OPEN':
        return 'Connected';
      case 'CONNECTING':
        return 'Connecting...';
      case 'CLOSING':
        return 'Disconnecting...';
      case 'CLOSED':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'OPEN':
        return <Wifi size={16} />;
      case 'CONNECTING':
        return <RefreshCw size={16} className="spinning" />;
      case 'CLOSING':
        return <RefreshCw size={16} className="spinning" />;
      case 'CLOSED':
        return <WifiOff size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`websocket-status-compact ${className}`}>
        <Badge bg={getStatusVariant()} className="d-flex align-items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`websocket-status ${className}`}>
      <Alert variant={getStatusVariant()} className="mb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            {getStatusIcon()}
            <span>
              <strong>WebSocket:</strong> {getStatusText()}
            </span>
            {error && (
              <Badge bg="danger" className="ms-2">
                Error
              </Badge>
            )}
          </div>
          
          {showControls && (
            <div className="d-flex gap-2">
              {isConnected ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={disconnect}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={connect}
                  disabled={connectionStatus === 'CONNECTING'}
                >
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2">
            <small className="text-danger">
              <AlertTriangle size={14} className="me-1" />
              {error}
            </small>
          </div>
        )}
      </Alert>
    </div>
  );
}
