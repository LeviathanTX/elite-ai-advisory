import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user is verified, doesn't exist, was dismissed, or is demo account
  const isDemoAccount = user?.email?.endsWith('@demo.com');
  if (!user || user.email_verified || dismissed || isDemoAccount) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setError('');

    const result = await resendVerificationEmail();

    if (result.error) {
      setError(result.error.message);
    } else {
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    }

    setSending(false);
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1">
            <span className="flex p-2 rounded-lg bg-yellow-100">
              <svg
                className="h-5 w-5 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Please verify your email address
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Check your inbox for a verification link. Didn't receive it?{' '}
                {sent ? (
                  <span className="text-green-700 font-semibold">
                    Email sent! Check your inbox.
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={sending}
                    className="underline hover:text-yellow-900 font-medium disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
              </p>
              {error && <p className="text-xs text-red-600 mt-1">Error: {error}</p>}
            </div>
          </div>
          <div className="ml-3">
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800 p-1"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
