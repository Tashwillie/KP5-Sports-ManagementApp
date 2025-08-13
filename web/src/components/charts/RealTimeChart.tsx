import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { RefreshCw, Play, Pause, Settings, Download } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'radar' | 'scatter';
  title: string;
  description?: string;
  data: ChartData<any>;
  options: ChartOptions<any>;
  updateInterval?: number; // milliseconds
  maxDataPoints?: number;
  liveUpdate?: boolean;
}

interface RealTimeChartProps {
  config: ChartConfig;
  onDataUpdate?: (newData: any) => void;
  className?: string;
  showControls?: boolean;
  showDownload?: boolean;
}

export default function RealTimeChart({
  config,
  onDataUpdate,
  className = '',
  showControls = true,
  showDownload = true
}: RealTimeChartProps) {
  const chartRef = useRef<ChartJS>(null);
  const [isLive, setIsLive] = useState(config.liveUpdate ?? true);
  const [isPaused, setIsPaused] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle live updates
  const startLiveUpdates = useCallback(() => {
    if (!isLive || isPaused || !config.updateInterval) return;

    updateIntervalRef.current = setInterval(() => {
      if (chartRef.current && !isPaused) {
        // Simulate data update (in real app, this would come from WebSocket)
        const newData = generateNewDataPoint(config);
        updateChartData(newData);
        setUpdateCount(prev => prev + 1);
        setLastUpdate(new Date());
        
        if (onDataUpdate) {
          onDataUpdate(newData);
        }
      }
    }, config.updateInterval);
  }, [isLive, isPaused, config.updateInterval, config, onDataUpdate]);

  const stopLiveUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  // Update chart data
  const updateChartData = useCallback((newData: any) => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    
    // Add new data point
    if (config.type === 'line' || config.type === 'bar') {
      const datasets = chart.data.datasets;
      const labels = chart.data.labels as string[];
      
      // Add new label
      const newLabel = new Date().toLocaleTimeString();
      labels.push(newLabel);
      
      // Add new data to each dataset
      datasets.forEach((dataset, index) => {
        if (dataset.data) {
          (dataset.data as number[]).push(newData[index] || Math.random() * 100);
        }
      });
      
      // Limit data points if specified
      if (config.maxDataPoints && labels.length > config.maxDataPoints) {
        labels.shift();
        datasets.forEach(dataset => {
          if (dataset.data) {
            (dataset.data as number[]).shift();
          }
        });
      }
      
      chart.update('none'); // Update without animation for performance
    }
  }, [config.type, config.maxDataPoints]);

  // Toggle live updates
  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev);
  }, []);

  // Toggle pause
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Refresh chart
  const refreshChart = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.update();
      setUpdateCount(0);
      setLastUpdate(new Date());
    }
  }, []);

  // Download chart as image
  const downloadChart = useCallback(() => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  }, [config.title]);

  // Effect for live updates
  useEffect(() => {
    if (isLive && !isPaused) {
      startLiveUpdates();
    } else {
      stopLiveUpdates();
    }

    return () => {
      stopLiveUpdates();
    };
  }, [isLive, isPaused, startLiveUpdates, stopLiveUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveUpdates();
    };
  }, [stopLiveUpdates]);

  return (
    <Card className={`real-time-chart ${className}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0">{config.title}</h6>
          {config.description && (
            <small className="text-muted">{config.description}</small>
          )}
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {/* Live Status Badge */}
          <Badge bg={isLive ? 'success' : 'secondary'}>
            {isLive ? 'LIVE' : 'STATIC'}
          </Badge>
          
          {/* Update Counter */}
          <small className="text-muted">
            Updates: {updateCount}
          </small>
          
          {/* Last Update Time */}
          <small className="text-muted">
            {lastUpdate.toLocaleTimeString()}
          </small>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Chart Container */}
        <div className="chart-container" style={{ position: 'relative', height: '400px' }}>
          <Chart
            ref={chartRef}
            type={config.type}
            data={config.data}
            options={{
              ...config.options,
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: isLive ? 0 : 750 // Disable animation for live updates
              },
              plugins: {
                ...config.options.plugins,
                legend: {
                  ...config.options.plugins?.legend,
                  position: 'top' as const,
                },
                tooltip: {
                  ...config.options.plugins?.tooltip,
                  mode: 'index' as const,
                  intersect: false,
                },
              },
              scales: {
                ...config.options.scales,
                x: {
                  ...config.options.scales?.x,
                  grid: {
                    ...config.options.scales?.x?.grid,
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                },
                y: {
                  ...config.options.scales?.y,
                  grid: {
                    ...config.options.scales?.y?.grid,
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                },
              },
            }}
          />
        </div>
        
        {/* Controls */}
        {showControls && (
          <Row className="mt-3">
            <Col className="d-flex justify-content-center gap-2">
              <Button
                variant={isLive ? 'success' : 'outline-success'}
                size="sm"
                onClick={toggleLive}
              >
                {isLive ? 'Live' : 'Static'}
              </Button>
              
              {isLive && (
                <Button
                  variant={isPaused ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={togglePause}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              
              <Button
                variant="outline-primary"
                size="sm"
                onClick={refreshChart}
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
              
              {showDownload && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={downloadChart}
                >
                  <Download size={14} />
                  Download
                </Button>
              )}
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

// Helper function to generate new data points for live updates
function generateNewDataPoint(config: ChartConfig): number[] {
  const datasets = config.data.datasets;
  const dataPoints: number[] = [];
  
  datasets.forEach((dataset, index) => {
    if (dataset.data && Array.isArray(dataset.data)) {
      const lastValue = dataset.data[dataset.data.length - 1] as number;
      const variation = (Math.random() - 0.5) * 20; // ±10 variation
      dataPoints.push(Math.max(0, lastValue + variation));
    } else {
      dataPoints.push(Math.random() * 100);
    }
  });
  
  return dataPoints;
}
