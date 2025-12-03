import { useState, useEffect } from 'react';
import { ChatList } from './ChatList';
import { ChatConversation } from './ChatConversation';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api';
import { Search, X, MessageSquarePlus, Loader2 } from 'lucide-react';
import type { 
  IConversationFormatted, 
  IMessageFormatted,
  SocketNewMessageEvent,
  SocketMessageEditedEvent,
  SocketMessageDeletedEvent,
  SocketMessageReactedEvent,
  SocketUserTypingEvent
} from '../../modules/chat';
import type { User } from '../../modules/user';

export function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  
  // Estados de Chat
  const [chats, setChats] = useState<IConversationFormatted[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, IMessageFormatted[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  // Estados de Búsqueda
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

  // Función helper para transformar mensaje del socket al formato del frontend
  const transformSocketMessage = (socketMessage: SocketNewMessageEvent | SocketMessageEditedEvent): IMessageFormatted => {
    return {
      id: socketMessage._id,
      sender: socketMessage.sender,
      text: socketMessage.isDeleted ? 'Mensaje eliminado' : socketMessage.text,
      createdAt: socketMessage.createdAt,
      isEdited: socketMessage.isEdited,
      isDeleted: socketMessage.isDeleted,
      replyTo: !socketMessage.replyTo 
        ? undefined 
        : typeof socketMessage.replyTo === 'string'
          ? undefined
          : socketMessage.replyTo,
      reactions: socketMessage.reactions,
      read: socketMessage.readBy.length > 1
    };
  };

  // 1. Cargar conversaciones iniciales
  useEffect(() => {
    if (!user?._id) return;

    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        const { data } = await api.get('/chat');
        setChats(data || []);
      } catch (error) {
        console.error('Error cargando chats:', error);
        setChats([]);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChats();
  }, [user?._id]);

  // 2. Configurar listeners de socket
  useEffect(() => {
    if (!socket || !socket.isConnected()) return;

    // Nuevo mensaje
    const handleNewMessage = (message: SocketNewMessageEvent) => {
      const conversationId = message.conversation;
      const formattedMessage = transformSocketMessage(message);

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), formattedMessage],
      }));

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                lastMessage: message.text,
                lastMessageTime: message.createdAt,
                unreadCount: selectedChatId === conversationId ? 0 : (chat.unreadCount || 0) + 1,
              }
            : chat
        )
      );
    };

    // Mensaje editado
    const handleMessageEdited = (editedMessage: SocketMessageEditedEvent) => {
      const conversationId = editedMessage.conversation;
      const formattedMessage = transformSocketMessage(editedMessage);

      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((msg) =>
          msg.id === editedMessage._id ? formattedMessage : msg
        ),
      }));
    };

    // Mensaje eliminado
    const handleMessageDeleted = ({ messageId, conversationId }: SocketMessageDeletedEvent) => {
      if (conversationId) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((msg) =>
            msg.id === messageId ? { ...msg, text: 'Mensaje eliminado', isDeleted: true } : msg
          ),
        }));
      }
    };

    // Reacción a mensaje
    const handleMessageReacted = ({ messageId, reactions }: SocketMessageReactedEvent) => {
      setMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((convId) => {
          updated[convId] = updated[convId].map((msg) =>
            msg.id === messageId ? { ...msg, reactions } : msg
          );
        });
        return updated;
      });
    };

    // Usuario escribiendo
    const handleUserTyping = ({ userId, conversationId }: SocketUserTypingEvent) => {
      setTypingUsers((prev) => {
        const newSet = new Set([...(prev[conversationId] || []), userId]);
        return {
          ...prev,
          [conversationId]: newSet,
        };
      });
    };

    // Usuario dejó de escribir
    const handleUserStoppedTyping = ({ userId, conversationId }: SocketUserTypingEvent) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev[conversationId] || []);
        newSet.delete(userId);
        return {
          ...prev,
          [conversationId]: newSet,
        };
      });
    };

    // Registrar listeners
    socket.onNewMessage(handleNewMessage);
    socket.onMessageEdited(handleMessageEdited);
    socket.onMessageDeleted(handleMessageDeleted);
    socket.onMessageReacted(handleMessageReacted);
    socket.onUserTyping(handleUserTyping);
    socket.onUserStoppedTyping(handleUserStoppedTyping);

    // Cleanup
    return () => {
      socket.offAll();
    };
  }, [socket, selectedChatId]);

  // 3. Cargar mensajes al seleccionar un chat
  useEffect(() => {
    if (!selectedChatId || !user?._id) return;

    // Si ya tenemos mensajes, solo unirse a la sala
    if (messages[selectedChatId] && messages[selectedChatId].length > 0) {
      socket?.joinRoom(selectedChatId);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/${selectedChatId}/messages`);
        setMessages((prev) => ({ ...prev, [selectedChatId]: data || [] }));
        socket?.joinRoom(selectedChatId);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages((prev) => ({ ...prev, [selectedChatId]: [] }));
      }
    };

    fetchMessages();

    return () => {
      if (selectedChatId && socket) {
        socket.leaveRoom(selectedChatId);
      }
    };
  }, [selectedChatId, user?._id, socket]);

  // 4. Lógica de Búsqueda de Usuarios
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearchingLoading(true);
        try {
          const { data } = await api.get('/user', { 
            params: { 
              search: searchQuery,
              limit: 10
            } 
          });
          
          const filtered = Array.isArray(data) 
            ? data.filter((u: User) => u._id !== user?._id)
            : [];
            
          setSearchResults(filtered);
        } catch (error) {
          console.error('Error buscando usuarios:', error);
          setSearchResults([]);
        } finally {
          setIsSearchingLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, user?._id]);

  // 5. Crear o Abrir Conversación
  const handleStartChat = async (targetUserId: string) => {
    try {
      const existing = chats.find(c => {
        if (c.isGroup) return false;
        
        return c.participants?.some((p: User | string) => {
          const participantId = typeof p === 'string' ? p : p._id;
          return participantId === targetUserId;
        });
      });

      if (existing) {
        setSelectedChatId(existing.id);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
        return;
      }

      const { data: newChat } = await api.post('/chat', { recipientId: targetUserId });
      
      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(newChat.id || newChat._id);
      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creando chat:', error);
    }
  };

  // 6. Enviar Mensaje
  const handleSendMessage = (chatId: string, text: string, replyToId?: string) => {
    if (!socket || !socket.isConnected()) {
      console.error('Socket no conectado');
      return;
    }
    
    socket.sendMessage({ 
      conversationId: chatId, 
      text,
      ...(replyToId && { replyTo: replyToId })
    });
  };

  // 7. Eliminar Chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      await api.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    } catch (error) {
      console.error('Error eliminando chat:', error);
    }
  };

  // 8. Fijar Chat
  const handlePinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const currentChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background overflow-hidden border-t border-border/40">
      
      {/* SIDEBAR */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-border bg-card ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Buscador */}
        <div className="p-4 border-b border-border/40">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="w-full pl-9 pr-8 py-2 bg-muted/50 rounded-xl text-sm border border-transparent focus:border-primary/20 focus:bg-background focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
            />
            {isSearching && (
              <button 
                onClick={() => { 
                  setIsSearching(false); 
                  setSearchQuery(''); 
                  setSearchResults([]);
                }}
                className="absolute right-2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Resultados o Chats */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="p-2">
              {isSearchingLoading && (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              
              {!isSearchingLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                <p className="text-center text-sm text-muted-foreground p-8">
                  No se encontraron usuarios.
                </p>
              )}

              {!isSearchingLoading && searchQuery.length < 2 && (
                <p className="text-center text-sm text-muted-foreground p-8">
                  Escribe al menos 2 caracteres para buscar.
                </p>
              )}

              {searchResults.map(userResult => (
                <div
                  key={userResult._id}
                  onClick={() => handleStartChat(userResult._id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {userResult.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userResult.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{userResult.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : isLoadingChats ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ChatList
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              onDeleteChat={handleDeleteChat}
              onPinChat={handlePinChat}
            />
          )}
        </div>
      </div>

      {/* CONVERSACIÓN */}
      <div className={`flex-1 flex flex-col bg-background/50 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {selectedChatId && currentChat ? (
          <ChatConversation
            chat={{ ...currentChat, messages: messages[selectedChatId] || [] }}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedChatId(null)}
            currentUserId={user?._id || ''}
            typingUsers={typingUsers[selectedChatId] || new Set()}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-sm">Selecciona un chat o busca un usuario para empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
}