// src/features/friendship/FriendshipActions.tsx

import { friendshipService } from './friendshipService';
import { socketService } from '../../lib/socket';
import { useFriendshipContext } from '../../context/FriendshipContext';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export function useFriendshipActions() {
  const { user } = useAuth();
  const { updateFriendship } = useFriendshipContext();
  const { refresh: refreshNotifications } = useNotificationsContext();
  const { success, error } = useToast();

  /**
   * Enviar solicitud de amistad
   */
  const sendFriendRequest = async (targetUserId: string) => {
    try {
      console.log('📤 [FriendshipActions] Enviando solicitud a:', targetUserId);

      const response = await friendshipService.sendFriendRequestV2(targetUserId);

      // ✅ 1. Actualizar contexto local
      updateFriendship(targetUserId, 'pending_sent', response.friendship._id.toString());

      // ✅ 2. Emitir socket al destinatario
      if (user?.id) {
        socketService.emitFriendRequestSent(
          targetUserId,
          user.id, // ✅ Revertir a enviar solo ID, el backend enriquecerá los datos
          response.friendship._id.toString()
        );
      }

      success('Solicitud enviada correctamente');
      return response;
    } catch (err: any) {
      console.error('❌ Error enviando solicitud:', err);

      if (err?.response?.data?.error?.includes('Ya enviaste')) {
        error('Ya enviaste una solicitud a este usuario');
        updateFriendship(targetUserId, 'pending_sent', null);
      } else if (err?.response?.data?.error?.includes('Ya son amigos')) {
        error('Ya son amigos');
        updateFriendship(targetUserId, 'friends', null);
      } else {
        error('No se pudo enviar la solicitud');
      }
      throw err;
    }
  };

  /**
   * Aceptar solicitud de amistad
   */
  const acceptFriendRequest = async (friendshipId: string, requesterId: string) => {
    try {
      console.log('✅ [FriendshipActions] Aceptando solicitud:', { friendshipId, requesterId });

      // ✅ 1. Aceptar en backend
      const response = await friendshipService.acceptFriendRequestV2(friendshipId);

      // ✅ 2. Actualizar contexto LOCAL → Ahora son amigos
      updateFriendship(requesterId, 'friends', friendshipId);

      // ✅ 3. Emitir socket al REQUESTER (quien envió la solicitud)
      if (user?.id) {
        console.log('📤 [FriendshipActions] Emitiendo socket a:', requesterId);
        socketService.emitFriendRequestAccepted(
          requesterId,  // ✅ El que ENVIÓ la solicitud (Usuario A)
          user.id,      // ✅ Revertir a enviar solo ID (accepterId)
          friendshipId
        );
      }

      // ✅ 4. Refrescar notificaciones
      await refreshNotifications();

      success('¡Ahora son amigos! 🎉');
      return response;
    } catch (err) {
      console.error('❌ Error aceptando solicitud:', err);
      error('No se pudo aceptar la solicitud');
      throw err;
    }
  };

  /**
   * Rechazar/Cancelar solicitud de amistad
   */
  const rejectFriendRequest = async (friendshipId: string, otherUserId: string, isPendingSent: boolean) => {
    try {
      console.log('❌ [FriendshipActions] Rechazando solicitud:', { friendshipId, otherUserId });

      // ✅ 1. Eliminar en backend
      await friendshipService.cancelFriendRequestV2(friendshipId);

      // ✅ 2. Actualizar contexto local
      updateFriendship(otherUserId, 'none', null);

      // ✅ 3. Emitir socket al otro usuario
      if (user?.id) {
        socketService.emitFriendRequestCancelled(otherUserId, friendshipId, user.id);
      }

      // ✅ 4. Refrescar notificaciones
      await refreshNotifications();

      success(isPendingSent ? 'Solicitud cancelada' : 'Solicitud rechazada');
    } catch (err) {
      console.error('❌ Error rechazando solicitud:', err);
      error('No se pudo rechazar la solicitud');
      throw err;
    }
  };

  /**
   * Eliminar amigo
   */
  const removeFriend = async (friendshipId: string, friendUserId: string) => {
    try {
      console.log('🗑️ [FriendshipActions] Eliminando amigo:', { friendshipId, friendUserId });

      // ✅ 1. Eliminar en backend
      await friendshipService.removeFriend(friendshipId);

      // ✅ 2. Actualizar contexto local
      updateFriendship(friendUserId, 'none', null);

      // ✅ 3. Emitir socket al ex-amigo
      if (user?.id) {
        socketService.emitFriendRemoved(friendUserId, friendshipId, user.id);
      }

      success('Amigo eliminado');
    } catch (err) {
      console.error('❌ Error eliminando amigo:', err);
      error('No se pudo eliminar el amigo');
      throw err;
    }
  };

  return {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  };
}