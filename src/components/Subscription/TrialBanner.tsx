import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { appConfig } from '../../config/env';
import { cn } from '../../utils';

interface TrialBannerProps {
  className?: string;
  onUpgradeClick?: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ className, onUpgradeClick }) => {
  const { isTrialActive, trialDaysRemaining } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show in demo/bypass mode
  const isDemoMode = appConfig.bypassAuth || !appConfig.hasSupabase;

  // Don't show if trial is not active, banner is dismissed, or in demo mode
  if (!isTrialActive || isDismissed || isDemoMode) {
    return null;
  }

  // Determine urgency level based on days remaining
  const isUrgent = trialDaysRemaining <= 2;
  const isWarning = trialDaysRemaining <= 5 && trialDaysRemaining > 2;

  const bgColor = isUrgent
    ? 'bg-red-50 border-red-200'
    : isWarning
    ? 'bg-yellow-50 border-yellow-200'
    : 'bg-blue-50 border-blue-200';

  const textColor = isUrgent
    ? 'text-red-900'
    : isWarning
    ? 'text-yellow-900'
    : 'text-blue-900';

  const accentColor = isUrgent
    ? 'text-red-600'
    : isWarning
    ? 'text-yellow-600'
    : 'text-blue-600';

  const buttonColor = isUrgent
    ? 'bg-red-600 hover:bg-red-700'
    : isWarning
    ? 'bg-yellow-600 hover:bg-yellow-700'
    : 'bg-blue-600 hover:bg-blue-700';

  const getMessage = () => {
    if (trialDaysRemaining === 0) {
      return 'Your free trial ends today';
    } else if (trialDaysRemaining === 1) {
      return 'Your free trial ends tomorrow';
    } else {
      return `Your free trial ends in ${trialDaysRemaining} days`;
    }
  };

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 shadow-sm transition-all duration-200',
        bgColor,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⏰</span>
            <h3 className={cn('font-semibold', textColor)}>{getMessage()}</h3>
          </div>
          <p className={cn('text-sm', textColor)}>
            {trialDaysRemaining <= 2
              ? 'Upgrade now to continue accessing all AI advisor features without interruption.'
              : 'Upgrade to a paid plan to keep enjoying unlimited access to your AI Board of Directors.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold text-white text-sm',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                buttonColor
              )}
            >
              Upgrade Now
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className={cn(
              'p-1 rounded hover:bg-black hover:bg-opacity-5',
              'transition-colors duration-150',
              accentColor
            )}
            aria-label="Dismiss banner"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

      {/* Progress bar showing time remaining */}
      <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            isUrgent ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'
          )}
          style={{
            width: `${Math.max(0, Math.min(100, (trialDaysRemaining / 7) * 100))}%`,
          }}
        />
      </div>
    </div>
  );
};
