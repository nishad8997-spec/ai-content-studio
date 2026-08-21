import React, { memo } from 'react';

export const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: 'var(--primary-100)',
          color: 'var(--primary-700)',
          border: '1px solid var(--primary-200)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-main)',
          border: '1px solid var(--border-medium)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          background: 'var(--danger)',
          color: '#ffffff',
          border: 'none',
        };
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.85rem' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '1.05rem' };
      case 'md':
      default:
        return { padding: '10px 20px', fontSize: '0.95rem' };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: 'var(--radius-md)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.65 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-fast)',
        ...getVariantStyles(),
        ...getSizeStyles(),
      }}
      className={`btn-component ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
