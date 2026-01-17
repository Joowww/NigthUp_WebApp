// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
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
      
      const seen = new Map<string, FriendNotification>();
      
      data.notifications.forEach((notification) => {
        const key = `${notification.friendshipId}-${notification.type}`;
        
        if (!seen.has(key)) {
          seen.set(key, notification);
        } else {
          const existing = seen.get(key)!;
          const current = new Date(notification.createdAt).getTime();
          const existingTime = new Date(existing.createdAt).getTime();
          
          if (current > existingTime) {
            seen.set(key, notification);
          }
        }
      });
      
      const uniqueNotifications = Array.from(seen.values());
      
      setNotifications(uniqueNotifications);
      
      const actualUnreadCount = uniqueNotifications.filter(n => !n.read).length;
      setUnreadCount(actualUnreadCount);
      
      console.log('📬 [useNotifications] Notificaciones cargadas:', {
        total: data.notifications.length,
        unique: uniqueNotifications.length,
        unread: actualUnreadCount 
      });
    } catch (error) {
      console.error('❌ [useNotifications] Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('📉 [markAsRead] Contador decrementado:', prev, '→', newCount);
        return newCount;
      });
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
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (notificationId.startsWith('temp-')) {
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
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(c => {
            const newCount = Math.max(0, c - 1);
            console.log('📉 [deleteNotification] Contador decrementado:', c, '→', newCount);
            return newCount;
          });
        }
        return prev.filter(n => n._id !== notificationId);
      });

      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      loadNotifications();
    }
  }, [loadNotifications]);

  // ✅ CARGAR NOTIFICACIONES AL MONTAR
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
    setNotifications, 
    setUnreadCount    
  };
}