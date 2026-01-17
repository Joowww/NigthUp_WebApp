// src/features/friendship/MutualFriends.tsx
import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { friendshipService } from './friendshipService';
import { getAvatarUrl } from '../../modules/friendship';

interface MutualFriendsProps {
  userId: string;
  limit?: number;
  showAvatars?: boolean;
  className?: string;
}

export function MutualFriends({ 
  userId, 
  limit = 3,
  showAvatars = true,
  className = '' 
}: MutualFriendsProps) {
  
  const [mutualFriends, setMutualFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMutualFriends();
  }, [userId]);

  const loadMutualFriends = async () => {
    try {
      setLoading(true);
      const friends = await friendshipService.getMutualFriends(userId, limit + 1); // Cargar uno más para saber si hay más
      setMutualFriends(friends);
    } catch (err) {
      console.error('Error loading mutual friends:', err);
      setMutualFriends([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Cargando...</span>
      </div>
    );
  }

  if (mutualFriends.length === 0) {
    return null;
  }

  const displayFriends = mutualFriends.slice(0, limit);
  const hasMore = mutualFriends.length > limit;
  const moreCount = hasMore ? mutualFriends.length - limit : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      
      {showAvatars && (
        <div className="flex -space-x-2">
          {displayFriends.map((friend) => (
            <Avatar
              key={friend._id}
              className="w-6 h-6 border-2 border-background ring-1 ring-border"
              title={friend.username}
            >
              <AvatarImage src={getAvatarUrl(friend)} alt={friend.username} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20">
                {friend.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {hasMore && (
            <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center ring-1 ring-border">
              <span className="text-[10px] font-semibold text-muted-foreground">
                +{moreCount}
              </span>
            </div>
          )}
        </div>
      )}
      
      <span className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{mutualFriends.length}</span>{' '}
        {mutualFriends.length === 1 ? 'amigo' : 'amigos'} en común
      </span>
    </div>
  );
}