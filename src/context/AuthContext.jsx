import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/auth/authService';
import { ROLES } from '../config/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session restoration with verification gating
    async function restoreSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    // 2. Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY)
    const subscription = authService.onAuthStateChange((event, updatedUser) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
      }

      setUser(updatedUser);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.signIn({ email, password });
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authService.signUp({ email, password, name });
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendConfirmationEmail = useCallback(async (email) => {
    return await authService.resendConfirmationEmail(email);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authService.signInWithGoogle();
      if (res?.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsPasswordRecovery(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    return await authService.resetPassword(email);
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const res = await authService.updatePassword(newPassword);
    setIsPasswordRecovery(false);
    return res;
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await authService.updateProfile(updates);
    if (updated) setUser(updated);
    return updated;
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && user.isVerified !== false),
    isAdmin: user?.role === ROLES.ADMIN,
    loading,
    isPasswordRecovery,
    login,
    signup,
    resendConfirmationEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    updatePassword,
    updateProfile
  }), [
    user,
    loading,
    isPasswordRecovery,
    login,
    signup,
    resendConfirmationEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    updatePassword,
    updateProfile
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
