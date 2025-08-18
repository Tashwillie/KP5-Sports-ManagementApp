import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Badge, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy, 
  Target, 
  Activity, 
  PieChart,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import RealTimeChart from '@web/components/charts/RealTimeChart';
import MatchPerformanceChart from '@web/components/charts/MatchPerformanceChart';
import PlayerPerformanceChart from '@web/components/charts/PlayerPerformanceChart';
import TournamentStandingsChart from '@web/components/charts/TournamentStandingsChart';

interface AnalyticsDashboardProps {
  className?: string;
  isLive?: boolean;
}

export default function AnalyticsDashboard({
  className = '',
  isLive = true
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock data for demonstration
  const mockMatchData = {
    matchId: 'match-123',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    possession: { home: 52, away: 48 },
    shots: { home: 12, away: 11 },
    shotsOnTarget: { home: 6, away: 5 },
    passes: { home: 267, away: 230 },
    passAccuracy: { home: 89, away: 87 },
    corners: { home: 8, away: 6 },
    fouls: { home: 12, away: 15 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 0 },
    offsides: { home: 3, away: 4 },
  };

  const mockPlayers = [
    {
      playerId: 'player-1',
      name: 'Marcus Rashford',
      position: 'Forward',
      team: 'Manchester United',
      goals: 2,
      assists: 1,
      passes: 78,
      passAccuracy: 92,
      shots: 4,
      shotsOnTarget: 3,
      tackles: 2,
      interceptions: 1,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 90,
      rating: 8.5,
    },
    {
      playerId: 'player-2',
      name: 'Mohamed Salah',
      position: 'Forward',
      team: 'Liverpool',
      goals: 1,
      assists: 0,
      passes: 45,
      passAccuracy: 89,
      shots: 3,
      shotsOnTarget: 2,
      tackles: 1,
      interceptions: 0,
      yellowCards: 1,
      redCards: 0,
      minutesPlayed: 90,
      rating: 7.8,
    },
    {
      playerId: 'player-3',
      name: 'Bruno Fernandes',
      position: 'Midfielder',
      team: 'Manchester United',
      goals: 0,
      assists: 2,
      passes: 89,
      passAccuracy: 94,
      shots: 2,
      shotsOnTarget: 1,
      tackles: 3,
      interceptions: 2,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 90,
      rating: 8.2,
    },
  ];

  const mockStandings = [
    {
      teamId: 'team-1',
      teamName: 'Manchester United',
      played: 20,
      won: 15,
      drawn: 3,
      lost: 2,
      goalsFor: 45,
      goalsAgainst: 18,
      goalDifference: 27,
      points: 48,
      position: 1,
      form: ['W', 'W', 'D', 'W', 'W'],
      lastMatch: '2-1 vs Liverpool',
      nextMatch: 'vs Arsenal',
    },
    {
      teamId: 'team-2',
      teamName: 'Liverpool',
      played: 20,
      won: 14,
      drawn: 4,
      lost: 2,
      goalsFor: 42,
      goalsAgainst: 19,
      goalDifference: 23,
      points: 46,
      position: 2,
      form: ['L', 'W', 'W', 'W', 'D'],
      lastMatch: '1-2 vs Man Utd',
      nextMatch: 'vs Chelsea',
    },
    {
      teamId: 'team-3',
      teamName: 'Arsenal',
      played: 20,
      won: 13,
      drawn: 5,
      lost: 2,
      goalsFor: 38,
      goalsAgainst: 20,
      goalDifference: 18,
      points: 44,
      position: 3,
      form: ['W', 'W', 'D', 'W', 'W'],
      lastMatch: '3-0 vs Chelsea',
      nextMatch: 'vs Man Utd',
    },
    {
      teamId: 'team-4',
      teamName: 'Chelsea',
      played: 20,
      won: 12,
      drawn: 4,
      lost: 4,
      goalsFor: 35,
      goalsAgainst: 22,
      goalDifference: 13,
      points: 40,
      position: 4,
      form: ['L', 'W', 'W', 'D', 'L'],
      lastMatch: '0-3 vs Arsenal',
      nextMatch: 'vs Liverpool',
    },
  ];

  // Overview chart configurations
  const overviewCharts = [
    {
      title: 'League Points Trend',
      description: 'Points progression over the season',
      data: {
        labels: ['Week 1', 'Week 5', 'Week 10', 'Week 15', 'Week 20'],
        datasets: [
          {
            label: 'Manchester United',
            data: [3, 12, 25, 35, 48],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Liverpool',
            data: [3, 11, 23, 33, 46],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Arsenal',
            data: [1, 8, 20, 30, 44],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Season Points Progression',
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
            },
          },
        },
      },
    },
    {
      title: 'Goals Scored vs Conceded',
      description: 'Team offensive and defensive performance',
      data: {
        labels: mockStandings.map(team => team.teamName),
        datasets: [
          {
            label: 'Goals For',
            data: mockStandings.map(team => team.goalsFor),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
          },
          {
            label: 'Goals Against',
            data: mockStandings.map(team => team.goalsAgainst),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Goals Statistics',
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5,
            },
          },
        },
      },
    },
  ];

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Handle data updates
  const handleDataUpdate = useCallback((newData: any) => {
    console.log('Analytics data updated:', newData);
  }, []);

  return (
    <div className={`analytics-dashboard ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">Sports Analytics Dashboard</h4>
              <p className="text-muted mb-0">
                Comprehensive real-time analytics and performance insights
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={isLive ? 'success' : 'secondary'}>
                {isLive ? 'LIVE' : 'STATIC'}
              </Badge>
              <Badge bg="info">Real-time</Badge>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw size={16} className="me-2" />
                Refresh
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
              >
                <Settings size={16} className="me-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <Row>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">Total Teams</h6>
                <h3 className="text-primary">{mockStandings.length}</h3>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">Total Matches</h6>
                <h3 className="text-success">
                  {mockStandings.reduce((total, team) => total + team.played, 0) / 2}
                </h3>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">Total Goals</h6>
                <h3 className="text-warning">
                  {mockStandings.reduce((total, team) => total + team.goalsFor, 0)}
                </h3>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">League Leader</h6>
                <h5 className="text-info">
                  {mockStandings[0]?.teamName}
                </h5>
                <Badge bg="success">{mockStandings[0]?.points} pts</Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'overview')}
        className="mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col lg={8}>
              <RealTimeChart
                config={{
                  ...overviewCharts[0],
                  type: 'line',
                  liveUpdate: isLive,
                  updateInterval: isLive ? 20000 : undefined,
                  maxDataPoints: 25,
                }}
                onDataUpdate={handleDataUpdate}
                showControls={true}
                showDownload={true}
              />
            </Col>
            <Col lg={4}>
              <RealTimeChart
                config={{
                  ...overviewCharts[1],
                  type: 'bar',
                  liveUpdate: isLive,
                  updateInterval: isLive ? 20000 : undefined,
                  maxDataPoints: 20,
                }}
                onDataUpdate={handleDataUpdate}
                showControls={true}
                showDownload={true}
              />
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="match" title="Match Analytics">
          <MatchPerformanceChart
            data={mockMatchData}
            isLive={isLive}
            className="mb-4"
          />
        </Tab>

        <Tab eventKey="players" title="Player Analytics">
          <PlayerPerformanceChart
            players={mockPlayers}
            isLive={isLive}
            className="mb-4"
          />
        </Tab>

        <Tab eventKey="standings" title="League Standings">
          <TournamentStandingsChart
            standings={mockStandings}
            tournamentName="Premier League"
            season="2024/25"
            isLive={isLive}
            className="mb-4"
          />
        </Tab>

        <Tab eventKey="trends" title="Trends & Insights">
          <Row>
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <TrendingUp size={16} className="me-2" />
                    Performance Trends
                  </h6>
                </Card.Header>
                <Card.Body>
                  <RealTimeChart
                    config={{
                      title: 'Team Performance Trends',
                      description: 'Performance metrics over time',
                      type: 'line',
                      data: {
                        labels: ['Week 1', 'Week 5', 'Week 10', 'Week 15', 'Week 20'],
                        datasets: [
                          {
                            label: 'Win Rate %',
                            data: [75, 80, 85, 82, 88],
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            fill: true,
                            tension: 0.4,
                          },
                          {
                            label: 'Goal Conversion %',
                            data: [65, 70, 75, 72, 78],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4,
                          },
                        ],
                      },
                      options: {
                        plugins: {
                          title: {
                            display: true,
                            text: 'Performance Trends',
                          },
                          legend: {
                            display: true,
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: (value) => `${value}%`,
                            },
                          },
                        },
                      },
                      liveUpdate: isLive,
                      updateInterval: isLive ? 25000 : undefined,
                      maxDataPoints: 20,
                    }}
                    onDataUpdate={handleDataUpdate}
                    showControls={true}
                    showDownload={true}
                  />
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <PieChart size={16} className="me-2" />
                    Distribution Analysis
                  </h6>
                </Card.Header>
                <Card.Body>
                  <RealTimeChart
                    config={{
                      title: 'Goal Distribution by Position',
                      description: 'Goals scored by player positions',
                      type: 'doughnut',
                      data: {
                        labels: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
                        datasets: [
                          {
                            label: 'Goals',
                            data: [45, 28, 12, 0],
                            backgroundColor: [
                              'rgba(34, 197, 94, 0.8)',
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(156, 163, 175, 0.8)',
                            ],
                            borderColor: [
                              'rgb(34, 197, 94)',
                              'rgb(59, 130, 246)',
                              'rgb(245, 158, 11)',
                              'rgb(156, 163, 175)',
                            ],
                            borderWidth: 2,
                          },
                        ],
                      },
                      options: {
                        plugins: {
                          title: {
                            display: true,
                            text: 'Goal Distribution',
                          },
                          legend: {
                            display: true,
                            position: 'right',
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      },
                      liveUpdate: isLive,
                      updateInterval: isLive ? 30000 : undefined,
                      maxDataPoints: 10,
                    }}
                    onDataUpdate={handleDataUpdate}
                    showControls={true}
                    showDownload={true}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Footer Actions */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Export & Share</h6>
              <p className="text-muted mb-0">Download reports and share insights</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                <Download size={16} className="me-2" />
                Export PDF
              </Button>
              <Button variant="outline-success" size="sm">
                <Download size={16} className="me-2" />
                Export Excel
              </Button>
              <Button variant="outline-info" size="sm">
                <Download size={16} className="me-2" />
                Share Dashboard
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
