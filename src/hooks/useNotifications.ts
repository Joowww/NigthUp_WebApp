// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import { notificationService, type FriendNotification } from '../features/friendship/notificationService';
import { socketService } from '../lib/socket';
import { useAuth } from './useAuth';
import { useFriendshipContext } from '../context/FriendshipContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<FriendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { updateFriendship } = useFriendshipContext();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      
      // ✅ ELIMINAR DUPLICADOS por friendshipId
      const uniqueNotifications = data.notifications.reduce((acc, current) => {
        const exists = acc.find(n => n.friendshipId === current.friendshipId && n.type === current.type);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, [] as FriendNotification[]);
      
      setNotifications(uniqueNotifications);
      setUnreadCount(uniqueNotifications.filter(n => !n.read).length); // ✅ CONTAR correctamente
      
      console.log('📬 [useNotifications] Notificaciones cargadas:', {
        total: data.notifications.length,
        unique: uniqueNotifications.length,
        unread: uniqueNotifications.filter(n => !n.read).length
      });
    } catch (error) {
      console.error('❌ [useNotifications] Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      console.log('🔢 [useNotifications] Contador actualizado:', count);
    } catch (error) {
      console.error('❌ Error cargando contador:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('✅ [useNotifications] Notificación marcada como leída:', notificationId);
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
      console.log('✅ [useNotifications] Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    // ✅ VALIDAR que NO sea un ID temporal
    if (notificationId.startsWith('temp-')) {
      console.warn('⚠️ Intentando eliminar notificación temporal, solo eliminando del estado');
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
      return;
    }

    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
      
      console.log('🗑️ [useNotifications] Notificación eliminada:', notificationId);
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
  
    console.log('🔌 [useNotifications] Conectando listeners de socket para:', user.id);
    
    loadNotifications();
  
    // ✅ NUEVA SOLICITUD RECIBIDA
    socketService.onFriendRequestReceived((data) => {
      console.log('📬 [Socket] Nueva solicitud recibida:', data);
      loadNotifications();
      updateFriendship(data.sender._id, 'pending_received', data.friendshipId);
    });
  
    // ✅ SOLICITUD ACEPTADA
    socketService.onFriendRequestAcceptedNotification((data) => {
      console.log('✅ [Socket] Solicitud aceptada:', data);
      loadNotifications();
      updateFriendship(data.accepter._id, 'friends', data.friendshipId);
    });
  
    // ✅ SOLICITUD CANCELADA
    socketService.onFriendRequestCancelledNotification((data) => {
      console.log('❌ [Socket] Solicitud cancelada:', data);
      
      setNotifications(prev => {
        const filtered = prev.filter(n => n.friendshipId !== data.friendshipId);
        const newUnreadCount = filtered.filter(n => !n.read).length;
        setUnreadCount(newUnreadCount);
        return filtered;
      });
      
      updateFriendship(data.senderId, 'none', null);
    });
  
    // ✅ AMIGO ELIMINADO (NUEVO)
  socketService.onFriendRemovedNotification((data) => {
    console.log('🗑️ [Socket] Amigo eliminado:', data);
    
    // Actualizar contexto - Ya no son amigos
    const removerId = data.removedBy._id || data.removedBy;
    updateFriendship(removerId, 'none', null);
    
    // Recargar notificaciones por si había alguna pendiente
    loadNotifications();
  });

  return () => {
    console.log('🧹 [useNotifications] Limpiando listeners de socket');
    socketService.offFriendshipEvents();
  };
}, [user?.id, loadNotifications, updateFriendship]);

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