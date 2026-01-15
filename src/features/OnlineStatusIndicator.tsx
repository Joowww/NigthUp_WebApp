// src/components/OnlineStatusIndicator.tsx
import React from 'react';
import { useOnlineUsers } from '../context/OnlineUsersContext';

interface OnlineStatusIndicatorProps {
  userId: string;
  showText?: boolean;
  className?: string;
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ 
  userId, 
  showText = true,
  className = ''
}) => {
  const { isUserOnline } = useOnlineUsers();
  const online = isUserOnline(userId);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span 
        className={`
          w-2 h-2 rounded-full 
          ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}
        `}
      />
      {showText && (
        <span className={`text-xs ${online ? 'text-green-500' : 'text-gray-500'}`}>
          {online ? 'Activo ahora' : 'Desconectado'}
        </span>
      )}
    </div>
  );
};