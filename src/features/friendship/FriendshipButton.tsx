// src/features/friendship/FriendshipButton.tsx

import { useState, useEffect, useRef } from 'react';
import { UserPlus, Check, Clock, X, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { useFriendshipContext, type FriendshipStatusType } from '../../context/FriendshipContext';
import { useFriendshipActions } from './FriendshipActions';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendshipButtonProps {
  userId: string;
  friendshipId: string | null;
  status: FriendshipStatusType;
  onStatusChange?: (newStatus: FriendshipStatusType) => void;
  size?: 'sm' | 'lg';
  fullWidth?: boolean;
}

export function FriendshipButton({
  userId,
  friendshipId,
  status,
  onStatusChange,
  size = 'sm',
  fullWidth = false
}: FriendshipButtonProps) {

  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<FriendshipStatusType>(status);
  const lastContextStatus = useRef<FriendshipStatusType | null>(null);

  const { friendshipUpdates } = useFriendshipContext();
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriendshipActions();

  const baseClasses = fullWidth ? 'w-full' : '';

  useEffect(() => {
    const userIdStr = userId.toString();
    const update = friendshipUpdates.get(userIdStr);

    if (update && update.status !== lastContextStatus.current) {
      lastContextStatus.current = update.status;
      setCurrentStatus(update.status);
      onStatusChange?.(update.status);
    }
  }, [friendshipUpdates, userId, onStatusChange]);

  useEffect(() => {
    if (status !== currentStatus && status !== lastContextStatus.current) {
      setCurrentStatus(status);
      lastContextStatus.current = status;
    }
  }, [status, currentStatus]);

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await sendFriendRequest(userId);
      setCurrentStatus('pending_sent');
      onStatusChange?.('pending_sent');
    } catch (err) { } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendshipId) return;
    setLoading(true);
    try {
      await acceptFriendRequest(friendshipId, userId);
      setCurrentStatus('friends');
      onStatusChange?.('friends');
    } catch (err) { } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!friendshipId) return;
    setLoading(true);
    try {
      await rejectFriendRequest(friendshipId, userId, currentStatus === 'pending_sent');
      setCurrentStatus('none');
      onStatusChange?.('none');
    } catch (err) { } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled size={size} className={`${baseClasses} gap-2 rounded-xl`}>
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="animate-pulse">Procesando...</span>
      </Button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStatus}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className={fullWidth ? 'w-full' : ''}
      >
        {(() => {
          switch (currentStatus) {
            case 'friends':
            case 'accepted' as any:
              return (
                <Button disabled size={size} className={`${baseClasses} gap-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-bold`}>
                  <Check className="w-4 h-4" />
                  Amigos
                </Button>
              );

            case 'pending_sent':
              return (
                <Button onClick={handleCancelRequest} variant="outline" size={size} className={`${baseClasses} gap-2 rounded-xl border-dashed hover:bg-destructive/10 hover:text-destructive group`}>
                  <Clock className="w-4 h-4 group-hover:hidden" />
                  <span className="group-hover:hidden">Solicitud enviada</span>
                  <X className="w-4 h-4 hidden group-hover:block" />
                  <span className="hidden group-hover:block uppercase text-[10px] font-black tracking-widest">Cancelar</span>
                </Button>
              );

            case 'pending_received':
              return (
                <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
                  <Button onClick={handleAcceptRequest} size={size} className={`${fullWidth ? 'flex-1' : ''} gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20`}>
                    <Check className="w-4 h-4" />
                    Aceptar
                  </Button>
                  <Button onClick={handleCancelRequest} variant="outline" size={size} className="gap-2 hover:bg-destructive/10 rounded-xl border-border/40">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );

            case 'blocked':
              return (
                <Button disabled variant="destructive" size={size} className={`${baseClasses} gap-2 opacity-50 rounded-xl font-bold`}>
                  Bloqueado
                </Button>
              );

            default:
              return (
                <Button onClick={handleSendRequest} size={size} className={`${baseClasses} gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow`}>
                  <UserPlus className="w-4 h-4" />
                  Agregar amigo
                </Button>
              );
          }
        })()}
      </motion.div>
    </AnimatePresence>
  );
}