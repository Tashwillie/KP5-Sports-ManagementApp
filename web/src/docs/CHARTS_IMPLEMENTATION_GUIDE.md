# Advanced Charts & Visualizations Implementation Guide

This guide documents the comprehensive Chart.js integration for real-time sports analytics in the KP5 Academy platform.

## 🎯 Overview

The platform now includes a complete charting system built with **Chart.js** and **react-chartjs-2**, providing:

- **Real-time data visualization** with live updates
- **Multiple chart types** (Line, Bar, Doughnut, Radar)
- **Interactive analytics** for match performance, player stats, and tournament standings
- **Responsive design** that works on all devices
- **Export functionality** for reports and sharing

## 🏗️ Architecture

### Core Components

1. **`RealTimeChart`** - Base chart component with live update capabilities
2. **`MatchPerformanceChart`** - Specialized charts for match analytics
3. **`PlayerPerformanceChart`** - Individual player performance visualization
4. **`TournamentStandingsChart`** - League table and standings charts
5. **`AnalyticsDashboard`** - Comprehensive dashboard combining all charts

### Dependencies

```json
{
  "chart.js": "^4.x.x",
  "react-chartjs-2": "^5.x.x"
}
```

## 📊 Chart Types & Features

### 1. Real-Time Chart Component

**File:** `src/components/charts/RealTimeChart.tsx`

**Features:**
- Live data updates with configurable intervals
- Multiple chart types (line, bar, doughnut, radar)
- Interactive controls (play/pause, refresh, download)
- Responsive design with smooth animations
- Data point limiting for performance

**Usage:**
```tsx
import RealTimeChart from '@/components/charts/RealTimeChart';

const chartConfig = {
  type: 'line',
  title: 'Performance Chart',
  description: 'Real-time performance data',
  data: { /* Chart.js data structure */ },
  options: { /* Chart.js options */ },
  liveUpdate: true,
  updateInterval: 5000, // 5 seconds
  maxDataPoints: 20
};

<RealTimeChart
  config={chartConfig}
  onDataUpdate={handleDataUpdate}
  showControls={true}
  showDownload={true}
/>
```

### 2. Match Performance Chart

**File:** `src/components/charts/MatchPerformanceChart.tsx`

**Features:**
- Possession tracking over time
- Shot statistics (total vs on-target)
- Passing performance and accuracy
- Disciplinary actions (cards)
- Real-time match state updates

**Metrics Available:**
- **Possession**: Ball possession percentage over time
- **Shots**: Total shots and shots on target
- **Passes**: Pass completion and accuracy
- **Cards**: Yellow and red card tracking

**Chart Types:**
- Line charts for time-based metrics
- Bar charts for comparison data
- Doughnut charts for distribution

### 3. Player Performance Chart

**File:** `src/components/charts/PlayerPerformanceChart.tsx`

**Features:**
- Individual player statistics
- Performance trends over time
- Multi-dimensional analysis
- Role-based metrics

**Metrics Available:**
- **Attack**: Goals, assists, shots, accuracy
- **Passing**: Passes completed, accuracy percentage
- **Defense**: Tackles, interceptions, cards
- **Overall**: Performance rating trends

**Time Ranges:**
- Match performance
- Season statistics
- Career overview

### 4. Tournament Standings Chart

**File:** `src/components/charts/TournamentStandingsChart.tsx`

**Features:**
- League table visualization
- Points progression over time
- Goal statistics comparison
- Recent form analysis

**Views Available:**
- **Table View**: Traditional standings table
- **Chart View**: Visual representation of data
- **Form View**: Recent performance analysis

**Sorting Options:**
- Position
- Points
- Goals For
- Goal Difference

### 5. Analytics Dashboard

**File:** `src/components/charts/AnalyticsDashboard.tsx`

**Features:**
- Comprehensive overview of all metrics
- Tabbed interface for different analytics
- Quick statistics summary
- Export and sharing capabilities

**Tabs:**
- **Overview**: League trends and key metrics
- **Match Analytics**: Live match performance
- **Player Analytics**: Individual player stats
- **League Standings**: Tournament rankings
- **Trends & Insights**: Performance analysis

## 🔧 Configuration & Customization

### Chart Configuration Object

```typescript
interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'radar' | 'scatter';
  title: string;
  description?: string;
  data: ChartData<any>;
  options: ChartOptions<any>;
  updateInterval?: number; // milliseconds
  maxDataPoints?: number;
  liveUpdate?: boolean;
}
```

### Live Update Configuration

```typescript
// Enable live updates every 5 seconds
const config = {
  liveUpdate: true,
  updateInterval: 5000,
  maxDataPoints: 20
};

// Disable live updates
const config = {
  liveUpdate: false
};
```

### Chart Options Customization

```typescript
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Chart Title'
    },
    legend: {
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value) => `${value}%`
      }
    }
  },
  responsive: true,
  maintainAspectRatio: false
};
```

## 🎨 Styling & Theming

### CSS Classes

```css
/* Chart container */
.real-time-chart
.chart-container

/* Demo selector */
.demo-selector
.demo-selector.border-primary

/* Analytics dashboard */
.analytics-dashboard .card

/* Chart controls */
.chart-controls

/* Performance metrics */
.performance-metric
.performance-metric .metric-value
.performance-metric .metric-label

/* Live indicators */
.live-indicator
```

### Color Schemes

**Primary Colors:**
- Success: `rgb(34, 197, 94)` - Green for positive metrics
- Info: `rgb(59, 130, 246)` - Blue for neutral data
- Warning: `rgb(245, 158, 11)` - Yellow for caution
- Danger: `rgb(239, 68, 68)` - Red for negative metrics

**Transparency:**
- Background: `rgba(color, 0.1)` for filled areas
- Borders: `rgba(color, 0.8)` for chart elements

## 📱 Responsive Design

### Mobile Optimization

- Charts automatically resize for mobile devices
- Touch-friendly controls and interactions
- Optimized data point density for small screens
- Responsive button layouts

### Breakpoint Considerations

```css
@media (max-width: 768px) {
  .chart-container {
    min-height: 300px;
  }
  
  .chart-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

## 🚀 Performance Optimization

### Data Management

- **Data Point Limiting**: Configurable maximum data points
- **Update Throttling**: Configurable update intervals
- **Memory Management**: Automatic cleanup of old data
- **Animation Control**: Disabled for live updates

### Best Practices

1. **Limit Data Points**: Use `maxDataPoints` to prevent memory issues
2. **Optimize Update Frequency**: Balance real-time updates with performance
3. **Use Appropriate Chart Types**: Choose chart types based on data characteristics
4. **Implement Data Caching**: Cache frequently accessed data

## 📤 Export & Sharing

### Export Formats

- **PNG**: High-quality image export
- **PDF**: Report generation (future enhancement)
- **Excel**: Data export (future enhancement)

### Export Implementation

```typescript
const downloadChart = useCallback(() => {
  if (chartRef.current) {
    const link = document.createElement('a');
    link.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = chartRef.current.toBase64Image();
    link.click();
  }
}, [config.title]);
```

## 🔌 Integration with WebSocket

### Real-Time Data Flow

1. **WebSocket Connection**: Establishes real-time connection
2. **Data Reception**: Receives live updates from backend
3. **Chart Updates**: Updates chart data without full re-render
4. **State Management**: Manages chart state and animations

### WebSocket Events

```typescript
// Subscribe to match events
const unsubscribe = subscribeToMatchEvents(matchId, (event) => {
  // Update chart data
  updateChartData(event);
});

// Subscribe to match state
const unsubscribe = subscribeToMatchState(matchId, (state) => {
  // Update chart configuration
  updateChartConfig(state);
});
```

## 🧪 Testing & Development

### Demo Page

**Route:** `/charts-demo`

**Features:**
- Interactive demo selector
- Live/static mode toggle
- Individual component testing
- Chart type comparison
- Performance monitoring

### Development Tools

1. **Browser DevTools**: Chart.js debugging
2. **React DevTools**: Component state inspection
3. **Performance Profiling**: Chart update monitoring
4. **Responsive Testing**: Device simulation

## 📚 API Reference

### RealTimeChart Props

```typescript
interface RealTimeChartProps {
  config: ChartConfig;
  onDataUpdate?: (newData: any) => void;
  className?: string;
  showControls?: boolean;
  showDownload?: boolean;
}
```

### Chart Configuration Methods

```typescript
// Update chart data
updateChartData(newData: any): void;

// Toggle live updates
toggleLive(): void;

// Pause/resume updates
togglePause(): void;

// Refresh chart
refreshChart(): void;

// Download chart
downloadChart(): void;
```

## 🚧 Future Enhancements

### Planned Features

1. **Advanced Chart Types**: Scatter plots, bubble charts
2. **Interactive Annotations**: Click-to-annotate functionality
3. **Data Filtering**: Advanced filtering and search
4. **Custom Themes**: User-configurable color schemes
5. **Batch Operations**: Multiple chart operations
6. **Real-Time Collaboration**: Multi-user chart editing

### Performance Improvements

1. **Web Workers**: Background data processing
2. **Virtual Scrolling**: Large dataset handling
3. **Lazy Loading**: On-demand chart rendering
4. **Data Compression**: Optimized data transfer

## 🐛 Troubleshooting

### Common Issues

1. **Charts Not Rendering**
   - Check Chart.js registration
   - Verify data structure
   - Check console for errors

2. **Live Updates Not Working**
   - Verify WebSocket connection
   - Check update interval configuration
   - Ensure data format compatibility

3. **Performance Issues**
   - Reduce update frequency
   - Limit data points
   - Check memory usage

4. **Mobile Responsiveness**
   - Test on actual devices
   - Check CSS breakpoints
   - Verify touch interactions

### Debug Mode

```typescript
// Enable debug logging
const debugMode = true;

if (debugMode) {
  console.log('Chart data:', chartData);
  console.log('Update interval:', updateInterval);
  console.log('WebSocket status:', isConnected);
}
```

## 📖 Examples

### Basic Line Chart

```tsx
const lineChartConfig = {
  type: 'line',
  title: 'Performance Over Time',
  data: {
    labels: ['0s', '10s', '20s', '30s'],
    datasets: [{
      label: 'Performance',
      data: [65, 72, 68, 75],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }]
  },
  options: {
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  }
};
```

### Interactive Bar Chart

```tsx
const barChartConfig = {
  type: 'bar',
  title: 'Team Comparison',
  data: {
    labels: ['Team A', 'Team B', 'Team C'],
    datasets: [{
      label: 'Goals',
      data: [12, 8, 15],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ]
    }]
  }
};
```

## 🤝 Contributing

### Development Guidelines

1. **Component Structure**: Follow existing patterns
2. **Type Safety**: Use TypeScript interfaces
3. **Performance**: Optimize for real-time updates
4. **Accessibility**: Ensure keyboard navigation
5. **Testing**: Include unit and integration tests

### Code Style

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use consistent naming conventions

---

This implementation provides a robust foundation for real-time sports analytics with professional-grade charting capabilities. The system is designed to be extensible, performant, and user-friendly across all devices and use cases.
