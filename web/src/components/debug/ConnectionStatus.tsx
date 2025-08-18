'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import enhancedApiClient from '@/lib/enhancedApiClient';

interface ConnectionStatusProps {
  show?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ show = false }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>('');

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const isHealthy = await enhancedApiClient.checkHealth();
      setStatus(isHealthy ? 'connected' : 'disconnected');
      setLastCheck(new Date());
      setErrorDetails('');
    } catch (error: any) {
      setStatus('error');
      setErrorDetails(error.message || 'Unknown error');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!show && status === 'connected') {
    return null; // Don't show when everything is working
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} className="text-success" />;
      case 'disconnected':
        return <WifiOff size={16} className="text-danger" />;
      case 'error':
        return <AlertTriangle size={16} className="text-warning" />;
      default:
        return <Wifi size={16} className="text-muted" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Checking Connection...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'border-success bg-success bg-opacity-10';
      case 'disconnected':
        return 'border-danger bg-danger bg-opacity-10';
      case 'error':
        return 'border-warning bg-warning bg-opacity-10';
      default:
        return 'border-secondary bg-secondary bg-opacity-10';
    }
  };

  return (
    <div className={`card border ${getStatusColor()} mb-3`}>
      <div className="card-body py-2">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {getStatusIcon()}
            <span className="ms-2 small fw-medium">{getStatusText()}</span>
          </div>
          <div className="d-flex align-items-center">
            {lastCheck && (
              <span className="small text-muted me-2">
                {lastCheck.toLocaleTimeString()}
              </span>
            )}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={checkConnection}
              disabled={status === 'checking'}
            >
              {status === 'checking' ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                'Check'
              )}
            </button>
          </div>
        </div>
        {errorDetails && (
          <div className="mt-2">
            <small className="text-muted">Error: {errorDetails}</small>
          </div>
        )}
        {status === 'disconnected' && (
          <div className="mt-2">
            <small className="text-muted">
              Make sure the backend server is running on port 3001
            </small>
          </div>
        )}
      </div>
    </div>
  );
};
