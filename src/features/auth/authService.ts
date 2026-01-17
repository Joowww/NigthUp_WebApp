import api from '../../api';
import type { User } from '../../modules/user';

// ✅ CAMBIAR: Usar Partial<User> para permitir campos opcionales
export const register = async (credentials: Partial<User>) => {
  const res = await api.post('/user', credentials);
  return res.data; 
};

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const googleAuth = async (token: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/google', { token });
  return response.data;
};