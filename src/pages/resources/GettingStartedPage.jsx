import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../config/constants';
import { 
  Sparkles, 
  UserCheck, 
  Layers, 
  Edit3, 
  Download, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const GettingStartedPage = ({ onNavigate }) => {
  const steps = [
    {
      step: 1,
      title: "Create & Verify Your Free Account",
      desc: "Sign up using Google OAuth, Email + Password, or Mobile SMS OTP. For Email + Password, check your inbox and click the confirmation link to activate your workspace.",
      badge: "Account Setup",
      icon: UserCheck
    },
    {
      step: 2,
      title: "Receive 60 Monthly Welcome Credits",
      desc: "Your credit wallet is immediately initialized with 60 free monthly credits. Credits are consumed on a per-generation basis (5–15 credits per run) without arbitrary word count cutoffs.",
      badge: "Credit Balance",
      icon: Sparkles
    },
    {
      step: 3,
      title: "Select Your AI Copywriting Assistant",
      desc: "Navigate to AI Tools and select from 5 purpose-built assistants: Blog Article Writer, Cold Email & Newsletter, Instagram Captions, Facebook & Instagram Ads Copy, or E-Commerce Product Descriptions.",
      badge: "Tool Selection",
      icon: Layers
    },
    {
      step: 4,
      title: "Enter Your Requirements & Stream Output",
      desc: "Provide your topic, key product features, target audience, and preferred tone of voice. Click 'Generate Content' to stream real-time results directly into your editor.",
      badge: "Live Playground",
      icon: Edit3
    },
    {
      step: 5,
      title: "Copy, Bookmark, and Export Your Copy",
      desc: "Every completed generation is automatically archived to your History log. Star your best drafts to add them to Favorites, copy directly to your clipboard, or export to text files.",
      badge: "Persistent History",
      icon: Download
    }
  ];

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.GETTING_STARTED} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px' }}>
            <Sparkles size={16} /> Quickstart Guide
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Getting Started with AI Content Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 28px auto' }}>
            A 5-step roadmap to setting up your workspace, generating high-quality copy, and managing your content library.
          </p>

          <Button variant="primary" icon={ArrowRight} onClick={() => onNavigate(ROUTES.AUTH)}>
            Launch Free Workspace
          </Button>
        </div>

        {/* Step-by-Step Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '64px' }}>
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '32px',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'flex-start',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}>
                  {s.step}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{s.title}</h3>
                    <Badge variant="cyan">{s.badge}</Badge>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips Callout Banner */}
        <div style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--primary-900)' }}>
            💡 Pro Tips for Best Results
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--primary-800)', fontSize: '0.925rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" /> Be specific in your topic and input details rather than using single-word prompts.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" /> Choose the tone that matches your brand (e.g. Persuasive for sales, Casual for social media).
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" /> Bookmark favorite outputs so you can reference them as templates in the future.
            </li>
          </ul>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
