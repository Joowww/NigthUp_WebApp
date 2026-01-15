import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => void;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  loading: boolean;
  completeOnboarding: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Cargamos datos iniciales
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [loading, setLoading] = useState(true);

  // 2. LOGICA AUTOMÁTICA:
  // Si hay usuario Y su campo onboardingCompleted es false => true (Muestra PreHome)
  // En cualquier otro caso => false (Muestra Home)
  const needsOnboarding = !!user && user.onboardingCompleted === false;

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/user/auth/login', { username, password });
      
      const t = res.data.token;
      const userData = res.data.user;
      
      // ✅ CAMBIO CLAVE: Añadir token e id al objeto user
      const userWithToken = {
        ...userData,
        token: t, // ✅ Guardar token en el objeto user
        id: userData._id || userData.id // ✅ Asegurar que tiene 'id'
      };
      
      // Guardamos todo
      localStorage.setItem('token', t);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userWithToken)); // ✅ Guardar user con token
      
      setToken(t);
      setUser(userWithToken); // ✅ Actualizar estado con user que incluye token
      
      console.log('✅ Login exitoso. Usuario:', userWithToken);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const updateUser = (userData: any) => {
    // ✅ MEJORA: Mantener el token al actualizar el usuario
    const userWithToken = {
      ...userData,
      token: token, // ✅ Preservar el token
      id: userData._id || userData.id // ✅ Preservar el id
    };
    
    setUser(userWithToken);
    localStorage.setItem('user', JSON.stringify(userWithToken));
  };

  // Función auxiliar por si queremos forzar el completado localmente
  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, onboardingCompleted: true };
      updateUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      updateUser, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      needsOnboarding,
      loading,
      completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};