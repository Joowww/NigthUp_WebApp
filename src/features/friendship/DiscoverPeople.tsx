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
import { NotificationBadge } from './NotificationsBadge';
import type { SearchUser, FriendshipStatusType } from '../../modules/friendship';
import { useOnlineUsers } from '../../context/OnlineUsersContext';
import { useNotificationsContext } from '../../context/NotificationsContext';

type SearchUserWithFriendship = SearchUser & {
  status: FriendshipStatusType;
  friendshipId: string | null;
};

export default function DiscoverPeople() {
  const [allUsers, setAllUsers] = useState<SearchUserWithFriendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUserWithFriendship | null>(null);
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

  const { error } = useToast();
  const { isUserOnline, onlineUsers } = useOnlineUsers();
  const { unreadCount } = useNotificationsContext();
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const USERS_PER_PAGE = 9;

  // ELIMINADO: La sincronización manual ya no es necesaria pues UserCard 
  // usa getFriendshipStatus directamente del contexto en cada render.
  /*
  useEffect(() => {
    ...
  }, [friendshipUpdates]);
  */


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
    } catch (err) {
      console.error('❌ Error cargando opciones de filtros');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      const fetchedUsers: SearchUser[] = await friendshipService.searchUsers(
        searchQuery,
        1000,
        0,
        filters.city,
        filters.interest,
        filters.gender,
        false
      );

      const mappedUsers: SearchUserWithFriendship[] = fetchedUsers.map(u => ({
        ...u,
        status: u.status ?? 'none',
        friendshipId: u.friendshipId ?? null
      }));

      setAllUsers(mappedUsers);
      setTotalUsers(mappedUsers.length);
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
    console.log('🔍 [DiscoverPeople] Re-calculando filteredUsers. set size:', onlineUsers.size);
    let result = allUsers;

    if (filters.onlineOnly) {
      result = result.filter(user => isUserOnline(user._id));
    }

    return result;
  }, [allUsers, filters.onlineOnly, isUserOnline, onlineUsers]);

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
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Descubre Nuevas Amistades
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Conecta con personas que comparten tus gustos musicales 🎉
              </p>
            </div>

            <button
              onClick={() => setShowNotificationsPanel(true)}
              className="relative p-4 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/40 rounded-xl transition-all shadow-lg hover:shadow-xl"
              title="Ver notificaciones de amistad"
            >
              <Bell className="w-6 h-6 text-primary" />
              {unreadCount > 0 && (
                <NotificationBadge count={unreadCount} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>👥 {filteredUsers.length} usuarios {filters.onlineOnly ? 'online' : 'disponibles'}</span>
            <span>•</span>
            <span>🎵 {filterOptions.interests.length} géneros musicales</span>
            <span>•</span>
            <span>📍 {filterOptions.cities.length} ciudades</span>
          </div>
        </div>

        {/* Búsqueda y filtros */}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2"
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
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros de Búsqueda</CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    Limpiar ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">📍 Ciudad</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todas</option>
                    {filterOptions.cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">🎵 Género Musical</label>
                  <select
                    value={filters.interest}
                    onChange={(e) => setFilters({ ...filters, interest: e.target.value })}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todos</option>
                    {filterOptions.interests.map((interest) => (
                      <option key={interest} value={interest}>{interest}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">👤 Género</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id="onlineOnly"
                  checked={filters.onlineOnly}
                  onChange={(e) => setFilters({ ...filters, onlineOnly: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="onlineOnly" className="text-sm cursor-pointer">
                  Solo usuarios online
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Usuarios Disponibles
                </CardTitle>
                <CardDescription>
                  {paginatedUsers.length > 0 ? `Mostrando ${paginatedUsers.length} de ${filteredUsers.length}` : 'No hay resultados'}
                </CardDescription>
              </div>
              {totalPages > 1 && (
                <Badge variant="outline">Página {currentPage} de {totalPages}</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Buscando personas...</p>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No se encontraron usuarios</p>
                {activeFiltersCount > 0 && (
                  <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                    Limpiar filtros
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
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      {((currentPage - 1) * USERS_PER_PAGE) + 1}-{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={!hasPrevPage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={!hasNextPage}
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

      <NotificationsPanel
        isOpen={showNotificationsPanel}
        onClose={() => setShowNotificationsPanel(false)}
      />

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