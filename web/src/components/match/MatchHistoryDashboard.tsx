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
  Calendar,
  Download,
  BarChart3,
  Activity,
  Users,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  FileText,
  PieChart,
  LineChart,
} from 'lucide-react';

interface MatchSummary {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  homeTeam?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  location?: string;
  totalEvents: number;
  totalParticipants: number;
  duration?: number;
  tournament?: {
    id: string;
    name: string;
    round?: number;
  };
}

interface MatchReport {
  summary: {
    totalMatches: number;
    completedMatches: number;
    cancelledMatches: number;
    postponedMatches: number;
    totalGoals: number;
    averageGoalsPerMatch: number;
    totalParticipants: number;
    averageParticipantsPerMatch: number;
    totalDuration: number;
    averageMatchDuration: number;
    winPercentage: number;
    drawPercentage: number;
    lossPercentage: number;
  };
  teamPerformance: Array<{
    teamId: string;
    teamName: string;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    winPercentage: number;
    form: string;
    lastMatch: Date;
  }>;
  playerPerformance: Array<{
    playerId: string;
    playerName: string;
    teamName: string;
    matchesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    averageRating: number;
    totalMinutes: number;
    averageMinutes: number;
    goalContribution: number;
  }>;
  eventAnalysis: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByMinute: Array<{
      minute: number;
      count: number;
      percentage: number;
    }>;
    eventsByTeam: Array<{
      teamId: string;
      teamName: string;
      eventCount: number;
      eventTypes: Record<string, number>;
    }>;
    mostActivePlayers: Array<{
      playerId: string;
      playerName: string;
      eventCount: number;
      eventTypes: Record<string, number>;
    }>;
  };
  trends: {
    matchesByPeriod: Array<{
      period: string;
      count: number;
      averageGoals: number;
      averageDuration: number;
      winPercentage: number;
      totalParticipants: number;
    }>;
    performanceByPeriod: Array<{
      period: string;
      averageGoals: number;
      averageDuration: number;
      winPercentage: number;
      totalEvents: number;
    }>;
    teamFormTrends: Array<{
      teamId: string;
      teamName: string;
      form: string;
      trend: 'improving' | 'declining' | 'stable';
      lastFiveMatches: Array<{
        matchId: string;
        result: 'win' | 'draw' | 'loss';
        goalsFor: number;
        goalsAgainst: number;
        date: Date;
      }>;
    }>;
  };
  insights: {
    keyFindings: string[];
    performanceHighlights: string[];
    areasForImprovement: string[];
    recommendations: string[];
    statisticalSignificance: {
      high: string[];
      medium: string[];
      low: string[];
    };
  };
  charts: {
    matchTrends: any;
    teamPerformance: any;
    playerRankings: any;
    eventDistribution: any;
    goalScoringPatterns: any;
  };
}

interface MatchHistoryDashboardProps {
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export default function MatchHistoryDashboard({ onExport }: MatchHistoryDashboardProps) {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [report, setReport] = useState<MatchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    teamId: '',
    playerId: '',
    tournamentId: '',
    matchStatus: [] as string[],
    eventTypes: [] as string[],
    location: '',
  });

  // Report options
  const [reportOptions, setReportOptions] = useState({
    includeCharts: true,
    includeInsights: true,
    includeRecommendations: true,
    groupBy: 'month' as 'day' | 'week' | 'month' | 'quarter' | 'year',
  });

  const fetchMatchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.teamId) queryParams.append('teamId', filters.teamId);
      if (filters.playerId) queryParams.append('playerId', filters.playerId);
      if (filters.tournamentId) queryParams.append('tournamentId', filters.tournamentId);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.matchStatus.length > 0) {
        filters.matchStatus.forEach(status => queryParams.append('matchStatus', status));
      }
      if (filters.eventTypes.length > 0) {
        filters.eventTypes.forEach(type => queryParams.append('eventTypes', type));
      }

      const response = await fetch(`/api/match-history?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch match history');
      
      const data = await response.json();
      setMatches(data.data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch match history');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const generateReport = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.teamId) queryParams.append('teamId', filters.teamId);
      if (filters.playerId) queryParams.append('playerId', filters.playerId);
      if (filters.tournamentId) queryParams.append('tournamentId', filters.tournamentId);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.matchStatus.length > 0) {
        filters.matchStatus.forEach(status => queryParams.append('matchStatus', status));
      }
      if (filters.eventTypes.length > 0) {
        filters.eventTypes.forEach(type => queryParams.append('eventTypes', type));
      }

      const response = await fetch(`/api/match-history/report?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      setReport(data.data || null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMatchHistory();
  }, [fetchMatchHistory]);

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export behavior
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      window.open(`/api/match-history/export/${format}?${queryParams.toString()}`, '_blank');
    }
  };

  const renderMatchCard = (match: MatchSummary) => (
    <Card key={match.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant={match.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {match.status}
            </Badge>
            {match.tournament && (
              <Badge variant="outline">{match.tournament.name}</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(match.startTime).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="font-semibold">{match.homeTeam?.name || 'TBD'}</div>
              <div className="text-2xl font-bold">{match.homeTeam?.score || '-'}</div>
            </div>
            <div className="text-muted-foreground">vs</div>
            <div className="text-center">
              <div className="font-semibold">{match.awayTeam?.name || 'TBD'}</div>
              <div className="text-2xl font-bold">{match.awayTeam?.score || '-'}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{match.totalParticipants} participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>{match.totalEvents} events</span>
          </div>
          {match.duration && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{match.duration} min</span>
            </div>
          )}
        </div>

        {match.location && (
          <div className="mt-2 text-sm text-muted-foreground">
            📍 {match.location}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderReportSummary = () => {
    if (!report) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{report.summary.totalMatches}</div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{report.summary.totalGoals}</div>
                <div className="text-sm text-muted-foreground">Total Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{report.summary.totalParticipants}</div>
                <div className="text-sm text-muted-foreground">Total Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{report.summary.averageGoalsPerMatch}</div>
                <div className="text-sm text-muted-foreground">Avg Goals/Match</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTeamPerformance = () => {
    if (!report) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Team Performance</h3>
        <div className="grid gap-4">
          {report.teamPerformance.slice(0, 10).map((team) => (
            <Card key={team.teamId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{team.teamName}</div>
                    <div className="text-sm text-muted-foreground">
                      {team.matchesPlayed} matches • {team.points} points
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{team.winPercentage}%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{team.wins}W</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Minus className="w-4 h-4 text-yellow-500" />
                    <span>{team.draws}D</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span>{team.losses}L</span>
                  </div>
                  <div className="text-muted-foreground">
                    Form: {team.form}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPlayerPerformance = () => {
    if (!report) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Top Players</h3>
        <div className="grid gap-4">
          {report.playerPerformance.slice(0, 10).map((player) => (
            <Card key={player.playerId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{player.playerName}</div>
                    <div className="text-sm text-muted-foreground">{player.teamName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{player.goals}</div>
                    <div className="text-sm text-muted-foreground">Goals</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>{player.assists} assists</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>{player.matchesPlayed} matches</span>
                  </div>
                  <div className="text-muted-foreground">
                    Rating: {player.averageRating}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderEventAnalysis = () => {
    if (!report) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(report.eventAnalysis.eventsByType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Most Active Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.eventAnalysis.mostActivePlayers.slice(0, 8).map((player) => (
                  <div key={player.playerId} className="flex items-center justify-between">
                    <span className="text-sm">{player.playerName}</span>
                    <Badge variant="secondary">{player.eventCount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (!report) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Insights & Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.insights.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{finding}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <div className="text-muted-foreground">Loading match history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading match history</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <Button onClick={fetchMatchHistory} className="mt-2">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Match History & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of match performance and statistics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={generateReport} disabled={loading}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Search by location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="groupBy">Group By</Label>
              <Select
                value={reportOptions.groupBy}
                onValueChange={(value: 'day' | 'week' | 'month' | 'quarter' | 'year') =>
                  setReportOptions(prev => ({ ...prev, groupBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {report && renderReportSummary()}
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{matches.length}</div>
                  <div className="text-sm text-muted-foreground">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {matches.filter(m => m.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {matches.reduce((sum, m) => sum + (m.homeTeam?.score || 0) + (m.awayTeam?.score || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {matches.reduce((sum, m) => sum + m.totalParticipants, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="grid gap-4">
            {matches.map(renderMatchCard)}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          {report ? renderTeamPerformance() : (
            <div className="text-center text-muted-foreground py-8">
              Generate a report to view team performance data
            </div>
          )}
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          {report ? renderPlayerPerformance() : (
            <div className="text-center text-muted-foreground py-8">
              Generate a report to view player performance data
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {report ? (
            <>
              {renderEventAnalysis()}
              {renderInsights()}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Generate a report to view analysis and insights
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

