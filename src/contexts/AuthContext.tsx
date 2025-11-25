import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../services/supabase';
import { User } from '../types';
import { setUser as setSentryUser } from '../sentry';
import { appConfig } from '../config/env';
import { AuthResponse, SignInData, SignUpData, SessionInfo, UserProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  sessionInfo: SessionInfo | null;
  signIn: (email: string, password: string) => Promise<AuthResponse<SignInData>>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse<SignUpData>>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse<UserProfile>>;
  resendVerificationEmail: () => Promise<AuthResponse<void>>;
  refreshSession: () => Promise<AuthResponse<void>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use environment configuration for auth bypass
  const bypassAuth = appConfig.bypassAuth;

  // SECURITY: Generate demo user dynamically instead of hardcoding real email addresses
  const getDemoUser = (): User => ({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo@ai-bod.local',
    full_name: 'Demo User',
    subscription_tier: 'founder',
    trial_start_date: new Date().toISOString(),
    trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_trial_active: true,
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [user, setUser] = useState<User | null>(bypassAuth ? getDemoUser() : null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(bypassAuth ? false : true);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  // Update Sentry user context whenever user changes
  useEffect(() => {
    if (user) {
      setSentryUser({
        id: user.id,
        email: user.email,
        username: user.full_name || undefined,
      });
    } else {
      setSentryUser(null);
    }
  }, [user]);

  useEffect(() => {
    // Skip auth initialization if bypass is enabled OR if no Supabase configuration
    const hasSupabaseConfig = appConfig.hasSupabase;

    if (bypassAuth || !hasSupabaseConfig) {
      console.log('🔓 Auth bypass enabled or no Supabase config - skipping initialization');
      setLoading(false);
      return;
    }

    console.log('🔐 Initializing authentication...');

    // Check active sessions with timeout protection
    const initAuth = async () => {
      try {
        // Add a timeout wrapper for the entire auth initialization
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 8000)
        );

        const authPromise = getCurrentUser();

        const { user: currentUser, error } = (await Promise.race([
          authPromise,
          timeoutPromise,
        ])) as any;

        if (error) {
          console.error('❌ Auth initialization error:', error.message);
          // If auth check fails, set loading to false so app can still load
          setLoading(false);
          return;
        }

        if (currentUser) {
          console.log('✅ Session found on page load, user:', currentUser.email);
          setSupabaseUser(currentUser);
          await fetchUserProfile(currentUser.id);
        } else {
          console.log('ℹ️  No active session found on page load');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Auth initialization failed:', err?.message || err);
        setLoading(false); // Always set loading false to prevent infinite spinner
      }
    };

    initAuth();

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [bypassAuth]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching user profile for:', userId);

      // Check email verification status from Supabase auth
      const { data: authUser } = await supabase.auth.getUser();
      const isEmailVerified = !!authUser.user?.email_confirmed_at;

      // Wait a moment for the database trigger to create the profile
      // (the trigger runs AFTER INSERT on auth.users)
      let retries = 3;
      let data = null;
      let error = null;

      while (retries > 0) {
        const result = await supabase.from('users').select('*').eq('id', userId).single();
        data = result.data;
        error = result.error;

        if (!error && data) {
          break;
        }

        if (error?.code === 'PGRST116') {
          // Profile doesn't exist yet, wait and retry
          console.log(`⏳ Profile not found, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retries--;
        } else {
          // Different error, don't retry
          break;
        }
      }

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('❌ User profile not found after retries');
        setLoading(false);
        return;
      }

      console.log('✅ User profile loaded');

      // Sync email verification status if it has changed
      if (data.email_verified !== isEmailVerified) {
        console.log('📧 Syncing email verification status:', isEmailVerified);
        await supabase.from('users').update({ email_verified: isEmailVerified }).eq('id', userId);
        data.email_verified = isEmailVerified;
      }

      setUser(data);
    } catch (error) {
      console.error('❌ Exception in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate session info from current session
  const calculateSessionInfo = (session: Session | null): SessionInfo => {
    if (!session) {
      return {
        isValid: false,
        expiresAt: null,
        expiresIn: null,
        needsRefresh: false,
      };
    }

    const expiresAt = session.expires_at ? session.expires_at * 1000 : null;
    const now = Date.now();
    const expiresIn = expiresAt ? Math.floor((expiresAt - now) / 1000) : null;
    const needsRefresh = expiresIn !== null && expiresIn < 300; // Refresh if < 5 minutes

    return {
      isValid: expiresIn !== null && expiresIn > 0,
      expiresAt,
      expiresIn,
      needsRefresh,
    };
  };

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse<SignInData>> => {
    const result = await signIn(email, password);

    // Fetch user profile from database
    if (!result.error && result.data?.user) {
      setSupabaseUser(result.data.user as any);

      // Fetch the full user profile from the database
      await fetchUserProfile(result.data.user.id);

      // Update session info
      if (result.data.session) {
        setSessionInfo(calculateSessionInfo(result.data.session));
      }
    }

    return result;
  };

  const handleSignUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResponse<SignUpData>> => {
    const result = await signUp(email, password, fullName);

    // Note: For signup, user profile will be created by database trigger
    // We don't set the user here because they need to verify their email first
    // The user will be loaded via fetchUserProfile after email verification

    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSupabaseUser(null);
    setSessionInfo(null);
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse<UserProfile>> => {
    if (!user) {
      return {
        data: null,
        error: { message: 'No user logged in', code: 'no_user' },
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
      return { data, error: null };
    }

    return {
      data: null,
      error: error ? { message: error.message } : { message: 'Update failed' },
    };
  };

  const handleResendVerificationEmail = async (): Promise<AuthResponse<void>> => {
    if (!supabaseUser?.email) {
      return {
        data: null,
        error: { message: 'No user email found', code: 'no_email' },
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: supabaseUser.email,
      });

      if (error) {
        console.error('Error resending verification email:', error);
        return { data: null, error: { message: error.message } };
      }

      console.log('✅ Verification email resent successfully');
      return { data: null, error: null };
    } catch (err: any) {
      console.error('Exception resending verification email:', err);
      return {
        data: null,
        error: { message: err.message || 'Failed to resend verification email' },
      };
    }
  };

  const handleRefreshSession = async (): Promise<AuthResponse<void>> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error refreshing session:', error);
        return { data: null, error: { message: error.message } };
      }

      if (data.session) {
        setSessionInfo(calculateSessionInfo(data.session));
      }

      console.log('✅ Session refreshed successfully');
      return { data: null, error: null };
    } catch (err: any) {
      console.error('Exception refreshing session:', err);
      return {
        data: null,
        error: { message: err.message || 'Failed to refresh session' },
      };
    }
  };

  // Monitor session and auto-refresh if needed
  useEffect(() => {
    if (!sessionInfo || bypassAuth) return;

    // Check session every minute
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const info = calculateSessionInfo(data.session);
        setSessionInfo(info);

        // Auto-refresh if needed
        if (info.needsRefresh) {
          console.log('⚠️ Session expiring soon, auto-refreshing...');
          await handleRefreshSession();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionInfo, bypassAuth]);

  const value = {
    user,
    supabaseUser,
    loading,
    sessionInfo,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile,
    resendVerificationEmail: handleResendVerificationEmail,
    refreshSession: handleRefreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
