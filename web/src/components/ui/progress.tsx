import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value = 0, 
  max = 100, 
  className = '', 
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`progress ${className}`} {...props}>
      <div 
        className="progress-bar" 
        role="progressbar" 
        style={{ width: `${percentage}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {percentage}%
      </div>
    </div>
  );
}; 