import React, { useState, useMemo, useCallback } from 'react';
import { AI_TOOLS } from '../config/constants';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useAI } from '../hooks/useAI';
import { useToast } from '../context/ToastContext';
import { Sparkles, Copy, Download, RefreshCw, ArrowRight, Bookmark, Check } from 'lucide-react';

const CATEGORIES = ['All', 'Writing', 'Email', 'Social Media', 'Marketing', 'E-Commerce'];

export const ToolsPage = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const { 
    generating, 
    output, 
    isSaved,
    generateContent, 
    toggleSaveCurrentGeneration,
    resetOutput 
  } = useAI();
  
  const { addToast } = useToast();

  const handleOpenTool = useCallback((tool) => {
    setSelectedTool(tool);
    const initial = {};
    tool.inputs.forEach((input) => {
      initial[input.id] = input.options ? input.options[0] : '';
    });
    setFormValues(initial);
    resetOutput();
  }, [resetOutput]);

  const handleCloseTool = useCallback(() => {
    setSelectedTool(null);
    resetOutput();
  }, [resetOutput]);

  const handleInputChange = useCallback((id, value) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selectedTool) return;
    generateContent(selectedTool, formValues);
  }, [selectedTool, formValues, generateContent]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    addToast("Generated content copied to clipboard!", "success");
  }, [output, addToast]);

  const handleDownload = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTool?.id || 'ai-content'}-result.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast("Exported content as text file!", "info");
  }, [output, selectedTool, addToast]);

  const filteredTools = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return AI_TOOLS.filter((tool) => {
      const matchesSearch = !query || tool.name.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchFilter, categoryFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>AI Copywriting Tools</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Select a tool below to launch the live AI playground and stream real-time content tailored to your brand.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Category Pills */}
        <div role="tablist" aria-label="Tool Categories" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${categoryFilter === cat ? 'var(--primary-600)' : 'var(--border-light)'}`,
                background: categoryFilter === cat ? 'var(--primary-600)' : 'var(--bg-surface)',
                color: categoryFilter === cat ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search AI tools..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          aria-label="Filter AI tools by name or description"
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none',
            minWidth: '240px'
          }}
        />
      </div>

      {/* Tools Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              hoverEffect
              onClick={() => handleOpenTool(tool)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <Badge variant="cyan">{tool.badge}</Badge>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{tool.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  {tool.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontWeight: 600 }}>{tool.category}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--primary-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Launch Tool <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Interactive Tool Playground Modal */}
      {selectedTool && (
        <Modal
          isOpen={Boolean(selectedTool)}
          onClose={handleCloseTool}
          title={selectedTool.name}
          maxWidth="850px"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Input Form Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {selectedTool.description}
              </div>

              {selectedTool.inputs.map((input) => (
                <div key={input.id}>
                  <label htmlFor={`input-${input.id}`} style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    {input.label}
                  </label>
                  {input.type === 'select' ? (
                    <select
                      id={`input-${input.id}`}
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {input.options.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : input.type === 'textarea' ? (
                    <textarea
                      id={`input-${input.id}`}
                      placeholder={input.placeholder}
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                      }}
                    />
                  ) : (
                    <input
                      id={`input-${input.id}`}
                      type="text"
                      placeholder={input.placeholder}
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                      }}
                    />
                  )}
                </div>
              ))}

              <Button
                variant="primary"
                onClick={handleGenerate}
                isLoading={generating}
                icon={Sparkles}
                style={{ marginTop: '12px' }}
              >
                {generating ? 'Streaming AI Output...' : 'Generate Content'}
              </Button>
            </div>

            {/* AI Streaming Output Panel */}
            <div style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)' }}>GENERATED AI RESULT</span>
                  {output && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {output.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  )}
                </div>

                {output ? (
                  <pre
                    aria-live="polite"
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: 'var(--text-main)',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}
                    className={generating ? "streaming-cursor" : ""}
                  >
                    {output}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '40px 16px' }}>
                    <Sparkles size={36} color="var(--primary-400)" aria-hidden="true" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.9rem' }}>Fill in the prompt fields on the left and click <strong>Generate Content</strong> to launch stream.</p>
                  </div>
                )}
              </div>

              {/* Output Action Bar */}
              {output && !generating && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" icon={Copy} onClick={handleCopy}>
                    Copy
                  </Button>
                  <Button 
                    variant={isSaved ? "primary" : "outline"} 
                    size="sm" 
                    icon={isSaved ? Check : Bookmark} 
                    onClick={toggleSaveCurrentGeneration}
                    aria-label={isSaved ? "Saved to workspace" : "Save generation to workspace"}
                  >
                    {isSaved ? "Saved ✓" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" icon={Download} onClick={handleDownload}>
                    Export .txt
                  </Button>
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleGenerate}>
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
