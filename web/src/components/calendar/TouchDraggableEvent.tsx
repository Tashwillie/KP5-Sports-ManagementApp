'use client';

import { useState, useRef, useEffect } from 'react';
import { Event } from '../../../../shared/src/types';
import { TouchDragService, TouchDragOptions } from '../../lib/services/touchDragService';
import { DragDropService, DropTarget } from '../../lib/services/dragDropService';
import { EventService } from '../../lib/services/eventService';

interface TouchDraggableEventProps {
  event: Event;
  children: React.ReactNode;
  onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void;
  disabled?: boolean;
  touchOptions?: TouchDragOptions;
}

export function TouchDraggableEvent({ 
  event, 
  children, 
  onReschedule, 
  disabled = false,
  touchOptions = {}
}: TouchDraggableEventProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    // Enable touch drag on element
    TouchDragService.enableTouchDrag(element);

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      if (!touch) return;

      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      
      // Start touch drag handling
      TouchDragService.handleTouchStart(e, event, touchOptions);
      
      // Show touch feedback
      TouchDragService.showTouchFeedback(element, 'start');
      TouchDragService.createTouchRipple(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (TouchDragService.handleTouchMove(e, touchOptions)) {
        setIsDragging(true);
        
        const touch = e.touches[0];
        if (touch) {
          setDragPreview({ x: touch.clientX, y: touch.clientY });
          
          // Update drop target
          const calendarElement = document.querySelector('[data-calendar]') as HTMLElement;
          if (calendarElement) {
            const target = DragDropService.calculateDropTarget(
              { x: touch.clientX, y: touch.clientY },
              calendarElement,
              'month', // This should be dynamic
              [] // Events array should be passed from parent
            );
            setDropTarget(target);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (TouchDragService.handleTouchEnd(e, onReschedule)) {
        setIsDragging(false);
        setDragPreview(null);
        setDropTarget(null);
        
        // Show touch feedback
        TouchDragService.showTouchFeedback(element, 'end');
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isTouchDevice) return; // Skip mouse events on touch devices
      if (disabled) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      setDragPreview({ x: e.clientX, y: e.clientY });

      // Start drag in service
      DragDropService.startDrag(event, { x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice || !isDragging) return;

      setDragPreview({ x: e.clientX, y: e.clientY });
      
      // Update drag position in service
      DragDropService.updateDragPosition({ x: e.clientX, y: e.clientY });
      
      // Calculate drop target
      const calendarElement = document.querySelector('[data-calendar]') as HTMLElement;
      if (calendarElement) {
        const target = DragDropService.calculateDropTarget(
          { x: e.clientX, y: e.clientY },
          calendarElement,
          'month', // This should be dynamic
          [] // Events array should be passed from parent
        );
        setDropTarget(target);
      }
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (isTouchDevice || !isDragging) return;

      setIsDragging(false);
      setDragPreview(null);
      setDropTarget(null);

      // Handle drop
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

      // End drag in service
      DragDropService.endDrag();
    };

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
    };
  }, [event, disabled, isTouchDevice, isDragging, dropTarget, onReschedule, touchOptions]);

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const getDragPreviewStyle = () => {
    if (!dragPreview) return {};

    if (isTouchDevice) {
      return TouchDragService.getTouchDragPreviewStyle(event, dragPreview);
    } else {
      return DragDropService.getDragPreviewStyle(event, dragPreview);
    }
  };

  const getDropTargetStyle = () => {
    if (isTouchDevice) {
      return TouchDragService.getTouchDropTargetStyle(dropTarget);
    } else {
      return DragDropService.getDropTargetStyle(dropTarget);
    }
  };

  return (
    <>
      <div
        ref={elementRef}
        onClick={handleClick}
        className={`${isTouchDevice ? 'touch-draggable' : 'cursor-move'} ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        style={{
          userSelect: 'none',
          touchAction: 'none',
          ...getDropTargetStyle(),
        }}
      >
        {children}
      </div>

      {/* Drag Preview */}
      {isDragging && dragPreview && (
        <div
          className="fixed pointer-events-none z-50"
          style={getDragPreviewStyle()}
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