'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LiveMatchEventType, LiveMatchEventData } from '../../../../shared/src/types';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Users, 
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  MapPin,
  Edit3,
  Save,
  RotateCcw,
  Volume2,
  Mic,
  Video,
  Settings,
  Zap
} from 'lucide-react';

interface LiveMatchControlProps {
  matchId: string;
  currentMinute: number;
  isTimerRunning: boolean;
  onStartMatch: () => Promise<boolean>;
  onPauseMatch: () => void;
  onResumeMatch: () => void;
  onEndMatch: () => Promise<boolean>;
  onAddEvent: (event: {
    type: LiveMatchEventType;
    minute: number;
    playerId: string;
    teamId: string;
    data: LiveMatchEventData;
  }) => Promise<boolean>;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    players: Array<{ id: string; name: string; number: number; position: string }>;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    players: Array<{ id: string; name: string; number: number; position: string }>;
  };
  matchStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  matchStats: {
    homeTeam: { goals: number; yellowCards: number; redCards: number };
    awayTeam: { goals: number; yellowCards: number; redCards: number };
  };
}

export default function LiveMatchControl({
  matchId,
  currentMinute,
  isTimerRunning,
  onStartMatch,
  onPauseMatch,
  onResumeMatch,
  onEndMatch,
  onAddEvent,
  homeTeam,
  awayTeam,
  matchStatus,
  matchStats,
}: LiveMatchControlProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [eventType, setEventType] = useState<LiveMatchEventType>('goal');
  const [fieldPosition, setFieldPosition] = useState({ x: 50, y: 50 });
  const [eventDescription, setEventDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const { toast } = useToast();
  const timerRef = useRef<HTMLDivElement>(null);

  // Animated timer effect
  useEffect(() => {
    if (timerRef.current && isTimerRunning) {
      timerRef.current.style.transform = 'scale(1.05)';
      setTimeout(() => {
        if (timerRef.current) {
          timerRef.current.style.transform = 'scale(1)';
        }
      }, 200);
    }
  }, [currentMinute, isTimerRunning]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleQuickEvent = async (type: LiveMatchEventType) => {
    if (!selectedPlayer) {
      toast({
        title: "Select Player",
        description: "Please select a player first",
        variant: "destructive",
      });
      return;
    }

    const teamId = selectedTeam === 'home' ? homeTeam.id : awayTeam.id;
    
    const success = await onAddEvent({
      type,
      minute: currentMinute,
      playerId: selectedPlayer,
      teamId,
      data: {
        description: eventDescription,
        position: fieldPosition,
      },
    });

    if (success) {
      toast({
        title: "Event Added",
        description: `${type.replace('_', ' ')} recorded successfully`,
      });
      setEventDescription('');
      setFieldPosition({ x: 50, y: 50 });
    } else {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const handleStartMatch = async () => {
    const success = await onStartMatch();
    if (success) {
      toast({
        title: "Match Started",
        description: "The match is now live!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to start match",
        variant: "destructive",
      });
    }
  };

  const handleEndMatch = async () => {
    const success = await onEndMatch();
    if (success) {
      toast({
        title: "Match Ended",
        description: "Match has been completed and statistics updated",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to end match",
        variant: "destructive",
      });
    }
  };

  const getEventIcon = (type: LiveMatchEventType) => {
    switch (type) {
      case 'goal':
        return <Target className="h-4 w-4" />;
      case 'yellow_card':
        return <AlertTriangle className="h-4 w-4" />;
      case 'red_card':
        return <XCircle className="h-4 w-4" />;
      case 'substitution_in':
        return <Users className="h-4 w-4" />;
      case 'substitution_out':
        return <Users className="h-4 w-4" />;
      case 'injury':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: LiveMatchEventType) => {
    switch (type) {
      case 'goal':
        return 'bg-green-500 hover:bg-green-600';
      case 'yellow_card':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'red_card':
        return 'bg-red-500 hover:bg-red-600';
      case 'substitution_in':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'substitution_out':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'injury':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const quickEvents: Array<{ type: LiveMatchEventType; label: string; icon: React.ReactNode }> = [
    { type: 'goal', label: 'Goal', icon: <Target className="h-4 w-4" /> },
    { type: 'yellow_card', label: 'Yellow Card', icon: <AlertTriangle className="h-4 w-4" /> },
    { type: 'red_card', label: 'Red Card', icon: <XCircle className="h-4 w-4" /> },
    { type: 'substitution_in', label: 'Sub In', icon: <Users className="h-4 w-4" /> },
    { type: 'substitution_out', label: 'Sub Out', icon: <Users className="h-4 w-4" /> },
    { type: 'injury', label: 'Injury', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  const currentTeam = selectedTeam === 'home' ? homeTeam : awayTeam;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timer and Match Controls */}
      <div className="lg:col-span-1 space-y-6">
        {/* Timer Card */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Match Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {/* Live Status */}
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${matchStatus === 'in_progress' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <Badge variant={matchStatus === 'in_progress' ? 'default' : 'secondary'}>
                {matchStatus === 'in_progress' ? 'LIVE' : matchStatus.toUpperCase()}
              </Badge>
            </div>

            {/* Timer Display */}
            <div 
              ref={timerRef}
              className="transition-transform duration-200"
            >
              <div className="text-4xl font-mono font-bold text-gray-900">
                {formatTime(currentMinute)}
              </div>
              <p className="text-sm text-gray-600">Match Time</p>
            </div>

            {/* Match Controls */}
            <div className="space-y-3">
              {matchStatus === 'scheduled' && (
                <Button 
                  onClick={handleStartMatch}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Match
                </Button>
              )}

              {matchStatus === 'in_progress' && (
                <div className="space-y-3">
                  {isTimerRunning ? (
                    <Button 
                      onClick={onPauseMatch}
                      variant="outline"
                      className="w-full"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Match
                    </Button>
                  ) : (
                    <Button 
                      onClick={onResumeMatch}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Resume Match
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleEndMatch}
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    End Match
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{matchStats.homeTeam.goals}</div>
                <div className="text-sm text-gray-600">Home Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{matchStats.awayTeam.goals}</div>
                <div className="text-sm text-gray-600">Away Goals</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-600">
                  {matchStats.homeTeam.yellowCards + matchStats.awayTeam.yellowCards}
                </div>
                <div className="text-sm text-gray-600">Yellow Cards</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  {matchStats.homeTeam.redCards + matchStats.awayTeam.redCards}
                </div>
                <div className="text-sm text-gray-600">Red Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Media Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant={isRecording ? "default" : "outline"}
              className="w-full"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="mr-2 h-4 w-4" />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            
            <Button
              variant={isBroadcasting ? "default" : "outline"}
              className="w-full"
              onClick={() => setIsBroadcasting(!isBroadcasting)}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {isBroadcasting ? 'Stop Broadcast' : 'Start Broadcast'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Event Entry */}
      <div className="lg:col-span-2 space-y-6">
        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Team Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedTeam === 'home' ? 'default' : 'outline'}
                className="h-auto p-4"
                onClick={() => setSelectedTeam('home')}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={homeTeam.logo} />
                    <AvatarFallback>{homeTeam.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold">{homeTeam.name}</div>
                    <div className="text-sm text-gray-600">{homeTeam.players.length} players</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant={selectedTeam === 'away' ? 'default' : 'outline'}
                className="h-auto p-4"
                onClick={() => setSelectedTeam('away')}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={awayTeam.logo} />
                    <AvatarFallback>{awayTeam.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold">{awayTeam.name}</div>
                    <div className="text-sm text-gray-600">{awayTeam.players.length} players</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Player</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentTeam.players.map((player) => (
                <Button
                  key={player.id}
                  variant={selectedPlayer === player.id ? 'default' : 'outline'}
                  className="h-auto p-3 flex-col"
                  onClick={() => setSelectedPlayer(player.id)}
                >
                  <div className="text-lg font-bold">{player.number}</div>
                  <div className="text-xs text-center">{player.name}</div>
                  <div className="text-xs text-gray-500">{player.position}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Events</span>
              <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Advanced
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Advanced Event Entry</DialogTitle>
                    <DialogDescription>
                      Add detailed event information with field position and description.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="event-type" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="event-type">Event Type</TabsTrigger>
                      <TabsTrigger value="field-position">Field Position</TabsTrigger>
                      <TabsTrigger value="description">Description</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="event-type" className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {quickEvents.map((event) => (
                          <Button
                            key={event.type}
                            variant={eventType === event.type ? 'default' : 'outline'}
                            className="h-auto p-4 flex-col"
                            onClick={() => setEventType(event.type)}
                          >
                            {event.icon}
                            <span className="mt-2">{event.label}</span>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="field-position" className="space-y-4">
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowFieldDialog(true)}
                          className="w-full"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Select Position on Field
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="description" className="space-y-4">
                      <div>
                        <Label htmlFor="description">Event Description</Label>
                        <Input
                          id="description"
                          placeholder="Add additional details about this event..."
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      handleQuickEvent(eventType);
                      setShowEventDialog(false);
                    }}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickEvents.map((event) => (
                <Button
                  key={event.type}
                  className={`${getEventColor(event.type)} text-white`}
                  onClick={() => handleQuickEvent(event.type)}
                >
                  {event.icon}
                  <span className="ml-2">{event.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No events recorded yet</p>
              <p className="text-sm">Events will appear here as they are added</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Position Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Field Position</DialogTitle>
            <DialogDescription>
              Click on the field to set the event position
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative bg-green-600 rounded-lg p-4">
            <div className="relative w-full h-96 bg-green-500 rounded border-2 border-white">
              {/* Field markings */}
              <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-white transform -translate-x-0.5 -translate-y-8" />
              <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-white rounded" />
              
              {/* Position indicator */}
              <div
                className="absolute w-6 h-6 bg-red-500 border-2 border-white rounded-full cursor-pointer transform -translate-x-3 -translate-y-3"
                style={{
                  left: `${fieldPosition.x}%`,
                  top: `${fieldPosition.y}%`,
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (rect) {
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setFieldPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
                  }
                }}
              />
            </div>
            
            <div className="mt-4 text-center text-white">
              <p>Position: ({Math.round(fieldPosition.x)}, {Math.round(fieldPosition.y)})</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowFieldDialog(false)}>
              <Save className="mr-2 h-4 w-4" />
              Set Position
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 