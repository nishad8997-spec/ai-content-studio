import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '' }) => {
  return (
    <div
      className={`animate-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-hover)',
        marginBottom: '8px'
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-card)'
  }}>
    <Skeleton width="40%" height="16px" />
    <Skeleton width="70%" height="28px" />
    <div style={{ marginTop: '16px' }}>
      <Skeleton width="100%" height="8px" borderRadius="var(--radius-full)" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 4 }) => (
  <div style={{ width: '100%' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ width: '50%' }}>
          <Skeleton width="60%" height="18px" />
          <Skeleton width="40%" height="14px" />
        </div>
        <Skeleton width="20%" height="24px" borderRadius="var(--radius-full)" />
        <Skeleton width="15%" height="32px" borderRadius="var(--radius-md)" />
      </div>
    ))}
  </div>
);
