import React, { useState } from 'react';
import { PRICING_PLANS, ROUTES } from '../config/constants';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const PricingPage = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const { user } = useAuth();
  const { addToast } = useToast();

  const handlePlanAction = (plan) => {
    if (!user) {
      onNavigate(ROUTES.AUTH);
      return;
    }

    if (plan.id === (user?.plan || 'free')) {
      addToast(`You are currently on the ${plan.name} plan.`, 'info');
      return;
    }

    // Non-deceptive Stripe checkout notice
    addToast(`Stripe billing integration for ${plan.name} ($${plan.priceMonthly}/mo) is coming soon in the next sprint.`, 'info');
  };

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeRoute={ROUTES.PRICING} onNavigate={onNavigate} />

      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center', flex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-50)', padding: '6px 16px', borderRadius: 'var(--radius-full)', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px' }}>
          <Sparkles size={16} /> Transparent, Scalable Pricing
        </div>
        
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Simple Plans for <span className="text-gradient">Every Creator</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto 36px auto' }}>
          Choose the plan that fits your content goals. Upgrade, downgrade, or cancel anytime with one click.
        </p>

        {/* Monthly vs Yearly Toggle Switch */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', marginBottom: '56px', boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: billingCycle === 'monthly' ? 'var(--primary-600)' : 'transparent',
              color: billingCycle === 'monthly' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: billingCycle === 'yearly' ? 'var(--primary-600)' : 'transparent',
              color: billingCycle === 'yearly' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Yearly Billing <Badge variant="success">Save 20%</Badge>
          </button>
        </div>

        {/* Pricing Tier Cards Grid (4 Plans) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '80px', alignItems: 'stretch' }}>
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const isCurrentPlan = user && (user.plan || 'free') === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  background: plan.popular ? 'var(--bg-surface)' : 'var(--bg-card)',
                  border: `2px solid ${plan.popular ? 'var(--primary-600)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: plan.popular ? 'var(--shadow-lg)' : 'var(--shadow-card)'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
                    color: '#ffffff',
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em'
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{plan.name}</h3>
                    {isCurrentPlan && <Badge variant="success">Active</Badge>}
                  </div>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', height: '38px', lineHeight: 1.4, marginBottom: '20px', textAlign: 'left' }}>
                    {plan.description}
                  </p>

                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ${price}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / month</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '28px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '14px', textAlign: 'left' }}>
                      INCLUDES:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                          <CheckCircle2 size={16} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  variant={isCurrentPlan ? 'outline' : plan.popular ? 'primary' : 'outline'}
                  fullWidth
                  onClick={() => handlePlanAction(plan)}
                >
                  {isCurrentPlan ? 'Current Plan' : !user ? 'Get Started' : `Select ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Satisfaction Guarantee Banner */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '24px 32px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          textAlign: 'left'
        }}>
          <ShieldCheck size={40} color="var(--primary-600)" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', margin: 0 }}>Risk-Free Trial & Flexible Billing</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Free tier includes 250 credits with no credit card required. Upgrade anytime to unlock higher monthly credit allowances.
            </p>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
