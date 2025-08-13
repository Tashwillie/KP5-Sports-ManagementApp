'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Award, 
  AlertTriangle,
  BarChart3,
  Activity,
  Zap,
  Eye,
  Heart,
  Shield,
  Footprints,
  Timer,
  Star
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  teamId: string;
  stats: {
    goals: number;
    assists: number;
    shots: number;
    shotsOnTarget: number;
    passes: number;
    passAccuracy: number;
    tackles: number;
    interceptions: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    distance: number;
    sprints: number;
  };
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution_in' | 'substitution_out' | 'injury' | 'corner' | 'foul' | 'shot' | 'save' | 'offside';
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
    passes: number;
    passAccuracy: number;
    tackles: number;
    interceptions: number;
    offsides: number;
    saves: number;
    clearances: number;
    blocks: number;
  };
}

interface MatchStatisticsDashboardProps {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  events: MatchEvent[];
  matchTime: number;
  matchStatus: 'not_started' | 'in_progress' | 'paused' | 'completed';
  onPlayerClick?: (playerId: string) => void;
}

export function MatchStatisticsDashboard({
  matchId,
  homeTeam,
  awayTeam,
  events,
  matchTime,
  matchStatus,
  onPlayerClick
}: MatchStatisticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'timeline' | 'analytics'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'first_half' | 'second_half' | 'extra_time'>('all');

  // Calculate real-time statistics
  const matchStats = useMemo(() => {
    const homeStats = { ...homeTeam.stats };
    const awayStats = { ...awayTeam.stats };

    // Calculate possession based on events
    const totalEvents = events.length;
    if (totalEvents > 0) {
      const homeEvents = events.filter(e => e.teamId === homeTeam.id).length;
      const awayEvents = events.filter(e => e.teamId === awayTeam.id).length;
      homeStats.possession = Math.round((homeEvents / totalEvents) * 100);
      awayStats.possession = Math.round((awayEvents / totalEvents) * 100);
    }

    return { home: homeStats, away: awayStats };
  }, [homeTeam, awayTeam, events]);

  // Calculate player performance rankings
  const playerRankings = useMemo(() => {
    const allPlayers = [...homeTeam.players, ...awayTeam.players];
    
    return {
      topScorers: allPlayers
        .filter(p => p.stats.goals > 0)
        .sort((a, b) => b.stats.goals - a.stats.goals)
        .slice(0, 5),
      topAssists: allPlayers
        .filter(p => p.stats.assists > 0)
        .sort((a, b) => b.stats.assists - a.stats.assists)
        .slice(0, 5),
      mostActive: allPlayers
        .sort((a, b) => (b.stats.passes + b.stats.tackles + b.stats.interceptions) - (a.stats.passes + a.stats.tackles + a.stats.interceptions))
        .slice(0, 5)
    };
  }, [homeTeam.players, awayTeam.players]);

  // Calculate match momentum
  const matchMomentum = useMemo(() => {
    if (events.length === 0) return { home: 50, away: 50 };

    const recentEvents = events.slice(-10); // Last 10 events
    let homeMomentum = 0;
    let awayMomentum = 0;

    recentEvents.forEach(event => {
      const weight = event.type === 'goal' ? 3 : event.type === 'shot' ? 2 : 1;
      if (event.teamId === homeTeam.id) {
        homeMomentum += weight;
      } else {
        awayMomentum += weight;
      }
    });

    const total = homeMomentum + awayMomentum;
    return {
      home: total > 0 ? Math.round((homeMomentum / total) * 100) : 50,
      away: total > 0 ? Math.round((awayMomentum / total) * 100) : 50
    };
  }, [events, homeTeam.id, awayTeam.id]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal': return <Target className="w-4 h-4 text-green-600" />;
      case 'assist': return <Award className="w-4 h-4 text-blue-600" />;
      case 'yellow_card': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'red_card': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'shot': return <Zap className="w-4 h-4 text-orange-600" />;
      case 'corner': return <Eye className="w-4 h-4 text-purple-600" />;
      case 'foul': return <Shield className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{homeTeam.name}</div>
                <div className="text-4xl font-bold text-blue-600">{homeTeam.score}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">VS</div>
                <div className="text-lg font-semibold">{formatTime(matchTime)}</div>
                <Badge variant={matchStatus === 'in_progress' ? 'default' : matchStatus === 'paused' ? 'secondary' : 'outline'}>
                  {matchStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{awayTeam.name}</div>
                <div className="text-4xl font-bold text-red-600">{awayTeam.score}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Match ID</div>
              <div className="font-mono text-xs">{matchId}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Match Momentum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Match Momentum</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{homeTeam.name}</span>
              <span className="text-sm font-medium">{matchMomentum.home}%</span>
            </div>
            <Progress value={matchMomentum.home} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{awayTeam.name}</span>
              <span className="text-sm font-medium">{matchMomentum.away}%</span>
            </div>
            <Progress value={matchMomentum.away} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Main Statistics Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="overview" className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-600">Shots</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{homeTeam.name}</span>
                    <span className="font-semibold">{matchStats.home.shots}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{awayTeam.name}</span>
                    <span className="font-semibold">{matchStats.away.shots}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-600">Possession</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{homeTeam.name}</span>
                    <span className="font-semibold">{matchStats.home.possession}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{awayTeam.name}</span>
                    <span className="font-semibold">{matchStats.away.possession}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-600">Passes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{homeTeam.name}</span>
                    <span className="font-semibold">{matchStats.home.passes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{awayTeam.name}</span>
                    <span className="font-semibold">{matchStats.away.passes}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-600">Fouls</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{homeTeam.name}</span>
                    <span className="font-semibold">{matchStats.home.fouls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{awayTeam.name}</span>
                    <span className="font-semibold">{matchStats.away.fouls}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            {/* Top Performers */}
            <div className="space-y-4">
              <h4 className="font-semibold">Top Scorers</h4>
              <div className="space-y-2">
                {playerRankings.topScorers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-gray-500">({player.number})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{player.stats.goals}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Top Assists</h4>
              <div className="space-y-2">
                {playerRankings.topAssists.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-gray-500">({player.number})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{player.stats.assists}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {/* Match Timeline */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 min-w-0">
                    {getEventIcon(event.type)}
                    <span className="text-sm font-medium">{event.minute}'{event.second}"</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">
                      {event.type.replace('_', ' ').toUpperCase()}
                      {event.data?.description && ` - ${event.data.description}`}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Match Intensity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(events.length / Math.max(matchTime / 60, 1))}
                  </div>
                  <p className="text-xs text-gray-500">Events per minute</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Goal Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((homeTeam.score + awayTeam.score) / Math.max(matchStats.home.shots + matchStats.away.shots, 1) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500">Goals per shot</p>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance Comparison */}
            <div className="space-y-4">
              <h4 className="font-semibold">Team Performance Comparison</h4>
              <div className="space-y-3">
                {Object.entries(matchStats.home).map(([key, homeValue]) => {
                  const awayValue = matchStats.away[key as keyof typeof matchStats.away];
                  if (typeof homeValue === 'number' && typeof awayValue === 'number') {
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span>{homeValue} - {awayValue}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Progress value={(homeValue / Math.max(homeValue + awayValue, 1)) * 100} className="flex-1 h-2" />
                          <Progress value={(awayValue / Math.max(homeValue + awayValue, 1)) * 100} className="flex-1 h-2" />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}
