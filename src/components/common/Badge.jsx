import React, { memo } from 'react';

export const Badge = memo(({ children, variant = 'primary', size = 'sm' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid #a7f3d0' };
      case 'warning':
        return { background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid #fde68a' };
      case 'danger':
        return { background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #fecaca' };
      case 'purple':
        return { background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' };
      case 'cyan':
        return { background: '#ecfeff', color: '#0891b2', border: '1px solid #cff4fc' };
      case 'primary':
      default:
        return { background: 'var(--primary-50)', color: 'var(--primary-700)', border: '1px solid var(--primary-200)' };
    }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
      fontWeight: 600,
      borderRadius: 'var(--radius-full)',
      ...getStyles()
    }}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
