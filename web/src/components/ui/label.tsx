import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <label 
      className={`form-label ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}; 