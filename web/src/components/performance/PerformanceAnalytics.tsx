'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceTestingService, PerformanceTestResult } from '../../lib/services/performanceTestingService';
import { ParameterValidationService, ValidationResult } from '../../lib/services/parameterValidationService';
import { CrossDeviceLearningService, DeviceCluster } from '../../lib/services/crossDeviceLearningService';
import { AdvancedPerformanceTuningService } from '../../lib/services/advancedPerformanceTuningService';

interface PerformanceAnalyticsProps {
  onExportData?: (data: any) => void;
}

export function PerformanceAnalytics({ onExportData }: PerformanceAnalyticsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [validationHistory, setValidationHistory] = useState<any[]>([]);
  const [deviceClusters, setDeviceClusters] = useState<DeviceCluster[]>([]);
  const [performanceProfiles, setPerformanceProfiles] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | 'all'>('7d');
  const [activeChart, setActiveChart] = useState<'fps' | 'latency' | 'improvements' | 'clusters'>('fps');

  useEffect(() => {
    if (isVisible) {
      loadAnalyticsData();
    }
  }, [isVisible, selectedTimeRange]);

  const loadAnalyticsData = () => {
    // Load test results
    const results = PerformanceTestingService.getTestResults();
    const filteredResults = filterResultsByTimeRange(results, selectedTimeRange);
    setTestResults(filteredResults);
    
    // Load validation history
    const validation = ParameterValidationService.getValidationHistory();
    const filteredValidation = filterResultsByTimeRange(validation, selectedTimeRange);
    setValidationHistory(filteredValidation);
    
    // Load device clusters
    const clusters = CrossDeviceLearningService.getClusters();
    setDeviceClusters(clusters);
    
    // Load performance profiles
    const profiles = AdvancedPerformanceTuningService.getAllProfiles();
    setPerformanceProfiles(profiles);
  };

  const filterResultsByTimeRange = (data: any[], range: '1d' | '7d' | '30d' | 'all') => {
    const now = Date.now();
    const ranges = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };
    
    return data.filter(item => {
      const timestamp = item.timestamp || item.lastUpdated || 0;
      return now - timestamp <= ranges[range];
    });
  };

  const calculateAverageFPS = () => {
    if (testResults.length === 0) return 0;
    const totalFPS = testResults.reduce((sum, result) => sum + result.metrics.fps, 0);
    return totalFPS / testResults.length;
  };

  const calculateAverageLatency = () => {
    if (testResults.length === 0) return 0;
    const totalLatency = testResults.reduce((sum, result) => sum + result.metrics.touchLatency, 0);
    return totalLatency / testResults.length;
  };

  const calculateImprovementTrend = () => {
    if (validationHistory.length === 0) return 0;
    const improvements = validationHistory.map(v => 
      v.validationResults?.reduce((sum: number, r: ValidationResult) => sum + r.confidence, 0) / (v.validationResults?.length || 1) || 0
    );
    const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    return avgImprovement;
  };

  const getDeviceCategoryDistribution = () => {
    const categories = ['Ultra High-End', 'High-End', 'Mid-Range', 'Low-End', 'Legacy'];
    const distribution = categories.map(category => {
      const count = testResults.filter(result => {
        const deviceInfo = result.deviceInfo;
        const capability = deviceInfo.deviceCapability;
        
        switch (category) {
          case 'Ultra High-End': return capability >= 0.8;
          case 'High-End': return capability >= 0.6 && capability < 0.8;
          case 'Mid-Range': return capability >= 0.4 && capability < 0.6;
          case 'Low-End': return capability >= 0.2 && capability < 0.4;
          case 'Legacy': return capability < 0.2;
          default: return false;
        }
      }).length;
      
      return { category, count, percentage: (count / testResults.length) * 100 };
    });
    
    return distribution;
  };

  const exportAnalyticsData = () => {
    const data = {
      testResults,
      validationHistory,
      deviceClusters,
      performanceProfiles,
      summary: {
        averageFPS: calculateAverageFPS(),
        averageLatency: calculateAverageLatency(),
        improvementTrend: calculateImprovementTrend(),
        deviceDistribution: getDeviceCategoryDistribution(),
      },
      timestamp: new Date().toISOString(),
    };
    
    if (onExportData) {
      onExportData(data);
    } else {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderFPSChart = () => {
    const fpsData = testResults.map((result, index) => ({
      x: index,
      y: result.metrics.fps,
      label: new Date(result.timestamp).toLocaleTimeString(),
    }));

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">FPS Over Time</h4>
          <Badge className="bg-green-100 text-green-800">
            Avg: {calculateAverageFPS().toFixed(1)} FPS
          </Badge>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          <div className="flex items-end justify-between h-full space-x-1">
            {fpsData.map((point, index) => (
              <div
                key={index}
                className="bg-blue-500 rounded-t"
                style={{
                  width: `${100 / fpsData.length}%`,
                  height: `${(point.y / 60) * 100}%`,
                  minHeight: '4px',
                }}
                title={`${point.label}: ${point.y.toFixed(1)} FPS`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLatencyChart = () => {
    const latencyData = testResults.map((result, index) => ({
      x: index,
      y: result.metrics.touchLatency,
      label: new Date(result.timestamp).toLocaleTimeString(),
    }));

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Touch Latency Over Time</h4>
          <Badge className="bg-blue-100 text-blue-800">
            Avg: {calculateAverageLatency().toFixed(1)}ms
          </Badge>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          <div className="flex items-end justify-between h-full space-x-1">
            {latencyData.map((point, index) => (
              <div
                key={index}
                className="bg-red-500 rounded-t"
                style={{
                  width: `${100 / latencyData.length}%`,
                  height: `${Math.min((point.y / 50) * 100, 100)}%`,
                  minHeight: '4px',
                }}
                title={`${point.label}: ${point.y.toFixed(1)}ms`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderImprovementsChart = () => {
    const improvementData = validationHistory.map((validation, index) => ({
      x: index,
      y: validation.validationResults?.reduce((sum: number, r: ValidationResult) => sum + r.confidence, 0) / (validation.validationResults?.length || 1) || 0,
      label: new Date(validation.timestamp).toLocaleDateString(),
    }));

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Validation Confidence Over Time</h4>
          <Badge className="bg-purple-100 text-purple-800">
            Avg: {(calculateImprovementTrend() * 100).toFixed(1)}%
          </Badge>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          <div className="flex items-end justify-between h-full space-x-1">
            {improvementData.map((point, index) => (
              <div
                key={index}
                className="bg-purple-500 rounded-t"
                style={{
                  width: `${100 / improvementData.length}%`,
                  height: `${point.y * 100}%`,
                  minHeight: '4px',
                }}
                title={`${point.label}: ${(point.y * 100).toFixed(1)}%`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderClustersChart = () => {
    const clusterData = deviceClusters.map((cluster, index) => ({
      name: cluster.name,
      deviceCount: cluster.devices.length,
      confidence: cluster.confidence,
      improvement: cluster.averageImprovement,
    }));

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Device Clusters</h4>
          <Badge className="bg-orange-100 text-orange-800">
            {deviceClusters.length} Clusters
          </Badge>
        </div>
        <div className="space-y-3">
          {clusterData.map((cluster, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{cluster.name}</div>
                <div className="text-sm text-gray-600">
                  {cluster.deviceCount} devices • {(cluster.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{(cluster.improvement * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">improvement</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-20 right-4 z-50"
        variant="outline"
      >
        {isVisible ? 'Hide' : 'Show'} Analytics
      </Button>

      {/* Analytics Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                <div className="flex space-x-2">
                  <Button
                    onClick={exportAnalyticsData}
                    variant="outline"
                    size="sm"
                  >
                    Export Data
                  </Button>
                  <Button
                    onClick={() => setIsVisible(false)}
                    variant="outline"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {/* Time Range Selector */}
              <div className="flex space-x-2 mb-6">
                {(['1d', '7d', '30d', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    variant={selectedTimeRange === range ? 'default' : 'outline'}
                    size="sm"
                  >
                    {range === '1d' ? '1 Day' : 
                     range === '7d' ? '7 Days' : 
                     range === '30d' ? '30 Days' : 'All Time'}
                  </Button>
                ))}
              </div>

              {/* Chart Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'fps', label: 'FPS Trends' },
                  { id: 'latency', label: 'Latency Trends' },
                  { id: 'improvements', label: 'Improvements' },
                  { id: 'clusters', label: 'Device Clusters' },
                ].map((chart) => (
                  <button
                    key={chart.id}
                    onClick={() => setActiveChart(chart.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeChart === chart.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {chart.label}
                  </button>
                ))}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {calculateAverageFPS().toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average FPS</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {calculateAverageLatency().toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-600">Average Latency</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {(calculateImprovementTrend() * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Improvement Trend</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {deviceClusters.length}
                  </div>
                  <div className="text-sm text-gray-600">Device Clusters</div>
                </Card>
              </div>

              {/* Chart Content */}
              <div className="space-y-6">
                {activeChart === 'fps' && renderFPSChart()}
                {activeChart === 'latency' && renderLatencyChart()}
                {activeChart === 'improvements' && renderImprovementsChart()}
                {activeChart === 'clusters' && renderClustersChart()}
              </div>

              {/* Device Distribution */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Device Category Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {getDeviceCategoryDistribution().map((dist) => (
                    <Card key={dist.category} className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {dist.count}
                      </div>
                      <div className="text-sm text-gray-600">
                        {dist.category}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dist.percentage.toFixed(1)}%
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 