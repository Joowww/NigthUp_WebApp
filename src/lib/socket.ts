import { io, Socket } from 'socket.io-client';
import type {
  SocketSendMessageData,
  SocketEditMessageData,
  SocketDeleteMessageData,
  SocketReactData,
  SocketCreateGroupData,
  SocketTypingData,
  SocketNewMessageEvent,
  SocketMessageEditedEvent,
  SocketMessageDeletedEvent,
  SocketMessageReactedEvent,
  SocketNewGroupEvent,
  SocketMessageBlockedEvent,
  SocketUserTypingEvent,
  SocketErrorEvent
} from '../modules/chat';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string, token: string) {
    // Si ya hay una conexión válida, no volver a crearla
    if (this.socket && this.socket.connected) {
      console.log('🔁 Socket ya conectado');
      return;
    }

    console.log('🔌 Creando socket con userId:', userId);

    this.userId = userId;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      autoConnect: false,                 // 🔴 CLAVE: no conectar hasta tener auth
      auth: {
        userId,
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);

      // 🔥 Forzar sincronización inmediata de usuarios online
      this.socket?.emit('getOnlineUsers');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
    });

    // ⏱️ AHORA sí conectamos
    this.socket.connect();
  }

  disconnect() {
    if (this.socket) {
      console.log('🧹 Cerrando socket');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  getUserId(): string | null {
    return this.userId;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // ============================================
  // EMIT
  // ============================================

  joinRoom(conversationId: string) {
    this.socket?.emit('joinRoom', conversationId);
  }

  leaveRoom(conversationId: string) {
    this.socket?.emit('leaveRoom', conversationId);
  }

  sendMessage(data: SocketSendMessageData) {
    this.socket?.emit('sendMessage', data);
  }

  editMessage(data: SocketEditMessageData) {
    this.socket?.emit('editMessage', data);
  }

  deleteMessage(data: SocketDeleteMessageData) {
    this.socket?.emit('deleteMessage', data);
  }

  reactToMessage(data: SocketReactData) {
    this.socket?.emit('reactToMessage', data);
  }

  createGroup(data: SocketCreateGroupData) {
    this.socket?.emit('createGroup', data);
  }

  typing(data: SocketTypingData) {
    this.socket?.emit('typing', data);
  }

  stopTyping(data: SocketTypingData) {
    this.socket?.emit('stopTyping', data);
  }

  requestOnlineUsers() {
    this.socket?.emit('getOnlineUsers');
  }

  markAsRead(data: { conversationId: string }) {
    this.socket?.emit('markAsRead', data);
  }

  // ============================================
  // ON
  // ============================================

  onNewMessage(cb: (m: SocketNewMessageEvent) => void) {
    this.socket?.on('newMessage', cb);
  }

  onMessageEdited(cb: (m: SocketMessageEditedEvent) => void) {
    this.socket?.on('messageEdited', cb);
  }

  onMessageDeleted(cb: (d: SocketMessageDeletedEvent) => void) {
    this.socket?.on('messageDeleted', cb);
  }

  onMessageReacted(cb: (d: SocketMessageReactedEvent) => void) {
    this.socket?.on('messageReacted', cb);
  }

  onNewGroup(cb: (g: SocketNewGroupEvent) => void) {
    this.socket?.on('newGroup', cb);
  }

  onMessageBlocked(cb: (d: SocketMessageBlockedEvent) => void) {
    this.socket?.on('messageBlocked', cb);
  }

  onUserTyping(cb: (d: SocketUserTypingEvent) => void) {
    this.socket?.on('userTyping', cb);
  }

  onUserStoppedTyping(cb: (d: SocketUserTypingEvent) => void) {
    this.socket?.on('userStoppedTyping', cb);
  }

  onError(cb: (e: SocketErrorEvent) => void) {
    this.socket?.on('error', cb);
  }

  // 🟢 PRESENCIA
  onOnlineUsers(cb: (userIds: string[]) => void) {
    this.socket?.on('onlineUsers', cb);
  }

  onUserDisconnected(cb: (data: { userId: string }) => void) {
    this.socket?.on('userDisconnected', cb);
  }

  // ============================================
  // OFF
  // ============================================

  offOnlineUsers() {
    this.socket?.off('onlineUsers');
  }

  offUserDisconnected() {
    this.socket?.off('userDisconnected');
  }

  offAll() {
    this.socket?.removeAllListeners();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  // ============================================
  // FRIENDSHIP EVENTS (NUEVO)
  // ============================================

  /**
   * Emitir solicitud enviada
   */
  emitFriendRequestSent(recipientId: string, senderId: string, friendshipId: string) {
    this.socket?.emit('friendRequestSent', {
      recipientId,
      senderId,
      friendshipId
    });
    console.log('📤 [Socket] Emitido friendRequestSent:', { recipientId, friendshipId });
  }

  /**
   * Emitir solicitud aceptada
   */
  emitFriendRequestAccepted(requesterId: string, accepterId: string, friendshipId: string) {
    this.socket?.emit('friendRequestAccepted', {
      requesterId,
      accepterId,
      friendshipId
    });
    console.log('✅ [Socket] Emitido friendRequestAccepted:', { requesterId, friendshipId });
  }

  // ✅ MANTENER SOLO ESTA (línea ~229)
  emitFriendRequestCancelled(recipientId: string, friendshipId: string, senderId: string) {
    this.socket?.emit('friendRequestCancelled', {
      recipientId,
      friendshipId,
      senderId
    });
    console.log('❌ [Socket] Emitido friendRequestCancelled:', { recipientId, friendshipId, senderId });
  }

  /**
   * Escuchar solicitud recibida
   */
  onFriendRequestReceived(cb: (data: {
    friendshipId: string;
    sender: {
      _id: string;
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    timestamp: Date;
  }) => void) {
    this.socket?.on('friendRequestReceived', cb);
  }

  /**
   * Escuchar solicitud aceptada
   */
  onFriendRequestAcceptedNotification(cb: (data: {
    friendshipId: string;
    accepter: {
      _id: string;
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    timestamp: Date;
  }) => void) {
    this.socket?.on('friendRequestAcceptedNotification', cb);
  }

  /**
   * Escuchar solicitud cancelada
   */
  onFriendRequestCancelledNotification(cb: (data: {
    friendshipId: string;
    senderId: string; // ✅ AÑADIR senderId
    timestamp: Date;
  }) => void) {
    this.socket?.on('friendRequestCancelledNotification', cb);
  }

  /**
   * Emitir eliminación de amigo
   */
  emitFriendRemoved(friendId: string, friendshipId: string, removedBy: string) {
    this.socket?.emit('friendRemoved', {
      friendId,
      friendshipId,
      removedBy
    });
    console.log('❌ [Socket] Emitido friendRemoved:', { friendId, friendshipId, removedBy });
  }

  /**
   * Escuchar eliminación de amigo
   */
  onFriendRemovedNotification(cb: (data: {
    friendshipId: string;
    removedBy: any;
    timestamp: Date;
  }) => void) {
    this.socket?.on('friendRemovedNotification', cb);
  }

  /**
   * Limpiar listeners de friendship (actualizado)
   */
  offFriendshipEvents() {
    this.socket?.off('friendRequestReceived');
    this.socket?.off('friendRequestAcceptedNotification');
    this.socket?.off('friendRequestCancelledNotification');
    this.socket?.off('friendRemovedNotification'); // ✅ AÑADIR
  }


}

export const socketService = new SocketService();
