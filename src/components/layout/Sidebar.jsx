import React from 'react';
import { Sparkles, Zap, LogOut } from 'lucide-react';
import { NAVIGATION_ITEMS, ROUTES } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';

export const Sidebar = ({ activeRoute, onNavigate }) => {
  const { user, logout } = useAuth();
  const plan = user?.plan || 'free';
  const isPaid = plan !== 'free';

  return (
    <aside
      aria-label="Sidebar Navigation"
      style={{
        width: '260px',
        minHeight: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        position: 'sticky',
        top: 0
      }}
    >
      <div>
        {/* Logo Branding */}
        <div
          onClick={() => onNavigate(ROUTES.HOME)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate(ROUTES.HOME)}
          aria-label="AI Content Studio Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '1.25rem',
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '32px',
            paddingLeft: '8px'
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <span>AI Content <span style={{ color: 'var(--primary-600)' }}>Studio</span></span>
        </div>

        {/* User Identity Tag */}
        {user && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--bg-surface-hover)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Avatar 
              src={user.avatar} 
              name={user.name} 
              size={36} 
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Badge variant={isPaid ? 'purple' : 'primary'} size="sm">
                  {plan.toUpperCase() + ' PLAN'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav aria-label="Dashboard Menu" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeRoute === item.route;
            const Icon = item.icon;

            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary-600)' : 'var(--text-muted)'} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Logout */}
      <div>
        {/* Upgrade Card Promo (When on Free Plan) */}
        {!isPaid && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            color: '#ffffff',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={18} color="#fde047" aria-hidden="true" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Free Plan (60 Credits)</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary-200)', marginBottom: '14px', lineHeight: 1.4 }}>
              Upgrade to Starter ($5/mo) or Pro ($19/mo) for 600+ monthly credits and priority generation speeds.
            </p>
            <button
              onClick={() => onNavigate(ROUTES.PRICING)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                color: 'var(--primary-800)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              View Plans
            </button>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={logout}
          aria-label="Sign Out"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            color: 'var(--danger)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} aria-hidden="true" /> Sign Out
        </button>
      </div>
    </aside>
  );
};
