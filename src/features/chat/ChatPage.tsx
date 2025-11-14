import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ChatList } from './ChatList';
import { ChatConversation } from './ChatConversation';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api';

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
  type: 'user';
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

  // 🔥 Cargar chats REALES desde el backend
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const res = await api.get(`/chat/${user.id}`);

        const backendChats = res.data.map((chat: any) => {
          const otherUser =
            chat.userA._id === user.id ? chat.userB : chat.userA;

          const lastMsg = chat.messages[chat.messages.length - 1];

          return {
            id: chat._id,
            name: otherUser.nombre,
            avatar: otherUser.avatar || "https://via.placeholder.com/200",
            type: 'user',
            messages: chat.messages,
            lastMessage: lastMsg?.text || "",
            lastMessageTime: lastMsg ? new Date(lastMsg.timestamp) : null,
            unreadCount: chat.messages.filter(
              (m: any) => !m.read && m.senderId !== user.id
            ).length,
            isPinned: false,
            isOnline: otherUser.isOnline || false,
          };
        });

        setChats(backendChats);
      } catch (error) {
        console.error("Error cargando chats:", error);
      }
    };

    loadChats();
  }, [user]);

  // 🔥 Enviar mensaje (versión temporal sin backend)
  const handleSendMessage = (chatId: string, text: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: `m${Date.now()}`,
                  senderId: user?.id || "",
                  text,
                  timestamp: new Date(),
                  read: false,
                },
              ],
              lastMessage: text,
              lastMessageTime: new Date(),
            }
          : chat
      )
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    setSelectedChat(null);
  };

  const handlePinChat = (chatId: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const handleMarkAsRead = (chatId: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount: 0,
              messages: chat.messages.map(msg => ({ ...msg, read: true })),
            }
          : chat
      )
    );
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.lastMessageTime?.getTime() || 0) -
           (a.lastMessageTime?.getTime() || 0);
  });

  const currentChat = chats.find(c => c.id === selectedChat);

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background">
      
      {/* LISTA DE CHATS */}
      <div className={`${selectedChat ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-96 border-r border-border`}>
        
        <div className="p-4 border-b border-border">
          <h2 className="mb-4 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Mensajes
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0080]/50 transition-all"
            />
          </div>
        </div>

        <ChatList
          chats={sortedChats}
          selectedChatId={selectedChat}
          onSelectChat={chatId => {
            setSelectedChat(chatId);
            handleMarkAsRead(chatId);
          }}
          onDeleteChat={handleDeleteChat}
          onPinChat={handlePinChat}
        />
      </div>

      {/* CONVERSACIÓN */}
      <div className={`${selectedChat ? "flex" : "hidden lg:flex"} flex-col flex-1`}>
        {currentChat ? (
          <ChatConversation
            chat={currentChat}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedChat(null)}
            currentUserId={user?.id || ""}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center opacity-70">
              <h3 className="mb-2 text-lg">Tus mensajes</h3>
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
