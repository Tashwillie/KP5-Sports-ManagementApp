'use client';

import React from 'react';
import { Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useDemoData } from '@/hooks/useAdvancedFeaturesData';
import { useUpdateMatchStatus, useUpdateMatchScore, useAddMatchEvent } from '@/hooks/useAdvancedFeaturesData';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import LiveMatchTracker from '@/components/live-match/LiveMatchTracker';
import RealTimeStatsDashboard from '@/components/statistics/RealTimeStatsDashboard';
import WebSocketStatus from '@/components/common/WebSocketStatus';
import { Wifi, Database, Activity, Trophy, Target } from 'lucide-react';

export default function AdvancedFeaturesDemo() {
  const {
    realTournaments,
    realMatches,
    fallbackTournament,
    fallbackMatches,
    isLoading,
    error,
    hasRealData,
    refetch
  } = useDemoData();

  const updateMatchStatus = useUpdateMatchStatus();
  const updateMatchScore = useUpdateMatchScore();
  const addMatchEvent = useAddMatchEvent();

  // Use real data if available, otherwise fallback to demo data
  const tournaments = hasRealData ? realTournaments : [fallbackTournament];
  const matches = hasRealData ? realMatches : fallbackMatches;

  const handleMatchUpdate = async (matchId: string, updates: any) => {
    if (hasRealData) {
      if (updates.status) {
        await updateMatchStatus.mutateAsync({ matchId, status: updates.status });
      }
      if (updates.homeScore !== undefined || updates.awayScore !== undefined) {
        const currentMatch = matches.find(m => m.id === matchId);
        if (currentMatch) {
          await updateMatchScore.mutateAsync({
            matchId,
            homeScore: updates.homeScore ?? currentMatch.homeScore,
            awayScore: updates.awayScore ?? currentMatch.awayScore
          });
        }
      }
    }
  };

  const handleAddMatchEvent = async (matchId: string, eventData: any) => {
    if (hasRealData) {
      await addMatchEvent.mutateAsync({
        matchId,
        type: eventData.type,
        minute: eventData.minute,
        teamId: eventData.teamId,
        playerId: eventData.playerId,
        description: eventData.description
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading advanced features...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          <h4>Error Loading Advanced Features</h4>
          <p>{error.message}</p>
          <button className="btn btn-outline-danger" onClick={() => refetch()}>
            Retry
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="display-4 mb-3">
          <Trophy className="me-3 text-warning" />
          Advanced Features Demo
        </h1>
        <p className="lead text-muted">
          Experience the power of real-time sports management with live match tracking, 
          tournament brackets, and real-time statistics.
        </p>
      </div>

      {/* Connection Status */}
      <Row className="mb-4">
        <Col>
          <WebSocketStatus showControls={true} />
        </Col>
      </Row>

      {/* Data Source Information */}
      <Row className="mb-4">
        <Col>
          <Alert variant={hasRealData ? 'success' : 'warning'}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                {hasRealData ? (
                  <Database className="me-2 text-success" />
                ) : (
                  <Database className="me-2 text-warning" />
                )}
                <span>
                  <strong>Data Source:</strong> {hasRealData ? 'Live Backend' : 'Demo Data'}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={hasRealData ? 'success' : 'secondary'}>
                  {hasRealData ? 'Connected' : 'Offline'}
                </Badge>
                {hasRealData && (
                  <button className="btn btn-sm btn-outline-primary" onClick={() => refetch()}>
                    Refresh Data
                  </button>
                )}
              </div>
            </div>
          </Alert>
        </Col>
      </Row>

      {/* Live Match Tracker */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <Target className="me-2" />
                Live Match Tracker
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Real-time match tracking with live updates, timer control, and event entry. 
                Referees can control match flow and record events in real-time.
              </p>
              <LiveMatchTracker
                match={{
                  id: matches[0]?.id || 'demo-match-1',
                  homeTeam: matches[0]?.homeTeam?.name || 'Home Team',
                  awayTeam: matches[0]?.awayTeam?.name || 'Away Team',
                  homeScore: matches[0]?.homeScore || 0,
                  awayScore: matches[0]?.awayScore || 0,
                  status: matches[0]?.status || 'scheduled',
                  currentMinute: matches[0]?.currentMinute || 0,
                  venue: matches[0]?.venue || 'Main Stadium',
                  date: matches[0]?.date || 'Today'
                }}
                isReferee={true}
                onMatchUpdate={handleMatchUpdate}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tournament Bracket */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">
                <Trophy className="me-2" />
                Tournament Bracket
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Interactive tournament bracket visualization with real-time updates. 
                Track match progress and see how teams advance through the tournament.
              </p>
              <TournamentBracket
                tournament={tournaments[0]}
                matches={matches}
                onMatchUpdate={handleMatchUpdate}
                isReferee={true}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Real-Time Statistics Dashboard */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0">
                <Activity className="me-2" />
                Real-Time Statistics Dashboard
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Live statistics and analytics dashboard showing real-time match data, 
                player performance, and team statistics.
              </p>
              <RealTimeStatsDashboard
                matches={matches}
                onMatchUpdate={handleMatchUpdate}
                onAddEvent={handleAddMatchEvent}
                isReferee={true}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Technical Details */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-secondary text-white">
              <h4 className="mb-0">
                <Wifi className="me-2" />
                Technical Implementation
              </h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Real-Time Features</h6>
                  <ul className="list-unstyled">
                    <li>✅ WebSocket connection with Socket.IO</li>
                    <li>✅ Live match state synchronization</li>
                    <li>✅ Real-time event broadcasting</li>
                    <li>✅ Multi-device coordination</li>
                    <li>✅ Automatic reconnection</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Backend Integration</h6>
                  <ul className="list-unstyled">
                    <li>✅ PostgreSQL database with Prisma ORM</li>
                    <li>✅ RESTful API endpoints</li>
                    <li>✅ WebSocket server with authentication</li>
                    <li>✅ Real-time data persistence</li>
                    <li>✅ Role-based access control</li>
                  </ul>
                </Col>
              </Row>
              
              <hr />
              
              <div className="text-center">
                <h6>How It Works</h6>
                <p className="text-muted mb-0">
                  The system uses WebSocket connections to provide real-time updates across all connected devices. 
                  When a referee updates match data, changes are immediately broadcast to all spectators, 
                  coaches, and administrators. The backend ensures data consistency and provides a reliable 
                  foundation for live sports management.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Connection Test */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-warning text-dark">
              <h4 className="mb-0">
                <Wifi className="me-2" />
                Connection Test
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Test your WebSocket connection and see real-time data flow in action.
              </p>
              <div className="text-center">
                <WebSocketStatus variant="detailed" showControls={true} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
