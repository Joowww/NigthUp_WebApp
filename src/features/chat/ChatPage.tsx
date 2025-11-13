import { useState, useEffect } from 'react';
import { Search, ArrowLeft, MoreVertical, Phone, Video, Check, CheckCheck } from 'lucide-react';
import { ChatList } from '../ChatList';
import { ChatConversation } from '../ChatConversation';
import { useAuth } from '../AuthContext';

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
  type: 'user' | 'venue';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  messages: Message[];
  isPinned: boolean;
  isOnline?: boolean;
}

export function ChatPage() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize with some demo chats
  useEffect(() => {
    const demoChats: Chat[] = [
      {
        id: '1',
        name: 'Opium Barcelona',
        avatar: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=200',
        type: 'venue',
        lastMessage: '¡Hola! Te confirmamos tu reserva para el sábado',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 1,
        isPinned: true,
        messages: [
          {
            id: 'm1',
            senderId: '1',
            text: '¡Hola! ¿En qué podemos ayudarte?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            read: true,
          },
          {
            id: 'm2',
            senderId: user?.id || 'current',
            text: 'Hola, quería hacer una reserva para el sábado',
            timestamp: new Date(Date.now() - 1000 * 60 * 50),
            read: true,
          },
          {
            id: 'm3',
            senderId: '1',
            text: '¡Perfecto! ¿Para cuántas personas?',
            timestamp: new Date(Date.now() - 1000 * 60 * 40),
            read: true,
          },
          {
            id: 'm4',
            senderId: user?.id || 'current',
            text: 'Somos 4 personas',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: true,
          },
          {
            id: 'm5',
            senderId: '1',
            text: '¡Hola! Te confirmamos tu reserva para el sábado',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            read: false,
          },
        ],
      },
      {
        id: '2',
        name: 'María García',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        type: 'user',
        lastMessage: 'Nos vemos esta noche! 🎉',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 15),
        unreadCount: 0,
        isPinned: true,
        isOnline: true,
        messages: [
          {
            id: 'm1',
            senderId: '2',
            text: 'Hey! ¿Vienes al evento de esta noche?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: true,
          },
          {
            id: 'm2',
            senderId: user?.id || 'current',
            text: '¡Claro! ¿A qué hora quedamos?',
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            read: true,
          },
          {
            id: 'm3',
            senderId: '2',
            text: 'Nos vemos esta noche! 🎉',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            read: true,
          },
        ],
      },
      {
        id: '3',
        name: 'Pacha Barcelona',
        avatar: 'https://images.unsplash.com/photo-1571266028243-d220c6e2e9cf?w=200',
        type: 'venue',
        lastMessage: 'Este viernes tenemos un evento especial',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 0,
        isPinned: false,
        messages: [
          {
            id: 'm1',
            senderId: '3',
            text: 'Este viernes tenemos un evento especial',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            read: true,
          },
        ],
      },
      {
        id: '4',
        name: 'Carlos Ruiz',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        type: 'user',
        lastMessage: 'Perfecto, te paso la ubicación',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
        unreadCount: 2,
        isPinned: false,
        isOnline: false,
        messages: [
          {
            id: 'm1',
            senderId: '4',
            text: 'Perfecto, te paso la ubicación',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
            read: false,
          },
        ],
      },
      {
        id: '5',
        name: 'Razzmatazz',
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200',
        type: 'venue',
        lastMessage: '¡Gracias por tu interés!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 0,
        isPinned: false,
        messages: [
          {
            id: 'm1',
            senderId: '5',
            text: '¡Gracias por tu interés!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            read: true,
          },
        ],
      },
    ];
    
    setChats(demoChats);
  }, [user]);

  const handleSendMessage = (chatId: string, text: string) => {
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: `m${Date.now()}`,
            senderId: user?.id || 'current',
            text,
            timestamp: new Date(),
            read: false,
          };
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: text,
            lastMessageTime: new Date(),
          };
        }
        return chat;
      })
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (selectedChat === chatId) {
      setSelectedChat(null);
    }
  };

  const handlePinChat = (chatId: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const handleMarkAsRead = (chatId: string) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            unreadCount: 0,
            messages: chat.messages.map(msg => ({ ...msg, read: true })),
          };
        }
        return chat;
      })
    );
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.lastMessageTime?.getTime() || 0;
    const timeB = b.lastMessageTime?.getTime() || 0;
    return timeB - timeA;
  });

  const currentChat = chats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background">
      {/* Chat List - Mobile: hidden when chat selected, Desktop: always visible */}
      <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 border-r border-border`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="mb-4 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Mensajes
          </h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0080]/50 focus:border-[#ff0080] transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <ChatList
          chats={sortedChats}
          selectedChatId={selectedChat}
          onSelectChat={(chatId) => {
            setSelectedChat(chatId);
            handleMarkAsRead(chatId);
          }}
          onDeleteChat={handleDeleteChat}
          onPinChat={handlePinChat}
        />
      </div>

      {/* Chat Conversation - Mobile: visible when chat selected, Desktop: always visible or empty state */}
      <div className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-col flex-1`}>
        {currentChat ? (
          <ChatConversation
            chat={currentChat}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedChat(null)}
            currentUserId={user?.id || 'current'}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#ff0080]/20 to-[#7928ca]/20 border border-[#ff0080]/30 mb-4">
                <svg className="w-10 h-10 text-[#ff0080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mb-2">Tus mensajes</h3>
              <p className="text-muted-foreground text-sm">
                Selecciona una conversación para empezar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
