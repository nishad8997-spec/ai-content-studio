import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { ROUTES } from '../../config/constants';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyPage = ({ onNavigate }) => {
  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.PRIVACY} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px' }}>
            <Lock size={16} /> Data Protection & Privacy
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '12px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Last Updated: August 15, 2026 • Your Privacy Matters
          </p>
        </div>

        <Card padding="40px" style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>1. Information We Collect</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We collect information necessary to provide and secure your workspace, including:
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <li><strong>Account Identity:</strong> Email address, name, authentication provider details (Google or Email/Password), and optional avatar images.</li>
              <li><strong>Workspace Content:</strong> Tool inputs, prompt configuration, and generated text outputs stored securely in your private history log.</li>
              <li><strong>Usage Analytics:</strong> Word counts, credit deductions, and timestamps to track your monthly allowance.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>2. How We Use Your Data</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Your data is utilized strictly to provide, maintain, and optimize your AI Content Studio experience. We do NOT sell your personal information or generation drafts to third parties. We do NOT use your private generation content to train public AI models without your explicit consent.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>3. Storage & Row-Level Security</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              All database records and file storage (avatars) are hosted on enterprise-grade infrastructure with strict PostgreSQL Row Level Security (RLS) policies. Only your authenticated user account possesses cryptographic authorization to read, update, or soft-delete your generation records.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>4. Third-Party Authentication & Infrastructure</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We integrate with trusted providers for authentication (Supabase Auth and Google OAuth). When using third-party login, we only access safe public profile fields (name, email, and avatar) necessary for account provisioning.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>5. Your Rights & Data Retention</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You maintain full control over your data. You may delete individual generations at any time, remove your avatar, or request full account deletion. Deleted generations are immediately removed from your active workspace.
            </p>
          </section>
        </Card>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
