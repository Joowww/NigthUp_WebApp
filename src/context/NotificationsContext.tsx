// src/context/NotificationsContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { socketService } from '../lib/socket';
import { useAuth } from '../hooks/useAuth';
import { useFriendshipContext } from './FriendshipContext';
import type { FriendNotification } from '../features/friendship/notificationService';

interface NotificationsContextType {
  notifications: FriendNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<FriendNotification[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const notificationsData = useNotifications();
  const { user } = useAuth();
  const { updateFriendship } = useFriendshipContext();

  // ✅ LISTENERS GLOBALES DE SOCKET (se ejecutan en toda la app)
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔌 [NotificationsProvider] Configurando listeners globales para:', user.id);

    // ✅ NUEVA SOLICITUD RECIBIDA
    const handleFriendRequestReceived = (data: any) => {
      console.log('📬 [Socket Global] Nueva solicitud recibida:', data);
      
      // Refrescar notificaciones
      notificationsData.refresh();
      
      // Actualizar contexto de amistad
      updateFriendship(data.sender._id, 'pending_received', data.friendshipId);
    };

    // ✅ SOLICITUD ACEPTADA
    const handleFriendRequestAccepted = (data: any) => {
        console.log('✅ [Socket Global] Solicitud aceptada:', data);
        
        // 1. Refrescar notificaciones
        notificationsData.refresh();
        
        // 2. ✅ ACTUALIZAR CONTEXTO
        // ⚠️ CAMBIO IMPORTANTE: Debe ser data.accepter (quien aceptó), NO data.requester
        const accepterId = typeof data.accepter === 'string' ? data.accepter : data.accepter._id;
        updateFriendship(accepterId, 'friends', data.friendshipId);
        
        console.log('✅ [NotificationsProvider] Ahora son amigos:', accepterId);
      };

    // ✅ SOLICITUD CANCELADA
    const handleFriendRequestCancelled = (data: any) => {
      console.log('❌ [Socket Global] Solicitud cancelada:', data);
      
      // Eliminar notificación
      notificationsData.setNotifications(prev => {
        const filtered = prev.filter(n => n.friendshipId !== data.friendshipId);
        const newUnreadCount = filtered.filter(n => !n.read).length;
        notificationsData.setUnreadCount(newUnreadCount);
        return filtered;
      });
      
      // Actualizar contexto
      updateFriendship(data.senderId, 'none', null);
    };

    // ✅ AMIGO ELIMINADO
    const handleFriendRemoved = (data: any) => {
      console.log('🗑️ [Socket Global] Amigo eliminado:', data);
      const removerId = data.removedBy._id || data.removedBy;
      updateFriendship(removerId, 'none', null);
      notificationsData.refresh();
    };

    // ✅ REGISTRAR LISTENERS
    socketService.onFriendRequestReceived(handleFriendRequestReceived);
    socketService.onFriendRequestAcceptedNotification(handleFriendRequestAccepted);
    socketService.onFriendRequestCancelledNotification(handleFriendRequestCancelled);
    socketService.onFriendRemovedNotification(handleFriendRemoved);

    // ✅ CLEANUP
    return () => {
      console.log('🧹 [NotificationsProvider] Limpiando listeners globales');
      socketService.offFriendshipEvents();
    };
  }, [user?.id, notificationsData.refresh, updateFriendship]);

  return (
    <NotificationsContext.Provider value={notificationsData}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  return context;
}