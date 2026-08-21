import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ROUTES } from '../../config/constants';
import { 
  HelpCircle, 
  Sparkles, 
  Zap, 
  FileText, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const HelpCenterPage = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const categories = [
    {
      title: "Getting Started & Account",
      desc: "Sign up, verify your email, setup your workspace and profile settings.",
      icon: Sparkles,
      link: ROUTES.GETTING_STARTED
    },
    {
      title: "AI Copywriting Tools",
      desc: "Learn how to use all 5 AI tools and craft effective input prompts.",
      icon: FileText,
      link: ROUTES.TOOLS
    },
    {
      title: "Credits & Subscriptions",
      desc: "Understand monthly credit allowances, consumption, and plan upgrades.",
      icon: Zap,
      link: ROUTES.PRICING
    },
    {
      title: "Content Guides & Best Practices",
      desc: "Deep-dive frameworks for high-converting marketing and SEO content.",
      icon: HelpCircle,
      link: ROUTES.GUIDES
    }
  ];

  const faqs = [
    {
      q: "How do monthly credits work on the Free plan?",
      a: "Every Free plan account receives 60 monthly credits automatically upon registration. Each tool execution uses a fixed number of credits based on complexity (e.g. 5 to 15 credits). You are never capped by an arbitrary word ceiling—you can generate comprehensive articles as long as you have sufficient credits."
    },
    {
      q: "How do I save and export my generated content?",
      a: "All streaming outputs are automatically saved to your persistent History log with full metadata, timestamps, and word counts. You can bookmark favorite generations with the star icon, copy content directly to your clipboard, or export as a .txt file."
    },
    {
      q: "Can I customize the writing tone of voice?",
      a: "Yes. In the AI Tools playground and in your Account Settings Preferences, you can select from Professional, Casual, Persuasive, and Witty tones to match your exact brand guidelines."
    },
    {
      q: "Is my generation data private and secure?",
      a: "Yes. All generation records in public.generations are isolated strictly to your authenticated Supabase user account via PostgreSQL Row Level Security (RLS). No other user can access or view your generated drafts."
    },
    {
      q: "How do I upgrade my plan when I need more credits?",
      a: "You can visit the Pricing page anytime to select Starter (600 credits), Pro (2,500 credits), or Business (7,500 credits) to unlock higher volume and priority generation speeds."
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    !searchQuery || 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.HELP_CENTER} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px' }}>
            <HelpCircle size={16} /> Knowledge Base & Support
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Help Center & Documentation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Everything you need to master AI Content Studio, manage your credits, and generate high-converting copy.
          </p>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '540px', margin: '0 auto' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              placeholder="Search help articles, tools, or credit FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                boxShadow: 'var(--shadow-sm)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '56px' }}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Card
                key={idx}
                hoverEffect
                onClick={() => onNavigate(cat.link)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{cat.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{cat.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.85rem', marginTop: '16px' }}>
                  <span>Explore topic</span> <ArrowRight size={14} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Frequently Asked Questions */}
        <section style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--primary-600)" /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6, borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
