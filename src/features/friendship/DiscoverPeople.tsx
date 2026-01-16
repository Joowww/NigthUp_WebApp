// src/features/friendship/DiscoverPeople.tsx
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { useToast } from '../../hooks/useToast';
import { friendshipService } from './friendshipService';
import { UserCard } from './UserCard';
import { UserProfileModal } from './UserProfileModal';
import type { SearchUser } from '../../modules/friendship';

export default function DiscoverPeople() {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const { success, error } = useToast();

  // Cargar usuarios iniciales
  useEffect(() => {
    loadUsers('');
  }, []);

  // Buscar con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers(searchQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadUsers = async (query: string) => {
    try {
      console.log('🔄 [DiscoverPeople] Buscando usuarios con query:', query);
      setLoading(true);

      const fetchedUsers = await friendshipService.searchUsers(query);
      
      console.log('✅ [DiscoverPeople] Usuarios recibidos:', fetchedUsers.length);
      
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('❌ [DiscoverPeople] Error loading users:', err);
      error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      console.log('📤 [DiscoverPeople] Enviando solicitud a:', userId);
      await friendshipService.sendFriendRequest(userId);
      success('Solicitud de amistad enviada');
      
      // Actualizar estado local
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, status: 'pending_sent' as any }
          : user
      ));
    } catch (err) {
      console.error('❌ [DiscoverPeople] Error sending request:', err);
      error('Error al enviar solicitud');
    }
  };

  return (
    <div className="h-full w-full bg-background">
      <ScrollArea className="h-full w-full custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Descubre Gente
              </h1>
              <p className="text-muted-foreground mt-1">
                Encuentra personas con tus mismos gustos para salir de fiesta
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar por nombre o usuario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {searchQuery ? `Resultados (${users.length})` : `Usuarios disponibles (${users.length})`}
              </CardTitle>
              <Button
                onClick={() => loadUsers(searchQuery)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Recargar
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-20">
                  <UserPlus className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios disponibles'}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                      className="mt-4"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map(user => (
                    <UserCard
                      key={user._id}
                      user={user}
                      onViewProfile={() => setSelectedUser(user)}
                      onSendRequest={() => handleSendRequest(user._id)}
                      friendshipStatus={user.status as any}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Modal de perfil */}
      {selectedUser && (
        <UserProfileModal
          username={selectedUser.username}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onSendRequest={handleSendRequest}
        />
      )}
    </div>
  );
}