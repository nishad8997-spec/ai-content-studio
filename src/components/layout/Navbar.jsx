import React, { useState } from 'react';
import { Sparkles, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { ROUTES } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const Navbar = ({ activeRoute, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { label: "Features", route: ROUTES.HOME + "#features" },
    { label: "AI Tools", route: ROUTES.EXPLORE_TOOLS },
    { label: "Pricing", route: ROUTES.PRICING },
  ];

  return (
    <header role="banner" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      transition: 'all var(--transition-normal)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
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
            fontSize: '1.35rem',
            fontFamily: 'Outfit, sans-serif',
            color: 'var(--text-main)'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <span>AI Content <span style={{ color: 'var(--primary-600)' }}>Studio</span></span>
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(link.route)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeRoute === link.route ? 'var(--primary-600)' : 'var(--text-muted)',
                fontWeight: activeRoute === link.route ? 600 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)'
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Switcher */}
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

          {isAuthenticated ? (
            <button
              onClick={() => onNavigate(ROUTES.DASHBOARD)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-600)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
              }}
            >
              Go to Dashboard <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate(ROUTES.AUTH)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>

              <button
                onClick={() => onNavigate(ROUTES.AUTH)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-600)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                }}
              >
                Get Started Free <ArrowRight size={16} aria-hidden="true" />
              </button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
};
