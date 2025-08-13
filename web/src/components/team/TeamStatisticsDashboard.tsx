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
  Shield,
  Award,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon
} from 'lucide-react';

interface TeamPerformanceMetrics {
  // Basic Match Stats
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  points: number;
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;

  // Goal Statistics
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  cleanSheets: number;
  goalsConceded: number;

  // Performance Metrics
  averagePossession: number;
  averageShots: number;
  averageShotsOnTarget: number;
  averageCorners: number;
  averageFouls: number;
  averageYellowCards: number;
  averageRedCards: number;
  averagePasses: number;
  averagePassAccuracy: number;
  averageTackles: number;
  averageInterceptions: number;
  averageOffsides: number;
  averageSaves: number;
  averageClearances: number;
  averageBlocks: number;
  averageDistance: number;
  averageSprints: number;

  // Advanced Metrics
  shotAccuracy: number;
  passAccuracy: number;
  tackleSuccess: number;
  savePercentage: number;
  possessionEfficiency: number;
  defensiveEfficiency: number;

  // Form and Trends
  currentForm: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  formScore: number;
  unbeatenStreak: number;
  winningStreak: number;
  losingStreak: number;
  goalsScoredStreak: number;
  cleanSheetStreak: number;

  // Home/Away Performance
  homeStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  };
  awayStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  };

  // Season Performance
  seasonProgress: {
    currentPosition: number;
    totalTeams: number;
    pointsFromTop: number;
    pointsFromRelegation: number;
    promotionChance: number;
    relegationRisk: number;
  };
}

interface TeamInsights {
  strengths: Array<{
    category: string;
    metric: string;
    value: number;
    benchmark: number;
    description: string;
  }>;
  weaknesses: Array<{
    category: string;
    metric: string;
    value: number;
    benchmark: number;
    description: string;
  }>;
  opportunities: Array<{
    area: string;
    currentValue: number;
    potentialValue: number;
    improvement: number;
    action: string;
  }>;
  threats: Array<{
    area: string;
    currentValue: number;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    expectedImpact: string;
    timeline: string;
  }>;
}

interface TeamStatisticsDashboardProps {
  teamId: string;
  teamName: string;
  season?: string;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export default function TeamStatisticsDashboard({
  teamId,
  teamName,
  season = 'current',
  onExport
}: TeamStatisticsDashboardProps) {
  const [performance, setPerformance] = useState<TeamPerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<TeamInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>(season);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch team performance and insights
      const [performanceRes, insightsRes] = await Promise.all([
        fetch(`/api/team-statistics/team/${teamId}/performance?season=${selectedSeason}`),
        fetch(`/api/team-statistics/team/${teamId}/insights?season=${selectedSeason}`)
      ]);

      if (!performanceRes.ok || !insightsRes.ok) {
        throw new Error('Failed to fetch team data');
      }

      const [performanceData, insightsData] = await Promise.all([
        performanceRes.json(),
        insightsRes.json()
      ]);

      setPerformance(performanceData.data);
      setInsights(insightsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  }, [teamId, selectedSeason]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export behavior
      const url = `/api/team-statistics/team/${teamId}/export?season=${selectedSeason}&format=${format}`;
      window.open(url, '_blank');
    }
  };

  const renderFormBadge = (form: 'excellent' | 'good' | 'average' | 'poor' | 'terrible') => {
    const formConfig = {
      excellent: { color: 'bg-green-100 text-green-800', icon: TrendingUpIcon },
      good: { color: 'bg-blue-100 text-blue-800', icon: TrendingUpIcon },
      average: { color: 'bg-yellow-100 text-yellow-800', icon: MinusIcon },
      poor: { color: 'bg-orange-100 text-orange-800', icon: TrendingDownIcon },
      terrible: { color: 'bg-red-100 text-red-800', icon: TrendingDownIcon }
    };

    const config = formConfig[form];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {form.charAt(0).toUpperCase() + form.slice(1)}
      </Badge>
    );
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ReactNode,
    trend?: 'up' | 'down' | 'stable',
    color?: string
  ) => (
    <Card className={color}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center">
            {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1 text-green-600" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1 text-red-600" />}
            {trend === 'stable' && <Minus className="w-3 h-3 mr-1 text-gray-600" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Activity className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchTeamData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No team statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{teamName}</h1>
          <p className="text-gray-600">Team Statistics Dashboard</p>
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
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderStatCard('Points', performance.points, `${performance.matchesPlayed} matches`, <Trophy className="w-4 h-4" />)}
        {renderStatCard('Goals For', performance.goalsFor, `${performance.averageGoalsFor.toFixed(1)} per match`, <Target className="w-4 h-4" />)}
        {renderStatCard('Goals Against', performance.goalsAgainst, `${performance.averageGoalsAgainst.toFixed(1)} per match`, <Shield className="w-4 h-4" />)}
        {renderStatCard('Win Rate', `${performance.winPercentage.toFixed(1)}%`, `${performance.matchesWon} wins`, <Award className="w-4 h-4" />)}
      </div>

      {/* Form and Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Form Rating:</span>
              {renderFormBadge(performance.currentForm)}
            </div>
            <div className="flex items-center justify-between">
              <span>Form Score:</span>
              <span className="font-semibold">{performance.formScore.toFixed(1)}/10</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unbeaten Streak:</span>
                <span className="font-medium">{performance.unbeatenStreak}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Winning Streak:</span>
                <span className="font-medium">{performance.winningStreak}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Goals Scored Streak:</span>
                <span className="font-medium">{performance.goalsScoredStreak}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Home Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performance.homeStats.winPercentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold">{performance.homeStats.points}</div>
                <div className="text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{performance.homeStats.goalsFor}</div>
                <div className="text-gray-600">Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Away Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performance.awayStats.winPercentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold">{performance.awayStats.points}</div>
                <div className="text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{performance.awayStats.goalsFor}</div>
                <div className="text-gray-600">Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderStatCard('Possession', `${performance.averagePossession.toFixed(1)}%`, 'Average per match', <BarChart3 className="w-4 h-4" />)}
            {renderStatCard('Shots', performance.averageShots.toFixed(1), 'Average per match', <Target className="w-4 h-4" />)}
            {renderStatCard('Pass Accuracy', `${performance.averagePassAccuracy.toFixed(1)}%`, 'Completed passes', <Zap className="w-4 h-4" />)}
            {renderStatCard('Tackles', performance.averageTackles.toFixed(1), 'Average per match', <Shield className="w-4 h-4" />)}
            {renderStatCard('Clean Sheets', performance.cleanSheets, 'Total this season', <Shield className="w-4 h-4" />)}
            {renderStatCard('Distance', `${(performance.averageDistance / 1000).toFixed(1)}km`, 'Average per match', <Activity className="w-4 h-4" />)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Shot Accuracy</span>
                    <span>{performance.shotAccuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={performance.shotAccuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pass Accuracy</span>
                    <span>{performance.averagePassAccuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={performance.averagePassAccuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Defensive Efficiency</span>
                    <span>{performance.defensiveEfficiency.toFixed(1)}</span>
                  </div>
                  <Progress value={performance.defensiveEfficiency * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Season Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {performance.seasonProgress.currentPosition}
                  </div>
                  <div className="text-sm text-gray-600">
                    of {performance.seasonProgress.totalTeams} teams
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Points from top:</span>
                    <span className="font-medium">{performance.seasonProgress.pointsFromTop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Promotion chance:</span>
                    <span className="font-medium">{performance.seasonProgress.promotionChance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Relegation risk:</span>
                    <span className="font-medium">{performance.seasonProgress.relegationRisk}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.strengths.length > 0 ? (
                    <div className="space-y-3">
                      {insights.strengths.map((strength, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-800">{strength.category}</div>
                          <div className="text-sm text-green-600">{strength.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No strengths identified</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.weaknesses.length > 0 ? (
                    <div className="space-y-3">
                      {insights.weaknesses.map((weakness, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-red-800">{weakness.category}</div>
                          <div className="text-sm text-red-600">{weakness.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No weaknesses identified</p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {insights.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">{rec.category}</span>
                          </div>
                          <div className="font-medium">{rec.action}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Expected Impact: {rec.expectedImpact} | Timeline: {rec.timeline}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recommendations available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Trend analysis will be displayed here. This feature shows how team performance has changed over time.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
