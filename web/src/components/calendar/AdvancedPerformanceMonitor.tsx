'use client';

import { useState, useEffect, useRef } from 'react';
import { PerformanceOptimizedTouchService, PerformanceMetrics } from '../../lib/services/performanceOptimizedTouchService';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from '../../lib/services/advancedPerformanceTuningService';

interface AdvancedPerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
  showTuningInfo?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function AdvancedPerformanceMonitor({ 
  enabled = true, 
  showDetails = false,
  showTuningInfo = false,
  position = 'top-right'
}: AdvancedPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    touchLatency: 0,
    renderTime: 0,
  });
  
  const [currentProfile, setCurrentProfile] = useState<PerformanceTuningProfile | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [deviceCapability, setDeviceCapability] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize performance service
    PerformanceOptimizedTouchService.initialize();

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
      const currentProfile = PerformanceOptimizedTouchService.getCurrentProfile();
      const budgetStatus = PerformanceOptimizedTouchService.getPerformanceBudgetStatus();
      const deviceCapability = AdvancedPerformanceTuningService.assessDeviceCapability();
      
      setMetrics(prev => ({
        ...prev,
        touchLatency: currentMetrics.touchLatency,
        renderTime: currentMetrics.renderTime,
      }));
      
      setCurrentProfile(currentProfile);
      setBudgetStatus(budgetStatus);
      setDeviceCapability(deviceCapability);
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

  const getBudgetStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'good';
    if (percentage >= 30) return 'warning';
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
  const frameBudgetStatus = budgetStatus ? getBudgetStatus(budgetStatus.frameBudgetRemaining, 16) : 'good';
  const eventBudgetStatus = budgetStatus ? getBudgetStatus(budgetStatus.eventBudgetRemaining, 8) : 'good';

  const getDeviceCapabilityLabel = (capability: number) => {
    if (capability >= 0.8) return 'Ultra High';
    if (capability >= 0.6) return 'High';
    if (capability >= 0.4) return 'Medium';
    if (capability >= 0.2) return 'Low';
    return 'Very Low';
  };

  const getInteractionLevelLabel = (level: number) => {
    if (level >= 0.8) return 'Very Active';
    if (level >= 0.6) return 'Active';
    if (level >= 0.4) return 'Moderate';
    if (level >= 0.2) return 'Low';
    return 'Passive';
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div 
        className={`performance-metrics fps-${fpsStatus} cursor-pointer transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-auto'
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
          {showTuningInfo && currentProfile && (
            <div className="flex items-center space-x-2 ml-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-mono text-xs">
                {currentProfile.name.split('-')[0]}
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
              
              {budgetStatus && (
                <>
                  <div className="flex justify-between">
                    <span>Frame Budget:</span>
                    <span className={`font-mono ${
                      frameBudgetStatus === 'good' ? 'text-green-400' : 
                      frameBudgetStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {budgetStatus.frameBudgetRemaining.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Budget:</span>
                    <span className={`font-mono ${
                      eventBudgetStatus === 'good' ? 'text-green-400' : 
                      eventBudgetStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {budgetStatus.eventBudgetRemaining.toFixed(1)}ms
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span>Device Capability:</span>
                <span className="font-mono">{getDeviceCapabilityLabel(deviceCapability)}</span>
              </div>
              
              {budgetStatus && (
                <div className="flex justify-between">
                  <span>Interaction Level:</span>
                  <span className="font-mono">{getInteractionLevelLabel(budgetStatus.userInteractionLevel)}</span>
                </div>
              )}
            </div>
            
            {showAdvanced && currentProfile && (
              <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                <div className="text-xs">
                  <div className="font-semibold mb-1">Tuning Profile:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Throttle Interval:</span>
                      <span className="font-mono">{currentProfile.throttleInterval}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debounce Delay:</span>
                      <span className="font-mono">{currentProfile.debounceDelay}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Touch Threshold:</span>
                      <span className="font-mono">{currentProfile.touchThreshold}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Touch Delay:</span>
                      <span className="font-mono">{currentProfile.touchDelay}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Animations:</span>
                      <span className="font-mono">{currentProfile.maxConcurrentAnimations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transform3D:</span>
                      <span className="font-mono">{currentProfile.enableTransform3d ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
                {frameBudgetStatus === 'poor' && (
                  <div className="text-red-300">• Reduce frame processing</div>
                )}
                {eventBudgetStatus === 'poor' && (
                  <div className="text-red-300">• Limit concurrent events</div>
                )}
                {fpsStatus === 'good' && latencyStatus === 'good' && frameBudgetStatus === 'good' && eventBudgetStatus === 'good' && (
                  <div className="text-green-300">• Performance is optimal</div>
                )}
              </div>
            </div>
            
            {/* Advanced toggle */}
            <div className="mt-2 pt-2 border-t border-white border-opacity-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdvanced(!showAdvanced);
                }}
                className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Tuning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 