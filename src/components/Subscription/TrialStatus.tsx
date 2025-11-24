import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { cn } from '../../utils';

interface TrialStatusProps {
  className?: string;
  compact?: boolean;
}

export const TrialStatus: React.FC<TrialStatusProps> = ({ className, compact = false }) => {
  const { isTrialActive, trialDaysRemaining, currentTier } = useSubscription();

  // Don't show if trial is not active
  if (!isTrialActive) {
    return null;
  }

  const isUrgent = trialDaysRemaining <= 2;
  const isWarning = trialDaysRemaining <= 5 && trialDaysRemaining > 2;

  const badgeColor = isUrgent
    ? 'bg-red-100 text-red-700 border-red-300'
    : isWarning
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
      : 'bg-blue-100 text-blue-700 border-blue-300';

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
          badgeColor,
          className
        )}
      >
        <span>⏰</span>
        <span>{trialDaysRemaining}d left</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border',
        badgeColor,
        className
      )}
    >
      <span>⏰</span>
      <span>
        Trial: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining
      </span>
    </div>
  );
};
