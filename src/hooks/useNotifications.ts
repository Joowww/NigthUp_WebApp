// src/hooks/useNotifications.ts (NUEVO ARCHIVO)

import { useState, useEffect, useCallback } from 'react';
import { notificationService, type FriendNotification } from '../features/friendship/notificationService';
import { socketService } from '../lib/socket';
import { useAuth } from './useAuth';

export function useNotifications() {
  const [notifications, setNotifications] = useState<FriendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Cargar notificaciones iniciales
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      console.log('📬 [useNotifications] Notificaciones cargadas:', data);
    } catch (error) {
      console.error('❌ [useNotifications] Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar solo el contador
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Error cargando contador:', error);
    }
  }, []);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
    }
  }, []);

  // Escuchar eventos de socket
  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();

    // Escuchar nueva solicitud recibida
    socketService.onFriendRequestReceived((data) => {
      console.log('📬 [Socket] Nueva solicitud recibida:', data);
      
      // Añadir notificación al principio
      const newNotification: FriendNotification = {
        _id: `temp-${Date.now()}`, // Temporal, se reemplazará al recargar
        recipient: user.id,
        sender: data.sender,
        type: 'friend_request',
        friendshipId: data.friendshipId,
        read: false,
        createdAt: data.timestamp,
        updatedAt: data.timestamp
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Escuchar solicitud aceptada
    socketService.onFriendRequestAcceptedNotification((data) => {
      console.log('✅ [Socket] Solicitud aceptada:', data);
      
      const newNotification: FriendNotification = {
        _id: `temp-${Date.now()}`,
        recipient: user.id,
        sender: data.accepter,
        type: 'friend_accepted',
        friendshipId: data.friendshipId,
        read: false,
        createdAt: data.timestamp,
        updatedAt: data.timestamp
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Escuchar solicitud cancelada
    socketService.onFriendRequestCancelledNotification((data) => {
      console.log('❌ [Socket] Solicitud cancelada:', data);
      
      // Eliminar notificación de la lista
      setNotifications(prev => {
        const notification = prev.find(n => n.friendshipId === data.friendshipId);
        if (notification && !notification.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n.friendshipId !== data.friendshipId);
      });
    });

    return () => {
      socketService.offFriendshipEvents();
    };
  }, [user?.id, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications
  };
}