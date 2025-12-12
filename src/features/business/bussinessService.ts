// services/businessService.ts (NUEVO ARCHIVO)
import api from '../../api'; // Asumiendo que tienes un cliente Axios configurado
import type { IBusiness } from '../../modules/bussiness'; // Ajusta la ruta a tu modelo

export interface BusinessesResponse {
  businesses: IBusiness[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Obtiene y busca negocios/locales con paginación.
 * @param query Nombre de la discoteca a buscar.
 */
export const getBusinesses = async (
    skip: number = 0, 
    limit: number = 10, 
    query?: string
): Promise<BusinessesResponse> => {
  const params: any = { skip, limit };
  if (query) {
    params.q = query; // Usa el parámetro 'q' que configuramos en el backend
  }
  const res = await api.get('/business', { params });
  return res.data; 
};

/**
 * Obtiene negocios dentro de un área específica del mapa (Bounding Box).
 * Necesario para dibujar los marcadores en el mapa al moverse.
 */
export const getBusinessesInArea = async (
    minLng: number, minLat: number, maxLng: number, maxLat: number
): Promise<IBusiness[]> => {
  const res = await api.get('/map/businesses/area', {
    params: { minLng, minLat, maxLng, maxLat }
  });
  // El backend devuelve { businesses: [...] }
  return res.data.businesses; 
};