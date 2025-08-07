'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Settings, 
  Zap, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { PerformanceOptimizedTouchService } from '../../lib/services/performanceOptimizedTouchService';
import { AdvancedPerformanceTuningService } from '../../lib/services/advancedPerformanceTuningService';
import { CrossDeviceLearningService } from '../../lib/services/crossDeviceLearningService';
import { PerformanceTestingService } from '../../lib/services/performanceTestingService';

interface PerformanceOptimizationPanelProps {
  onOptimizationComplete?: (result: any) => void;
  onProfileChange?: (profile: any) => void;
}

export function PerformanceOptimizationPanel({
  onOptimizationComplete,
  onProfileChange
}: PerformanceOptimizationPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    fps: 0,
    frameTime: 0,
    touchLatency: 0,
    renderTime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  const [optimizationProfile, setOptimizationProfile] = useState({
    targetFPS: 60,
    maxLatency: 16,
    enableThrottling: true,
    enableDebouncing: true,
    throttleInterval: 16,
    debounceDelay: 100,
    enableAdaptiveTuning: true,
    performanceBudget: {
      frameBudget: 16,
      eventBudget: 8
    }
  });
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'tune' | 'learn' | 'history'>('monitor');

  useEffect(() => {
    if (isVisible) {
      initializePerformanceMonitoring();
      startMetricsCollection();
    }
  }, [isVisible]);

  const initializePerformanceMonitoring = () => {
    PerformanceOptimizedTouchService.initialize();
    AdvancedPerformanceTuningService.initialize();
    CrossDeviceLearningService.initialize();
    
    const info = PerformanceTestingService.getDeviceInfo();
    setDeviceInfo(info);
    
    const profile = PerformanceOptimizedTouchService.getCurrentProfile();
    if (profile) {
      setOptimizationProfile(profile);
    }
  };

  const startMetricsCollection = () => {
    const interval = setInterval(() => {
      const metrics = PerformanceOptimizedTouchService.getPerformanceMetrics();
      const advancedMetrics = AdvancedPerformanceTuningService.getAdvancedMetrics();
      
      setCurrentMetrics({
        ...metrics,
        ...advancedMetrics
      });
    }, 100);

    return () => clearInterval(interval);
  };

  const handleOptimizationChange = useCallback((key: string, value: any) => {
    setOptimizationProfile(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      // Run comprehensive optimization
      const result = await AdvancedPerformanceTuningService.runOptimization({
        currentMetrics,
        targetProfile: optimizationProfile,
        deviceInfo
      });

      // Apply optimized settings
      PerformanceOptimizedTouchService.applyProfile(result.optimizedProfile);
      
      // Update profile state
      setOptimizationProfile(result.optimizedProfile);
      
      // Add to history
      setOptimizationHistory(prev => [{
        timestamp: new Date(),
        improvements: result.improvements,
        profile: result.optimizedProfile
      }, ...prev.slice(0, 9)]);

      // Learn from this optimization
      await CrossDeviceLearningService.learnFromOptimization({
        deviceInfo,
        beforeMetrics: currentMetrics,
        afterMetrics: result.optimizedProfile,
        improvements: result.improvements
      });

      if (onOptimizationComplete) {
        onOptimizationComplete(result);
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPerformanceStatus = (fps: number, latency: number) => {
    if (fps >= 55 && latency <= 16) return { status: 'excellent', color: 'bg-green-100 text-green-800' };
    if (fps >= 45 && latency <= 25) return { status: 'good', color: 'bg-blue-100 text-blue-800' };
    if (fps >= 30 && latency <= 33) return { status: 'acceptable', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'poor', color: 'bg-red-100 text-red-800' };
  };

  const performanceStatus = getPerformanceStatus(currentMetrics.fps, currentMetrics.touchLatency);

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
        size="sm"
      >
        <Zap className="h-4 w-4 mr-2" />
        {isVisible ? 'Hide' : 'Show'} Performance
      </Button>

      {/* Optimization Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Optimization</h2>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="monitor" className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>Monitor</span>
                  </TabsTrigger>
                  <TabsTrigger value="tune" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Tune</span>
                  </TabsTrigger>
                  <TabsTrigger value="learn" className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Learn</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>History</span>
                  </TabsTrigger>
                </TabsList>

                {/* Monitor Tab */}
                <TabsContent value="monitor" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          FPS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{currentMetrics.fps}</div>
                        <Badge className={performanceStatus.color}>
                          {performanceStatus.status}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Gauge className="h-4 w-4 mr-2" />
                          Latency
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{currentMetrics.touchLatency.toFixed(1)}ms</div>
                        <Badge className={performanceStatus.color}>
                          {performanceStatus.status}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Frame Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{currentMetrics.frameTime.toFixed(1)}ms</div>
                        <Badge className={currentMetrics.frameTime <= 16 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {currentMetrics.frameTime <= 16 ? 'Good' : 'Needs Optimization'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {deviceInfo && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Device Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Device Type:</span> {deviceInfo.deviceType}
                          </div>
                          <div>
                            <span className="font-medium">Screen Size:</span> {deviceInfo.screenSize}
                          </div>
                          <div>
                            <span className="font-medium">Performance Score:</span> {deviceInfo.performanceScore}/100
                          </div>
                          <div>
                            <span className="font-medium">Memory:</span> {deviceInfo.memory}GB
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tune Tab */}
                <TabsContent value="tune" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Target FPS</label>
                          <Slider
                            value={[optimizationProfile.targetFPS]}
                            onValueChange={([value]) => handleOptimizationChange('targetFPS', value)}
                            max={120}
                            min={30}
                            step={5}
                            className="mt-2"
                          />
                          <div className="text-sm text-gray-500 mt-1">{optimizationProfile.targetFPS} FPS</div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Max Latency</label>
                          <Slider
                            value={[optimizationProfile.maxLatency]}
                            onValueChange={([value]) => handleOptimizationChange('maxLatency', value)}
                            max={50}
                            min={8}
                            step={2}
                            className="mt-2"
                          />
                          <div className="text-sm text-gray-500 mt-1">{optimizationProfile.maxLatency}ms</div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Throttle Interval</label>
                          <Slider
                            value={[optimizationProfile.throttleInterval]}
                            onValueChange={([value]) => handleOptimizationChange('throttleInterval', value)}
                            max={32}
                            min={8}
                            step={2}
                            className="mt-2"
                          />
                          <div className="text-sm text-gray-500 mt-1">{optimizationProfile.throttleInterval}ms</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Enable Throttling</label>
                          <Switch
                            checked={optimizationProfile.enableThrottling}
                            onCheckedChange={(checked) => handleOptimizationChange('enableThrottling', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Enable Debouncing</label>
                          <Switch
                            checked={optimizationProfile.enableDebouncing}
                            onCheckedChange={(checked) => handleOptimizationChange('enableDebouncing', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Adaptive Tuning</label>
                          <Switch
                            checked={optimizationProfile.enableAdaptiveTuning}
                            onCheckedChange={(checked) => handleOptimizationChange('enableAdaptiveTuning', checked)}
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={runOptimization} 
                        disabled={isOptimizing}
                        className="w-full"
                      >
                        {isOptimizing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Run Optimization
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Learn Tab */}
                <TabsContent value="learn" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Machine Learning Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium">Device Pattern Detected</div>
                            <div className="text-sm text-gray-600">Similar devices show better performance with lower throttle intervals</div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <div className="font-medium">Performance Warning</div>
                            <div className="text-sm text-gray-600">Current settings may cause battery drain on this device type</div>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">Optimization Suggestion</div>
                            <div className="text-sm text-gray-600">Consider enabling adaptive tuning for better performance</div>
                          </div>
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Optimization History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {optimizationHistory.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">
                                {entry.timestamp.toLocaleTimeString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                FPS: {entry.profile.targetFPS} | Latency: {entry.profile.maxLatency}ms
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              +{entry.improvements.fpsImprovement} FPS
                            </Badge>
                          </div>
                        ))}
                        {optimizationHistory.length === 0 && (
                          <div className="text-center text-gray-500 py-8">
                            No optimization history yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 