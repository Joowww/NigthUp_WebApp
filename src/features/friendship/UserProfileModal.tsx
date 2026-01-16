// src/features/friendship/UserProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Music, 
  Calendar, 
  UserPlus, 
  MessageCircle, 
  Check, 
  Clock, 
  Ban,
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
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { OnlineStatusIndicator } from '../../features/OnlineStatusIndicator';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { friendshipService } from './friendshipService';
import type { PublicProfileResponse } from '../../modules/friendship';
import { getFullName, getAvatarUrl } from '../../modules/friendship';

interface UserProfileModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (userId: string) => void;
}

export function UserProfileModal({ 
  username, 
  isOpen, 
  onClose,
  onSendRequest 
}: UserProfileModalProps) {
  
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && username) {
      loadProfile();
    }
  }, [isOpen, username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getPublicProfile(username);
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      error('Error al cargar el perfil');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!profile) return;
    
    try {
      await onSendRequest(profile.user._id);
      // Actualizar estado local
      setProfile({
        ...profile,
        friendshipStatus: 'pending'
      });
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  const handleSendMessage = () => {
    if (!profile) return;
    navigate('/chat', { state: { startChatWith: profile.user._id } });
    onClose();
  };

  if (!profile && !loading) return null;

  const user = profile?.user;
  const fullName = user ? getFullName(user) : '';
  const avatarUrl = user ? getAvatarUrl(user) : '';
  const coverUrl = (user as any)?.coverPhoto?.startsWith('http') 
    ? (user as any).coverPhoto
    : (user as any)?.coverPhoto
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${(user as any).coverPhoto}`
      : '/default-cover.jpg';

  // Determinar botón de acción
  const getActionButton = () => {
    if (!profile) return null;

    switch (profile.friendshipStatus) {
      case 'accepted':
        return (
          <Button
            onClick={handleSendMessage}
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar mensaje
          </Button>
        );
      
      case 'pending':
        return (
          <Button
            disabled
            variant="outline"
            className="flex-1 gap-2"
          >
            <Clock className="w-4 h-4" />
            Solicitud enviada
          </Button>
        );
      
      case 'blocked':
        return (
          <Button
            disabled
            variant="destructive"
            className="flex-1 gap-2 opacity-50"
          >
            <Ban className="w-4 h-4" />
            Usuario bloqueado
          </Button>
        );
      
      default:
        return (
          <Button
            onClick={handleSendRequest}
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary"
          >
            <UserPlus className="w-4 h-4" />
            Agregar amigo
          </Button>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-background border-border">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : user ? (
          <ScrollArea className="h-[90vh]">
            {/* Cover Photo */}
            <div 
              className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${coverUrl})` }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar y Info Principal */}
            <div className="px-6 -mt-16 relative z-10">
              <div className="flex items-end gap-4 mb-4">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarUrl} alt={user.username} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-secondary text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 pb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {fullName}
                  </h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <div className="mt-2">
                    <OnlineStatusIndicator userId={user._id} showText={true} />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 mb-6">
                {getActionButton()}
                {profile.friendshipStatus === 'accepted' && (
                  <Button variant="outline" className="gap-2">
                    Ver eventos comunes
                  </Button>
                )}
              </div>

              <Separator className="my-6" />

              {/* Bio */}
              {user.bio && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Sobre mí
                    </h3>
                    <p className="text-foreground">{user.bio}</p>
                  </div>
                  <Separator className="my-6" />
                </>
              )}

              {/* Información */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Información
                </h3>

                {(user.city || user.comunidad) && (
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{user.city || user.comunidad}</span>
                  </div>
                )}

                {(user as any).website && (
                  <div className="flex items-center gap-3 text-foreground">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a 
                      href={(user as any).website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {(user as any).website}
                    </a>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Redes sociales */}
              {(user as any).socialMedia && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      Redes Sociales
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(user as any).socialMedia.instagram && (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a 
                            href={`https://instagram.com/${(user as any).socialMedia.instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Instagram className="w-4 h-4" />
                            Instagram
                          </a>
                        </Button>
                      )}
                      {(user as any).socialMedia.twitter && (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a 
                            href={`https://twitter.com/${(user as any).socialMedia.twitter}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Twitter className="w-4 h-4" />
                            Twitter
                          </a>
                        </Button>
                      )}
                      {(user as any).socialMedia.facebook && (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a 
                            href={`https://facebook.com/${(user as any).socialMedia.facebook}`} 
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
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Intereses Musicales
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.intereses.map((interest, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="bg-secondary/20 hover:bg-secondary/30"
                        >
                          {interest}
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
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Próximos Eventos ({user.events.length})
                  </h3>
                  <div className="space-y-2">
                    {user.events.slice(0, 5).map(event => (
                      <div 
                        key={event._id}
                        className="p-3 bg-card/50 border border-border/50 rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <h4 className="font-medium text-foreground">{event.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(event.schedule).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          {event.city && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{event.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}