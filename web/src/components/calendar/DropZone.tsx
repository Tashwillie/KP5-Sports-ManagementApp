'use client';

import { useState, useEffect } from 'react';
import { DropTarget } from '../../lib/services/dragDropService';

interface DropZoneProps {
  date: Date;
  hour?: number;
  minute?: number;
  children: React.ReactNode;
  onDrop?: (dropTarget: DropTarget) => void;
  className?: string;
}

export function DropZone({ date, hour, minute, children, onDrop, className = '' }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValidDrop, setIsValidDrop] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: Event) => {
      e.preventDefault();
      setIsDragOver(true);
      
      // Check if this is a valid drop target
      // This would be calculated based on the dragged event and current events
      setIsValidDrop(true); // Placeholder - should be calculated
    };

    const handleDragLeave = (e: Event) => {
      e.preventDefault();
      setIsDragOver(false);
      setIsValidDrop(false);
    };

    const handleDrop = (e: Event) => {
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

    const element = document.querySelector(`[data-drop-zone="${date.toISOString()}"]`);
    if (element) {
      element.addEventListener('dragover', handleDragOver);
      element.addEventListener('dragleave', handleDragLeave);
      element.addEventListener('drop', handleDrop);
    }

    return () => {
      if (element) {
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('drop', handleDrop);
      }
    };
  }, [date, hour, minute, onDrop, isValidDrop]);

  const getDropZoneStyle = (): React.CSSProperties => {
    if (!isDragOver) return {};

    return {
      backgroundColor: isValidDrop ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      border: `2px dashed ${isValidDrop ? '#22C55E' : '#EF4444'}`,
      borderRadius: '4px',
      transition: 'all 0.2s ease-in-out',
    };
  };

  return (
    <div
      data-drop-zone={date.toISOString()}
      data-date={date.toISOString()}
      data-hour={hour?.toString()}
      data-minute={minute?.toString()}
      className={`drop-zone ${className}`}
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
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isValidDrop ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isValidDrop ? 'Drop to reschedule' : 'Conflicts detected'}
          </div>
        </div>
      )}
    </div>
  );
} 