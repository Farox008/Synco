import React from 'react';

interface StatusPillProps {
  status: string;
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, className = '' }) => {
  const normalizedStatus = status.toLowerCase().split(' ')[0];
  return (
    <span className={`status-pill status-${normalizedStatus} ${className}`}>
      {label || (status === 'Out' ? 'QA' : status)}
    </span>
  );
};
