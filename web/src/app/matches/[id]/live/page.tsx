'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LiveMatchService, TeamService, PlayerStatsService } from '@/services/firebaseService';
import LiveMatchControl from '@/components/LiveMatchControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LiveMatch, LiveMatchEvent, LiveMatchEventType, LiveMatchEventData } from '../../../../../shared/src/types';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  MapPin, 
  Trophy,
  Target,
  AlertTriangle,
  UserCheck,
  Activity,
  BarChart3
} from 'lucide-react';

export default function LiveMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const matchId = params.id as string;

  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [homeTeam, setHomeTeam] = useState<any>(null);
  const [awayTeam, setAwayTeam] = useState<any>(null);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId) {
      loadMatchData();
      const unsubscribe = LiveMatchService.subscribeToLiveMatch(matchId, (matchData) => {
        if (matchData) {
          setMatch(matchData);
          // Calculate current minute based on start time
          if (matchData.startTime && matchData.status === 'in_progress') {
            const startTime = new Date(matchData.startTime);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
            setCurrentMinute(Math.max(0, diffInMinutes));
          }
        }
      });

      return () => unsubscribe();
    }
  }, [matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      const [matchData, homeTeamData, awayTeamData] = await Promise.all([
        LiveMatchService.getLiveMatch(matchId),
        TeamService.getTeam(match?.homeTeamId || ''),
        TeamService.getTeam(match?.awayTeamId || ''),
      ]);

      if (!matchData) {
        setError('Match not found');
        return;
      }

      setMatch(matchData);
      setHomeTeam(homeTeamData);
      setAwayTeam(awayTeamData);

      // Load team players
      if (homeTeamData) {
        const homePlayers = await loadTeamPlayers(homeTeamData.players);
        setHomeTeam({ ...homeTeamData, players: homePlayers });
      }

      if (awayTeamData) {
        const awayPlayers = await loadTeamPlayers(awayTeamData.players);
        setAwayTeam({ ...awayTeamData, players: awayPlayers });
      }

    } catch (error) {
      console.error('Error loading match data:', error);
      setError('Failed to load match data');
      toast({
        title: "Error",
        description: "Failed to load match data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamPlayers = async (playerIds: string[]) => {
    // In a real implementation, you would load player details from the database
    // For now, we'll create mock player data
    return playerIds.map((playerId, index) => ({
      id: playerId,
      name: `Player ${index + 1}`,
      number: index + 1,
      position: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'][index % 4],
    }));
  };

  const handleStartMatch = async (): Promise<boolean> => {
    try {
      await LiveMatchService.updateLiveMatchStatus(matchId, 'in_progress');
      setIsTimerRunning(true);
      toast({
        title: "Match Started",
        description: "The match is now live!",
      });
      return true;
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: "Error",
        description: "Failed to start match",
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePauseMatch = () => {
    setIsTimerRunning(false);
    toast({
      title: "Match Paused",
      description: "Match timer has been paused",
    });
  };

  const handleResumeMatch = () => {
    setIsTimerRunning(true);
    toast({
      title: "Match Resumed",
      description: "Match timer has been resumed",
    });
  };

  const handleEndMatch = async (): Promise<boolean> => {
    try {
      await LiveMatchService.updateLiveMatchStatus(matchId, 'completed');
      setIsTimerRunning(false);
      toast({
        title: "Match Ended",
        description: "Match has been completed and statistics updated",
      });
      return true;
    } catch (error) {
      console.error('Error ending match:', error);
      toast({
        title: "Error",
        description: "Failed to end match",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleAddEvent = async (event: {
    type: LiveMatchEventType;
    minute: number;
    playerId: string;
    teamId: string;
    data: LiveMatchEventData;
  }): Promise<boolean> => {
    try {
      await LiveMatchService.addMatchEvent(matchId, event);
      
      // Update player stats
      await PlayerStatsService.updatePlayerMatchStats(event.playerId, matchId, {
        playerId: event.playerId,
        matchId: matchId,
        teamId: event.teamId,
        minutesPlayed: currentMinute,
        goals: event.type === 'goal' ? 1 : 0,
        assists: event.type === 'assist' ? 1 : 0,
        yellowCards: event.type === 'yellow_card' ? 1 : 0,
        redCards: event.type === 'red_card' ? 1 : 0,
      });

      return true;
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match data...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested match could not be found.'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const matchStats = {
    homeTeam: {
      goals: match.homeScore,
      yellowCards: match.stats?.homeTeam?.yellowCards || 0,
      redCards: match.stats?.homeTeam?.redCards || 0,
    },
    awayTeam: {
      goals: match.awayScore,
      yellowCards: match.stats?.awayTeam?.yellowCards || 0,
      redCards: match.stats?.awayTeam?.redCards || 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={homeTeam?.logoURL} />
                    <AvatarFallback>{homeTeam?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{homeTeam?.name || 'Home Team'}</span>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <Badge variant={match.status === 'in_progress' ? 'default' : 'secondary'}>
                    {match.status === 'in_progress' ? 'LIVE' : match.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{awayTeam?.name || 'Away Team'}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={awayTeam?.logoURL} />
                    <AvatarFallback>{awayTeam?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(match.startTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{match.location?.name || 'TBD'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="control" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Match Control</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Teams</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-6">
            <LiveMatchControl
              matchId={matchId}
              currentMinute={currentMinute}
              isTimerRunning={isTimerRunning}
              onStartMatch={handleStartMatch}
              onPauseMatch={handlePauseMatch}
              onResumeMatch={handleResumeMatch}
              onEndMatch={handleEndMatch}
              onAddEvent={handleAddEvent}
              homeTeam={{
                id: match.homeTeamId,
                name: homeTeam?.name || 'Home Team',
                logo: homeTeam?.logoURL,
                players: homeTeam?.players || [],
              }}
              awayTeam={{
                id: match.awayTeamId,
                name: awayTeam?.name || 'Away Team',
                logo: awayTeam?.logoURL,
                players: awayTeam?.players || [],
              }}
              matchStatus={match.status}
              matchStats={matchStats}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Match Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Match Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{match.stats?.homeTeam?.goals || 0}</div>
                        <div className="text-sm text-gray-600">Goals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{match.stats?.homeTeam?.yellowCards || 0}</div>
                        <div className="text-sm text-gray-600">Yellow Cards</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{match.stats?.homeTeam?.redCards || 0}</div>
                        <div className="text-sm text-gray-600">Red Cards</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{match.stats?.awayTeam?.goals || 0}</div>
                        <div className="text-sm text-gray-600">Goals</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{match.stats?.awayTeam?.yellowCards || 0}</div>
                        <div className="text-sm text-gray-600">Yellow Cards</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{match.stats?.awayTeam?.redCards || 0}</div>
                        <div className="text-sm text-gray-600">Red Cards</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Possession Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Possession</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{homeTeam?.name || 'Home'}</span>
                        <span>{match.stats?.possession?.home || 50}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${match.stats?.possession?.home || 50}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{awayTeam?.name || 'Away'}</span>
                        <span>{match.stats?.possession?.away || 50}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${match.stats?.possession?.away || 50}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Match Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {match.events && match.events.length > 0 ? (
                  <div className="space-y-4">
                    {match.events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            event.type === 'goal' ? 'bg-green-500' :
                            event.type === 'yellow_card' ? 'bg-yellow-500' :
                            event.type === 'red_card' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <div className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</div>
                            <div className="text-sm text-gray-600">
                              {event.playerId} - {event.minute}'
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No events recorded yet</p>
                    <p className="text-sm">Events will appear here as they are added</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Home Team */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={homeTeam?.logoURL} />
                      <AvatarFallback>{homeTeam?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{homeTeam?.name || 'Home Team'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {homeTeam?.players?.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                            {player.number}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.position}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Away Team */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={awayTeam?.logoURL} />
                      <AvatarFallback>{awayTeam?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{awayTeam?.name || 'Away Team'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {awayTeam?.players?.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold">
                            {player.number}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.position}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 