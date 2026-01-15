import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';

interface OnlineUsersContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
}

const OnlineUsersContext = createContext<OnlineUsersContextType>({
  onlineUsers: new Set(),
  isUserOnline: () => false,
});

export const useOnlineUsers = () => useContext(OnlineUsersContext);

export const OnlineUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // 👇 ahora useSocket nos dice cuándo el socket REAL está listo
  const { socket, connected } = useSocket();

  const handleOnlineUsers = useCallback((userIds: string[]) => {
    console.log('🟢 [EVENT] onlineUsers recibido:', userIds);
    setOnlineUsers(new Set(userIds));
  }, []);

  const handleUserDisconnected = useCallback((data: { userId: string }) => {
    console.log('🔴 [EVENT] userDisconnected:', data.userId);
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (!connected) return; // 🔥 no registrar listeners hasta que haya socket real

    console.log('✅ Registrando listeners de online users (socket listo)');

    socket.onOnlineUsers(handleOnlineUsers);
    socket.onUserDisconnected(handleUserDisconnected);

    // 🔥 forzar sincronización tras conectar
    socket.requestOnlineUsers();

    return () => {
      console.log('🧹 Limpiando listeners de OnlineUsersProvider');
      socket.offOnlineUsers();
      socket.offUserDisconnected();
    };
  }, [connected, socket, handleOnlineUsers, handleUserDisconnected]);

  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, isUserOnline }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};
