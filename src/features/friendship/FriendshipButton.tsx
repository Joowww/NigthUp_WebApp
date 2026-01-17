// src/features/friendship/FriendshipButton.tsx

import { useState, useEffect, useRef } from 'react';
import { UserPlus, Check, Clock, X, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { useFriendshipContext, type FriendshipStatusType } from '../../context/FriendshipContext';
import { useFriendshipActions } from './FriendshipActions'; // ✅ IMPORTAR

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
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriendshipActions(); // ✅ USAR HOOK

  const baseClasses = fullWidth ? 'w-full' : '';

  // ✅ Sincronización con contexto
  useEffect(() => {
    const update = friendshipUpdates.get(userId);
    
    if (update && update.status !== lastContextStatus.current) {
      console.log('🔄 [FriendshipButton] Context update:', userId, update.status);
      lastContextStatus.current = update.status;
      setCurrentStatus(update.status);
      onStatusChange?.(update.status);
    }
  }, [friendshipUpdates, userId, onStatusChange]);

  // ✅ Sincronización con prop
  useEffect(() => {
    if (status !== currentStatus && status !== lastContextStatus.current) {
      console.log('🔄 [FriendshipButton] Prop update:', status);
      setCurrentStatus(status);
      lastContextStatus.current = status;
    }
  }, [status, currentStatus]);

  // 📤 Enviar solicitud
  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await sendFriendRequest(userId);
      setCurrentStatus('pending_sent');
      onStatusChange?.('pending_sent');
    } catch (err) {
      // Ya manejado en useFriendshipActions
    } finally {
      setLoading(false);
    }
  };

  // ✅ Aceptar solicitud
  const handleAcceptRequest = async () => {
    if (!friendshipId) return;

    setLoading(true);
    try {
      await acceptFriendRequest(friendshipId, userId);
      setCurrentStatus('friends');
      onStatusChange?.('friends');
    } catch (err) {
      // Ya manejado
    } finally {
      setLoading(false);
    }
  };

  // ❌ Cancelar/Rechazar
  const handleCancelRequest = async () => {
    if (!friendshipId) return;

    setLoading(true);
    try {
      await rejectFriendRequest(friendshipId, userId, currentStatus === 'pending_sent');
      setCurrentStatus('none');
      onStatusChange?.('none');
    } catch (err) {
      // Ya manejado
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled size={size} className={`${baseClasses} gap-2`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Procesando...
      </Button>
    );
  }

  switch (currentStatus) {
    case 'friends':
      return (
        <Button disabled size={size} className={`${baseClasses} gap-2 bg-green-500/20 text-green-600 border border-green-500/30`}>
          <Check className="w-4 h-4" />
          Amigos
        </Button>
      );

    case 'pending_sent':
      return (
        <Button onClick={handleCancelRequest} variant="outline" size={size} className={`${baseClasses} gap-2`}>
          <Clock className="w-4 h-4" />
          Solicitud enviada
          <X className="w-3 h-3 ml-1 opacity-50" />
        </Button>
      );

    case 'pending_received':
      return (
        <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
          <Button onClick={handleAcceptRequest} size={size} className={`${fullWidth ? 'flex-1' : ''} gap-2 bg-gradient-to-r from-primary to-secondary`}>
            <Check className="w-4 h-4" />
            Aceptar
          </Button>
          <Button onClick={handleCancelRequest} variant="outline" size={size} className="gap-2 hover:bg-destructive/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      );

    case 'blocked':
      return (
        <Button disabled variant="destructive" size={size} className={`${baseClasses} gap-2 opacity-50`}>
          Bloqueado
        </Button>
      );

    default:
      return (
        <Button onClick={handleSendRequest} size={size} className={`${baseClasses} gap-2 bg-gradient-to-r from-primary to-secondary`}>
          <UserPlus className="w-4 h-4" />
          Agregar amigo
        </Button>
      );
  }
}