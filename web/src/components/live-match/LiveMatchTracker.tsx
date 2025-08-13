import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { MatchEvent, EventEntryFormData } from '@/lib/services/websocketService';
import { Button, Card, Badge, Form, Row, Col, Alert } from 'react-bootstrap';
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
  XCircle
} from 'lucide-react';

interface LiveMatchTrackerProps {
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
  };
  isReferee?: boolean;
  onMatchUpdate?: (matchId: string, updates: any) => void;
}

export default function LiveMatchTracker({ 
  match, 
  isReferee = false, 
  onMatchUpdate 
}: LiveMatchTrackerProps) {
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

  const [matchState, setMatchState] = useState({
    status: match.status,
    currentMinute: match.currentMinute || 0,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    isTimerRunning: false,
    currentPeriod: 'first_half' as const,
    injuryTime: 0
  });

  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isEventEntryActive, setIsEventEntryActive] = useState(false);
  const [eventEntrySessionId, setEventEntrySessionId] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<EventEntryFormData>>({
    matchId: match.id,
    eventType: 'goal',
    minute: 0,
    teamId: '',
    description: ''
  });

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
            homeScore: event.teamId === 'home' ? prev.homeScore + 1 : prev.homeScore,
            awayScore: event.teamId === 'away' ? prev.awayScore + 1 : prev.awayScore
          }));
        }
      });

      // Subscribe to match state updates
      const unsubscribeState = subscribeToMatchState(match.id, (state) => {
        setMatchState({
          status: state.status,
          currentMinute: state.currentMinute,
          homeScore: state.homeScore,
          awayScore: state.awayScore,
          isTimerRunning: state.isTimerRunning,
          currentPeriod: state.currentPeriod,
          injuryTime: state.injuryTime
        });
      });

      return () => {
        unsubscribeEvents();
        unsubscribeState();
        leaveMatch(match.id);
      };
    }
  }, [isConnected, match.id, isReferee, joinMatch, leaveMatch, subscribeToMatchEvents, subscribeToMatchState]);

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

  return (
    <div className="live-match-tracker">
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
            <h4 className="mb-0">Live Match</h4>
            <Badge bg={getStatusBadgeVariant(matchState.status)}>
              {matchState.status.toUpperCase()}
            </Badge>
          </div>
          
          <Row className="text-center">
            <Col>
              <h5>{match.homeTeam}</h5>
              <h2 className="text-primary">{matchState.homeScore}</h2>
            </Col>
            <Col className="d-flex flex-column justify-content-center">
              <div className="vs-divider">VS</div>
              <div className="match-info">
                <small className="text-muted">{match.venue}</small>
                <br />
                <small className="text-muted">{match.date}</small>
              </div>
            </Col>
            <Col>
              <h5>{match.awayTeam}</h5>
              <h2 className="text-primary">{matchState.awayScore}</h2>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Timer and Controls */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Match Timer</h6>
            <Badge bg="info">{getPeriodDisplay()}</Badge>
          </div>
          
          <div className="text-center mb-3">
            <div className="match-timer">
              <Clock className="me-2" />
              <span className="timer-display">
                {formatTime(matchState.currentMinute)}
              </span>
              {matchState.injuryTime > 0 && (
                <span className="injury-time ms-2">
                  +{matchState.injuryTime}'
                </span>
              )}
            </div>
          </div>

          {isReferee && (
            <div className="d-flex justify-content-center gap-2 mb-3">
              <Button
                variant={matchState.isTimerRunning ? 'warning' : 'success'}
                onClick={() => handleTimerControl(matchState.isTimerRunning ? 'pause' : 'start')}
                disabled={!isConnected}
              >
                {matchState.isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                {matchState.isTimerRunning ? 'Pause' : 'Start'}
              </Button>
              
              {matchState.isTimerRunning && (
                <Button
                  variant="secondary"
                  onClick={() => handleTimerControl('resume')}
                  disabled={!isConnected}
                >
                  Resume
                </Button>
              )}
              
              <Button
                variant="danger"
                onClick={() => handleTimerControl('stop')}
                disabled={!isConnected}
              >
                <Square size={16} />
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

      {/* Event Entry */}
      {isReferee && (
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Event Entry</h6>
              <Badge bg={isEventEntryActive ? 'success' : 'secondary'}>
                {isEventEntryActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            {!isEventEntryActive ? (
              <Button
                variant="success"
                onClick={handleStartEventEntry}
                disabled={!isConnected}
              >
                <Target size={16} className="me-2" />
                Start Event Entry
              </Button>
            ) : (
              <div>
                <Button
                  variant="danger"
                  onClick={handleEndEventEntry}
                  className="mb-3"
                >
                  <XCircle size={16} className="me-2" />
                  End Event Entry
                </Button>
                
                {showEventForm && (
                  <EventEntryForm
                    form={eventForm}
                    onChange={handleFormChange}
                    onSubmit={handleSubmitEvent}
                    disabled={!isConnected}
                  />
                )}
              </div>
            )}
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
                <div key={index} className="event-item d-flex align-items-center p-2 border-bottom">
                  <div className="event-icon me-2">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="event-details flex-grow-1">
                    <div className="event-description">
                      {event.description || `${event.type.replace('_', ' ')}`}
                    </div>
                    <small className="text-muted">
                      Minute {event.minute} • {event.teamId}
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
    </div>
  );
}

// Event Entry Form Component
function EventEntryForm({ 
  form, 
  onChange, 
  onSubmit, 
  disabled 
}: {
  form: Partial<EventEntryFormData>;
  onChange: (field: keyof EventEntryFormData, value: any) => void;
  onSubmit: (data: EventEntryFormData) => void;
  disabled: boolean;
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
              <option value="home">Home Team</option>
              <option value="away">Away Team</option>
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
    default:
      return <Award size={16} className="text-secondary" />;
  }
}
