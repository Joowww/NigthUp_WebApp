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

// ✅ TIPO COMPLETO PARA SearchUser
export interface SearchUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  comunidad?: string;
  intereses?: string[];
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  isOnline?: boolean;
  lastSeen?: Date;
  status: SearchFriendshipStatus;
  friendshipId: string | null;
}

export interface Friendship {
  _id: string;
  requester: string | User;
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
  friendshipId?: string | null;
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
  status: FriendshipStatusType;
  friendshipId?: string;
  isPendingByMe?: boolean;
}

export interface PendingRequestsResponse {
  sent: Friendship[];
  received: Friendship[];
}

export interface PublicUserWithFriendship extends PublicUser {
  status?: FriendshipStatusType;
  friendshipId?: string | null;
}

/**
 * Tipos de estado de amistad
 */
export type FriendshipStatusType =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

// ==================== HELPERS ====================

export function areFriends(status: FriendshipStatus): boolean {
  return status === 'accepted';
}

export function hasPendingRequest(status: FriendshipStatus): boolean {
  return status === 'pending';
}

export function isBlocked(status: FriendshipStatus): boolean {
  return status === 'blocked';
}

export function getFullName(user: PublicUser | SearchUser): string {
  if ('firstName' in user && 'lastName' in user) {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
  }
  return user.username;
}

export function getAvatarUrl(userOrAvatar: string | { avatar?: string; username?: string; name?: string }, fallbackName?: string): string {
  const avatar = typeof userOrAvatar === 'string' ? userOrAvatar : userOrAvatar.avatar;
  const name = fallbackName || (typeof userOrAvatar === 'object' ? (userOrAvatar.username || userOrAvatar.name) : undefined);

  if (!avatar) {
    if (name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    }
    return '/default-avatar.png';
  }

  if (avatar.startsWith('http')) {
    return avatar;
  }

  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/\/api\/?$/i, '')
    .replace(/\/$/, '');

  const cleanAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;

  return `${apiUrl}${cleanAvatar}`;
}