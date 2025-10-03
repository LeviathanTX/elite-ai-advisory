// Environment Configuration
// Secure handling of API keys and environment variables

export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  USE_MOCK_AI: boolean;
  ENABLE_ANALYTICS: boolean;
  DEBUG_MODE: boolean;
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private env: Environment;

  private constructor() {
    // Use current deployment URL in production
    const defaultApiUrl = process.env.NODE_ENV === 'production'
      ? (typeof window !== 'undefined' ? window.location.origin : '') // Use current deployment URL
      : 'http://localhost:3000';

    this.env = {
      NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || defaultApiUrl,
      USE_MOCK_AI: process.env.REACT_APP_USE_MOCK_AI === 'true',
      ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' && process.env.NODE_ENV === 'production',
      DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development'
    };

  }

  static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  get(): Environment {
    return this.env;
  }

  isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  shouldUseMockAI(): boolean {
    return this.env.USE_MOCK_AI;
  }

  getApiBaseUrl(): string {
    return this.env.API_BASE_URL;
  }

  isDebugMode(): boolean {
    return this.env.DEBUG_MODE;
  }

  // Security: Never expose actual API keys in client
  hasSecureApiAccess(): boolean {
    // In production, API keys should be handled server-side
    return this.isProduction() || this.shouldUseMockAI();
  }
}

export const environment = EnvironmentConfig.getInstance();

// Environment validation
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const env = environment.get();

  if (env.NODE_ENV === 'production') {
    if (env.API_BASE_URL && env.API_BASE_URL.includes('localhost')) {
      errors.push('Production environment should not use localhost URLs');
    }

    if (env.USE_MOCK_AI) {
      errors.push('Production environment should not use mock AI');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}