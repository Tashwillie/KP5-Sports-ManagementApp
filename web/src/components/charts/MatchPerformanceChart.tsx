import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Target, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import RealTimeChart, { ChartConfig } from '@web/components/charts/RealTimeChart';

interface MatchPerformanceData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
}

interface MatchPerformanceChartProps {
  data: MatchPerformanceData;
  isLive?: boolean;
  className?: string;
}

export default function MatchPerformanceChart({
  data,
  isLive = true,
  className = ''
}: MatchPerformanceChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'possession' | 'shots' | 'passes' | 'cards'>('possession');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line');

  // Generate chart configurations for different metrics
  const getChartConfig = useCallback((metric: string): ChartConfig => {
    const baseConfig: Partial<ChartConfig> = {
      type: chartType,
      liveUpdate: isLive,
      updateInterval: isLive ? 5000 : undefined, // 5 seconds for live updates
      maxDataPoints: 20,
    };

    switch (metric) {
      case 'possession':
        return {
          ...baseConfig,
          title: 'Match Possession',
          description: 'Real-time ball possession percentage',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: data.homeTeam,
                data: [55, 52, 48, 51, 49, 47, 50],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: data.awayTeam,
                data: [45, 48, 52, 49, 51, 53, 50],
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
                text: 'Ball Possession Over Time',
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
        } as ChartConfig;

      case 'shots':
        return {
          ...baseConfig,
          title: 'Shots & Shots on Target',
          description: 'Shot statistics throughout the match',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: `${data.homeTeam} - Total Shots`,
                data: [0, 2, 4, 6, 8, 10, 12],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                type: 'bar',
              },
              {
                label: `${data.homeTeam} - On Target`,
                data: [0, 1, 2, 3, 4, 5, 6],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                type: 'bar',
              },
              {
                label: `${data.awayTeam} - Total Shots`,
                data: [0, 1, 3, 5, 7, 9, 11],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar',
              },
              {
                label: `${data.awayTeam} - On Target`,
                data: [0, 0, 1, 2, 3, 4, 5],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                type: 'bar',
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Shot Statistics',
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
          title: 'Passing Statistics',
          description: 'Pass completion and accuracy',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: `${data.homeTeam} - Passes`,
                data: [0, 45, 89, 134, 178, 223, 267],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
              },
              {
                label: `${data.awayTeam} - Passes`,
                data: [0, 38, 76, 115, 153, 192, 230],
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
                text: 'Passes Completed',
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
                  stepSize: 50,
                },
              },
            },
          },
        } as ChartConfig;

      case 'cards':
        return {
          ...baseConfig,
          title: 'Disciplinary Actions',
          description: 'Yellow and red cards issued',
          data: {
            labels: ['0\'', '15\'', '30\'', '45\'', '60\'', '75\'', '90\''],
            datasets: [
              {
                label: `${data.homeTeam} - Yellow Cards`,
                data: [0, 0, 1, 1, 2, 2, 2],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                type: 'bar',
              },
              {
                label: `${data.homeTeam} - Red Cards`,
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar',
              },
              {
                label: `${data.awayTeam} - Yellow Cards`,
                data: [0, 1, 1, 2, 2, 3, 3],
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                type: 'bar',
              },
              {
                label: `${data.awayTeam} - Red Cards`,
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                type: 'bar',
              },
            ],
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: 'Cards Issued',
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

      default:
        return baseConfig as ChartConfig;
    }
  }, [data, chartType, isLive]);

  // Handle data updates
  const handleDataUpdate = useCallback((newData: any) => {
    console.log('Match performance data updated:', newData);
    // In a real app, this would update the match data
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

  return (
    <div className={`match-performance-chart ${className}`}>
      {/* Header */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-1">Match Performance Analytics</h5>
              <p className="text-muted mb-0">
                {data.homeTeam} vs {data.awayTeam}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={isLive ? 'success' : 'secondary'}>
                {isLive ? 'LIVE' : 'STATIC'}
              </Badge>
              <Badge bg="info">Real-time</Badge>
            </div>
          </div>

          {/* Metric Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Select Metric:</h6>
            <div className="d-flex flex-wrap gap-2">
              <MetricButton metric="possession" label="Possession" icon={PieChart} />
              <MetricButton metric="shots" label="Shots" icon={Target} />
              <MetricButton metric="passes" label="Passes" icon={TrendingUp} />
              <MetricButton metric="cards" label="Cards" icon={BarChart3} />
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className="mb-3">
            <h6 className="mb-2">Chart Type:</h6>
            <div className="d-flex flex-wrap gap-2">
              <ChartTypeButton type="line" label="Line" icon={TrendingUp} />
              <ChartTypeButton type="bar" label="Bar" icon={BarChart3} />
              <ChartTypeButton type="doughnut" label="Doughnut" icon={PieChart} />
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

      {/* Summary Statistics */}
      <Row className="mt-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">{data.homeTeam} Statistics</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span>Possession:</span>
                  <Badge bg="primary">{data.possession.home}%</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shots:</span>
                  <Badge bg="info">{data.shots.home}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Pass Accuracy:</span>
                  <Badge bg="success">{data.passAccuracy.home}%</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Yellow Cards:</span>
                  <Badge bg="warning">{data.yellowCards.home}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">{data.awayTeam} Statistics</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                  <span>Possession:</span>
                  <Badge bg="primary">{data.possession.away}%</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shots:</span>
                  <Badge bg="info">{data.shots.away}</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Pass Accuracy:</span>
                  <Badge bg="success">{data.passAccuracy.away}%</Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Yellow Cards:</span>
                  <Badge bg="warning">{data.yellowCards.away}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
