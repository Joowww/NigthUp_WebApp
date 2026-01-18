// src/features/friendship/UserCard.tsx
import { MapPin, Music } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { OnlineStatusBadge } from '../../features/OnlineStatusBadge';
import { FriendshipButton } from './FriendshipButton';
import { MutualFriends } from './MutualFriends';
import type { SearchUser } from '../../modules/friendship';
import { getFullName, getAvatarUrl } from '../../modules/friendship';
import { useFriendshipContext } from '../../context/FriendshipContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: SearchUser;
  onViewProfile: () => void;
  onStatusChange?: (newStatus: string) => void;
}

export function UserCard({
  user: initialUser,
  onViewProfile,
  onStatusChange
}: UserCardProps) {
  const { getFriendshipStatus } = useFriendshipContext();
  const navigate = useNavigate();

  // Obtener estado reactivo sobreescribiendo el inicial del prop
  const friendshipState = getFriendshipStatus(initialUser._id, initialUser.status as any);
  const user = {
    ...initialUser,
    status: friendshipState.status,
    friendshipId: friendshipState.friendshipId || initialUser.friendshipId
  };

  const fullName = getFullName(user);
  const avatarUrl = getAvatarUrl(user);
  const location = user.city || user.comunidad || 'Ubicación no especificada';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, type: "spring", damping: 12 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] bg-card/50 backdrop-blur-md rounded-3xl"
        onClick={onViewProfile}
      >
        <CardContent className="p-0">
          {/* Top Section with Background tint */}
          <div className="relative p-6 pb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-start gap-5 relative z-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-2xl blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
                <Avatar className="w-16 h-16 border-2 border-background group-hover:border-primary/20 transition-all shadow-xl rounded-2xl overflow-hidden">
                  <AvatarImage src={avatarUrl} alt={user.username} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute -bottom-1 -right-1">
                  <OnlineStatusBadge
                    userId={user._id}
                    size="md"
                    showOffline={true}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-extrabold text-foreground truncate group-hover:text-primary transition-colors text-lg tracking-tight">
                  {fullName}
                </h3>
                <p className="text-sm text-muted-foreground/80 truncate font-semibold">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="px-6 pb-4 relative z-10">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                {user.bio}
              </p>
            </div>
          )}

          {/* Details Row */}
          <div className="px-6 pb-4 space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground/70 font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
              <span className="truncate">{location}</span>
            </div>

            <div className="pt-2">
              <MutualFriends
                userId={user._id}
                limit={3}
                showAvatars={true}
              />
            </div>
          </div>

          {/* Interests */}
          {user.intereses && user.intereses.length > 0 && (
            <div className="px-6 pb-6 relative z-10">
              <div className="flex flex-wrap gap-2">
                {user.intereses.slice(0, 2).map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-[9px] bg-muted/60 hover:bg-muted border-none uppercase font-black tracking-widest px-2.5 py-1 rounded-lg"
                  >
                    {interest}
                  </Badge>
                ))}
                {user.intereses.length > 2 && (
                  <Badge variant="outline" className="text-[9px] font-black border-dashed opacity-50 px-2 py-1">
                    +{user.intereses.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Glass Action Bar */}
          <div className="p-4 pt-4 mt-auto border-t border-border/30 bg-muted/20 backdrop-blur-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <FriendshipButton
              userId={user._id}
              friendshipId={user.friendshipId}
              status={user.status as any}
              onStatusChange={onStatusChange}
              size="sm"
              fullWidth={true}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onViewProfile}
                variant="outline"
                size="sm"
                className="w-full gap-2 border-border/40 hover:bg-background/80 font-bold text-xs rounded-xl h-10"
              >
                Perfil
              </Button>

              {user.status === 'friends' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('💬 [UserCard] Iniciando chat con:', user._id);
                    navigate('/chat', { state: { startChatWith: user._id } });
                  }}
                  variant="default"
                  size="sm"
                  className="w-full gap-2 bg-gradient-to-r from-primary/80 to-secondary/80 hover:opacity-100 text-white border-0 shadow-md font-bold text-xs rounded-xl h-10"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}