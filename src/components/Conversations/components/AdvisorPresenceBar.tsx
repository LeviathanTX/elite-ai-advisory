import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../../Common/Avatar';
import { cn } from '../../../utils';
import { CelebrityAdvisor, CustomAdvisor } from '../../../types';

type Advisor = CelebrityAdvisor | CustomAdvisor;

interface AdvisorPresenceBarProps {
  advisors: Advisor[];
  speakingAdvisorId?: string | null;
  typingAdvisorId?: string | null;
  onAdvisorClick?: (advisorId: string) => void;
  className?: string;
}

type AdvisorState = 'speaking' | 'typing' | 'idle';

const AdvisorPresenceCard = memo(function AdvisorPresenceCard({
  advisor,
  state,
  onClick,
  isCompact = false,
}: {
  advisor: Advisor;
  state: AdvisorState;
  onClick?: () => void;
  isCompact?: boolean;
}) {
  const variants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
  };

  return (
    <motion.button
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300',
        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        state === 'speaking' && 'bg-amber-50 ring-2 ring-amber-400',
        state === 'typing' && 'bg-blue-50 ring-2 ring-blue-400',
        isCompact ? 'min-w-[60px]' : 'min-w-[80px]'
      )}
      aria-label={`${advisor.name} is ${state === 'speaking' ? 'speaking' : state === 'typing' ? 'typing' : 'ready'}`}
    >
      {/* Avatar Container */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            state === 'speaking' && 'ring-2 ring-amber-400 ring-offset-2',
            state === 'typing' && 'ring-2 ring-blue-400 ring-offset-2',
            state === 'idle' && 'opacity-80'
          )}
        >
          <Avatar
            avatar_url={(advisor as CelebrityAdvisor).avatar_url}
            avatar_image={(advisor as CustomAdvisor).avatar_image}
            avatar_emoji={(advisor as CelebrityAdvisor).avatar_emoji}
            name={advisor.name}
            size={isCompact ? 'md' : 'lg'}
          />
        </div>

        {/* Speaking Pulse Animation */}
        <AnimatePresence>
          {state === 'speaking' && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400"
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            />
          )}
        </AnimatePresence>

        {/* Typing Indicator */}
        {state === 'typing' && (
          <div className="absolute -bottom-1 -right-1 flex gap-0.5 bg-white rounded-full p-1 shadow-sm">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                animate={{ y: [-2, 2, -2] }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}

        {/* Online Status Indicator */}
        {state === 'idle' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
        )}
      </div>

      {/* Name & Status */}
      <div className="text-center mt-1">
        <p
          className={cn(
            'font-medium text-xs truncate max-w-[70px]',
            state === 'speaking' && 'text-amber-700',
            state === 'typing' && 'text-blue-700',
            state === 'idle' && 'text-gray-700'
          )}
        >
          {advisor.name.split(' ')[0]}
        </p>
        {!isCompact && (
          <p
            className={cn(
              'text-[10px] font-medium',
              state === 'speaking' && 'text-amber-600',
              state === 'typing' && 'text-blue-600',
              state === 'idle' && 'text-gray-400'
            )}
          >
            {state === 'speaking' ? 'Speaking' : state === 'typing' ? 'Typing...' : 'Ready'}
          </p>
        )}
      </div>
    </motion.button>
  );
});

export const AdvisorPresenceBar = memo(function AdvisorPresenceBar({
  advisors,
  speakingAdvisorId,
  typingAdvisorId,
  onAdvisorClick,
  className,
}: AdvisorPresenceBarProps) {
  const getAdvisorState = (advisorId: string): AdvisorState => {
    if (typingAdvisorId === advisorId) return 'typing';
    if (speakingAdvisorId === advisorId) return 'speaking';
    return 'idle';
  };

  // Determine if we're on mobile (simplified check - could use a hook for real implementation)
  const isCompact = typeof window !== 'undefined' && window.innerWidth < 640;

  if (advisors.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm',
        className
      )}
      role="region"
      aria-label="Active advisors in conversation"
    >
      <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto">
        {/* Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-gray-600">
            {advisors.length === 1 ? 'Advisor' : 'Advisors'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300 flex-shrink-0" />

        {/* Advisor Cards */}
        <AnimatePresence mode="popLayout">
          <div className="flex gap-2">
            {advisors.map(advisor => (
              <AdvisorPresenceCard
                key={advisor.id}
                advisor={advisor}
                state={getAdvisorState(advisor.id)}
                onClick={() => onAdvisorClick?.(advisor.id)}
                isCompact={isCompact}
              />
            ))}
          </div>
        </AnimatePresence>

        {/* Active indicator summary */}
        {(speakingAdvisorId || typingAdvisorId) && (
          <div className="ml-auto flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                speakingAdvisorId ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              )}
            >
              {speakingAdvisorId
                ? `${advisors.find(a => a.id === speakingAdvisorId)?.name?.split(' ')[0]} is speaking`
                : `${advisors.find(a => a.id === typingAdvisorId)?.name?.split(' ')[0]} is responding...`}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
});

export default AdvisorPresenceBar;
