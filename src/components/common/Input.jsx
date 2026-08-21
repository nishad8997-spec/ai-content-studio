import React, { memo, useId } from 'react';

export const Input = memo(({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  rows = 4,
  options = [],
  id: customId,
  ...props
}) => {
  const generatedId = useId();
  const fieldId = customId || generatedId;
  const errorId = `${fieldId}-error`;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
    width: '100%'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)'
  };

  const fieldStyle = {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${error ? 'var(--danger)' : 'var(--border-medium)'}`,
    background: 'var(--bg-surface)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    transition: 'border-color var(--transition-fast)'
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={fieldId} style={labelStyle}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)'
            }}
          >
            <Icon size={18} />
          </div>
        )}

        {type === 'textarea' ? (
          <textarea
            id={fieldId}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            style={{
              ...fieldStyle,
              paddingLeft: Icon ? '40px' : '14px',
              resize: 'vertical'
            }}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            id={fieldId}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            style={{
              ...fieldStyle,
              paddingLeft: Icon ? '40px' : '14px',
              cursor: 'pointer'
            }}
            {...props}
          >
            {options.map((opt, idx) => (
              <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            style={{
              ...fieldStyle,
              paddingLeft: Icon ? '40px' : '14px'
            }}
            {...props}
          />
        )}
      </div>

      {error && (
        <span id={errorId} role="alert" style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
