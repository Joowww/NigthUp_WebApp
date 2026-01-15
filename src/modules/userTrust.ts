// src/modules/userTrust.ts

// ============================================
// INTERFACE PRINCIPAL - UserTrust
// ============================================
export interface UserTrust {
    _id: string;
    rater: string | UserTrustRater; // ID o objeto poblado del usuario que valora
    rated: string; // ID del usuario valorado
    score: number; // 1-5
    comment?: string;
    context: string; // "event", "chat", "general"
    createdAt: Date;
    updatedAt?: Date;
  }

  export interface UserTrustRater {
    _id: string;
    username: string;
    avatar?: string;
  }
  export interface UserTrustStats {
    userId: string;
    averageScore: number;
    totalRatings: number;
    trustLevel: 'Nuevo' | 'Bronce' | 'Plata' | 'Oro' | 'Platino';
    scoreDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    ratingsByContext?: {
      event: number;
      chat: number;
      general: number;
    };
  }
  export interface UserTrustSummary {
    userId: string;
    username: string;
    averageScore: number;
    totalRatings: number;
    trustLevel: string;
    recentRatings: UserTrust[];
  }
  export type TrustContext = 'event' | 'chat' | 'general';
  
  export function calculateTrustLevel(averageScore: number, totalRatings: number): UserTrustStats['trustLevel'] {
    if (totalRatings === 0) return 'Nuevo';
    if (totalRatings < 5) return 'Bronce';
    if (averageScore >= 4.5 && totalRatings >= 20) return 'Platino';
    if (averageScore >= 4.0 && totalRatings >= 10) return 'Oro';
    if (averageScore >= 3.5) return 'Plata';
    return 'Bronce';
  }
  
  export function getTrustLevelColor(level: UserTrustStats['trustLevel']): string {
    const colors = {
      'Nuevo': 'text-gray-400',
      'Bronce': 'text-orange-600',
      'Plata': 'text-gray-300',
      'Oro': 'text-yellow-500',
      'Platino': 'text-cyan-400'
    };
    return colors[level] || colors.Nuevo;
  }
  
  export function getTrustLevelIcon(level: UserTrustStats['trustLevel']): string {
    const icons = {
      'Nuevo': '🆕',
      'Bronce': '🥉',
      'Plata': '🥈',
      'Oro': '🥇',
      'Platino': '💎'
    };
    return icons[level] || icons.Nuevo;
  }