import React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ 
  label, 
  className = '', 
  onCheckedChange,
  onChange,
  ...props 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    onChange?.(e);
  };
  return (
    <div className="form-check form-switch">
      <input 
        className={`form-check-input ${className}`}
        type="checkbox"
        onChange={handleChange}
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