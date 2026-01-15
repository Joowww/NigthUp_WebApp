// src/features/profile/TrustService.ts
import api from '../../api';
import type { UserTrust, UserTrustStats, UserTrustSummary } from '../../modules/userTrust';

export const trustService = {
  // ============================================
  // OBTENER ESTADÍSTICAS
  // ============================================
  
  /**
   * Obtener estadísticas de confianza de un usuario
   * Backend: GET /api/user-trust/user/stats/:userId
   */
  getUserTrustStats: async (userId: string): Promise<UserTrustStats> => {
    try {
      const response = await api.get(`/user-trust/user/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trust stats:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de confianza de un usuario
   * Backend: GET /api/user-trust/user/summary/:userId
   */
  getUserTrustSummary: async (userId: string): Promise<UserTrustSummary> => {
    try {
      const response = await api.get(`/user-trust/user/summary/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trust summary:', error);
      throw error;
    }
  },

  /**
   * Obtener promedio global de confianza
   * Backend: GET /api/user-trust/average
   */
  getGlobalAverageTrust: async (): Promise<{ averageScore: number }> => {
    try {
      const response = await api.get('/user-trust/average');
      return response.data;
    } catch (error) {
      console.error('Error fetching global average:', error);
      throw error;
    }
  },

  // ============================================
  // OBTENER VALORACIONES
  // ============================================

  /**
   * Obtener valoraciones RECIBIDAS por un usuario
   * Backend: GET /api/user-trust/user/ratings/:userId
   */
  getUserRatings: async (userId: string): Promise<UserTrust[]> => {
    try {
      const response = await api.get(`/user-trust/user/ratings/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      throw error;
    }
  },

  /**
   * Obtener valoraciones DADAS por un usuario
   * Backend: GET /api/user-trust/user/from/:userId
   */
  getRatingsFromUser: async (userId: string): Promise<UserTrust[]> => {
    try {
      const response = await api.get(`/user-trust/user/from/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ratings from user:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las valoraciones (admin)
   * Backend: GET /api/user-trust
   */
  getAllRatings: async (): Promise<UserTrust[]> => {
    try {
      const response = await api.get('/user-trust');
      return response.data;
    } catch (error) {
      console.error('Error fetching all ratings:', error);
      throw error;
    }
  },

  /**
   * Obtener una valoración específica por ID
   * Backend: GET /api/user-trust/:id
   */
  getRatingById: async (ratingId: string): Promise<UserTrust> => {
    try {
      const response = await api.get(`/user-trust/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rating by id:', error);
      throw error;
    }
  },

  // ============================================
  // CREAR/ACTUALIZAR/ELIMINAR VALORACIONES
  // ============================================

  /**
   * Crear una valoración (valorar a otro usuario)
   * Backend: POST /api/user-trust
   */
  createTrustRating: async (data: {
    rated: string;
    score: number;
    comment?: string;
    context: string;
  }): Promise<UserTrust> => {
    try {
      const response = await api.post('/user-trust', data);
      return response.data;
    } catch (error) {
      console.error('Error creating trust rating:', error);
      throw error;
    }
  },

  /**
   * Actualizar una valoración existente
   * Backend: PATCH /api/user-trust/:id
   */
  updateTrustRating: async (
    ratingId: string, 
    data: {
      score?: number;
      comment?: string;
      context?: string;
    }
  ): Promise<UserTrust> => {
    try {
      const response = await api.patch(`/user-trust/${ratingId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating trust rating:', error);
      throw error;
    }
  },

  /**
   * Eliminar una valoración
   * Backend: DELETE /api/user-trust/:id
   */
  deleteTrustRating: async (ratingId: string): Promise<void> => {
    try {
      await api.delete(`/user-trust/${ratingId}`);
    } catch (error) {
      console.error('Error deleting trust rating:', error);
      throw error;
    }
  },
};