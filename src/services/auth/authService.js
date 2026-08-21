import { ROLES } from '../../config/roles';
import { supabase, isSupabaseReady } from '../../config/supabaseConfig';
import { validateEmailAddress } from '../../utils/emailValidator';

/**
 * Maps a Supabase Auth User object to the application user model.
 * Verification Rules:
 *  - EMAIL/PASSWORD: `email_confirmed_at` must be present
 *  - GOOGLE: Google OAuth provider verifies email by default
 */
function mapSupabaseUser(supabaseUser, profile = null) {
  if (!supabaseUser) return null;

  const email = supabaseUser.email || '';
  const meta = supabaseUser.user_metadata || {};
  const appMeta = supabaseUser.app_metadata || {};
  const provider = appMeta.provider || (supabaseUser.app_metadata && supabaseUser.app_metadata.providers?.[0]) || 'email';

  // Verification status determination
  const isOAuth = provider !== 'email';
  const isEmailConfirmed = Boolean(supabaseUser.email_confirmed_at);
  const isVerified = isOAuth || isEmailConfirmed;

  // Authoritative role: app_metadata.role ONLY, defaulting to ROLES.USER
  const role = appMeta.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;
  const name = profile?.full_name || meta.full_name || meta.name || (email ? email.split('@')[0] : 'Content Creator');
  const avatar = profile?.avatar_url || meta.avatar_url || meta.picture || null;

  return {
    id: supabaseUser.id,
    email: email || '',
    name,
    avatar,
    role,
    plan: 'free',
    isVerified,
    isEmailConfirmed,
    authProvider: provider,
    createdAt: supabaseUser.created_at || new Date().toISOString()
  };
}

/**
 * Standardized error message categories for Supabase Auth.
 */
export function formatAuthError(error) {
  if (!error) return 'An unexpected authentication error occurred.';
  const msg = (error.message || String(error)).toLowerCase();

  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return "Please confirm your email before signing in. We've sent a confirmation link to your inbox.";
  }
  if (msg.includes('user not found') || msg.includes('no user') || msg.includes('account not found')) {
    return 'No account found with this email. Please sign up first.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials') || msg.includes('invalid password') || msg.includes('wrong password')) {
    return 'Incorrect password. Please check your password and try again.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('unique_email')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'Please enter a valid password that meets the required format.';
  }
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || msg.includes('for security purposes') || msg.includes('too many requests')) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  if (msg.includes('error sending confirmation email') || msg.includes('smtp') || msg.includes('mail error')) {
    return 'Could not send confirmation email. Please verify your email address or try again later.';
  }
  if (msg.includes('network') || msg.includes('fetch failed')) {
    return 'Network connection error. Please check your internet connection.';
  }
  if (msg.includes('unsupported_provider') || msg.includes('oauth provider not enabled') || msg.includes('google provider')) {
    return 'Google Sign-In is not enabled in this Supabase project. Please configure Google OAuth in the Supabase Dashboard.';
  }

  return error.message || 'An unexpected authentication error occurred.';
}

class AuthService {
  constructor() {
    this.client = supabase;
    this.useSupabase = isSupabaseReady && Boolean(this.client);
    this.currentUser = null;
  }

  getSupabaseClient() {
    return this.client;
  }

  /**
   * Helper to fetch profile display data (full_name, avatar_url) from public.profiles.
   */
  async fetchProfile(userId) {
    if (!this.useSupabase || !userId) return null;
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      // Handled gracefully
    }
    return null;
  }

  /**
   * Restores current session and resolves user profile.
  /**
   * Retrieves the current authenticated user session.
   * Uses auth.getUser() to strictly validate the session against Supabase Auth backend.
   * If user was deleted or session invalidated, purges stale local tokens and returns null.
   * Gating: If user is email-based and not confirmed, session is treated as unauthenticated.
   */
  async getCurrentUser() {
    if (this.useSupabase) {
      try {
        const { data: { user }, error: userError } = await this.client.auth.getUser();
        if (userError || !user) {
          // Stale or deleted session detected; explicitly clean local storage tokens
          await this.client.auth.signOut({ scope: 'local' }).catch(() => {});
          this.currentUser = null;
          return null;
        }

        const profile = await this.fetchProfile(user.id);
        const mappedUser = mapSupabaseUser(user, profile);

        // Enforce mandatory email verification for email-password users
        if (!mappedUser.isVerified) {
          this.currentUser = null;
          return null;
        }

        this.currentUser = mappedUser;
        return this.currentUser;
      } catch (err) {
        this.currentUser = null;
        return null;
      }
    }

    return null;
  }

  /**
   * Purely synchronous callback inside onAuthStateChange.
   * Asynchronous profile hydration is scheduled OUTSIDE the callback.
   */
  onAuthStateChange(callback) {
    if (this.useSupabase) {
      const { data: { subscription } } = this.client.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const mappedUser = mapSupabaseUser(session.user);

          // If email user is not verified, do not provide an authenticated user model
          if (!mappedUser.isVerified) {
            this.currentUser = null;
            callback(event, null);
            return;
          }

          this.currentUser = mappedUser;
          callback(event, this.currentUser);

          const activeUserId = session.user.id;
          setTimeout(() => {
            this.fetchProfile(activeUserId).then((profile) => {
              if (profile && this.currentUser && this.currentUser.id === activeUserId) {
                this.currentUser = mapSupabaseUser(session.user, profile);
                callback('USER_UPDATED', this.currentUser);
              }
            }).catch(() => {});
          }, 0);
        } else {
          this.currentUser = null;
          callback(event, null);
        }
      });

      return subscription;
    }

    return {
      unsubscribe: () => {}
    };
  }

  /**
   * Method 1: Google OAuth Sign-in
   * Dynamic redirectTo origin for Vite dev and production deployments.
   */
  async signInWithGoogle() {
    if (this.useSupabase) {
      const redirectTo = `${window.location.origin}/auth`;
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      return data;
    }

    throw new Error('Supabase client is not configured.');
  }

  /**
   * Method 2A: Email + Password Sign In
   */
  async signIn({ email, password }) {
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    if (!password) {
      throw new Error('Please enter your password.');
    }

    if (this.useSupabase) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      let profile = null;
      if (data.user) {
        profile = await this.fetchProfile(data.user.id);
      }

      const mappedUser = mapSupabaseUser(data.user, profile);

      if (!mappedUser.isVerified) {
        throw new Error("Please confirm your email before signing in. We've sent a confirmation link to your inbox.");
      }

      this.currentUser = mappedUser;
      return { user: this.currentUser, session: data.session, error: null };
    }

    throw new Error('Supabase client is not configured.');
  }

  /**
   * Method 2B: Email + Password Sign Up with Mandatory Confirmation Gating
   */
  async signUp({ email, password, name }) {
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    if (!password || password.length < 8) {
      throw new Error('Please enter a valid password that meets the required format (at least 8 characters).');
    }

    if (this.useSupabase) {
      const { data, error } = await this.client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: name || email.split('@')[0]
          }
        }
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      const isConfirmed = Boolean(data.user?.email_confirmed_at);
      const hasSession = Boolean(data.session);

      // When email confirmation is mandatory, user must confirm before entering app
      if (!isConfirmed || !hasSession) {
        this.currentUser = null;
        return {
          user: null,
          session: null,
          needsConfirmation: true,
          email: email.trim()
        };
      }

      this.currentUser = mapSupabaseUser(data.user);
      return { 
        user: this.currentUser, 
        session: data.session, 
        needsConfirmation: false,
        email: email.trim()
      };
    }

    throw new Error('Supabase client is not configured.');
  }

  /**
   * Method 2C: Resend Email Confirmation Link
   */
  async resendConfirmationEmail(email) {
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    if (this.useSupabase) {
      const { error } = await this.client.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      return { success: true, message: `Confirmation email sent. Please check your inbox.` };
    }

    throw new Error('Supabase client is not configured.');
  }

  /**
   * Cleans up all storage objects belonging to a user from the 'avatars' bucket.
   * Uses Supabase Storage API.
   */
  async cleanupUserAvatars(userId) {
    if (!this.useSupabase || !userId) return;
    try {
      const { data: files, error: listError } = await this.client.storage
        .from('avatars')
        .list(userId);

      if (!listError && Array.isArray(files) && files.length > 0) {
        const pathsToDelete = files.map(f => `${userId}/${f.name}`);
        const { error: removeError } = await this.client.storage
          .from('avatars')
          .remove(pathsToDelete);
        if (removeError) {
          console.warn("Storage avatar removal warning:", removeError);
        }
      }
    } catch (err) {
      console.error("Error cleaning up user avatars from storage:", err);
    }
  }

  /**
   * Signs out the current user and clears session state.
   */
  async signOut() {
    if (this.useSupabase) {
      const { error } = await this.client.auth.signOut({ scope: 'local' });
      this.currentUser = null;
      if (error) {
        throw new Error(formatAuthError(error));
      }
      return { error: null };
    }

    this.currentUser = null;
    return { error: null };
  }

  /**
   * Sends password recovery email.
   */
  async resetPassword(email) {
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    if (this.useSupabase) {
      const redirectUrl = `${window.location.origin}/auth?mode=recovery`;
      const { error } = await this.client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      return { success: true, message: `Password reset link sent to ${email}. Check your inbox.` };
    }

    throw new Error('Supabase client is not configured.');
  }

  /**
   * Updates user password for password recovery flow.
   */
  async updatePassword(newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (this.useSupabase) {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      return { success: true, user: data.user };
    }

    throw new Error('Supabase client is not configured.');
  }

  /**
   * Updates personal profile metadata.
   */
  async updateProfile(updates) {
    if (!this.currentUser) return null;

    if (this.useSupabase) {
      try {
        const payload = {};
        if (updates.name !== undefined) payload.full_name = updates.name;
        if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;

        if (Object.keys(payload).length > 0) {
          await this.client
            .from('profiles')
            .update(payload)
            .eq('id', this.currentUser.id);
        }
      } catch (e) {
        console.error("Error updating profile in Supabase:", e);
      }

      try {
        if (updates.name) {
          await this.client.auth.updateUser({
            data: {
              full_name: updates.name
            }
          });
        }
      } catch (e) {
        // Handled gracefully
      }
    }

    const updated = { ...this.currentUser, ...updates };
    this.currentUser = updated;
    return updated;
  }
}

export const authService = new AuthService();
