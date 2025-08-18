'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DraggableEvent } from './DraggableEvent';
import { DropZone } from './DropZone';
import { Event } from '@shared/types';
import { CalendarService } from '@web/lib/services/calendarService';
import { EventService } from '@web/lib/services/eventService';

interface WeekViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onNavigate?: (date: Date) => void;
  onEventReschedule?: (result: { success: boolean; event: Event; error?: string }) => void;
}

export function WeekView({ 
  events, 
  onEventClick, 
  onTimeSlotClick, 
  onNavigate,
  onEventReschedule 
}: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekData, setWeekData] = useState(CalendarService.getWeekData(currentDate));
  const [eventsByDate, setEventsByDate] = useState<Map<string, Event[]>>(new Map());
  const [timeSlots] = useState(CalendarService.getTimeSlots(6, 22)); // 6 AM to 10 PM

  useEffect(() => {
    const newWeekData = CalendarService.getWeekData(currentDate);
    setWeekData(newWeekData);
    
    // Organize events by date
    const organizedEvents = CalendarService.organizeEventsByDate(events);
    setEventsByDate(organizedEvents);
  }, [currentDate, events]);

  const handlePreviousWeek = () => {
    const newDate = CalendarService.getPreviousWeek(currentDate);
    setCurrentDate(newDate);
    if (onNavigate) {
      onNavigate(newDate);
    }
  };

  const handleNextWeek = () => {
    const newDate = CalendarService.getNextWeek(currentDate);
    setCurrentDate(newDate);
    if (onNavigate) {
      onNavigate(newDate);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    if (onNavigate) {
      onNavigate(now);
    }
  };

  const getEventsForDateAndHour = (date: Date, hour: number): Event[] => {
    const dateKey = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    return dayEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getHours() === hour;
    });
  };

  const getEventPosition = (event: Event): {
    top: number;
    height: number;
    left: number;
    width: number;
  } => {
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const duration = endMinutes - startMinutes;
    
    const top = ((startMinutes - (6 * 60)) / 60) * 60; // 6 AM start
    const height = Math.max((duration / 60) * 60, 30); // Minimum 30px height
    
    return {
      top,
      height,
      left: 0,
      width: 100,
    };
  };

  const formatTimeSlot = (hour: number): string => {
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    return CalendarService.formatTime(time);
  };

  const getEventClassNames = (event: Event): string => {
    const baseClasses = 'absolute left-1 right-1 px-2 py-1 rounded text-xs font-medium cursor-pointer overflow-hidden';
    const typeColor = EventService.getEventTypeColor(event.type);
    return `${baseClasses} ${typeColor}`;
  };

  const isToday = (date: Date): boolean => {
    return CalendarService.isToday(date);
  };

  const isWeekend = (date: Date): boolean => {
    return CalendarService.isWeekend(date);
  };

  const handleEventReschedule = (result: { success: boolean; event: Event; error?: string }) => {
    if (onEventReschedule) {
      onEventReschedule(result);
    }
  };

  const handleDrop = (dropTarget: any) => {
    // Handle drop from DraggableEvent
    console.log('Drop target:', dropTarget);
  };

  return (
    <div className="bg-white rounded-lg shadow" data-calendar>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
          >
            →
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {CalendarService.formatWeekRange(weekData.startDate, weekData.endDate)}
          </h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
        >
          Today
        </Button>
      </div>

      {/* Week View Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            <div className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
              Time
            </div>
            {weekData.days.map((date) => (
              <div
                key={date.toISOString()}
                className={`p-3 text-center text-sm font-medium ${
                  isToday(date) 
                    ? 'bg-blue-50 text-blue-700' 
                    : isWeekend(date)
                    ? 'bg-gray-25 text-gray-700'
                    : 'bg-gray-50 text-gray-700'
                }`}
              >
                <div>{CalendarService.formatDayName(date)}</div>
                <div className="text-lg font-bold">
                  {CalendarService.formatDay(date)}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            {/* Time Column */}
            <div className="bg-gray-50">
              {timeSlots.map((timeSlot, index) => (
                <div
                  key={timeSlot}
                  className="h-15 border-b border-gray-200 text-xs text-gray-500 p-1"
                  style={{ height: '60px' }}
                >
                  {timeSlot}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekData.days.map((date) => (
              <div
                key={date.toISOString()}
                className={`relative ${
                  isToday(date) ? 'bg-blue-25' : isWeekend(date) ? 'bg-gray-25' : 'bg-white'
                }`}
              >
                {timeSlots.map((timeSlot, index) => {
                  const hour = index + 6; // 6 AM start
                  const hourEvents = getEventsForDateAndHour(date, hour);
                  
                  return (
                    <DropZone
                      key={`${date.toISOString()}-${hour}`}
                      date={date}
                      hour={hour}
                      onDrop={handleDrop}
                      className="h-15 border-b border-gray-200 relative"
                    >
                      <div
                        data-time-slot
                        data-date={date.toISOString()}
                        data-hour={hour}
                        onClick={() => onTimeSlotClick?.(date, hour)}
                        style={{ height: '60px' }}
                      >
                        {hourEvents.map((event) => {
                          const position = getEventPosition(event);
                          return (
                            <DraggableEvent
                              key={event.id}
                              event={event}
                              onReschedule={handleEventReschedule}
                            >
                              <div
                                className={getEventClassNames(event)}
                                style={{
                                  top: `${position.top}px`,
                                  height: `${position.height}px`,
                                  zIndex: 10,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick?.(event);
                                }}
                                title={`${event.title} - ${EventService.formatEventTime(
                                  new Date(event.startDate),
                                  new Date(event.endDate)
                                )}`}
                              >
                                <div className="font-semibold truncate">
                                  {event.title}
                                </div>
                                <div className="text-xs opacity-75 truncate">
                                  {EventService.formatEventTime(
                                    new Date(event.startDate),
                                    new Date(event.endDate)
                                  )}
                                </div>
                              </div>
                            </DraggableEvent>
                          );
                        })}
                      </div>
                    </DropZone>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-25 border border-gray-200 rounded"></div>
            <span>Weekend</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>Weekday</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded"></div>
            <span>Draggable Events</span>
          </div>
        </div>
      </div>
    </div>
  );
} 