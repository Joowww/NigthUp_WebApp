// src/features/friendship/FriendshipButton.tsx (ACTUALIZAR)
import { useState } from 'react';
import { UserPlus, Check, Clock, X, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { useToast } from '../../hooks/useToast';
import { friendshipService } from './friendshipService';
import { socketService } from '../../lib/socket'; 
import { useAuth } from '../../hooks/useAuth'; 
import { useEffect } from 'react';
import { useFriendshipContext } from '../../context/FriendshipContext';

type FriendshipStatusType = 
  | 'none' 
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

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
    const [currentStatus, setCurrentStatus] = useState(status);
    const { success, error } = useToast();
    const { user } = useAuth();
    const { friendshipUpdates } = useFriendshipContext();
  
    // ✅ ESCUCHAR CAMBIOS DEL CONTEXTO
    useEffect(() => {
      const update = friendshipUpdates.get(userId);
      if (update && update.status !== currentStatus) {
        console.log('🔄 [FriendshipButton] Actualización detectada:', userId, update.status);
        setCurrentStatus(update.status);
        onStatusChange?.(update.status);
      }
    }, [friendshipUpdates, userId, currentStatus, onStatusChange]);
  
    // ✅ ACTUALIZAR si cambia el prop status
    useEffect(() => {
      if (status !== currentStatus) {
        console.log('🔄 [FriendshipButton] Prop cambió:', status);
        setCurrentStatus(status);
      }
    }, [status, currentStatus]);
  
  
  const baseClasses = fullWidth ? 'w-full' : '';

  const updateStatus = (newStatus: FriendshipStatusType) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      console.log('📤 Enviando solicitud a:', userId);
      const response = await friendshipService.sendFriendRequestV2(userId);
      
      // ✅ EMITIR EVENTO DE SOCKET
      if (user?.id) {
        socketService.emitFriendRequestSent(
          userId, // recipientId
          user.id, // senderId
          response.friendship._id.toString() // friendshipId
        );
      }
      
      if (response.friendship.status === 'accepted') {
        success('¡Ahora son amigos! 🎉');
        updateStatus('friends');
      } else {
        success('Solicitud enviada correctamente');
        updateStatus('pending_sent');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      
      if (err?.response?.data?.error?.includes('Ya enviaste')) {
        error('Ya enviaste una solicitud a este usuario');
        updateStatus('pending_sent');
      } else if (err?.response?.data?.error?.includes('Ya son amigos')) {
        error('Ya son amigos');
        updateStatus('friends');
      } else {
        error('No se pudo enviar la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendshipId) {
      error('ID de solicitud no encontrado');
      return;
    }

    setLoading(true);
    try {
      console.log('✅ Aceptando solicitud:', friendshipId);
      const response = await friendshipService.acceptFriendRequestV2(friendshipId);
      
      // ✅ EMITIR EVENTO DE SOCKET
      if (user?.id && response.friendship) {
        const requesterId = response.friendship.requester._id || response.friendship.requester;
        socketService.emitFriendRequestAccepted(
          requesterId.toString(), // requesterId
          user.id, // accepterId
          friendshipId // friendshipId
        );
      }
      
      success('¡Ahora son amigos! 🎉');
      updateStatus('friends');
    } catch (err) {
      console.error('❌ Error aceptando:', err);
      error('No se pudo aceptar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!friendshipId) {
      error('ID de solicitud no encontrado');
      return;
    }

    setLoading(true);
    try {
      console.log('❌ Cancelando solicitud:', friendshipId);
      await friendshipService.cancelFriendRequestV2(friendshipId);
      
      // ✅ EMITIR EVENTO DE SOCKET
      if (user?.id) {
        socketService.emitFriendRequestCancelled(
          userId, // recipientId
          friendshipId // friendshipId
            , user.id // senderId
        );
      }
      
      success(currentStatus === 'pending_sent' ? 'Solicitud cancelada' : 'Solicitud rechazada');
      updateStatus('none');
    } catch (err) {
      console.error('❌ Error cancelando:', err);
      error('No se pudo cancelar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading spinner
  if (loading) {
    return (
      <Button
        disabled
        size={size}
        className={`${baseClasses} gap-2`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Procesando...
      </Button>
    );
  }

  // Renderizar según estado
  switch (currentStatus) {
    case 'friends':
      return (
        <Button
          disabled
          size={size}
          className={`${baseClasses} gap-2 bg-green-500/20 text-green-600 cursor-not-allowed hover:bg-green-500/20 border border-green-500/30`}
        >
          <Check className="w-4 h-4" />
          Amigos
        </Button>
      );
    
    case 'pending_sent':
      return (
        <Button
          onClick={handleCancelRequest}
          variant="outline"
          size={size}
          className={`${baseClasses} gap-2`}
        >
          <Clock className="w-4 h-4" />
          Solicitud enviada
          <X className="w-3 h-3 ml-1 opacity-50" />
        </Button>
      );
    
    case 'pending_received':
      return (
        <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
          <Button
            onClick={handleAcceptRequest}
            size={size}
            className={`${fullWidth ? 'flex-1' : ''} gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90`}
          >
            <Check className="w-4 h-4" />
            Aceptar solicitud
          </Button>
          <Button
            onClick={handleCancelRequest}
            variant="outline"
            size={size}
            className="gap-2 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    
    case 'blocked':
      return (
        <Button
          disabled
          variant="destructive"
          size={size}
          className={`${baseClasses} gap-2 opacity-50 cursor-not-allowed`}
        >
          Usuario bloqueado
        </Button>
      );
    
    default: // 'none'
      return (
        <Button
          onClick={handleSendRequest}
          size={size}
          className={`${baseClasses} gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90`}
        >
          <UserPlus className="w-4 h-4" />
          Agregar amigo
        </Button>
      );
  }
}