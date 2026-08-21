import React, { useState } from 'react';
import { Search, Bell, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../config/constants';
import { Avatar } from '../common/Avatar';

export const TopNav = ({ onNavigate }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header role="banner" style={{
      height: '70px',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Search Input Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input
          type="text"
          placeholder="Search tools, history, docs..."
          aria-label="Global search tools and history"
          style={{
            width: '100%',
            padding: '8px 12px 8px 38px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            background: 'var(--bg-surface-hover)',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick AI Tool Action */}
        <button
          onClick={() => onNavigate(ROUTES.TOOLS)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-50)',
            color: 'var(--primary-700)',
            border: '1px solid var(--primary-200)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} aria-hidden="true" /> New AI Generation
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          style={{
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>

        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-expanded={showNotifications}
            aria-label="View notifications"
            style={{
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-full)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} aria-hidden="true" />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary-600)'
            }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              role="region"
              aria-label="Notifications Panel"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '280px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100
              }}
            >
              <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 700 }}>Notifications</h4>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                🎉 Welcome to AI Content Studio! 60 monthly credits available.
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', padding: '8px 0' }}>
                🚀 AI Copywriting streaming engine active.
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Clickable */}
        {user && (
          <button
            onClick={() => onNavigate(ROUTES.PROFILE)}
            aria-label="User profile settings"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <Avatar 
              src={user.avatar} 
              name={user.name} 
              size={38} 
              bordered 
            />
          </button>
        )}
      </div>
    </header>
  );
};
