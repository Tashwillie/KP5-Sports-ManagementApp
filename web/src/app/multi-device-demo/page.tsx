'use client';

import React, { useState, useEffect } from 'react';
import { LiveMatchTracker } from '@/components/match/LiveMatchTracker';
import WebSocketStatus from '@/components/common/WebSocketStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MatchUpdate } from '@/lib/services/websocketService';
import { toast } from 'sonner';

export default function MultiDeviceDemoPage() {
  const [matchId] = useState('multi-device-match-1');
  const [deviceId] = useState(`device-${Math.random().toString(36).substr(2, 9)}`);
  const [receivedUpdates, setReceivedUpdates] = useState<MatchUpdate[]>([]);
  const [isSpectator, setIsSpectator] = useState(false);

  // Mock data for demonstration
  const mockMatch = {
    matchId,
    homeTeam: {
      id: 'team-1',
      name: 'KP5 Lions',
      score: 0
    },
    awayTeam: {
      id: 'team-2',
      name: 'City Warriors',
      score: 0
    }
  };

  // WebSocket hook for real-time updates
  const { isConnected, send } = useWebSocket({
    autoConnect: true,
    matchId,
    onMatchUpdate: handleWebSocketUpdate,
    onConnectionChange: handleConnectionChange
  });

  // Handle incoming WebSocket updates
  function handleWebSocketUpdate(update: MatchUpdate) {
    console.log(`[${deviceId}] Received update:`, update);
    
    // Add timestamp for display
    const updateWithTimestamp = {
      ...update,
      receivedAt: new Date().toISOString(),
      deviceId
    };
    
    setReceivedUpdates(prev => [updateWithTimestamp, ...prev.slice(0, 19)]); // Keep last 20 updates
    
    // Show toast for important updates
    if (update.type === 'MATCH_START') {
      toast.success(`Match started by another device!`);
    } else if (update.type === 'SCORE_UPDATE') {
      toast.info(`Score updated by another device: ${update.data.homeScore} - ${update.data.awayScore}`);
    }
  }

  // Handle connection changes
  function handleConnectionChange(connected: boolean) {
    if (connected) {
      toast.success(`Device ${deviceId} connected to real-time updates`);
    } else {
      toast.warning(`Device ${deviceId} disconnected from real-time updates`);
    }
  }

  // Send test update
  const sendTestUpdate = (type: string, data: any) => {
    if (!isConnected) {
      toast.error('WebSocket not connected');
      return;
    }

    send(type, {
      ...data,
      matchId,
      deviceId,
      timestamp: new Date().toISOString()
    });

    toast.success(`Test update sent: ${type}`);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 mb-2">Multi-Device Real-Time Demo</h1>
            <p className="text-muted mb-0">
              This demo shows real-time synchronization between multiple devices using WebSocket connections.
              Open this page in multiple browser tabs or devices to see live updates.
            </p>
          </div>
          
          <div className="text-end">
            <div className="mb-2">
              <strong>Device ID:</strong> <code>{deviceId}</code>
            </div>
            <WebSocketStatus showDetails={true} />
          </div>
        </div>
      </div>

      <div className="row">
        {/* Live Match Tracker */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Live Match Tracker</h5>
              <small className="text-muted">
                Control the match and see updates in real-time across all devices
              </small>
            </div>
            <div className="card-body">
              <LiveMatchTracker
                matchId={mockMatch.matchId}
                homeTeam={mockMatch.homeTeam}
                awayTeam={mockMatch.awayTeam}
                enableRealTime={true}
                onMatchUpdate={(update) => {
                  console.log('Match update:', update);
                }}
              />
            </div>
          </div>
        </div>

        {/* Real-Time Updates Panel */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Real-Time Updates</h5>
              <small className="text-muted">
                Live updates received from all connected devices
              </small>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-grid gap-2">
                  <button
                    onClick={() => sendTestUpdate('TEST_UPDATE', { message: 'Hello from device!' })}
                    className="btn btn-outline-primary btn-sm"
                    disabled={!isConnected}
                  >
                    Send Test Update
                  </button>
                  
                  <button
                    onClick={() => sendTestUpdate('DEVICE_JOINED', { deviceId, timestamp: new Date().toISOString() })}
                    className="btn btn-outline-info btn-sm"
                    disabled={!isConnected}
                  >
                    Announce Device Join
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <h6>Connection Status</h6>
                <div className="d-flex align-items-center gap-2">
                  <div className={`badge ${isConnected ? 'bg-success' : 'bg-warning'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                  <small className="text-muted">
                    {isConnected ? 'Receiving real-time updates' : 'Updates paused'}
                  </small>
                </div>
              </div>

              <div>
                <h6>Recent Updates</h6>
                <div className="updates-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {receivedUpdates.length === 0 ? (
                    <p className="text-muted text-center py-3">No updates received yet</p>
                  ) : (
                    receivedUpdates.map((update, index) => (
                      <div key={index} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong className="text-primary">{update.type}</strong>
                            <div className="text-muted small">
                              Device: <code>{update.deviceId}</code>
                            </div>
                            <div className="text-muted small">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <small className="text-muted">
                            {update.receivedAt && new Date(update.receivedAt).toLocaleTimeString()}
                          </small>
                        </div>
                        {update.data && (
                          <div className="mt-1">
                            <small className="text-muted">
                              {JSON.stringify(update.data, null, 2)}
                            </small>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">How to Test</h5>
            </div>
            <div className="card-body">
              <ol className="mb-0">
                <li>Open this page in multiple browser tabs or devices</li>
                <li>Start a match on one device</li>
                <li>Watch the updates appear in real-time on all devices</li>
                <li>Try updating scores and adding events from different devices</li>
                <li>Observe the synchronization across all connected devices</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="mt-4">
        <div className="alert alert-info">
          <h5>Real-Time Features Demonstrated:</h5>
          <div className="row">
            <div className="col-md-6">
              <ul className="mb-0">
                <li><strong>WebSocket Connection:</strong> Persistent real-time connection</li>
                <li><strong>Multi-Device Sync:</strong> Updates propagate to all connected devices</li>
                <li><strong>Live Match Control:</strong> Start, pause, resume, end matches</li>
                <li><strong>Real-Time Scoring:</strong> Score updates sync instantly</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="mb-0">
                <li><strong>Event Tracking:</strong> Goals, cards, substitutions in real-time</li>
                <li><strong>Connection Status:</strong> Visual indicators for connection health</li>
                <li><strong>Automatic Reconnection:</strong> Handles network interruptions</li>
                <li><strong>Device Identification:</strong> Track updates from different sources</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
