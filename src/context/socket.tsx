import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth'; 

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth(); // Usamos tu AuthContext
  
  const [isConnected, setIsConnected] = useState(false);

  // Usamos useMemo para crear la instancia del socket solo una vez
  // y solo si tenemos un token.
  const socket = useMemo(() => {
    // No nos conectamos si no hay token o user
    if (!token || !user?._id) { 
      console.log('Socket.io: Esperando token o usuario...');
      return null;
    }

    console.log('Socket.io: Creando instancia...');
    
    // Autenticamos el socket usando el 'auth' que tu backend
    // (socketHandler.ts) espera
    return io(SOCKET_URL, {
      autoConnect: false, // Lo conectaremos manualmente
      auth: {
        token: token,
        userId: user._id, // Tu user.ts usa '_id'
        userRole: user.role
      }
    });
  }, [token, user]); // Se recreará si el token o el user cambian

  useEffect(() => {
    // Solo conectamos si estamos autenticados y el socket existe
    if (socket && isAuthenticated) {
      socket.connect();

      socket.on('connect', () => {
        console.log('Socket.io: Conectado 🟢', socket.id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket.io: Desconectado 🔴');
        setIsConnected(false);
      });
      
      socket.on('connect_error', (err) => {
        console.error('Socket.io: Error de conexión 🔴', err.message);
      });

      // Limpieza al desmontar
      return () => {
        console.log('Socket.io: Desconectando...');
        socket.disconnect();
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      };
    } else if (socket) {
      // Si cerramos sesión (isAuthenticated=false), nos desconectamos
      socket.disconnect();
    }
  }, [socket, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// El hook que usaremos en las páginas
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket debe usarse dentro de un SocketProvider');
  }
  return context;
};