import React from 'react';

interface AlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ 
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

export const AlertDialogContent: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-dialog ${className}`} {...props}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

export const AlertDialogHeader: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertDialogTitle: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <h5 className={`modal-title ${className}`} {...props}>
      {children}
    </h5>
  );
};

export const AlertDialogDescription: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-body ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertDialogFooter: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`modal-footer ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AlertDialogCancel: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <button className={`btn btn-secondary ${className}`} {...props}>
      {children}
    </button>
  );
};

export const AlertDialogAction: React.FC<AlertDialogProps> = ({ className = '', children, ...props }) => {
  return (
    <button className={`btn btn-primary ${className}`} {...props}>
      {children}
    </button>
  );
};

export const AlertDialogTrigger: React.FC<AlertDialogProps> = ({ children, ...props }) => {
  return (
    <div data-bs-toggle="modal" {...props}>
      {children}
    </div>
  );
}; 