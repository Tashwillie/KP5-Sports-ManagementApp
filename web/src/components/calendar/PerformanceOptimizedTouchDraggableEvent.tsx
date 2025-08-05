'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Event } from '../../../../shared/src/types';
import { PerformanceOptimizedTouchService, PerformanceOptimizedTouchOptions } from '../../lib/services/performanceOptimizedTouchService';
import { DragDropService, DropTarget } from '../../lib/services/dragDropService';
import { EventService } from '../../lib/services/eventService';

interface PerformanceOptimizedTouchDraggableEventProps {
  event: Event;
  children: React.ReactNode;
  onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void;
  disabled?: boolean;
  touchOptions?: PerformanceOptimizedTouchOptions;
}

export function PerformanceOptimizedTouchDraggableEvent({ 
  event, 
  children, 
  onReschedule, 
  disabled = false,
  touchOptions = {}
}: PerformanceOptimizedTouchDraggableEventProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({ fps: 0, touchLatency: 0 });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Memoize options for performance
  const optimizedOptions = useMemo(() => {
    return PerformanceOptimizedTouchService.getOptimalOptions();
  }, []);

  const finalOptions = useMemo(() => {
    return { ...optimizedOptions, ...touchOptions };
  }, [optimizedOptions, touchOptions]);

  // Detect touch device once
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Start performance monitoring
  useEffect(() => {
    if (finalOptions.enablePerformanceMonitoring) {
      PerformanceOptimizedTouchService.startPerformanceMonitoring();
      
      const stopMonitoring = PerformanceOptimizedTouchService.monitorFrameRate((fps) => {
        setPerformanceMetrics(prev => ({ ...prev, fps }));
      });

      return () => {
        stopMonitoring();
        PerformanceOptimizedTouchService.stopPerformanceMonitoring();
      };
    }
  }, [finalOptions.enablePerformanceMonitoring]);

  // Optimized touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    if (!touch) return;

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    // Use optimized touch start
    PerformanceOptimizedTouchService.handleOptimizedTouchStart(e, event, finalOptions);
    
    // Show touch feedback with optimization
    if (elementRef.current) {
      PerformanceOptimizedTouchService.optimizeTouchEvents(elementRef.current, finalOptions);
      PerformanceOptimizedTouchService.createOptimizedTouchRipple(touch.clientX, touch.clientY, '#3B82F6', finalOptions);
    }
  }, [event, finalOptions]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentTime = performance.now();
    
    // Throttle updates for performance
    if (currentTime - lastUpdateTimeRef.current < finalOptions.throttleInterval) {
      return;
    }
    
    lastUpdateTimeRef.current = currentTime;

    // Use optimized touch move with callback
    PerformanceOptimizedTouchService.handleOptimizedTouchMove(e, finalOptions, (position) => {
      setIsDragging(true);
      setDragPreview(position);
      
      // Calculate drop target efficiently
      const calendarElement = document.querySelector('[data-calendar]') as HTMLElement;
      if (calendarElement) {
        const target = DragDropService.calculateDropTarget(
          position,
          calendarElement,
          'month',
          []
        );
        setDropTarget(target);
      }
    });
  }, [finalOptions]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    PerformanceOptimizedTouchService.handleOptimizedTouchEnd(e, finalOptions, (result) => {
      setIsDragging(false);
      setDragPreview(null);
      setDropTarget(null);
      
      if (onReschedule) {
        onReschedule(result);
      }
    });
  }, [finalOptions, onReschedule]);

  // Optimized mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice || disabled) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragPreview({ x: e.clientX, y: e.clientY });

    DragDropService.startDrag(event, { x: e.clientX, y: e.clientY });
  }, [isTouchDevice, disabled, event]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isTouchDevice || !isDragging) return;

    const currentTime = performance.now();
    
    // Throttle mouse updates
    if (currentTime - lastUpdateTimeRef.current < finalOptions.throttleInterval) {
      return;
    }
    
    lastUpdateTimeRef.current = currentTime;

    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setDragPreview({ x: e.clientX, y: e.clientY });
      
      DragDropService.updateDragPosition({ x: e.clientX, y: e.clientY });
      
      const calendarElement = document.querySelector('[data-calendar]') as HTMLElement;
      if (calendarElement) {
        const target = DragDropService.calculateDropTarget(
          { x: e.clientX, y: e.clientY },
          calendarElement,
          'month',
          []
        );
        setDropTarget(target);
      }
    });
  }, [isTouchDevice, isDragging, finalOptions.throttleInterval]);

  const handleMouseUp = useCallback(async (e: MouseEvent) => {
    if (isTouchDevice || !isDragging) return;

    setIsDragging(false);
    setDragPreview(null);
    setDropTarget(null);

    if (dropTarget && DragDropService.isValidDropTarget(dropTarget)) {
      try {
        const result = await DragDropService.rescheduleEvent(
          event,
          dropTarget.date,
          dropTarget.hour,
          dropTarget.minute
        );

        if (onReschedule) {
          onReschedule({
            success: result.success,
            event: result.event,
            error: result.error,
          });
        }
      } catch (error) {
        console.error('Error during reschedule:', error);
        if (onReschedule) {
          onReschedule({
            success: false,
            event,
            error: 'Failed to reschedule event',
          });
        }
      }
    }

    DragDropService.endDrag();
  }, [isTouchDevice, isDragging, dropTarget, event, onReschedule]);

  // Event listeners with cleanup
  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    // Optimize touch events
    PerformanceOptimizedTouchService.optimizeTouchEvents(element, finalOptions);

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('mousedown', handleMouseDown as any);
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown as any);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [event, disabled, isTouchDevice, isDragging, dropTarget, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp, finalOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      PerformanceOptimizedTouchService.cleanup();
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isDragging]);

  // Memoized style calculations
  const dragPreviewStyle = useMemo(() => {
    if (!dragPreview) return {};

    return PerformanceOptimizedTouchService.getOptimizedDragPreviewStyle(
      event,
      dragPreview,
      finalOptions
    );
  }, [dragPreview, event, finalOptions]);

  const dropTargetStyle = useMemo(() => {
    return PerformanceOptimizedTouchService.getOptimizedDropTargetStyle(
      dropTarget,
      finalOptions
    );
  }, [dropTarget, finalOptions]);

  const elementStyle = useMemo(() => {
    return {
      userSelect: 'none',
      touchAction: 'none',
      ...dropTargetStyle,
    };
  }, [dropTargetStyle]);

  return (
    <>
      <div
        ref={elementRef}
        onClick={handleClick}
        className={`${isTouchDevice ? 'touch-draggable' : 'cursor-move'} ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        style={elementStyle}
      >
        {children}
      </div>

      {/* Optimized Drag Preview */}
      {isDragging && dragPreview && (
        <div
          className="fixed pointer-events-none z-50"
          style={dragPreviewStyle}
        >
          <div className="text-sm font-medium text-gray-900 truncate">
            {event.title}
          </div>
          <div className="text-xs text-gray-600">
            {EventService.formatEventTime(
              new Date(event.startDate),
              new Date(event.endDate)
            )}
          </div>
          {dropTarget && (
            <div className="text-xs mt-1">
              <span className={dropTarget.isValid ? 'text-green-600' : 'text-red-600'}>
                {DragDropService.formatDropTargetInfo(dropTarget)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics (Development Only) */}
      {process.env.NODE_ENV === 'development' && finalOptions.enablePerformanceMonitoring && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
          FPS: {performanceMetrics.fps} | Latency: {performanceMetrics.touchLatency.toFixed(0)}ms
        </div>
      )}

      {/* Touch Instructions */}
      {isTouchDevice && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Touch and drag to move
          </div>
        </div>
      )}
    </>
  );
} 