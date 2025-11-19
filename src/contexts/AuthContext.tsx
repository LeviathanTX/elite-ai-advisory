import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../services/supabase';
import { User } from '../types';
import { setUser as setSentryUser } from '../sentry';
import { appConfig } from '../config/env';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
  resendVerificationEmail: () => Promise<{ error: any }>;
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

  const [user, setUser] = useState<User | null>(
    bypassAuth
      ? {
          id: '00000000-0000-0000-0000-000000000001', // Valid UUID for bypass mode
          email: 'LeviathanTX@gmail.com',
          full_name: 'Jeff (Demo Mode)',
          subscription_tier: 'founder',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_trial_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : null
  );
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(bypassAuth ? false : true);

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

        const { user: currentUser, error } = await Promise.race([
          authPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('❌ Auth initialization error:', error.message);
          // If auth check fails, set loading to false so app can still load
          setLoading(false);
          return;
        }

        setSupabaseUser(currentUser);
        if (currentUser) {
          await fetchUserProfile(currentUser.id);
        } else {
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
        await supabase
          .from('users')
          .update({ email_verified: isEmailVerified })
          .eq('id', userId);
        data.email_verified = isEmailVerified;
      }

      setUser(data);
    } catch (error) {
      console.error('❌ Exception in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await signIn(email, password);

    // In demo mode, manually set the user
    if (!error && data?.user) {
      const demoUser: User = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || 'Demo User',
        subscription_tier: 'founder',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_trial_active: true,
        email_verified: false,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(demoUser);
      setSupabaseUser(data.user as any);
    }

    return { error };
  };

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await signUp(email, password, fullName);

    // In demo mode, manually set the user
    if (!error && data?.user) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const demoUser: User = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || fullName || 'Demo User',
        subscription_tier: 'founder',
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        is_trial_active: true,
        email_verified: false,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(demoUser);
      setSupabaseUser(data.user as any);
    }

    return { error };
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'No user logged in' };

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
    }

    return { error };
  };

  const handleResendVerificationEmail = async () => {
    if (!supabaseUser?.email) {
      return { error: 'No user email found' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: supabaseUser.email,
      });

      if (error) {
        console.error('Error resending verification email:', error);
        return { error: error.message };
      }

      console.log('✅ Verification email resent successfully');
      return { error: null };
    } catch (err: any) {
      console.error('Exception resending verification email:', err);
      return { error: err.message || 'Failed to resend verification email' };
    }
  };

  const value = {
    user,
    supabaseUser,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile,
    resendVerificationEmail: handleResendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
