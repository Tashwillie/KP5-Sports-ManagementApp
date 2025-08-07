import React from 'react';

interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`dropdown-menu ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`dropdown-menu ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuProps> = ({ className = '', children, ...props }) => {
  return (
    <a className={`dropdown-item ${className}`} {...props}>
      {children}
    </a>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuProps> = ({ children, ...props }) => {
  return (
    <button 
      className="btn btn-secondary dropdown-toggle" 
      type="button" 
      data-bs-toggle="dropdown"
      {...props}
    >
      {children}
    </button>
  );
}; 