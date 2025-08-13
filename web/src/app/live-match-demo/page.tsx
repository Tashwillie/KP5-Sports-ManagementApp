'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import EnhancedLiveMatchControl from '@/components/live-match/EnhancedLiveMatchControl';
import LiveStatisticsDisplay from '@/components/live-match/LiveStatisticsDisplay';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import { Play, BarChart3, Trophy, Settings, Users, Target } from 'lucide-react';

export default function LiveMatchDemoPage() {
  const [activeTab, setActiveTab] = useState<'control' | 'statistics' | 'tournament'>('control');
  const [isReferee, setIsReferee] = useState(true);

  // Mock match data for demonstration
  const mockMatch = {
    id: 'match-001',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    currentMinute: 67,
    venue: 'Old Trafford',
    date: '2024-01-15',
    homeTeamId: 'team-home',
    awayTeamId: 'team-away'
  };

  // Mock tournament data for demonstration
  const mockTournament = {
    id: 'tournament-001',
    name: 'Premier League Cup 2024',
    description: 'Annual knockout tournament featuring top Premier League teams',
    format: 'knockout' as const,
    status: 'active' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-01'),
    maxTeams: 16,
    currentTeams: 16,
    rounds: 4,
    teams: [
      { id: 'team-1', name: 'Manchester United', seed: 1 },
      { id: 'team-2', name: 'Liverpool', seed: 2 },
      { id: 'team-3', name: 'Arsenal', seed: 3 },
      { id: 'team-4', name: 'Chelsea', seed: 4 },
      { id: 'team-5', name: 'Manchester City', seed: 5 },
      { id: 'team-6', name: 'Tottenham', seed: 6 },
      { id: 'team-7', name: 'Newcastle', seed: 7 },
      { id: 'team-8', name: 'Aston Villa', seed: 8 }
    ],
    matches: [
      {
        id: 'match-1',
        homeTeamId: 'team-1',
        awayTeamId: 'team-8',
        homeScore: 2,
        awayScore: 0,
        status: 'completed' as const,
        round: 1,
        matchNumber: 1,
        scheduledTime: new Date('2024-01-10T15:00:00'),
        venue: 'Old Trafford',
        winnerId: 'team-1',
        matchType: 'knockout' as const
      },
      {
        id: 'match-2',
        homeTeamId: 'team-2',
        awayTeamId: 'team-7',
        homeScore: 1,
        awayScore: 1,
        status: 'live' as const,
        round: 1,
        matchNumber: 2,
        scheduledTime: new Date('2024-01-10T17:30:00'),
        venue: 'Anfield',
        matchType: 'knockout' as const
      },
      {
        id: 'match-3',
        homeTeamId: 'team-3',
        awayTeamId: 'team-6',
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled' as const,
        round: 1,
        matchNumber: 3,
        scheduledTime: new Date('2024-01-11T15:00:00'),
        venue: 'Emirates Stadium',
        matchType: 'knockout' as const
      },
      {
        id: 'match-4',
        homeTeamId: 'team-4',
        awayTeamId: 'team-5',
        homeScore: 0,
        awayScore: 0,
        status: 'scheduled' as const,
        round: 1,
        matchNumber: 4,
        scheduledTime: new Date('2024-01-11T17:30:00'),
        venue: 'Stamford Bridge',
        matchType: 'knockout' as const
      }
    ],
    settings: {
      hasThirdPlace: true,
      hasSeeding: true,
      groupSize: 4,
      knockoutRounds: 4
    }
  };

  const handleMatchUpdate = (matchId: string, updates: any) => {
    console.log('Match updated:', matchId, updates);
    // In a real application, this would update the match in the database
  };

  const handleTournamentUpdate = (tournamentId: string, updates: any) => {
    console.log('Tournament updated:', tournamentId, updates);
    // In a real application, this would update the tournament in the database
  };

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="text-center mb-4">
        <h1 className="display-4 mb-3">
          <Play className="me-3 text-primary" />
          Live Match Control System Demo
        </h1>
        <p className="lead text-muted">
          Experience the complete live match management system with real-time controls, 
          statistics, and tournament management
        </p>
      </div>

      {/* Demo Controls */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
              <Button
                variant={activeTab === 'control' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('control')}
              >
                <Play size={16} className="me-2" />
                Live Match Control
              </Button>
              <Button
                variant={activeTab === 'statistics' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('statistics')}
              >
                <BarChart3 size={16} className="me-2" />
                Real-Time Statistics
              </Button>
              <Button
                variant={activeTab === 'tournament' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('tournament')}
              >
                <Trophy size={16} className="me-2" />
                Tournament Bracket
              </Button>
            </div>
            
            <div className="d-flex gap-2 align-items-center">
              <span className="text-muted me-2">Role:</span>
              <Button
                variant={isReferee ? 'success' : 'outline-success'}
                size="sm"
                onClick={() => setIsReferee(!isReferee)}
              >
                <Users size={16} className="me-1" />
                {isReferee ? 'Referee' : 'Spectator'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Connection Status Warning */}
      <Alert variant="warning" className="mb-4">
        <div className="d-flex align-items-center">
          <Target size={20} className="me-2" />
          <div>
            <strong>Demo Mode:</strong> This is a demonstration of the live match control system. 
            The WebSocket connection is simulated, but all UI interactions are fully functional.
          </div>
        </div>
      </Alert>

      {/* Demo Content */}
      {activeTab === 'control' && (
        <div>
          <h3 className="mb-3">
            <Play className="me-2 text-primary" />
            Enhanced Live Match Control
          </h3>
          <p className="text-muted mb-4">
            This component provides referees with comprehensive match control capabilities including 
            timer management, event entry, and real-time match status updates.
          </p>
          
          <EnhancedLiveMatchControl
            match={mockMatch}
            isReferee={isReferee}
            onMatchUpdate={handleMatchUpdate}
          />
        </div>
      )}

      {activeTab === 'statistics' && (
        <div>
          <h3 className="mb-3">
            <BarChart3 className="me-2 text-info" />
            Real-Time Statistics Display
          </h3>
          <p className="text-muted mb-4">
            View live match statistics, team performance metrics, and player analytics 
            in real-time with interactive charts and detailed breakdowns.
          </p>
          
          <LiveStatisticsDisplay
            matchId={mockMatch.id}
            homeTeam={mockMatch.homeTeam}
            awayTeam={mockMatch.awayTeam}
            homeTeamId={mockMatch.homeTeamId}
            awayTeamId={mockMatch.awayTeamId}
            isReferee={isReferee}
          />
        </div>
      )}

      {activeTab === 'tournament' && (
        <div>
          <h3 className="mb-3">
            <Trophy className="me-2 text-warning" />
            Tournament Bracket System
          </h3>
          <p className="text-muted mb-4">
            Manage tournament brackets with multiple formats, real-time match updates, 
            and comprehensive tournament administration tools.
          </p>
          
          <TournamentBracket
            tournament={mockTournament}
            isAdmin={isReferee}
            onMatchUpdate={handleMatchUpdate}
            onTournamentUpdate={handleTournamentUpdate}
          />
        </div>
      )}

      {/* Feature Overview */}
      <Card className="mt-5">
        <Card.Body>
          <h4 className="mb-4">System Features Overview</h4>
          <Row>
            <Col md={4}>
              <div className="text-center mb-3">
                <Play size={48} className="text-primary mb-3" />
                <h5>Live Match Control</h5>
                <ul className="text-start text-muted">
                  <li>Real-time timer control</li>
                  <li>Quick event entry</li>
                  <li>Match status management</li>
                  <li>Referee permissions</li>
                </ul>
              </div>
            </Col>
            
            <Col md={4}>
              <div className="text-center mb-3">
                <BarChart3 size={48} className="text-info mb-3" />
                <h5>Real-Time Statistics</h5>
                <ul className="text-start text-muted">
                  <li>Live match statistics</li>
                  <li>Player performance tracking</li>
                  <li>Team analytics</li>
                  <li>Match momentum analysis</li>
                </ul>
              </div>
            </Col>
            
            <Col md={4}>
              <div className="text-center mb-3">
                <Trophy size={48} className="text-warning mb-3" />
                <h5>Tournament Management</h5>
                <ul className="text-start text-muted">
                  <li>Multiple bracket formats</li>
                  <li>Real-time updates</li>
                  <li>Standings calculation</li>
                  <li>Admin controls</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Technical Details */}
      <Card className="mt-4">
        <Card.Body>
          <h5 className="mb-3">
            <Settings className="me-2" />
            Technical Implementation
          </h5>
          <Row>
            <Col md={6}>
              <h6>Frontend Components</h6>
              <ul className="text-muted">
                <li>React TypeScript components</li>
                <li>Bootstrap UI framework</li>
                <li>Real-time WebSocket integration</li>
                <li>Responsive design</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Backend Integration</h6>
              <ul className="text-muted">
                <li>PostgreSQL database</li>
                <li>Express.js API</li>
                <li>WebSocket server</li>
                <li>Real-time event handling</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Usage Instructions */}
      <Card className="mt-4">
        <Card.Body>
          <h5 className="mb-3">How to Use</h5>
          <ol className="text-muted">
            <li><strong>Switch between tabs</strong> to explore different system components</li>
            <li><strong>Toggle referee role</strong> to see different permission levels</li>
            <li><strong>Interact with controls</strong> to experience the full functionality</li>
            <li><strong>View real-time updates</strong> as you make changes</li>
            <li><strong>Explore tournament brackets</strong> and match management</li>
          </ol>
        </Card.Body>
      </Card>
    </Container>
  );
}
