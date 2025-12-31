// features/business/BusinessPage.tsx
import { useEffect, useState, useMemo } from 'react';
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

export const BusinessPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  // Estados del buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

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

    return filtered;
  }, [businesses, searchQuery, showActiveOnly, showInactiveOnly]);

  const handleShowBusinessOnMap = (business: IBusiness) => {
    setSelectedBusiness(business);
    setActiveTab('map');
    setIsMapExpanded(true);
  };

  const closeExpandedMap = () => {
    setIsMapExpanded(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilters = () => {
    setShowActiveOnly(false);
    setShowInactiveOnly(false);
  };

  const hasActiveFilters = showActiveOnly || showInactiveOnly;

  return (
    <div className="h-full w-full p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Discotecas</h1>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">
            {filteredBusinesses.length} de {businesses.length} discotecas
          </span>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input de búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="¿A que discoteca quieres ir? ¡Encuentrala por su nombre!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-11 bg-card border-border focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown de filtros */}
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
                  {(showActiveOnly ? 1 : 0) + (showInactiveOnly ? 1 : 0)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
          }}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Listado
        </Button>
        <Button
          variant={activeTab === 'map' ? 'default' : 'outline'}
          onClick={() => setActiveTab('map')}
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
        <div className="h-[calc(100vh-300px)] min-h-[600px]">
          <BusinessMap
            businesses={filteredBusinesses}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={setSelectedBusiness}
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};