// features/business/businessService.ts
import api from '../../api';
import type { IBusiness } from '../../modules/bussiness';

/* -----------------------------
   TIPOS
------------------------------ */

export interface BusinessesResponse {
  businesses: IBusiness[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/* -----------------------------
   PUBLIC (USUARIO)
------------------------------ */

/**
 * Obtener negocios activos con paginación y búsqueda
 */
export const getBusinesses = async (
  skip = 0,
  limit = 10,
  query?: string
): Promise<BusinessesResponse> => {
  const params: Record<string, any> = { skip, limit };
  if (query) params.q = query;

  const { data } = await api.get('/business', { params });
  return data;
};

/**
 * Obtener negocio por ID
 */
export const getBusinessById = async (id: string): Promise<IBusiness> => {
  const { data } = await api.get(`/business/${id}`);
  return data;
};

/**
 * Obtener negocios en un área del mapa (Bounding Box)
 */
export const getBusinessesInArea = async (
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number
): Promise<IBusiness[]> => {
  const { data } = await api.get('/map/businesses/area', {
    params: { minLng, minLat, maxLng, maxLat }
  });

  return data;
};

/* -----------------------------
   ADMIN
------------------------------ */

/**
 * Crear nuevo negocio
 */
export const createBusiness = async (
  payload: Partial<IBusiness>
): Promise<IBusiness> => {
  const { data } = await api.post('/business', payload);
  return data;
};

/**
 * Obtener todos los negocios (incluidos inactivos)
 */
export const getAllBusinessesWithInactive = async (
  skip = 0,
  limit = 10
): Promise<BusinessesResponse> => {
  const { data } = await api.get('/business/all/inactive-included', {
    params: { skip, limit }
  });
  return data;
};

/**
 * Desactivar negocio
 */
export const disableBusiness = async (id: string): Promise<IBusiness> => {
  const { data } = await api.patch(`/business/${id}/disable`);
  return data;
};

/**
 * Reactivar negocio
 */
export const reactivateBusiness = async (id: string): Promise<IBusiness> => {
  const { data } = await api.patch(`/business/${id}/reactivate`);
  return data;
};

/**
 * Eliminar negocio definitivamente
 */
export const deleteBusiness = async (id: string): Promise<IBusiness> => {
  const { data } = await api.delete(`/business/hard/${id}`);
  return data;
};

/* -----------------------------
   ADMIN / MANAGER
------------------------------ */

/**
 * Actualizar negocio
 */
export const updateBusiness = async (
  id: string,
  payload: Partial<IBusiness>
): Promise<IBusiness> => {
  const { data } = await api.put(`/business/${id}`, payload);
  return data;
};

/**
 * Añadir evento a negocio
 */
export const addEventToBusiness = async (
  businessId: string,
  eventId: string
): Promise<IBusiness> => {
  const { data } = await api.put(`/business/${businessId}/event/${eventId}`);
  return data;
};

/**
 * Eliminar evento de negocio
 */
export const removeEventFromBusiness = async (
  businessId: string,
  eventId: string
): Promise<IBusiness> => {
  const { data } = await api.delete(`/business/${businessId}/event/${eventId}`);
  return data;
};

/**
 * Añadir manager a negocio
 */
export const addManagerToBusiness = async (
  businessId: string,
  managerId: string
): Promise<IBusiness> => {
  const { data } = await api.put(
    `/business/${businessId}/manager/${managerId}`
  );
  return data;
};

/**
 * Eliminar manager de negocio
 */
export const removeManagerFromBusiness = async (
  businessId: string,
  managerId: string
): Promise<IBusiness> => {
  const { data } = await api.delete(
    `/business/${businessId}/manager/${managerId}`
  );
  return data;
};
