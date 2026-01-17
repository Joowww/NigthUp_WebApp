// src/features/friendship/DiscoverPeople.tsx
import { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, Loader2, X, SlidersHorizontal, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useToast } from '../../hooks/useToast';
import { friendshipService } from './friendshipService';
import { UserCard } from './UserCard';
import { UserProfileModal } from './UserProfileModal';
import { NotificationsPanel } from './NotificationsPanel';
import { useNotifications } from '../../hooks/useNotifications';
import type { SearchUser } from '../../modules/friendship';
import { useOnlineUsers } from '../../context/OnlineUsersContext'; 

export default function DiscoverPeople() {
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    interest: '',
    gender: '',
    onlineOnly: false
  });

  const [filterOptions, setFilterOptions] = useState<{
    cities: string[];
    interests: string[];
  }>({ cities: [], interests: [] });

  const { success, error } = useToast();
  const { isUserOnline } = useOnlineUsers();
  const { unreadCount } = useNotifications();
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const USERS_PER_PAGE = 9;

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery, filters.city, filters.interest, filters.gender]);

  const loadFilterOptions = async () => {
    try {
      const options = await friendshipService.getFilterOptions();
      setFilterOptions(options);
      console.log('✅ Opciones de filtros cargadas:', options);
    } catch (err) {
      console.error('❌ Error cargando opciones de filtros');
    }
  };

  const loadUsers = async () => {
    try {
      console.log(`🔄 Cargando usuarios con filtros:`, {
        searchQuery,
        city: filters.city,
        interest: filters.interest,
        gender: filters.gender
      });
      
      setLoading(true);

      const fetchedUsers = await friendshipService.searchUsers(
        searchQuery,
        1000,
        0,
        filters.city,
        filters.interest,
        filters.gender,
        false
      );

      console.log(`✅ Usuarios recibidos: ${fetchedUsers.length}`);

      setAllUsers(fetchedUsers);
      setTotalUsers(fetchedUsers.length);
    } catch (err) {
      console.error('❌ Error loading users:', err);
      error('Error al cargar usuarios');
      setAllUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    console.log(`🔍 Filtrando usuarios. Total: ${allUsers.length}, onlineOnly: ${filters.onlineOnly}`);
    
    let result = allUsers;

    if (filters.onlineOnly) {
      result = result.filter(user => {
        const online = isUserOnline(user._id);
        if (online) {
          console.log(`🟢 Usuario ${user.username} está ONLINE`);
        }
        return online;
      });
      console.log(`✅ Usuarios online encontrados: ${result.length}`);
    }

    return result;
  }, [allUsers, filters.onlineOnly, isUserOnline]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.onlineOnly]);

  const handleClearFilters = () => {
    setFilters({
      city: '',
      interest: '',
      gender: '',
      onlineOnly: false
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="h-full w-full bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header mejorado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Descubre Nuevas Amistades
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Conecta con personas que comparten tus gustos musicales y sal de fiesta juntos 🎉
              </p>
            </div>

            {/* Botón flotante de notificaciones */}
            <button
              onClick={() => setShowNotificationsPanel(true)}
              className="relative p-4 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/40 rounded-xl transition-all shadow-lg hover:shadow-xl"
              title="Ver notificaciones de amistad"
            >
              <Bell className="w-6 h-6 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full border-2 border-background animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Info stats */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>👥 {filteredUsers.length} usuarios {filters.onlineOnly ? 'online' : 'disponibles'}</span>
            <span>•</span>
            <span>🎵 {filterOptions.interests.length} géneros musicales</span>
            <span>•</span>
            <span>📍 {filterOptions.cities.length} ciudades</span>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1 border-border/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Busca por nombre de usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 h-auto py-3 px-6"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros Avanzados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 animate-in slide-in-from-top-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Filtros de Búsqueda</CardTitle>
                  <CardDescription>
                    Personaliza tu búsqueda para encontrar las personas perfectas
                  </CardDescription>
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-primary hover:text-primary/80"
                  >
                    Limpiar todo ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    📍 Ubicación
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Todas las ciudades</option>
                    {filterOptions.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    🎵 Género Musical
                  </label>
                  <select
                    value={filters.interest}
                    onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Todos los géneros</option>
                    {filterOptions.interests.map((interest) => (
                      <option key={interest} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    👤 Género
                  </label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Todos</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-background/70 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
                <input
                  type="checkbox"
                  id="onlineOnly"
                  checked={filters.onlineOnly}
                  onChange={(e) => setFilters({ ...filters, onlineOnly: e.target.checked })}
                  className="w-5 h-5 rounded border-input cursor-pointer accent-primary"
                />
                <label htmlFor="onlineOnly" className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Mostrar solo usuarios activos ahora
                </label>
                {filters.onlineOnly && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {filteredUsers.length} online
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {searchQuery || activeFiltersCount > 0 ? (
                    <>
                      <Search className="w-5 h-5 text-primary" />
                      Resultados de búsqueda
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 text-primary" />
                      Usuarios Disponibles
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {paginatedUsers.length > 0
                    ? `Mostrando ${paginatedUsers.length} de ${filteredUsers.length} ${filters.onlineOnly ? 'usuarios online' : 'personas'}`
                    : filters.onlineOnly
                      ? 'No hay usuarios online con estos filtros'
                      : 'No hay resultados para mostrar'}
                </CardDescription>
              </div>
              
              {paginatedUsers.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  Página {currentPage} de {totalPages}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">
                  Buscando personas increíbles...
                </p>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-32">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <UserPlus className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {filters.onlineOnly 
                      ? '😴 No hay usuarios online ahora mismo'
                      : 'No encontramos personas con estas características'
                    }
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {filters.onlineOnly
                      ? 'Intenta desactivar el filtro de "solo online" o vuelve más tarde cuando más gente esté conectada'
                      : searchQuery || activeFiltersCount > 0
                        ? 'Intenta ajustar tus filtros de búsqueda o busca un término diferente'
                        : 'Parece que no hay usuarios disponibles en este momento'}
                  </p>
                </div>
                {(searchQuery || activeFiltersCount > 0) && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpiar todos los filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedUsers.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
                      onViewProfile={() => setSelectedUser(user)}
                      onStatusChange={(newStatus) => {
                        setAllUsers((prev) =>
                          prev.map((u) =>
                            u._id === user._id ? { ...u, status: newStatus as any } : u
                          )
                        );
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {((currentPage - 1) * USERS_PER_PAGE) + 1}-{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length}
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!hasPrevPage}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>

                      <div className="hidden sm:flex items-center gap-1 mx-2">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                          const pageNum = idx + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={!hasNextPage}
                        className="gap-2"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panel de notificaciones */}
      <NotificationsPanel 
        isOpen={showNotificationsPanel} 
        onClose={() => setShowNotificationsPanel(false)} 
      />

      {/* Modal de perfil */}
      {selectedUser && (
        <UserProfileModal
          username={selectedUser.username}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}