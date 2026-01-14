// src/components/SimpleSidebar.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Music, Building2, Calendar, LogOut, ChevronLeft, MessageCircle, LayoutDashboard, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../ui/Logo';

interface SimpleSidebarProps {
  isOpen: boolean;
  onToggle: () => void; // Nueva función que recibe del padre
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { id: '/', label: t('sidebar.home', 'Inicio'), icon: Home },
    { id: '/events', label: t('sidebar.events', 'Eventos'), icon: Music },
    { id: '/business', label: t('sidebar.venues', 'Discotecas'), icon: Building2 }, // Necesita añadir venues a json
    { id: '/chat', label: t('sidebar.chat', 'Chat'), icon: MessageCircle },
    { id: '/calendar', label: t('sidebar.calendar', 'Calendario'), icon: Calendar },
    { id: '/favorites', label: 'Favoritos', icon: Heart },
    ...(user?.role === 'manager' ? [{ id: '/manager', label: t('sidebar.manager_panel', 'Panel Manager'), icon: LayoutDashboard }] : []),
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

      {/* Modal Confirmación Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">{t('common.close_session_confirm', '¿Cerrar sesión?')}</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl">{t('common.cancel', 'Cancelar')}</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">{t('common.yes_logout', 'Sí, salir')}</button>
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
          <div
            className="flex items-center gap-3 mb-4 cursor-pointer"
            onClick={() => handleNavigation('/profile')} // Redirige al perfil del usuario
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{user?.username?.substring(0, 2).toUpperCase() || 'US'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
            </div>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t('sidebar.logout', 'Cerrar sesión')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};