import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SkeletonTable } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Search, Star, Trash2, Copy, Eye, Bookmark, FileText } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const HistoryPage = () => {
  const {
    loading,
    items,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    toggleFavorite,
    deleteItem
  } = useHistory();

  const [previewItem, setPreviewItem] = useState(null);
  const { addToast } = useToast();

  const categories = ['All', 'Favorites', 'Blog Article Writer', 'Cold Email', 'Instagram', 'Facebook Ads', 'E-Commerce'];

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    addToast("Copied generation to clipboard!", "success");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Generation History Log</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Search, filter, favorite, and manage all your past AI copywriting outputs.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${selectedCategory === cat ? 'var(--primary-600)' : 'var(--border-light)'}`,
                background: selectedCategory === cat ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search history by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 38px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* History Items Grid / Table */}
      <Card padding="0">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : items.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} color="var(--primary-400)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No generations found</h3>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your search filter or generate new content from the AI Tools page.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-hover)' }}>
                  <th style={{ padding: '14px 20px', width: '40px' }}></th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Title & Preview</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>AI Tool</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Words</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <Star
                          size={18}
                          color={item.isFavorite ? '#f59e0b' : 'var(--text-subtle)'}
                          fill={item.isFavorite ? '#f59e0b' : 'none'}
                        />
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.preview}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant="cyan">{item.toolName}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                      {item.wordCount} words
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setPreviewItem(item)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', padding: '4px' }}
                          title="View Full Content"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleCopy(item.content)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                          title="Copy Content"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                          title="Delete Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
        >
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Badge variant="cyan">{previewItem.toolName}</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {previewItem.wordCount} words • {new Date(previewItem.createdAt).toLocaleString()}
            </span>
          </div>

          <div style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            marginBottom: '20px'
          }}>
            {previewItem.content}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="primary" icon={Copy} onClick={() => handleCopy(previewItem.content)}>
              Copy Content
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
