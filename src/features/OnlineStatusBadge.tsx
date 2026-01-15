// src/features/OnlineStatusBadge.tsx 
import React from 'react';
import { useOnlineUsers } from '../context/OnlineUsersContext';

interface OnlineStatusBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showOffline?: boolean;
  className?: string;
}

export const OnlineStatusBadge: React.FC<OnlineStatusBadgeProps> = ({ 
  userId, 
  size = 'md',
  showOffline = false,
  className = ''
}) => {
  const { isUserOnline } = useOnlineUsers();
  const online = isUserOnline(userId);

  // ✅ LOGS DE DEBUG (puedes quitarlos después)
  console.log('🎯 [OnlineStatusBadge] userId:', userId, 'isOnline:', online);

  if (!online && !showOffline) {
    console.log('❌ [OnlineStatusBadge] No se muestra (offline y showOffline=false)');
    return null;
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span 
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        block
        ${online ? 'bg-green-500' : 'bg-gray-500'}
        ${online ? 'ring-2 ring-white' : ''}
        ${online ? 'animate-pulse' : ''}
        ${className}
      `}
      title={online ? 'Online' : 'Offline'}
    />
  );
};