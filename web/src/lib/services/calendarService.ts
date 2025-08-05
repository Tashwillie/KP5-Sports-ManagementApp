import { Event, CalendarViewType, CalendarFilter, CalendarSettings } from '../../../../shared/src/types';
import { EventService } from './eventService';

export class CalendarService {
  // Calendar Navigation
  static getCurrentMonth(): { year: number; month: number } {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  }

  static getMonthData(year: number, month: number): {
    days: Date[];
    startDate: Date;
    endDate: Date;
    weeks: Date[][];
  } {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const startDay = startDate.getDay();
    
    // Get the first day to display (previous month's days)
    const firstDisplayDate = new Date(startDate);
    firstDisplayDate.setDate(firstDisplayDate.getDate() - startDay);
    
    const days: Date[] = [];
    const currentDate = new Date(firstDisplayDate);
    
    // Generate 42 days (6 weeks * 7 days) to ensure we have full weeks
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group days into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return {
      days,
      startDate,
      endDate,
      weeks,
    };
  }

  static getWeekData(date: Date): {
    days: Date[];
    startDate: Date;
    endDate: Date;
  } {
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      days,
      startDate,
      endDate,
    };
  }

  static getDayData(date: Date): {
    date: Date;
    startTime: Date;
    endTime: Date;
  } {
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);
    
    return {
      date,
      startTime,
      endTime,
    };
  }

  // Event Organization
  static organizeEventsByDate(events: Event[]): Map<string, Event[]> {
    const eventsByDate = new Map<string, Event[]>();
    
    events.forEach(event => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    });
    
    return eventsByDate;
  }

  static organizeEventsByHour(events: Event[], date: Date): Map<number, Event[]> {
    const eventsByHour = new Map<number, Event[]>();
    
    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      eventsByHour.set(hour, []);
    }
    
    events.forEach(event => {
      const eventDate = new Date(event.startDate);
      if (eventDate.toDateString() === date.toDateString()) {
        const hour = eventDate.getHours();
        eventsByHour.get(hour)!.push(event);
      }
    });
    
    return eventsByHour;
  }

  static getEventsForDate(events: Event[], date: Date): Event[] {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  static getEventsForDateRange(events: Event[], startDate: Date, endDate: Date): Event[] {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  // Calendar View Helpers
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  static isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && 
           date1.getMonth() === date2.getMonth();
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  static isOtherMonth(date: Date, currentMonth: number, currentYear: number): boolean {
    return date.getMonth() !== currentMonth || date.getFullYear() !== currentYear;
  }

  // Time Slot Management
  static getTimeSlots(startHour: number = 0, endHour: number = 24): string[] {
    const timeSlots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return timeSlots;
  }

  static getTimeSlotHeight(hour: number): number {
    // Return height in pixels for each hour slot
    return 60; // 60px per hour
  }

  static getEventPosition(event: Event, startHour: number = 0): {
    top: number;
    height: number;
    left: number;
    width: number;
  } {
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const duration = endMinutes - startMinutes;
    
    const top = ((startMinutes - (startHour * 60)) / 60) * 60; // 60px per hour
    const height = (duration / 60) * 60;
    
    return {
      top,
      height,
      left: 0,
      width: 100,
    };
  }

  // Calendar Navigation
  static getPreviousMonth(year: number, month: number): { year: number; month: number } {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  }

  static getNextMonth(year: number, month: number): { year: number; month: number } {
    if (month === 11) {
      return { year: year + 1, month: 0 };
    }
    return { year, month: month + 1 };
  }

  static getPreviousWeek(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 7);
    return newDate;
  }

  static getNextWeek(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 7);
    return newDate;
  }

  static getPreviousDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    return newDate;
  }

  static getNextDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    return newDate;
  }

  // Date Formatting
  static formatMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  static formatEventDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  static formatWeekRange(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  }

  static formatDay(date: Date): string {
    return date.getDate().toString();
  }

  static formatDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  // Event Overlap Detection
  static detectEventOverlaps(events: Event[]): Map<string, Event[]> {
    const overlaps = new Map<string, Event[]>();
    
    // Group events by date
    const eventsByDate = this.organizeEventsByDate(events);
    
    eventsByDate.forEach((dayEvents, dateKey) => {
      const overlappingEvents: Event[] = [];
      
      // Sort events by start time
      dayEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      for (let i = 0; i < dayEvents.length; i++) {
        for (let j = i + 1; j < dayEvents.length; j++) {
          const event1 = dayEvents[i];
          const event2 = dayEvents[j];
          
          const start1 = new Date(event1.startDate);
          const end1 = new Date(event1.endDate);
          const start2 = new Date(event2.startDate);
          const end2 = new Date(event2.endDate);
          
          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            if (!overlappingEvents.includes(event1)) {
              overlappingEvents.push(event1);
            }
            if (!overlappingEvents.includes(event2)) {
              overlappingEvents.push(event2);
            }
          }
        }
      }
      
      if (overlappingEvents.length > 0) {
        overlaps.set(dateKey, overlappingEvents);
      }
    });
    
    return overlaps;
  }

  // Calendar Settings
  static getDefaultCalendarSettings(): CalendarSettings {
    return {
      id: '',
      userId: '',
      defaultView: 'month',
      startDay: 'monday',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      reminderDefaults: {
        defaultReminderTime: 30, // 30 minutes
        defaultReminderType: 'push',
      },
      syncSettings: {
        syncWithGoogle: false,
        syncWithOutlook: false,
        syncWithApple: false,
      },
      updatedAt: new Date(),
    };
  }

  // Event Conflict Detection
  static detectConflicts(events: Event[]): Array<{
    event1: Event;
    event2: Event;
    conflictType: 'time_overlap' | 'location_conflict';
    severity: 'low' | 'medium' | 'high';
  }> {
    const conflicts: Array<{
      event1: Event;
      event2: Event;
      conflictType: 'time_overlap' | 'location_conflict';
      severity: 'low' | 'medium' | 'high';
    }> = [];
    
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];
        
        const start1 = new Date(event1.startDate);
        const end1 = new Date(event1.endDate);
        const start2 = new Date(event2.startDate);
        const end2 = new Date(event2.endDate);
        
        // Check for time overlap
        if (start1 < end2 && start2 < end1) {
          const overlapDuration = Math.min(end1.getTime(), end2.getTime()) - 
                                 Math.max(start1.getTime(), start2.getTime());
          const totalDuration = Math.min(end1.getTime() - start1.getTime(), 
                                       end2.getTime() - start2.getTime());
          const overlapPercentage = overlapDuration / totalDuration;
          
          let severity: 'low' | 'medium' | 'high' = 'low';
          if (overlapPercentage > 0.5) severity = 'high';
          else if (overlapPercentage > 0.25) severity = 'medium';
          
          conflicts.push({
            event1,
            event2,
            conflictType: 'time_overlap',
            severity,
          });
        }
        
        // Check for location conflict (same time, same location)
        if (start1.getTime() === start2.getTime() && 
            event1.location.name === event2.location.name) {
          conflicts.push({
            event1,
            event2,
            conflictType: 'location_conflict',
            severity: 'high',
          });
        }
      }
    }
    
    return conflicts;
  }
} 