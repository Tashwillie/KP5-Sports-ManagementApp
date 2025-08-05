'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PerformanceOptimizedTouchDraggableEvent } from './PerformanceOptimizedTouchDraggableEvent';
import { TouchDropZone } from './TouchDropZone';
import { AdvancedPerformanceMonitor } from './AdvancedPerformanceMonitor';
import { Event } from '../../../../shared/src/types';
import { CalendarService } from '../../lib/services/calendarService';
import { EventService } from '../../lib/services/eventService';
import { PerformanceOptimizedTouchService } from '../../lib/services/performanceOptimizedTouchService';
import { AdvancedPerformanceTuningService } from '../../lib/services/advancedPerformanceTuningService';
import { PerformanceTestingPanel } from './PerformanceTestingPanel';
import { ParameterOptimizationService, OptimizationResult } from '../../lib/services/parameterOptimizationService';
import { PerformanceTestingService } from '../../lib/services/performanceTestingService';

interface MonthViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
  onNavigate?: (year: number, month: number) => void;
  onEventReschedule?: (result: { success: boolean; event: Event; error?: string }) => void;
}

export function MonthView({ 
  events, 
  onEventClick, 
  onDateClick, 
  onNavigate,
  onEventReschedule 
}: MonthViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [monthData, setMonthData] = useState(CalendarService.getMonthData(currentYear, currentMonth));
  const [eventsByDate, setEventsByDate] = useState<Map<string, Event[]>>(new Map());
  const [performanceOptions, setPerformanceOptions] = useState(
    PerformanceOptimizedTouchService.getOptimalOptions()
  );
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [deviceCapability, setDeviceCapability] = useState<number>(0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const newMonthData = CalendarService.getMonthData(currentYear, currentMonth);
    setMonthData(newMonthData);
    
    // Organize events by date
    const organizedEvents = CalendarService.organizeEventsByDate(events);
    setEventsByDate(organizedEvents);
  }, [currentYear, currentMonth, events]);

  // Initialize performance tuning and update options
  useEffect(() => {
    // Initialize performance service
    PerformanceOptimizedTouchService.initialize();
    
    // Get optimal profile and device capability
    const optimalProfile = AdvancedPerformanceTuningService.getOptimalProfile();
    const capability = AdvancedPerformanceTuningService.assessDeviceCapability();
    
    setCurrentProfile(optimalProfile);
    setDeviceCapability(capability);
    
    // Get optimized options
    const optimalOptions = PerformanceOptimizedTouchService.getOptimalOptions();
    setPerformanceOptions(optimalOptions);
    
    console.log('Performance Profile:', optimalProfile.name);
    console.log('Device Capability:', capability);
    console.log('Performance Options:', optimalOptions);
  }, []);

  const handlePreviousMonth = () => {
    const { year, month } = CalendarService.getPreviousMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
    if (onNavigate) {
      onNavigate(year, month);
    }
  };

  const handleNextMonth = () => {
    const { year, month } = CalendarService.getNextMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
    if (onNavigate) {
      onNavigate(year, month);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    if (onNavigate) {
      onNavigate(now.getFullYear(), now.getMonth());
    }
  };

  const getEventsForDate = (date: Date): Event[] => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate.get(dateKey) || [];
  };

  const getDayClassNames = (date: Date): string => {
    const baseClasses = 'h-32 p-2 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors relative calendar-day';
    const isToday = CalendarService.isToday(date);
    const isOtherMonth = CalendarService.isOtherMonth(date, currentMonth, currentYear);
    const isWeekend = CalendarService.isWeekend(date);
    
    let classes = baseClasses;
    
    if (isToday) {
      classes += ' bg-blue-50 border-blue-300';
    }
    
    if (isOtherMonth) {
      classes += ' text-gray-400 bg-gray-50';
    }
    
    if (isWeekend) {
      classes += ' bg-gray-25';
    }
    
    return classes;
  };

  const formatDayNumber = (date: Date): string => {
    return CalendarService.formatDay(date);
  };

  const getEventDisplayName = (event: Event): string => {
    return event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title;
  };

  const getEventClassNames = (event: Event): string => {
    const baseClasses = 'text-xs px-1 py-0.5 rounded mb-1 cursor-pointer truncate calendar-event';
    const typeColor = EventService.getEventTypeColor(event.type);
    return `${baseClasses} ${typeColor}`;
  };

  const handleEventReschedule = (result: { success: boolean; event: Event; error?: string }) => {
    if (onEventReschedule) {
      onEventReschedule(result);
    }
  };

  const handleTestComplete = (testResult: any) => {
    console.log('Performance test completed:', testResult);
    // Optionally trigger automatic optimization
    if (testResult.recommendations.length > 0) {
      handleAutoOptimize();
    }
  };

  const handleAutoOptimize = async () => {
    if (!deviceCapability || isOptimizing) return;

    setIsOptimizing(true);
    try {
      const deviceInfo = PerformanceTestingService.getDeviceInfo();
      const result = await ParameterOptimizationService.optimizeParameters(deviceInfo, {
        maxIterations: 5,
        convergenceThreshold: 0.1,
        learningRate: 0.15,
        explorationRate: 0.3,
        minImprovement: 0.05,
      });

      setOptimizationResult(result);
      
      // Apply optimized parameters
      if (result.success) {
        const optimizedOptions = AdvancedPerformanceTuningService.profileToOptions(result.optimizedProfile);
        setPerformanceOptions(optimizedOptions);
        setCurrentProfile(result.optimizedProfile);
        
        console.log('Parameters optimized:', result.recommendations);
      }
    } catch (error) {
      console.error('Parameter optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDrop = (dropTarget: any) => {
    // Handle drop from PerformanceOptimizedTouchDraggableEvent
    console.log('Drop target:', dropTarget);
  };

  const getDeviceCapabilityLabel = (capability: number) => {
    if (capability >= 0.8) return 'Ultra High';
    if (capability >= 0.6) return 'High';
    if (capability >= 0.4) return 'Medium';
    if (capability >= 0.2) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="bg-white rounded-lg shadow calendar-container" data-calendar>
      {/* Advanced Performance Monitor */}
      <AdvancedPerformanceMonitor 
        enabled={performanceOptions.enablePerformanceMonitoring}
        showDetails={true}
        showTuningInfo={true}
        position="top-right"
      />

      {/* Performance Testing Panel */}
      <PerformanceTestingPanel 
        onTestComplete={handleTestComplete}
        onParametersOptimized={handleAutoOptimize}
      />

      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            →
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {CalendarService.formatMonthYear(new Date(currentYear, currentMonth))}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Performance Profile Indicator */}
          {currentProfile && (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                currentProfile.name.includes('ultra-high') ? 'bg-purple-500' :
                currentProfile.name.includes('high') ? 'bg-green-500' :
                currentProfile.name.includes('balanced') ? 'bg-blue-500' :
                currentProfile.name.includes('power-saver') ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="font-medium">
                {currentProfile.name.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>
          )}
          
          {/* Optimization Status */}
          {isOptimizing && (
            <div className="flex items-center space-x-2 text-xs text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Optimizing...</span>
            </div>
          )}
          
          {optimizationResult && (
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Optimized ({optimizationResult.confidence.toFixed(1)}% confidence)</span>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 calendar-grid">
        {monthData.weeks.map((week, weekIndex) => (
          week.map((date, dayIndex) => {
            const dayEvents = getEventsForDate(date);
            const isToday = CalendarService.isToday(date);
            const isOtherMonth = CalendarService.isOtherMonth(date, currentMonth, currentYear);
            
            return (
              <TouchDropZone
                key={`${weekIndex}-${dayIndex}`}
                date={date}
                onDrop={handleDrop}
                className={getDayClassNames(date)}
                touchOptions={{
                  enableTouchDrag: true,
                  touchThreshold: performanceOptions.touchThreshold,
                  touchDelay: performanceOptions.touchDelay,
                }}
              >
                <div
                  data-day={date.toISOString()}
                  onClick={() => onDateClick?.(date)}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday ? 'text-blue-600' : isOtherMonth ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {formatDayNumber(date)}
                    </span>
                    
                    {/* Event Count Badge */}
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {dayEvents.slice(0, 3).map((event) => (
                      <PerformanceOptimizedTouchDraggableEvent
                        key={event.id}
                        event={event}
                        onReschedule={handleEventReschedule}
                        touchOptions={performanceOptions}
                      >
                        <div
                          className={getEventClassNames(event)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          title={event.title}
                        >
                          {getEventDisplayName(event)}
                        </div>
                      </PerformanceOptimizedTouchDraggableEvent>
                    ))}
                    
                    {/* More Events Indicator */}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </TouchDropZone>
            );
          })
        ))}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Other Month</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-25 border border-gray-200 rounded"></div>
            <span>Weekend</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded"></div>
            <span>Draggable Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 border border-green-600 rounded"></div>
            <span>Touch Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 border border-purple-600 rounded"></div>
            <span>Advanced Tuning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 border border-orange-600 rounded"></div>
            <span>Device: {getDeviceCapabilityLabel(deviceCapability)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 border border-indigo-600 rounded"></div>
            <span>Auto-Optimized</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 border border-pink-600 rounded"></div>
            <span>ML-Tuned</span>
          </div>
        </div>
      </div>
    </div>
  );
} 