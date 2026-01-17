import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthProvider';
import { OnlineUsersProvider } from './context/OnlineUsersContext';
import { FriendshipProvider } from './context/FriendshipContext'; // ✅ AÑADIR
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
            <FriendshipProvider> {/* ✅ AÑADIR */}
              <ToastContainer
                theme="dark"
                position="bottom-right"
                autoClose={3000}
              />
              <App />
            </FriendshipProvider> {/* ✅ CERRAR */}
          </OnlineUsersProvider>
        </AuthProvider>
      </UIPreferencesProvider>
    </ThemeProvider>
  </StrictMode>,
);