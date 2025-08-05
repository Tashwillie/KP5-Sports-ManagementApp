'use client';

import { useState, useEffect, useRef } from 'react';
import { PerformanceOptimizedTouchService, PerformanceMetrics } from '../../lib/services/performanceOptimizedTouchService';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function PerformanceMonitor({ 
  enabled = true, 
  showDetails = false,
  position = 'top-right'
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    touchLatency: 0,
    renderTime: 0,
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        const frameTime = (currentTime - lastTimeRef.current) / frameCountRef.current;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime,
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationIdRef.current = requestAnimationFrame(measureFPS);
    };

    animationIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Start performance monitoring
    PerformanceOptimizedTouchService.startPerformanceMonitoring();
    
    // Update metrics periodically
    const interval = setInterval(() => {
      const currentMetrics = PerformanceOptimizedTouchService.getPerformanceMetrics();
      setMetrics(prev => ({
        ...prev,
        touchLatency: currentMetrics.touchLatency,
        renderTime: currentMetrics.renderTime,
      }));
    }, 100);

    return () => {
      clearInterval(interval);
      PerformanceOptimizedTouchService.stopPerformanceMonitoring();
    };
  }, [enabled]);

  // Show monitor after a delay
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled]);

  if (!enabled || !isVisible) return null;

  const getFPSStatus = (fps: number) => {
    if (fps >= 55) return 'good';
    if (fps >= 30) return 'warning';
    return 'poor';
  };

  const getLatencyStatus = (latency: number) => {
    if (latency <= 16) return 'good';
    if (latency <= 33) return 'warning';
    return 'poor';
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const fpsStatus = getFPSStatus(metrics.fps);
  const latencyStatus = getLatencyStatus(metrics.touchLatency);

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div 
        className={`performance-metrics fps-${fpsStatus} cursor-pointer transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-auto'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to expand/collapse performance details"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              fpsStatus === 'good' ? 'bg-green-400' : 
              fpsStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="font-mono text-xs">
              {metrics.fps} FPS
            </span>
          </div>
          {showDetails && (
            <div className="flex items-center space-x-2 ml-2">
              <div className={`w-2 h-2 rounded-full ${
                latencyStatus === 'good' ? 'bg-green-400' : 
                latencyStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className="font-mono text-xs">
                {metrics.touchLatency.toFixed(0)}ms
              </span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white border-opacity-20">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Frame Time:</span>
                <span className="font-mono">{metrics.frameTime.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Touch Latency:</span>
                <span className={`font-mono ${
                  latencyStatus === 'good' ? 'text-green-400' : 
                  latencyStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {metrics.touchLatency.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Render Time:</span>
                <span className="font-mono">{metrics.renderTime.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Device:</span>
                <span className="font-mono">
                  {PerformanceOptimizedTouchService.isLowPerformanceDevice() ? 'Low-end' : 'High-end'}
                </span>
              </div>
            </div>
            
            {/* Performance recommendations */}
            <div className="mt-2 pt-2 border-t border-white border-opacity-20">
              <div className="text-xs">
                <div className="font-semibold mb-1">Recommendations:</div>
                {fpsStatus === 'poor' && (
                  <div className="text-red-300">• Reduce animation complexity</div>
                )}
                {latencyStatus === 'poor' && (
                  <div className="text-red-300">• Optimize touch handling</div>
                )}
                {fpsStatus === 'good' && latencyStatus === 'good' && (
                  <div className="text-green-300">• Performance is optimal</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 