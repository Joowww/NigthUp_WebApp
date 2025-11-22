 export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  birthday: Date;
  events: string[];
    role?: string;
   comunidad: { type: String, default: '' },
  intereses: [{ type: String }],
  onboardingCompleted: { type: Boolean, default: false },
 }