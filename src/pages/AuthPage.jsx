import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ROUTES } from '../config/constants';
import { validateEmailAddress } from '../utils/emailValidator';

export const AuthPage = ({ onNavigate }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'recovery' | 'confirm_email'
  
  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inline validation touched state
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Loading & Cooldown states
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { 
    user,
    isAuthenticated,
    loading: authLoading,
    login, 
    signup, 
    resendConfirmationEmail,
    loginWithGoogle, 
    resetPassword, 
    updatePassword, 
    isPasswordRecovery 
  } = useAuth();
  
  const { addToast } = useToast();

  // Auto-redirect if user is authenticated (e.g. returning from Google OAuth redirect)
  useEffect(() => {
    if (isAuthenticated && !authLoading && mode !== 'recovery') {
      onNavigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, authLoading, mode, onNavigate]);

  // Cooldown countdown timer for resending confirmation email
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('recovery');
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (urlParams.get('mode') === 'recovery' || urlParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
        setMode('recovery');
      }
    } catch (e) {
      // Ignored
    }
  }, [isPasswordRecovery]);

  // Validation computed helpers
  const emailValidation = emailTouched && email ? validateEmailAddress(email) : { isValid: true, error: null };
  const isPasswordShort = passwordTouched && password.length > 0 && password.length < 8;
  const isPasswordMismatch = confirmTouched && confirmPassword.length > 0 && password !== confirmPassword;

  // Mask email for privacy on confirmation screen (e.g. t***d@gmail.com)
  const getMaskedEmail = (rawEmail) => {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail || 'your email';
    const [local, domain] = rawEmail.split('@');
    if (local.length <= 2) return `${local.charAt(0)}***@${domain}`;
    return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
  };

  // Method 1: Google OAuth
  const handleGoogleSignIn = async () => {
    if (submitting || authLoading) return;
    setSubmitting(true);
    try {
      await loginWithGoogle();
      // Browser will redirect to Google authentication endpoint
    } catch (err) {
      setSubmitting(false);
      addToast(err.message || 'Could not initiate Google sign-in. Please try again.', 'error');
    }
  };

  // Method 2: Email + Password submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (submitting || authLoading) return;

    // Client-side validations
    const val = validateEmailAddress(email);
    if (!val.isValid) {
      addToast(val.error, 'error');
      setEmailTouched(true);
      return;
    }

    if (mode === 'signup' || mode === 'recovery') {
      if (password.length < 8) {
        addToast('Please enter a valid password that meets the required format (at least 8 characters).', 'error');
        setPasswordTouched(true);
        return;
      }
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        addToast('Passwords do not match.', 'error');
        setConfirmTouched(true);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res?.user) {
          addToast(`Welcome back, ${res.user.name}!`, 'success');
          onNavigate(ROUTES.DASHBOARD);
        }
      } else if (mode === 'signup') {
        const res = await signup(name, email, password);
        if (res?.needsConfirmation) {
          setUnconfirmedEmail(res.email || email);
          setMode('confirm_email');
          setResendCooldown(60);
          addToast('Confirmation email sent. Please check your inbox.', 'success');
        } else if (res?.user) {
          addToast('Account created successfully! Welcome to AI Content Studio.', 'success');
          onNavigate(ROUTES.DASHBOARD);
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        addToast(res.message || 'Password reset link sent.', 'info');
        setMode('login');
      } else if (mode === 'recovery') {
        await updatePassword(password);
        addToast('Password updated successfully! Welcome back.', 'success');
        onNavigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const errMsg = err.message || 'Authentication error';
      if (errMsg.toLowerCase().includes('confirm your email') || errMsg.toLowerCase().includes('email_not_confirmed')) {
        setUnconfirmedEmail(email);
      }
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend confirmation email with cooldown protection
  const handleResendConfirmation = async () => {
    const targetEmail = unconfirmedEmail || email;
    if (!targetEmail) {
      addToast('Please enter your email address to resend confirmation.', 'error');
      return;
    }

    if (resendCooldown > 0) {
      addToast(`Please wait ${resendCooldown}s before requesting another confirmation link.`, 'info');
      return;
    }

    setResending(true);
    try {
      const res = await resendConfirmationEmail(targetEmail);
      addToast(res.message || 'Confirmation email sent. Please check your inbox.', 'success');
      setResendCooldown(60); // 60s cooldown
    } catch (err) {
      addToast(err.message || 'Failed to resend confirmation email.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-app)',
      color: 'var(--text-main)'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            onClick={() => onNavigate(ROUTES.HOME)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate(ROUTES.HOME)}
            aria-label="Return to AI Content Studio Home"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 16px auto',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Sparkles size={24} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            {mode === 'confirm_email'
              ? 'Check Your Email'
              : mode === 'recovery'
              ? 'Set New Password'
              : mode === 'forgot'
              ? 'Reset Password'
              : mode === 'signup'
              ? 'Create Free Account'
              : 'Welcome to AI Studio'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {mode === 'confirm_email'
              ? `We've sent a confirmation link to your email. Please confirm your email to continue.`
              : mode === 'recovery'
              ? 'Enter your new password below to regain access.'
              : mode === 'forgot'
              ? 'Enter your email to receive a password recovery link.'
              : 'Free Plan includes 60 credits / month. No credit card required.'}
          </p>
        </div>

        {/* ============================================================ */}
        {/* CONFIRMATION SCREEN: Check your email                        */}
        {/* ============================================================ */}
        {mode === 'confirm_email' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}>
                <Mail size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-900)' }}>
                Check Your Email
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--primary-700)', margin: 0, lineHeight: 1.5 }}>
                We've sent a confirmation link to <strong>{getMaskedEmail(unconfirmedEmail)}</strong>. Please click the link to activate your account and continue.
              </p>
            </div>

            <button
              type="button"
              disabled={resending || resendCooldown > 0}
              onClick={handleResendConfirmation}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: (resending || resendCooldown > 0) ? 'var(--text-muted)' : 'var(--primary-700)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: (resending || resendCooldown > 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: (resending || resendCooldown > 0) ? 0.7 : 1
              }}
            >
              <RefreshCw size={16} className={resending ? 'spin-animation' : ''} />
              {resending 
                ? 'Sending...' 
                : resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : 'Resend Confirmation Email'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => { setMode('signup'); setUnconfirmedEmail(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setUnconfirmedEmail(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}
              >
                Return to Sign In →
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Method 1: Google OAuth Button (Visible when not in recovery/forgot) */}
            {mode !== 'recovery' && mode !== 'forgot' && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  disabled={submitting || authLoading}
                  onClick={handleGoogleSignIn}
                  aria-label="Continue with Google"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: (submitting || authLoading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all var(--transition-fast)',
                    opacity: (submitting || authLoading) ? 0.75 : 1
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {submitting ? 'Connecting to Google...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '20px 0',
                  color: 'var(--text-subtle)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                  <span>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                </div>
              </div>
            )}

            {/* METHOD 2: Email + Password Form */}
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-name" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              {mode !== 'recovery' && (
                <div>
                  <label htmlFor="auth-email" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onBlur={() => setEmailTouched(true)}
                      onChange={(e) => { setEmail(e.target.value); if (!emailTouched) setEmailTouched(true); }}
                      aria-invalid={!emailValidation.isValid}
                      aria-describedby={!emailValidation.isValid ? 'email-validation-error' : undefined}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${!emailValidation.isValid ? 'var(--danger)' : 'var(--border-medium)'}`,
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                  {!emailValidation.isValid && (
                    <div id="email-validation-error" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> {emailValidation.error}
                    </div>
                  )}
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label htmlFor="auth-password" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {mode === 'recovery' ? 'New Password' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setEmailTouched(false); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontSize: '0.825rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onBlur={() => setPasswordTouched(true)}
                      onChange={(e) => { setPassword(e.target.value); if (!passwordTouched) setPasswordTouched(true); }}
                      aria-invalid={isPasswordShort}
                      aria-describedby={isPasswordShort ? 'password-validation-error' : (mode === 'signup' ? 'password-rules-hint' : undefined)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 40px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isPasswordShort ? 'var(--danger)' : 'var(--border-medium)'}`,
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <div id="password-rules-hint" style={{ fontSize: '0.8rem', color: isPasswordShort ? 'var(--danger)' : 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isPasswordShort ? <AlertCircle size={14} /> : <ShieldCheck size={14} />}
                      Password must be at least 8 characters.
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password Field for Signup */}
              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-confirm-password" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onBlur={() => setConfirmTouched(true)}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (!confirmTouched) setConfirmTouched(true); }}
                      aria-invalid={isPasswordMismatch}
                      aria-describedby={isPasswordMismatch ? 'confirm-password-error' : undefined}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 40px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${isPasswordMismatch ? 'var(--danger)' : 'var(--border-medium)'}`,
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  {isPasswordMismatch && (
                    <div id="confirm-password-error" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> Passwords do not match.
                    </div>
                  )}
                </div>
              )}

              {/* Notice for unconfirmed email state on login */}
              {unconfirmedEmail && mode === 'login' && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  fontSize: '0.85rem',
                  color: 'var(--primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Email unconfirmed?</span>
                  <button
                    type="button"
                    disabled={resending || resendCooldown > 0}
                    onClick={handleResendConfirmation}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: (resending || resendCooldown > 0) ? 'var(--text-muted)' : 'var(--primary-600)', 
                      fontWeight: 700, 
                      cursor: (resending || resendCooldown > 0) ? 'not-allowed' : 'pointer', 
                      fontSize: '0.85rem' 
                    }}
                  >
                    {resending ? 'Sending...' : resendCooldown > 0 ? `${resendCooldown}s` : 'Resend Link'}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || authLoading}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: (submitting || authLoading) ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: (submitting || authLoading) ? 0.75 : 1
                }}
              >
                {submitting 
                  ? 'Processing...' 
                  : mode === 'login' 
                  ? 'Sign In with Email' 
                  : mode === 'signup' 
                  ? 'Create Free Account' 
                  : mode === 'recovery'
                  ? 'Save New Password'
                  : 'Send Password Reset Link'}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>

            {/* View Switcher Links */}
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { 
                      setMode('signup'); 
                      setEmail(''); 
                      setPassword(''); 
                      setConfirmPassword('');
                      setEmailTouched(false);
                      setPasswordTouched(false);
                      setConfirmTouched(false);
                    }} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign Up Free
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => { 
                      setMode('login'); 
                      setPassword(''); 
                      setConfirmPassword('');
                      setEmailTouched(false);
                      setPasswordTouched(false);
                      setConfirmTouched(false);
                    }} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <button 
                  type="button"
                  onClick={() => { 
                    setMode('login'); 
                    setEmailTouched(false);
                    setPasswordTouched(false);
                    setConfirmTouched(false);
                  }} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
