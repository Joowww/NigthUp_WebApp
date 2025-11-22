// src/features/SimpleLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleSidebar } from '../ui/simpleSidebar';
import { Menu } from 'lucide-react';

export const SimpleLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <SimpleSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil */}
        <header className="lg:hidden sticky top-0 z-30 bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
                <span className="text-white">✨</span>
              </div>
              <h1 className="text-lg font-bold">NIGHTUP</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};