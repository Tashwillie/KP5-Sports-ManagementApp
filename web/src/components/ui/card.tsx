import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <h5 className={`card-title ${className}`} {...props}>
      {children}
    </h5>
  );
};

export const CardDescription: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <p className={`card-text text-muted ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardText: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <p className={`card-text ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardFooter: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
}; 