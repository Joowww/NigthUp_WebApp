// src/features/SimpleLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleSidebar } from '../ui/simpleSidebar'; // Asegura que la ruta es correcta
import { Menu } from 'lucide-react';
import { FloatingHelp } from './FloatingHelp'; // <--- IMPORTAR

export const SimpleLayout: React.FC = () => {
  // Este estado controla si el sidebar se ve o no (tanto en móvil como desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* 1. SIDEBAR */}
      <SimpleSidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} // Pasamos la función para abrir/cerrar
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      {/* La clave mágica está aquí: "transition-all duration-300" y los márgenes.
          - lg:ml-64 -> En pantallas grandes, deja hueco de 64 (ancho del sidebar).
          - lg:ml-0  -> Si está cerrado, no deja hueco.
      */}
      <main 
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        `}
      >
        
        {/* HEADER MÓVIL (Solo se ve si la pantalla es pequeña) */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-white">NIGHT UP</span>
        </header>

        {/* AQUÍ SE RENDERIZA LA HOMEPAGE (El Outlet) */}
        {/* Hacemos que ocupe toda la altura menos el header si lo hubiera */}
        <div className="flex-1 relative h-full overflow-hidden">
           {/* Botón flotante para ABRIR el menú si está cerrado en Desktop */}
           {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="hidden lg:flex absolute top-4 left-4 z-50 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
           )}

           <Outlet />
        </div>
      </main>
    <FloatingHelp />
    </div>
  );
};