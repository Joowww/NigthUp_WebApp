// src/features/friendship/UserProfileModal.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  X,
  MapPin,
  Music,
  Calendar,
  MessageCircle,
  Loader2,
  Globe,
  Instagram,
  Twitter,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
import { OnlineStatusBadge } from '../../features/OnlineStatusBadge';
import { FriendshipButton } from './FriendshipButton';
import { MutualFriends } from './MutualFriends';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { friendshipService } from './friendshipService';
import { getFullName, getAvatarUrl } from '../../modules/friendship';
import { useFriendshipContext } from '../../context/FriendshipContext';

interface UserProfileModalProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({
  username,
  isOpen,
  onClose
}: UserProfileModalProps) {

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();
  const navigate = useNavigate();
  const { getFriendshipStatus } = useFriendshipContext();

  const triggerConfetti = useCallback(() => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getPublicProfile(username);

      let finalData = data;
      const userObj = ('user' in data) ? data.user : (('_id' in data) ? data : null);

      if (userObj && (('_id' in data && !('user' in data)) || !data.friendshipStatus || data.friendshipStatus === 'none' || (data.friendshipStatus as string) === 'accepted')) {
        try {
          const statusRes = await friendshipService.getFriendshipStatus(userObj._id);
          // statusRes ahora es { status, friendshipId, ... } donde status es ya 'friends', 'pending_sent', etc.
          const normalizedStatus = statusRes.status || 'none';

          finalData = {
            user: userObj,
            friendshipStatus: normalizedStatus as any,
            friendshipId: statusRes.friendshipId || null,
            canMessage: normalizedStatus === 'friends'
          };
        } catch (statusErr) {
          finalData = {
            user: userObj,
            friendshipStatus: 'none',
            friendshipId: null,
            canMessage: false
          };
        }
      } else {
        const rawStatus = data.friendshipStatus as string;
        const normalizedStatus = rawStatus === 'accepted' ? 'friends' : (rawStatus === 'pending' ? 'pending_sent' : data.friendshipStatus);

        finalData = {
          ...data,
          friendshipStatus: normalizedStatus as any,
          canMessage: normalizedStatus === 'friends'
        };
      }
      setProfile(finalData);

      // Lanzar confeti si el perfil carga con éxito y estamos abiertos
      if (isOpen) {
        setTimeout(triggerConfetti, 300);
      }
    } catch (err) {
      console.error('❌ [UserProfileModal] Error loading profile:', err);
      error('Error al cargar el perfil');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && username) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [isOpen, username]);

  const friendshipState = getFriendshipStatus(
    profile?.user?._id || '',
    (profile?.friendshipStatus as any) || 'none'
  );

  const currentStatus = friendshipState.status || (profile?.friendshipStatus as any) || 'none';
  const currentFriendshipId = friendshipState.friendshipId || profile?.friendshipId;

  const handleSendMessage = () => {
    if (profile?.user?._id) {
      navigate('/chat', { state: { startChatWith: profile.user._id } });
      onClose();
    }
  };

  const user = profile?.user;
  const fullName = user ? getFullName(user) : '';
  const avatarUrl = user ? getAvatarUrl(user) : '';
  const coverUrl = user?.coverPhoto?.startsWith('http')
    ? user.coverPhoto
    : user?.coverPhoto
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.coverPhoto}`
      : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/40 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl sm:rounded-3xl border">
        <DialogHeader className="sr-only">
          <DialogTitle>{fullName || username}</DialogTitle>
          <DialogDescription>Perfil de {fullName || username}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[60vh] gap-4"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
              </div>
              <p className="text-muted-foreground font-medium animate-pulse">Cargando perfil...</p>
            </motion.div>
          ) : user ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <ScrollArea className="h-[92vh]">
                {/* Cover Photo */}
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${coverUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/90 border border-white/10 hover:bg-black/60 transition-colors z-20"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-background to-transparent" />
                </div>

                {/* Profile Header Block */}
                <div className="px-8 -mt-24 relative z-10">
                  <div className="flex flex-col sm:flex-row items-end gap-6 mb-8">
                    <motion.div
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 12, delay: 0.1 }}
                      className="relative"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-3xl blur opacity-30"></div>
                      <Avatar className="w-40 h-40 sm:w-44 sm:h-44 border-4 border-background shadow-2xl relative overflow-hidden rounded-3xl">
                        <AvatarImage src={avatarUrl} alt={user.username} className="object-cover" />
                        <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-secondary text-white font-bold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
                        <OnlineStatusBadge userId={user._id} size="lg" showOffline={true} />
                      </div>
                    </motion.div>

                    <div className="flex-1 pb-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center gap-3 mb-2"
                      >
                        <h2 className="text-4xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                          {fullName}
                        </h2>
                        {currentStatus === 'friends' && (
                          <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 self-center">
                            <Heart className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Amigo</span>
                          </Badge>
                        )}
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-muted-foreground font-medium"
                      >
                        @{user.username}
                      </motion.p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 mb-10"
                  >
                    <div className="flex-1">
                      <FriendshipButton
                        userId={user._id}
                        friendshipId={currentFriendshipId}
                        status={currentStatus as any}
                        onStatusChange={(newStatus) => {
                          setProfile((prev: any) => ({ ...prev, friendshipStatus: newStatus }));
                        }}
                        size="lg"
                        fullWidth={true}
                      />
                    </div>
                    {currentStatus === 'friends' && (
                      <Button
                        onClick={handleSendMessage}
                        variant="default"
                        size="lg"
                        className="gap-2 sm:px-10 h-14 text-base font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                      >
                        <MessageCircle className="w-5 h-5 text-primary" />
                        Enviar Mensaje
                      </Button>
                    )}
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Social & Info */}
                        <div className="space-y-10">
                          {/* Bio Section */}
                          {user.bio && (
                            <section>
                              <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sobre mí</h3>
                              </div>
                              <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                                {user.bio}
                              </p>
                            </section>
                          )}

                          {/* Info Cards */}
                          <section>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Información</h3>
                            <div className="space-y-3">
                              {(user.city || user.comunidad) && (
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group">
                                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Ubicación</p>
                                    <p className="text-foreground font-semibold">{user.city}{user.city && user.comunidad && ', '}{user.comunidad}</p>
                                  </div>
                                </div>
                              )}
                              {user.website && (
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group">
                                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                                    <Globe className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Sitio web</p>
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold block truncate">
                                      {user.website.replace(/^https?:\/\//, '')}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* Social links */}
                          {user.socialMedia && (user.socialMedia.instagram || user.socialMedia.twitter || user.socialMedia.facebook) && (
                            <section>
                              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Conectar</h3>
                              <div className="flex flex-wrap gap-3">
                                {user.socialMedia.instagram && (
                                  <Button variant="outline" className="rounded-xl px-4 py-6 border-pink-500/10 hover:bg-pink-500/5 hover:border-pink-500/30 group transition-all" asChild>
                                    <a href={`https://instagram.com/${user.socialMedia.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                      <Instagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                                      <span className="font-semibold ml-2 text-foreground/80">{user.socialMedia.instagram}</span>
                                    </a>
                                  </Button>
                                )}
                                {user.socialMedia.twitter && (
                                  <Button variant="outline" className="rounded-xl px-4 py-6 border-blue-400/10 hover:bg-blue-400/5 hover:border-blue-400/30 group transition-all" asChild>
                                    <a href={`https://twitter.com/${user.socialMedia.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                      <Twitter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                      <span className="font-semibold ml-2 text-foreground/80">{user.socialMedia.twitter}</span>
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </section>
                          )}
                        </div>

                        {/* Right Column: Music & Events */}
                        <div className="space-y-10">
                          {/* Mutual Friends */}
                          <section className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Conexiones</h3>
                            <MutualFriends userId={user._id} limit={6} showAvatars={true} />
                          </section>

                          {/* Music Genre Badges */}
                          {user.intereses && user.intereses.length > 0 && (
                            <section>
                              <div className="flex items-center gap-2 mb-5">
                                <Music className="w-4 h-4 text-primary" />
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0">Vibe Musical</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {user.intereses.map((interest: string, index: number) => (
                                  <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 text-foreground font-semibold text-sm shadow-sm backdrop-blur-sm"
                                  >
                                    {interest}
                                  </motion.div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Events List */}
                          {user.events && user.events.length > 0 && (
                            <section>
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0">Próximas Salidas</h3>
                                </div>
                                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none font-bold text-xs">{user.events.length}</Badge>
                              </div>
                              <div className="space-y-4">
                                {user.events.slice(0, 4).map((event: any, i: number) => (
                                  <motion.div
                                    key={event._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="p-5 bg-muted/20 border border-border/50 rounded-2xl hover:border-primary/40 hover:bg-muted/40 transition-all group cursor-pointer shadow-sm"
                                  >
                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg mb-2">
                                      {event.name}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                      <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                          {new Date(event.schedule).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                      </div>
                                      {event.city && (
                                        <div className="flex items-center gap-1.5">
                                          <MapPin className="w-3.5 h-3.5" />
                                          <span className="truncate max-w-[100px]">{event.city}</span>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-20" /> {/* Bottom spacing */}
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-96"
            >
              <p className="text-muted-foreground">No se pudo cargar el perfil</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}