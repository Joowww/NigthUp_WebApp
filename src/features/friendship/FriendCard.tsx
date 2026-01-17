// src/features/friendship/FriendCard.tsx
import { MessageCircle, UserMinus, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { OnlineStatusBadge } from '../OnlineStatusBadge';
import { getAvatarUrl, getFullName } from '../../modules/friendship';
import type { PublicUser } from '../../modules/friendship';
import { FriendshipButton } from './FriendshipButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { PublicUserWithFriendship } from '../../modules/friendship';


interface FriendCardProps {
    friend: PublicUserWithFriendship;
    onViewProfile: () => void;
    onSendMessage: () => void;
    onRemove: () => void;
  }

export function FriendCard({ friend, onViewProfile, onSendMessage, onRemove }: FriendCardProps) {
  const fullName = getFullName(friend);
  const avatarUrl = getAvatarUrl(friend);

  // ✅ VALIDACIÓN: Asegurarse de que friend y username existen
  if (!friend || !friend.username) {
    console.error('❌ FriendCard: friend o username es undefined', friend);
    return null; // No renderizar nada si no hay datos
  }

  return (
    <Card 
      className="group hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onViewProfile}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar con online badge */}
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-border group-hover:border-primary/50 transition-colors">
              <AvatarImage src={avatarUrl} alt={friend.username} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold">
                {friend.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="absolute bottom-0 right-0">
              <OnlineStatusBadge userId={friend._id} size="md" showOffline={true} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {fullName}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  @{friend.username}
                </p>
              </div>

              {/* Menú de opciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProfile(); }}>
                    Ver perfil completo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSendMessage(); }}>
                    Enviar mensaje
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="text-destructive focus:text-destructive"
                  >
                    Eliminar amigo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Ubicación */}
            {(friend.city || friend.comunidad) && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                📍 {friend.city || friend.comunidad}
              </p>
            )}
          </div>
        </div>

        {/* Bio preview */}
        {friend.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {friend.bio}
          </p>
        )}

        {/* Botón de amistad y acciones rápidas */}
        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
          {/* ✅ FriendshipButton maneja agregar/aceptar/rechazar */}
          <FriendshipButton
            userId={friend._id}
            friendshipId={friend.friendshipId ?? null}
            status={friend.status ?? 'none'}
            fullWidth
          />

          {/* Botón enviar mensaje siempre disponible */}
          <Button
            onClick={onSendMessage}
            size="sm"
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <MessageCircle className="w-4 h-4" />
            Mensaje
          </Button>

          {/* Botón eliminar amigo solo si ya son amigos */}
          {friend.status === 'friends' && (
            <Button
              onClick={onRemove}
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-destructive/10 hover:text-destructive"
              title="Eliminar amigo"
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
