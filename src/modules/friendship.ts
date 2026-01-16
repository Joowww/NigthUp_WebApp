// src/modules/friendship.ts
import type { User } from './user';

// ==================== TIPOS DE AMISTAD ====================

export type FriendshipStatus = 'none' | 'pending' | 'accepted' | 'rejected' | 'blocked';

export type SearchFriendshipStatus =
  | 'none'
  | 'friends'
  | 'pending_sent'
  | 'pending_received'
  | 'blocked';

export interface SearchUser {
  _id: string;
  username: string;
  avatar?: string;
  status: SearchFriendshipStatus;
  friendshipId: string | null;
}


export interface Friendship {
  _id: string;
  requester: string | User; // Puede ser ID o objeto poblado
  recipient: string | User;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt?: Date;
}

// ==================== TIPOS PARA USUARIOS PÚBLICOS ====================

export interface PublicUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  comunidad?: string;
  intereses?: string[];
  isOnline?: boolean;
  lastSeen?: Date;
  events?: PublicEvent[];
}

export interface PublicEvent {
  _id: string;
  name: string;
  schedule: Date;
  location?: any;
  category?: string;
  city?: string;
}

// ==================== RESPUESTAS DE API ====================

export interface PublicProfileResponse {
  user: PublicUser & {
    events?: PublicEvent[];
  };
  friendshipStatus: FriendshipStatus;
  friendshipId: string | null;
  canMessage: boolean;
}

export interface FriendshipStatusResponse {
  status: FriendshipStatus;
  friendshipId?: string;
  isPendingByMe?: boolean; // Si YO envié la solicitud
}

export interface PendingRequestsResponse {
  sent: Friendship[];
  received: Friendship[];
}

// ==================== HELPERS ====================

/**
 * Verifica si dos usuarios son amigos
 */
export function areFriends(status: FriendshipStatus): boolean {
  return status === 'accepted';
}

/**
 * Verifica si hay una solicitud pendiente
 */
export function hasPendingRequest(status: FriendshipStatus): boolean {
  return status === 'pending';
}

/**
 * Verifica si el usuario está bloqueado
 */
export function isBlocked(status: FriendshipStatus): boolean {
  return status === 'blocked';
}

/**
 * Obtiene el nombre completo de un usuario
 */
export function getFullName(user: PublicUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return user.username;
}

export function getAvatarUrl(user: PublicUser): string {
  if (!user.avatar) {
    return '/default-avatar.png';
  }
  
  if (user.avatar.startsWith('http')) {
    return user.avatar;
  }
  
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.avatar}`;
}