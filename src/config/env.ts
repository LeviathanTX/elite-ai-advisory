/**
 * Environment Configuration and Validation
 *
 * This module provides type-safe access to environment variables
 * and validates that required configuration is present.
 */

export interface AppConfig {
  // Environment
  env: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;

  // Auth
  bypassAuth: boolean;

  // Supabase
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  hasSupabase: boolean;

  // AI Services
  openaiApiKey: string | null;
  anthropicApiKey: string | null;
  googleApiKey: string | null;
  deepseekApiKey: string | null;
  deepgramApiKey: string | null;
  hasAnyAiKey: boolean;

  // Features
  useMockAi: boolean;
  debugMode: boolean;
  mockDelayMs: number;

  // Error Tracking
  sentryDsn: string | null;

  // Feature Flags
  enableDocumentUpload: boolean;
  enableVoiceInput: boolean;
  maxDocumentSize: number;
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse number from environment variable
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable or return null
 */
function getEnvOrNull(key: string): string | null {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : null;
}

/**
 * Load and validate environment configuration
 */
function loadConfig(): AppConfig {
  const env = (process.env.REACT_APP_ENV ||
    process.env.NODE_ENV ||
    'development') as AppConfig['env'];
  const isDevelopment = env === 'development';
  const isProduction = env === 'production';

  // Auth
  const bypassAuth = parseBoolean(process.env.REACT_APP_BYPASS_AUTH, isDevelopment);

  // Supabase
  const supabaseUrl = getEnvOrNull('REACT_APP_SUPABASE_URL');
  const supabaseAnonKey = getEnvOrNull('REACT_APP_SUPABASE_ANON_KEY');
  const hasSupabase = !!(supabaseUrl && supabaseAnonKey);

  // AI Services
  const openaiApiKey = getEnvOrNull('REACT_APP_OPENAI_API_KEY');
  const anthropicApiKey = getEnvOrNull('REACT_APP_ANTHROPIC_API_KEY');
  const googleApiKey = getEnvOrNull('REACT_APP_GOOGLE_API_KEY');
  const deepseekApiKey = getEnvOrNull('REACT_APP_DEEPSEEK_API_KEY');
  const deepgramApiKey = getEnvOrNull('REACT_APP_DEEPGRAM_API_KEY');
  const hasAnyAiKey = !!(openaiApiKey || anthropicApiKey || googleApiKey || deepseekApiKey);

  // Features
  const useMockAi = parseBoolean(process.env.REACT_APP_USE_MOCK_AI, !hasAnyAiKey);
  const debugMode = parseBoolean(process.env.REACT_APP_DEBUG_MODE, isDevelopment);
  const mockDelayMs = parseNumber(process.env.REACT_APP_MOCK_DELAY_MS, 1000);

  // Error Tracking
  const sentryDsn = getEnvOrNull('REACT_APP_SENTRY_DSN');

  // Feature Flags
  const enableDocumentUpload = parseBoolean(process.env.REACT_APP_ENABLE_DOCUMENT_UPLOAD, true);
  const enableVoiceInput = parseBoolean(process.env.REACT_APP_ENABLE_VOICE_INPUT, false);
  const maxDocumentSize = parseNumber(process.env.REACT_APP_MAX_DOCUMENT_SIZE, 10485760); // 10MB

  return {
    env,
    isDevelopment,
    isProduction,
    bypassAuth,
    supabaseUrl,
    supabaseAnonKey,
    hasSupabase,
    openaiApiKey,
    anthropicApiKey,
    googleApiKey,
    deepseekApiKey,
    deepgramApiKey,
    hasAnyAiKey,
    useMockAi,
    debugMode,
    mockDelayMs,
    sentryDsn,
    enableDocumentUpload,
    enableVoiceInput,
    maxDocumentSize,
  };
}

/**
 * Validate configuration and log warnings
 */
function validateConfig(config: AppConfig): void {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Production checks
  if (config.isProduction) {
    if (config.bypassAuth) {
      errors.push(
        'CRITICAL: Auth bypass is enabled in production! Set REACT_APP_BYPASS_AUTH=false'
      );
      // SECURITY: Prevent app from running with bypass auth in production
      throw new Error(
        'SECURITY ERROR: Authentication bypass is not allowed in production. Please configure Supabase authentication.'
      );
    }
    if (!config.hasSupabase) {
      errors.push('CRITICAL: Supabase not configured in production. App will run in demo mode.');
      // SECURITY: Require database in production
      throw new Error(
        'SECURITY ERROR: Supabase must be configured in production. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.'
      );
    }
    if (config.useMockAi) {
      warnings.push('WARNING: Mock AI enabled in production. Real AI features will not work.');
    }
  }

  // General warnings
  if (!config.hasSupabase && !config.bypassAuth) {
    warnings.push('Supabase not configured. Auth will not work without bypass mode.');
  }

  if (!config.hasAnyAiKey && !config.useMockAi) {
    warnings.push('No AI API keys configured and mock mode disabled. AI features will fail.');
  }

  if (config.bypassAuth) {
    warnings.push('Auth bypass enabled. All users will be logged in as demo user.');
  }

  // Log results
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (config.debugMode) {
    console.log('🔧 Configuration loaded:', {
      env: config.env,
      bypassAuth: config.bypassAuth,
      hasSupabase: config.hasSupabase,
      hasAnyAiKey: config.hasAnyAiKey,
      useMockAi: config.useMockAi,
    });
  }
}

// Load and validate configuration
export const appConfig = loadConfig();
validateConfig(appConfig);

// Export for convenience
export const {
  env,
  isDevelopment,
  isProduction,
  bypassAuth,
  hasSupabase,
  hasAnyAiKey,
  useMockAi,
  debugMode,
} = appConfig;
