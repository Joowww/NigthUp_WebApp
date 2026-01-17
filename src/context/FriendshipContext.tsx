// src/context/FriendshipContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

export type FriendshipStatusType = 
  | 'none' 
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

interface FriendshipUpdate {
  userId: string;
  status: FriendshipStatusType;
  friendshipId: string | null;
}

interface FriendshipContextType {
  friendshipUpdates: Map<string, FriendshipUpdate>;
  updateFriendship: (userId: string, status: FriendshipStatusType, friendshipId: string | null) => void;
  getFriendshipStatus: (userId: string, fallbackStatus?: FriendshipStatusType) => FriendshipUpdate;
}

const FriendshipContext = createContext<FriendshipContextType | undefined>(undefined);

export function FriendshipProvider({ children }: { children: React.ReactNode }) {
  const [friendshipUpdates, setFriendshipUpdates] = useState(new Map<string, FriendshipUpdate>());

  /**
   * Actualiza el estado de amistad de un usuario en la app.
   * Este contexto actúa como fuente reactiva para sobreescribir el backend en la UI.
   */
  const updateFriendship = useCallback((userId: string, status: FriendshipStatusType, friendshipId: string | null) => {
    setFriendshipUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, { userId, status, friendshipId });
      console.log('🔄 [FriendshipContext] Actualizado:', userId, status);
      return newMap;
    });
  }, []);


  const getFriendshipStatus = useCallback((userId: string, fallbackStatus: FriendshipStatusType = 'none'): FriendshipUpdate => {
    const update = friendshipUpdates.get(userId);
    if (update) return update;
    return { userId, status: fallbackStatus, friendshipId: null };
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
