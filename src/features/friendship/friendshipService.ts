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
   * Obtener usuarios sugeridos (ADAPTADO para usar /api/user)
   */
  getSuggestedUsers: async (limit = 20): Promise<PublicUser[]> => {
    try {
      // ✅ USAR ENDPOINT EXISTENTE /api/user
      const response = await api.get(`/user?skip=0&limit=${limit}`);
      
      // El backend puede devolver { users: [...] } o directamente [...]
      const users = response.data.users || response.data;
      
      // Filtrar para excluir usuarios sin intereses o ciudad (opcional)
      return users.filter((user: PublicUser) => 
        user.intereses && user.intereses.length > 0
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los usuarios (para búsqueda local)
   */
  getAllUsers: async (skip = 0, limit = 100): Promise<PublicUser[]> => {
    try {
      const response = await api.get(`/user?skip=${skip}&limit=${limit}`);
      return response.data.users || response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
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

  // ==================== SOLICITUDES DE AMISTAD ====================

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
      
      // Si el backend devuelve solo received, adaptar
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

  // ==================== AMIGOS ====================

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
 * Buscar usuarios para amistad (backend-driven)
 */
searchUsers: async (query: string): Promise<SearchUser[]> => {
    try {
      const response = await api.get('/friendship/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },
  
};