import React, { useState } from 'react';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  defaultValue?: string;
}

export const Tabs: React.FC<TabsProps> = ({ className = '', children, defaultValue, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const TabsList: React.FC<TabsProps> = ({ className = '', children, ...props }) => {
  return (
    <ul className={`nav nav-tabs ${className}`} {...props}>
      {children}
    </ul>
  );
};

export const TabsTrigger: React.FC<TabsProps & { value: string }> = ({ 
  className = '', 
  children, 
  value,
  ...props 
}) => {
  return (
    <li className="nav-item">
      <button 
        className={`nav-link ${className}`}
        data-bs-toggle="tab"
        data-bs-target={`#${value}`}
        {...props}
      >
        {children}
      </button>
    </li>
  );
};

export const TabsContent: React.FC<TabsProps & { value: string }> = ({ 
  className = '', 
  children, 
  value,
  ...props 
}) => {
  return (
    <div 
      className={`tab-pane fade ${className}`}
      id={value}
      {...props}
    >
      {children}
    </div>
  );
}; 