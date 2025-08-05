import { Event } from '../../../../shared/src/types';
import { CalendarService } from './calendarService';
import { EventService } from './eventService';

export interface DragDropState {
  isDragging: boolean;
  draggedEvent: Event | null;
  dragStartPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  dropTarget: DropTarget | null;
}

export interface DropTarget {
  date: Date;
  hour?: number;
  minute?: number;
  isValid: boolean;
  conflicts: Event[];
}

export interface RescheduleResult {
  success: boolean;
  event: Event;
  oldDate: Date;
  newDate: Date;
  conflicts: Event[];
  error?: string;
}

export class DragDropService {
  private static dragState: DragDropState = {
    isDragging: false,
    draggedEvent: null,
    dragStartPosition: null,
    currentPosition: null,
    dropTarget: null,
  };

  // Drag State Management
  static getDragState(): DragDropState {
    return { ...this.dragState };
  }

  static setDragState(state: Partial<DragDropState>): void {
    this.dragState = { ...this.dragState, ...state };
  }

  static startDrag(event: Event, startPosition: { x: number; y: number }): void {
    this.dragState = {
      isDragging: true,
      draggedEvent: event,
      dragStartPosition: startPosition,
      currentPosition: startPosition,
      dropTarget: null,
    };
  }

  static updateDragPosition(position: { x: number; y: number }): void {
    this.dragState.currentPosition = position;
  }

  static endDrag(): void {
    this.dragState = {
      isDragging: false,
      draggedEvent: null,
      dragStartPosition: null,
      currentPosition: null,
      dropTarget: null,
    };
  }

  // Drop Target Calculation
  static calculateDropTarget(
    position: { x: number; y: number },
    calendarElement: HTMLElement,
    viewType: 'month' | 'week' | 'day',
    events: Event[]
  ): DropTarget | null {
    const rect = calendarElement.getBoundingClientRect();
    const relativeX = position.x - rect.left;
    const relativeY = position.y - rect.top;

    switch (viewType) {
      case 'month':
        return this.calculateMonthDropTarget(relativeX, relativeY, calendarElement, events);
      case 'week':
        return this.calculateWeekDropTarget(relativeX, relativeY, calendarElement, events);
      case 'day':
        return this.calculateDayDropTarget(relativeY, calendarElement, events);
      default:
        return null;
    }
  }

  private static calculateMonthDropTarget(
    x: number,
    y: number,
    calendarElement: HTMLElement,
    events: Event[]
  ): DropTarget | null {
    const dayCells = Array.from(calendarElement.querySelectorAll('[data-day]'));
    let targetCell: Element | null = null;

    for (const cell of dayCells) {
      const rect = cell.getBoundingClientRect();
      const cellRect = {
        left: rect.left - calendarElement.getBoundingClientRect().left,
        top: rect.top - calendarElement.getBoundingClientRect().top,
        right: rect.right - calendarElement.getBoundingClientRect().left,
        bottom: rect.bottom - calendarElement.getBoundingClientRect().top,
      };

      if (x >= cellRect.left && x <= cellRect.right && y >= cellRect.top && y <= cellRect.bottom) {
        targetCell = cell;
        break;
      }
    }

    if (!targetCell) return null;

    const dateString = targetCell.getAttribute('data-day');
    if (!dateString) return null;

    const targetDate = new Date(dateString);
    const conflicts = this.detectConflictsForDate(events, targetDate);

    return {
      date: targetDate,
      isValid: conflicts.length === 0,
      conflicts,
    };
  }

  private static calculateWeekDropTarget(
    x: number,
    y: number,
    calendarElement: HTMLElement,
    events: Event[]
  ): DropTarget | null {
    const timeSlots = Array.from(calendarElement.querySelectorAll('[data-time-slot]'));
    let targetSlot: Element | null = null;

    for (const slot of timeSlots) {
      const rect = slot.getBoundingClientRect();
      const slotRect = {
        left: rect.left - calendarElement.getBoundingClientRect().left,
        top: rect.top - calendarElement.getBoundingClientRect().top,
        right: rect.right - calendarElement.getBoundingClientRect().left,
        bottom: rect.bottom - calendarElement.getBoundingClientRect().top,
      };

      if (x >= slotRect.left && x <= slotRect.right && y >= slotRect.top && y <= slotRect.bottom) {
        targetSlot = slot;
        break;
      }
    }

    if (!targetSlot) return null;

    const dateString = targetSlot.getAttribute('data-date');
    const hourString = targetSlot.getAttribute('data-hour');
    
    if (!dateString || !hourString) return null;

    const targetDate = new Date(dateString);
    const hour = parseInt(hourString, 10);
    const conflicts = this.detectConflictsForDateTime(events, targetDate, hour);

    return {
      date: targetDate,
      hour,
      isValid: conflicts.length === 0,
      conflicts,
    };
  }

  private static calculateDayDropTarget(
    y: number,
    calendarElement: HTMLElement,
    events: Event[]
  ): DropTarget | null {
    const timeSlots = Array.from(calendarElement.querySelectorAll('[data-time-slot]'));
    let targetSlot: Element | null = null;

    for (const slot of timeSlots) {
      const rect = slot.getBoundingClientRect();
      const slotRect = {
        top: rect.top - calendarElement.getBoundingClientRect().top,
        bottom: rect.bottom - calendarElement.getBoundingClientRect().top,
      };

      if (y >= slotRect.top && y <= slotRect.bottom) {
        targetSlot = slot;
        break;
      }
    }

    if (!targetSlot) return null;

    const dateString = targetSlot.getAttribute('data-date');
    const hourString = targetSlot.getAttribute('data-hour');
    
    if (!dateString || !hourString) return null;

    const targetDate = new Date(dateString);
    const hour = parseInt(hourString, 10);
    const conflicts = this.detectConflictsForDateTime(events, targetDate, hour);

    return {
      date: targetDate,
      hour,
      isValid: conflicts.length === 0,
      conflicts,
    };
  }

  // Conflict Detection
  private static detectConflictsForDate(events: Event[], date: Date): Event[] {
    const dateKey = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toISOString().split('T')[0] === dateKey;
    });

    return dayEvents;
  }

  private static detectConflictsForDateTime(events: Event[], date: Date, hour: number): Event[] {
    const dateKey = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventDateKey = eventDate.toISOString().split('T')[0];
      return eventDateKey === dateKey && eventDate.getHours() === hour;
    });

    return dayEvents;
  }

  // Event Rescheduling
  static async rescheduleEvent(
    event: Event,
    newDate: Date,
    newHour?: number,
    newMinute: number = 0
  ): Promise<RescheduleResult> {
    try {
      const oldDate = new Date(event.startDate);
      const oldEndDate = new Date(event.endDate);
      
      // Calculate duration
      const duration = oldEndDate.getTime() - oldDate.getTime();
      
      // Create new start date
      const newStartDate = new Date(newDate);
      if (newHour !== undefined) {
        newStartDate.setHours(newHour, newMinute, 0, 0);
      }
      
      // Create new end date
      const newEndDate = new Date(newStartDate.getTime() + duration);

      // Check for conflicts
      const conflicts = await this.checkRescheduleConflicts(event, newStartDate, newEndDate);

      if (conflicts.length > 0) {
        return {
          success: false,
          event,
          oldDate,
          newDate: newStartDate,
          conflicts,
          error: 'Conflicts detected with existing events',
        };
      }

      // Update event
      const updatedEvent = {
        ...event,
        startDate: newStartDate,
        endDate: newEndDate,
        updatedAt: new Date(),
      };

      // Save to database
      await EventService.updateEvent(event.id, {
        startDate: newStartDate,
        endDate: newEndDate,
        updatedAt: new Date(),
      });

      return {
        success: true,
        event: updatedEvent as Event,
        oldDate,
        newDate: newStartDate,
        conflicts: [],
      };
    } catch (error) {
      console.error('Error rescheduling event:', error);
      return {
        success: false,
        event,
        oldDate: new Date(event.startDate),
        newDate,
        conflicts: [],
        error: 'Failed to reschedule event',
      };
    }
  }

  private static async checkRescheduleConflicts(
    event: Event,
    newStartDate: Date,
    newEndDate: Date
  ): Promise<Event[]> {
    try {
      // Get events for the new date range
      const events = await EventService.getEventsForCalendar(
        event.teamIds[0], // Assuming single team for now
        newStartDate,
        newEndDate
      );

      // Filter out the current event and check for conflicts
      const otherEvents = events.filter(e => e.id !== event.id);
      const conflicts = CalendarService.detectConflicts(otherEvents);

      return conflicts.map(conflict => conflict.event1.id === event.id ? conflict.event2 : conflict.event1);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }

  // Visual Feedback
  static getDragPreviewStyle(event: Event, position: { x: number; y: number }): React.CSSProperties {
    return {
      position: 'fixed',
      left: position.x + 10,
      top: position.y + 10,
      zIndex: 1000,
      pointerEvents: 'none',
      opacity: 0.8,
      transform: 'rotate(5deg)',
      maxWidth: '200px',
      backgroundColor: 'white',
      border: '2px solid #3B82F6',
      borderRadius: '8px',
      padding: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    };
  }

  static getDropTargetStyle(dropTarget: DropTarget | null): React.CSSProperties {
    if (!dropTarget) return {};

    return {
      backgroundColor: dropTarget.isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `2px dashed ${dropTarget.isValid ? '#22C55E' : '#EF4444'}`,
      borderRadius: '4px',
    };
  }

  // Utility Methods
  static isValidDropTarget(dropTarget: DropTarget | null): boolean {
    return dropTarget !== null && dropTarget.isValid;
  }

  static getDropTargetConflicts(dropTarget: DropTarget | null): Event[] {
    return dropTarget?.conflicts || [];
  }

  static formatDropTargetInfo(dropTarget: DropTarget | null): string {
    if (!dropTarget) return '';

    const dateStr = dropTarget.date.toLocaleDateString();
    const timeStr = dropTarget.hour !== undefined 
      ? `${dropTarget.hour.toString().padStart(2, '0')}:${(dropTarget.minute || 0).toString().padStart(2, '0')}`
      : '';

    const conflictsStr = dropTarget.conflicts.length > 0 
      ? ` (${dropTarget.conflicts.length} conflict${dropTarget.conflicts.length > 1 ? 's' : ''})`
      : '';

    return `${dateStr}${timeStr ? ` at ${timeStr}` : ''}${conflictsStr}`;
  }
} 