'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Target, 
  Trophy,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import AnalyticsDashboard from '@/components/charts/AnalyticsDashboard';
import MatchPerformanceChart from '@/components/charts/MatchPerformanceChart';
import PlayerPerformanceChart from '@/components/charts/PlayerPerformanceChart';
import TournamentStandingsChart from '@/components/charts/TournamentStandingsChart';
import RealTimeChart from '@/components/charts/RealTimeChart';

export default function ChartsDemoPage() {
  const [isLive, setIsLive] = useState(true);
  const [selectedDemo, setSelectedDemo] = useState('dashboard');

  // Mock data for demonstrations
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

  // Sample chart configurations for individual demos
  const sampleChartConfig = {
    title: 'Sample Real-Time Chart',
    description: 'Demonstrating live data updates',
    type: 'line' as const,
    data: {
      labels: ['0s', '10s', '20s', '30s', '40s', '50s'],
      datasets: [
        {
          label: 'Team A Performance',
          data: [65, 72, 68, 75, 80, 78],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Team B Performance',
          data: [60, 65, 70, 68, 72, 75],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Live Performance Comparison',
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
            callback: (value: any) => `${value}%`,
          },
        },
      },
    },
    liveUpdate: isLive,
    updateInterval: isLive ? 10000 : undefined,
    maxDataPoints: 15,
  };

  const DemoSelector = ({ id, title, description, icon: Icon, isActive }: {
    id: string;
    title: string;
    description: string;
    icon: any;
    isActive: boolean;
  }) => (
    <Card 
      className={`demo-selector ${isActive ? 'border-primary' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={() => setSelectedDemo(id)}
    >
      <Card.Body className="text-center">
        <Icon size={24} className={`mb-2 ${isActive ? 'text-primary' : 'text-muted'}`} />
        <h6 className={isActive ? 'text-primary' : ''}>{title}</h6>
        <small className="text-muted">{description}</small>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Advanced Charts & Visualizations</h2>
              <p className="text-muted mb-0">
                Chart.js powered real-time analytics for sports management
              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Badge bg={isLive ? 'success' : 'secondary'} className="fs-6">
                {isLive ? 'LIVE' : 'STATIC'}
              </Badge>
              <Button
                variant={isLive ? 'success' : 'outline-success'}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? 'Live Mode' : 'Static Mode'}
              </Button>
              <Button variant="outline-primary">
                <Download size={16} className="me-2" />
                Export All
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Demo Selector */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h6 className="mb-3">Select Demo:</h6>
              <Row>
                <Col md={2}>
                  <DemoSelector
                    id="dashboard"
                    title="Full Dashboard"
                    description="Complete analytics overview"
                    icon={BarChart3}
                    isActive={selectedDemo === 'dashboard'}
                  />
                </Col>
                <Col md={2}>
                  <DemoSelector
                    id="match"
                    title="Match Analytics"
                    description="Live match performance"
                    icon={Target}
                    isActive={selectedDemo === 'match'}
                  />
                </Col>
                <Col md={2}>
                  <DemoSelector
                    id="players"
                    title="Player Analytics"
                    description="Individual performance"
                    icon={Activity}
                    isActive={selectedDemo === 'players'}
                  />
                </Col>
                <Col md={2}>
                  <DemoSelector
                    id="standings"
                    title="League Standings"
                    description="Tournament rankings"
                    icon={Trophy}
                    isActive={selectedDemo === 'standings'}
                  />
                </Col>
                <Col md={2}>
                  <DemoSelector
                    id="individual"
                    title="Individual Charts"
                    description="Single chart examples"
                    icon={TrendingUp}
                    isActive={selectedDemo === 'individual'}
                  />
                </Col>
                <Col md={2}>
                  <DemoSelector
                    id="comparison"
                    title="Chart Comparison"
                    description="Different chart types"
                    icon={PieChart}
                    isActive={selectedDemo === 'comparison'}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Demo Content */}
      {selectedDemo === 'dashboard' && (
        <AnalyticsDashboard isLive={isLive} />
      )}

      {selectedDemo === 'match' && (
        <Row>
          <Col>
            <MatchPerformanceChart
              data={mockMatchData}
              isLive={isLive}
            />
          </Col>
        </Row>
      )}

      {selectedDemo === 'players' && (
        <Row>
          <Col>
            <PlayerPerformanceChart
              players={mockPlayers}
              isLive={isLive}
            />
          </Col>
        </Row>
      )}

      {selectedDemo === 'standings' && (
        <Row>
          <Col>
            <TournamentStandingsChart
              standings={mockStandings}
              tournamentName="Premier League"
              season="2024/25"
              isLive={isLive}
            />
          </Col>
        </Row>
      )}

      {selectedDemo === 'individual' && (
        <Row>
          <Col lg={8}>
            <RealTimeChart
              config={sampleChartConfig}
              showControls={true}
              showDownload={true}
            />
          </Col>
          <Col lg={4}>
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">Chart Features</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="success">Live Updates</Badge>
                    <span>Real-time data streaming</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="info">Interactive</Badge>
                    <span>Hover tooltips & zoom</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="warning">Responsive</Badge>
                    <span>Mobile-friendly design</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="primary">Exportable</Badge>
                    <span>PNG, PDF, Excel</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {selectedDemo === 'comparison' && (
        <Row>
          <Col lg={6}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Line Chart - Performance Trends</h6>
              </Card.Header>
              <Card.Body>
                <RealTimeChart
                  config={{
                    ...sampleChartConfig,
                    type: 'line',
                    title: 'Performance Trends',
                    description: 'Line chart showing trends over time',
                  }}
                  showControls={true}
                  showDownload={true}
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Bar Chart - Comparison</h6>
              </Card.Header>
              <Card.Body>
                <RealTimeChart
                  config={{
                    ...sampleChartConfig,
                    type: 'bar',
                    title: 'Performance Comparison',
                    description: 'Bar chart for easy comparison',
                  }}
                  showControls={true}
                  showDownload={true}
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Doughnut Chart - Distribution</h6>
              </Card.Header>
              <Card.Body>
                <RealTimeChart
                  config={{
                    title: 'Performance Distribution',
                    description: 'Doughnut chart for proportions',
                    type: 'doughnut',
                    data: {
                      labels: ['Excellent', 'Good', 'Average', 'Below Average'],
                      datasets: [
                        {
                          label: 'Performance',
                          data: [30, 40, 20, 10],
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                          ],
                          borderColor: [
                            'rgb(34, 197, 94)',
                            'rgb(59, 130, 246)',
                            'rgb(245, 158, 11)',
                            'rgb(239, 68, 68)',
                          ],
                          borderWidth: 2,
                        },
                      ],
                    },
                    options: {
                      plugins: {
                        title: {
                          display: true,
                          text: 'Performance Distribution',
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
                    updateInterval: isLive ? 15000 : undefined,
                    maxDataPoints: 10,
                  }}
                  showControls={true}
                  showDownload={true}
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Radar Chart - Multi-dimensional</h6>
              </Card.Header>
              <Card.Body>
                <RealTimeChart
                  config={{
                    title: 'Multi-dimensional Analysis',
                    description: 'Radar chart for multiple metrics',
                    type: 'radar',
                    data: {
                      labels: ['Speed', 'Strength', 'Technique', 'Tactics', 'Fitness'],
                      datasets: [
                        {
                          label: 'Player A',
                          data: [85, 75, 90, 80, 88],
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          pointBackgroundColor: 'rgb(59, 130, 246)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgb(59, 130, 246)',
                        },
                        {
                          label: 'Player B',
                          data: [90, 80, 75, 85, 82],
                          borderColor: 'rgb(239, 68, 68)',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          pointBackgroundColor: 'rgb(239, 68, 68)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgb(239, 68, 68)',
                        },
                      ],
                    },
                    options: {
                      plugins: {
                        title: {
                          display: true,
                          text: 'Player Comparison',
                        },
                        legend: {
                          display: true,
                          position: 'top',
                        },
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            stepSize: 20,
                          },
                        },
                      },
                    },
                    liveUpdate: isLive,
                    updateInterval: isLive ? 20000 : undefined,
                    maxDataPoints: 10,
                  }}
                  showControls={true}
                  showDownload={true}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Technical Information */}
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Technical Information</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Chart.js Features</h6>
                  <ul className="list-unstyled">
                    <li>✅ Real-time data updates</li>
                    <li>✅ Multiple chart types (Line, Bar, Doughnut, Radar)</li>
                    <li>✅ Interactive tooltips and legends</li>
                    <li>✅ Responsive design</li>
                    <li>✅ Export functionality</li>
                    <li>✅ Customizable styling</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Sports Analytics</h6>
                  <ul className="list-unstyled">
                    <li>✅ Match performance tracking</li>
                    <li>✅ Player statistics</li>
                    <li>✅ Tournament standings</li>
                    <li>✅ Real-time updates</li>
                    <li>✅ Multi-metric analysis</li>
                    <li>✅ Performance trends</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
