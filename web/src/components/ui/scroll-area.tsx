import React from 'react';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ maxHeight: '400px' }}
      {...props}
    >
      {children}
    </div>
  );
}; 