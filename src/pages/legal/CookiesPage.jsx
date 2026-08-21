import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { ROUTES } from '../../config/constants';
import { Cookie } from 'lucide-react';

export const CookiesPage = ({ onNavigate }) => {
  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.COOKIES} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px' }}>
            <Cookie size={16} /> Cookie Policy
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '12px' }}>
            Cookie Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Last Updated: August 15, 2026 • Transparency & Control
          </p>
        </div>

        <Card padding="40px" style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>1. What Are Cookies?</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Cookies and local browser storage are small data files placed on your device to enable core website functionality, preserve your session authentication state, and store your user preferences (such as dark/light mode).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>2. Essential Cookies</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              These cookies and storage keys are strictly necessary for the operation of the Service. They include session tokens (e.g. Supabase Auth tokens) that verify your identity and protect your account from unauthorized access.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>3. Functional & Preference Cookies</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We store non-intrusive workspace preferences (such as your preferred interface theme and writing tone preset) to provide a consistent and streamlined experience across browser sessions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>4. Managing Your Cookie Preferences</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You can configure your web browser to reject or delete cookies. However, disabling essential session cookies will prevent you from signing in or accessing your authenticated AI Content Studio workspace.
            </p>
          </section>
        </Card>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
