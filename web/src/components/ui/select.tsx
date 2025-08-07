import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <select 
        className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export const SelectTrigger: React.FC<SelectProps> = (props) => {
  return <Select {...props} />;
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <option value="">{placeholder}</option>;
}; 