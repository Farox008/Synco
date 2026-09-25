import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, extra, className = '', style, onClick }) => {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {(title || extra) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <div>
            {title && <h3 style={{ fontSize: '16px' }}>{title}</h3>}
            {subtitle && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{subtitle}</span>}
          </div>
          {extra}
        </div>
      )}
      {children}
    </div>
  );
};
