// src/services/notificationService.ts (NUEVO ARCHIVO)
import api from '../../api';

export interface FriendNotification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  type: 'friend_request' | 'friend_accepted' | 'friend_rejected';
  friendshipId: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsResponse {
  notifications: FriendNotification[];
  unreadCount: number;
}

export const notificationService = {
  /**
   * Obtener todas las notificaciones
   */
  getNotifications: async (): Promise<NotificationsResponse> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Obtener contador de no leídas
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Marcar como leída
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  /**
   * Marcar todas como leídas
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Eliminar notificación
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};