// src/features/friendship/FriendProfileModal.tsx (NUEVO ARCHIVO)
import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Music, 
  Calendar, 
  MessageCircle,
  UserMinus,
  Loader2,
  Globe,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { OnlineStatusBadge } from '../OnlineStatusBadge';
import { MutualFriends } from './MutualFriends';
import { friendshipService } from './friendshipService';
import { getFullName, getAvatarUrl } from '../../modules/friendship';
import type { PublicUser } from '../../modules/friendship';

interface FriendProfileModalProps {
  friend: PublicUser;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: () => void;
  onRemove: () => void;
}

export function FriendProfileModal({ 
  friend, 
  isOpen, 
  onClose,
  onSendMessage,
  onRemove
}: FriendProfileModalProps) {
  
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && friend.username) {
      loadFullProfile();
    }
  }, [isOpen, friend.username]);

  const loadFullProfile = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getPublicProfile(friend.username);
      
      // Adaptador
      if ('_id' in data && !('user' in data)) {
        setFullProfile(data);
      } else {
        setFullProfile((data as any).user);
      }
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      setFullProfile(friend); // Usar datos básicos si falla
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = () => {
    onRemove();
    onClose();
  };

  const user = fullProfile || friend;
  const fullName = getFullName(user);
  const avatarUrl = getAvatarUrl(user);
  const coverUrl = user?.coverPhoto?.startsWith('http') 
    ? user.coverPhoto
    : user?.coverPhoto
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.coverPhoto}`
      : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-background border-border/50 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{fullName}</DialogTitle>
          <DialogDescription>Perfil de {fullName}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="h-[95vh]">
            {/* Cover Photo */}
            <div className="relative">
              <div 
                className="h-56 bg-gradient-to-br from-primary/30 via-secondary/20 to-background bg-cover bg-center relative"
                style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2.5 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all text-white z-10 hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar */}
              <div className="px-8 -mt-20 relative z-10">
                <div className="relative inline-block">
                  <Avatar className="w-36 h-36 border-4 border-background shadow-2xl ring-4 ring-primary/20">
                    <AvatarImage src={avatarUrl} alt={user.username} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-white font-bold">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="absolute bottom-2 right-2">
                    <OnlineStatusBadge 
                      userId={user._id} 
                      size="lg" 
                      showOffline={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="px-8 pt-4 pb-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-1">
                  {fullName}
                </h2>
                <p className="text-lg text-muted-foreground">@{user.username}</p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 mb-6">
                <Button
                  onClick={onSendMessage}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar mensaje
                </Button>

                <Button
                  onClick={handleRemoveFriend}
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <UserMinus className="w-5 h-5" />
                  Eliminar amigo
                </Button>
              </div>

              {/* Amigos en común */}
              <div className="mb-6">
                <MutualFriends 
                  userId={user._id} 
                  limit={5}
                  showAvatars={true}
                />
              </div>

              <Separator className="my-6" />

              {/* Bio */}
              {user.bio && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Sobre mí
                    </h3>
                    <p className="text-foreground leading-relaxed text-base">
                      {user.bio}
                    </p>
                  </div>
                  <Separator className="my-6" />
                </>
              )}

              {/* Información */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Información
                </h3>

                <div className="grid gap-4">
                  {(user.city || user.comunidad) && (
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Ubicación</p>
                        <p className="text-foreground font-medium">
                          {user.city}
                          {user.city && user.comunidad && ', '}
                          {user.comunidad}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Sitio web</p>
                        <a 
                          href={user.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium break-all"
                        >
                          {user.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Redes sociales */}
              {user.socialMedia && (user.socialMedia.instagram || user.socialMedia.twitter || user.socialMedia.facebook) && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Redes Sociales
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {user.socialMedia.instagram && (
                        <Button variant="outline" size="sm" className="gap-2 hover:bg-pink-500/10 hover:border-pink-500/30" asChild>
                          <a 
                            href={`https://instagram.com/${user.socialMedia.instagram.replace('@', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Instagram className="w-4 h-4" />
                            {user.socialMedia.instagram}
                          </a>
                        </Button>
                      )}
                      {user.socialMedia.twitter && (
                        <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-500/10 hover:border-blue-500/30" asChild>
                          <a 
                            href={`https://twitter.com/${user.socialMedia.twitter.replace('@', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Twitter className="w-4 h-4" />
                            {user.socialMedia.twitter}
                          </a>
                        </Button>
                      )}
                      {user.socialMedia.facebook && (
                        <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-600/10 hover:border-blue-600/30" asChild>
                          <a 
                            href={`https://facebook.com/${user.socialMedia.facebook}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Facebook className="w-4 h-4" />
                            Facebook
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <Separator className="my-6" />
                </>
              )}

              {/* Intereses musicales */}
              {user.intereses && user.intereses.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Intereses Musicales
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.intereses.map((interest: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="px-4 py-2 text-sm bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:from-primary/20 hover:to-secondary/20 transition-colors"
                        >
                          🎵 {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator className="my-6" />
                </>
              )}

              {/* Próximos eventos */}
              {user.events && user.events.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Próximos Eventos ({user.events.length})
                  </h3>
                  <div className="space-y-3">
                    {user.events.slice(0, 5).map((event: any) => (
                      <div 
                        key={event._id}
                        className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 border border-border/50 rounded-lg hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {event.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(event.schedule).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {event.city && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{event.city}</span>
                            </div>
                          )}
                          {event.category && (
                            <Badge variant="outline" className="text-xs">
                              {event.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}