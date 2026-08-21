import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { 
  Sparkles, 
  FileText, 
  Bookmark, 
  ArrowRight, 
  Zap, 
  Copy, 
  Eye, 
  Star, 
  CheckCircle2, 
  Compass, 
  PenTool, 
  Layers 
} from 'lucide-react';
import { ROUTES, AI_TOOLS } from '../config/constants';
import { useToast } from '../context/ToastContext';

export const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { loading, metrics, recentHistory } = useDashboard();
  const { addToast } = useToast();
  const [previewItem, setPreviewItem] = useState(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Creator';
  const planLabel = (user?.plan || 'free').toUpperCase() + ' PLAN';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast("Copied content to clipboard!", "success");
  };

  const isNewUser = !loading && metrics && metrics.totalGenerations === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '1.85rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
              Welcome to AI Content Studio, {firstName}! 👋
            </h1>
            <Badge variant="cyan" size="md">
              {planLabel}
            </Badge>
          </div>
          <p style={{ color: 'var(--primary-200)', fontSize: '1.05rem', maxWidth: '640px', margin: '4px 0 0 0' }}>
            What would you like to create today? Select any AI tool below to generate high-performing content.
          </p>
        </div>
      </div>

      {/* Workspace Usage Statistics Metric Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Workspace Usage Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Card 1: Words Generated */}
            <Card hoverEffect>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Words Generated</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
                {metrics?.totalWordsGenerated?.toLocaleString() || 0}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total generated words</span>
            </Card>

            {/* Card 2: Credits Remaining */}
            <Card hoverEffect>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Credits Remaining</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
                {metrics?.monthlyCreditsRemaining} <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', fontWeight: 500 }}>/ {metrics?.monthlyCreditAllowance}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, Math.max(0, ((metrics?.monthlyCreditsRemaining || 0) / (metrics?.monthlyCreditAllowance || 60)) * 100))}%`, 
                  height: '100%', 
                  background: 'var(--primary-600)', 
                  borderRadius: 'var(--radius-full)' 
                }} />
              </div>
            </Card>

            {/* Card 3: Total Projects */}
            <Card hoverEffect>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Projects</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
                {metrics?.totalGenerations || 0}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across active AI tools</span>
            </Card>

            {/* Card 4: Saved Bookmarks */}
            <Card hoverEffect>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Saved Bookmarks</span>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bookmark size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
                {metrics?.favoriteGenerations || 0}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Favorited generations</span>
            </Card>
          </div>
        </div>
      )}

      {/* New User Onboarding Steps (Shown below metrics for new accounts) */}
      {isNewUser && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Compass size={22} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Get Started in 3 Simple Steps</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '12px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--primary-700)' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                Choose a Tool
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Select from 5 specialized AI assistants tailored for blog posts, cold emails, social captions, ads, or products.
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--primary-700)' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                Describe Your Need
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Enter your topic, key features, target audience, or desired tone of voice.
              </p>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--primary-700)' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</span>
                Generate & Save
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Stream copy in real-time, copy directly to your clipboard, and save your favorites to your workspace.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Copywriting Tools Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Available AI Copywriting Tools</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
              Choose a tool to start streaming custom content tailored to your brand.
            </p>
          </div>
          <button
            onClick={() => onNavigate(ROUTES.TOOLS)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            View All Tools <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                hoverEffect
                onClick={() => onNavigate(ROUTES.TOOLS)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <Badge variant="cyan">{tool.badge}</Badge>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{tool.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                    {tool.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600 }}>{tool.category}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open Tool <ArrowRight size={14} />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Generations Activity Log */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Recent Content Generations</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
              Your latest AI generated drafts, saved outputs, and export history.
            </p>
          </div>
          <button
            onClick={() => onNavigate(ROUTES.HISTORY)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Full History <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <SkeletonTable rows={3} />
        ) : recentHistory.length === 0 ? (
          <Card padding="48px 24px" style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <PenTool size={22} />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No generations yet</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px auto' }}>
              Select any AI copywriting tool above to create your first high-converting draft.
            </p>
            <Button variant="primary" icon={Sparkles} onClick={() => onNavigate(ROUTES.TOOLS)}>
              Create First Generation
            </Button>
          </Card>
        ) : (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <th style={{ padding: '14px 20px' }}>Tool</th>
                    <th style={{ padding: '14px 20px' }}>Title & Preview</th>
                    <th style={{ padding: '14px 20px' }}>Words</th>
                    <th style={{ padding: '14px 20px' }}>Date</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background var(--transition-fast)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--primary-700)', whiteSpace: 'nowrap' }}>
                        {item.toolName}
                      </td>
                      <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.preview}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                        {item.wordCount} words
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => setPreviewItem(item)}
                            title="Preview Content"
                            style={{ padding: '6px 10px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-main)' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleCopy(item.content)}
                            title="Copy Content"
                            style={{ padding: '6px 10px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-main)' }}
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <Badge variant="cyan">{previewItem.toolName}</Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{previewItem.wordCount} words</span>
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              background: 'var(--bg-app)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {previewItem.content}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
              <Button variant="outline" icon={Copy} onClick={() => handleCopy(previewItem.content)}>
                Copy Content
              </Button>
              <Button variant="primary" onClick={() => setPreviewItem(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
