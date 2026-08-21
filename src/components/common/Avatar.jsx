import React, { useState, useEffect } from 'react';

/**
 * Robust User Avatar Component with graceful fallback to user initials
 * and seamless handling of broken/unreachable image URLs.
 */
export const Avatar = ({ 
  src, 
  name = 'User', 
  size = 36, 
  fontSize,
  bordered = false,
  className = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Compute initials fallback (e.g. "Alex Rivera" -> "AR", "Creator" -> "C", default "U")
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'U'
    : 'U';

  const dimensionStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: '50%'
  };

  const calculatedFontSize = fontSize || (size >= 64 ? '1.5rem' : size >= 40 ? '1rem' : '0.85rem');

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        onError={() => setImageError(true)}
        className={className}
        style={{
          ...dimensionStyle,
          objectFit: 'cover',
          border: bordered ? '2px solid var(--primary-500)' : 'none',
          boxShadow: 'var(--shadow-sm)',
          ...style
        }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Avatar for ${name}`}
      className={className}
      style={{
        ...dimensionStyle,
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: calculatedFontSize,
        fontFamily: 'Outfit, Inter, sans-serif',
        userSelect: 'none',
        border: bordered ? '2px solid var(--primary-500)' : 'none',
        boxShadow: 'var(--shadow-sm)',
        ...style
      }}
    >
      {initials}
    </div>
  );
};
