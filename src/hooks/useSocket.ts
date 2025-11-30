import { useEffect } from 'react';
import { socketService } from '../lib/socket';
import { useAuth } from './useAuth';

export function useSocket() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id && user?.token) {
      socketService.connect(user.id, user.token);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user?.id, user?.token]);

  return socketService;
}