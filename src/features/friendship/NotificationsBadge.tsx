// src/features/friendship/NotificationBadge.tsx (NUEVO ARCHIVO)

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span className={`
      absolute -top-1 -right-1 
      flex items-center justify-center
      min-w-[18px] h-[18px] 
      px-1
      text-[10px] font-bold 
      text-white 
      bg-red-500 
      rounded-full 
      border-2 border-background
      animate-in zoom-in-50
      ${className}
    `}>
      {count > 99 ? '99+' : count}
    </span>
  );
}