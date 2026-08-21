import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../config/roles';
import { SkeletonCard } from '../common/Skeleton';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [], onNavigate }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '800px', margin: '40px auto' }}>
        <SkeletonCard />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '80px auto',
        padding: '32px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <ShieldAlert size={48} color="var(--primary-600)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Please sign in to your AI Content Studio account to access this page.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('/auth')}
          style={{
            padding: '10px 24px',
            background: 'var(--primary-600)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !hasPermission(user.role, allowedRoles)) {
    return (
      <div style={{
        maxWidth: '480px',
        margin: '80px auto',
        padding: '32px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--danger)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Your account role (<strong>{user.role?.toUpperCase()}</strong>) does not have sufficient permissions to view this resource.
        </p>
        <button
          onClick={() => onNavigate && onNavigate('/dashboard')}
          style={{
            padding: '10px 24px',
            background: 'var(--primary-600)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return children;
};
