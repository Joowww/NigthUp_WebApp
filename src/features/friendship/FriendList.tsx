// src/features/friendship/FriendsList.tsx
import { useState, useEffect, useMemo } from 'react';
import { Users, Loader2, Search, X } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { FriendCard } from './FriendCard';
import { FriendProfileModal } from './FriendProfileModal';
import { friendshipService } from './friendshipService';
import { getFullName, type PublicUserWithFriendship, type FriendshipStatusType } from '../../modules/friendship';
import { useNavigate } from 'react-router-dom';
import { useOnlineUsers } from '../../context/OnlineUsersContext';
import { useAuth } from '../../hooks/useAuth';
import { socketService } from '../../lib/socket';
import { useFriendshipContext } from '../../context/FriendshipContext';

export function FriendsList() {
  const [friends, setFriends] = useState<PublicUserWithFriendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<PublicUserWithFriendship | null>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const navigate = useNavigate();
  const { isUserOnline } = useOnlineUsers();
  const { updateFriendship } = useFriendshipContext();
  const { user } = useAuth();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsList: PublicUserWithFriendship[] = await friendshipService.getFriendsV2();

      // ✅ Asegurarse de que todos los objetos tengan status y friendshipId
      const mappedFriends = friendsList.map(f => ({
        ...f,
        status: f.status ?? 'friends', // todos los que vienen de friendsList se consideran amigos
        friendshipId: f.friendshipId ?? null,
      }));

      console.log('📋 [FriendsList] Amigos cargados:', mappedFriends);
      setFriends(mappedFriends);
    } catch (err) {
      console.error('❌ Error cargando amigos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = useMemo(() => {
    let result = friends;

    if (searchQuery.trim()) {
      result = result.filter(friend =>
        friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getFullName(friend).toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showOnlineOnly) {
      result = result.filter(friend => isUserOnline(friend._id));
    }

    return result;
  }, [friends, searchQuery, showOnlineOnly, isUserOnline]);

  const onlineCount = friends.filter(f => isUserOnline(f._id)).length;

  const handleSendMessage = (friend: PublicUserWithFriendship) => {
    navigate('/chat', { state: { startChatWith: friend._id } });
  };

  const handleRemoveFriend = async (friend: PublicUserWithFriendship) => {
    if (!confirm(`¿Eliminar a ${getFullName(friend)} de tus amigos?`)) return;

    try {
      if (friend.friendshipId) {
        console.log('🗑️ [FriendsList] Eliminando amigo:', friend.username, friend.friendshipId);
        await friendshipService.removeFriend(friend.friendshipId);

        updateFriendship(friend._id, 'none', null);

        if (user?.id) {
          socketService.emitFriendRemoved(friend._id, friend.friendshipId, user.id);
        }

        setFriends(prev => prev.filter(f => f._id !== friend._id));

        console.log('✅ [FriendsList] Amigo eliminado correctamente');
      }
    } catch (err) {
      console.error('❌ Error eliminando amigo:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando amigos...</p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <Users className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Aún no tienes amigos</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Empieza a conectar con personas que comparten tus gustos musicales
        </p>
        <Button
          onClick={() => navigate('/friendship')}
          className="gap-2 bg-gradient-to-r from-primary to-secondary"
        >
          <Users className="w-4 h-4" />
          Descubrir personas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            Mis Amigos
            <Badge variant="outline">{filteredFriends.length}</Badge>
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {onlineCount > 0 && <span className="text-green-500">🟢 {onlineCount} online</span>}
          </p>
        </div>

        <Button onClick={() => navigate('/friendship')} variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Descubrir más personas
        </Button>
      </div>

      {/* Controles */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, usuario o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Button
          variant={showOnlineOnly ? 'default' : 'outline'}
          onClick={() => setShowOnlineOnly(!showOnlineOnly)}
          className="gap-2"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              showOnlineOnly ? 'bg-white animate-pulse' : 'bg-green-500'
            }`}
          />
          Solo online
        </Button>
      </div>

      {/* Grid */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => {
            if (!friend || !friend.username) {
              console.warn('⚠️ Amigo sin username:', friend);
              return null;
            }

            return (
              <FriendCard
                key={friend._id}
                friend={friend}
                onViewProfile={() => setSelectedFriend(friend)}
                onSendMessage={() => handleSendMessage(friend)}
                onRemove={() => handleRemoveFriend(friend)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            {showOnlineOnly
              ? 'Ninguno de tus amigos está online ahora'
              : `No se encontraron amigos con "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Modal de perfil */}
      {selectedFriend && (
        <FriendProfileModal
          friend={selectedFriend}
          isOpen={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onSendMessage={() => handleSendMessage(selectedFriend)}
          onRemove={() => handleRemoveFriend(selectedFriend)}
        />
      )}
    </div>
  );
}
