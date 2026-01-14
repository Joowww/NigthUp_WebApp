import api from '../../api';

export const userService = {
  // ✅ Obtener perfil del usuario autenticado
  getMyProfile: async () => {
    try {
      const response = await api.get('/user/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  },

  // ✅ Obtener eventos del usuario por IDs
  getMyEvents: async (eventIds: string[]) => {
    try {
      if (!eventIds || eventIds.length === 0) {
        return [];
      }
      
      const eventPromises = eventIds.map(id => api.get(`/event/${id}`));
      const responses = await Promise.all(eventPromises);
      return responses.map(res => res.data);
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  },

  // ✅ ACTUALIZAR - Extraer el usuario de la respuesta del backend
  updateMyProfile: async (data: any) => {
    try {
      const response = await api.patch('/user/me', data);
      // El backend devuelve { message: '...', user: {...} }
      // Extraemos solo el usuario
      if (response.data.user) {
        return response.data.user;
      }
      return response.data; // Fallback por si acaso
    } catch (error) {
      console.error('Error updating my profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (data: any) => {
    try {
      const response = await api.put('/user/profile', data);
      // Mismo manejo que updateMyProfile
      if (response.data.user) {
        return response.data.user;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  getUserProfile: async (identifier: string) => {
    try {
      const response = await api.get(`/user/profile/${identifier}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  updateAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.user) {
        return response.data.user;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  updateCoverPhoto: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('coverPhoto', file);
      const response = await api.post('/user/cover-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.user) {
        return response.data.user;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating cover photo:', error);
      throw error;
    }
  },

  addUserInterests: async (interestIds: string[]) => {
    try {
      const response = await api.post('/user/interests', { interestIds });
      if (response.data.user) {
        return response.data.user;
      }
      return response.data;
    } catch (error) {
      console.error('Error adding interests:', error);
      throw error;
    }
  },

  removeUserInterests: async (interestIds: string[]) => {
    try {
      const response = await api.delete('/user/interests', { data: { interestIds } });
      if (response.data.user) {
        return response.data.user;
      }
      return response.data;
    } catch (error) {
      console.error('Error removing interests:', error);
      throw error;
    }
  },

  getSuggestedUsers: async (limit: number = 10) => {
    try {
      const response = await api.get(`/user/suggested?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      throw error;
    }
  },
};