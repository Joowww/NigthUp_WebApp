import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthProvider';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById('root')!).render(//busca el elemento con id root en el html
  //el cual es dnd va a inyectar la app/web
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider> 

      <ToastContainer
        theme="dark"
        position="bottom-right"
        autoClose={3000}
      />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);