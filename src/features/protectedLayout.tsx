import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset, 
  SidebarTrigger,
} from '../ui/sidebar';
import {
  Home,
  Music,
  Building2,
  Calendar,
  Heart,
  User,
  LogOut,
  Sparkles,
  Search,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { useAuth } from '../hooks/useAuth'; 

// --- Tus constantes (déjalas como están) ---
const navItems = [
  { id: '/', label: 'Inicio', icon: Home },
  { id: '/events', label: 'Eventos', icon: Music },
  { id: '/venues', label: 'Discotecas', icon: Building2 },
  { id: '/calendar', label: 'Calendario', icon: Calendar },
  { id: '/favorites', label: 'Favoritos', icon: Heart },
];
type PageId = '/' | '/events' | '/venues' | '/calendar' | '/favorites' | '/profile';
const getInitials = (username: string = 'User') => {
  return username.substring(0, 2).toUpperCase();
};
// ---

export const ProtectedLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 

  const currentPage = (location.pathname as PageId) || '/';

  const handleNavigate = (page: PageId) => {
    navigate(page);
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        
        {/* === Sidebar (Escritorio) === */}
        <Sidebar className="hidden lg:flex lg:flex-col">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">NIGHTUP</h1>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="relative">
                <Input placeholder="Buscar evento..." className="pl-9" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavigate(item.id as PageId)}
                    isActive={currentPage === item.id}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/50">
                <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">
                  {user?.username || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'email@ejemplo.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>


        {/* 'SidebarInset' ahora tiene flex-1 Y el padding, y envuelve el Outlet */}
<SidebarInset className="flex-1 p-4 lg:p-6 overflow-y-auto"> {/* <--- ¡CORREGIDO! */}
          
          {/* Header para móvil (con el trigger del sidebar) */}
          <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between -mt-4 -mx-4 mb-4 p-4 bg-card/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-md">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-white">NIGHTUP</h1>
            </div>
            <SidebarTrigger className="text-white" />
          </header>

          {/* El Outlet (tu HomePage) ahora se renderiza DENTRO del SidebarInset */}
          <Outlet />

        </SidebarInset>

        {/* === Barra de Navegación (Móvil) === */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
          <div className="grid grid-cols-5 gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as PageId)}
                  className={`
                    flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all
                    ${isActive
                      ? 'bg-gradient-to-br from-primary/20 to-secondary/20 text-white'
                      : 'text-muted-foreground'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        {/* Padding para que el nav móvil no tape el contenido */}
        <div className="pb-20 lg:pb-0" />
      </div>
    </SidebarProvider>
  );
};