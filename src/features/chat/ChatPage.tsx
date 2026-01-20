import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import nuevo
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
  SocketSendMessageData
} from '../../modules/chat';
import type { User } from '../../modules/user';
import { OnlineStatusBadge } from '../OnlineStatusBadge';
import { useFriendshipContext } from '../../context/FriendshipContext';
import { censorText } from '../../utils/profanityFilter';
import { UserProfileModal } from '../friendship/UserProfileModal';
import { useNotificationsContext } from '../../context/NotificationsContext';

export function ChatPage() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const location = useLocation(); // Hook location
  const navigate = useNavigate();
  const { setUnreadChatCount } = useNotificationsContext();

  // State for Profile Viewing in Search
  const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Estados de Chat
  const [chats, setChats] = useState<IConversationFormatted[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const selectedChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const [messages, setMessages] = useState<Record<string, IMessageFormatted[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Estados de Búsqueda
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

  // Estados de Compartir
  const [shareParams, setShareParams] = useState<{ id: string; name: string; type: 'business' | 'event' } | null>(null);

  // Función helper para transformar mensaje del socket al formato del frontend
  const transformSocketMessage = (socketMessage: SocketNewMessageEvent | SocketMessageEditedEvent): IMessageFormatted => {
    // Aplicar filtro de conciencia digital
    const textToProcess = socketMessage.isDeleted ? 'Mensaje eliminado' : socketMessage.text;

    return {
      id: socketMessage._id,
      sender: socketMessage.sender,
      text: censorText(textToProcess),
      createdAt: socketMessage.createdAt,
      isEdited: socketMessage.isEdited,
      isDeleted: socketMessage.isDeleted,
      replyTo: !socketMessage.replyTo
        ? undefined
        : typeof socketMessage.replyTo === 'string'
          ? undefined
          : socketMessage.replyTo,
      reactions: socketMessage.reactions,
      read: socketMessage.readBy.length > 1,
      messageType: socketMessage.messageType,
      imageUrl: socketMessage.imageUrl,
      audioUrl: socketMessage.audioUrl,
      videoUrl: socketMessage.videoUrl,
      locationData: socketMessage.locationData,
      eventData: socketMessage.eventData,
      businessData: socketMessage.businessData,
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

  // Sync Unread Count Global
  useEffect(() => {
    const total = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
    setUnreadChatCount(total);
  }, [chats, setUnreadChatCount]);

  // 1.2. Unirse a todas las salas de chat al cargar (para recibir actualizaciones en tiempo real)
  useEffect(() => {
    if (!socket || !connected || chats.length === 0) return;

    chats.forEach(chat => {
      socket.joinRoom(chat.id);
    });
    console.log(`📡 [ChatPage] Unido a ${chats.length} salas de chat`);
  }, [socket, connected, chats.length]);


  // ✅ LOGICA START CHAT (MOVIDA ARRIBA PARA REUTILIZAR)
  const handleStartChat = async (targetUserId: string) => {
    try {
      // 1. Buscar si ya existe en estado local
      const existing = chats.find(c => {
        if (c.isGroup) return false;
        return c.participants?.some((p: User | string) => {
          const participantId = typeof p === 'string' ? p : p._id;
          return participantId === targetUserId;
        });
      });

      if (existing) {
        // En lugar de alert, seleccionamos el chat
        setSelectedChatId(existing.id);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
        return;
      }

      // 2. Si no existe, crear o buscar en backend
      const { data: newChat } = await api.post('/chat/conversation', { recipientId: targetUserId });

      // 3. Verificar si el backend devolvió un chat que ya teníamos pero no vimos
      setChats(prev => {
        const exists = prev.find(c => c.id === newChat.conversationId || c.id === newChat._id);
        if (exists) return prev;

        // Si es nuevo de verdad, formatéalo si es necesario
        // La respuesta de POST /chat/conversation devuelve { conversationId, message } a veces
        // O el objeto completo. Vamos a asumir que necesitamos refrescar o es { conversationId }

        // Hack: Si devuelve solo ID, mejor recargar chats o buscarlo
        if (newChat.conversationId && !newChat.participants) {
          // Es el formato { conversationId: "...", message: "..." }
          // Deberíamos hacer fetch de esta conversación o recargar todo
          // Por simplicidad, agregamos un placeholder y dejamos que el socket o refresh lo arregle
          // O mejor: recargamos chats silenciamente
          // loadChats(); <-- No disponible aqui facilmente sin refactor
          return prev;
        }
        return [newChat, ...prev];
      });

      // El endpoint devuelve { conversationId: "...", message: "..." } según swagger
      const realId = newChat.conversationId || newChat.id || newChat._id;

      if (realId) {
        // Si no tenemos el objeto completo, forzamos recarga de chats para tener la info completa (nombre, avatar)
        // Esto es más seguro que intentar construir el objeto manual
        const { data: allChats } = await api.get('/chat');
        setChats(allChats);
        setSelectedChatId(realId);
      }

      setIsSearching(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creando chat:', error);
    }
  };

  // ✅ 1.5. DETECTAR QUERY PARAMS
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openUserId = params.get('openUserId');
    const shareBusinessId = params.get('shareBusiness');
    const shareEventId = params.get('shareEvent');
    const name = params.get('name');

    if (openUserId && !isLoadingChats) {
      handleStartChat(openUserId);
      navigate('/chat', { replace: true });
    }

    // Handle state navigation (from UserProfileModal etc)
    const state = location.state as { startChatWith?: string; openUserId?: string } | null;
    if (state?.startChatWith && !isLoadingChats) {
      handleStartChat(state.startChatWith);
      // Clear state to prevent loop
      navigate(location.pathname, { replace: true, state: {} });
    }

    if ((shareBusinessId || shareEventId) && name) {
      setShareParams({
        id: (shareBusinessId || shareEventId)!,
        name,
        type: shareBusinessId ? 'business' : 'event'
      });
    }
  }, [location.search, isLoadingChats, chats.length]); // Dependencias clave

  // 2. Configurar listeners de socket (ESTABILIDAD MEJORADA)
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('🔌 [ChatPage] Registrando listeners de socket estables...');

    // Nuevo mensaje
    const handleNewMessage = (message: SocketNewMessageEvent) => {
      const conversationId = message.conversation;

      // Auto-join para reactividad futura
      socket.joinRoom(conversationId);

      const formattedMessage = transformSocketMessage(message);

      setMessages((prev) => {
        const currentMsgs = prev[conversationId] || [];

        // 1. Si el mensaje ya existe (por ID real), ignorar
        if (currentMsgs.some(m => m.id === formattedMessage.id)) return prev;

        // 2. Intentar reconciliar con un mensaje optimista (mismo texto y emisor)
        const senderId = typeof formattedMessage.sender === 'string'
          ? formattedMessage.sender
          : formattedMessage.sender._id;

        const tempIdx = currentMsgs.findIndex(m =>
          m.id.startsWith('temp-') &&
          m.text === formattedMessage.text &&
          (typeof m.sender === 'string' ? m.sender : m.sender._id) === senderId
        );

        if (tempIdx > -1) {
          const updatedMsgs = [...currentMsgs];
          updatedMsgs[tempIdx] = formattedMessage;
          return { ...prev, [conversationId]: updatedMsgs };
        }

        // 3. Si no es un duplicado ni una confirmación, añadirlo
        return {
          ...prev,
          [conversationId]: [...currentMsgs, formattedMessage],
        };
      });

      setChats((prev) => {
        const exists = prev.find(c => c.id === conversationId);

        if (!exists) {
          // Si el chat es nuevo, refrescamos la lista
          api.get('/chat').then(({ data }) => setChats(data || []));
          return prev;
        }

        return prev.map((chat) =>
          chat.id === conversationId
            ? {
              ...chat,
              lastMessage: formattedMessage.text,
              lastMessageTime: message.createdAt,
              unreadCount: selectedChatIdRef.current === conversationId ? 0 : (chat.unreadCount || 0) + 1,
            }
            : chat
        );
      });
    };

    // Mensaje editado
    const handleMessageEdited = (edited: SocketMessageEditedEvent) => {
      const formatted = transformSocketMessage(edited);
      setMessages(prev => ({
        ...prev,
        [edited.conversation]: (prev[edited.conversation] || []).map(m => m.id === edited._id ? formatted : m)
      }));
    };

    // Mensaje eliminado
    const handleMessageDeleted = ({ messageId, conversationId }: any) => {
      if (conversationId) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map(m => m.id === messageId ? { ...m, text: 'Mensaje eliminado', isDeleted: true } : m)
        }));
      }
    };

    // Reacción
    const handleMessageReacted = ({ messageId, reactions }: any) => {
      setMessages(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(cid => {
          copy[cid] = copy[cid].map(m => m.id === messageId ? { ...m, reactions } : m);
        });
        return copy;
      });
    };

    // Typing
    const handleUserTyping = ({ userId, conversationId }: any) => {
      setTypingUsers(prev => ({ ...prev, [conversationId]: new Set([...(prev[conversationId] || []), userId]) }));
    };
    const handleUserStoppedTyping = ({ userId, conversationId }: any) => {
      setTypingUsers(prev => {
        const s = new Set(prev[conversationId] || []);
        s.delete(userId);
        return { ...prev, [conversationId]: s };
      });
    };

    const handleMessagesRead = ({ conversationId, userId: readerId }: any) => {
      if (readerId === user?._id) {
        setChats(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
      }
    };

    socket.onNewMessage(handleNewMessage);
    socket.onMessageEdited(handleMessageEdited);
    socket.onMessageDeleted(handleMessageDeleted);
    socket.onMessageReacted(handleMessageReacted);
    socket.onUserTyping(handleUserTyping);
    socket.onUserStoppedTyping(handleUserStoppedTyping);
    socket.getSocket()?.on('messagesRead', handleMessagesRead);

    return () => {
      socket.offNewMessage();
      socket.offMessageEdited();
      socket.offMessageDeleted();
      socket.offMessageReacted();
      socket.offUserTyping();
      socket.offUserStoppedTyping();
      socket.getSocket()?.off('messagesRead', handleMessagesRead);
    };
  }, [socket, connected, user?._id]); // ✅ NO incluir selectedChatId aquí para evitar cortes en listeners

  // 3. Cargar mensajes al seleccionar un chat (SIN CAMBIOS)
  useEffect(() => {
    if (!selectedChatId || !user?._id) return;
    if (messages[selectedChatId] && messages[selectedChatId].length > 0) {
      socket?.joinRoom(selectedChatId);
      return;
    }
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat/${selectedChatId}/messages`);

        // Transformamos los mensajes para asegurar que tengan el campo 'id'
        const formattedMessages = (data || []).map((m: any) => ({
          ...m,
          id: m._id,
          read: true // Si acabamos de cargarlos vía getMessages, el backend ya los marcó como leídos
        }));

        setMessages((prev) => ({ ...prev, [selectedChatId]: formattedMessages }));
        setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, unreadCount: 0 } : c));
        socket?.joinRoom(selectedChatId);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages((prev) => ({ ...prev, [selectedChatId]: [] }));
      }
    };
    fetchMessages();
    return () => {
      if (selectedChatId && socket) socket.leaveRoom(selectedChatId);
    };
  }, [selectedChatId, user?._id, socket]);

  // ✅ 3.5. Marcar como leído
  useEffect(() => {
    if (!selectedChatId || !user?._id || !socket || !messages[selectedChatId]) return;

    const unreadMessages = messages[selectedChatId].filter(
      m => !m.read &&
        (typeof m.sender === 'string' ? m.sender !== user._id : m.sender._id !== user._id)
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(m => m.id);

      // Emit socket event
      socket.getSocket()?.emit('markAsRead', {
        conversationId: selectedChatId,
        messageIds
      });

      // Optimistic update
      setMessages(prev => ({
        ...prev,
        [selectedChatId]: prev[selectedChatId].map(m =>
          messageIds.includes(m.id) ? { ...m, read: true } : m
        )
      }));

      // Update chat unread count
      setChats(prev => prev.map(c =>
        c.id === selectedChatId ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [selectedChatId, selectedChatId ? messages[selectedChatId]?.length : 0, user?._id]);

  // ✅ 4. Lógica de Búsqueda MEJORADA
  // Filtra chats locales Y busca usuarios globales
  // 5. Buscar Usuarios y Amigos
  const [friends, setFriends] = useState<User[]>([]);
  const { friendshipUpdates } = useFriendshipContext(); // ✅ AÑADIR

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const { data } = await api.get('/friendship/friends');
        // El backend devuelve amigos del usuario logueado
        setFriends(data || []);
      } catch (e) {
        console.error("Error cargando amigos para chat:", e);
      }
    };
    if (user) loadFriends();
  }, [user]);

  // 🔥 Reaccionar a cambios de amistad en tiempo real en la lista de amigos sugeridos
  useEffect(() => {
    // Si hay una actualización que pase a ser 'friends', refrescamos la lista
    // O si se elimina a alguien, lo filtramos
    setFriends(prev => {
      let changed = false;
      const newList = prev.filter(f => {
        const update = friendshipUpdates.get(f._id);
        if (update && update.status !== 'friends') {
          changed = true;
          return false;
        }
        return true;
      });
      return changed ? newList : prev;
    });
  }, [friendshipUpdates]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearchingLoading(true);
        try {
          const { data } = await api.get(`/user/search?q=${searchQuery}`);
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
  }, [searchQuery, user?._id, socket, connected]);

  // 6. Enviar Mensaje (MEJORADO CON OPTIMISMO)
  const handleSendMessage = (chatId: string, text: string, replyToId?: string, extraData: Partial<SocketSendMessageData> = {}) => {
    if (!socket) {
      console.error('Socket no inicializado');
      return;
    }

    // 1. Crear mensaje optimista
    const optimisticMessage: IMessageFormatted = {
      id: `temp-${Date.now()}`,
      sender: {
        _id: user?._id || '',
        username: user?.username || 'Yo',
        avatar: user?.avatar || '',
        email: '', // Mandatory fields for Type safety if not using 'as any' as strictly
        phoneNumber: '',
        role: 'user',
        birthday: new Date(),
        events: []
      } as any,
      text: censorText(text),
      createdAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      reactions: [],
      read: false,
      ...extraData
    };

    // 2. Actualizar estado local inmediatamente
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), optimisticMessage]
    }));

    // 3. Actualizar último mensaje en la lista de chats
    setChats(prev => prev.map(c => c.id === chatId ? {
      ...c,
      lastMessage: text,
      lastMessageTime: new Date().toISOString()
    } : c));

    // 4. Enviar vía socket
    socket.sendMessage({
      conversationId: chatId,
      text,
      ...(replyToId && { replyTo: replyToId }),
      ...extraData
    });

    console.log('📤 [ChatPage] Mensaje enviado optimísticamente');
  };

  // 7. Eliminar Chat (SIN CAMBIOS)
  const handleDeleteChat = async (chatId: string) => {
    try {
      await api.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (selectedChatId === chatId) setSelectedChatId(null);
    } catch (error) {
      console.error('Error eliminando chat:', error);
    }
  };

  // 8. Fijar Chat (SIN CAMBIOS)
  const handlePinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) => chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat)
    );
  };

  // 9. Estado de Filtros
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 10. Modificar setSelectedChatId para manejar compartir
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);

    // Si hay parámetros de compartir, enviamos el mensaje automáticamente
    if (shareParams) {
      const text = shareParams.type === 'business'
        ? `¡Echa un vistazo a ${shareParams.name}!`
        : `¡Únete a este evento: ${shareParams.name}!`;

      handleSendMessage(chatId, text, undefined, {
        messageType: shareParams.type,
        businessData: shareParams.type === 'business' ? { businessId: shareParams.id } : undefined,
        eventData: shareParams.type === 'event' ? { eventId: shareParams.id } : undefined,
      });

      setShareParams(null);
      navigate('/chat', { replace: true });
    }
  };

  const filteredChats = chats.filter((chat) => {
    // 1. Filtro de Texto (Búsqueda)
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Filtro de Pestañas
    if (activeFilter === 'unread') return (chat.unreadCount || 0) > 0;
    if (activeFilter === 'groups') return chat.isGroup;

    return true;
  });

  const handleNewChatClick = () => {
    // Enfocar búsqueda para iniciar nuevo chat tras buscar usuarios
    searchInputRef.current?.focus();
    // Opcional: Podría abrir un modal de "Seleccionar Contacto"
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const selectedChatMessages = selectedChatId ? (messages[selectedChatId] || []) : [];

  return (
    <div className="flex h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center overflow-hidden font-sans text-foreground">
      {/* Overlay Oscuro + Glassmorphism Global */}
      <div className="w-full h-full flex bg-background/80 backdrop-blur-3xl shadow-2xl overflow-hidden">

        {/* Sidebar (ChatList) */}
        <div className={`
          w-full md:w-[360px] lg:w-[400px] flex-shrink-0 flex flex-col border-r border-white/5 bg-black/10 backdrop-blur-md relative z-10 transition-all duration-300
          ${selectedChatId ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Header Sidebar */}
          <div className="p-5 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              Mensajes
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleNewChatClick}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95 border border-white/5 group"
                title="Nuevo Chat"
              >
                <MessageSquarePlus className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-5 pb-4">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar chats o personas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(!!e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-muted-foreground/60 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    setSearchResults([]);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs (Visual) */}
          <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-r">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'unread', label: 'No leídos' },
              { id: 'groups', label: 'Grupos' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`
                  px-4 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap active:scale-95
                  ${activeFilter === filter.id
                    ? 'bg-primary/20 border-primary/20 text-primary shadow-sm shadow-primary/10'
                    : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Lista de Chats / Resultados */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2 custom-scrollbar">
            {/* Resultados Globales */}
            {isSearching && (
              <div className="mb-4 animate-in slide-in-from-left-5">
                <h3 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2 mt-2">
                  {isSearchingLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Resultados Globales
                </h3>

                {!isSearchingLoading && searchResults.length === 0 && searchQuery.length >= 2 && filteredChats.length === 0 && (
                  <p className="px-4 text-xs text-muted-foreground italic text-center py-4">No se encontraron usuarios.</p>
                )}

                {/* Mostrar Amigos cuando no hay búsqueda activa o como sugerencia */}
                {searchQuery.length < 2 && searchResults.length === 0 && friends.length > 0 && (
                  <div className="mb-2 animate-in fade-in transition-all">
                    <h4 className="px-4 text-[9px] font-bold text-primary/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                      Sugerencias (Amigos)
                    </h4>
                    {friends.map(friend => (
                      <div
                        key={friend._id}
                        onClick={() => handleStartChat(friend._id)}
                        className="flex items-center gap-3 p-3 mx-1 rounded-2xl hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98] group border border-transparent hover:border-white/5"
                      >
                        <div className="relative">
                          <img
                            src={friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=random`}
                            className="w-10 h-10 rounded-full shadow-md"
                            alt={friend.username}
                          />
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <OnlineStatusBadge userId={friend._id} size="sm" showOffline={true} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{friend.username}</p>
                          <p className="text-[10px] text-muted-foreground truncate">Amigo</p>
                        </div>
                      </div>
                    ))}
                    <div className="my-4 border-t border-white/5 mx-4" />
                  </div>
                )}

                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 mx-1 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 relative"
                  >
                    <div className="relative cursor-pointer" onClick={() => handleStartChat(user._id)}>
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                        className="w-11 h-11 rounded-full shadow-md group-hover:shadow-lg transition-all"
                        alt={user.username}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <OnlineStatusBadge userId={user._id} size="sm" showOffline={true} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleStartChat(user._id)}>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                        Empezar chat nuevo
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingProfileUsername(user.username);
                        setIsProfileModalOpen(true);
                      }}
                      className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Ver Perfil"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {filteredChats.length > 0 && searchResults.length > 0 && <div className="my-4 border-t border-white/5 mx-4" />}
              </div>
            )}

            {/* Chats Locales */}
            {isLoadingChats ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-medium animate-pulse">Sincronizando mensajes...</p>
              </div>
            ) : (
              <>
                {!isSearching && chats.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    <p className="text-sm">No tienes conversaciones.</p>
                  </div>
                )}
                <ChatList
                  chats={filteredChats}
                  selectedChatId={selectedChatId}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={handleDeleteChat}
                  onPinChat={handlePinChat}
                  currentUserId={user?._id || ''}
                />
              </>
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className={`flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-black/5 backdrop-blur-sm shadow-inner
          ${!selectedChatId ? 'hidden md:flex' : 'flex'}
        `}>
          {shareParams && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                {shareParams.type === 'business' ? <Search className="w-10 h-10 text-primary" /> : <MessageSquarePlus className="w-10 h-10 text-primary" />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Compartir {shareParams.type === 'business' ? 'Discoteca' : 'Evento'}</h3>
              <p className="text-white/60 mb-6 max-w-xs transition-all">
                Selecciona un chat de la lista de la izquierda para compartir <strong>{shareParams.name}</strong>
              </p>
              <button
                onClick={() => { setShareParams(null); navigate('/chat', { replace: true }); }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          )}
          {selectedChatId && selectedChat ? (
            <ChatConversation
              chat={{ ...selectedChat, messages: selectedChatMessages }}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedChatId(null)}
              currentUserId={user?._id || ''}
              typingUsers={typingUsers[selectedChatId] || new Set()}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 space-y-6 animate-in zoom-in-95 duration-500">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <MessageSquarePlus className="w-full h-full text-primary/80 relative z-10 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                  NightUp Chat
                </h2>
                <p className="text-muted-foreground/80 max-w-md text-lg font-light leading-relaxed">
                  Conecta con tus amigos, organiza planes y vive la noche.
                  <br />Selecciona un chat para comenzar.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
      <UserProfileModal
        username={viewingProfileUsername || ''}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}