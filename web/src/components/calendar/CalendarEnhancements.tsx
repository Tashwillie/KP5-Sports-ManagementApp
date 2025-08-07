'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Zap,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface CalendarEnhancementsProps {
  onOptimizationToggle?: (enabled: boolean) => void;
  onTouchDragToggle?: (enabled: boolean) => void;
  onPerformanceModeChange?: (mode: 'auto' | 'performance' | 'battery') => void;
}

export function CalendarEnhancements({
  onOptimizationToggle,
  onTouchDragToggle,
  onPerformanceModeChange
}: CalendarEnhancementsProps) {
  const [isOptimized, setIsOptimized] = useState(true);
  const [touchDragEnabled, setTouchDragEnabled] = useState(true);
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'performance' | 'battery'>('auto');
  const [deviceCapability, setDeviceCapability] = useState<number>(0);
  const [currentFPS, setCurrentFPS] = useState(60);
  const [dragLatency, setDragLatency] = useState(16);

  useEffect(() => {
    // Simulate device capability detection
    const capability = Math.random() * 100;
    setDeviceCapability(capability);
    
    // Simulate performance metrics
    const interval = setInterval(() => {
      setCurrentFPS(prev => Math.max(30, Math.min(60, prev + (Math.random() - 0.5) * 5)));
      setDragLatency(prev => Math.max(8, Math.min(50, prev + (Math.random() - 0.5) * 2)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOptimizationToggle = () => {
    const newState = !isOptimized;
    setIsOptimized(newState);
    onOptimizationToggle?.(newState);
  };

  const handleTouchDragToggle = () => {
    const newState = !touchDragEnabled;
    setTouchDragEnabled(newState);
    onTouchDragToggle?.(newState);
  };

  const handlePerformanceModeChange = (mode: 'auto' | 'performance' | 'battery') => {
    setPerformanceMode(mode);
    onPerformanceModeChange?.(mode);
  };

  const getPerformanceStatus = () => {
    if (currentFPS >= 55 && dragLatency <= 16) return { status: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (currentFPS >= 45 && dragLatency <= 25) return { status: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (currentFPS >= 30 && dragLatency <= 33) return { status: 'Acceptable', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Needs Optimization', color: 'bg-red-100 text-red-800' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Calendar Performance Enhancements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{currentFPS.toFixed(0)}</div>
              <div className="text-sm text-gray-600">FPS</div>
              <Badge className={performanceStatus.color}>
                {performanceStatus.status}
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{dragLatency.toFixed(1)}ms</div>
              <div className="text-sm text-gray-600">Drag Latency</div>
              <Badge className={dragLatency <= 16 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {dragLatency <= 16 ? 'Optimal' : 'Needs Tuning'}
              </Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{deviceCapability.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Device Capability</div>
              <Badge className={deviceCapability >= 70 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {deviceCapability >= 70 ? 'High' : 'Medium'}
              </Badge>
            </div>
          </div>

          {/* Optimization Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Performance Optimization</div>
                  <div className="text-sm text-gray-600">Enable advanced performance tuning</div>
                </div>
              </div>
              <Button
                variant={isOptimized ? 'default' : 'outline'}
                size="sm"
                onClick={handleOptimizationToggle}
              >
                {isOptimized ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Touch Drag Support</div>
                  <div className="text-sm text-gray-600">Enhanced touch interactions</div>
                </div>
              </div>
              <Button
                variant={touchDragEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={handleTouchDragToggle}
              >
                {touchDragEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>

          {/* Performance Mode Selection */}
          <div className="space-y-3">
            <div className="font-medium">Performance Mode</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'auto', label: 'Auto', icon: CheckCircle, description: 'Automatic optimization' },
                { mode: 'performance', label: 'Performance', icon: Zap, description: 'Maximum performance' },
                { mode: 'battery', label: 'Battery', icon: Clock, description: 'Battery saving' }
              ].map(({ mode, label, icon: Icon, description }) => (
                <Button
                  key={mode}
                  variant={performanceMode === mode ? 'default' : 'outline'}
                  className="flex flex-col items-center p-4 h-auto"
                  onClick={() => handlePerformanceModeChange(mode as any)}
                >
                  <Icon className="h-4 w-4 mb-2" />
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-600">{description}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Device Recommendations */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Performance Recommendations</div>
                <div className="text-sm text-blue-700 mt-1">
                  {deviceCapability >= 70 
                    ? 'Your device supports high-performance mode. Consider enabling maximum optimization for the best experience.'
                    : 'Your device may benefit from battery-saving mode for longer usage times.'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 