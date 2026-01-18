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
      }, 500);

      return () => {
        clearInterval(check);
        // NO desconectar aquí, ya que el socket es un singleton global
        // El OnlineUsersProvider y otros contextos dependen de que siga vivo.
      };
    }
  }, [user?.id, user?.token]);

  return { socket: socketService, connected };
}
