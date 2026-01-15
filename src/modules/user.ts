// src/modules/user.ts
export interface User {
    _id: string;
    username: string;
    email: string;
    password: string; 
    birthday: Date;
    phoneNumber: string;
    role: 'admin' | 'manager' | 'user'; 
    active?: boolean;
    onboardingCompleted?: boolean;
    comunidad?: string;
    intereses?: string[]; 
    events: string[]; 
    fyp?: string[];
    avatar?: string;
    coverPhoto?: string;
    securityQuestion?: string; // ✅ CAMBIAR: Es un string, no SecurityQuestionKey
    securityAnswer?: string; 
    googleId?: string;
    googleProfile?: {
      name?: string;
      picture?: string;
      locale?: string;
    };
    authProvider?: 'local' | 'google';
    firstName?: string;
    lastName?: string;
    bio?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    city?: string;
    country?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
      tiktok?: string;
    };
    isOnline?: boolean;
    lastSeen?: Date;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
    isVisibleOnMap?: boolean;
    lastLocationUpdate?: Date;
    posts?: string[];
    interests?: string[];
    friends?: string[];
    emergencyContacts?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  
export type UserRole = 'admin' | 'manager' | 'user';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type AuthProvider = 'local' | 'google';

// ✅ Preguntas de seguridad - Tipo y constante
export const SECURITY_QUESTION_KEYS = [
  "security.question.pet_name",
  "security.question.birth_city",
  "security.question.mother_maiden_name",
  "security.question.first_school",
  "security.question.favorite_food",
  "security.question.childhood_street",
  "security.question.best_friend",
  "security.question.first_job",
  "security.question.favorite_book",
  "security.question.birth_hospital",
  "security.question.father_middle_name",
  "security.question.first_car",
  "security.question.favorite_teacher",
  "security.question.graduation_year",
  "security.question.favorite_movie"
] as const;

export type SecurityQuestionKey = typeof SECURITY_QUESTION_KEYS[number];

export const SECURITY_QUESTIONS: Record<SecurityQuestionKey, string> = {
  "security.question.pet_name": "¿Cuál es el nombre de tu primera mascota?",
  "security.question.birth_city": "¿En qué ciudad naciste?",
  "security.question.mother_maiden_name": "¿Cuál es el nombre de soltera de tu madre?",
  "security.question.first_school": "¿Cuál fue el nombre de tu primera escuela?",
  "security.question.favorite_food": "¿Cuál es tu comida favorita?",
  "security.question.childhood_street": "¿En qué calle vivías cuando eras niño?",
  "security.question.best_friend": "¿Cuál es el nombre de tu mejor amigo de la infancia?",
  "security.question.first_job": "¿Cuál fue tu primer trabajo?",
  "security.question.favorite_book": "¿Cuál es el nombre de tu libro favorito?",
  "security.question.birth_hospital": "¿En qué hospital naciste?",
  "security.question.father_middle_name": "¿Cuál es el segundo nombre de tu padre?",
  "security.question.first_car": "¿Cuál fue el modelo de tu primer coche?",
  "security.question.favorite_teacher": "¿Cuál es el nombre de tu profesor favorito?",
  "security.question.graduation_year": "¿En qué año te graduaste de la secundaria?",
  "security.question.favorite_movie": "¿Cuál es el nombre de tu película favorita?"
};

export type { 
    UserTrust, 
    UserTrustStats, 
    UserTrustSummary, 
    TrustContext,
    UserTrustRater 
  } from './userTrust';
  
  export { 
    calculateTrustLevel, 
    getTrustLevelColor, 
    getTrustLevelIcon 
  } from './userTrust';