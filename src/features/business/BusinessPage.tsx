// features/business/BusinessPage.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { BusinessList } from './BusinessList';
import { BusinessMap } from './BusinessMap';
import { getBusinesses } from './bussinessService';
import type { IBusiness } from '../../modules/bussiness';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { X, Search, MapIcon, List, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ImageWithFallback } from '../ImageWithFallback';

// 🧮 Calcular distancia usando fórmula Haversine
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const BusinessPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  // Estados del buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  // NUEVO: Estado para ubicación del usuario
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // CAMBIADO: Ahora son checkboxes independientes
  const [sortByDistance, setSortByDistance] = useState(false);
  const [sortByName, setSortByName] = useState(false);

  // NUEVO: Estados para el dropdown de búsqueda
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAllSearchResults, setShowAllSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // NUEVO: Obtener ubicación al montar - MEJORADO
useEffect(() => {
  if (!('geolocation' in navigator)) {
    console.error('❌ Geolocalización no disponible');
    setUserLocation([40.4168, -3.7038]);
    return;
  }

  console.log('📍 BusinessPage: Solicitando ubicación del dispositivo...');

  const geoOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0
  };

  let watchId: number | null = null;
  let hasReceivedLocation = false;

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log(`📍 BusinessPage: Ubicación recibida: [${latitude}, ${longitude}]`);
      console.log(`🎯 BusinessPage: Precisión: ${accuracy} metros`);

      if (!hasReceivedLocation || accuracy < 100) {
        hasReceivedLocation = true;
        setUserLocation([latitude, longitude]);
        
        if (accuracy < 50 && watchId !== null) {
          console.log('✅ BusinessPage: Precisión excelente alcanzada, deteniendo watchPosition');
          navigator.geolocation.clearWatch(watchId);
        }
      }
    },
    (error) => {
      console.error('❌ BusinessPage: Error obteniendo ubicación:', error);
      
      if (!hasReceivedLocation) {
        console.warn('⚠️ BusinessPage: Usando ubicación por defecto (Madrid)');
        setUserLocation([40.4168, -3.7038]);
      }
      
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    },
    geoOptions
  );

  return () => {
    if (watchId !== null) {
      console.log('🧹 BusinessPage: Limpiando watchPosition');
      navigator.geolocation.clearWatch(watchId);
    }
  };
}, []);

  // NUEVO: Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
        setShowAllSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const load = async () => {
      const data = await getBusinesses(0, 50);
      setBusinesses(data.businesses);
    };
    load();
  }, []);

  // Filtrado inteligente de negocios
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    // Filtro por búsqueda de texto (SOLO NOMBRE)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(query)
      );
    }

    // Filtro por estado activo/inactivo
    if (showActiveOnly && !showInactiveOnly) {
      filtered = filtered.filter(b => b.active);
    } else if (showInactiveOnly && !showActiveOnly) {
      filtered = filtered.filter(b => !b.active);
    }

    // NUEVO: Ordenamiento - prioridad a distancia, luego alfabético
    if (sortByDistance && userLocation) {
      filtered = [...filtered].sort((a, b) => {
        if (!a.location?.coordinates || !b.location?.coordinates) return 0;

        const [lngA, latA] = a.location.coordinates;
        const [lngB, latB] = b.location.coordinates;

        const distA = calculateDistance(
          userLocation[0],
          userLocation[1],
          latA,
          lngA
        );

        const distB = calculateDistance(
          userLocation[0],
          userLocation[1],
          latB,
          lngB
        );

        return distA - distB;
      });
    } 
    
    if (sortByName) {
      filtered = [...filtered].sort((a, b) => 
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );
    }

    return filtered;
  }, [businesses, searchQuery, showActiveOnly, showInactiveOnly, sortByDistance, sortByName, userLocation]);

  // NUEVO: Resultados para el dropdown de búsqueda
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || activeTab !== 'map') return [];
    
    return filteredBusinesses;
  }, [searchQuery, filteredBusinesses, activeTab]);

  const handleShowBusinessOnMap = (business: IBusiness) => {
    setSelectedBusiness(business);
    setActiveTab('map');
    setIsMapExpanded(true);
  };

  // NUEVO: Seleccionar business desde el dropdown
  const handleSelectFromSearch = (business: IBusiness) => {
    setSelectedBusiness(business);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setShowAllSearchResults(false);
  };

  const closeExpandedMap = () => {
    setIsMapExpanded(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    setShowAllSearchResults(false);
  };

  const clearFilters = () => {
    setShowActiveOnly(false);
    setShowInactiveOnly(false);
    setSortByDistance(false);
    setSortByName(false);
  };

  const hasActiveFilters = showActiveOnly || showInactiveOnly || sortByDistance || sortByName;

  return (
    <div className="h-full w-full p-6 space-y-6">
      {/* HEADER CON DEGRADADO */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff0080] via-[#00d9ff] to-[#ff0080] bg-clip-text text-transparent animate-pulse">
          Discotecas
        </h1>
        
        <p className="text-muted-foreground text-base max-w-3xl">
          Explora las mejores discotecas y clubs nocturnos de tu ciudad. Descubre nuevos lugares, 
          consulta eventos próximos y encuentra tu próximo destino para disfrutar de la mejor música 
          y ambiente nocturno. 🎉
        </p>

         {/* ✅ MOSTRAR SOLO CUANDO HAY BÚSQUEDA O FILTROS ACTIVOS */}
         {(searchQuery || hasActiveFilters) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">
              {filteredBusinesses.length} de {businesses.length} discotecas disponibles
            </span>
          </div>
        )}
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input de búsqueda CON DROPDOWN */}
        <div className="relative flex-1" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="¿A qué discoteca quieres ir? ¡Encuéntrala por su nombre!"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => searchQuery && setShowSearchDropdown(true)}
            className="pl-10 pr-10 h-11 bg-card border-border focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* DROPDOWN DE RESULTADOS DE BÚSQUEDA - MEJORADO */}
          {showSearchDropdown && searchResults.length > 0 && activeTab === 'map' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-[1100] max-h-[500px] overflow-hidden">
              <div className="overflow-y-auto max-h-[400px]">
                <div className="p-2 space-y-1">
                  {(showAllSearchResults ? searchResults : searchResults.slice(0, 3)).map((business) => (
                    <button
                      key={business._id}
                      onClick={() => handleSelectFromSearch(business)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      {/* Imagen */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <ImageWithFallback
                          src={business.avatar || ''}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {business.name}
                        </p>
                        {business.address && (
                          <p className="text-xs text-muted-foreground truncate">
                            {business.address}
                          </p>
                        )}
                      </div>

                      {/* Badge de estado */}
                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          business.active 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {business.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer con botón toggle "Ver todos" / "Mostrar menos" */}
              {searchResults.length > 3 && (
                <div className="border-t border-border bg-muted/50 p-2">
                  <button
                    onClick={() => setShowAllSearchResults(!showAllSearchResults)}
                    className="w-full text-sm text-center text-primary hover:text-primary/80 font-medium py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    {showAllSearchResults 
                      ? `Mostrar menos` 
                      : `Ver todos los resultados (${searchResults.length})`
                    }
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dropdown de filtros CON CHECKBOXES INDEPENDIENTES */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={`h-11 px-4 gap-2 ${hasActiveFilters ? 'border-primary text-primary' : ''}`}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {(showActiveOnly ? 1 : 0) + (showInactiveOnly ? 1 : 0) + (sortByDistance ? 1 : 0) + (sortByName ? 1 : 0)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* SECCIÓN DE ORDENAMIENTO */}
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sortByDistance}
              onCheckedChange={setSortByDistance}
            >
              Más cercanas
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortByName}
              onCheckedChange={setSortByName}
            >
              Nombre (A-Z)
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* SECCIÓN DE ESTADO */}
            <DropdownMenuLabel>Estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            >
              Solo activas
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showInactiveOnly}
              onCheckedChange={setShowInactiveOnly}
            >
              Solo inactivas
            </DropdownMenuCheckboxItem>

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={clearFilters}
                  className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpiar filtros
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'list' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('list');
            setIsMapExpanded(false);
            setShowSearchDropdown(false);
            setShowAllSearchResults(false);
          }}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Listado
        </Button>
        <Button
          variant={activeTab === 'map' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('map');
            setShowAllSearchResults(false);
          }}
          className="gap-2"
        >
          <MapIcon className="h-4 w-4" />
          Mapa
        </Button>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredBusinesses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No hay discotecas que coincidan con "${searchQuery}"`
              : 'No hay discotecas que coincidan con los filtros seleccionados'}
          </p>
          {(searchQuery || hasActiveFilters) && (
            <Button
              variant="outline"
              onClick={() => {
                clearSearch();
                clearFilters();
              }}
            >
              Limpiar búsqueda y filtros
            </Button>
          )}
        </div>
      )}

      {/* LISTADO */}
      {activeTab === 'list' && filteredBusinesses.length > 0 && (
        <BusinessList
          businesses={filteredBusinesses}
          onShowBusinessOnMap={handleShowBusinessOnMap}
        />
      )}

      {/* MAPA NORMAL */}
        {activeTab === 'map' && filteredBusinesses.length > 0 && !isMapExpanded && (
          <div className="h-[calc(100vh-350px)] min-h-[600px]">
            <BusinessMap
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={setSelectedBusiness}
              userLocation={userLocation ?? undefined}  // ← Usar nullish coalescing
            />
          </div>
        )}

        {/* MAPA EXPANDIDO (MODAL) */}
        {isMapExpanded && (
          <div className="fixed inset-0 z-50 bg-black/80 animate-in fade-in duration-300">
            <div className="relative w-full h-full p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 z-[60] bg-background/80 hover:bg-background"
                onClick={closeExpandedMap}
              >
                <X size={24} />
              </Button>

              <div className="w-full h-full rounded-lg overflow-hidden">
                <BusinessMap
                  businesses={filteredBusinesses}
                  selectedBusiness={selectedBusiness}
                  onSelectBusiness={setSelectedBusiness}
                  isExpanded
                  userLocation={userLocation ?? undefined}  // ← Usar nullish coalescing
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};