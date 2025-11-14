import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Send, Smile, Paperclip, Check, CheckCheck } from 'lucide-react';
import type { Chat } from './ChatPage';

interface ChatConversationProps {
  chat: Chat;
  onSendMessage: (chatId: string, text: string) => void;
  onBack: () => void;
  currentUserId: string;
}

export function ChatConversation({ chat, onSendMessage, onBack, currentUserId }: ChatConversationProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(chat.id, message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: typeof chat.messages }[] = [];
    let currentDate = '';
    let currentGroup: typeof chat.messages = [];

    chat.messages.forEach((msg) => {
      const msgDate = msg.timestamp.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = msgDate;
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
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {chat.type === 'user' && chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="truncate">{chat.name}</h3>
          {chat.type === 'user' && (
            <p className="text-xs text-muted-foreground">
              {chat.isOnline ? 'En línea' : 'Desconectado'}
            </p>
          )}
          {chat.type === 'venue' && (
            <p className="text-xs text-muted-foreground">
              Discoteca
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
        {groupMessagesByDate().map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                {group.date}
              </div>
            </div>

            {/* Messages for this date */}
            {group.messages.map((msg, index) => {
              const isOwn = msg.senderId === currentUserId;
              const showAvatar = !isOwn && (
                index === group.messages.length - 1 ||
                group.messages[index + 1]?.senderId !== msg.senderId
              );

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar for received messages */}
                  {!isOwn && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white rounded-br-sm'
                          : 'bg-muted text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    
                    {/* Time and Read Status */}
                    <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                      {isOwn && (
                        msg.read ? (
                          <CheckCheck className="h-3.5 w-3.5 text-[#00d9ff]" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
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
              onChange={(e) => setMessage(e.target.value)}
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
