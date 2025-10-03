import React from 'react';
import { cn } from '../../utils';

interface AvatarProps {
  avatar_emoji?: string;
  avatar_image?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-16 h-16 text-2xl'
};

export const Avatar: React.FC<AvatarProps> = ({
  avatar_emoji = '👤',
  avatar_image,
  name = 'Advisor',
  size = 'md',
  className = ''
}) => {
  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200`;

  if (avatar_image) {
    return (
      <img
        src={avatar_image}
        alt={`${name} avatar`}
        className={cn(baseClasses, 'object-cover', className)}
        onError={(e) => {
          // Fallback to emoji if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLDivElement;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div className={cn(baseClasses, className)}>
      {avatar_emoji}
    </div>
  );
};