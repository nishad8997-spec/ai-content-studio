import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { ROUTES } from '../../config/constants';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage = ({ onNavigate }) => {
  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.TERMS} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px' }}>
            <FileText size={16} /> Legal Terms & Agreements
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '12px' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Last Updated: August 15, 2026 • Effective Immediately
          </p>
        </div>

        <Card padding="40px" style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>1. Acceptance of Terms</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              By accessing, browsing, or utilizing the AI Content Studio platform ("Service"), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any portion of these terms, you must not access or use the Service.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>2. User Accounts & Verification</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You are responsible for maintaining the confidentiality of your account credentials. Email verification is mandatory for accounts created via Email and Password. You agree to notify us immediately of any unauthorized use or security breach related to your account.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>3. Monthly Credits & Consumption</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              The Free tier includes 60 monthly credits. Credits are deducted per tool execution based on model complexity. Credits do not carry forward across billing cycles unless explicitly specified in an active paid tier. We reserve the right to modify credit allowances and tier structures with prior notice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>4. Intellectual Property & Content Ownership</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You retain full ownership and intellectual property rights to all prompts, inputs, and text content generated through your account on AI Content Studio. You are free to publish, edit, commercialize, and distribute generated outputs without royalty obligations to AI Content Studio.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>5. Acceptable Use Policy</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You agree not to use the Service to generate defamatory, harassing, illegal, malicious, or fraudulent content. Any violation of acceptable use may result in immediate suspension or termination of your account without refund.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>6. Disclaimer of Warranties & Limitation of Liability</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              The Service is provided on an "as-is" and "as-available" basis. While we strive for high uptime and accurate AI generation outputs, AI Content Studio makes no warranties regarding the factual correctness or suitability of generated text for specific legal or financial purposes.
            </p>
          </section>
        </Card>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
