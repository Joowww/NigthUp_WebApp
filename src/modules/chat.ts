import type { User } from './user';
import type { Event } from './event';
import type { IBusiness } from './bussiness';

// ============================================
// TIPOS ESPECIALES DE CONTENIDO
// ============================================

export type MessageType = 'text' | 'location' | 'event' | 'business' | 'image' | 'video' | 'audio';

export interface ILocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface IEventData {
  eventId: string;
  eventDetails?: Event; // Populated event data
}

export interface IBusinessData {
  businessId: string;
  businessDetails?: IBusiness; // Populated business data
}

// ============================================
// INTERFACES BASE
// ============================================

interface IReaction {
  user: string;
  emoji: string;
}

interface IMessage {
  _id: string;
  conversation: string;
  sender: User | string;
  senderModel: 'User' | 'Business';
  text: string;

  // Tipo y datos especiales del mensaje
  messageType?: MessageType;
  locationData?: ILocationData;
  eventData?: IEventData;
  businessData?: IBusinessData;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;

  // Estados del mensaje
  isEdited: boolean;
  isDeleted: boolean;

  // Referencia a otro mensaje (si es respuesta)
  replyTo?: IMessage | string;

  // Array de reacciones
  reactions: IReaction[];

  // Array de usuarios que han leído el mensaje
  readBy: string[];

  createdAt: string;
  updatedAt: string;
}

interface ILastMessage {
  message: string;
  senderId: string;
  createdAt: Date | string;
  isDeleted?: boolean;
}

interface IConversation {
  _id: string;

  // Propiedades para chats grupales
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupAdmins?: string[];

  // Participantes
  participants: (User | string)[];

  // Último mensaje
  lastMessage?: ILastMessage;

  // Configuraciones
  settings?: any[];

  // Contador de mensajes no leídos (calculado en frontend)
  unreadCount?: number;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// INTERFACES FORMATEADAS (respuestas del backend)
// ============================================

interface IConversationFormatted {
  id: string;
  isGroup: boolean;
  name: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string | Date;
  isPinned?: boolean;
  participants: (User | string)[];
}

interface IMessageFormatted {
  id: string;
  sender: User | string;
  text: string;
  createdAt: Date | string;
  isEdited: boolean;
  isDeleted: boolean;
  replyTo?: IMessage | { text: string; sender: string };
  reactions: IReaction[];
  read: boolean;

  // Campos especiales para mensajes enriquecidos
  messageType?: MessageType;
  locationData?: ILocationData;
  eventData?: IEventData;
  businessData?: IBusinessData;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

// ============================================
// TIPOS PARA EVENTOS DE SOCKET.IO (cliente → servidor)
// ============================================

interface SocketSendMessageData {
  conversationId: string;
  text: string;
  replyTo?: string;
  messageType?: MessageType;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}

interface SocketEditMessageData {
  messageId: string;
  text: string;
}

interface SocketDeleteMessageData {
  messageId: string;
}

interface SocketReactData {
  messageId: string;
  emoji: string;
}

interface SocketCreateGroupData {
  name: string;
  participants: string[];
}

interface SocketTypingData {
  conversationId: string;
}

// ============================================
// TIPOS PARA EVENTOS DE SOCKET.IO (servidor → cliente)
// ============================================

interface SocketNewMessageEvent extends IMessage {
  // El servidor devuelve el mensaje completo poblado
}

interface SocketMessageEditedEvent extends IMessage {
  // El servidor devuelve el mensaje editado
}

interface SocketMessageDeletedEvent {
  messageId: string;
  conversationId?: string;
}

interface SocketMessageReactedEvent {
  messageId: string;
  reactions: IReaction[];
}

interface SocketNewGroupEvent {
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  participants: string[];
  createdAt: string;
}

interface SocketMessageBlockedEvent {
  reason: string;
  severity: 'low' | 'medium' | 'high';
  detectedWords?: string[];
  detectedPatterns?: string[];
}

interface SocketUserTypingEvent {
  userId: string;
  conversationId: string;
}

interface SocketErrorEvent {
  message: string;
  details?: string;
}



// ============================================
// EXPORTS
// ============================================

export type {
  // Interfaces base
  IReaction,
  IMessage,
  ILastMessage,
  IConversation,

  // Interfaces formateadas
  IConversationFormatted,
  IMessageFormatted,

  // Socket events (cliente → servidor)
  SocketSendMessageData,
  SocketEditMessageData,
  SocketDeleteMessageData,
  SocketReactData,
  SocketCreateGroupData,
  SocketTypingData,

  // Socket events (servidor → cliente)
  SocketNewMessageEvent,
  SocketMessageEditedEvent,
  SocketMessageDeletedEvent,
  SocketMessageReactedEvent,
  SocketNewGroupEvent,
  SocketMessageBlockedEvent,
  SocketUserTypingEvent,
  SocketErrorEvent
};