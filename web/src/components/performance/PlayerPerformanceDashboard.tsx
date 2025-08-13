import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  Download,
  BarChart3,
  Activity,
  Zap,
  Shield
} from 'lucide-react';

interface PlayerPerformanceMetrics {
  // Basic Stats
  matchesPlayed: number;
  matchesStarted: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  
  // Advanced Stats
  goalsPerMatch: number;
  assistsPerMatch: number;
  minutesPerMatch: number;
  goalContribution: number;
  
  // Performance Ratings
  averageRating: number;
  bestRating: number;
  worstRating: number;
  ratingTrend: 'improving' | 'declining' | 'stable';
  
  // Efficiency Metrics
  shotAccuracy: number;
  passAccuracy: number;
  tackleSuccess: number;
  
  // Physical Metrics
  totalDistance: number;
  averageDistance: number;
  totalSprints: number;
  averageSprints: number;
  
  // Goalkeeper Stats
  goalkeeperStats?: {
    cleanSheets: number;
    goalsConceded: number;
    saves: number;
    savePercentage: number;
    goalsConcededPerMatch: number;
  };
  
  // Form and Consistency
  formScore: number;
  consistencyRating: number;
  lastFiveMatches: Array<{
    matchId: string;
    rating: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
    date: Date;
  }>;
}

interface PerformanceInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface PlayerPerformanceDashboardProps {
  playerId: string;
  playerName: string;
  teamName?: string;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export default function PlayerPerformanceDashboard({
  playerId,
  playerName,
  teamName,
  onExport
}: PlayerPerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PlayerPerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('current');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsResponse, insightsResponse] = await Promise.all([
        fetch(`/api/player-performance/player/${playerId}?season=${selectedSeason}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`/api/player-performance/player/${playerId}/insights?season=${selectedSeason}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (!metricsResponse.ok || !insightsResponse.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const metricsData = await metricsResponse.json();
      const insightsData = await insightsResponse.json();

      setMetrics(metricsData.data.metrics);
      setInsights(insightsData.data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }, [playerId, selectedSeason]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  // Handle export
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export behavior
      const url = `/api/player-performance/export?format=${format}&playerId=${playerId}&season=${selectedSeason}`;
      window.open(url, '_blank');
    }
  };

  // Render rating trend icon
  const renderRatingTrend = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Render stat card
  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ReactNode,
    trend?: 'up' | 'down' | 'neutral'
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trend === 'neutral' && <Minus className="h-3 w-3 text-gray-500" />}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading performance data</p>
          <Button onClick={fetchPerformanceData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{playerName}</h1>
          {teamName && (
            <p className="text-muted-foreground">{teamName}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchPerformanceData} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderStatCard(
          'Matches Played',
          metrics.matchesPlayed,
          `${metrics.matchesStarted} started`,
          <Calendar className="h-4 w-4 text-muted-foreground" />
        )}
        {renderStatCard(
          'Goals',
          metrics.goals,
          `${metrics.goalsPerMatch.toFixed(1)} per match`,
          <Target className="h-4 w-4 text-muted-foreground" />
        )}
        {renderStatCard(
          'Assists',
          metrics.assists,
          `${metrics.assistsPerMatch.toFixed(1)} per match`,
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
        {renderStatCard(
          'Average Rating',
          metrics.averageRating.toFixed(1),
          `Best: ${metrics.bestRating.toFixed(1)}`,
          <Trophy className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Performance Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Form Score</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{metrics.formScore.toFixed(1)}</span>
                    {renderRatingTrend(metrics.ratingTrend)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Consistency</span>
                  <span className="font-semibold">{metrics.consistencyRating.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Goal Contribution</span>
                  <span className="font-semibold">{metrics.goalContribution}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Minutes per Match</span>
                  <span className="font-semibold">{metrics.minutesPerMatch.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Efficiency Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Shot Accuracy</span>
                    <span>{metrics.shotAccuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.shotAccuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Pass Accuracy</span>
                    <span>{metrics.passAccuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.passAccuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Tackle Success</span>
                    <span>{metrics.tackleSuccess.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.tackleSuccess} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Physical Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Physical Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Total Distance</Label>
                    <p className="text-2xl font-bold">
                      {(metrics.totalDistance / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <Label>Average Distance per Match</Label>
                    <p className="text-2xl font-bold">
                      {(metrics.averageDistance / 1000).toFixed(1)} km
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Total Sprints</Label>
                    <p className="text-2xl font-bold">{metrics.totalSprints}</p>
                  </div>
                  <div>
                    <Label>Average Sprints per Match</Label>
                    <p className="text-2xl font-bold">{metrics.averageSprints.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Best Rating</span>
                    <Badge variant="secondary">{metrics.bestRating.toFixed(1)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Rating</span>
                    <Badge variant="default">{metrics.averageRating.toFixed(1)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Worst Rating</span>
                    <Badge variant="destructive">{metrics.worstRating.toFixed(1)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goalkeeper Stats (if applicable) */}
            {metrics.goalkeeperStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Goalkeeper Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Clean Sheets</span>
                      <Badge variant="secondary">{metrics.goalkeeperStats.cleanSheets}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Save Percentage</span>
                      <Badge variant="default">{metrics.goalkeeperStats.savePercentage.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Goals Conceded per Match</span>
                      <Badge variant="destructive">
                        {metrics.goalkeeperStats.goalsConcededPerMatch.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 5 Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.lastFiveMatches.map((match, index) => (
                  <div key={match.matchId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">
                          {new Date(match.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {match.minutesPlayed} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Goals</p>
                        <p className="font-semibold">{match.goals}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Assists</p>
                        <p className="font-semibold">{match.assists}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <Badge variant={match.rating >= 7 ? 'default' : match.rating >= 6 ? 'secondary' : 'destructive'}>
                          {match.rating.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
