import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Badge, Button, Form, Dropdown } from 'react-bootstrap';
import { User, Target, TrendingUp, Award, Activity, Filter } from 'lucide-react';
import RealTimeChart, { ChartConfig } from './RealTimeChart';

interface PlayerStats {
  playerId: string;
  name: string;
  position: string;
  team: string;
  goals: number;
  assists: number;
  passes: number;
  passAccuracy: number;
  shots: number;
  shotsOnTarget: number;
  tackles: number;
  interceptions: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  rating: number;
}

interface PlayerPerformanceChartProps {
  players: PlayerStats[];
  selectedPlayerId?: string;
  onPlayerSelect?: (playerId: string) => void;
  isLive?: boolean;
  className?: string;
}

export default function PlayerPerformanceChart({
  players,
  selectedPlayerId,
  onPlayerSelect,
  isLive = true,
  className = ''
}: PlayerPerformanceChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'goals' | 'assists' | 'passes' | 'defense' | 'overall'>('goals');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar'>('bar');
  const [timeRange, setTimeRange] = useState<'match' | 'season' | 'career'>('match');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(
    players.find(p => p.playerId === selectedPlayerId) || players[0] || null
  );

  // Handle player selection
  const handlePlayerSelect = useCallback((playerId: string) => {
    const player = players.find(p => p.playerId === playerId);
    if (player) {
      setSelectedPlayer(player);
      if (onPlayerSelect) {
        onPlayerSelect(playerId);
      }
    }
  }, [players, onPlayerSelect]);

  // Generate chart configurations for different metrics
  const getChartConfig = useCallback((metric: string): ChartConfig => {
    if (!selectedPlayer) return {} as ChartConfig;

    const baseConfig: Partial<ChartConfig> = {
      type: chartType,
      liveUpdate: isLive,
      updateInterval: isLive ? 10000 : undefined, // 10 seconds for live updates
      maxDataPoints: 15,
    };

    switch (metric) {
      case 'goals':
        return {
          ...baseConfig,
          title: `${selectedPlayer.name} - Goals & Assists`,
          description: 'Goal scoring and assist performance over time',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: 'Goals',
                data: [0, 0, 1, 1, 2, 2, 2],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                type: chartType === 'line' ? 'line' : 'bar',
                fill: chartType === 'line',
                tension: 0.4,
              },
              {
                label: 'Assists',
                data: [0, 0, 0, 1, 1, 2, 2],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: chartType === 'line' ? 'line' : 'bar',
                fill: chartType === 'line',
                tension: 0.4,
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Goals & Assists Performance',
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
                  stepSize: 1,
                },
              },
            },
          },
        } as ChartConfig;

      case 'passes':
        return {
          ...baseConfig,
          title: `${selectedPlayer.name} - Passing Performance`,
          description: 'Pass completion and accuracy over time',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: 'Passes Completed',
                data: [0, 12, 25, 38, 52, 65, 78],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: 'Pass Accuracy %',
                data: [0, 85, 88, 92, 89, 91, 93],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Passing Statistics',
              },
              legend: {
                display: true,
                position: 'top',
              },
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                ticks: {
                  stepSize: 10,
                },
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`,
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          },
        } as ChartConfig;

      case 'defense':
        return {
          ...baseConfig,
          title: `${selectedPlayer.name} - Defensive Performance`,
          description: 'Tackles, interceptions, and defensive actions',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: 'Tackles',
                data: [0, 1, 2, 3, 4, 5, 6],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: chartType === 'line' ? 'line' : 'bar',
                fill: chartType === 'line',
                tension: 0.4,
              },
              {
                label: 'Interceptions',
                data: [0, 0, 1, 1, 2, 2, 3],
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                type: chartType === 'line' ? 'line' : 'bar',
                fill: chartType === 'line',
                tension: 0.4,
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Defensive Actions',
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
                  stepSize: 1,
                },
              },
            },
          },
        } as ChartConfig;

      case 'overall':
        return {
          ...baseConfig,
          title: `${selectedPlayer.name} - Overall Performance Rating`,
          description: 'Performance rating over time',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: 'Performance Rating',
                data: [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Performance Rating',
              },
              legend: {
                display: true,
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                  stepSize: 1,
                  callback: (value) => value.toFixed(1),
                },
              },
            },
          },
        } as ChartConfig;

      default:
        return baseConfig as ChartConfig;
    }
  }, [selectedPlayer, chartType, isLive]);

  // Handle data updates
  const handleDataUpdate = useCallback((newData: any) => {
    console.log('Player performance data updated:', newData);
    // In a real app, this would update the player data
  }, []);

  // Metric selection buttons
  const MetricButton = ({ metric, label, icon: Icon }: { metric: string; label: string; icon: any }) => (
    <Button
      variant={selectedMetric === metric ? 'primary' : 'outline-primary'}
      size="sm"
      onClick={() => setSelectedMetric(metric as any)}
      className="d-flex align-items-center gap-2"
    >
      <Icon size={16} />
      {label}
    </Button>
  );

  // Chart type selection buttons
  const ChartTypeButton = ({ type, label, icon: Icon }: { type: string; label: string; icon: any }) => (
    <Button
      variant={chartType === type ? 'success' : 'outline-success'}
      size="sm"
      onClick={() => setChartType(type as any)}
      className="d-flex align-items-center gap-2"
    >
      <Icon size={16} />
      {label}
    </Button>
  );

  if (!selectedPlayer) {
    return (
      <Card className={className}>
        <Card.Body className="text-center">
          <p className="text-muted">No player selected</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className={`player-performance-chart ${className}`}>
      {/* Header */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">Player Performance Analytics</h5>
              <p className="text-muted mb-0">
                {selectedPlayer.name} - {selectedPlayer.position} • {selectedPlayer.team}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={isLive ? 'success' : 'secondary'}>
                {isLive ? 'LIVE' : 'STATIC'}
              </Badge>
              <Badge bg="info">Real-time</Badge>
            </div>
          </div>

          {/* Player Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Select Player:</h6>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="player-dropdown">
                <User size={16} className="me-2" />
                {selectedPlayer.name}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {players.map((player) => (
                  <Dropdown.Item
                    key={player.playerId}
                    onClick={() => handlePlayerSelect(player.playerId)}
                    active={player.playerId === selectedPlayer.playerId}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span>{player.name}</span>
                      <Badge bg="secondary" className="ms-auto">
                        {player.position}
                      </Badge>
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Metric Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Select Metric:</h6>
            <div className="d-flex flex-wrap gap-2">
              <MetricButton metric="goals" label="Goals & Assists" icon={Target} />
              <MetricButton metric="passes" label="Passing" icon={TrendingUp} />
              <MetricButton metric="defense" label="Defense" icon={Award} />
              <MetricButton metric="overall" label="Overall" icon={Activity} />
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Chart Type:</h6>
            <div className="d-flex flex-wrap gap-2">
              <ChartTypeButton type="line" label="Line" icon={TrendingUp} />
              <ChartTypeButton type="bar" label="Bar" icon={Activity} />
              <ChartTypeButton type="radar" label="Radar" icon={Award} />
            </div>
          </div>

          {/* Time Range Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Time Range:</h6>
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={timeRange === 'match' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setTimeRange('match')}
              >
                Match
              </Button>
              <Button
                variant={timeRange === 'season' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setTimeRange('season')}
              >
                Season
              </Button>
              <Button
                variant={timeRange === 'career' ? 'warning' : 'outline-warning'}
                size="sm"
                onClick={() => setTimeRange('career')}
              >
                Career
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main Chart */}
      <RealTimeChart
        config={getChartConfig(selectedMetric)}
        onDataUpdate={handleDataUpdate}
        showControls={true}
        showDownload={true}
      />

      {/* Player Statistics Summary */}
      <Row className="mt-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Attack Statistics</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span>Goals:</span>
                  <Badge bg="success">{selectedPlayer.goals}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Assists:</span>
                  <Badge bg="info">{selectedPlayer.assists}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shots:</span>
                  <Badge bg="primary">{selectedPlayer.shots}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shots on Target:</span>
                  <Badge bg="warning">{selectedPlayer.shotsOnTarget}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Performance Metrics</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span>Pass Accuracy:</span>
                  <Badge bg="success">{selectedPlayer.passAccuracy}%</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tackles:</span>
                  <Badge bg="danger">{selectedPlayer.tackles}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Interceptions:</span>
                  <Badge bg="purple">{selectedPlayer.interceptions}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Rating:</span>
                  <Badge bg="warning">{selectedPlayer.rating.toFixed(1)}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Player Info */}
      <Row className="mt-3">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Player Information</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-muted">Position</h6>
                    <Badge bg="primary" className="fs-6">{selectedPlayer.position}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-muted">Team</h6>
                    <Badge bg="info" className="fs-6">{selectedPlayer.team}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-muted">Minutes Played</h6>
                    <Badge bg="success" className="fs-6">{selectedPlayer.minutesPlayed}'</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h6 className="text-muted">Cards</h6>
                    <div className="d-flex gap-1 justify-content-center">
                      <Badge bg="warning">{selectedPlayer.yellowCards}</Badge>
                      <Badge bg="danger">{selectedPlayer.redCards}</Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
