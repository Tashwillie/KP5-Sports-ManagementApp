import React from 'react';

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog: React.FC<DialogProps> = ({ 
  children, 
  open = false, 
  onOpenChange,
  ...props 
}) => {
  return (
    <div className={`modal fade ${open ? 'show' : ''}`} {...props}>
      {children}
    </div>
  );
};

export const DialogContent: React.FC<DialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-dialog ${className}`} {...props}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<DialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogProps> = ({ className = '', children, ...props }) => {
  return (
    <h5 className={`modal-title ${className}`} {...props}>
      {children}
    </h5>
  );
};

export const DialogDescription: React.FC<DialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-body ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogTrigger: React.FC<DialogProps> = ({ children, ...props }) => {
  return (
    <div data-bs-toggle="modal" {...props}>
      {children}
    </div>
  );
}; 