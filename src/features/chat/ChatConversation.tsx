// src/features/chat/ChatConversation.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Video,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  Reply,
  X,
  Search,
  ShieldCheck,
  Smile,
  ExternalLink,
  Loader2
} from 'lucide-react';
import api from '../../api';
import type { IConversationFormatted, IMessageFormatted, SocketSendMessageData } from '../../modules/chat';
import { useSocket } from '../../hooks/useSocket';
import { UserProfileModal } from '../friendship/UserProfileModal';
import { useOnlineUsers } from '../../context/OnlineUsersContext';
import { getAvatarUrl } from '../../modules/friendship';
import { censorText } from '../../utils/profanityFilter';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatConversationProps {
  chat: IConversationFormatted & { messages: IMessageFormatted[] };
  onSendMessage: (chatId: string, text: string, replyToId?: string, extraData?: Partial<SocketSendMessageData>) => void;
  onBack: () => void;
  currentUserId: string;
  typingUsers: Set<string>;
}

export function ChatConversation({ chat, onSendMessage, onBack, currentUserId, typingUsers }: ChatConversationProps) {
  const { socket, connected } = useSocket();
  const { isUserOnline } = useOnlineUsers();
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<IMessageFormatted | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [otherUserUsername, setOtherUserUsername] = useState<string | null>(null);
  const [showDigitalConscience, setShowDigitalConscience] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const digitalTips = [
    "Recuerda parpadear y descansar tus ojos cada 20 minutos. 👀",
    "La calidad de la conversación importa más que la velocidad de respuesta. ✨",
    "Un mensaje amable puede cambiar el día de alguien. Sé respetuoso. ❤️",
    "Si te sientes abrumado, está bien tomarte un respiro del mundo digital. 🌿",
    "Tus amigos valoran tu presencia real tanto como la digital. No olvides quedar en persona. 🤝"
  ];
  const [currentTip, setCurrentTip] = useState(digitalTips[0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTip(digitalTips[Math.floor(Math.random() * digitalTips.length)]);
      setShowDigitalConscience(true);
      setTimeout(() => setShowDigitalConscience(false), 8000);
    }, 60000 * 10); // Cada 10 min
    return () => clearTimeout(timer);
  }, []);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const processedMessages = useMemo(() => {
    let msgs = chat.messages || [];
    if (isSearching && searchQuery) {
      msgs = msgs.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return msgs.map(m => ({
      ...m,
      text: censorText(m.text)
    }));
  }, [chat.messages, isSearching, searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, typingUsers, chat.id]);

  const handleTyping = () => {
    if (!socket || !connected) return;
    socket.typing({ conversationId: chat.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.stopTyping({ conversationId: chat.id });
    }, 2000);
  };

  const handleSend = (textOverride?: string) => {
    const textToSend = textOverride || message;
    if (textToSend.trim()) {
      const cleanMessage = censorText(textToSend);
      if (editingMessageId) {
        socket?.editMessage({ messageId: editingMessageId, text: cleanMessage });
        setEditingMessageId(null);
      } else {
        onSendMessage(chat.id, cleanMessage, replyingTo?.id);
      }
      if (!textOverride) setMessage('');
      setReplyingTo(null);
      inputRef.current?.focus();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket?.stopTyping({ conversationId: chat.id });
    }
  };

  const handleSendMeet = () => {
    const meetId = `nightup-${chat.id.substring(0, 8)}-${Math.random().toString(36).substring(2, 5)}`;
    const meetLink = `https://meet.google.com/lookup/${meetId}`;
    const meetMessage = `¡Hola! Únete a mi videollamada de NightUp aquí: ${meetLink}`;

    // Explicitly send as a video call type if supported by backend, 
    // or just as text with the specific link pattern
    onSendMessage(chat.id, meetMessage, undefined, {
      messageType: 'video', // Backend might need to handle this to store videoUrl or similar
      videoUrl: meetLink
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'chat');

      // Detectar tipo de recurso
      let resourceType = 'image';
      if (file.type.startsWith('audio/')) resourceType = 'video'; // Cloudinary trata audio como video sin stream
      if (file.type.startsWith('video/')) resourceType = 'video';
      formData.append('resourceType', resourceType);

      const { data } = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = data.secure_url || data.url || data.file_url;

      if (fileUrl) {
        // Enviar con el metadato correcto
        let type: any = 'image';
        if (file.type.startsWith('audio/')) type = 'audio';
        if (file.type.startsWith('video/')) type = 'video';

        onSendMessage(chat.id, `📎 Archivo: ${file.name}`, replyingTo?.id, {
          messageType: type,
          imageUrl: type === 'image' ? fileUrl : undefined,
          audioUrl: type === 'audio' ? fileUrl : undefined,
          videoUrl: type === 'video' ? fileUrl : undefined,
        });
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

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

  const getSenderId = (msg: IMessageFormatted): string => {
    if (!msg.sender) return 'unknown';
    return typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
  };

  const getSenderName = (msg: IMessageFormatted): string => {
    if (typeof msg.sender === 'object') return msg.sender.username;
    return 'Usuario';
  };

  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const groupsByDate = useMemo(() => {
    const groups: { date: string; messages: IMessageFormatted[] }[] = [];
    let currentDate = '';
    let currentGroup: IMessageFormatted[] = [];

    processedMessages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const dateString = msgDate.toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      if (dateString !== currentDate) {
        if (currentGroup.length > 0) groups.push({ date: currentDate, messages: currentGroup });
        currentDate = dateString;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) groups.push({ date: currentDate, messages: currentGroup });
    return groups;
  }, [processedMessages]);

  const typingNames = Array.from(typingUsers)
    .filter(id => id !== currentUserId)
    .map(id => {
      const p = chat.participants?.find((p: any) => (p._id || p) === id);
      return typeof p === 'object' ? p.username : 'Alguien';
    });

  const isSomeoneTyping = typingNames.length > 0;

  const handleOpenProfile = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!chat.isGroup) {
      // Intentar obtener el username del otro participante
      const otherParticipant = chat.participants?.find((p: any) => {
        const pId = typeof p === 'string' ? p : (p._id || p.id);
        return pId !== currentUserId;
      });

      const username = (chat as any).recipientUsername || (typeof otherParticipant === 'object' ? otherParticipant.username : null);

      if (username) {
        setOtherUserUsername(username);
        setIsProfileModalOpen(true);
      } else {
        console.warn('⚠️ [ChatConversation] No se pudo encontrar el username del destinatario');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-transparent relative">
        <div className="flex items-center gap-3 p-3 md:p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl z-20">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="relative flex-shrink-0 cursor-pointer group" onClick={handleOpenProfile}>
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
            <img
              src={getAvatarUrl(chat)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/10 shadow-lg relative z-10"
              alt={chat.name}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random&color=fff`;
              }}
            />
            <div className={`
              absolute bottom-0.5 right-0.5 w-3 h-3 border-2 border-[#1a1a1a] rounded-full z-20
              ${!chat.isGroup && isUserOnline(
              (chat.participants?.find((p: any) => (p._id || p || p.id) !== currentUserId) as any)?._id ||
              chat.participants?.find((p: any) => p !== currentUserId) as string || ''
            ) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}
            `}></div>
          </div>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleOpenProfile}>
            <h2 className="font-bold text-sm md:text-lg truncate text-white tracking-tight">
              {chat.name || 'Usuario'}
            </h2>
            <div className="text-[11px] md:text-xs text-white/50 truncate flex items-center gap-1.5">
              {isSomeoneTyping ? (
                <span className="text-primary font-bold animate-pulse">{typingNames.join(', ')} escribiendo...</span>
              ) : (
                chat.isGroup ? `${chat.participants?.length || 0} miembros` :
                  isUserOnline(
                    (chat.participants?.find((p: any) => (p._id || p) !== currentUserId) as any)?._id ||
                    chat.participants?.find((p: any) => p !== currentUserId) as string || ''
                  ) ? (
                    <span className="text-green-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      En línea
                    </span>
                  ) : <span className="opacity-60 italic">Desconectado</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setIsSearching(true)} className="p-2.5 hover:bg-white/10 rounded-full transition-all text-white/70">
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSendMeet();
              }}
              className="p-2.5 hover:bg-primary/20 hover:text-primary rounded-full transition-all text-white/70 group relative"
              title="Iniciar Videollamada"
            >
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <Video className="h-5 w-5 relative z-10" />
            </button>
            <button className="p-2.5 hover:bg-white/10 rounded-full transition-all text-white/70">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar bg-black/5">
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-30 mb-4"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en la conversación..."
                  className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-10 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 relative z-10"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 relative z-10" />
                <button
                  onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white relative z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
          {processedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 text-white">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 text-3xl">👋</div>
              <p className="font-bold uppercase tracking-widest text-xs">Di algo para empezar</p>
            </div>
          )}
          {groupsByDate.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest border border-white/5">
                  {group.date}
                </span>
              </div>
              {group.messages.map((msg) => {
                const isOwn = getSenderId(msg) === currentUserId;
                const meetMatch = msg.text.match(/https:\/\/meet\.google\.com\/lookup\/nightup-[\w-]+/);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 items-end gap-2`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMessageMenuOpen(msg.id);
                    }}
                  >
                    {!isOwn && (
                      <div className="flex-shrink-0 mb-1">
                        <img
                          src={getAvatarUrl(msg.sender as any)}
                          className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm"
                          alt={getSenderName(msg)}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getSenderName(msg))}&background=random&color=fff`;
                          }}
                        />
                      </div>
                    )}
                    <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col group relative`}>
                      <div className={`
                        relative px-4 py-2.5 rounded-2xl shadow-lg border backdrop-blur-sm transition-all
                        ${isOwn
                          ? 'bg-gradient-to-br from-primary to-purple-600 border-primary/20 text-white rounded-tr-none'
                          : 'bg-white/10 border-white/10 text-white rounded-tl-none'}
                      `}>
                        {meetMatch ? (
                          <div className="space-y-3 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Video className="w-5 h-5 text-white animate-pulse" />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold">Videollamada</p>
                                <p className="text-[10px] opacity-70">Únete ahora vía Meet</p>
                              </div>
                            </div>
                            <a
                              href={meetMatch[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all border border-white/10 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> ENTRAR A LA VIDEOLLAMADA
                            </a>
                          </div>
                        ) : msg.messageType === 'video' && msg.videoUrl?.includes('meet.google.com') ? (
                          <div className="space-y-3 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                                <Video className="w-6 h-6 text-white animate-pulse" />
                              </div>
                              <div>
                                <p className="text-[15px] font-black tracking-tight">Videollamada</p>
                                <p className="text-[11px] opacity-80 font-medium">Iniciada por {isOwn ? 'ti' : getSenderName(msg)}</p>
                              </div>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                              <p className="text-[10px] text-center opacity-60 mb-2 uppercase tracking-widest font-bold">Google Meet</p>
                              <a
                                href={msg.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-primary hover:bg-primary-foreground rounded-xl text-xs font-black transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-black/20"
                              >
                                <ExternalLink className="w-4 h-4" /> UNIRSE AHORA
                              </a>
                            </div>
                          </div>
                        ) : msg.messageType === 'image' ? (
                          <div className="space-y-2">
                            <img
                              src={msg.imageUrl}
                              alt="Adjunto"
                              className="max-w-full rounded-lg border border-white/10 shadow-sm cursor-pointer"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                            {msg.text && !msg.text.startsWith('📎 Archivo:') && (
                              <p className="text-[14px] md:text-[15px] font-medium">{msg.text}</p>
                            )}
                          </div>
                        ) : msg.messageType === 'audio' ? (
                          <div className="py-1">
                            <audio src={msg.audioUrl} controls className="max-w-full h-8" />
                          </div>
                        ) : (
                          <p className="text-[14px] md:text-[15px] leading-relaxed break-words whitespace-pre-wrap font-medium">
                            {msg.text}
                          </p>
                        )}
                        <div className={`flex items-center justify-end gap-1.5 mt-1.5 opacity-60 text-[10px]`}>
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isOwn && (msg.read ? <CheckCheck className="w-3.5 h-3.5 text-white" /> : <Check className="w-3.5 h-3.5" />)}
                        </div>
                      </div>

                      {messageMenuOpen === msg.id && (
                        <div className="absolute top-0 right-0 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-1 flex animate-in zoom-in-95">
                          <button onClick={() => handleReplyToMessage(msg)} className="p-2 hover:bg-white/10 rounded-lg"><Reply className="w-4 h-4 text-white" /></button>
                          {isOwn && !msg.isDeleted && <button onClick={() => handleEditMessage(msg)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4 text-white" /></button>}
                          {isOwn && !msg.isDeleted && <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>}
                          <button onClick={() => setMessageMenuOpen(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-4 h-4 text-white/40" /></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-black/30 backdrop-blur-2xl border-t border-white/10">
          {replyingTo && (
            <div className="flex items-center justify-between p-2 mb-3 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-bottom-2">
              <div className="flex-1 min-w-0 px-2 border-l-2 border-primary">
                <p className="text-[10px] font-bold text-primary uppercase">Respondiendo a {getSenderName(replyingTo)}</p>
                <p className="text-xs text-white/60 truncate italic">"{replyingTo.text}"</p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1.5 hover:bg-white/10 rounded-full text-white/40"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-2 flex items-end shadow-inner focus-within:border-primary/50 transition-all">
              <button
                type="button"
                onClick={handleFileClick}
                className="p-2 text-white/50 hover:text-white transition-colors"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyPress}
                placeholder="Escribe con conciencia digital..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm md:text-base py-2 px-2 resize-none max-h-32 text-white placeholder:text-white/20 custom-scrollbar"
                rows={1}
              />
              <button type="button" className="p-2 text-white/50 hover:text-white transition-colors"><Smile className="w-5 h-5" /></button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={(!message.trim()) || isUploading}
              className={`p-4 rounded-2xl md:rounded-3xl shadow-xl transition-all ${message.trim() && !isUploading ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-white/5 text-white/10'
                }`}
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="flex items-center gap-2 mt-4 px-2 opacity-50">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] text-white uppercase tracking-widest font-black">Digital Awareness Active • AI Censor ON</span>
          </div>
        </div>
      </div>

      <UserProfileModal
        username={otherUserUsername || ''}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AnimatePresence>
        {showDigitalConscience && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div className="bg-primary/20 backdrop-blur-3xl border border-primary/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4">
              <div className="text-3xl h-14 w-14 bg-primary/30 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">🌿</div>
              <p className="text-xs text-white font-bold leading-relaxed">{currentTip}</p>
              <button onClick={() => setShowDigitalConscience(false)} className="shrink-0 text-white/30 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
