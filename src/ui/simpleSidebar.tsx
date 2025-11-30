// src/components/SimpleSidebar.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
<<<<<<< HEAD
import { Home, Music, Building2, Calendar, Heart, LogOut, ChevronLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../ui/Logo'; 
=======
import { 
  Home, 
  Music, 
  Building2, 
  Calendar, 
  Heart,
  MessageCircle,
  X
} from 'lucide-react';
>>>>>>> feature/chatgroup

interface SimpleSidebarProps {
  isOpen: boolean;
  onToggle: () => void; // Nueva función que recibe del padre
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { id: '/', label: 'Inicio', icon: Home },
    { id: '/events', label: 'Eventos', icon: Music },
    { id: '/venues', label: 'Discotecas', icon: Building2 },
    { id: '/chat', label: 'Chat', icon: MessageCircle },
    { id: '/calendar', label: 'Calendario', icon: Calendar },
    { id: '/chat', label: 'Chat', icon: MessageCircle },
    { id: '/favorites', label: 'Favoritos', icon: Heart },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // En móvil cerramos al navegar, en desktop no hace falta
    if (window.innerWidth < 1024) onToggle();
  };

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };

  return (
    <>
      {/* Overlay para móvil (fondo negro) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
      )}

<<<<<<< HEAD
      {/* Modal Confirmación Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">¿Cerrar sesión?</h3>
                <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl">Cancelar</button>
                    <button onClick={handleLogout} className="flex-1 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">Sí, salir</button>
                </div>
            </div>
        </div>
      )}

      {/* SIDEBAR:
         - fixed: Siempre fijo a la izquierda.
         - w-64: Ancho fijo.
         - translate-x: Controla si se ve o no.
      */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 
        bg-card border-r border-border/50 text-white 
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header con Logo y Botón de cerrar */}
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
          <Logo className="text-2xl" />
          
          {/* BOTÓN PARA ESCONDER SIDEBAR */}
          <button 
            onClick={onToggle}
            className="hidden lg:flex p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
            title="Ocultar menú"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
=======
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header con Logo clickeable */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigation('/chat')}
              className="flex items-center gap-2 group"
            >
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                <span className="text-white text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NIGHTUP</h1>
                <p className="text-xs text-gray-400">Chat</p>
              </div>
            </button>

            {/* Botón cerrar (solo móvil) */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
>>>>>>> feature/chatgroup
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              return (
                <li key={item.id}>
                  <button onClick={() => handleNavigation(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Usuario */}
        <div className="p-4 border-t border-border/50 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{user?.username?.substring(0,2).toUpperCase() || 'US'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
            </div>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};