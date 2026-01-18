import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Video,
  Camera,
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  Reply,
  X,
  Search,
  Image,
  FileText,
  MapPin,
  Mic,
  Play,
  Headphones
} from 'lucide-react';
import type { IConversationFormatted, IMessageFormatted, MessageType, SocketSendMessageData } from '../../modules/chat';
import { useSocket } from '../../hooks/useSocket';
import type { User } from '../../modules/user';
import { UserProfileModal } from './UserProfileModal';
import { LocationMessage } from './LocationMessage';
import { EventMessage } from './EventMessage';
import { BusinessMessage } from './BusinessMessage';

interface ChatConversationProps {
  chat: IConversationFormatted & { messages: IMessageFormatted[] };
  onSendMessage: (chatId: string, text: string, replyToId?: string, extraData?: Partial<SocketSendMessageData>) => void;
  onBack: () => void;
  currentUserId: string;
  typingUsers: Set<string>;
}

export function ChatConversation({ chat, onSendMessage, onBack, currentUserId, typingUsers }: ChatConversationProps) {
  const { socket, connected } = useSocket();
  const [message, setMessage] = useState('');
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<IMessageFormatted | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileModalUser, setProfileModalUser] = useState<User | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showDigitalConscience, setShowDigitalConscience] = useState(false);

  // Tips de Conciencia Digital
  const digitalTips = [
    "Recuerda parpadear y descansar tus ojos cada 20 minutos. 👀",
    "La calidad de la conversación importa más que la velocidad de respuesta. ✨",
    "Un mensaje amable puede cambiar el día de alguien. Sé respetuoso. ❤️",
    "Si te sientes abrumado, está bien tomarte un respiro del mundo digital. 🌿",
    "Tus amigos valoran tu presencia real tanto como la digital. No olvides quedar en persona. 🤝"
  ];
  const [currentTip, setCurrentTip] = useState(digitalTips[0]);

  useEffect(() => {
    // Mostrar un tip cada 15 minutos o al azar
    const timer = setTimeout(() => {
      setCurrentTip(digitalTips[Math.floor(Math.random() * digitalTips.length)]);
      setShowDigitalConscience(true);
      setTimeout(() => setShowDigitalConscience(false), 8000);
    }, 60000 * 5); // Cada 5 mins para demo, subir a 15 min después

    return () => clearTimeout(timer);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // --- Filtering Logic ---
  // --- Pipeline de Procesamiento de Mensajes ---

  // 1. Filtrado por búsqueda
  const filteredMessages = useMemo(() => {
    if (isSearching && searchQuery) {
      return chat.messages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return chat.messages;
  }, [chat.messages, isSearching, searchQuery]);

  // Control de typing
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- Helpers para obtener datos del Sender ---
  const getSenderId = (msg: IMessageFormatted): string => {
    if (!msg.sender) return 'unknown';
    return typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
  };

  const getSenderName = (msg: IMessageFormatted | User | string): string => {
    if (!msg) return 'Usuario';

    // Si es mensaje
    if (typeof msg === 'object' && 'sender' in msg) {
      if (typeof msg.sender === 'string') return 'Usuario';
      return msg.sender.username || 'Usuario';
    }

    // Si es usuario directo
    if (typeof msg === 'object' && 'username' in msg) {
      return msg.username;
    }

    return 'Usuario';
  };

  const getSenderAvatar = (msg: IMessageFormatted): string => {
    if (typeof msg.sender === 'string') {
      return `https://ui-avatars.com/api/?name=Usuario&background=random`;
    }

    // Como User no tiene avatar en tu modelo, generamos uno con el username
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.username)}&background=random`;
  };

  // --- Auto Scroll ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, typingUsers, chat.id]);

  // --- Manejo de "Escribiendo..." ---
  const handleTyping = () => {
    if (!socket || !connected) return;

    socket.typing({ conversationId: chat.id });

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Dejar de escribir a los 2 segundos de inactividad
    typingTimeoutRef.current = setTimeout(() => {
      socket.stopTyping({ conversationId: chat.id });
    }, 2000);
  };

  // --- Enviar Mensaje ---
  const handleSend = () => {
    if (message.trim()) {
      if (editingMessageId) {
        // Editar
        socket?.editMessage({ messageId: editingMessageId, text: message });
        setEditingMessageId(null);
      } else {
        // Nuevo
        onSendMessage(chat.id, message, replyingTo?.id);
      }

      setMessage('');
      setReplyingTo(null);
      inputRef.current?.focus();

      // Forzar stop typing inmediato
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket?.stopTyping({ conversationId: chat.id });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Acciones de Mensaje ---
  const handleEditMessage = (msg: IMessageFormatted) => {
    setEditingMessageId(msg.id);
    setMessage(msg.text);
    setMessageMenuOpen(null);
    inputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId: string) => {
    socket?.deleteMessage({ messageId });
    setMessageMenuOpen(null);
  };

  const handleReplyToMessage = (msg: IMessageFormatted) => {
    setReplyingTo(msg);
    setMessageMenuOpen(null);
    inputRef.current?.focus();
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    socket?.reactToMessage({ messageId, emoji });
    setMessageMenuOpen(null);
  };

  const cancelEditOrReply = () => {
    setEditingMessageId(null);
    setReplyingTo(null);
    setMessage('');
    inputRef.current?.focus();
  };

  // --- Compartir Ubicación ---
  const handleShareLocation = () => {
    setAttachmentMenuOpen(false);

    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Intentar obtener la dirección usando reverse geocoding (opcional)
        const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        const locationText = `📍 Ubicación compartida: ${address}`;

        try {
          // Puedes usar un servicio de geocoding aquí si lo deseas
          // Por ahora, solo enviamos las coordenadas

          // Enviamos un mensaje de texto especial que incluirá la ubicación
          // El backend puede almacenar esto como texto y el frontend lo renderiza especialmente
          onSendMessage(chat.id, locationText);

          // Nota: Para full implementación, necesitarías extender el backend
          // para soportar el campo locationData en los mensajes
        } catch (error) {
          console.error('Error al compartir ubicación:', error);
          onSendMessage(chat.id, locationText);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación. Verifica los permisos.');
      }
    );
  };

  // --- Compartir Evento ---
  const handleShareEvent = (eventId: string) => {
    // Por ahora, enviamos un mensaje de texto con el ID del evento
    // El frontend puede detectar el patrón y renderizarlo especialmente
    const eventText = `🎉 Evento compartido: [EVENT:${eventId}]`;
    onSendMessage(chat.id, eventText);
    setProfileModalUser(null);
  };

  // --- Compartir Discoteca ---
  const handleShareBusiness = (businessId: string) => {
    // Similar al evento, enviamos un mensaje especial
    const businessText = `🎵 Discoteca compartida: [BUSINESS:${businessId}]`;
    onSendMessage(chat.id, businessText);
  };

  // --- Llamada Google Meet ---
  const handleStartCall = () => {
    // Google Meet Lookup URL o New
    // Para que ambos entren a la misma, usaremos el ID de la conversación
    const roomName = `nightup-${chat.id.substring(0, 10)}`;
    const meetUrl = `https://meet.google.com/lookup/${roomName}`;
    window.open(meetUrl, '_blank');
    onSendMessage(chat.id, `📞 He iniciado una videollamada. Únete aquí: ${meetUrl}`);
  };

  // --- Adjuntos ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'doc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear una URL temporal para previsualización (Demo)
    const fileUrl = URL.createObjectURL(file);

    if (type === 'image') {
      onSendMessage(chat.id, `📸 Foto de ${file.name}`, undefined, {
        messageType: 'image',
        imageUrl: fileUrl
      });
    } else if (type === 'video') {
      onSendMessage(chat.id, `🎥 Video de ${file.name}`, undefined, {
        messageType: 'video',
        videoUrl: fileUrl
      });
    } else {
      onSendMessage(chat.id, `📎 He enviado un documento: ${file.name}`);
    }
    setAttachmentMenuOpen(false);
  };

  // --- Grabación de Audio ---
  const handleToggleAudio = () => {
    if (isRecording) {
      // Detener (Simulación)
      setIsRecording(false);
      onSendMessage(chat.id, "🎵 Mensaje de voz", undefined, {
        messageType: 'audio',
        audioUrl: "#" // Simulado
      });
    } else {
      setIsRecording(true);
      setRecordingDuration(0);
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimeout(() => clearInterval(interval), 60000); // Max 1 min
    }
  };

  const markAsRead = () => {
    if (chat.unreadCount > 0) {
      socket?.markAsRead({ conversationId: chat.id });
    }
  };

  useEffect(() => {
    markAsRead();
  }, [chat.id, chat.messages.length]);

  const formatMessageTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // 2. Parsing de mensajes especiales (on-the-fly)
  const processedMessages = useMemo(() => {
    return filteredMessages.map(msg => {
      // Si ya tiene tipo especial, no hacemos nada
      if (msg.messageType && msg.messageType !== 'text') return msg;

      // 1. Detectar Ubicación
      const locMatch = msg.text.match(/📍 Ubicación compartida: ([\d.-]+), ([\d.-]+)/);
      if (locMatch) {
        return {
          ...msg,
          messageType: 'location' as MessageType,
          locationData: {
            latitude: parseFloat(locMatch[1]),
            longitude: parseFloat(locMatch[2])
          }
        };
      }

      // 2. Detectar Evento
      const evtMatch = msg.text.match(/🎉 Evento compartido: \[EVENT:(.+)\]/);
      if (evtMatch) {
        return {
          ...msg,
          messageType: 'event' as MessageType,
          eventData: { eventId: evtMatch[1] }
        };
      }

      // 3. Detectar Discoteca
      const busMatch = msg.text.match(/🎵 Discoteca compartida: \[BUSINESS:(.+)\]/);
      if (busMatch) {
        return {
          ...msg,
          messageType: 'business' as MessageType,
          businessData: { businessId: busMatch[1] }
        };
      }

      return msg;
    });
  }, [filteredMessages]);

  // 3. Agrupación por fechas
  const groupsByDate = useMemo(() => {
    const groups: { date: string; messages: IMessageFormatted[] }[] = [];
    let currentDate = '';
    let currentGroup: IMessageFormatted[] = [];

    processedMessages.forEach((msg) => {
      const msgDate = typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : new Date(msg.createdAt);
      const dateString = msgDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (dateString !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = dateString;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }, [processedMessages]);

  // --- Emojis ---
  const emojis = ['😊', '😂', '❤️', '🎉', '🔥', '👍', '🎵', '🍾', '💃', '🕺', '✨', '🌟'];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  // --- Lógica Visual de Typing ---
  const typingNames = Array.from(typingUsers)
    .filter(id => id !== currentUserId)
    .map(id => {
      const participant = chat.participants?.find(p => {
        const pId = typeof p === 'string' ? p : p._id;
        return pId === id;
      });

      if (!participant) return null;
      return typeof participant === 'string' ? 'Alguien' : participant.username;
    })
    .filter(Boolean);

  const isSomeoneTyping = typingNames.length > 0;

  // --- Obtener avatar del chat ---
  const getChatAvatar = (): string => {
    if (chat.avatar) return chat.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-transparent relative">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 md:p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-10 shadow-sm">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div
            className="relative flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (!chat.isGroup && chat.participants && chat.participants.length > 0) {
                const otherUser = chat.participants.find(p => {
                  const participantId = typeof p === 'string' ? p : p._id;
                  return participantId !== currentUserId;
                });
                if (otherUser && typeof otherUser !== 'string') {
                  setProfileModalUser(otherUser);
                }
              }
            }}
          >
            <img
              src={getChatAvatar()}
              alt={chat.name}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover border-2 border-white/10 shadow-md"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`;
              }}
            />
            {/* Online status indicator (mock) */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full shadow-sm"></div>
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (!chat.isGroup && chat.participants && chat.participants.length > 0) {
                const otherUser = chat.participants.find(p => {
                  const participantId = typeof p === 'string' ? p : p._id;
                  return participantId !== currentUserId;
                });
                if (otherUser && typeof otherUser !== 'string') {
                  setProfileModalUser(otherUser);
                }
              }
            }}
          >
            <h2 className="font-bold text-sm md:text-base truncate text-white drop-shadow-sm">
              {chat.name || 'Usuario'}
            </h2>
            <p className="text-xs text-white/60 truncate flex items-center gap-1">
              {isSomeoneTyping ? (
                <span className="text-primary font-medium">{typingNames.join(', ')} escribiendo...</span>
              ) : (
                chat.isGroup ? `${chat.participants?.length || 0} miembros` : 'En línea'
              )}
            </p>
          </div>

          <div className="flex items-center gap-1 text-white/80">
            {isSearching ? (
              <div className="flex items-center bg-white/10 rounded-full px-2 py-0.5 mr-1 border border-white/10 animate-in slide-in-from-right-5 fade-in">
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/40 w-24 md:w-40 focus:outline-none"
                />
                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 hover:text-white text-white/50 rounded-full transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsSearching(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                  title="Buscar en chat"
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  onClick={handleStartCall}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                  title="Videollamada con Google Meet"
                >
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 py-4 md:px-4 space-y-4 custom-scrollbar">
          {chat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500">
                <span className="text-4xl">👋</span>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-lg text-white">¡Saluda!</p>
                <p className="text-sm text-white/50 max-w-xs mx-auto">
                  No hay mensajes aquí aún. Envía un mensaje para comenzar la conversación.
                </p>
              </div>
            </div>
          ) : (
            groupsByDate.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Separador de Fecha */}
                <div className="flex items-center justify-center mb-6">
                  <span className="px-3 py-1 bg-black/20 backdrop-blur-md border border-white/5 rounded-full text-[10px] md:text-xs font-medium text-white/60 uppercase tracking-wide shadow-sm">
                    {group.date}
                  </span>
                </div>

                {/* Mensajes del día */}
                <div className="space-y-1">
                  {group.messages.map((msg: IMessageFormatted, index: number) => {
                    const senderId = getSenderId(msg);
                    const isOwn = senderId === currentUserId;

                    // Mostrar avatar solo en grupos y mensajes recibidos
                    const showAvatar = !isOwn && chat.isGroup && (
                      index === group.messages.length - 1 ||
                      getSenderId(group.messages[index + 1]) !== senderId
                    );

                    return (
                      <div
                        key={msg.id}
                        className={`group flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar en grupos */}
                        {!isOwn && chat.isGroup && (
                          <div className="w-8 h-8 flex-shrink-0 mb-1">
                            {showAvatar ? (
                              <img
                                src={getSenderAvatar(msg)}
                                alt="avatar"
                                className="w-8 h-8 rounded-full object-cover shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=random`;
                                }}
                              />
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}

                        {/* Burbuja del Mensaje */}
                        <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>

                          {/* Nombre en grupo */}
                          {!isOwn && chat.isGroup && showAvatar && (
                            <span className="text-[10px] text-white/50 px-1 mb-0.5 ml-1">
                              {getSenderName(msg)}
                            </span>
                          )}

                          {/* Preview de Respuesta */}
                          {msg.replyTo && typeof msg.replyTo === 'object' && (
                            <div
                              className={`
                              text-xs p-2 mb-1 rounded-lg border-l-2 bg-black/10 backdrop-brightness-75 w-full cursor-pointer hover:bg-black/20 transition-colors
                              ${isOwn ? 'border-primary/50 text-white/80' : 'border-white/50 text-white/70'}
                            `}
                            >
                              <span className="font-bold block mb-0.5 opacity-70">Respondiendo...</span>
                              <span className="line-clamp-1 italic text-white/90">
                                {msg.replyTo.text}
                              </span>
                            </div>
                          )}

                          {/* Contenido - Diferentes tipos de mensajes */}
                          {msg.messageType === 'location' && msg.locationData ? (
                            <LocationMessage locationData={msg.locationData} isOwn={isOwn} />
                          ) : msg.messageType === 'event' && msg.eventData ? (
                            <EventMessage eventData={msg.eventData} isOwn={isOwn} />
                          ) : msg.messageType === 'business' && msg.businessData ? (
                            <BusinessMessage businessData={msg.businessData} isOwn={isOwn} />
                          ) : msg.messageType === 'image' && msg.imageUrl ? (
                            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg max-w-sm">
                              <img src={msg.imageUrl} alt="Adjunto" className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.imageUrl, '_blank')} />
                            </div>
                          ) : msg.messageType === 'video' && msg.videoUrl ? (
                            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg max-w-sm bg-black">
                              <video src={msg.videoUrl} controls className="w-full h-auto" />
                            </div>
                          ) : msg.messageType === 'audio' && msg.audioUrl ? (
                            <div className={`flex items-center gap-3 p-3 rounded-2xl min-w-[200px] ${isOwn ? 'bg-white/20' : 'bg-white/10'}`}>
                              <button className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-white">
                                <Play className="w-5 h-5 fill-current" />
                              </button>
                              <div className="flex-1">
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-white/60 w-1/3" />
                                </div>
                                <span className="text-[10px] text-white/60 mt-1 block">Audio - 0:15</span>
                              </div>
                              <Headphones className="w-4 h-4 text-white/40" />
                            </div>
                          ) : (
                            // Mensaje de texto normal
                            <div
                              className={`
                              relative px-4 py-2.5 text-sm md:text-[15px] shadow-sm backdrop-blur-sm
                              ${msg.isDeleted
                                  ? 'bg-white/5 border border-white/10 text-white/50 italic rounded-xl'
                                  : isOwn
                                    ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl rounded-tr-sm border border-transparent'
                                    : 'bg-white/10 border border-white/5 text-white rounded-2xl rounded-tl-sm'
                                }
                            `}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (!msg.isDeleted) setMessageMenuOpen(msg.id);
                              }}
                            >
                              <p className="break-words whitespace-pre-wrap leading-relaxed tracking-wide font-light">{msg.text}</p>
                              {/* Metadata del mensaje */}
                              <div className={`flex items-center justify-end gap-1 mt-1 opacity-70 ${isOwn ? 'text-white/80' : 'text-white/50'}`}>
                                {msg.isEdited && !msg.isDeleted && <span className="text-[9px] uppercase tracking-wider">editado</span>}
                                <span className="text-[10px]">{formatMessageTime(msg.createdAt)}</span>
                                {isOwn && !msg.isDeleted && (
                                  msg.read ? <CheckCheck className="w-3 h-3 text-white" /> : <Check className="w-3 h-3" />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Reacciones */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className={`flex gap-0.5 mt-1 -mb-2 z-10 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                              {msg.reactions.map((reaction: any, idx: number) => (
                                <span key={idx} className="text-xs bg-black/30 border border-white/10 px-1.5 py-0.5 rounded-full shadow-sm animate-in zoom-in text-white/90">
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Menú Contextual del Mensaje */}
                          {messageMenuOpen === msg.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setMessageMenuOpen(null)} />
                              <div className={`
                              absolute z-30 mt-1 p-1 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl min-w-[160px] animate-in zoom-in-95
                              ${isOwn ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
                            `}>
                                {/* Barra de Reacciones Rápida */}
                                <div className="flex justify-between p-2 mb-1 bg-white/5 rounded-lg border border-white/5">
                                  {reactionEmojis.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactToMessage(msg.id, emoji)}
                                      className="hover:scale-125 transition-transform text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>

                                <button onClick={() => handleReplyToMessage(msg)} className="w-full px-3 py-2 text-xs font-medium text-left text-white/80 hover:bg-white/10 hover:text-white rounded-md flex items-center gap-2 transition-colors">
                                  <Reply className="w-3.5 h-3.5" /> Responder
                                </button>

                                {isOwn && (
                                  <>
                                    <button onClick={() => handleEditMessage(msg)} className="w-full px-3 py-2 text-xs font-medium text-left text-white/80 hover:bg-white/10 hover:text-white rounded-md flex items-center gap-2 transition-colors">
                                      <Edit2 className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    <div className="h-[1px] bg-white/10 my-1" />
                                    <button onClick={() => handleDeleteMessage(msg.id)} className="w-full px-3 py-2 text-xs font-medium text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md flex items-center gap-2 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Indicador de "Alguien escribiendo..." */}
          {isSomeoneTyping && (
            <div className="flex items-center gap-2 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 text-white/60">
              <div className="flex gap-1 h-2 items-center">
                <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce"></span>
              </div>
              <span className="text-xs font-medium italic">
                {typingNames.length > 2
                  ? 'Varias personas escribiendo...'
                  : `${typingNames.join(', ')} está escribiendo...`
                }
              </span>
            </div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Banner de Conciencia Digital */}
        {showDigitalConscience && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-primary/20 backdrop-blur-xl border border-primary/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm">
              <div className="w-10 h-10 bg-primary/40 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xl">🌿</span>
              </div>
              <p className="text-xs text-white/90 font-medium leading-tight">
                {currentTip}
              </p>
              <button
                onClick={() => setShowDigitalConscience(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
            <div className="absolute bottom-20 left-2 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-5">
              <div className="grid grid-cols-6 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessage(prev => prev + emoji);
                    }}
                    className="text-2xl hover:bg-white/10 p-2 rounded-lg transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Input Area */}
        <div className="p-3 md:p-4 border-t border-white/10 bg-white/5 backdrop-blur-md z-20">
          {/* Preview de Reply/Edit */}
          {(replyingTo || editingMessageId) && (
            <div className="flex items-center justify-between bg-black/20 border-l-4 border-primary p-2 mb-2 rounded-r-lg animate-in slide-in-from-bottom-2 backdrop-blur-sm">
              <div className="flex flex-col text-sm ml-2">
                <span className="font-bold text-primary text-xs uppercase mb-0.5">
                  {editingMessageId ? 'Editando mensaje' : `Respondiendo a ${getSenderName(replyingTo!)}`}
                </span>
                <span className="text-white/60 line-clamp-1 text-xs italic">
                  {editingMessageId ? message : replyingTo?.text}
                </span>
              </div>
              <button onClick={cancelEditOrReply} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-white/5 p-1.5 rounded-[24px] border border-white/5 focus-within:border-primary/50 focus-within:bg-white/10 transition-all shadow-inner">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 text-white/50 hover:text-primary hover:bg-white/5 rounded-full transition-colors"
            >
              <Smile className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                className={`p-2.5 rounded-full transition-all hidden sm:block ${attachmentMenuOpen ? 'bg-primary/20 text-primary' : 'text-white/50 hover:text-primary hover:bg-white/5'}`}
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {attachmentMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setAttachmentMenuOpen(false)} />
                  <div className="absolute bottom-12 left-0 z-40 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 min-w-[160px] flex flex-col gap-1 animate-in slide-in-from-bottom-5 fade-in zoom-in-95">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Image className="w-4 h-4 text-purple-400" /> Galería
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4 text-pink-400" /> Cámara
                    </button>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Video className="w-4 h-4 text-orange-400" /> Video
                    </button>
                    <button
                      onClick={() => docInputRef.current?.click()}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-400" /> Documento
                    </button>
                    <button
                      onClick={handleShareLocation}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-red-400" /> Ubicación
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Inputs ocultos para archivos */}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
            <input type="file" ref={cameraInputRef} hidden accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, 'image')} />
            <input type="file" ref={videoInputRef} hidden accept="video/*" capture="environment" onChange={(e) => handleFileChange(e, 'video')} />
            <input type="file" ref={docInputRef} hidden onChange={(e) => handleFileChange(e, 'doc')} />

            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm text-white placeholder:text-white/30 max-h-32 focus:outline-none"
              style={{ minHeight: '44px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />

            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse border border-red-500/30">
                <Mic className="w-3 h-3" />
                <span>Grabando: {recordingDuration}s</span>
              </div>
            )}

            {message.trim() || isRecording ? (
              <button
                onClick={isRecording ? handleToggleAudio : handleSend}
                className={`p-2.5 rounded-full transition-all duration-200 mb-0.5 shadow-lg flex-shrink-0 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'} text-primary-foreground hover:scale-105 active:scale-95 shadow-primary/25 animate-in zoom-in`}
              >
                {isRecording ? <Mic className="h-4 w-4 md:h-5 md:w-5 text-white" /> : <Send className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
            ) : (
              <button
                onClick={handleToggleAudio}
                className="p-2.5 text-white/50 hover:text-primary hover:bg-white/5 rounded-full transition-colors"
                title="Nota de Voz"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {
        profileModalUser && (
          <UserProfileModal
            user={profileModalUser}
            onClose={() => setProfileModalUser(null)}
            onShareEvent={handleShareEvent}
            onShareBusiness={handleShareBusiness}
          />
        )
      }
    </>
  );
}
