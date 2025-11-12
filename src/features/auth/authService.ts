import api from '../../api';
import type { User as user } from '../../modules/user';

export const register = async (credentials: user) => {

  const res = await api.post('/user', credentials);
  return res.data; 
};