import React, { createContext, useState } from 'react';
import api from '../api';
import { useEffect } from 'react';

interface AuthContextType {//estructura de lo que guardaremos
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
//crea el contexto con el tipo definido, es com una tuberia on viatgen dades compartides
//de moment es inicialitza com a undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

//a quil va a proveir les dades el context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función para verificar si necesita onboarding basado en el contador
  const checkOnboardingNeeded = () => {
    const onboardingCounter = parseInt(localStorage.getItem('onboardingCounter') || '0');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    
    if (onboardingCompleted || onboardingCounter < 10) {
      return false;
    }
    return true;
  };

  // Función para incrementar el contador
  const incrementOnboardingCounter = () => {
    const currentCounter = parseInt(localStorage.getItem('onboardingCounter') || '0');
    const newCounter = currentCounter + 1;
    localStorage.setItem('onboardingCounter', newCounter.toString());
    
    // Si llega a 10, mostrar onboarding
    if (newCounter >= 10) {
      setNeedsOnboarding(true);
    }
  };

  // Función para completar onboarding
  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingCounter', '0'); // Resetear contador
    setNeedsOnboarding(false);
  };

  // Al cargar la app, verificar si necesita onboarding
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verificar si necesita onboarding basado en el contador
          if (checkOnboardingNeeded()) {
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          logout();
        }
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
      
      localStorage.setItem('token', t);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(t);
      setUser(userData);

      incrementOnboardingCounter();

      if (checkOnboardingNeeded()) {
        setNeedsOnboarding(true);
      }
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
    setNeedsOnboarding(false);
    setLoading(false);
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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