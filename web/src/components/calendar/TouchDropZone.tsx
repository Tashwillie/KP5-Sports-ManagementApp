'use client';

import { useState, useEffect, useRef } from 'react';
import { DropTarget } from '../../lib/services/dragDropService';
import { TouchDragService } from '../../lib/services/touchDragService';

interface TouchDropZoneProps {
  date: Date;
  hour?: number;
  minute?: number;
  children: React.ReactNode;
  onDrop?: (dropTarget: DropTarget) => void;
  className?: string;
  touchOptions?: {
    enableTouchDrag?: boolean;
    touchThreshold?: number;
    touchDelay?: number;
  };
}

export function TouchDropZone({ 
  date, 
  hour, 
  minute, 
  children, 
  onDrop, 
  className = '',
  touchOptions = {}
}: TouchDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidDrop, setIsValidDrop] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Enable touch drag on element
    TouchDragService.enableTouchDrag(element);

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
      
      // Check if this is a valid drop target
      setIsValidDrop(true); // Placeholder - should be calculated
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setIsValidDrop(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setIsValidDrop(false);

      if (onDrop) {
        const dropTarget: DropTarget = {
          date,
          hour,
          minute,
          isValid: isValidDrop,
          conflicts: [], // Should be calculated based on existing events
        };
        onDrop(dropTarget);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!touchOptions.enableTouchDrag) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Show touch feedback
      TouchDragService.showTouchFeedback(element, 'start');
      
      const touch = e.touches[0];
      if (touch) {
        TouchDragService.createTouchRipple(touch.clientX, touch.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchOptions.enableTouchDrag) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Check if touch is over this drop zone
      const touch = e.touches[0];
      if (touch) {
        const rect = element.getBoundingClientRect();
        const isOver = touch.clientX >= rect.left && 
                      touch.clientX <= rect.right && 
                      touch.clientY >= rect.top && 
                      touch.clientY <= rect.bottom;
        
        if (isOver) {
          setIsDragOver(true);
          setIsValidDrop(true); // Placeholder - should be calculated
          
          // Show touch feedback
          TouchDragService.showTouchFeedback(element, 'move');
        } else {
          setIsDragOver(false);
          setIsValidDrop(false);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchOptions.enableTouchDrag) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      if (isDragOver && onDrop) {
        const dropTarget: DropTarget = {
          date,
          hour,
          minute,
          isValid: isValidDrop,
          conflicts: [], // Should be calculated based on existing events
        };
        onDrop(dropTarget);
      }
      
      setIsDragOver(false);
      setIsValidDrop(false);
      
      // Show touch feedback
      TouchDragService.showTouchFeedback(element, 'end');
    };

    // Add event listeners
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [date, hour, minute, onDrop, isValidDrop, touchOptions]);

  const getDropZoneStyle = (): React.CSSProperties => {
    if (!isDragOver) return {};

    if (isTouchDevice) {
      return TouchDragService.getTouchDropTargetStyle({
        date,
        hour,
        minute,
        isValid: isValidDrop,
        conflicts: [],
      });
    } else {
      return {
        backgroundColor: isValidDrop ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `2px dashed ${isValidDrop ? '#22C55E' : '#EF4444'}`,
        borderRadius: '4px',
        transition: 'all 0.2s ease-in-out',
      };
    }
  };

  return (
    <div
      ref={elementRef}
      data-drop-zone={date.toISOString()}
      data-date={date.toISOString()}
      data-hour={hour?.toString()}
      data-minute={minute?.toString()}
      className={`drop-zone ${className} ${isTouchDevice ? 'touch-drop-zone' : ''}`}
      style={getDropZoneStyle()}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {children}
      
      {/* Drop Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`px-3 py-2 rounded text-sm font-medium ${
            isValidDrop ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isTouchDevice ? 'Release to drop' : isValidDrop ? 'Drop to reschedule' : 'Conflicts detected'}
          </div>
        </div>
      )}

      {/* Touch Instructions */}
      {isTouchDevice && !isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Drop zone
          </div>
        </div>
      )}
    </div>
  );
} 