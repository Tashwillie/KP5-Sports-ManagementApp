'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Event } from '@shared/types';
import { CalendarService } from '../../lib/services/calendarService';
import { EventService } from '../../lib/services/eventService';

interface DayViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  onNavigate?: (date: Date) => void;
}

export function DayView({ events, onEventClick, onTimeSlotClick, onNavigate }: DayViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState(CalendarService.getDayData(currentDate));
  const [dayEvents, setDayEvents] = useState<Event[]>([]);
  const [timeSlots] = useState(CalendarService.getTimeSlots(6, 22)); // 6 AM to 10 PM

  useEffect(() => {
    const newDayData = CalendarService.getDayData(currentDate);
    setDayData(newDayData);
    
    // Get events for this specific day
    const eventsForDay = CalendarService.getEventsForDate(events, currentDate);
    setDayEvents(eventsForDay);
  }, [currentDate, events]);

  const handlePreviousDay = () => {
    const newDate = CalendarService.getPreviousDay(currentDate);
    setCurrentDate(newDate);
    if (onNavigate) {
      onNavigate(newDate);
    }
  };

  const handleNextDay = () => {
    const newDate = CalendarService.getNextDay(currentDate);
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

  const getEventsForHour = (hour: number): Event[] => {
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
    const baseClasses = 'absolute left-2 right-2 px-3 py-2 rounded text-sm font-medium cursor-pointer overflow-hidden shadow-sm';
    const typeColor = EventService.getEventTypeColor(event.type);
    return `${baseClasses} ${typeColor}`;
  };

  const isToday = (date: Date): boolean => {
    return CalendarService.isToday(date);
  };

  const isWeekend = (date: Date): boolean => {
    return CalendarService.isWeekend(date);
  };

  const getCurrentTimePosition = (): number => {
    const now = new Date();
    if (CalendarService.isSameDay(now, currentDate)) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return ((currentMinutes - (6 * 60)) / 60) * 60; // 6 AM start
    }
    return -1; // Not today
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousDay}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
          >
            →
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            {CalendarService.formatEventDate(currentDate)}
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

      {/* Day View Grid */}
      <div className="relative">
        {/* Time Slots */}
        <div className="grid grid-cols-1">
          {timeSlots.map((timeSlot, index) => {
            const hour = index + 6; // 6 AM start
            const hourEvents = getEventsForHour(hour);
            
            return (
              <div
                key={timeSlot}
                className="relative border-b border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ height: '60px' }}
                onClick={() => onTimeSlotClick?.(currentDate, hour, 0)}
              >
                {/* Time Label */}
                <div className="absolute left-0 top-0 w-16 h-full bg-gray-50 border-r border-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {timeSlot}
                </div>

                {/* Events for this hour */}
                <div className="ml-16 h-full relative">
                  {hourEvents.map((event) => {
                    const position = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
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
                        {event.location.name && (
                          <div className="text-xs opacity-75 truncate">
                            📍 {event.location.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        {getCurrentTimePosition() >= 0 && (
          <div
            className="absolute left-16 right-0 z-20 pointer-events-none"
            style={{ top: `${getCurrentTimePosition()}px` }}
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5"></div>
              <div className="flex-1 h-0.5 bg-red-500"></div>
            </div>
          </div>
        )}
      </div>

      {/* Day Summary */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} today
          </div>
          
          <div className="flex flex-wrap gap-2">
            {dayEvents.length > 0 && (
              <div className="text-xs text-gray-500">
                Next: {dayEvents[0]?.title}
              </div>
            )}
          </div>
        </div>

        {/* Event Type Summary */}
        {dayEvents.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(new Set(dayEvents.map(e => e.type))).map(type => {
              const count = dayEvents.filter(e => e.type === type).length;
              return (
                <div
                  key={type}
                  className={`text-xs px-2 py-1 rounded ${EventService.getEventTypeColor(type)}`}
                >
                  {EventService.getEventTypeDisplayName(type)}: {count}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 