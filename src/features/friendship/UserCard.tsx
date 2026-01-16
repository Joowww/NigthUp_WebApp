// src/features/friendship/UserCard.tsx
import React from 'react';
import { MapPin, Music, UserPlus, MessageCircle, Check, Clock, Ban } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { OnlineStatusBadge } from '../../features/OnlineStatusBadge';
import type { PublicUser } from '../../modules/friendship';
import { getFullName, getAvatarUrl } from '../../modules/friendship';

interface UserCardProps {
  user: PublicUser;
  onViewProfile: () => void;
  onSendRequest: () => void;
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'blocked';
}

export function UserCard({ 
  user, 
  onViewProfile, 
  onSendRequest,
  friendshipStatus = 'none'
}: UserCardProps) {
  
  const fullName = getFullName(user);
  const avatarUrl = getAvatarUrl(user);
  const location = user.city || user.comunidad || 'Ubicación no especificada';

  // Determinar el estado del botón
  const getActionButton = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return (
          <Button
            disabled
            size="sm"
            className="w-full gap-2 bg-green-500/20 text-green-500 cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Amigos
          </Button>
        );
      
      case 'pending':
        return (
          <Button
            disabled
            size="sm"
            variant="outline"
            className="w-full gap-2 cursor-not-allowed"
          >
            <Clock className="w-4 h-4" />
            Solicitud enviada
          </Button>
        );
      
      case 'blocked':
        return (
          <Button
            disabled
            size="sm"
            variant="destructive"
            className="w-full gap-2 cursor-not-allowed opacity-50"
          >
            <Ban className="w-4 h-4" />
            Bloqueado
          </Button>
        );
      
      default:
        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSendRequest();
            }}
            size="sm"
            className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <UserPlus className="w-4 h-4" />
            Agregar amigo
          </Button>
        );
    }
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
      onClick={onViewProfile}
    >
      <CardContent className="p-0">
        {/* Avatar y estado online */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-border group-hover:border-primary/50 transition-colors">
                <AvatarImage src={avatarUrl} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Indicador online/offline */}
              <div className="absolute bottom-0 right-0">
                <OnlineStatusBadge 
                  userId={user._id} 
                  size="md" 
                  showOffline={true}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {fullName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="px-6 pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          </div>
        )}

        {/* Ubicación */}
        <div className="px-6 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Intereses musicales */}
        {user.intereses && user.intereses.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Intereses:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.intereses.slice(0, 3).map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-secondary/20 hover:bg-secondary/30"
                >
                  {interest}
                </Badge>
              ))}
              {user.intereses.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{user.intereses.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="p-4 pt-0 space-y-2">
          {getActionButton()}
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            Ver perfil completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}