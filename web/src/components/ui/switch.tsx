import React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ 
  label, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="form-check form-switch">
      <input 
        className={`form-check-input ${className}`}
        type="checkbox"
        {...props}
      />
      {label && (
        <label className="form-check-label">
          {label}
        </label>
      )}
    </div>
  );
}; 