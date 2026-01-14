// AppRoutes.tsx - VERSIÓN CORREGIDA
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { PrivateRoute } from './PrivateRoutes';
import { ManagerRoute } from './ManagerRoute';
import { SimpleLayout } from '../features/simpleLayout';
import { HomePage } from '../features/HomePage';
import { useAuth } from '../hooks/useAuth';
import OnboardingFlow from '../features/PreHome';
import { EventsPage } from '../features/events/EventsPage';
import { CalendarPage } from '../features/calendar/CalendarPage';
import { ChatPage } from '../features/chat/ChatPage';
import { CreatorPage } from '../features/manager/CreatorPage';
import { BusinessPage } from '../features/business/BusinessPage';
import { MyProfile } from '../features/profile/MyProfile';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const needsOnboarding = isAuthenticated && !user?.onboardingCompleted;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - siempre accesibles */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />


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
              <Route path="events" element={<EventsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="business" element={<BusinessPage />} />
              <Route path="profile" element={<MyProfile />} /> 
              <Route element={<ManagerRoute />}>
                <Route path="manager" element={<CreatorPage />} />
              </Route>
            
            </>
          )}
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};