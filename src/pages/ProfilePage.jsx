import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { ROUTES } from '../config/constants';
import { billingService } from '../services/billing/billingService';
import { authService } from '../services/auth/authService';
import { supabase, isSupabaseReady } from '../config/supabaseConfig';
import { 
  User, 
  CreditCard, 
  Sliders, 
  Save, 
  CheckCircle2, 
  Zap, 
  Upload, 
  Trash2 
} from 'lucide-react';

export const ProfilePage = ({ onNavigate }) => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('account');
  const [name, setName] = useState(user?.name || '');
  const [tone, setTone] = useState('Professional');
  const [emailNotifs, setEmailNotifs] = useState(true);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [subDetails, setSubDetails] = useState(null);

  // Sync name when user state changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // Load real subscription and wallet details
  useEffect(() => {
    let isMounted = true;
    async function loadBilling() {
      if (user?.id) {
        try {
          const data = await billingService.getSubscriptionDetails(user.id);
          if (isMounted) {
            setSubDetails(data);
          }
        } catch (e) {
          console.error("Error loading subscription details:", e);
        }
      }
    }
    loadBilling();
    return () => { isMounted = false; };
  }, [user?.id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Full name cannot be empty.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim() });
      addToast("Profile details updated successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar Upload Handler
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate type and size (2MB max)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      addToast("Please select a valid image file (JPG, PNG, WebP, or GIF).", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      addToast("Image size must be less than 2MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      if (isSupabaseReady && supabase && user?.id) {
        // Clean up previous avatar files from storage first
        await authService.cleanupUserAvatars(user.id);

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage avatars bucket
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        await updateProfile({ avatar: publicUrl });
        addToast("Profile picture updated successfully!", "success");
      } else {
        // Mock fallback using FileReader
        const reader = new FileReader();
        reader.onloadend = async () => {
          await updateProfile({ avatar: reader.result });
          addToast("Profile picture updated!", "success");
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      addToast(err.message || "Failed to upload image. Please try again.", "error");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Avatar Removal Handler
  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      if (isSupabaseReady && supabase && user?.id) {
        await authService.cleanupUserAvatars(user.id);
      }
      await updateProfile({ avatar: null });
      addToast("Profile picture removed.", "info");
    } catch (err) {
      addToast("Failed to remove profile picture.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Profile', icon: User },
    { id: 'billing', label: 'Subscription & Plan', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Manage your personal profile, subscription tier, and workspace preferences.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.925rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Account Profile */}
      {activeTab === 'account' && (
        <Card maxWidth="680px">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Personal Profile</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
            <Avatar 
              src={user?.avatar} 
              name={user?.name} 
              size={80} 
              bordered 
            />

            <div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  aria-label="Upload profile image"
                />
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={Upload}
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload new profile image"
                >
                  {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                </Button>
                {user?.avatar && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={Trash2}
                    disabled={uploadingAvatar}
                    onClick={handleRemoveAvatar}
                    aria-label="Remove profile image"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
                JPG, PNG, WebP or GIF. Maximum file size: 2MB.
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="profile-fullname" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Full Name</label>
              <input
                id="profile-fullname"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                required
              />
            </div>

            <div>
              <label htmlFor="profile-identity" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Email Address / Identity</label>
              <input
                id="profile-identity"
                type="text"
                readOnly
                value={user?.email || (user?.phone ? `Phone: ${user.phone}` : '')}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '0.95rem', cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <Button type="submit" variant="primary" icon={Save} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Billing & Subscription */}
      {activeTab === 'billing' && (
        <Card maxWidth="680px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Current Subscription</h2>
            <Badge variant="success" size="md">
              {subDetails?.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>

          <div style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-900)' }}>
                {subDetails?.planName || 'Free'} Plan
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary-700)', marginTop: '4px' }}>
                {subDetails?.monthlyCreditAllowance ?? 60} credits / month • {subDetails?.monthlyCreditsRemaining ?? 60} credits remaining
              </div>
            </div>
            
            <Button 
              variant="primary" 
              icon={Zap}
              onClick={() => onNavigate && onNavigate(ROUTES.PRICING)}
            >
              {subDetails?.planId === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Button>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Included Plan Features</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" /> 5 AI Copywriting Models (Blog, Email, Social, Ads, Products)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" /> Real-Time Streaming Generation
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <CheckCircle2 size={16} color="var(--primary-600)" /> Persistent History Log and Bookmarks
            </li>
          </ul>
        </Card>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'preferences' && (
        <Card maxWidth="680px">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Workspace Preferences</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="pref-tone" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Default Brand Tone</label>
              <select
                id="pref-tone"
                value={tone}
                onChange={(e) => { setTone(e.target.value); addToast("Default tone updated", "info"); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.95rem' }}
              >
                <option value="Professional">Professional & Authoritative</option>
                <option value="Casual">Casual & Conversational</option>
                <option value="Persuasive">Persuasive & Sales-Oriented</option>
                <option value="Witty">Witty & Humorous</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>Email Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive monthly usage summaries and product updates.</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => { setEmailNotifs(e.target.checked); addToast(e.target.checked ? "Notifications enabled" : "Notifications disabled", "info"); }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                aria-label="Toggle email notifications"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
