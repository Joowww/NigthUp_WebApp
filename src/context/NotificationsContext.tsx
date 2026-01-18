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
      console.log('📬 [Socket Global] Nueva solicitud recibida (HANDLER):', JSON.stringify(data, null, 2));

      // 1. Crear notificación temporal optimista
      const newNotification: FriendNotification = {
        _id: `temp-${Date.now()}`,
        recipient: user?.id || '',
        sender: data.sender,
        type: 'friend_request',
        friendshipId: data.friendshipId,
        read: false,
        createdAt: new Date(data.timestamp || Date.now()),
        updatedAt: new Date(data.timestamp || Date.now())
      };

      // 2. Actualizar estado y contador inmediatamente
      notificationsData.setNotifications(prev => [newNotification, ...prev]);
      notificationsData.setUnreadCount(prev => prev + 1);

      // 3. Refrescar del servidor (con delay para evitar condiciones de carrera)
      setTimeout(() => {
        notificationsData.refresh();
      }, 2000);

      // 4. Actualizar contexto de amistad
      updateFriendship(data.sender._id, 'pending_received', data.friendshipId);
    };

    // ✅ SOLICITUD ACEPTADA
    const handleFriendRequestAccepted = (data: any) => {
      console.log('✅ [Socket Global] Solicitud aceptada:', data);

      // 1. Crear notificación visual para el usuario (Requester)
      // Esto asegura que reciba feedback visual y se incremente el contador del sidebar
      const newNotification: FriendNotification = {
        _id: `temp-accepted-${Date.now()}`,
        recipient: user?.id || '',
        sender: data.accepter, // El que aceptó es el "sender" de esta notificación
        type: 'friend_accepted',
        friendshipId: data.friendshipId,
        read: false,
        createdAt: new Date(data.timestamp || Date.now()),
        updatedAt: new Date(data.timestamp || Date.now())
      };

      // 2. Actualizar estado y contador
      notificationsData.setNotifications(prev => [newNotification, ...prev]);
      notificationsData.setUnreadCount(prev => prev + 1);

      // 3. ✅ ACTUALIZAR CONTEXTO - ESTO ACTUALIZA LA CARD
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

    // 🔍 DEBUG: Escuchar cualquier evento
    const socket = socketService.getSocket();
    if (socket) {
      socket.onAny((event, ...args) => {
        console.log(`🔍 [Socket DEBUG] Evento recibido: ${event}`, args);
      });
    }

    // ✅ CLEANUP
    return () => {
      console.log('🧹 [NotificationsProvider] Limpiando listeners globales');
      socketService.offFriendshipEvents();
    };
  }, [user?.id, notificationsData.refresh, updateFriendship]);

  // ✅ POLLING FALLBACK (Cada 30s)
  // Asegura que las notificaciones lleguen incluso si falla el socket
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      console.log('⏰ [NotificationsProvider] Polling notifications...');
      notificationsData.refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, notificationsData.refresh]);

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