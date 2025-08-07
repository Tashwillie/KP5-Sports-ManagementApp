import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) => {
  const variantClass = `alert-${variant}`;
  
  return (
    <div 
      className={`alert ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertProps> = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <div 
      className={`alert-description ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 