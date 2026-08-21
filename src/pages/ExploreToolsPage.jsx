import React, { useState } from 'react';
import { AI_TOOLS, ROUTES } from '../config/constants';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Zap, 
  FileText, 
  Mail, 
  Instagram, 
  Facebook, 
  ShoppingBag,
  Sliders,
  Send,
  Lock
} from 'lucide-react';

const CATEGORIES = ['All', 'Writing', 'Email', 'Social Media', 'Marketing', 'E-Commerce'];

const TOOL_DETAILS = {
  "blog-writer": {
    useCases: [
      "Long-form SEO blog articles and tutorials",
      "Thought leadership and industry insights",
      "Weekly company newsletter content",
      "Affiliate and comparison articles"
    ],
    sampleInput: {
      "Article Topic": "10 Remote Work Productivity Hacks for 2026",
      "Target Keywords": "productivity, time-blocking, async workflows",
      "Writing Tone": "Professional"
    },
    sampleOutput: {
      headline: "# 10 Remote Work Productivity Hacks for 2026",
      body: "In today's fast-evolving landscape, mastering remote productivity is the single greatest competitive advantage for distributed teams...\n\n## 1. Eliminate Context Switching with Time-Blocking\nMultitasking is a myth that costs up to 40% of productive output. By allocating dedicated 90-minute deep-work blocks, you create uninterrupted focus cycles.\n\n- **Audit your current baseline:** Identify where bottlenecks slow down output.\n- **Implement structured workflows:** Standardize routines to deliver with confidence."
    }
  },
  "email-writer": {
    useCases: [
      "B2B cold sales outreach and prospecting",
      "Client follow-ups and discovery call booking",
      "Product launch announcements",
      "Weekly agency newsletter campaigns"
    ],
    sampleInput: {
      "Target Recipient": "SaaS Marketing Directors & VP of Growth",
      "Value Proposition": "Automate content marketing workflows and save 15+ hours weekly",
      "Call to Action": "10-minute quick discovery call next Tuesday"
    },
    sampleOutput: {
      headline: "Subject: Quick question regarding scaling content for SaaS teams",
      body: "Hi [First Name],\n\nI came across your work and was thoroughly impressed by your recent growth milestones.\n\nWe developed a dedicated solution that enables SaaS marketing teams to:\n• Accelerate content production by 10x without sacrificing brand voice\n• Reduce draft turnaround from days to seconds\n\nWould you be open to a quick 10-minute discovery chat next Tuesday at 2 PM EST?"
    }
  },
  "instagram-caption": {
    useCases: [
      "Scroll-stopping creator and brand posts",
      "Behind-the-scenes and lifestyle content",
      "Product teasers and community engagement",
      "Viral carousel captions with hashtag clouds"
    ],
    sampleInput: {
      "Post Description": "Behind the scenes of our new workspace setup with morning coffee",
      "Vibe & Style": "Witty & Playful",
      "Hashtags": "5-10 High Growth Hashtags"
    },
    sampleOutput: {
      headline: "☕ Running on pure caffeine, big ambitions, and zero apologies.",
      body: "They said it couldn't be built in one afternoon. Clearly, they haven't seen our latest studio setup in action. 😉🔥\n\nWhat is the single biggest goal you're crushing this week? Drop a comment below! 👇\n\n#ContentCreator #AITools #CreativeStudio #GrowthMindset #ProductivityHacks"
    }
  },
  "facebook-ads": {
    useCases: [
      "High-ROAS Meta and Instagram ad campaigns",
      "Lead generation and free trial funnels",
      "Retargeting abandoned website visitors",
      "E-commerce product promo campaigns"
    ],
    sampleInput: {
      "Product Name": "AI Content Studio Pro",
      "Customer Pain Point": "Wasting 20+ hours a week manually drafting blog posts and ad copy",
      "CTA Button": "Sign Up Free"
    },
    sampleOutput: {
      headline: "Stop wasting 20+ hours a week | Try AI Content Studio",
      body: "🎯 PRIMARY TEXT:\nTired of spending 20+ hours every week manually writing copy? You're not alone.\n\nIntroducing AI Content Studio—generate high-converting copy in seconds:\n✅ 10x faster output tailored to your brand voice\n✅ 5 specialized AI assistants in one workspace\n\n👉 [ Sign Up Free ] • 60 Free Credits • No Credit Card Required"
    }
  },
  "product-description": {
    useCases: [
      "Shopify and WooCommerce store listings",
      "Amazon and marketplace product pages",
      "Catalog copywriting and product launches",
      "Benefit-driven feature breakdowns"
    ],
    sampleInput: {
      "Product Title": "Ergonomic Memory Foam Gaming Chair",
      "Key Features": "Lumbar support, breathable mesh, 4D armrests, 300 lbs capacity",
      "Target Customer": "Remote software engineers and creators"
    },
    sampleOutput: {
      headline: "# Ergonomic Memory Foam Gaming Chair",
      body: "Upgrade your daily studio experience with the Ergonomic Memory Foam Gaming Chair. Engineered for remote professionals and creators seeking all-day comfort.\n\n### ✨ Key Features:\n- ⚡ **Lumbar Support:** Dynamic spine alignment for long deep-work sessions.\n- 🎨 **Breathable Mesh:** Temperature-regulating fabric that keeps you cool.\n- 🛡️ **300 lbs Capacity:** Industrial-grade steel frame built to last."
    }
  }
};

export const ExploreToolsPage = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCreateWithTool = (toolId) => {
    if (isAuthenticated) {
      onNavigate(ROUTES.TOOLS);
    } else {
      onNavigate(ROUTES.AUTH);
    }
  };

  const filteredTools = AI_TOOLS.filter((tool) => {
    return selectedCategory === 'All' || tool.category === selectedCategory;
  });

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.EXPLORE_TOOLS} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            marginBottom: '20px'
          }}>
            <Sparkles size={16} /> AI Tool Suite & Capabilities
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '18px',
            letterSpacing: '-0.02em'
          }}>
            Explore 5 Specialized <span className="text-gradient">AI Copywriting Tools</span>
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1.15rem',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Each tool is purpose-engineered with structured templates for blogs, emails, social captions, ads, and product descriptions. Explore how each assistant works below.
          </p>

          {/* Category Filter Pills */}
          <div role="tablist" aria-label="Explore Tool Categories" style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  background: selectedCategory === cat ? 'var(--primary-600)' : 'var(--bg-surface)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Deep-Dive Exploration Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '64px' }}>
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const details = TOOL_DETAILS[tool.id] || {
              useCases: ["Content creation", "Workflow acceleration"],
              sampleInput: { "Topic": "Your subject" },
              sampleOutput: { headline: `# ${tool.name}`, body: "Sample generated content..." }
            };

            return (
              <div
                key={tool.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '36px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px'
                }}
              >
                {/* Tool Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{tool.name}</h2>
                        <Badge variant="cyan">{tool.badge}</Badge>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0 0' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    onClick={() => handleCreateWithTool(tool.id)}
                  >
                    Create with {tool.name}
                  </Button>
                </div>

                {/* Tool Details Breakdown (2 Columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  {/* Left Column: Use Cases & Sample Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Suitable Use Cases */}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        🎯 Best Use Cases & Scenarios
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {details.useCases.map((uc, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            <CheckCircle2 size={16} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{uc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Example Input Parameters */}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        📝 Example Input Requirements
                      </div>
                      <div style={{
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {Object.entries(details.sampleInput).map(([k, v]) => (
                          <div key={k} style={{ fontSize: '0.875rem' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{k}:</strong>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Output Preview Simulation */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ⚡ Example Generated Output Preview
                    </div>
                    <div style={{
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'var(--text-main)',
                      maxHeight: '260px',
                      overflowY: 'auto'
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-700)', marginBottom: '8px', fontSize: '0.9rem' }}>
                        {details.sampleOutput.headline}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>
                        {details.sampleOutput.body}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
            Ready to Generate Content with 60 Free Monthly Credits?
          </h2>
          <p style={{ color: 'var(--primary-200)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 28px auto' }}>
            Sign up in 30 seconds. No credit card required. Instant access to all 5 AI copywriting assistants.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate(isAuthenticated ? ROUTES.TOOLS : ROUTES.AUTH)}
            style={{ background: '#ffffff', color: 'var(--primary-800)', border: 'none', fontWeight: 700 }}
          >
            {isAuthenticated ? 'Enter AI Workspace' : 'Start Creating Free'}
          </Button>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
