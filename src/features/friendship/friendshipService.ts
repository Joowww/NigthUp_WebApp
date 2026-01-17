// src/features/friendship/friendshipService.ts
import api from '../../api';
import type { 
  PublicUser, 
  Friendship, 
  PublicProfileResponse, 
  FriendshipStatusResponse,
  PendingRequestsResponse,
  SearchUser
} from '../../modules/friendship';

export const friendshipService = {
  // ==================== BÚSQUEDA Y DESCUBRIMIENTO ====================

  /**
   * Buscar usuarios con filtros completos
   */
  searchUsers: async (
    query: string = '',
    limit: number = 20,
    skip: number = 0,
    city: string = '',
    interest: string = '',
    gender: string = '',
    onlineOnly: boolean = false
  ): Promise<SearchUser[]> => {
    try {
      const params = new URLSearchParams();
      
      // Solo añadir parámetros si tienen valor
      if (query.trim()) params.append('search', query.trim());
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());
      if (city.trim()) params.append('city', city.trim());
      if (interest.trim()) params.append('interest', interest.trim());
      if (gender.trim()) params.append('gender', gender.trim());
      if (onlineOnly) params.append('onlineOnly', 'true');

      console.log('🌐 [friendshipService] GET /friendship/search?' + params.toString());

      const response = await api.get(`/friendship/search?${params.toString()}`);

      console.log('📦 [friendshipService] Respuesta:', response.data.length, 'usuarios');

      return response.data;
    } catch (error) {
      console.error('❌ [friendshipService] Error searching users:', error);
      throw error;
    }
  },

  /**
   * Obtener opciones únicas para filtros
   */
  getFilterOptions: async (): Promise<{ cities: string[], interests: string[] }> => {
    try {
      console.log('🌐 [friendshipService] GET /friendship/filter-options');
      const response = await api.get('/friendship/filter-options');
      return response.data;
    } catch (error) {
      console.error('❌ [friendshipService] Error fetching filter options:', error);
      return { cities: [], interests: [] };
    }
  },

  /**
   * Enviar solicitud de amistad
   */
  sendFriendRequest: async (recipientId: string): Promise<Friendship> => {
    try {
      const response = await api.post('/friendship/request', { recipientId });
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitudes pendientes
   */
  getPendingRequests: async (): Promise<PendingRequestsResponse> => {
    try {
      const response = await api.get('/friendship/pending');
      
      if (Array.isArray(response.data)) {
        return {
          sent: [],
          received: response.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  /**
   * Aceptar solicitud de amistad
   */
  acceptFriendRequest: async (friendshipId: string): Promise<Friendship> => {
    try {
      const response = await api.patch(`/friendship/request/${friendshipId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  /**
   * Rechazar solicitud de amistad
   */
  rejectFriendRequest: async (friendshipId: string): Promise<void> => {
    try {
      await api.delete(`/friendship/request/${friendshipId}/reject`);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  },

  /**
   * Obtener lista de amigos
   */
  getFriends: async (): Promise<PublicUser[]> => {
    try {
      const response = await api.get('/friendship/friends');
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  },

  /**
   * Verificar estado de amistad con un usuario
   */
  getFriendshipStatus: async (userId: string): Promise<FriendshipStatusResponse> => {
    try {
      const response = await api.get(`/friendship/status/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching friendship status:', error);
      throw error;
    }
  },

  /**
   * Eliminar amigo
   */
  removeFriend: async (friendshipId: string): Promise<void> => {
    try {
      await api.delete(`/friendship/friend/${friendshipId}`);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  },

  /**
   * Bloquear usuario
   */
  blockUser: async (userId: string): Promise<void> => {
    try {
      await api.post('/friendship/block', { blockedUserId: userId });
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil público de un usuario
   */
  getPublicProfile: async (username: string): Promise<PublicProfileResponse> => {
    try {
      const response = await api.get(`/user/profile/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public profile:', error);
      throw error;
    }
  },
  sendFriendRequestV2: async (recipientId: string): Promise<any> => {
    try {
      const response = await api.post('/friendship/v2/request', { recipientId });
      return response.data;
    } catch (error) {
      console.error('Error sending friend request V2:', error);
      throw error;
    }
  },

  /**
   * Obtener amigos en común
   */
  getMutualFriends: async (userId: string, limit = 10): Promise<PublicUser[]> => {
    try {
      const response = await api.get(`/friendship/mutual/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mutual friends:', error);
      return [];
    }
  },

  /**
   * Aceptar solicitud de amistad V2
   */
  acceptFriendRequestV2: async (friendshipId: string): Promise<any> => {
    try {
      const response = await api.patch(`/friendship/v2/request/${friendshipId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting friend request V2:', error);
      throw error;
    }
  },

  /**
   * Cancelar solicitud de amistad V2
   */
  cancelFriendRequestV2: async (friendshipId: string): Promise<void> => {
    try {
      await api.delete(`/friendship/v2/request/${friendshipId}/cancel`);
    } catch (error) {
      console.error('Error canceling friend request V2:', error);
      throw error;
    }
  },

  getMyFriends: async (): Promise<PublicUser[]> => {
    return friendshipService.getFriends();
  },

  getFriendsV2: async (): Promise<PublicUser[]> => {
    try {
      const response = await api.get('/friendship/friends/v2');
      console.log('📋 [getFriendsV2] Amigos recibidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching friends V2:', error);
      return [];
    }
  }

};