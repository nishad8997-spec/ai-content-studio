import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ROUTES } from '../../config/constants';
import { 
  BookOpen, 
  FileText, 
  Mail, 
  Instagram, 
  Facebook, 
  ShoppingBag, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const GuidesPage = ({ onNavigate }) => {
  const guides = [
    {
      title: "Mastering the Blog Article Writer",
      category: "Writing",
      icon: FileText,
      readTime: "4 min read",
      summary: "How to craft SEO-optimized, long-form articles with structured headers, introduction hooks, and actionable conclusions.",
      points: [
        "Include 3-5 target keywords for organic search indexing.",
        "Select the 'Persuasive' tone for affiliate articles and 'Informative' for tutorials.",
        "Export in Markdown format for instant import into WordPress, Ghost, or Webflow."
      ]
    },
    {
      title: "Cold Email Outreach Frameworks",
      category: "Email",
      icon: Mail,
      readTime: "5 min read",
      summary: "Proven strategies for crafting short, hyper-personalized sales emails and newsletter campaigns that get 30%+ response rates.",
      points: [
        "Clearly state the recipient's industry to trigger instant relevance.",
        "Keep the core value proposition under 2 concise bullet points.",
        "Use a low-friction Call to Action (e.g. 5-minute discovery chat)."
      ]
    },
    {
      title: "Instagram Captions that Stop the Scroll",
      category: "Social Media",
      icon: Instagram,
      readTime: "3 min read",
      summary: "Combine compelling first-line hooks, emotional resonance, and strategic hashtag combinations to maximize reach.",
      points: [
        "Choose the 'Witty' mood for lifestyle and creator brand posts.",
        "Use the 5-10 High Growth hashtag preset for algorithmic discovery.",
        "Always close with an engaging question to drive comments."
      ]
    },
    {
      title: "High-ROAS Meta Ads Copywriting",
      category: "Marketing",
      icon: Facebook,
      readTime: "4 min read",
      summary: "How to write Facebook and Instagram ad headlines and primary copy using the PAS (Problem-Agitate-Solution) formula.",
      points: [
        "Focus on the single biggest customer pain point in the first 2 lines.",
        "Highlight social proof and guarantee in the description.",
        "Match the CTA button text directly with your landing page goal."
      ]
    },
    {
      title: "E-Commerce Product Descriptions that Convert",
      category: "E-Commerce",
      icon: ShoppingBag,
      readTime: "3 min read",
      summary: "Transform technical specifications and features into irresistible customer benefits that increase Shopify and Amazon sales.",
      points: [
        "List key dimensions, materials, and unique capabilities as bullet points.",
        "Specify the exact target customer persona to build purchasing conviction.",
        "Include trust signals (warranties, return policy highlights)."
      ]
    }
  ];

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.GUIDES} onNavigate={onNavigate} />

      <main style={{ flex: 1, padding: '64px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '16px' }}>
            <BookOpen size={16} /> Copywriting Playbooks
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Content Creation Guides & Frameworks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 28px auto' }}>
            Practical guides and prompt engineering formulas to maximize your output quality across every AI tool.
          </p>

          <Button variant="primary" icon={Sparkles} onClick={() => onNavigate(ROUTES.TOOLS)}>
            Try in AI Tools
          </Button>
        </div>

        {/* Guides List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {guides.map((g, idx) => {
            const Icon = g.icon;
            return (
              <Card
                key={idx}
                hoverEffect
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Badge variant="cyan">{g.category}</Badge>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>{g.readTime}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>{g.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '18px' }}>
                    {g.summary}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '8px' }}>
                      KEY STRATEGIES:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {g.points.map((p, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: 'var(--primary-600)' }}>•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth 
                  onClick={() => onNavigate(ROUTES.TOOLS)}
                >
                  Launch Assistant
                </Button>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
