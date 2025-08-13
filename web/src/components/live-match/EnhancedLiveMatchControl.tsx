import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { MatchEvent, EventEntryFormData, MatchState } from '@/lib/services/websocketService';
import { Button, Card, Badge, Form, Row, Col, Alert, Modal, Table, ProgressBar } from 'react-bootstrap';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target, 
  Users, 
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Flag,
  Shield,
  Zap,
  BarChart3,
  Settings,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

interface EnhancedLiveMatchControlProps {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: string;
    currentMinute?: number;
    venue?: string;
    date?: string;
    homeTeamId?: string;
    awayTeamId?: string;
  };
  isReferee?: boolean;
  onMatchUpdate?: (matchId: string, updates: any) => void;
}

export default function EnhancedLiveMatchControl({ 
  match, 
  isReferee = false, 
  onMatchUpdate 
}: EnhancedLiveMatchControlProps) {
  const {
    isConnected,
    connectionStatus,
    joinMatch,
    leaveMatch,
    submitMatchEvent,
    startEventEntry,
    endEventEntry,
    controlMatchTimer,
    changeMatchStatus,
    subscribeToMatchEvents,
    subscribeToMatchState,
    error: wsError
  } = useWebSocketContext();

  const [matchState, setMatchState] = useState<MatchState>({
    matchId: match.id,
    status: match.status,
    currentMinute: match.currentMinute || 0,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    events: [],
    lastEventTime: new Date(),
    isTimerRunning: false,
    currentPeriod: 'first_half',
    injuryTime: 0,
    totalPlayTime: 0,
    pausedTime: 0,
    periodDuration: 45
  });

  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isEventEntryActive, setIsEventEntryActive] = useState(false);
  const [eventEntrySessionId, setEventEntrySessionId] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  const [eventForm, setEventForm] = useState<Partial<EventEntryFormData>>({
    matchId: match.id,
    eventType: 'goal',
    minute: 0,
    teamId: '',
    description: ''
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [localTimer, setLocalTimer] = useState(0);

  // Join match room when component mounts
  useEffect(() => {
    if (isConnected && match.id) {
      const role = isReferee ? 'REFEREE' : 'SPECTATOR';
      joinMatch(match.id, role);
      
      // Subscribe to match events
      const unsubscribeEvents = subscribeToMatchEvents(match.id, (event) => {
        setEvents(prev => [...prev, event]);
        
        // Update match state based on event type
        if (event.type === 'goal') {
          setMatchState(prev => ({
            ...prev,
            homeScore: event.teamId === match.homeTeamId ? prev.homeScore + 1 : prev.homeScore,
            awayScore: event.teamId === match.awayTeamId ? prev.awayScore + 1 : prev.awayScore
          }));
        }
      });

      // Subscribe to match state updates
      const unsubscribeState = subscribeToMatchState(match.id, (state) => {
        setMatchState(state);
        setLocalTimer(state.currentMinute);
      });

      return () => {
        unsubscribeEvents();
        unsubscribeState();
        leaveMatch(match.id);
      };
    }
  }, [isConnected, match.id, isReferee, joinMatch, leaveMatch, subscribeToMatchEvents, subscribeToMatchState]);

  // Local timer for smooth updates
  useEffect(() => {
    if (matchState.isTimerRunning) {
      timerRef.current = setInterval(() => {
        setLocalTimer(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [matchState.isTimerRunning]);

  // Handle timer control
  const handleTimerControl = useCallback((action: 'start' | 'pause' | 'resume' | 'stop') => {
    if (!isConnected) return;
    
    controlMatchTimer(match.id, action);
    
    // Update local state immediately for better UX
    setMatchState(prev => ({
      ...prev,
      isTimerRunning: action === 'start' || action === 'resume'
    }));
  }, [isConnected, match.id, controlMatchTimer]);

  // Handle match status change
  const handleStatusChange = useCallback((newStatus: string) => {
    if (!isConnected) return;
    
    changeMatchStatus(match.id, newStatus);
    
    // Update local state immediately
    setMatchState(prev => ({
      ...prev,
      status: newStatus
    }));
    
    if (onMatchUpdate) {
      onMatchUpdate(match.id, { status: newStatus });
    }
  }, [isConnected, match.id, changeMatchStatus, onMatchUpdate]);

  // Start event entry session
  const handleStartEventEntry = useCallback(() => {
    if (!isConnected) return;
    
    startEventEntry(match.id);
    setIsEventEntryActive(true);
    setShowEventForm(true);
  }, [isConnected, match.id, startEventEntry]);

  // End event entry session
  const handleEndEventEntry = useCallback(() => {
    if (!isConnected || !eventEntrySessionId) return;
    
    endEventEntry(eventEntrySessionId);
    setIsEventEntryActive(false);
    setEventEntrySessionId(null);
    setShowEventForm(false);
  }, [isConnected, eventEntrySessionId, endEventEntry]);

  // Submit match event
  const handleSubmitEvent = useCallback((eventData: EventEntryFormData) => {
    if (!isConnected) return;
    
    submitMatchEvent(eventData);
    
    // Reset form
    setEventForm({
      matchId: match.id,
      eventType: 'goal',
      minute: 0,
      teamId: '',
      description: ''
    });
    
    setShowEventForm(false);
  }, [isConnected, match.id, submitMatchEvent]);

  // Handle form input changes
  const handleFormChange = (field: keyof EventEntryFormData, value: any) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Quick event buttons
  const handleQuickEvent = (eventType: MatchEvent['type'], teamId: string) => {
    const quickEvent: EventEntryFormData = {
      matchId: match.id,
      eventType,
      minute: Math.floor(localTimer),
      teamId,
      description: `${eventType.replace('_', ' ')} for ${teamId === match.homeTeamId ? match.homeTeam : match.awayTeam}`
    };
    
    handleSubmitEvent(quickEvent);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'secondary';
      case 'live': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Get period display text
  const getPeriodDisplay = () => {
    switch (matchState.currentPeriod) {
      case 'first_half': return '1st Half';
      case 'halftime': return 'Halftime';
      case 'second_half': return '2nd Half';
      case 'extra_time': return 'Extra Time';
      case 'penalties': return 'Penalties';
      default: return 'Unknown';
    }
  };

  // Format time display
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate match statistics
  const getMatchStatistics = () => {
    const homeEvents = events.filter(e => e.teamId === match.homeTeamId);
    const awayEvents = events.filter(e => e.teamId === match.awayTeamId);
    
    return {
      home: {
        goals: homeEvents.filter(e => e.type === 'goal').length,
        yellowCards: homeEvents.filter(e => e.type === 'yellow_card').length,
        redCards: homeEvents.filter(e => e.type === 'red_card').length,
        corners: homeEvents.filter(e => e.type === 'corner').length,
        fouls: homeEvents.filter(e => e.type === 'foul').length,
        shots: homeEvents.filter(e => e.type === 'shot').length
      },
      away: {
        goals: awayEvents.filter(e => e.type === 'goal').length,
        yellowCards: awayEvents.filter(e => e.type === 'yellow_card').length,
        redCards: awayEvents.filter(e => e.type === 'red_card').length,
        corners: awayEvents.filter(e => e.type === 'corner').length,
        fouls: awayEvents.filter(e => e.type === 'foul').length,
        shots: awayEvents.filter(e => e.type === 'shot').length
      }
    };
  };

  const stats = getMatchStatistics();

  return (
    <div className="enhanced-live-match-control">
      {/* Connection Status */}
      <Alert 
        variant={isConnected ? 'success' : 'warning'} 
        className="mb-3"
      >
        <div className="d-flex align-items-center">
          <div className={`connection-indicator me-2 ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>
            {isConnected ? 'Connected to Live Match' : 'Disconnected'}
          </span>
          {wsError && (
            <Badge bg="danger" className="ms-auto">
              {wsError}
            </Badge>
          )}
        </div>
      </Alert>

      {/* Match Header */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Live Match Control</h4>
            <div className="d-flex gap-2">
              <Badge bg={getStatusBadgeVariant(matchState.status)}>
                {matchState.status.toUpperCase()}
              </Badge>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowStatistics(true)}
              >
                <BarChart3 size={16} className="me-1" />
                Stats
              </Button>
              {isReferee && (
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
          
          <Row className="text-center">
            <Col>
              <h5>{match.homeTeam}</h5>
              <h2 className="text-primary">{matchState.homeScore}</h2>
            </Col>
            <Col className="d-flex flex-column justify-content-center">
              <div className="vs-divider">VS</div>
              <div className="match-info">
                <small className="text-muted">
                  <MapPin size={12} className="me-1" />
                  {match.venue}
                </small>
                <br />
                <small className="text-muted">
                  <Calendar size={12} className="me-1" />
                  {match.date}
                </small>
              </div>
            </Col>
            <Col>
              <h5>{match.awayTeam}</h5>
              <h2 className="text-primary">{matchState.awayScore}</h2>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Enhanced Timer and Controls */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              <Timer className="me-2" />
              Match Timer
            </h6>
            <Badge bg="info">{getPeriodDisplay()}</Badge>
          </div>
          
          <div className="text-center mb-3">
            <div className="match-timer">
              <Clock className="me-2" size={24} />
              <span className="timer-display h2">
                {formatTime(localTimer)}
              </span>
              {matchState.injuryTime > 0 && (
                <span className="injury-time ms-2 text-warning">
                  +{matchState.injuryTime}'
                </span>
              )}
            </div>
            
            {/* Progress bar for period */}
            <ProgressBar 
              now={(localTimer / matchState.periodDuration) * 100} 
              className="mt-2"
              variant="info"
            />
          </div>

          {isReferee && (
            <div className="d-flex justify-content-center gap-2 mb-3">
              <Button
                variant={matchState.isTimerRunning ? 'warning' : 'success'}
                size="lg"
                onClick={() => handleTimerControl(matchState.isTimerRunning ? 'pause' : 'start')}
                disabled={!isConnected}
              >
                {matchState.isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                {matchState.isTimerRunning ? 'Pause' : 'Start'}
              </Button>
              
              {matchState.isTimerRunning && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleTimerControl('resume')}
                  disabled={!isConnected}
                >
                  Resume
                </Button>
              )}
              
              <Button
                variant="danger"
                size="lg"
                onClick={() => handleTimerControl('stop')}
                disabled={!isConnected}
              >
                <Square size={20} />
                Stop
              </Button>
            </div>
          )}

          {isReferee && (
            <div className="d-flex justify-content-center gap-2">
              <Button
                variant="outline-primary"
                onClick={() => handleStatusChange('live')}
                disabled={!isConnected || matchState.status === 'live'}
              >
                Start Match
              </Button>
              
              <Button
                variant="outline-warning"
                onClick={() => handleStatusChange('paused')}
                disabled={!isConnected || matchState.status !== 'live'}
              >
                Pause Match
              </Button>
              
              <Button
                variant="outline-success"
                onClick={() => handleStatusChange('completed')}
                disabled={!isConnected || matchState.status === 'completed'}
              >
                End Match
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Quick Event Entry */}
      {isReferee && (
        <Card className="mb-3">
          <Card.Body>
            <h6 className="mb-3">
              <Zap className="me-2" />
              Quick Event Entry
            </h6>
            
            <Row className="mb-3">
              <Col>
                <h6 className="text-center text-primary">{match.homeTeam}</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleQuickEvent('goal', match.homeTeamId || 'home')}
                    disabled={!isConnected}
                  >
                    <Target size={16} className="me-1" />
                    Goal
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleQuickEvent('yellow_card', match.homeTeamId || 'home')}
                    disabled={!isConnected}
                  >
                    <AlertTriangle size={16} className="me-1" />
                    Yellow Card
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleQuickEvent('red_card', match.homeTeamId || 'home')}
                    disabled={!isConnected}
                  >
                    <XCircle size={16} className="me-1" />
                    Red Card
                  </Button>
                </div>
              </Col>
              
              <Col>
                <h6 className="text-center text-primary">{match.awayTeam}</h6>
                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleQuickEvent('goal', match.awayTeamId || 'away')}
                    disabled={!isConnected}
                  >
                    <Target size={16} className="me-1" />
                    Goal
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleQuickEvent('yellow_card', match.awayTeamId || 'away')}
                    disabled={!isConnected}
                  >
                    <AlertTriangle size={16} className="me-1" />
                    Yellow Card
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleQuickEvent('red_card', match.awayTeamId || 'away')}
                    disabled={!isConnected}
                  >
                    <XCircle size={16} className="me-1" />
                    Red Card
                  </Button>
                </div>
              </Col>
            </Row>
            
            <div className="text-center">
              <Button
                variant="outline-primary"
                onClick={handleStartEventEntry}
                disabled={!isConnected}
              >
                <Target size={16} className="me-2" />
                Advanced Event Entry
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Live Events */}
      <Card>
        <Card.Body>
          <h6 className="mb-3">
            <Award size={16} className="me-2" />
            Live Events
          </h6>
          
          {events.length === 0 ? (
            <p className="text-muted text-center">No events recorded yet</p>
          ) : (
            <div className="events-list">
              {events.map((event, index) => (
                <div 
                  key={index} 
                  className="event-item d-flex align-items-center p-2 border-bottom cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="event-icon me-2">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="event-details flex-grow-1">
                    <div className="event-description">
                      {event.description || `${event.type.replace('_', ' ')}`}
                    </div>
                    <small className="text-muted">
                      Minute {event.minute} • {event.teamId === match.homeTeamId ? match.homeTeam : match.awayTeam}
                    </small>
                  </div>
                  <Badge bg="light" text="dark" className="ms-2">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Event Entry Form Modal */}
      <Modal show={showEventForm} onHide={() => setShowEventForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Advanced Event Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EventEntryForm
            form={eventForm}
            onChange={handleFormChange}
            onSubmit={handleSubmitEvent}
            disabled={!isConnected}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeTeamId={match.homeTeamId}
            awayTeamId={match.awayTeamId}
          />
        </Modal.Body>
      </Modal>

      {/* Statistics Modal */}
      <Modal show={showStatistics} onHide={() => setShowStatistics(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Match Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MatchStatistics 
            stats={stats}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            events={events}
          />
        </Modal.Body>
      </Modal>

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Match Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MatchSettings 
            matchState={matchState}
            onStatusChange={handleStatusChange}
            onTimerControl={handleTimerControl}
            isConnected={isConnected}
          />
        </Modal.Body>
      </Modal>

      {/* Event Details Modal */}
      <Modal show={!!selectedEvent} onHide={() => setSelectedEvent(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <EventDetails event={selectedEvent} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

// Enhanced Event Entry Form Component
function EventEntryForm({ 
  form, 
  onChange, 
  onSubmit, 
  disabled,
  homeTeam,
  awayTeam,
  homeTeamId,
  awayTeamId
}: {
  form: Partial<EventEntryFormData>;
  onChange: (field: keyof EventEntryFormData, value: any) => void;
  onSubmit: (data: EventEntryFormData) => void;
  disabled: boolean;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.matchId && form.eventType && form.minute !== undefined && form.teamId) {
      onSubmit(form as EventEntryFormData);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Event Type</Form.Label>
            <Form.Select
              value={form.eventType || ''}
              onChange={(e) => onChange('eventType', e.target.value)}
              disabled={disabled}
            >
              <option value="goal">Goal</option>
              <option value="assist">Assist</option>
              <option value="yellow_card">Yellow Card</option>
              <option value="red_card">Red Card</option>
              <option value="substitution">Substitution</option>
              <option value="injury">Injury</option>
              <option value="corner">Corner</option>
              <option value="foul">Foul</option>
              <option value="shot">Shot</option>
              <option value="save">Save</option>
              <option value="offside">Offside</option>
              <option value="throw_in">Throw In</option>
              <option value="free_kick">Free Kick</option>
              <option value="penalty">Penalty</option>
              <option value="penalty_missed">Penalty Missed</option>
              <option value="own_goal">Own Goal</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Minute</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="120"
              value={form.minute || ''}
              onChange={(e) => onChange('minute', parseInt(e.target.value) || 0)}
              disabled={disabled}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Team</Form.Label>
            <Form.Select
              value={form.teamId || ''}
              onChange={(e) => onChange('teamId', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select Team</option>
              <option value={homeTeamId}>{homeTeam}</option>
              <option value={awayTeamId}>{awayTeam}</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={form.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              disabled={disabled}
              placeholder="Optional description"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Button 
        type="submit" 
        variant="primary" 
        disabled={disabled || !form.matchId || !form.eventType || form.minute === undefined || !form.teamId}
      >
        <CheckCircle size={16} className="me-2" />
        Record Event
      </Button>
    </Form>
  );
}

// Match Statistics Component
function MatchStatistics({ 
  stats, 
  homeTeam, 
  awayTeam, 
  events 
}: {
  stats: any;
  homeTeam: string;
  awayTeam: string;
  events: MatchEvent[];
}) {
  return (
    <div>
      <Row className="mb-3">
        <Col>
          <h6 className="text-center text-primary">{homeTeam}</h6>
          <Table striped bordered size="sm">
            <tbody>
              <tr><td>Goals</td><td className="text-center">{stats.home.goals}</td></tr>
              <tr><td>Yellow Cards</td><td className="text-center">{stats.home.yellowCards}</td></tr>
              <tr><td>Red Cards</td><td className="text-center">{stats.home.redCards}</td></tr>
              <tr><td>Corners</td><td className="text-center">{stats.home.corners}</td></tr>
              <tr><td>Fouls</td><td className="text-center">{stats.home.fouls}</td></tr>
              <tr><td>Shots</td><td className="text-center">{stats.home.shots}</td></tr>
            </tbody>
          </Table>
        </Col>
        
        <Col>
          <h6 className="text-center text-primary">{awayTeam}</h6>
          <Table striped bordered size="sm">
            <tbody>
              <tr><td>Goals</td><td className="text-center">{stats.away.goals}</td></tr>
              <tr><td>Yellow Cards</td><td className="text-center">{stats.away.yellowCards}</td></tr>
              <tr><td>Red Cards</td><td className="text-center">{stats.away.redCards}</td></tr>
              <tr><td>Corners</td><td className="text-center">{stats.away.corners}</td></tr>
              <tr><td>Fouls</td><td className="text-center">{stats.away.fouls}</td></tr>
              <tr><td>Shots</td><td className="text-center">{stats.away.shots}</td></tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      
      <div className="text-center">
        <small className="text-muted">
          Total Events: {events.length} • Last Updated: {new Date().toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
}

// Match Settings Component
function MatchSettings({ 
  matchState, 
  onStatusChange, 
  onTimerControl, 
  isConnected 
}: {
  matchState: MatchState;
  onStatusChange: (status: string) => void;
  onTimerControl: (action: 'start' | 'pause' | 'resume' | 'stop') => void;
  isConnected: boolean;
}) {
  return (
    <div>
      <h6>Match Status</h6>
      <div className="d-grid gap-2 mb-3">
        <Button
          variant="outline-primary"
          onClick={() => onStatusChange('live')}
          disabled={!isConnected || matchState.status === 'live'}
        >
          Start Match
        </Button>
        
        <Button
          variant="outline-warning"
          onClick={() => onStatusChange('paused')}
          disabled={!isConnected || matchState.status !== 'live'}
        >
          Pause Match
        </Button>
        
        <Button
          variant="outline-success"
          onClick={() => onStatusChange('completed')}
          disabled={!isConnected || matchState.status === 'completed'}
        >
          End Match
        </Button>
      </div>
      
      <h6>Timer Control</h6>
      <div className="d-grid gap-2">
        <Button
          variant={matchState.isTimerRunning ? 'warning' : 'success'}
          onClick={() => onTimerControl(matchState.isTimerRunning ? 'pause' : 'start')}
          disabled={!isConnected}
        >
          {matchState.isTimerRunning ? 'Pause Timer' : 'Start Timer'}
        </Button>
        
        <Button
          variant="danger"
          onClick={() => onTimerControl('stop')}
          disabled={!isConnected}
        >
          Stop Timer
        </Button>
      </div>
    </div>
  );
}

// Event Details Component
function EventDetails({ event }: { event: MatchEvent }) {
  return (
    <div>
      <Row>
        <Col md={6}>
          <strong>Event Type:</strong>
          <p>{event.type.replace('_', ' ')}</p>
        </Col>
        <Col md={6}>
          <strong>Minute:</strong>
          <p>{event.minute}'</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <strong>Team:</strong>
          <p>{event.teamId}</p>
        </Col>
        <Col md={6}>
          <strong>Player:</strong>
          <p>{event.playerId || 'N/A'}</p>
        </Col>
      </Row>
      
      {event.description && (
        <Row>
          <Col>
            <strong>Description:</strong>
            <p>{event.description}</p>
          </Col>
        </Row>
      )}
      
      <Row>
        <Col>
          <strong>Timestamp:</strong>
          <p>{event.timestamp.toLocaleString()}</p>
        </Col>
      </Row>
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
      return <AlertTriangle size={16} className="text-warning" />;
    case 'red_card':
      return <XCircle size={16} className="text-danger" />;
    case 'substitution':
      return <Users size={16} className="text-primary" />;
    case 'injury':
      return <AlertTriangle size={16} className="text-warning" />;
    case 'corner':
      return <Flag size={16} className="text-info" />;
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
