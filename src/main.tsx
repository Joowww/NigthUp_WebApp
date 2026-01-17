// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthProvider';
import { OnlineUsersProvider } from './context/OnlineUsersContext';
import { FriendshipProvider } from './context/FriendshipContext';
import { NotificationsProvider } from './context/NotificationsContext'; // ✅ IMPORTAR
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from 'next-themes';
import './i18n';
import { UIPreferencesProvider } from './context/UIPreferencesContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UIPreferencesProvider>
        <AuthProvider>
          <OnlineUsersProvider>
            <FriendshipProvider>
              <NotificationsProvider> 
                <ToastContainer
                  theme="dark"
                  position="bottom-right"
                  autoClose={3000}
                />
                <App />
              </NotificationsProvider>
            </FriendshipProvider>
          </OnlineUsersProvider>
        </AuthProvider>
      </UIPreferencesProvider>
    </ThemeProvider>
  </StrictMode>,
);