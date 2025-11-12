import React, { createContext, useEffect, useState } from 'react';
import api from '../api';

interface AuthContextType {//es la estructura de les dades que anem a compartir
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
//crea el contexto con el tipo definido, es com una tuberia on viatgen dades compartides
//de moment es inicialitza com a undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

//a quil va a proveir les dades el context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);

  const login = async (username: string, password: string) => {
    const res = await api.post('/user/auth/login', { username, password });

    const t = res.data.token;
    localStorage.setItem('token', t);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
