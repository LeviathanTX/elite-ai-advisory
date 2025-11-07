import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const dsn = process.env.REACT_APP_SENTRY_DSN;

  // Only initialize Sentry in production or if DSN is explicitly set
  if (!dsn) {
    console.log('Sentry DSN not configured - running without error tracking');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/elite-ai-advisory.*\.vercel\.app/,
      /^https:\/\/.*\.supabase\.co/,
    ],

    environment: process.env.NODE_ENV || 'development',

    // Ignore common errors that aren't actionable
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Random plugins/extensions
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      // Network errors
      'NetworkError',
      'Network request failed',
      // ResizeObserver errors (benign)
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'stack' in error) {
          const stack = (error as Error).stack;
          if (
            stack &&
            (stack.includes('chrome-extension://') || stack.includes('moz-extension://'))
          ) {
            return null;
          }
        }
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized:', {
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
};

// Helper to manually capture exceptions
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
};

// Helper to manually capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// Helper to set user context
export const setUser = (user: { id: string; email?: string; username?: string } | null) => {
  Sentry.setUser(user);
};
