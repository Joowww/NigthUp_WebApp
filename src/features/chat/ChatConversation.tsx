import { useState, useRef, useEffect } from 'react';
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
import React from 'react';


interface ChatConversationProps {
  chat: IConversationFormatted & { messages: IMessageFormatted[] };
  onSendMessage: (chatId: string, text: string, replyToId?: string) => void;
  onBack: () => void;
  currentUserId: string;
  typingUsers: Set<string>; // ⬅️ Añadir esto
}

export function ChatConversation({ chat, onSendMessage, onBack, currentUserId }: ChatConversationProps) {
  const socket = useSocket();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<IMessageFormatted | null>(null);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  // Manejar typing indicators
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.typing({ conversationId: chat.id });
    }

    
  };

  const handleSend = () => {
    if (message.trim()) {
      if (editingMessageId) {
        // Editar mensaje
        socket.editMessage({ messageId: editingMessageId, text: message });
        setEditingMessageId(null);
      } else {
        // Enviar nuevo mensaje
        onSendMessage(chat.id, message, replyingTo?.id);
      }
      
      setMessage('');
      setReplyingTo(null);
      inputRef.current?.focus();
      
      if (isTyping) {
        setIsTyping(false);
        socket.stopTyping({ conversationId: chat.id });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditMessage = (msg: IMessageFormatted) => {
    setEditingMessageId(msg.id);
    setMessage(msg.text);
    setMessageMenuOpen(null);
    inputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId: string) => {
    socket.deleteMessage({ messageId });
    setMessageMenuOpen(null);
  };

  const handleReplyToMessage = (msg: IMessageFormatted) => {
    setReplyingTo(msg);
    setMessageMenuOpen(null);
    inputRef.current?.focus();
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    socket.reactToMessage({ messageId, emoji });
    setMessageMenuOpen(null);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setMessage('');
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const formatMessageTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: IMessageFormatted[] }[] = [];
    let currentDate = '';
    let currentGroup: IMessageFormatted[] = [];

    chat.messages.forEach((msg) => {
      const msgDate = typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt;
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

  const emojis = ['😊', '😂', '❤️', '🎉', '🔥', '👍', '🎵', '🍾', '💃', '🕺', '✨', '🌟'];
  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  const getSenderName = (msg: IMessageFormatted): string => {
    if (typeof msg.sender === 'string') return 'Usuario';
    return msg.sender.username || 'Usuario';
  };

  const getSenderId = (msg: IMessageFormatted): string => {
    if (typeof msg.sender === 'string') return msg.sender;
    return msg.sender._id;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <button
          onClick={onBack}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative flex-shrink-0">
          <img
            src={chat.avatar || 'https://via.placeholder.com/150'}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {!chat.isGroup && chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="truncate font-medium">{chat.name}</h3>
          {!chat.isGroup && (
            <p className="text-xs text-muted-foreground">
              {chat.isOnline ? 'En línea' : 'Desconectado'}
            </p>
          )}
          {chat.isGroup && (
            <p className="text-xs text-muted-foreground">
              Grupo
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Video className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No hay mensajes aún</p>
          </div>
        ) : (
          groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {group.date}
                </div>
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg, index) => {
                const senderId = getSenderId(msg);
                const isOwn = senderId === currentUserId;
                const showAvatar = !isOwn && chat.isGroup && (
                  index === group.messages.length - 1 ||
                  getSenderId(group.messages[index + 1]) !== senderId
                );

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar for received messages in groups */}
                    {!isOwn && chat.isGroup && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar && (
                          <img
                            src={typeof msg.sender !== 'string' && 'avatar' in msg.sender && typeof msg.sender.avatar === 'string' ? msg.sender.avatar : 'https://via.placeholder.com/150'}
                            alt={getSenderName(msg)}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {/* Sender name in groups */}
                      {!isOwn && chat.isGroup && (
                        <span className="text-xs text-muted-foreground px-2 mb-1">
                          {getSenderName(msg)}
                        </span>
                      )}

                      {/* Reply preview */}
                      {msg.replyTo && (
                        <div className={`px-3 py-1 mb-1 rounded-lg border-l-4 ${
                          isOwn ? 'border-white/50 bg-white/10' : 'border-[#ff0080] bg-muted/50'
                        }`}>
                          <p className="text-xs text-muted-foreground">
                            {typeof msg.replyTo === 'string' ? 'Mensaje' : msg.replyTo.text}
                          </p>
                        </div>
                      )}

                      <div
                        className={`relative px-4 py-2 rounded-2xl ${
                          msg.isDeleted
                            ? 'bg-muted/50 italic text-muted-foreground'
                            : isOwn
                            ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white rounded-br-sm'
                            : 'bg-muted text-white rounded-bl-sm'
                        }`}
                        onClick={() => !msg.isDeleted && setMessageMenuOpen(messageMenuOpen === msg.id ? null : msg.id)}
                      >
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                        
                        {/* Edited indicator */}
                        {msg.isEdited && !msg.isDeleted && (
                          <span className="text-xs opacity-70 ml-2">(editado)</span>
                        )}
                      </div>

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {msg.reactions.map((reaction, idx) => (
                            <span key={idx} className="text-sm bg-muted px-2 py-0.5 rounded-full">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Time and Read Status */}
                      <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isOwn && !msg.isDeleted && (
                          msg.read ? (
                            <CheckCheck className="h-3.5 w-3.5 text-[#00d9ff]" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-muted-foreground" />
                          )
                        )}
                      </div>

                      {/* Message Menu */}
                      {messageMenuOpen === msg.id && !msg.isDeleted && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMessageMenuOpen(null)}
                          />
                          <div className={`absolute z-20 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden ${
                            isOwn ? 'right-0' : 'left-0'
                          }`}>
                            {/* Reactions */}
                            <div className="flex gap-2 p-2 border-b border-border">
                              {reactionEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactToMessage(msg.id, emoji)}
                                  className="text-lg hover:bg-muted rounded p-1 transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            
                            {/* Actions */}
                            <button
                              onClick={() => handleReplyToMessage(msg)}
                              className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                            >
                              <Reply className="h-4 w-4" />
                              Responder
                            </button>
                            
                            {isOwn && (
                              <>
                                <button
                                  onClick={() => handleEditMessage(msg)}
                                  className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="w-full px-4 py-2 text-left hover:bg-red-500/20 text-red-500 transition-colors flex items-center gap-2 text-sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-20 left-4 right-4 lg:left-auto lg:right-auto lg:bottom-24 lg:ml-4 z-20 bg-card border border-border rounded-lg shadow-lg p-3">
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessage(message + emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                  className="text-2xl hover:bg-muted rounded-lg p-2 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        {/* Reply/Edit preview */}
        {(replyingTo || editingMessageId) && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {editingMessageId ? <Edit2 className="h-4 w-4 text-[#ff0080]" /> : <Reply className="h-4 w-4 text-[#ff0080]" />}
              <div>
                <p className="text-xs text-muted-foreground">
                  {editingMessageId ? 'Editando mensaje' : `Respondiendo a ${replyingTo && getSenderName(replyingTo)}`}
                </p>
                <p className="text-sm truncate max-w-[200px]">
                  {editingMessageId ? message : replyingTo?.text}
                </p>
              </div>
            </div>
            <button
              onClick={editingMessageId ? cancelEdit : cancelReply}
              className="p-1 hover:bg-muted-foreground/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-muted rounded-lg transition-colors mb-1"
          >
            <Smile className="h-5 w-5 text-muted-foreground" />
          </button>

          <button className="p-2 hover:bg-muted rounded-lg transition-colors mb-1">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ff0080]/50 focus:border-[#ff0080] transition-all resize-none max-h-32"
              style={{
                minHeight: '44px',
                height: 'auto',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-2.5 rounded-full transition-all mb-1 ${
              message.trim()
                ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white hover:shadow-lg hover:shadow-[#ff0080]/50'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}