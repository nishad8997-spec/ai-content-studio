import React from 'react';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';
import { ROUTES } from '../../config/constants';

export const Footer = ({ onNavigate }) => {
  return (
    <footer role="contentinfo" style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-light)',
      padding: '64px 24px 32px 24px',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '48px'
      }}>
        {/* Brand Column */}
        <div>
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
              color: 'var(--text-main)',
              marginBottom: '16px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
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
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Empowering modern creators, agencies, and marketing teams to craft high-converting content with next-gen AI.
          </p>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-subtle)' }}>
            <Github size={20} style={{ cursor: 'pointer' }} aria-label="GitHub" />
            <Twitter size={20} style={{ cursor: 'pointer' }} aria-label="Twitter" />
            <Linkedin size={20} style={{ cursor: 'pointer' }} aria-label="LinkedIn" />
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Product</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li><button onClick={() => onNavigate(ROUTES.EXPLORE_TOOLS)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>AI Article Writer</button></li>
            <li><button onClick={() => onNavigate(ROUTES.EXPLORE_TOOLS)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Cold Email Generator</button></li>
            <li><button onClick={() => onNavigate(ROUTES.EXPLORE_TOOLS)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Instagram Captions</button></li>
            <li><button onClick={() => onNavigate(ROUTES.EXPLORE_TOOLS)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Facebook Ads Copy</button></li>
            <li><button onClick={() => onNavigate(ROUTES.PRICING)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Pricing Plans</button></li>
          </ul>
        </div>

        {/* Resources Links */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Resources</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li><button onClick={() => onNavigate(ROUTES.HELP_CENTER)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Help Center</button></li>
            <li><button onClick={() => onNavigate(ROUTES.GETTING_STARTED)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Getting Started</button></li>
            <li><button onClick={() => onNavigate(ROUTES.GUIDES)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Content Guides</button></li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li><button onClick={() => onNavigate(ROUTES.TERMS)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Terms of Service</button></li>
            <li><button onClick={() => onNavigate(ROUTES.PRIVACY)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Privacy Policy</button></li>
            <li><button onClick={() => onNavigate(ROUTES.COOKIES)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>Cookie Policy</button></li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem'
      }}>
        <div>© 2026 AI Content Studio, Inc. All rights reserved.</div>
        <div>Designed for scale & performance.</div>
      </div>
    </footer>
  );
};
