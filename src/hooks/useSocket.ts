import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { socketService } from '../lib/socket';

export function useSocket() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user?.id && user?.token) {
      socketService.connect(user.id, user.token);

      const check = setInterval(() => {
        setConnected(socketService.isConnected());
      }, 100);

      return () => {
        clearInterval(check);
        socketService.disconnect();
        setConnected(false);
      };
    }
  }, [user?.id, user?.token]);

  return { socket: socketService, connected };
}
