import React from 'react';

interface ProgressBarProps {
  progress: number;
  variant?: 'default' | 'success' | 'warning';
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, variant = 'default', className = '', showLabel }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }} className={className}>
      <div className="progress-container">
        <div 
          className={`progress-fill ${variant === 'success' || progress === 100 ? 'success' : variant === 'warning' ? 'warning' : ''}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
      {showLabel && <span style={{ fontSize: '11px', fontWeight: 600 }}>{progress}%</span>}
    </div>
  );
};

interface MiniProgressProps {
  progress: number;
  type: 'cnc' | 'milling' | 'heat' | 'grinding' | 'edm';
}

export const MiniProgress: React.FC<MiniProgressProps> = ({ progress, type }) => {
  return (
    <div className="mini-progress-group">
      <div className="mini-progress-label"><span>{progress}%</span></div>
      <div className="mini-progress-bar">
        <div className={`mini-progress-fill ${type}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
