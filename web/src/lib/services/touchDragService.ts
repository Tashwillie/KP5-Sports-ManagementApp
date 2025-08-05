import { Event } from '../../../../shared/src/types';
import { DragDropService, DropTarget } from './dragDropService';

export interface TouchDragState {
  isDragging: boolean;
  draggedEvent: Event | null;
  touchStartPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  dropTarget: DropTarget | null;
  touchId: number | null;
}

export interface TouchDragOptions {
  enableTouchDrag?: boolean;
  touchThreshold?: number; // Minimum distance to start drag
  touchDelay?: number; // Delay before drag starts
}

export class TouchDragService {
  private static touchState: TouchDragState = {
    isDragging: false,
    draggedEvent: null,
    touchStartPosition: null,
    currentPosition: null,
    dropTarget: null,
    touchId: null,
  };

  private static defaultOptions: TouchDragOptions = {
    enableTouchDrag: true,
    touchThreshold: 10, // 10px minimum distance
    touchDelay: 200, // 200ms delay
  };

  // Touch State Management
  static getTouchState(): TouchDragState {
    return { ...this.touchState };
  }

  static setTouchState(state: Partial<TouchDragState>): void {
    this.touchState = { ...this.touchState, ...state };
  }

  static startTouchDrag(
    event: Event, 
    touch: Touch, 
    options: TouchDragOptions = {}
  ): void {
    const opts = { ...this.defaultOptions, ...options };
    
    this.touchState = {
      isDragging: true,
      draggedEvent: event,
      touchStartPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY },
      dropTarget: null,
      touchId: touch.identifier,
    };
  }

  static updateTouchPosition(touch: Touch): void {
    if (this.touchState.touchId === touch.identifier) {
      this.touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
    }
  }

  static endTouchDrag(): void {
    this.touchState = {
      isDragging: false,
      draggedEvent: null,
      touchStartPosition: null,
      currentPosition: null,
      dropTarget: null,
      touchId: null,
    };
  }

  // Touch Gesture Detection
  static isTouchDragStart(
    startTouch: Touch,
    currentTouch: Touch,
    options: TouchDragOptions = {}
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    const distance = Math.sqrt(
      Math.pow(currentTouch.clientX - startTouch.clientX, 2) +
      Math.pow(currentTouch.clientY - startTouch.clientY, 2)
    );
    
    return distance >= (opts.touchThreshold || 10);
  }

  static getTouchDistance(touch1: Touch, touch2: Touch): number {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }

  // Touch Event Handlers
  static handleTouchStart(
    event: TouchEvent,
    targetEvent: Event,
    options: TouchDragOptions = {}
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    if (!opts.enableTouchDrag) return false;

    const touch = event.touches[0];
    if (!touch) return false;

    // Store initial touch position
    this.touchState.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    this.touchState.touchId = touch.identifier;
    this.touchState.draggedEvent = targetEvent;

    return true;
  }

  static handleTouchMove(
    event: TouchEvent,
    options: TouchDragOptions = {}
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    if (!opts.enableTouchDrag) return false;

    const touch = Array.from(event.touches).find(t => t.identifier === this.touchState.touchId);
    if (!touch || !this.touchState.touchStartPosition) return false;

    const currentPosition = { x: touch.clientX, y: touch.clientY };
    
    // Check if we should start dragging
    if (!this.touchState.isDragging) {
      if (this.isTouchDragStart(this.touchState.touchStartPosition, currentPosition, opts)) {
        this.startTouchDrag(this.touchState.draggedEvent!, touch, opts);
        return true;
      }
    } else {
      // Update drag position
      this.updateTouchPosition(touch);
      
      // Calculate drop target
      const calendarElement = document.querySelector('[data-calendar]') as HTMLElement;
      if (calendarElement) {
        const dropTarget = DragDropService.calculateDropTarget(
          currentPosition,
          calendarElement,
          'month', // This should be dynamic
          [] // Events array should be passed
        );
        this.touchState.dropTarget = dropTarget;
      }
      
      return true;
    }

    return false;
  }

  static handleTouchEnd(
    event: TouchEvent,
    onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void
  ): boolean {
    if (!this.touchState.isDragging) return false;

    const touch = Array.from(event.changedTouches).find(t => t.identifier === this.touchState.touchId);
    if (!touch) return false;

    // Handle drop
    if (this.touchState.dropTarget && this.touchState.draggedEvent) {
      this.handleTouchDrop(this.touchState.draggedEvent, this.touchState.dropTarget, onReschedule);
    }

    this.endTouchDrag();
    return true;
  }

  private static async handleTouchDrop(
    event: Event,
    dropTarget: DropTarget,
    onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void
  ) {
    if (!DragDropService.isValidDropTarget(dropTarget)) {
      if (onReschedule) {
        onReschedule({
          success: false,
          event,
          error: 'Invalid drop target',
        });
      }
      return;
    }

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
      console.error('Error during touch drop:', error);
      if (onReschedule) {
        onReschedule({
          success: false,
          event,
          error: 'Failed to reschedule event',
        });
      }
    }
  }

  // Visual Feedback for Touch
  static getTouchDragPreviewStyle(
    event: Event, 
    position: { x: number; y: number }
  ): React.CSSProperties {
    return {
      position: 'fixed',
      left: position.x + 10,
      top: position.y + 10,
      zIndex: 1000,
      pointerEvents: 'none',
      opacity: 0.9,
      transform: 'rotate(2deg) scale(1.05)',
      maxWidth: '250px',
      backgroundColor: 'white',
      border: '2px solid #3B82F6',
      borderRadius: '12px',
      padding: '12px',
      boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
      fontSize: '14px',
      fontWeight: '500',
    };
  }

  static getTouchDropTargetStyle(dropTarget: DropTarget | null): React.CSSProperties {
    if (!dropTarget) return {};

    return {
      backgroundColor: dropTarget.isValid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
      border: `3px dashed ${dropTarget.isValid ? '#22C55E' : '#EF4444'}`,
      borderRadius: '8px',
      transform: 'scale(1.02)',
      transition: 'all 0.15s ease-in-out',
    };
  }

  // Touch Gesture Utilities
  static isMultiTouch(event: TouchEvent): boolean {
    return event.touches.length > 1;
  }

  static getTouchCenter(touches: TouchList): { x: number; y: number } {
    let x = 0, y = 0;
    for (let i = 0; i < touches.length; i++) {
      x += touches[i].clientX;
      y += touches[i].clientY;
    }
    return {
      x: x / touches.length,
      y: y / touches.length,
    };
  }

  static preventDefaultTouchEvents(element: HTMLElement): void {
    element.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    element.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
  }

  static enableTouchDrag(element: HTMLElement): void {
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.webkitTouchCallout = 'none';
  }

  // Touch Feedback
  static showTouchFeedback(element: HTMLElement, type: 'start' | 'move' | 'end'): void {
    const feedbackClass = `touch-feedback-${type}`;
    element.classList.add(feedbackClass);
    
    setTimeout(() => {
      element.classList.remove(feedbackClass);
    }, 150);
  }

  static createTouchRipple(x: number, y: number, color: string = '#3B82F6'): void {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = `${x - 20}px`;
    ripple.style.top = `${y - 20}px`;
    ripple.style.width = '40px';
    ripple.style.height = '40px';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = color;
    ripple.style.opacity = '0.6';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    ripple.style.transform = 'scale(0)';
    ripple.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';

    document.body.appendChild(ripple);

    // Trigger animation
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });

    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 300);
  }
} 