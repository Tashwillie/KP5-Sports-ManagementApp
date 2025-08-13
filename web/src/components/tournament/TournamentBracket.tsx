'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { Card, Row, Col, Badge, Button, Modal, Form, Alert, ProgressBar } from 'react-bootstrap';
import { 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  Play, 
  Pause, 
  Square,
  Settings,
  BarChart3,
  Award,
  Target,
  Clock
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo?: string;
  seed?: number;
  clubId?: string;
}

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  round: number;
  matchNumber: number;
  scheduledTime?: Date;
  venue?: string;
  winnerId?: string;
  nextMatchId?: string;
  matchType: 'knockout' | 'group' | 'final';
}

interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: 'knockout' | 'round_robin' | 'group_stage' | 'custom';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  maxTeams: number;
  currentTeams: number;
  rounds: number;
  teams: Team[];
  matches: Match[];
  settings: {
    hasThirdPlace: boolean;
    hasSeeding: boolean;
    groupSize: number;
    knockoutRounds: number;
  };
}

interface TournamentBracketProps {
  tournament: Tournament;
  isAdmin?: boolean;
  onMatchUpdate?: (matchId: string, updates: any) => void;
  onTournamentUpdate?: (tournamentId: string, updates: any) => void;
}

export default function TournamentBracket({ 
  tournament, 
  isAdmin = false, 
  onMatchUpdate, 
  onTournamentUpdate 
}: TournamentBracketProps) {
  const {
    isConnected,
    joinTournament
  } = useWebSocketContext();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBracket, setShowBracket] = useState(true);
  const [showStandings, setShowStandings] = useState(false);
  const [viewMode, setViewMode] = useState<'bracket' | 'list' | 'calendar'>('bracket');

  // Join tournament room when component mounts
  useEffect(() => {
    if (isConnected && tournament.id) {
      joinTournament(tournament.id);
    }
  }, [isConnected, tournament.id, joinTournament]);

  // Generate bracket structure
  const bracketStructure = useMemo(() => {
    if (tournament.format === 'knockout') {
      return generateKnockoutBracket(tournament.matches, tournament.rounds);
    } else if (tournament.format === 'group_stage') {
      return generateGroupStageBracket(tournament.matches, tournament.teams, tournament.settings.groupSize);
    } else {
      return generateRoundRobinBracket(tournament.matches);
    }
  }, [tournament]);

  // Calculate tournament progress
  const tournamentProgress = useMemo(() => {
    const totalMatches = tournament.matches.length;
    const completedMatches = tournament.matches.filter(m => m.status === 'completed').length;
    const liveMatches = tournament.matches.filter(m => m.status === 'live').length;
    
    return {
      total: totalMatches,
      completed: completedMatches,
      live: liveMatches,
      percentage: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0
    };
  }, [tournament.matches]);

  // Handle match selection
  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  // Handle match update
  const handleMatchUpdate = (matchId: string, updates: any) => {
    if (onMatchUpdate) {
      onMatchUpdate(matchId, updates);
    }
  };

  // Get match status badge variant
  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'live': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Get team display name
  const getTeamDisplay = (teamId: string) => {
    const team = tournament.teams.find(t => t.id === teamId);
    return team ? team.name : `Team ${teamId.slice(0, 6)}`;
  };

  return (
    <div className="tournament-bracket">
      {/* Tournament Header */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">
                <Trophy className="me-2" />
                {tournament.name}
              </h4>
              <p className="text-muted mb-0">{tournament.description}</p>
            </div>
            <div className="d-flex gap-2">
              <Badge bg={tournament.status === 'active' ? 'success' : 'secondary'}>
                {tournament.status.toUpperCase()}
              </Badge>
              {isAdmin && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings size={16} className="me-1" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          {/* Tournament Info */}
          <Row className="mb-3">
            <Col md={3}>
              <div className="text-center">
                <Users size={24} className="text-primary mb-2" />
                <h6>{tournament.currentTeams}</h6>
                <small className="text-muted">Teams</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <Calendar size={24} className="text-info mb-2" />
                <h6>{tournament.rounds}</h6>
                <small className="text-muted">Rounds</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <Target size={24} className="text-success mb-2" />
                <h6>{tournament.matches.length}</h6>
                <small className="text-muted">Matches</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <Clock size={24} className="text-warning mb-2" />
                <h6>{tournamentProgress.live}</h6>
                <small className="text-muted">Live</small>
              </div>
            </Col>
          </Row>

          {/* Tournament Progress */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Tournament Progress</small>
              <small className="text-muted">
                {tournamentProgress.completed}/{tournamentProgress.total} matches
              </small>
            </div>
            <ProgressBar 
              now={tournamentProgress.percentage} 
              variant="success"
              className="mb-2"
            />
            <small className="text-muted">
              {tournamentProgress.percentage.toFixed(1)}% Complete
            </small>
          </div>

          {/* Tournament Dates */}
          <Row>
            <Col md={6}>
              <small className="text-muted">
                <Calendar size={12} className="me-1" />
                Start: {tournament.startDate.toLocaleDateString()}
              </small>
            </Col>
            <Col md={6}>
              <small className="text-muted">
                <Calendar size={12} className="me-1" />
                End: {tournament.endDate.toLocaleDateString()}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* View Mode Toggle */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group" role="group">
              <Button
                variant={viewMode === 'bracket' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setViewMode('bracket')}
              >
                <BarChart3 size={16} className="me-1" />
                Bracket
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Award size={16} className="me-1" />
                List View
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar size={16} className="me-1" />
                Calendar
              </Button>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => setShowStandings(true)}
              >
                <BarChart3 size={16} className="me-1" />
                Standings
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Bracket Display */}
      {viewMode === 'bracket' && (
        <div className="bracket-container">
          {tournament.format === 'knockout' && (
            <KnockoutBracket 
              bracket={bracketStructure}
              onMatchSelect={handleMatchSelect}
              getTeamDisplay={getTeamDisplay}
              getMatchStatusBadge={getMatchStatusBadge}
            />
          )}
          
          {tournament.format === 'group_stage' && (
            <GroupStageBracket 
              bracket={bracketStructure}
              onMatchSelect={handleMatchSelect}
              getTeamDisplay={getTeamDisplay}
              getMatchStatusBadge={getMatchStatusBadge}
            />
          )}
          
          {tournament.format === 'round_robin' && (
            <RoundRobinBracket 
              bracket={bracketStructure}
              onMatchSelect={handleMatchSelect}
              getTeamDisplay={getTeamDisplay}
              getMatchStatusBadge={getMatchStatusBadge}
            />
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <MatchListView 
          matches={tournament.matches}
          onMatchSelect={handleMatchSelect}
          getTeamDisplay={getTeamDisplay}
          getMatchStatusBadge={getMatchStatusBadge}
        />
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <MatchCalendarView 
          matches={tournament.matches}
          onMatchSelect={handleMatchSelect}
          getTeamDisplay={getTeamDisplay}
          getMatchStatusBadge={getMatchStatusBadge}
        />
      )}

      {/* Match Details Modal */}
      <Modal show={showMatchModal} onHide={() => setShowMatchModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Match Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMatch && (
            <MatchDetails 
              match={selectedMatch}
              onUpdate={handleMatchUpdate}
              isAdmin={isAdmin}
              getTeamDisplay={getTeamDisplay}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Tournament Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tournament Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TournamentSettings 
            tournament={tournament}
            onUpdate={onTournamentUpdate}
          />
        </Modal.Body>
      </Modal>

      {/* Standings Modal */}
      <Modal show={showStandings} onHide={() => setShowStandings(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Tournament Standings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TournamentStandings 
            tournament={tournament}
            matches={tournament.matches}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

// Knockout Bracket Component
function KnockoutBracket({ 
  bracket, 
  onMatchSelect, 
  getTeamDisplay, 
  getMatchStatusBadge 
}: {
  bracket: any;
  onMatchSelect: (match: Match) => void;
  getTeamDisplay: (teamId: string) => string;
  getMatchStatusBadge: (status: string) => string;
}) {
  return (
    <div className="knockout-bracket">
      {bracket.rounds.map((round: any, roundIndex: number) => (
        <div key={roundIndex} className="bracket-round">
          <h6 className="text-center mb-3">Round {roundIndex + 1}</h6>
          <div className="bracket-matches">
            {round.matches.map((match: Match, matchIndex: number) => (
              <div key={match.id} className="bracket-match">
                <MatchCard 
                  match={match}
                  onClick={() => onMatchSelect(match)}
                  getTeamDisplay={getTeamDisplay}
                  getMatchStatusBadge={getMatchStatusBadge}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Group Stage Bracket Component
function GroupStageBracket({ 
  bracket, 
  onMatchSelect, 
  getTeamDisplay, 
  getMatchStatusBadge 
}: {
  bracket: any;
  onMatchSelect: (match: Match) => void;
  getTeamDisplay: (teamId: string) => string;
  getMatchStatusBadge: (status: string) => string;
}) {
  return (
    <div className="group-stage-bracket">
      {bracket.groups.map((group: any, groupIndex: number) => (
        <div key={groupIndex} className="group-container mb-4">
          <h6 className="text-center mb-3">Group {String.fromCharCode(65 + groupIndex)}</h6>
          <div className="group-matches">
            {group.matches.map((match: Match) => (
              <div key={match.id} className="group-match">
                <MatchCard 
                  match={match}
                  onClick={() => onMatchSelect(match)}
                  getTeamDisplay={getTeamDisplay}
                  getMatchStatusBadge={getMatchStatusBadge}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Round Robin Bracket Component
function RoundRobinBracket({ 
  bracket, 
  onMatchSelect, 
  getTeamDisplay, 
  getMatchStatusBadge 
}: {
  bracket: any;
  onMatchSelect: (match: Match) => void;
  getTeamDisplay: (teamId: string) => string;
  getMatchStatusBadge: (status: string) => string;
}) {
  return (
    <div className="round-robin-bracket">
      {bracket.rounds.map((round: any, roundIndex: number) => (
        <div key={roundIndex} className="round-container mb-4">
          <h6 className="text-center mb-3">Round {roundIndex + 1}</h6>
          <div className="round-matches">
            {round.matches.map((match: Match) => (
              <div key={match.id} className="round-match">
                <MatchCard 
                  match={match}
                  onClick={() => onMatchSelect(match)}
                  getTeamDisplay={getTeamDisplay}
                  getMatchStatusBadge={getMatchStatusBadge}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Match List View Component
function MatchListView({ 
  matches, 
  onMatchSelect, 
  getTeamDisplay, 
  getMatchStatusBadge 
}: {
  matches: Match[];
  onMatchSelect: (match: Match) => void;
  getTeamDisplay: (teamId: string) => string;
  getMatchStatusBadge: (status: string) => string;
}) {
  const sortedMatches = [...matches].sort((a, b) => a.round - b.round || a.matchNumber - b.matchNumber);

  return (
    <div className="match-list-view">
      {sortedMatches.map(match => (
        <div key={match.id} className="mb-2">
          <MatchCard 
            match={match}
            onClick={() => onMatchSelect(match)}
            getTeamDisplay={getTeamDisplay}
            getMatchStatusBadge={getMatchStatusBadge}
          />
        </div>
      ))}
    </div>
  );
}

// Match Calendar View Component
function MatchCalendarView({ 
  matches, 
  onMatchSelect, 
  getTeamDisplay, 
  getMatchStatusBadge 
}: {
  matches: Match[];
  onMatchSelect: (match: Match) => void;
  getTeamDisplay: (teamId: string) => string;
  getMatchStatusBadge: (status: string) => string;
}) {
  const matchesByDate = matches.reduce((acc, match) => {
    if (match.scheduledTime) {
      const date = match.scheduledTime.toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(match);
    }
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="match-calendar-view">
      {Object.entries(matchesByDate).map(([date, dayMatches]) => (
        <div key={date} className="date-group mb-4">
          <h6 className="text-center mb-3">{new Date(date).toLocaleDateString()}</h6>
          {dayMatches.map(match => (
            <div key={match.id} className="mb-2">
              <MatchCard 
                match={match}
                onClick={() => onMatchSelect(match)}
                getTeamDisplay={getTeamDisplay}
                getMatchStatusBadge={getMatchStatusBadge}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Match Card Component
function MatchCard({ 
  match, 
  onClick, 
  getTeamDisplay, 
  getMatchStatusBadge 
}: {
  match: Match;
  onClick: () => void;
  getTeamDisplay: (teamId: string) => string;
  getMatchStatusBadge: (status: string) => string;
}) {
  return (
    <Card 
      className="match-card cursor-pointer" 
      onClick={onClick}
      style={{ minWidth: '200px' }}
    >
      <Card.Body className="p-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Round {match.round}</small>
          <Badge bg={getMatchStatusBadge(match.status)}>
            {match.status}
          </Badge>
        </div>
        
        <div className="match-teams">
          <div className="team home-team mb-1">
            <span className="team-name">{getTeamDisplay(match.homeTeamId)}</span>
            <span className="team-score ms-2">{match.homeScore || 0}</span>
          </div>
          <div className="team away-team">
            <span className="team-name">{getTeamDisplay(match.awayTeamId)}</span>
            <span className="team-score ms-2">{match.awayScore || 0}</span>
          </div>
        </div>
        
        {match.scheduledTime && (
          <div className="text-center mt-2">
            <small className="text-muted">
              {match.scheduledTime.toLocaleTimeString()}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

// Match Details Component
function MatchDetails({ 
  match, 
  onUpdate, 
  isAdmin, 
  getTeamDisplay 
}: {
  match: Match;
  onUpdate: (matchId: string, updates: any) => void;
  isAdmin: boolean;
  getTeamDisplay: (teamId: string) => string;
}) {
  const [score, setScore] = useState({
    home: match.homeScore || 0,
    away: match.awayScore || 0
  });
  const [status, setStatus] = useState(match.status);

  const handleScoreUpdate = () => {
    onUpdate(match.id, {
      homeScore: score.home,
      awayScore: score.away,
      status: status
    });
  };

  const handleStatusUpdate = (newStatus: 'scheduled' | 'live' | 'completed' | 'cancelled') => {
    setStatus(newStatus);
    onUpdate(match.id, { status: newStatus });
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <h6>Home Team</h6>
          <p>{getTeamDisplay(match.homeTeamId)}</p>
        </Col>
        <Col md={6}>
          <h6>Away Team</h6>
          <p>{getTeamDisplay(match.awayTeamId)}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <h6>Round</h6>
          <p>{match.round}</p>
        </Col>
        <Col md={6}>
          <h6>Match Number</h6>
          <p>{match.matchNumber}</p>
        </Col>
      </Row>
      
      {isAdmin && (
        <>
          <hr />
          <h6>Update Match</h6>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Home Score</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={score.home}
                  onChange={(e) => setScore(prev => ({ ...prev, home: parseInt(e.target.value) || 0 }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Away Score</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={score.away}
                  onChange={(e) => setScore(prev => ({ ...prev, away: parseInt(e.target.value) || 0 }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                                 <Form.Select
                   value={status}
                   onChange={(e) => setStatus(e.target.value as 'scheduled' | 'live' | 'completed' | 'cancelled')}
                 >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex gap-2 mt-3">
            <Button variant="primary" onClick={handleScoreUpdate}>
              Update Score
            </Button>
            <Button 
              variant={status === 'live' ? 'warning' : 'success'}
              onClick={() => handleStatusUpdate(status === 'live' ? 'completed' : 'live')}
            >
              {status === 'live' ? 'End Match' : 'Start Match'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Tournament Settings Component
function TournamentSettings({ 
  tournament, 
  onUpdate 
}: {
  tournament: Tournament;
  onUpdate?: (tournamentId: string, updates: any) => void;
}) {
  const [settings, setSettings] = useState(tournament.settings);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(tournament.id, { settings });
    }
  };

  return (
    <div>
      <h6>Tournament Format</h6>
      <p className="text-muted">{tournament.format.replace('_', ' ')}</p>
      
      <h6>Settings</h6>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Third Place Match"
              checked={settings.hasThirdPlace}
              onChange={(e) => handleSettingChange('hasThirdPlace', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Team Seeding"
              checked={settings.hasSeeding}
              onChange={(e) => handleSettingChange('hasSeeding', e.target.checked)}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Group Size</Form.Label>
            <Form.Control
              type="number"
              min="2"
              max="8"
              value={settings.groupSize}
              onChange={(e) => handleSettingChange('groupSize', parseInt(e.target.value) || 4)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Knockout Rounds</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="6"
              value={settings.knockoutRounds}
              onChange={(e) => handleSettingChange('knockoutRounds', parseInt(e.target.value) || 1)}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Button variant="primary" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  );
}

// Tournament Standings Component
function TournamentStandings({ 
  tournament, 
  matches 
}: {
  tournament: Tournament;
  matches: Match[];
}) {
  const standings = useMemo(() => {
    const teamStats = new Map<string, {
      teamId: string;
      teamName: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }>();

    // Initialize team stats
    tournament.teams.forEach(team => {
      teamStats.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      });
    });

    // Calculate stats from matches
    matches.forEach(match => {
      if (match.status === 'completed' && match.homeScore !== undefined && match.awayScore !== undefined) {
        const homeStats = teamStats.get(match.homeTeamId)!;
        const awayStats = teamStats.get(match.awayTeamId)!;

        homeStats.played++;
        awayStats.played++;
        homeStats.goalsFor += match.homeScore;
        homeStats.goalsAgainst += match.awayScore;
        awayStats.goalsFor += match.awayScore;
        awayStats.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
          homeStats.won++;
          awayStats.lost++;
          homeStats.points += 3;
        } else if (match.homeScore < match.awayScore) {
          awayStats.won++;
          homeStats.lost++;
          awayStats.points += 3;
        } else {
          homeStats.drawn++;
          awayStats.drawn++;
          homeStats.points += 1;
          awayStats.points += 1;
        }
      }
    });

    return Array.from(teamStats.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if ((b.goalsFor - b.goalsAgainst) !== (a.goalsFor - a.goalsAgainst)) {
        return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      }
      return b.goalsFor - a.goalsFor;
    });
  }, [tournament.teams, matches]);

  return (
    <div>
      <h6 className="mb-3">Tournament Standings</h6>
      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.teamId}>
                <td>{index + 1}</td>
                <td>{team.teamName}</td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.drawn}</td>
                <td>{team.lost}</td>
                <td>{team.goalsFor}</td>
                <td>{team.goalsAgainst}</td>
                <td>{team.goalsFor - team.goalsAgainst}</td>
                <td><strong>{team.points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper functions for bracket generation
function generateKnockoutBracket(matches: Match[], rounds: number) {
  const bracket = { rounds: [] as any[] };
  
  for (let i = 0; i < rounds; i++) {
    const roundMatches = matches.filter(m => m.round === i + 1);
    bracket.rounds.push({ matches: roundMatches });
  }
  
  return bracket;
}

function generateGroupStageBracket(matches: Match[], teams: Team[], groupSize: number) {
  const groups = [];
  const numGroups = Math.ceil(teams.length / groupSize);
  
  for (let i = 0; i < numGroups; i++) {
    const groupTeams = teams.slice(i * groupSize, (i + 1) * groupSize);
    const groupMatches = matches.filter(m => 
      groupTeams.some(t => t.id === m.homeTeamId || t.id === m.awayTeamId)
    );
    groups.push({ teams: groupTeams, matches: groupMatches });
  }
  
  return { groups };
}

function generateRoundRobinBracket(matches: Match[]) {
  const rounds = [];
  const maxRound = Math.max(...matches.map(m => m.round));
  
  for (let i = 1; i <= maxRound; i++) {
    const roundMatches = matches.filter(m => m.round === i);
    rounds.push({ matches: roundMatches });
  }
  
  return { rounds };
}