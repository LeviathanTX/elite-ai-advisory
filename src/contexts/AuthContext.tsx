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
    // Skip auth initialization if bypass is enabled
    if (bypassAuth) {
      console.log('🔓 Auth bypass enabled - skipping Supabase initialization');
      return;
    }

    console.log('🔐 Initializing authentication...');

    // Check active sessions with timeout protection
    const initAuth = async () => {
      try {
        const { user: currentUser, error } = await getCurrentUser();

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
      } catch (err) {
        console.error('❌ Auth initialization failed:', err);
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

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 500; // ms

    try {
      console.log('👤 Fetching user profile for:', userId, retryCount > 0 ? `(retry ${retryCount})` : '');

      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) {
        // If user doesn't exist in our users table
        if (error.code === 'PGRST116') {
          // Database trigger should have created the profile automatically
          // If not found, might be a race condition - retry a few times
          if (retryCount < MAX_RETRIES) {
            console.log(`⏳ User profile not found yet, retrying in ${RETRY_DELAY}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchUserProfile(userId, retryCount + 1);
          }

          // If still not found after retries, try to create manually as fallback
          console.log('📝 User not found after retries, creating profile manually...');
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const newUser: Partial<User> = {
              id: authUser.user.id,
              email: authUser.user.email!,
              full_name: authUser.user.user_metadata?.full_name,
              subscription_tier: 'founder', // Default tier
            };

            const { data: createdUser, error: createError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();

            if (!createError && createdUser) {
              console.log('✅ User profile created manually');
              setUser(createdUser);
            } else {
              console.error('❌ Failed to create user profile:', createError?.message || createError);
              // Log more details about the error
              if (createError) {
                console.error('Error details:', {
                  code: createError.code,
                  message: createError.message,
                  details: createError.details,
                  hint: createError.hint,
                });
              }
            }
          }
        } else {
          console.error('❌ Error fetching user profile:', {
            code: error.code,
            message: error.message,
            details: error.details,
          });
        }
        return; // Don't throw, just return
      }

      console.log('✅ User profile loaded successfully');
      setUser(data);
    } catch (error: any) {
      console.error('❌ Exception in fetchUserProfile:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
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
      const demoUser: User = {
        id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || fullName || 'Demo User',
        subscription_tier: 'founder',
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

  const value = {
    user,
    supabaseUser,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
