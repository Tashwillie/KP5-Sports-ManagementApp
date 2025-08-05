"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Users, 
  Target, 
  Award, 
  AlertTriangle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  Timer,
  Calendar,
  MapPin,
  User,
  Shield,
  Zap
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  teamId: string;
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'other';
  playerId: string;
  teamId: string;
  minute: number;
  second: number;
  description?: string;
  additionalData?: any;
  timestamp: Date;
}

interface LiveMatchTrackerProps {
  matchId: string;
  team1: {
    id: string;
    name: string;
    logo?: string;
    players: Player[];
  };
  team2: {
    id: string;
    name: string;
    logo?: string;
    players: Player[];
  };
  onEventAdd: (event: Omit<MatchEvent, 'id' | 'timestamp'>) => void;
  onEventUpdate: (eventId: string, updates: Partial<MatchEvent>) => void;
  onEventDelete: (eventId: string) => void;
  onMatchStateChange: (state: 'not_started' | 'in_progress' | 'paused' | 'completed') => void;
  onScoreUpdate: (teamId: string, score: number) => void;
}

export function LiveMatchTracker({
  matchId,
  team1,
  team2,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  onMatchStateChange,
  onScoreUpdate
}: LiveMatchTrackerProps) {
  const [matchState, setMatchState] = useState<'not_started' | 'in_progress' | 'paused' | 'completed'>('not_started');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  
  // Event form state
  const [eventType, setEventType] = useState<MatchEvent['type']>('goal');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [eventMinute, setEventMinute] = useState('');
  const [eventSecond, setEventSecond] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [additionalData, setAdditionalData] = useState<any>({});

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (matchState === 'in_progress') {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [matchState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMatchStateChange = (newState: typeof matchState) => {
    setMatchState(newState);
    onMatchStateChange(newState);
  };

  const handleScoreChange = (teamId: string, newScore: number) => {
    if (teamId === team1.id) {
      setTeam1Score(newScore);
      onScoreUpdate(teamId, newScore);
    } else {
      setTeam2Score(newScore);
      onScoreUpdate(teamId, newScore);
    }
  };

  const handleAddEvent = () => {
    if (!selectedPlayer || !selectedTeam || !eventMinute) return;

    const newEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: eventType,
      playerId: selectedPlayer,
      teamId: selectedTeam,
      minute: parseInt(eventMinute),
      second: parseInt(eventSecond) || 0,
      description: eventDescription,
      additionalData
    };

    onEventAdd(newEvent);
    
    // Add to local state
    const eventWithId: MatchEvent = {
      ...newEvent,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setEvents(prev => [...prev, eventWithId]);

    // Reset form
    setEventType('goal');
    setSelectedPlayer('');
    setSelectedTeam('');
    setEventMinute('');
    setEventSecond('');
    setEventDescription('');
    setAdditionalData({});
    setIsAddingEvent(false);
  };

  const getPlayerById = (playerId: string) => {
    const allPlayers = [...team1.players, ...team2.players];
    return allPlayers.find(player => player.id === playerId);
  };

  const getTeamById = (teamId: string) => {
    return teamId === team1.id ? team1 : team2;
  };

  const renderEventIcon = (eventType: MatchEvent['type']) => {
    switch (eventType) {
      case 'goal':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'yellow_card':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'red_card':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'substitution':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'injury':
        return <User className="w-4 h-4 text-orange-600" />;
      default:
        return <Zap className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderEventType = (eventType: MatchEvent['type']) => {
    switch (eventType) {
      case 'goal':
        return 'Goal';
      case 'yellow_card':
        return 'Yellow Card';
      case 'red_card':
        return 'Red Card';
      case 'substitution':
        return 'Substitution';
      case 'injury':
        return 'Injury';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Match Tracker</span>
            <Badge variant={matchState === 'in_progress' ? 'default' : 'secondary'}>
              {matchState.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Team 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {team1.logo && (
                  <img src={team1.logo} alt={team1.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="font-bold text-lg">{team1.name}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(team1.id, Math.max(0, team1Score - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-3xl font-bold w-12 text-center">{team1Score}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(team1.id, team1Score + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Timer and Controls */}
            <div className="text-center">
              <div className="text-4xl font-mono font-bold mb-4">
                {formatTime(elapsedTime)}
              </div>
              <div className="flex items-center justify-center space-x-2">
                {matchState === 'not_started' && (
                  <Button onClick={() => handleMatchStateChange('in_progress')}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Match
                  </Button>
                )}
                {matchState === 'in_progress' && (
                  <>
                    <Button variant="outline" onClick={() => handleMatchStateChange('paused')}>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={() => handleMatchStateChange('completed')}>
                      <Square className="w-4 h-4 mr-2" />
                      End Match
                    </Button>
                  </>
                )}
                {matchState === 'paused' && (
                  <>
                    <Button onClick={() => handleMatchStateChange('in_progress')}>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                    <Button variant="destructive" onClick={() => handleMatchStateChange('completed')}>
                      <Square className="w-4 h-4 mr-2" />
                      End Match
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Team 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="font-bold text-lg">{team2.name}</span>
                {team2.logo && (
                  <img src={team2.logo} alt={team2.name} className="w-8 h-8 rounded-full" />
                )}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(team2.id, Math.max(0, team2Score - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-3xl font-bold w-12 text-center">{team2Score}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(team2.id, team2Score + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Event */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add Match Event</span>
              <Button onClick={() => setIsAddingEvent(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <Select value={eventType} onValueChange={(value: MatchEvent['type']) => setEventType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal</SelectItem>
                      <SelectItem value="yellow_card">Yellow Card</SelectItem>
                      <SelectItem value="red_card">Red Card</SelectItem>
                      <SelectItem value="substitution">Substitution</SelectItem>
                      <SelectItem value="injury">Injury</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={team1.id}>{team1.name}</SelectItem>
                      <SelectItem value={team2.id}>{team2.name}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Player</Label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeam && getTeamById(selectedTeam).players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        #{player.number} {player.name} ({player.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minute</Label>
                  <Input
                    type="number"
                    value={eventMinute}
                    onChange={(e) => setEventMinute(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="120"
                  />
                </div>
                <div>
                  <Label>Second</Label>
                  <Input
                    type="number"
                    value={eventSecond}
                    onChange={(e) => setEventSecond(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="59"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddEvent} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Match Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events recorded yet</p>
              ) : (
                events
                  .sort((a, b) => (a.minute * 60 + a.second) - (b.minute * 60 + b.second))
                  .map(event => {
                    const player = getPlayerById(event.playerId);
                    const team = getTeamById(event.teamId);
                    
                    return (
                      <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {renderEventIcon(event.type)}
                          <span className="text-sm font-medium">
                            {event.minute}:{event.second.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{renderEventType(event.type)}</div>
                          <div className="text-sm text-gray-600">
                            {player?.name} ({team.name})
                          </div>
                          {event.description && (
                            <div className="text-xs text-gray-500 mt-1">{event.description}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Edit Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <p>Event editing functionality will be implemented here.</p>
              <div className="flex space-x-2">
                <Button variant="destructive" onClick={() => {
                  onEventDelete(selectedEvent.id);
                  setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
                  setSelectedEvent(null);
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LiveMatchTracker; 