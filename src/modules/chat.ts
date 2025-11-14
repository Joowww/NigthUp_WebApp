// src/modules/chat.ts

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    read: boolean;
  }
  
  export interface Chat {
    id: string;
    name: string;
    avatar: string;
    type: 'user' | 'group';
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: number;
    messages: Message[];
    isPinned: boolean;
    isOnline?: boolean;
  }
  