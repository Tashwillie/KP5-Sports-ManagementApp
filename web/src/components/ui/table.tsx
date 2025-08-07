import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <table className={`table ${className}`} {...props}>
      {children}
    </table>
  );
};

export const TableHeader: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <th className={className} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <td className={className} {...props}>
      {children}
    </td>
  );
}; 