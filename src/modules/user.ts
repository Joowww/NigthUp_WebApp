 export interface User {
 _id: string;
    username: string;
    email: string;
    password: string;
    birthday: Date;
    role?: string;
    avatar?: string;
 }