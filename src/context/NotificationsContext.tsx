// src/context/NotificationsContext.tsx

import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
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
  const { socket, connected } = useSocket(); // ✅ Usar hook para saber el estado real
  const { updateFriendship } = useFriendshipContext();

  // ✅ LISTENERS GLOBALES DE SOCKET (se ejecutan en toda la app)
  useEffect(() => {
    // 🔴 IMPORTANTE: Solo registrar si el usuario está autenticado Y el socket está conectado
    if (!user?.id || !connected) {
      if (!connected && user?.id) {
        console.log('⏳ [NotificationsProvider] Esperando a que el socket conecte...');
      }
      return;
    }

    console.log('🔌 [NotificationsProvider] Socket LISTO. Configurando listeners globales...');

    // ✅ 1. NUEVA SOLICITUD RECIBIDA (Para el Receptor)
    const handleFriendRequestReceived = (data: any) => {
      console.log('📬 [Socket Global] Nueva solicitud recibida:', data);

      // Crear notificación temporal optimista
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

      notificationsData.setNotifications(prev => [newNotification, ...prev]);
      notificationsData.setUnreadCount(prev => prev + 1);

      const senderId = data.sender._id || data.sender;
      updateFriendship(senderId.toString(), 'pending_received', data.friendshipId);

      setTimeout(() => notificationsData.refresh(), 2000);
    };

    // ✅ 2. SOLICITUD ACEPTADA (Para el Solicitante original)
    const handleFriendRequestAccepted = (data: any) => {
      console.log('✅ [Socket Global] Solicitud aceptada por otro usuario:', data);

      const newNotification: FriendNotification = {
        _id: `temp-accepted-${Date.now()}`,
        recipient: user?.id || '',
        sender: data.accepter,
        type: 'friend_accepted',
        friendshipId: data.friendshipId,
        read: false,
        createdAt: new Date(data.timestamp || Date.now()),
        updatedAt: new Date(data.timestamp || Date.now())
      };

      notificationsData.setNotifications(prev => [newNotification, ...prev]);
      notificationsData.setUnreadCount(prev => prev + 1);

      const accepterId = (data.accepter._id || data.accepter).toString();
      updateFriendship(accepterId, 'friends', data.friendshipId);
    };

    // ✅ 3. SOLICITUD CANCELADA/RECHAZADA (Para cualquiera de los dos)
    const handleFriendRequestCancelled = (data: any) => {
      console.log('❌ [Socket Global] Solicitud cancelada por el otro:', data);
      notificationsData.setNotifications(prev => {
        const filtered = prev.filter(n => n.friendshipId !== data.friendshipId);
        notificationsData.setUnreadCount(filtered.filter(n => !n.read).length);
        return filtered;
      });
      updateFriendship(data.senderId, 'none', null);
    };

    // ✅ 4. AMIGO ELIMINADO (Para el que fue eliminado)
    const handleFriendRemoved = (data: any) => {
      console.log('🗑️ [Socket Global] Amigo eliminado por el otro:', data);
      const removerId = data.removedBy._id || data.removedBy;
      updateFriendship(removerId.toString(), 'none', null);
      notificationsData.refresh();
    };

    // ==============================================================
    // 🔄 SINCRONIZACIÓN ENTRE TABS (Confirmaciones del servidor)
    // ==============================================================

    const handleSentConfirmation = (data: any) => {
      console.log('🔄 [Socket Sync] Sincronizando solicitud enviada en otra tab');
      updateFriendship(data.recipientId.toString(), 'pending_sent', data.friendshipId);
    };

    const handleAcceptedConfirmation = (data: any) => {
      console.log('🔄 [Socket Sync] Sincronizando solicitud aceptada en otra tab');
      updateFriendship(data.requesterId.toString(), 'friends', data.friendshipId);

      // ✅ 1. Limpiar notificación localmente de forma inmediata
      notificationsData.setNotifications(prev => {
        const filtered = prev.filter(n => n.friendshipId !== data.friendshipId);
        // Recalcular contador de no leídas
        const newUnread = filtered.filter(n => !n.read).length;
        notificationsData.setUnreadCount(newUnread);
        return filtered;
      });

      // ✅ 2. Refrescar del servidor para asegurar consistencia
      notificationsData.refresh();
    };

    const handleCancelledConfirmation = (data: any) => {
      console.log('🔄 [Socket Sync] Sincronizando cancelación en otra tab');
      updateFriendship(data.targetId.toString(), 'none', null);

      // ✅ Limpiar notificación localmente
      notificationsData.setNotifications(prev => {
        const filtered = prev.filter(n => n.friendshipId !== data.friendshipId);
        const newUnread = filtered.filter(n => !n.read).length;
        notificationsData.setUnreadCount(newUnread);
        return filtered;
      });

      notificationsData.refresh();
    };

    const handleRemovedConfirmation = (data: any) => {
      console.log('🔄 [Socket Sync] Sincronizando eliminación en otra tab');
      updateFriendship(data.friendId.toString(), 'none', null);
    };

    // REGISTRAR TODO
    socket.onFriendRequestReceived(handleFriendRequestReceived);
    socket.onFriendRequestAcceptedNotification(handleFriendRequestAccepted);
    socket.onFriendRequestCancelledNotification(handleFriendRequestCancelled);
    socket.onFriendRemovedNotification(handleFriendRemoved);

    // Sync tabs
    socket.onFriendRequestSentConfirmation(handleSentConfirmation);
    socket.onFriendRequestAcceptedConfirmation(handleAcceptedConfirmation);
    socket.onFriendRequestCancelledConfirmation(handleCancelledConfirmation);
    socket.onFriendRemovedConfirmation(handleRemovedConfirmation);

    return () => {
      console.log('🧹 [NotificationsProvider] Limpiando listeners');
      socket.offFriendshipEvents();
    };
  }, [user?.id, connected, socket, updateFriendship, notificationsData.refresh]);

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