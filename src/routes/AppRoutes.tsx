import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Tus importaciones de página
import { Login } from '../features/auth/Login';
import { Register } from '../features/auth/Register';
import { PrivateRoute } from './PrivateRoutes';
import { ProtectedLayout } from '../features/protectedLayout'; // (La ruta que pusiste)
import { HomePage } from '../features/HomePage';
import { ChatPage } from '../features/chat/ChatPage';

// Importaciones de páginas (aún no creadas, pero las añadimos)
// import { EventsPage } from '../features/events/EventsPage';
// import { VenuesPage } from '../features/business/VenuesPage';
// import { CalendarPage } from '../features/calendar/CalendarPage';
// import { FavoritesPage } from '../features/favorites/FavoritesPage';
// import { ProfilePage } from '../features/profile/ProfilePage';


export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <ProtectedLayout />
          </PrivateRoute>
        }
      >
        
        {/* La ruta "/" (índice) cargará HomePage */}
        <Route index element={<HomePage />} /> 
        
        {/* La ruta "/chat" cargará ChatPage */}
        <Route path="chat" element={<ChatPage />} />

        {/* --- Tus futuras páginas (listas para descomentar) --- */}
        {/* <Route path="events" element={<EventsPage />} /> */}
        {/* <Route path="venues" element={<VenuesPage />} /> */}
        {/* <Route path="calendar" element={<CalendarPage />} /> */}
        {/* <Route path="favorites" element={<FavoritesPage />} /> */}
        {/* <Route path="profile" element={<ProfilePage />} /> */}

        {/* Ruta comodín para 404 dentro de la app */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Route>

    </Routes>
  </BrowserRouter>
);