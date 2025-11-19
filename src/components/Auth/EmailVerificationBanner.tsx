import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils';

interface EmailVerificationBannerProps {
  className?: string;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ className }) => {
  const { user, supabaseUser, resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if email is already verified or banner is dismissed
  if (user?.email_verified || isDismissed || !supabaseUser) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    const { error } = await resendVerificationEmail();

    setIsResending(false);

    if (error) {
      setResendError(error);
    } else {
      setResendSuccess(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    }
  };

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 shadow-sm transition-all duration-200',
        'bg-orange-50 border-orange-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📧</span>
            <h3 className="font-semibold text-orange-900">Verify Your Email Address</h3>
          </div>
          <p className="text-sm text-orange-900 mb-2">
            Please check your inbox at <strong>{supabaseUser.email}</strong> and click the
            verification link to activate your account.
          </p>

          {resendSuccess && (
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
              ✅ Verification email sent! Check your inbox.
            </div>
          )}

          {resendError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
              ❌ {resendError}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendSuccess}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold text-sm',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500',
                isResending || resendSuccess
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              )}
            >
              {isResending ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Email'}
            </button>

            <p className="text-xs text-orange-700">
              Didn't receive it? Check your spam folder or click to resend.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className={cn(
            'p-1 rounded hover:bg-black hover:bg-opacity-5',
            'transition-colors duration-150',
            'text-orange-600'
          )}
          aria-label="Dismiss banner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
