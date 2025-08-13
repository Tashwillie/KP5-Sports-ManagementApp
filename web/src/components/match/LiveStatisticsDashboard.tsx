'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Award, 
  BarChart3,
  Activity,
  Timer,
  Star,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useRealTimeStatistics } from '@kp5-academy/shared';
import { RealTimeStatisticsService } from '@kp5-academy/shared';

interface LiveStatisticsDashboardProps {
  matchId: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    color?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    color?: string;
  };
  statisticsService: RealTimeStatisticsService;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function LiveStatisticsDashboard({
  matchId,
  homeTeam,
  awayTeam,
  statisticsService,
  autoRefresh = true,
  refreshInterval = 5000
}: LiveStatisticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams' | 'timeline' | 'analytics'>('overview');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const {
    matchStats,
    playerMatchStats,
    loading,
    errors,
    subscribeToMatch,
    subscribeToTeam,
    fetchMatchStats,
    refreshAll
  } = useRealTimeStatistics(statisticsService, {
    autoRefresh,
    refreshInterval
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (matchId) {
      fetchMatchStats(matchId);
      const unsubscribeMatch = subscribeToMatch(matchId);
      const unsubscribeHomeTeam = subscribeToTeam(homeTeam.id);
      const unsubscribeAwayTeam = subscribeToTeam(awayTeam.id);

      return () => {
        unsubscribeMatch();
        unsubscribeHomeTeam();
        unsubscribeAwayTeam();
      };
    }
  }, [matchId, homeTeam.id, awayTeam.id]);

  // Calculate real-time statistics
  const liveStats = useMemo(() => {
    if (!matchStats) return null;

    const home = matchStats.homeTeamStats;
    const away = matchStats.awayTeamStats;

    return {
      home: {
        ...home,
        possession: home.possession || 50,
        passAccuracy: home.passes > 0 ? Math.round((home.passesCompleted / home.passes) * 100) : 0,
        shotAccuracy: home.shots > 0 ? Math.round((home.shotsOnTarget / home.shots) * 100) : 0
      },
      away: {
        ...away,
        possession: away.possession || 50,
        passAccuracy: away.passes > 0 ? Math.round((away.passesCompleted / away.passes) * 100) : 0,
        shotAccuracy: away.shots > 0 ? Math.round((away.shotsOnTarget / away.shots) * 100) : 0
      }
    };
  }, [matchStats]);

  if (loading.match) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading live statistics...</div>
        </CardContent>
      </Card>
    );
  }

  if (errors.match) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Error loading statistics: {errors.match}</div>
        </CardContent>
      </Card>
    );
  }

  if (!liveStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">No statistics available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Statistics</h2>
          <p className="text-gray-600">Real-time match data and analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshAll()}
            disabled={loading.match}
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={showAdvancedStats ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAdvancedStats ? 'Basic' : 'Advanced'}
          </Button>
        </div>
      </div>

      {/* Main Statistics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Score and Key Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Home Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {homeTeam.logo ? (
                      <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6" />
                    ) : (
                      <Users className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <span>{homeTeam.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{liveStats.home.goals}</div>
                  <div className="text-sm text-gray-600">Goals</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{liveStats.home.shots}</div>
                    <div className="text-sm text-gray-600">Shots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{liveStats.home.possession}%</div>
                    <div className="text-sm text-gray-600">Possession</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Match Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Match Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {liveStats.home.goals} - {liveStats.away.goals}
                  </div>
                  <div className="text-sm text-gray-600">Current Score</div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    <Timer className="w-4 h-4 mr-2" />
                    Live
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Away Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{awayTeam.name}</span>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    {awayTeam.logo ? (
                      <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6" />
                    ) : (
                      <Users className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">{liveStats.away.goals}</div>
                  <div className="text-sm text-gray-600">Goals</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{liveStats.away.shots}</div>
                    <div className="text-sm text-gray-600">Shots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{liveStats.away.possession}%</div>
                    <div className="text-sm text-gray-600">Possession</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Possession Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Possession</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{homeTeam.name}</span>
                    <span className="text-sm font-medium">{liveStats.home.possession}%</span>
                  </div>
                  <Progress value={liveStats.home.possession} className="h-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{awayTeam.name}</span>
                    <span className="text-sm font-medium">{liveStats.away.possession}%</span>
                  </div>
                  <Progress value={liveStats.away.possession} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Shots Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Shots Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{homeTeam.name}</span>
                    <span className="text-sm font-medium">{liveStats.home.shots}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((liveStats.home.shots / Math.max(liveStats.home.shots, liveStats.away.shots, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{awayTeam.name}</span>
                    <span className="text-sm font-medium">{liveStats.away.shots}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((liveStats.away.shots / Math.max(liveStats.home.shots, liveStats.away.shots, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs content */}
        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">Player statistics coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">Team statistics coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">Timeline view coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">Advanced analytics coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
