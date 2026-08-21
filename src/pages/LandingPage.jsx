import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Sparkles, ArrowRight, CheckCircle2, Zap, Shield, ChevronDown, ChevronUp, Star, Play } from 'lucide-react';
import { ROUTES, AI_TOOLS } from '../config/constants';

export const LandingPage = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState(0);

  const features = [
    {
      title: "10x Faster Content Generation",
      desc: "Transform simple prompts into full blog articles, emails, and social campaigns in under 10 seconds.",
      icon: Zap,
      color: "#2563eb"
    },
    {
      title: "Multi-Model AI Engine",
      desc: "Powered by pluggable AI providers (OpenAI, Anthropic, Gemini) with zero lock-in.",
      icon: Sparkles,
      color: "#06b6d4"
    },
    {
      title: "Brand Voice Customization",
      desc: "Train the AI to match your exact tone of voice, whether formal, witty, or persuasive.",
      icon: Star,
      color: "#6366f1"
    },
    {
      title: "Supabase & Enterprise Ready",
      desc: "Built with scalable architecture ready for Supabase auth, DB persistence, and team roles.",
      icon: Shield,
      color: "#10b981"
    }
  ];

  const faqs = [
    {
      q: "What makes AI Content Studio different from ChatGPT?",
      a: "AI Content Studio is purpose-built for content workflows. It includes pre-engineered templates for blogs, emails, captions, and ads, plus direct export tools, team role management, and history storage."
    },
    {
      q: "What AI models power the content generation?",
      a: "AI Content Studio is powered by an intelligent multi-model engine engineered for high-speed streaming, natural tone matching, and conversion-optimized copywriting."
    },
    {
      q: "Is there a free trial or starter plan available?",
      a: "Absolutely. Our Free plan includes 60 credits every month with full access to all 5 AI copywriting tools without requiring a credit card."
    },
    {
      q: "How does the streaming AI text output work?",
      a: "Our generator streams content in real-time chunk-by-chunk directly into your editor, giving you instant feedback and allowing you to pause or copy immediately."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.HOME} onNavigate={onNavigate} />

      {/* Hero Section */}
      <section style={{
        padding: '96px 24px 80px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          color: 'var(--primary-700)',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginBottom: '24px'
        }}>
          <Sparkles size={16} /> Next-Gen AI Content Studio 2.0 Released
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
          lineHeight: 1.15,
          fontWeight: 800,
          marginBottom: '24px',
          maxWidth: '900px',
          margin: '0 auto 24px auto'
        }}>
          Create High-Converting Copy <br />
          <span className="text-gradient">10x Faster with AI Precision</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          Generate blogs, cold emails, Instagram captions, Facebook ads, and product descriptions tailored to your brand voice in seconds.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button
            onClick={() => onNavigate(ROUTES.AUTH)}
            style={{
              padding: '14px 32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            Start Creating Free <ArrowRight size={20} />
          </button>

          <button
            onClick={() => onNavigate(ROUTES.EXPLORE_TOOLS)}
            style={{
              padding: '14px 28px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Play size={18} color="var(--primary-600)" /> Explore AI Tools
          </button>
        </div>

        {/* Hero Interactive Mock Demo Card */}
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 500 }}>AI Blog Generator Playground</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>PROMPT INPUT</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>"10 Remote Work Productivity Hacks"</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tone: Professional | Length: Medium (~800 words)</div>
            </div>

            <div style={{ background: 'var(--primary-50)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-700)', marginBottom: '8px' }}>AI STREAM OUTPUT</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--primary-900)', lineHeight: 1.6 }} className="streaming-cursor">
                Multitasking is a myth that costs up to 40% of productive output. By allocating dedicated 90-minute deep-work blocks, you create uninterrupted focus cycles...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '16px' }}>Supercharge Every Stage of Creation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '56px', maxWidth: '600px', margin: '0 auto 56px auto' }}>
            Built for modern marketers, founders, and content leads who demand enterprise-grade speed and consistency.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} style={{
                  padding: '32px 24px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-card)',
                  textAlign: 'left'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-50)',
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '16px' }}>Loved by 10,000+ Creators & Agencies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '48px' }}>
          {[
            { name: "Jessica Taylor", role: "Head of Content, SaaSify", text: "AI Content Studio cut our article drafting time from 3 days to under 10 minutes. The quality is phenomenal." },
            { name: "Marcus Chen", role: "Founder, GrowthViral", text: "The cold email generator alone brought us 14 new client demos in our first week. Must-have stack tool." },
            { name: "Elena Rostova", role: "E-Commerce Director", text: "Writing 500+ product descriptions used to take weeks. Now we batch them in one afternoon." }
          ].map((t, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              textAlign: 'left',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '16px' }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="#f59e0b" />)}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px' }}>"{t.text}"</p>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
