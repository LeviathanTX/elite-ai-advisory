import { createClient } from '@supabase/supabase-js';

// Environment variables - these will be set in production
const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co').trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder').trim();

// Demo mode flag - check for both missing URL and bypass auth
const isDemoMode = !process.env.REACT_APP_SUPABASE_URL || process.env.REACT_APP_BYPASS_AUTH === 'true';

// Detect if browser storage is available
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('⚠️ localStorage is blocked or unavailable:', e);
    return false;
  }
}

const storageAvailable = isStorageAvailable();

// Debug logging with more details
console.log('🔧 Supabase initialization:', {
  url: supabaseUrl,
  urlSource: process.env.REACT_APP_SUPABASE_URL ? 'env var' : 'fallback',
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length || 0,
  keySource: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'env var' : 'fallback',
  isDemoMode,
  envVarPresent: !!process.env.REACT_APP_SUPABASE_URL,
  storageAvailable,
});

// Alert if using fallback values
if (isDemoMode) {
  console.warn('⚠️ RUNNING IN DEMO MODE - No Supabase URL configured');
} else {
  console.log('✅ Production mode - Using real Supabase at:', supabaseUrl);
}

// If storage is blocked, warn the user
if (!storageAvailable && !isDemoMode) {
  console.error(`
    ❌ Browser storage is blocked!

    This browser has localStorage disabled or blocked. This may be due to:
    - Private/Incognito browsing mode
    - Browser privacy settings (e.g., Safari's "Prevent cross-site tracking")
    - Browser extensions (ad blockers, privacy tools)
    - Corporate firewall or security policies

    Authentication will work but sessions won't persist between page refreshes.
    You'll need to log in each time you visit the site.

    To fix: Enable localStorage in your browser settings or use a different browser.
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !isDemoMode && storageAvailable,
    persistSession: !isDemoMode && storageAvailable,
    detectSessionInUrl: false,
    storage: storageAvailable ? undefined : {
      // Memory-only storage fallback for when localStorage is blocked
      getItem: (key: string) => null,
      setItem: (key: string, value: string) => {},
      removeItem: (key: string) => {},
    },
  },
});

// Database Tables Schema (for reference)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'founder' | 'scale-up' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'founder' | 'scale-up' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'founder' | 'scale-up' | 'enterprise';
          updated_at?: string;
        };
      };
      celebrity_advisors: {
        Row: {
          id: string;
          name: string;
          title: string;
          company: string;
          expertise: string[];
          personality_traits: string[];
          communication_style: string;
          avatar_url: string | null;
          bio: string;
          investment_thesis: string | null;
          created_at: string;
        };
      };
      custom_advisors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          title: string;
          company: string | null;
          expertise: string[];
          personality_description: string;
          communication_style: string;
          background_context: string;
          avatar_emoji: string | null;
          avatar_image: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          advisor_id: string;
          advisor_type: 'celebrity' | 'custom';
          mode: 'pitch_practice' | 'strategic_planning' | 'due_diligence' | 'quick_consultation';
          messages: any;
          created_at: string;
          updated_at: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_type: string;
          file_size: number;
          content_text: string | null;
          upload_date: string;
          analysis_status: 'pending' | 'processing' | 'completed' | 'error';
          analysis_results: any | null;
        };
      };
      voice_sessions: {
        Row: {
          id: string;
          user_id: string;
          type: 'pitch_practice' | 'advisor_conversation';
          duration: number;
          transcript: string;
          analysis: any | null;
          created_at: string;
        };
      };
      usage_stats: {
        Row: {
          id: string;
          user_id: string;
          ai_advisor_hours_used: number;
          document_analyses_used: number;
          pitch_practice_sessions_used: number;
          custom_advisors_created: number;
          updated_at: string;
        };
      };
    };
  };
}

// Test connectivity to Supabase with timeout
export const testSupabaseConnectivity = async (timeoutMs: number = 3000) => {
  console.log('🔌 Testing Supabase connectivity...');

  if (isDemoMode) {
    console.log('ℹ️ Demo mode - skipping connectivity test');
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    };

    if (response.ok) {
      console.log('✅ Supabase connectivity: OK', result);
    } else {
      console.warn('⚠️ Supabase connectivity: DEGRADED', result);
    }

    return response.ok;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('❌ Supabase connectivity: TIMEOUT (>3s)');
    } else {
      console.error('❌ Supabase connectivity: FAILED', error.message);
    }
    return false;
  }
};

// Helper functions for authentication
export const signIn = async (email: string, password: string) => {
  console.log('signIn called:', { email, isDemoMode, supabaseUrl });

  if (isDemoMode) {
    // Demo mode - simulate successful login
    console.log('Using demo mode authentication');
    const demoUser = {
      id: 'demo-user-123',
      email,
      user_metadata: { full_name: 'Demo User' },
      created_at: new Date().toISOString(),
    };
    return {
      data: {
        user: demoUser,
        session: { user: demoUser, access_token: 'demo-token' },
      },
      error: null,
    };
  }

  console.log('Using real Supabase authentication');
  console.log('Supabase client initialized with URL:', supabaseUrl);

  try {
    console.log('Testing Supabase connectivity...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Has anon key:', !!supabaseAnonKey);
    const startTime = Date.now();

    // Attempt authentication with shorter timeout
    console.log('Calling supabase.auth.signInWithPassword...');
    const signinPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              'Authentication timed out. Please check your internet connection or try again later.'
            )
          ),
        15000
      )
    );

    console.log('Starting authentication request...');
    const { data, error } = (await Promise.race([signinPromise, timeoutPromise])) as any;
    const duration = Date.now() - startTime;

    console.log('Supabase auth response:', {
      data: !!data,
      error: !!error,
      errorMessage: error?.message,
      duration: `${duration}ms`,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
    });

    // Check for common errors and provide helpful messages
    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        return {
          data: null,
          error: {
            message:
              'Invalid email or password. Please check your credentials or sign up for a new account.',
          },
        };
      }
      if (error.message?.includes('Email not confirmed')) {
        return {
          data: null,
          error: { message: 'Please check your email to confirm your account before signing in.' },
        };
      }
    }

    return { data, error };
  } catch (err: any) {
    console.error('Supabase auth exception:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    // Provide user-friendly error message
    const userMessage = err.message?.includes('timeout')
      ? 'Sign-in timed out. This may be due to network issues or Supabase configuration. Please try again or contact support.'
      : err.message || 'Authentication failed. Please try again.';

    return { data: null, error: { message: userMessage } };
  }
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  console.log('signUp called:', { email, fullName, isDemoMode });

  if (isDemoMode) {
    // Demo mode - simulate successful signup
    console.log('Using demo mode signup');
    const demoUser = {
      id: 'demo-user-123',
      email,
      user_metadata: { full_name: fullName || 'Demo User' },
      created_at: new Date().toISOString(),
    };
    return {
      data: {
        user: demoUser,
        session: { user: demoUser, access_token: 'demo-token' },
      },
      error: null,
    };
  }

  console.log('Using real Supabase signup');
  console.log('Supabase client initialized with URL:', supabaseUrl);

  try {
    // Test basic connectivity first
    const isConnected = await testSupabaseConnectivity();
    if (!isConnected) {
      throw new Error('Unable to connect to Supabase - check network and configuration');
    }

    console.log('Testing Supabase connectivity for signup...');
    const startTime = Date.now();

    // Add a timeout to prevent hanging - increased to 30 seconds
    const signupPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Signup timeout after 30 seconds')), 30000)
    );

    console.log('Starting signup request...');

    // Try direct API call as backup if client hangs
    const directSignupPromise = fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: { full_name: fullName },
      }),
    }).then(async response => {
      const responseData = await response.json();
      if (!response.ok) {
        return { data: null, error: responseData };
      }
      return { data: responseData, error: null };
    });

    // Race between client call and direct API call
    const { data, error } = (await Promise.race([
      signupPromise,
      directSignupPromise.then(result => {
        console.log('Direct API signup completed first');
        return result;
      }),
      timeoutPromise,
    ])) as any;
    const duration = Date.now() - startTime;

    console.log('Supabase signup response:', {
      data: !!data,
      error: !!error,
      errorMessage: error?.message,
      duration: `${duration}ms`,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
    });

    return { data, error };
  } catch (err: any) {
    console.error('Supabase signup exception:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return { data: null, error: { message: err.message || 'Signup failed' } };
  }
};

export const signOut = async () => {
  if (isDemoMode) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (isDemoMode) {
    return { user: null, error: null };
  }

  try {
    console.log('🔍 Checking current user session...');

    // Add timeout protection (5 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth check timed out after 5 seconds')), 5000)
    );

    const authPromise = supabase.auth.getUser();

    const {
      data: { user },
      error,
    } = await Promise.race([authPromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Auth check error:', error.message);
    } else if (user) {
      console.log('✅ User session found:', user.email);
    } else {
      console.log('ℹ️ No active user session');
    }

    return { user, error };
  } catch (err: any) {
    console.error('❌ Auth check failed:', err.message);
    return { user: null, error: { message: err.message } };
  }
};
