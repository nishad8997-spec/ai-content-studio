import React, { memo } from 'react';

export const Card = memo(({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  padding = '24px',
  onClick,
  style = {},
  ...props
}) => {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      style={{
        background: glass ? 'var(--bg-glass)' : 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-card)',
        backdropFilter: glass ? 'blur(12px)' : 'none',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      className={`card-component ${hoverEffect ? 'hover-elevate' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
