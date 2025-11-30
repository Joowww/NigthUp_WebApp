// AppRoutes.tsx - VERSIÓN CORREGIDA
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { PrivateRoute } from './PrivateRoutes';
import { SimpleLayout } from '../features/simpleLayout';
import { HomePage } from '../features/HomePage';
import { ChatPage } from '../features/chat/ChatPage';
import { useAuth } from '../hooks/useAuth'; 
import OnboardingFlow from '../features/PreHome';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const needsOnboarding = isAuthenticated && !user?.onboardingCompleted;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - siempre accesibles */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/chat" element={<ChatPage />} /> {/* ✅ Esta es la correcta */}
                
        {/* Rutas protegidas */}
        <Route path="/*" element={
          <PrivateRoute>
            {needsOnboarding ? (
              <OnboardingFlow />
            ) : (
              <SimpleLayout />
            )}
          </PrivateRoute>
        }>
          {/* Solo mostrar rutas anidadas si NO necesita onboarding */}
          {!needsOnboarding && (
            <>
              <Route index element={<HomePage />} />
              <Route path="chat" element={<ChatPage />} /> {/* ✅ Esta es la correcta */}
            </>
          )}
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};