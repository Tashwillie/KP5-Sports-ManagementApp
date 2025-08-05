'use client';

import { useState, useRef, useEffect } from 'react';
import { Event } from '../../../../shared/src/types';
import { DragDropService, DropTarget } from '../../lib/services/dragDropService';
import { EventService } from '../../lib/services/eventService';

interface DraggableEventProps {
  event: Event;
  children: React.ReactNode;
  onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void;
  disabled?: boolean;
}

export function DraggableEvent({ event, children, onReschedule, disabled = false }: DraggableEventProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDragPreview({ x: e.clientX, y: e.clientY });
        
        // Update drag position in service
        DragDropService.updateDragPosition({ x: e.clientX, y: e.clientY });
        
        // Calculate drop target
        const calendarElement = document.querySelector('[data-calendar]') as HTMLElement;
        if (calendarElement) {
          const target = DragDropService.calculateDropTarget(
            { x: e.clientX, y: e.clientY },
            calendarElement,
            'month', // This should be dynamic based on current view
            [] // Events array should be passed from parent
          );
          setDropTarget(target);
        }
      }
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (isDragging) {
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

            if (result.success) {
              // Show success feedback
              console.log('Event rescheduled successfully');
            } else {
              // Show error feedback
              console.error('Failed to reschedule event:', result.error);
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
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dropTarget, event, onReschedule]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragPreview({ x: e.clientX, y: e.clientY });

    // Start drag in service
    DragDropService.startDrag(event, { x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      <div
        ref={elementRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={`cursor-move ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${
          isDragging ? 'opacity-50' : ''
        }`}
        draggable={!disabled}
        style={{
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {children}
      </div>

      {/* Drag Preview */}
      {isDragging && dragPreview && (
        <div
          className="fixed pointer-events-none z-50 opacity-80 transform rotate-1"
          style={{
            left: dragPreview.x + 10,
            top: dragPreview.y + 10,
            maxWidth: '200px',
            backgroundColor: 'white',
            border: '2px solid #3B82F6',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
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

      {/* Drop Target Indicator */}
      {dropTarget && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: dropTarget.date ? 0 : 0, // This should be calculated based on drop target position
            top: dropTarget.date ? 0 : 0,
            width: '100%',
            height: '100%',
            backgroundColor: dropTarget.isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `2px dashed ${dropTarget.isValid ? '#22C55E' : '#EF4444'}`,
            borderRadius: '4px',
          }}
        />
      )}
    </>
  );
} 