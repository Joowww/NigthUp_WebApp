// src/components/SimpleSidebar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Music, 
  Building2, 
  Calendar, 
  Heart,
  MessageCircle,
  X
} from 'lucide-react';

interface SimpleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleSidebar: React.FC<SimpleSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: '/', label: 'Inicio', icon: Home },
    { id: '/events', label: 'Eventos', icon: Music },
    { id: '/venues', label: 'Discotecas', icon: Building2 },
    { id: '/calendar', label: 'Calendario', icon: Calendar },
    { id: '/chat', label: 'Chat', icon: MessageCircle },
    { id: '/favorites', label: 'Favoritos', icon: Heart },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Cerrar sidebar en móvil después de navegar
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

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
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-l-2 border-purple-500' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer con usuario */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">US</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Usuario</p>
              <p className="text-gray-400 text-xs">user@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};