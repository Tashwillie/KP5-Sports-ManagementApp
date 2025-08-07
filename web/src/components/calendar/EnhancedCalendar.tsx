'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Search,
  Grid,
  List,
  Clock,
  MapPin,
  Users,
  MoreHorizontal,
  DragHandle
} from 'lucide-react';
import { PerformanceOptimizedTouchDraggableEvent } from './PerformanceOptimizedTouchDraggableEvent';
import { TouchDropZone } from './TouchDropZone';
import { DragDropService } from '../../lib/services/dragDropService';
import { TouchDragService } from '../../lib/services/touchDragService';
import { PerformanceOptimizedTouchService } from '../../lib/services/performanceOptimizedTouchService';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'practice' | 'game' | 'meeting' | 'tournament';
  location?: string;
  attendees?: string[];
  color?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface EnhancedCalendarProps {
  events: Event[];
  onEventCreate?: (event: Omit<Event, 'id'>) => void;
  onEventUpdate?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
  onEventReschedule?: (eventId: string, newStartDate: Date, newEndDate: Date) => void;
  view?: 'month' | 'week' | 'day';
  defaultDate?: Date;
  enableDragDrop?: boolean;
  enableTouchDrag?: boolean;
  performanceOptimized?: boolean;
}

export function EnhancedCalendar({
  events,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onEventReschedule,
  view = 'month',
  defaultDate = new Date(),
  enableDragDrop = true,
  enableTouchDrag = true,
  performanceOptimized = true
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [currentView, setCurrentView] = useState(view);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedEvent: Event | null;
    dropTarget: any;
  }>({
    isDragging: false,
    draggedEvent: null,
    dropTarget: null
  });

  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize performance optimization
  useEffect(() => {
    if (performanceOptimized) {
      PerformanceOptimizedTouchService.initialize();
      TouchDragService.initialize();
    }
  }, [performanceOptimized]);

  // Filter events based on search and type filters
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(event => selectedTypes.includes(event.type));
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedTypes]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= lastDay || days.length < 42) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getDayHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForDateTime = (date: Date, hour: number) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString() && 
             eventDate.getHours() === hour;
    });
  };

  const handleEventReschedule = async (event: Event, newDate: Date, newHour?: number, newMinute?: number) => {
    if (!onEventReschedule) return;

    const newStartDate = new Date(newDate);
    if (newHour !== undefined) newStartDate.setHours(newHour);
    if (newMinute !== undefined) newStartDate.setMinutes(newMinute);

    const duration = event.endDate.getTime() - event.startDate.getTime();
    const newEndDate = new Date(newStartDate.getTime() + duration);

    try {
      await onEventReschedule(event.id, newStartDate, newEndDate);
    } catch (error) {
      console.error('Failed to reschedule event:', error);
    }
  };

  const handleDrop = (dropTarget: any) => {
    if (!dragState.draggedEvent || !dropTarget) return;

    const { date, hour, minute } = dropTarget;
    handleEventReschedule(dragState.draggedEvent, date, hour, minute);
    
    setDragState({
      isDragging: false,
      draggedEvent: null,
      dropTarget: null
    });
  };

  const renderMonthView = () => {
    const days = getMonthDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <TouchDropZone
                key={index}
                date={day}
                onDrop={handleDrop}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                touchOptions={{ enableTouchDrag: enableTouchDrag }}
              >
                <div className="text-sm font-medium mb-1">
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <PerformanceOptimizedTouchDraggableEvent
                      key={event.id}
                      event={event}
                      onReschedule={handleEventReschedule}
                      disabled={!enableDragDrop}
                      touchOptions={{ enableTouchDrag: enableTouchDrag }}
                    >
                      <div className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate">
                        {event.title}
                      </div>
                    </PerformanceOptimizedTouchDraggableEvent>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </TouchDropZone>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    const hours = getDayHours();

    return (
      <div className="space-y-4">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-1">
          <div className="p-2"></div>
          {days.map(day => (
            <div key={day.toISOString()} className="p-2 text-center text-sm font-medium">
              <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-lg">{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8 gap-1">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="p-2 text-xs text-gray-500 border-r">
                {hour}:00
              </div>
              {days.map(day => {
                const hourEvents = getEventsForDateTime(day, hour);
                
                return (
                  <TouchDropZone
                    key={`${day.toISOString()}-${hour}`}
                    date={day}
                    hour={hour}
                    onDrop={handleDrop}
                    className="min-h-[60px] p-1 border-b border-r"
                    touchOptions={{ enableTouchDrag: enableTouchDrag }}
                  >
                    {hourEvents.map(event => (
                      <PerformanceOptimizedTouchDraggableEvent
                        key={event.id}
                        event={event}
                        onReschedule={handleEventReschedule}
                        disabled={!enableDragDrop}
                        touchOptions={{ enableTouchDrag: enableTouchDrag }}
                      >
                        <div className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate">
                          {event.title}
                        </div>
                      </PerformanceOptimizedTouchDraggableEvent>
                    ))}
                  </TouchDropZone>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = getDayHours();
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        <div className="space-y-2">
          {hours.map(hour => {
            const hourEvents = getEventsForDateTime(currentDate, hour);
            
            return (
              <TouchDropZone
                key={hour}
                date={currentDate}
                hour={hour}
                onDrop={handleDrop}
                className="flex items-center p-2 border rounded-lg min-h-[60px]"
                touchOptions={{ enableTouchDrag: enableTouchDrag }}
              >
                <div className="w-16 text-sm text-gray-500">
                  {hour}:00
                </div>
                <div className="flex-1 space-y-1">
                  {hourEvents.map(event => (
                    <PerformanceOptimizedTouchDraggableEvent
                      key={event.id}
                      event={event}
                      onReschedule={handleEventReschedule}
                      disabled={!enableDragDrop}
                      touchOptions={{ enableTouchDrag: enableTouchDrag }}
                    >
                      <div className="flex items-center space-x-2 p-2 rounded bg-blue-100">
                        <DragHandle className="h-3 w-3 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}
                          </div>
                        </div>
                        {event.location && (
                          <MapPin className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                    </PerformanceOptimizedTouchDraggableEvent>
                  ))}
                </div>
              </TouchDropZone>
            );
          })}
        </div>
      </div>
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return 'bg-green-100 text-green-800';
      case 'game': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'tournament': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6" ref={calendarRef} data-calendar>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingEvent(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {['practice', 'game', 'meeting', 'tournament'].map(type => (
            <Button
              key={type}
              variant={selectedTypes.includes(type) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedTypes(prev => 
                  prev.includes(type) 
                    ? prev.filter(t => t !== type)
                    : [...prev, type]
                );
              }}
            >
              <Badge className={getEventTypeColor(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList>
          <TabsTrigger value="month" className="flex items-center space-x-2">
            <Grid className="h-4 w-4" />
            <span>Month</span>
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Week</span>
          </TabsTrigger>
          <TabsTrigger value="day" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Day</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          {renderMonthView()}
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          {renderWeekView()}
        </TabsContent>

        <TabsContent value="day" className="mt-4">
          {renderDayView()}
        </TabsContent>
      </Tabs>

      {/* Performance Optimization Indicator */}
      {performanceOptimized && (
        <div className="fixed bottom-4 right-4">
          <Badge className="bg-green-100 text-green-800">
            Performance Optimized
          </Badge>
        </div>
      )}
    </div>
  );
} 