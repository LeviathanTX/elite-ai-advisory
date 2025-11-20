// Auth-related TypeScript types
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SignUpData {
  user: SupabaseUser | null;
  session: any | null;
}

export interface SignInData {
  user: SupabaseUser | null;
  session: any | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: 'founder' | 'scale-up' | 'enterprise';
  trial_start_date: string | null;
  trial_end_date: string | null;
  is_trial_active: boolean | null;
  email_verified: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface SessionInfo {
  isValid: boolean;
  expiresAt: number | null;
  expiresIn: number | null; // seconds until expiry
  needsRefresh: boolean;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_EXISTS = 'email_exists',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  sessionInfo: SessionInfo | null;
  signIn: (email: string, password: string) => Promise<AuthResponse<SignInData>>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse<SignUpData>>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<AuthResponse<UserProfile>>;
  resendVerificationEmail: () => Promise<AuthResponse<void>>;
  refreshSession: () => Promise<AuthResponse<void>>;
}
