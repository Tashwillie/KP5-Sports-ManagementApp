'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  teamId: string;
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution_in' | 'substitution_out' | 'injury' | 'corner' | 'foul' | 'shot';
  minute: number;
  second: number;
  playerId: string;
  teamId: string;
  data?: any;
  timestamp: Date;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  stats: {
    goals: number;
    assists: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    possession: number;
  };
}

interface EnhancedLiveMatchControlProps {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  onEventAdd: (event: Omit<MatchEvent, 'id' | 'timestamp'>) => Promise<boolean>;
  onMatchStateChange: (state: 'not_started' | 'in_progress' | 'paused' | 'completed') => void;
  onScoreUpdate: (teamId: string, score: number) => void;
  onStatsUpdate: (teamId: string, stats: any) => void;
}

export function EnhancedLiveMatchControl({
  matchId,
  homeTeam,
  awayTeam,
  onEventAdd,
  onMatchStateChange,
  onScoreUpdate,
  onStatsUpdate
}: EnhancedLiveMatchControlProps) {
  const [matchState, setMatchState] = useState<'not_started' | 'in_progress' | 'paused' | 'completed'>('not_started');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<MatchEvent['type']>('goal');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [eventMinute, setEventMinute] = useState('');
  const [eventSecond, setEventSecond] = useState('');
  const [eventData, setEventData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'control' | 'events' | 'stats' | 'settings'>('control');
  const [autoSave, setAutoSave] = useState(true);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'high' | 'ultra'>('normal');

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

  const handleScoreChange = (teamId: string, change: number) => {
    const team = teamId === homeTeam.id ? homeTeam : awayTeam;
    const newScore = Math.max(0, team.score + change);
    onScoreUpdate(teamId, newScore);
  };

  const handleAddEvent = async () => {
    if (!selectedPlayer || !selectedTeam || !eventMinute) return;

    const newEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: selectedEventType,
      playerId: selectedPlayer,
      teamId: selectedTeam,
      minute: parseInt(eventMinute),
      second: parseInt(eventSecond) || 0,
      data: eventData
    };

    try {
      const success = await onEventAdd(newEvent);
      if (success) {
        const eventWithId: MatchEvent = {
          ...newEvent,
          id: Date.now().toString(),
          timestamp: new Date()
        };
        setEvents(prev => [...prev, eventWithId]);

        // Reset form
        setSelectedEventType('goal');
        setSelectedPlayer('');
        setSelectedTeam('');
        setEventMinute('');
        setEventSecond('');
        setEventData({});
        setIsAddingEvent(false);
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const getPlayerById = (playerId: string) => {
    const allPlayers = [...homeTeam.players, ...awayTeam.players];
    return allPlayers.find(player => player.id === playerId);
  };

  const getTeamById = (teamId: string) => {
    return teamId === homeTeam.id ? homeTeam : awayTeam;
  };

  const getEventTypeIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal': return <Target className="h-4 w-4 text-green-600" />;
      case 'assist': return <Award className="h-4 w-4 text-blue-600" />;
      case 'yellow_card': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'red_card': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'substitution_in': return <Users className="h-4 w-4 text-green-600" />;
      case 'substitution_out': return <Users className="h-4 w-4 text-red-600" />;
      case 'injury': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventTypeColor = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal': return 'bg-green-100 text-green-800';
      case 'assist': return 'bg-blue-100 text-blue-800';
      case 'yellow_card': return 'bg-yellow-100 text-yellow-800';
      case 'red_card': return 'bg-red-100 text-red-800';
      case 'substitution_in': return 'bg-green-100 text-green-800';
      case 'substitution_out': return 'bg-red-100 text-red-800';
      case 'injury': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTeamStats = (teamId: string) => {
    const teamEvents = events.filter(event => event.teamId === teamId);
    return {
      goals: teamEvents.filter(e => e.type === 'goal').length,
      assists: teamEvents.filter(e => e.type === 'assist').length,
      yellowCards: teamEvents.filter(e => e.type === 'yellow_card').length,
      redCards: teamEvents.filter(e => e.type === 'red_card').length,
      substitutions: teamEvents.filter(e => e.type === 'substitution_in').length,
      injuries: teamEvents.filter(e => e.type === 'injury').length,
    };
  };

  const homeStats = calculateTeamStats(homeTeam.id);
  const awayStats = calculateTeamStats(awayTeam.id);

  return (
    <div className="space-y-6">
      {/* Match Timer and Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Match Control</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={matchState === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {matchState === 'in_progress' ? 'LIVE' : matchState.toUpperCase()}
              </Badge>
              <span className="text-2xl font-mono font-bold">{formatTime(elapsedTime)}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              onClick={() => handleMatchStateChange('not_started')}
              variant={matchState === 'not_started' ? 'default' : 'outline'}
              disabled={matchState === 'in_progress'}
            >
              <Square className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => handleMatchStateChange('in_progress')}
              variant={matchState === 'in_progress' ? 'default' : 'outline'}
              disabled={matchState === 'completed'}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
            <Button
              onClick={() => handleMatchStateChange('paused')}
              variant={matchState === 'paused' ? 'default' : 'outline'}
              disabled={matchState !== 'in_progress'}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={() => handleMatchStateChange('completed')}
              variant={matchState === 'completed' ? 'default' : 'outline'}
              disabled={matchState === 'not_started'}
            >
              <Square className="h-4 w-4 mr-2" />
              End Match
            </Button>
          </div>

          {/* Score Control */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">{homeTeam.name}</h3>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(homeTeam.id, -1)}
                  disabled={homeTeam.score <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-3xl font-bold">{homeTeam.score}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(homeTeam.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-2">{awayTeam.name}</h3>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(awayTeam.id, -1)}
                  disabled={awayTeam.score <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-3xl font-bold">{awayTeam.score}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScoreChange(awayTeam.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="control" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Quick Add</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Events</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Quick Add Tab */}
        <TabsContent value="control" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Event Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Event Type</label>
                    <Select value={selectedEventType} onValueChange={(value) => setSelectedEventType(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goal">Goal</SelectItem>
                        <SelectItem value="assist">Assist</SelectItem>
                        <SelectItem value="yellow_card">Yellow Card</SelectItem>
                        <SelectItem value="red_card">Red Card</SelectItem>
                        <SelectItem value="substitution_in">Substitution In</SelectItem>
                        <SelectItem value="substitution_out">Substitution Out</SelectItem>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="corner">Corner</SelectItem>
                        <SelectItem value="foul">Foul</SelectItem>
                        <SelectItem value="shot">Shot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Team</label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={homeTeam.id}>{homeTeam.name}</SelectItem>
                        <SelectItem value={awayTeam.id}>{awayTeam.name}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Player</label>
                    <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTeam && getTeamById(selectedTeam)?.players.map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.number} - {player.name} ({player.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Minute</label>
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
                      <label className="text-sm font-medium">Second</label>
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

                  <Button
                    onClick={handleAddEvent}
                    disabled={!selectedPlayer || !selectedTeam || !eventMinute}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Events Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No events recorded yet
                  </div>
                ) : (
                  events.map((event) => {
                    const player = getPlayerById(event.playerId);
                    const team = getTeamById(event.teamId);
                    
                    return (
                      <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.type)}
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{player?.name}</div>
                          <div className="text-sm text-gray-600">{team?.name}</div>
                        </div>
                        <div className="text-sm font-mono">
                          {event.minute}'{event.second.toString().padStart(2, '0')}"
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{homeTeam.name} Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span className="font-medium">{homeStats.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assists:</span>
                    <span className="font-medium">{homeStats.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yellow Cards:</span>
                    <span className="font-medium">{homeStats.yellowCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Red Cards:</span>
                    <span className="font-medium">{homeStats.redCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Substitutions:</span>
                    <span className="font-medium">{homeStats.substitutions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Injuries:</span>
                    <span className="font-medium">{homeStats.injuries}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{awayTeam.name} Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span className="font-medium">{awayStats.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assists:</span>
                    <span className="font-medium">{awayStats.assists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yellow Cards:</span>
                    <span className="font-medium">{awayStats.yellowCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Red Cards:</span>
                    <span className="font-medium">{awayStats.redCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Substitutions:</span>
                    <span className="font-medium">{awayStats.substitutions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Injuries:</span>
                    <span className="font-medium">{awayStats.injuries}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Save</div>
                    <div className="text-sm text-gray-600">Automatically save match data</div>
                  </div>
                  <Button
                    variant={autoSave ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAutoSave(!autoSave)}
                  >
                    {autoSave ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Performance Mode</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: 'normal', label: 'Normal', description: 'Balanced performance' },
                      { mode: 'high', label: 'High', description: 'Better responsiveness' },
                      { mode: 'ultra', label: 'Ultra', description: 'Maximum performance' }
                    ].map(({ mode, label, description }) => (
                      <Button
                        key={mode}
                        variant={performanceMode === mode ? 'default' : 'outline'}
                        className="flex flex-col items-center p-3 h-auto"
                        onClick={() => setPerformanceMode(mode as any)}
                      >
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-gray-600">{description}</div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Match
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Match
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 