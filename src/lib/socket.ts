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
    if (this.socket?.connected) {
      console.log('Socket ya conectado');
      return;
    }

    this.userId = userId;
    
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { userId, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }
  getUserId(): string | null {
    return this.userId;
  }

  // ============================================
  // EVENTOS PARA ENVIAR AL SERVIDOR
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

  // ============================================
  // EVENTOS PARA ESCUCHAR DEL SERVIDOR
  // ============================================

  onNewMessage(callback: (message: SocketNewMessageEvent) => void) {
    this.socket?.on('newMessage', callback);
  }

  onMessageEdited(callback: (message: SocketMessageEditedEvent) => void) {
    this.socket?.on('messageEdited', callback);
  }

  onMessageDeleted(callback: (data: SocketMessageDeletedEvent) => void) {
    this.socket?.on('messageDeleted', callback);
  }

  onMessageReacted(callback: (data: SocketMessageReactedEvent) => void) {
    this.socket?.on('messageReacted', callback);
  }

  onNewGroup(callback: (group: SocketNewGroupEvent) => void) {
    this.socket?.on('newGroup', callback);
  }

  onGroupCreated(callback: (data: { groupId: string; name: string }) => void) {
    this.socket?.on('groupCreated', callback);
  }

  onMessageBlocked(callback: (data: SocketMessageBlockedEvent) => void) {
    this.socket?.on('messageBlocked', callback);
  }

  onUserTyping(callback: (data: SocketUserTypingEvent) => void) {
    this.socket?.on('userTyping', callback);
  }

  onUserStoppedTyping(callback: (data: SocketUserTypingEvent) => void) {
    this.socket?.on('userStoppedTyping', callback);
  }

  onError(callback: (error: SocketErrorEvent) => void) {
    this.socket?.on('error', callback);
  }

  // ============================================
  // DESUSCRIBIR EVENTOS
  // ============================================

  offNewMessage() {
    this.socket?.off('newMessage');
  }

  offMessageEdited() {
    this.socket?.off('messageEdited');
  }

  offMessageDeleted() {
    this.socket?.off('messageDeleted');
  }

  offMessageReacted() {
    this.socket?.off('messageReacted');
  }

  offNewGroup() {
    this.socket?.off('newGroup');
  }

  offGroupCreated() {
    this.socket?.off('groupCreated');
  }

  offMessageBlocked() {
    this.socket?.off('messageBlocked');
  }

  offUserTyping() {
    this.socket?.off('userTyping');
  }

  offUserStoppedTyping() {
    this.socket?.off('userStoppedTyping');
  }

  offError() {
    this.socket?.off('error');
  }

  // Limpiar todos los listeners
  offAll() {
    this.offNewMessage();
    this.offMessageEdited();
    this.offMessageDeleted();
    this.offMessageReacted();
    this.offNewGroup();
    this.offGroupCreated();
    this.offMessageBlocked();
    this.offUserTyping();
    this.offUserStoppedTyping();
    this.offError();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();