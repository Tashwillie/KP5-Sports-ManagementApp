import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) => {
  const variantClass = `bg-${variant}`;
  
  return (
    <span 
      className={`badge ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}; 