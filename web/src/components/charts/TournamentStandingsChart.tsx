import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Badge, Button, Table, Form } from 'react-bootstrap';
import { Trophy, TrendingUp, BarChart3, PieChart, Target, Users } from 'lucide-react';
import RealTimeChart, { ChartConfig } from '@web/components/charts/RealTimeChart';

interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
  form: string[]; // Last 5 matches: 'W', 'D', 'L'
  lastMatch: string;
  nextMatch: string;
}

interface TournamentStandingsChartProps {
  standings: TeamStanding[];
  tournamentName: string;
  season: string;
  isLive?: boolean;
  className?: string;
}

export default function TournamentStandingsChart({
  standings,
  tournamentName,
  season,
  isLive = true,
  className = ''
}: TournamentStandingsChartProps) {
  const [selectedView, setSelectedView] = useState<'table' | 'chart' | 'form'>('table');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'doughnut'>('bar');
  const [selectedMetric, setSelectedMetric] = useState<'points' | 'goals' | 'form'>('points');
  const [sortBy, setSortBy] = useState<'position' | 'points' | 'goalsFor' | 'goalDifference'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort standings based on selected criteria
  const sortedStandings = React.useMemo(() => {
    return [...standings].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'position':
          comparison = a.position - b.position;
          break;
        case 'points':
          comparison = a.points - b.points;
          break;
        case 'goalsFor':
          comparison = a.goalsFor - b.goalsFor;
          break;
        case 'goalDifference':
          comparison = a.goalDifference - b.goalDifference;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [standings, sortBy, sortOrder]);

  // Generate chart configurations for different metrics
  const getChartConfig = useCallback((metric: string): ChartConfig => {
    const baseConfig: Partial<ChartConfig> = {
      type: chartType,
      liveUpdate: isLive,
      updateInterval: isLive ? 15000 : undefined, // 15 seconds for live updates
      maxDataPoints: 20,
    };

    switch (metric) {
      case 'points':
        return {
          ...baseConfig,
          title: `${tournamentName} - Points Table`,
          description: 'Current points standings for all teams',
          data: {
            labels: sortedStandings.map(team => team.teamName),
            datasets: [
              {
                label: 'Points',
                data: sortedStandings.map(team => team.points),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
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
                text: 'Team Points',
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
                  stepSize: 3,
                },
              },
            },
          },
        } as ChartConfig;

      case 'goals':
        return {
          ...baseConfig,
          title: `${tournamentName} - Goals Statistics`,
          description: 'Goals scored and conceded by each team',
          data: {
            labels: sortedStandings.map(team => team.teamName),
            datasets: [
              {
                label: 'Goals For',
                data: sortedStandings.map(team => team.goalsFor),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: chartType === 'line' ? 'line' : 'bar',
                fill: chartType === 'line',
                tension: 0.4,
              },
              {
                label: 'Goals Against',
                data: sortedStandings.map(team => team.goalsAgainst),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
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
                text: 'Goals For vs Goals Against',
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
        } as ChartConfig;

      case 'form':
        return {
          ...baseConfig,
          title: `${tournamentName} - Recent Form`,
          description: 'Last 5 matches performance for each team',
          data: {
            labels: sortedStandings.map(team => team.teamName),
            datasets: [
              {
                label: 'Form Points (Last 5)',
                data: sortedStandings.map(team => {
                  return team.form.reduce((total, result) => {
                    switch (result) {
                      case 'W': return total + 3;
                      case 'D': return total + 1;
                      case 'L': return total + 0;
                      default: return total;
                    }
                  }, 0);
                }),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
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
                text: 'Recent Form (Last 5 Matches)',
              },
              legend: {
                display: true,
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 15,
                ticks: {
                  stepSize: 3,
                },
              },
            },
          },
        } as ChartConfig;

      default:
        return baseConfig as ChartConfig;
    }
  }, [tournamentName, sortedStandings, chartType, isLive]);

  // Handle data updates
  const handleDataUpdate = useCallback((newData: any) => {
    console.log('Tournament standings data updated:', newData);
    // In a real app, this would update the standings data
  }, []);

  // Get form display
  const getFormDisplay = (form: string[]) => {
    return form.map((result, index) => (
      <Badge
        key={index}
        bg={result === 'W' ? 'success' : result === 'D' ? 'warning' : 'danger'}
        className="me-1"
        style={{ fontSize: '0.7rem' }}
      >
        {result}
      </Badge>
    ));
  };

  // Get position badge color
  const getPositionBadgeColor = (position: number) => {
    if (position <= 4) return 'success'; // Champions League
    if (position <= 6) return 'info'; // Europa League
    if (position <= 17) return 'secondary'; // Safe
    return 'danger'; // Relegation
  };

  return (
    <div className={`tournament-standings-chart ${className}`}>
      {/* Header */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">{tournamentName} Standings</h5>
              <p className="text-muted mb-0">Season: {season}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={isLive ? 'success' : 'secondary'}>
                {isLive ? 'LIVE' : 'STATIC'}
              </Badge>
              <Badge bg="info">Real-time</Badge>
              <Badge bg="primary">{standings.length} Teams</Badge>
            </div>
          </div>

          {/* View Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Select View:</h6>
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={selectedView === 'table' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setSelectedView('table')}
              >
                <Table size={16} className="me-2" />
                Table View
              </Button>
              <Button
                variant={selectedView === 'chart' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setSelectedView('chart')}
              >
                <BarChart3 size={16} className="me-2" />
                Chart View
              </Button>
              <Button
                variant={selectedView === 'form' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => setSelectedView('form')}
              >
                <TrendingUp size={16} className="me-2" />
                Form View
              </Button>
            </div>
          </div>

          {/* Chart Controls (only show when chart view is selected) */}
          {selectedView === 'chart' && (
            <>
              {/* Metric Selection */}
              <div className="mb-3">
                <h6 className="mb-2">Select Metric:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant={selectedMetric === 'points' ? 'success' : 'outline-success'}
                    size="sm"
                    onClick={() => setSelectedMetric('points')}
                  >
                    <Trophy size={16} className="me-2" />
                    Points
                  </Button>
                  <Button
                    variant={selectedMetric === 'goals' ? 'success' : 'outline-success'}
                    size="sm"
                    onClick={() => setSelectedMetric('goals')}
                  >
                    <Target size={16} className="me-2" />
                    Goals
                  </Button>
                  <Button
                    variant={selectedMetric === 'form' ? 'success' : 'outline-success'}
                    size="sm"
                    onClick={() => setSelectedMetric('form')}
                  >
                    <TrendingUp size={16} className="me-2" />
                    Form
                  </Button>
                </div>
              </div>

              {/* Chart Type Selection */}
              <div className="mb-3">
                <h6 className="mb-2">Chart Type:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant={chartType === 'bar' ? 'warning' : 'outline-warning'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChart3 size={16} className="me-2" />
                    Bar
                  </Button>
                  <Button
                    variant={chartType === 'line' ? 'warning' : 'outline-warning'}
                    size="sm"
                    onClick={() => setChartType('line')}
                  >
                    <TrendingUp size={16} className="me-2" />
                    Line
                  </Button>
                  <Button
                    variant={chartType === 'doughnut' ? 'warning' : 'outline-warning'}
                    size="sm"
                    onClick={() => setChartType('doughnut')}
                  >
                    <PieChart size={16} className="me-2" />
                    Doughnut
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Sorting Controls */}
          <div className="mb-3">
            <h6 className="mb-2">Sort By:</h6>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <Form.Select
                size="sm"
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="position">Position</option>
                <option value="points">Points</option>
                <option value="goalsFor">Goals For</option>
                <option value="goalDifference">Goal Difference</option>
              </Form.Select>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Content based on selected view */}
      {selectedView === 'table' && (
        <Card>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Pts</th>
                    <th>Form</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStandings.map((team) => (
                    <tr key={team.teamId}>
                      <td>
                        <Badge bg={getPositionBadgeColor(team.position)}>
                          {team.position}
                        </Badge>
                      </td>
                      <td>
                        <strong>{team.teamName}</strong>
                      </td>
                      <td>{team.played}</td>
                      <td className="text-success">{team.won}</td>
                      <td className="text-warning">{team.drawn}</td>
                      <td className="text-danger">{team.lost}</td>
                      <td>{team.goalsFor}</td>
                      <td>{team.goalsAgainst}</td>
                      <td className={team.goalDifference >= 0 ? 'text-success' : 'text-danger'}>
                        {team.goalDifference >= 0 ? '+' : ''}{team.goalDifference}
                      </td>
                      <td>
                        <Badge bg="primary" className="fs-6">
                          {team.points}
                        </Badge>
                      </td>
                      <td>{getFormDisplay(team.form)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {selectedView === 'chart' && (
        <RealTimeChart
          config={getChartConfig(selectedMetric)}
          onDataUpdate={handleDataUpdate}
          showControls={true}
          showDownload={true}
        />
      )}

      {selectedView === 'form' && (
        <Card>
          <Card.Body>
            <h6 className="mb-3">Recent Form Analysis</h6>
            <Row>
              {sortedStandings.slice(0, 8).map((team) => (
                <Col md={6} lg={3} key={team.teamId} className="mb-3">
                  <Card className="h-100">
                    <Card.Header className="py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg={getPositionBadgeColor(team.position)}>
                          {team.position}
                        </Badge>
                        <small className="text-muted">{team.points} pts</small>
                      </div>
                    </Card.Header>
                    <Card.Body className="py-2">
                      <h6 className="mb-2">{team.teamName}</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>{getFormDisplay(team.form)}</div>
                        <small className="text-muted">
                          {team.form.filter(f => f === 'W').length}W {team.form.filter(f => f === 'D').length}D {team.form.filter(f => f === 'L').length}L
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Summary Statistics */}
      <Row className="mt-3">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Top Scorer</h6>
              <h5 className="mb-1">
                {sortedStandings.sort((a, b) => b.goalsFor - a.goalsFor)[0]?.teamName}
              </h5>
              <Badge bg="success">
                {sortedStandings.sort((a, b) => b.goalsFor - a.goalsFor)[0]?.goalsFor} goals
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Best Defense</h6>
              <h5 className="mb-1">
                {sortedStandings.sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]?.teamName}
              </h5>
              <Badge bg="info">
                {sortedStandings.sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]?.goalsAgainst} conceded
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">In Form</h6>
              <h5 className="mb-1">
                {sortedStandings.sort((a, b) => {
                  const aForm = a.form.reduce((total, result) => {
                    switch (result) {
                      case 'W': return total + 3;
                      case 'D': return total + 1;
                      case 'L': return total + 0;
                      default: return total;
                    }
                  }, 0);
                  const bForm = b.form.reduce((total, result) => {
                    switch (result) {
                      case 'W': return total + 3;
                      case 'D': return total + 1;
                      case 'L': return total + 0;
                      default: return total;
                    }
                  }, 0);
                  return bForm - aForm;
                })[0]?.teamName}
              </h5>
              <Badge bg="warning">Best form</Badge>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Total Matches</h6>
              <h5 className="mb-1">
                {standings.reduce((total, team) => total + team.played, 0) / 2}
              </h5>
              <Badge bg="secondary">Played</Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
