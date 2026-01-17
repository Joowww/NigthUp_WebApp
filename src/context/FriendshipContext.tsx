// src/context/FriendshipContext.tsx (NUEVO ARCHIVO)

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FriendshipUpdate {
  userId: string;
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
  friendshipId: string | null;
}

interface FriendshipContextType {
  friendshipUpdates: Map<string, FriendshipUpdate>;
  updateFriendship: (userId: string, status: FriendshipUpdate['status'], friendshipId: string | null) => void;
  getFriendshipStatus: (userId: string) => FriendshipUpdate | undefined;
}

const FriendshipContext = createContext<FriendshipContextType | undefined>(undefined);

export function FriendshipProvider({ children }: { children: React.ReactNode }) {
  const [friendshipUpdates, setFriendshipUpdates] = useState(new Map<string, FriendshipUpdate>());

  const updateFriendship = useCallback((userId: string, status: FriendshipUpdate['status'], friendshipId: string | null) => {
    setFriendshipUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, { userId, status, friendshipId });
      console.log('🔄 [FriendshipContext] Actualizado:', userId, status);
      return newMap;
    });
  }, []);

  const getFriendshipStatus = useCallback((userId: string) => {
    return friendshipUpdates.get(userId);
  }, [friendshipUpdates]);

  return (
    <FriendshipContext.Provider value={{ friendshipUpdates, updateFriendship, getFriendshipStatus }}>
      {children}
    </FriendshipContext.Provider>
  );
}

export function useFriendshipContext() {
  const context = useContext(FriendshipContext);
  if (!context) {
    throw new Error('useFriendshipContext must be used within FriendshipProvider');
  }
  return context;
}