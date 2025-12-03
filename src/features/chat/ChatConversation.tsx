import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Send, 
  Smile, 
  Paperclip, 
  Check, 
  CheckCheck,
  Edit2,
  Trash2,
  Reply,
  X
} from 'lucide-react';
import type { IConversationFormatted, IMessageFormatted } from '../../modules/chat';
import { useSocket } from '../../hooks/useSocket';
import type { User } from '../../modules/user';

interface ChatConversationProps {
  chat: IConversationFormatted & { messages: IMessageFormatted[] };
  onSendMessage: (chatId: string, text: string, replyToId?: string) => void;
  onBack: () => void;
  currentUserId: string;
  typingUsers: Set<string>;
}

export function ChatConversation({ chat, onSendMessage, onBack, currentUserId, typingUsers }: ChatConversationProps) {
  const socket = useSocket();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<IMessageFormatted | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  
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
    if (!socket || !socket.isConnected()) return;

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

  const formatMessageTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Agrupación por Fechas ---
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: IMessageFormatted[] }[] = [];
    let currentDate = '';
    let currentGroup: IMessageFormatted[] = [];

    chat.messages.forEach((msg) => {
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
  };

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
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-md z-10 shadow-sm">
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative flex-shrink-0 cursor-pointer">
          <img
            src={getChatAvatar()}
            alt={chat.name}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-border"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`;
            }}
          />
        </div>

        <div className="flex-1 min-w-0 cursor-pointer">
          <h3 className="truncate font-semibold text-sm md:text-base">{chat.name}</h3>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            {chat.isGroup 
              ? `${chat.participants?.length || 0} miembros` 
              : 'Activo'
            }
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-background to-muted/20">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No hay mensajes aún</p>
            <p className="text-xs text-muted-foreground mt-1">¡Saluda y rompe el hielo!</p>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Separador de Fecha */}
              <div className="flex items-center justify-center mb-6">
                <span className="px-3 py-1 bg-muted/80 backdrop-blur rounded-full text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide shadow-sm">
                  {group.date}
                </span>
              </div>

              {/* Mensajes del día */}
              <div className="space-y-1">
                {group.messages.map((msg, index) => {
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
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar ? (
                            <img
                              src={getSenderAvatar(msg)}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover"
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
                      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        
                        {/* Nombre en grupo */}
                        {!isOwn && chat.isGroup && showAvatar && (
                          <span className="text-[10px] text-muted-foreground px-1 mb-0.5 ml-1">
                            {getSenderName(msg)}
                          </span>
                        )}

                        {/* Preview de Respuesta */}
                        {msg.replyTo && typeof msg.replyTo === 'object' && (
                          <div 
                            className={`
                              text-xs p-2 mb-1 rounded-lg border-l-2 bg-background/50 backdrop-brightness-95 w-full cursor-pointer
                              ${isOwn ? 'border-primary-foreground/50 text-primary-foreground/90' : 'border-primary text-muted-foreground'}
                            `}
                          >
                            <span className="font-bold block mb-0.5">Respondiendo...</span>
                            <span className="line-clamp-1 italic">
                              {msg.replyTo.text}
                            </span>
                          </div>
                        )}

                        {/* Contenido */}
                        <div
                          className={`
                            relative px-4 py-2 text-sm md:text-[15px] shadow-sm
                            ${msg.isDeleted 
                              ? 'bg-muted border border-border text-muted-foreground italic rounded-xl' 
                              : isOwn
                                ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                                : 'bg-card border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm'
                            }
                          `}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!msg.isDeleted) setMessageMenuOpen(msg.id);
                          }}
                        >
                          <p className="break-words whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          
                          {/* Metadata del mensaje */}
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.isEdited && !msg.isDeleted && <span className="text-[10px] italic">editado</span>}
                            <span className="text-[10px]">{formatMessageTime(msg.createdAt)}</span>
                            {isOwn && !msg.isDeleted && (
                              msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                            )}
                          </div>

                          {/* Botón flotante de menú */}
                          {!msg.isDeleted && (
                            <button
                              onClick={() => setMessageMenuOpen(messageMenuOpen === msg.id ? null : msg.id)}
                              className={`
                                absolute top-0 p-1 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity
                                ${isOwn ? '-left-8' : '-right-8'}
                              `}
                            >
                              <MoreVertical className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>

                        {/* Reacciones */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex gap-0.5 mt-1 -mb-2 z-10 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                            {msg.reactions.map((reaction, idx) => (
                              <span key={idx} className="text-xs bg-background border border-border px-1.5 py-0.5 rounded-full shadow-sm animate-in zoom-in">
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
                              absolute z-30 mt-1 p-1 bg-popover border border-border rounded-xl shadow-xl min-w-[160px] animate-in zoom-in-95
                              ${isOwn ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
                            `}>
                              {/* Barra de Reacciones Rápida */}
                              <div className="flex justify-between p-2 mb-1 bg-muted/50 rounded-lg">
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
                              
                              <button onClick={() => handleReplyToMessage(msg)} className="w-full px-3 py-2 text-xs font-medium text-left hover:bg-muted rounded-md flex items-center gap-2">
                                <Reply className="w-3.5 h-3.5" /> Responder
                              </button>
                              
                              {isOwn && (
                                <>
                                  <button onClick={() => handleEditMessage(msg)} className="w-full px-3 py-2 text-xs font-medium text-left hover:bg-muted rounded-md flex items-center gap-2">
                                    <Edit2 className="w-3.5 h-3.5" /> Editar
                                  </button>
                                  <div className="h-[1px] bg-border my-1" />
                                  <button onClick={() => handleDeleteMessage(msg.id)} className="w-full px-3 py-2 text-xs font-medium text-left hover:bg-red-500/10 text-red-500 rounded-md flex items-center gap-2">
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
          <div className="flex items-center gap-2 px-2 animate-pulse text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
            </div>
            <span className="text-xs font-medium">
              {typingNames.length > 2 
                ? 'Varias personas escribiendo...' 
                : `${typingNames.join(', ')} está escribiendo...`
              }
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
          <div className="absolute bottom-20 left-2 z-50 bg-popover border border-border rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-5">
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                  }}
                  className="text-2xl hover:bg-muted p-2 rounded-lg transition-transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-background border-t border-border z-20">
        {/* Preview de Reply/Edit */}
        {(replyingTo || editingMessageId) && (
          <div className="flex items-center justify-between bg-muted/50 border-l-4 border-primary p-2 mb-2 rounded-r-lg animate-in slide-in-from-bottom-2">
            <div className="flex flex-col text-sm ml-2">
              <span className="font-bold text-primary text-xs uppercase mb-0.5">
                {editingMessageId ? 'Editando mensaje' : `Respondiendo a ${getSenderName(replyingTo!)}`}
              </span>
              <span className="text-muted-foreground line-clamp-1 text-xs">
                {editingMessageId ? message : replyingTo?.text}
              </span>
            </div>
            <button onClick={cancelEditOrReply} className="p-1 hover:bg-background rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-muted/30 p-1.5 rounded-[24px] border border-transparent focus-within:border-primary/30 focus-within:bg-muted/50 transition-all shadow-sm">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>
          
          <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-colors hidden sm:block">
            <Paperclip className="h-5 w-5" />
          </button>

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
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm max-h-32"
            style={{ minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`
              p-2.5 rounded-full transition-all duration-200 mb-0.5 shadow-sm flex-shrink-0
              ${message.trim() 
                ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95' 
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'}
            `}
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}