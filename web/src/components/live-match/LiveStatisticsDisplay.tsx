import React, { useState, useEffect, useMemo } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { MatchEvent, MatchState } from '@/lib/services/websocketService';
import { Card, Row, Col, Badge, ProgressBar, Table, Alert, Button, Modal } from 'react-bootstrap';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Shield, 
  Clock, 
  Award,
  Activity,
  PieChart,
  LineChart,
  Eye,
  Download
} from 'lucide-react';

interface LiveStatisticsDisplayProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
  isReferee?: boolean;
}

interface TeamStatistics {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  fouls: number;
  shots: number;
  shotsOnTarget: number;
  saves: number;
  offsides: number;
  throwIns: number;
  freeKicks: number;
  penalties: number;
  possession: number;
  passes: number;
  passAccuracy: number;
}

interface PlayerPerformance {
  playerId: string;
  playerName: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  shots: number;
  passes: number;
  tackles: number;
  saves: number;
}

export default function LiveStatisticsDisplay({ 
  matchId, 
  homeTeam, 
  awayTeam, 
  homeTeamId, 
  awayTeamId, 
  isReferee = false 
}: LiveStatisticsDisplayProps) {
  const {
    isConnected,
    subscribeToMatchEvents,
    subscribeToMatchState
  } = useWebSocketContext();

  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPerformance | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'first_half' | 'second_half'>('all');

  // Subscribe to match events and state
  useEffect(() => {
    if (isConnected && matchId) {
      const unsubscribeEvents = subscribeToMatchEvents(matchId, (event) => {
        setEvents(prev => [...prev, event]);
      });

      const unsubscribeState = subscribeToMatchState(matchId, (state) => {
        setMatchState(state);
      });

      return () => {
        unsubscribeEvents();
        unsubscribeState();
      };
    }
  }, [isConnected, matchId, subscribeToMatchEvents, subscribeToMatchState]);

  // Calculate team statistics
  const teamStats = useMemo(() => {
    const homeEvents = events.filter(e => e.teamId === homeTeamId);
    const awayEvents = events.filter(e => e.teamId === awayTeamId);

    const calculateTeamStats = (teamEvents: MatchEvent[]): TeamStatistics => {
      const goals = teamEvents.filter(e => e.type === 'goal').length;
      const assists = teamEvents.filter(e => e.type === 'assist').length;
      const yellowCards = teamEvents.filter(e => e.type === 'yellow_card').length;
      const redCards = teamEvents.filter(e => e.type === 'red_card').length;
      const corners = teamEvents.filter(e => e.type === 'corner').length;
      const fouls = teamEvents.filter(e => e.type === 'foul').length;
      const shots = teamEvents.filter(e => e.type === 'shot').length;
      const shotsOnTarget = teamEvents.filter(e => e.type === 'shot' && e.data?.onTarget).length;
      const saves = teamEvents.filter(e => e.type === 'save').length;
      const offsides = teamEvents.filter(e => e.type === 'offside').length;
      const throwIns = teamEvents.filter(e => e.type === 'throw_in').length;
      const freeKicks = teamEvents.filter(e => e.type === 'free_kick').length;
      const penalties = teamEvents.filter(e => e.type === 'penalty').length;

      // Calculate possession (simplified - based on time with ball)
      const totalTime = matchState?.currentMinute || 0;
      const possession = totalTime > 0 ? (shots + passes) / (totalTime * 2) * 100 : 50;
      
      // Calculate passes and accuracy
      const passes = teamEvents.filter(e => e.type === 'pass').length;
      const passAccuracy = passes > 0 ? Math.min(95, 70 + (goals * 5) + (assists * 3)) : 70;

      return {
        goals,
        assists,
        yellowCards,
        redCards,
        corners,
        fouls,
        shots,
        shotsOnTarget,
        saves,
        offsides,
        throwIns,
        freeKicks,
        penalties,
        possession: Math.min(100, Math.max(0, possession)),
        passes,
        passAccuracy: Math.min(100, Math.max(0, passAccuracy))
      };
    };

    return {
      home: calculateTeamStats(homeEvents),
      away: calculateTeamStats(awayEvents)
    };
  }, [events, homeTeamId, awayTeamId, matchState]);

  // Calculate player performance
  const playerPerformance = useMemo(() => {
    const playerMap = new Map<string, PlayerPerformance>();

    events.forEach(event => {
      if (event.playerId) {
        if (!playerMap.has(event.playerId)) {
          playerMap.set(event.playerId, {
            playerId: event.playerId,
            playerName: event.data?.playerName || `Player ${event.playerId.slice(0, 6)}`,
            teamId: event.teamId,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            shots: 0,
            passes: 0,
            tackles: 0,
            saves: 0
          });
        }

        const player = playerMap.get(event.playerId)!;
        
        switch (event.type) {
          case 'goal':
            player.goals++;
            break;
          case 'assist':
            player.assists++;
            break;
          case 'yellow_card':
            player.yellowCards++;
            break;
          case 'red_card':
            player.redCards++;
            break;
          case 'shot':
            player.shots++;
            break;
          case 'pass':
            player.passes++;
            break;
          case 'tackle':
            player.tackles++;
            break;
          case 'save':
            player.saves++;
            break;
        }
      }
    });

    // Calculate minutes played (simplified)
    const currentMinute = matchState?.currentMinute || 0;
    playerMap.forEach(player => {
      player.minutesPlayed = Math.min(currentMinute, 90);
    });

    return Array.from(playerMap.values());
  }, [events, matchState]);

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    if (timeRange === 'all') return events;
    
    const halfTime = 45;
    if (timeRange === 'first_half') {
      return events.filter(e => e.minute <= halfTime);
    } else {
      return events.filter(e => e.minute > halfTime);
    }
  }, [events, timeRange]);

  // Calculate match momentum
  const matchMomentum = useMemo(() => {
    if (events.length < 2) return 0;
    
    const recentEvents = events.slice(-5);
    let momentum = 0;
    
    recentEvents.forEach(event => {
      switch (event.type) {
        case 'goal':
          momentum += event.teamId === homeTeamId ? 10 : -10;
          break;
        case 'shot':
          momentum += event.teamId === homeTeamId ? 2 : -2;
          break;
        case 'corner':
          momentum += event.teamId === homeTeamId ? 1 : -1;
          break;
        case 'yellow_card':
          momentum += event.teamId === homeTeamId ? -1 : 1;
          break;
        case 'red_card':
          momentum += event.teamId === homeTeamId ? -3 : 3;
          break;
      }
    });
    
    return Math.max(-10, Math.min(10, momentum));
  }, [events, homeTeamId]);

  // Get momentum indicator
  const getMomentumIndicator = (momentum: number) => {
    if (momentum > 5) return { variant: 'success', text: 'Home Team Dominating' };
    if (momentum > 0) return { variant: 'info', text: 'Home Team Slight Edge' };
    if (momentum > -5) return { variant: 'warning', text: 'Away Team Slight Edge' };
    return { variant: 'danger', text: 'Away Team Dominating' };
  };

  const momentumInfo = getMomentumIndicator(matchMomentum);

  return (
    <div className="live-statistics-display">
      {/* Connection Status */}
      <Alert 
        variant={isConnected ? 'success' : 'warning'} 
        className="mb-3"
      >
        <div className="d-flex align-items-center">
          <Activity className="me-2" size={16} />
          <span>
            {isConnected ? 'Live Statistics Connected' : 'Statistics Disconnected'}
          </span>
        </div>
      </Alert>

      {/* Match Overview */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <BarChart3 className="me-2" />
              Match Statistics
            </h5>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowPlayerStats(true)}
              >
                <Users size={16} className="me-1" />
                Player Stats
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {/* Export functionality */}}
              >
                <Download size={16} className="me-1" />
                Export
              </Button>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="mb-3">
            <div className="btn-group" role="group">
              <Button
                variant={timeRange === 'all' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                Full Match
              </Button>
              <Button
                variant={timeRange === 'first_half' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setTimeRange('first_half')}
              >
                1st Half
              </Button>
              <Button
                variant={timeRange === 'second_half' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setTimeRange('second_half')}
              >
                2nd Half
              </Button>
            </div>
          </div>

          {/* Match Momentum */}
          <Row className="mb-3">
            <Col>
              <div className="text-center">
                <h6>Match Momentum</h6>
                <ProgressBar 
                  now={50 + (matchMomentum * 5)} 
                  variant={momentumInfo.variant}
                  className="mb-2"
                />
                <Badge bg={momentumInfo.variant}>
                  {momentumInfo.text}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Team Statistics Comparison */}
      <Row className="mb-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h6 className="text-center text-primary mb-3">{homeTeam}</h6>
              <TeamStatsCard stats={teamStats.home} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Body>
              <h6 className="text-center text-primary mb-3">{awayTeam}</h6>
              <TeamStatsCard stats={teamStats.away} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Statistics */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">
            <TrendingUp className="me-2" />
            Key Statistics
          </h6>
          
          <Row>
            <Col md={4}>
              <div className="text-center">
                <h4 className="text-success">{teamStats.home.goals}</h4>
                <small className="text-muted">Goals</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h4 className="text-info">{teamStats.home.shots}</h4>
                <small className="text-muted">Shots</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h4 className="text-warning">{teamStats.home.possession.toFixed(1)}%</h4>
                <small className="text-muted">Possession</small>
              </div>
            </Col>
          </Row>
          
          <Row className="mt-3">
            <Col md={4}>
              <div className="text-center">
                <h4 className="text-success">{teamStats.away.goals}</h4>
                <small className="text-muted">Goals</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h4 className="text-info">{teamStats.away.shots}</h4>
                <small className="text-muted">Shots</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h4 className="text-warning">{teamStats.away.possession.toFixed(1)}%</h4>
                <small className="text-muted">Possession</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Recent Events Timeline */}
      <Card>
        <Card.Body>
          <h6 className="mb-3">
            <Clock className="me-2" />
            Recent Events ({filteredEvents.length})
          </h6>
          
          {filteredEvents.length === 0 ? (
            <p className="text-muted text-center">No events in selected time range</p>
          ) : (
            <div className="events-timeline">
              {filteredEvents.slice(-10).reverse().map((event, index) => (
                <div key={index} className="event-timeline-item d-flex align-items-center p-2 border-bottom">
                  <div className="event-time me-3">
                    <Badge bg="light" text="dark">
                      {event.minute}'
                    </Badge>
                  </div>
                  <div className="event-icon me-2">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="event-details flex-grow-1">
                    <div className="event-description">
                      {event.description || `${event.type.replace('_', ' ')}`}
                    </div>
                    <small className="text-muted">
                      {event.teamId === homeTeamId ? homeTeam : awayTeam}
                      {event.playerId && ` • Player ${event.playerId.slice(0, 6)}`}
                    </small>
                  </div>
                  <Badge bg="light" text="dark">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Player Statistics Modal */}
      <Modal show={showPlayerStats} onHide={() => setShowPlayerStats(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Player Performance Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PlayerStatisticsTable 
            players={playerPerformance}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            onPlayerSelect={setSelectedPlayer}
          />
        </Modal.Body>
      </Modal>

      {/* Individual Player Details Modal */}
      <Modal show={!!selectedPlayer} onHide={() => setSelectedPlayer(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedPlayer?.playerName} - Performance Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlayer && (
            <PlayerDetails player={selectedPlayer} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

// Team Statistics Card Component
function TeamStatsCard({ stats }: { stats: TeamStatistics }) {
  return (
    <div>
      <Row className="mb-2">
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-success">{stats.goals}</h6>
            <small className="text-muted">Goals</small>
          </div>
        </Col>
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-info">{stats.assists}</h6>
            <small className="text-muted">Assists</small>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-2">
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-warning">{stats.yellowCards}</h6>
            <small className="text-muted">Yellow</small>
          </div>
        </Col>
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-danger">{stats.redCards}</h6>
            <small className="text-muted">Red</small>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-2">
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-primary">{stats.shots}</h6>
            <small className="text-muted">Shots</small>
          </div>
        </Col>
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-secondary">{stats.corners}</h6>
            <small className="text-muted">Corners</small>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-info">{stats.passes}</h6>
            <small className="text-muted">Passes</small>
          </div>
        </Col>
        <Col xs={6}>
          <div className="text-center">
            <h6 className="text-success">{stats.passAccuracy.toFixed(1)}%</h6>
            <small className="text-muted">Accuracy</small>
          </div>
        </Col>
      </Row>
      
      <div className="mt-3">
        <small className="text-muted">Possession</small>
        <ProgressBar 
          now={stats.possession} 
          variant="primary"
          className="mt-1"
        />
        <small className="text-muted">{stats.possession.toFixed(1)}%</small>
      </div>
    </div>
  );
}

// Player Statistics Table Component
function PlayerStatisticsTable({ 
  players, 
  homeTeam, 
  awayTeam, 
  onPlayerSelect 
}: {
  players: PlayerPerformance[];
  homeTeam: string;
  awayTeam: string;
  onPlayerSelect: (player: PlayerPerformance) => void;
}) {
  const homePlayers = players.filter(p => p.teamId === 'home');
  const awayPlayers = players.filter(p => p.teamId === 'away');

  return (
    <div>
      <Row>
        <Col md={6}>
          <h6 className="text-center text-primary mb-3">{homeTeam} Players</h6>
          <Table striped bordered size="sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Cards</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {homePlayers.map(player => (
                <tr key={player.playerId}>
                  <td>{player.playerName}</td>
                  <td className="text-center">{player.goals}</td>
                  <td className="text-center">{player.assists}</td>
                  <td className="text-center">
                    <Badge bg="warning" className="me-1">{player.yellowCards}</Badge>
                    <Badge bg="danger">{player.redCards}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onPlayerSelect(player)}
                    >
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        
        <Col md={6}>
          <h6 className="text-center text-primary mb-3">{awayTeam} Players</h6>
          <Table striped bordered size="sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Cards</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {awayPlayers.map(player => (
                <tr key={player.playerId}>
                  <td>{player.playerName}</td>
                  <td className="text-center">{player.goals}</td>
                  <td className="text-center">{player.assists}</td>
                  <td className="text-center">
                    <Badge bg="warning" className="me-1">{player.yellowCards}</Badge>
                    <Badge bg="danger">{player.redCards}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onPlayerSelect(player)}
                    >
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
}

// Player Details Component
function PlayerDetails({ player }: { player: PlayerPerformance }) {
  return (
    <div>
      <Row>
        <Col md={6}>
          <strong>Player Name:</strong>
          <p>{player.playerName}</p>
        </Col>
        <Col md={6}>
          <strong>Team:</strong>
          <p>{player.teamId === 'home' ? 'Home Team' : 'Away Team'}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <strong>Goals:</strong>
          <p className="text-success">{player.goals}</p>
        </Col>
        <Col md={6}>
          <strong>Assists:</strong>
          <p className="text-info">{player.assists}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <strong>Yellow Cards:</strong>
          <p className="text-warning">{player.yellowCards}</p>
        </Col>
        <Col md={6}>
          <strong>Red Cards:</strong>
          <p className="text-danger">{player.redCards}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <strong>Minutes Played:</strong>
          <p>{player.minutesPlayed}'</p>
        </Col>
        <Col md={6}>
          <strong>Shots:</strong>
          <p>{player.shots}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <strong>Passes:</strong>
          <p>{player.passes}</p>
        </Col>
        <Col md={6}>
          <strong>Tackles:</strong>
          <p>{player.tackles}</p>
        </Col>
      </Row>
      
      {player.saves > 0 && (
        <Row>
          <Col>
            <strong>Saves:</strong>
            <p className="text-success">{player.saves}</p>
          </Col>
        </Row>
      )}
    </div>
  );
}

// Helper function to get event icon
function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'goal':
      return <Target size={16} className="text-success" />;
    case 'assist':
      return <Users size={16} className="text-info" />;
    case 'yellow_card':
      return <Award size={16} className="text-warning" />;
    case 'red_card':
      return <Award size={16} className="text-danger" />;
    case 'substitution':
      return <Users size={16} className="text-primary" />;
    case 'injury':
      return <Award size={16} className="text-warning" />;
    case 'corner':
      return <Award size={16} className="text-info" />;
    case 'foul':
      return <Shield size={16} className="text-warning" />;
    case 'shot':
      return <Target size={16} className="text-primary" />;
    case 'save':
      return <Shield size={16} className="text-success" />;
    default:
      return <Award size={16} className="text-secondary" />;
  }
}
