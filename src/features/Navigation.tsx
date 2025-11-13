import { Home, Calendar, Heart, Building2, User, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: 'home' as Page, label: 'Inicio', icon: Home },
  { id: 'events' as Page, label: 'Eventos', icon: Music },
  { id: 'venues' as Page, label: 'Discotecas', icon: Building2 },
  { id: 'calendar' as Page, label: 'Calendario', icon: Calendar },
  { id: 'favorites' as Page, label: 'Favoritos', icon: Heart },
  { id: 'profile' as Page, label: 'Perfil', icon: User },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 py-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#ff0080] to-[#7928ca] flex items-center justify-center">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
              night up
            </h1>
          </div>
          
          <nav className="flex flex-1 flex-col gap-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    group flex items-center gap-x-3 rounded-lg px-3 py-2.5 transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#ff0080]/20 to-[#7928ca]/20 text-white border border-[#ff0080]/30 shadow-lg shadow-[#ff0080]/20' 
                      : 'text-muted-foreground hover:bg-muted hover:text-white'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#ff0080]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="rounded-lg bg-gradient-to-br from-[#ff0080]/10 to-[#7928ca]/10 border border-[#ff0080]/20 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              ¡Descubre los mejores eventos!
            </p>
            <p className="text-xs text-muted-foreground">
              Únete a la mejor comunidad de fiesta
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="grid grid-cols-6 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#ff0080]/20 to-[#7928ca]/20 text-white' 
                    : 'text-muted-foreground'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#ff0080]' : ''}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
