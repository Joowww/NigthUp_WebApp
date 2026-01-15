export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    birthday: Date;
    events: string[];
    role?: string;
    phoneNumber: string;
    securityQuestionKey: string;
    securityAnswer: string;
    comunidad?: string;
    intereses?: string[];
    onboardingCompleted?: boolean;
    avatar?: string; 
    coverPhoto?: string;
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
}