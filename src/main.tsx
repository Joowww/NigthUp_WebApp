import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

import { AuthProvider } from './context/AuthProvider';
import { SocketProvider } from './context/socket';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <SocketProvider>
          <App />

          <ToastContainer
            theme="dark"
            position="bottom-right"
            autoClose={3000}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
