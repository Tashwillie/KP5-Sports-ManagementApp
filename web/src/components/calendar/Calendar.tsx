'use client';

import { useState } from 'react';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { Event } from '../../../../shared/src/types';
import { Button } from '../ui/button';
import { PerformanceDashboard } from '../performance/PerformanceDashboard';
import { PerformanceSettings } from '../performance/PerformanceSettings';
import { PerformanceAnalytics } from '../performance/PerformanceAnalytics';
import { CalendarViewType } from '../../../../shared/src/types';

interface CalendarProps {
  events: Event[];
  defaultView?: CalendarViewType;
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute?: number) => void;
  onNavigate?: (date: Date) => void;
  onEventReschedule?: (result: { success: boolean; event: Event; error?: string }) => void;
}

export function Calendar({ 
  events, 
  defaultView = 'month',
  onEventClick, 
  onDateClick, 
  onTimeSlotClick,
  onNavigate,
  onEventReschedule
}: CalendarProps) {
  const [currentView, setCurrentView] = useState<CalendarViewType>(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleViewChange = (view: CalendarViewType) => {
    setCurrentView(view);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
    onNavigate?.(date);
  };

  const handleMonthNavigate = (year: number, month: number) => {
    const newDate = new Date(year, month);
    setCurrentDate(newDate);
    onNavigate?.(newDate);
  };

  const handleEventClick = (event: Event) => {
    onEventClick?.(event);
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute?: number) => {
    onTimeSlotClick?.(date, hour, minute);
  };

  const handleEventReschedule = (result: { success: boolean; event: Event; error?: string }) => {
    if (onEventReschedule) {
      onEventReschedule(result);
    }
  };

  const renderCalendarView = () => {
    switch (currentView) {
      case 'month':
        return (
          <MonthView
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onNavigate={handleMonthNavigate}
            onEventReschedule={handleEventReschedule}
          />
        );
      case 'week':
        return (
          <WeekView
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onNavigate={handleNavigate}
            onEventReschedule={handleEventReschedule}
          />
        );
      case 'day':
        return (
          <DayView
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <MonthView
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onNavigate={handleMonthNavigate}
            onEventReschedule={handleEventReschedule}
          />
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            onClick={() => setCurrentView('month')}
            variant={currentView === 'month' ? 'default' : 'outline'}
          >
            Month
          </Button>
          <Button
            onClick={() => setCurrentView('week')}
            variant={currentView === 'week' ? 'default' : 'outline'}
          >
            Week
          </Button>
          <Button
            onClick={() => setCurrentView('day')}
            variant={currentView === 'day' ? 'default' : 'outline'}
          >
            Day
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => setCurrentDate(new Date())} variant="outline">
            Today
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {renderCalendarView()}

      {/* Performance Components */}
      <PerformanceDashboard 
        onProfileChange={(profile) => {
          console.log('Profile changed:', profile);
        }}
        onOptimizationComplete={(result) => {
          console.log('Optimization completed:', result);
        }}
      />
      
      <PerformanceSettings 
        onSettingsChange={(settings) => {
          console.log('Settings changed:', settings);
        }}
      />
      
      <PerformanceAnalytics 
        onExportData={(data) => {
          console.log('Analytics data exported:', data);
        }}
      />

      {/* Drag and Drop Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Drag and Drop</h3>
            <p className="text-sm text-blue-700 mt-1">
              Click and drag events to reschedule them. Drop on any time slot to move the event.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Touch Support Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-900">Mobile Touch Support</h3>
            <p className="text-sm text-green-700 mt-1">
              Touch and hold events on mobile devices to drag and drop them. Haptic feedback provides tactile confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Performance Tuning Instructions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-indigo-900">Advanced Performance Tuning</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Fine-tuned throttling and debouncing parameters with adaptive performance optimization.
            </p>
            <div className="mt-2 text-xs text-indigo-600">
              <p>• <strong>Dynamic Throttling:</strong> Adaptive intervals based on performance metrics</p>
              <p>• <strong>Smart Debouncing:</strong> User interaction-aware delay adjustments</p>
              <p>• <strong>Performance Budgets:</strong> Frame and event time allocation management</p>
              <p>• <strong>Adaptive Profiles:</strong> Real-time profile switching based on performance</p>
              <p>• <strong>Device Capability:</strong> Memory, CPU, network, and battery assessment</p>
              <p>• <strong>User Interaction Tracking:</strong> Responsiveness vs battery life optimization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Profiles Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-900">Performance Profiles</h3>
            <p className="text-sm text-amber-700 mt-1">
              Automatic profile selection and switching based on device capabilities and performance.
            </p>
            <div className="mt-2 text-xs text-amber-600">
              <p>• <strong>Ultra High Performance:</strong> 120fps equivalent, maximum responsiveness</p>
              <p>• <strong>High Performance:</strong> 60fps, optimized for modern devices</p>
              <p>• <strong>Balanced Performance:</strong> 50fps, performance vs battery balance</p>
              <p>• <strong>Power Saver:</strong> 30fps, optimized for older devices</p>
              <p>• <strong>Ultra Power Saver:</strong> 20fps, maximum battery life</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Testing Information */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-emerald-900">Real-World Testing</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Comprehensive performance testing with automated parameter optimization.
            </p>
            <div className="mt-2 text-xs text-emerald-600">
              <p>• <strong>Automated Testing:</strong> Simulated touch, mouse, and drag-drop interactions</p>
              <p>• <strong>Performance Metrics:</strong> FPS, latency, frame time, and budget utilization</p>
              <p>• <strong>Device Profiling:</strong> Memory, CPU, network, and battery assessment</p>
              <p>• <strong>Test Scenarios:</strong> Light, standard, heavy, and mixed interaction patterns</p>
              <p>• <strong>Historical Analysis:</strong> Performance trends and optimization history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Machine Learning Optimization Information */}
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-rose-900">Machine Learning Optimization</h3>
            <p className="text-sm text-rose-700 mt-1">
              AI-powered parameter tuning with gradient-based optimization and exploration strategies.
            </p>
            <div className="mt-2 text-xs text-rose-600">
              <p>• <strong>Gradient Optimization:</strong> Performance-based parameter adjustment</p>
              <p>• <strong>Exploration vs Exploitation:</strong> Balanced parameter space search</p>
              <p>• <strong>Convergence Detection:</strong> Automatic optimization termination</p>
              <p>• <strong>Confidence Scoring:</strong> Optimization result reliability assessment</p>
              <p>• <strong>Cross-Device Learning:</strong> Parameter sharing across similar devices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Validation Information */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-violet-900">Parameter Validation</h3>
            <p className="text-sm text-violet-700 mt-1">
              Device-specific parameter range validation with stability and performance testing.
            </p>
            <div className="mt-2 text-xs text-violet-600">
              <p>• <strong>Device Categorization:</strong> Ultra High-End to Legacy device classification</p>
              <p>• <strong>Range Testing:</strong> Comprehensive parameter value testing</p>
              <p>• <strong>Stability Analysis:</strong> Multi-iteration consistency validation</p>
              <p>• <strong>Confidence Scoring:</strong> Result reliability assessment</p>
              <p>• <strong>Cross-Device Sharing:</strong> Similar device parameter aggregation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Haptic Feedback Information */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-cyan-900">Haptic Feedback</h3>
            <p className="text-sm text-cyan-700 mt-1">
              Tactile feedback system with customizable vibration patterns and intensity control.
            </p>
            <div className="mt-2 text-xs text-cyan-600">
              <p>• <strong>Vibration API:</strong> Native device vibration integration</p>
              <p>• <strong>Custom Patterns:</strong> Touch, drag, drop, success, error, warning</p>
              <p>• <strong>Intensity Control:</strong> Light, medium, heavy vibration levels</p>
              <p>• <strong>Queue Management:</strong> Conflict-free vibration scheduling</p>
              <p>• <strong>Automatic Detection:</strong> Calendar interaction haptic triggers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Device Learning Information */}
      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-lime-900">Cross-Device Learning</h3>
            <p className="text-sm text-lime-700 mt-1">
              Machine learning system for device clustering and parameter optimization sharing.
            </p>
            <div className="mt-2 text-xs text-lime-600">
              <p>• <strong>K-Means Clustering:</strong> Device similarity grouping algorithm</p>
              <p>• <strong>Feature Extraction:</strong> Memory, CPU, capability analysis</p>
              <p>• <strong>Global Optimization:</strong> Weighted parameter statistics</p>
              <p>• <strong>Confidence Scoring:</strong> Cluster reliability assessment</p>
              <p>• <strong>Training Queue:</strong> Automatic model updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 