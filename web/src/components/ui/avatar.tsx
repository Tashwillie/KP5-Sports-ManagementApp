import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-circle d-flex align-items-center justify-content-center ${className}`} {...props}>
      {children}
    </div>
  );
};

export const AvatarImage: React.FC<AvatarProps> = ({ className = '', children, ...props }) => {
  return (
    <img className={`rounded-circle ${className}`} {...props}>
      {children}
    </img>
  );
};

export const AvatarFallback: React.FC<AvatarProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center ${className}`} {...props}>
      {children}
    </div>
  );
}; 