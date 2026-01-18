import { useState } from 'react';
import { MoreVertical, Pin, Trash2, Check, Users } from 'lucide-react';
import type { IConversationFormatted } from '../../modules/chat';

interface ChatListProps {
  chats: IConversationFormatted[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onPinChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat, onDeleteChat, onPinChat }: ChatListProps) {
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // --- Lógica de Selección Múltiple ---
  const toggleSelection = (chatId: string) => {
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);

    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleLongPress = (chatId: string) => {
    setSelectionMode(true);
    setSelectedChats(new Set([chatId]));
  };

  const handleDeleteSelected = () => {
    selectedChats.forEach(chatId => onDeleteChat(chatId));
    setSelectedChats(new Set());
    setSelectionMode(false);
  };

  const handlePinSelected = () => {
    selectedChats.forEach(chatId => onPinChat(chatId));
    setSelectedChats(new Set());
    setSelectionMode(false);
  };

  // --- Formateo de Hora ---
  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    // Si la fecha no es válida
    if (isNaN(messageDate.getTime())) return '';

    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return messageDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    if (days === 1) return 'Ayer';
    if (days < 7) return messageDate.toLocaleDateString('es-ES', { weekday: 'long' });
    return messageDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // --- Obtener nombre del chat ---
  const getChatName = (chat: IConversationFormatted): string => {
    return chat.name || 'Sin nombre';
  };

  // --- Obtener avatar del chat ---
  const getChatAvatar = (chat: IConversationFormatted): string => {
    if (chat.avatar) return chat.avatar;

    // Avatar por defecto basado en el nombre
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getChatName(chat))}&background=random`;
  };

  // --- Ordenamiento (Fijados primero, luego por fecha) ---
  const sortedChats = [...chats].sort((a, b) => {
    // 1. Prioridad a los fijados
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // 2. Por fecha del último mensaje
    const timeA = a.lastMessageTime
      ? (typeof a.lastMessageTime === 'string' ? new Date(a.lastMessageTime).getTime() : a.lastMessageTime.getTime())
      : 0;
    const timeB = b.lastMessageTime
      ? (typeof b.lastMessageTime === 'string' ? new Date(b.lastMessageTime).getTime() : b.lastMessageTime.getTime())
      : 0;

    return timeB - timeA;
  });

  return (
    <div className="flex flex-col w-full h-full">

      {/* Cabecera de Modo Selección */}
      {selectionMode && (
        <div className="sticky top-0 z-20 p-3 bg-white/10 backdrop-blur-md border-b border-white/5 flex items-center justify-between animate-in slide-in-from-top-2 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectionMode(false);
                setSelectedChats(new Set());
              }}
              className="text-sm text-primary font-medium hover:underline shadow-sm"
            >
              Cancelar
            </button>
            <span className="text-sm font-semibold text-white">
              {selectedChats.size} seleccionado{selectedChats.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePinSelected}
              className="p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
              title="Fijar seleccionados"
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteSelected}
              className="p-2 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
              title="Eliminar seleccionados"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lista de Chats */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-white/40" />
            </div>
            <p className="text-sm text-white/60">No tienes conversaciones activas</p>
            <p className="text-xs text-white/40 mt-1">Busca usuarios para empezar a chatear</p>
          </div>
        ) : (
          <div className="space-y-1 mx-2">
            {sortedChats.map((chat) => {
              const isSelected = selectedChats.has(chat.id);
              const isActive = selectedChatId === chat.id;
              const chatName = getChatName(chat);
              const chatAvatar = getChatAvatar(chat);

              return (
                <div
                  key={chat.id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleLongPress(chat.id);
                  }}
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelection(chat.id);
                    } else {
                      onSelectChat(chat.id);
                    }
                  }}
                  className={`
                    group relative flex items-center gap-3 p-3 cursor-pointer transition-all rounded-xl border border-transparent
                    ${isActive ? 'bg-white/10 border-white/5 shadow-sm' : 'hover:bg-white/5 hover:border-white/5'}
                    ${isSelected ? 'bg-primary/20 border-primary/30' : ''}
                  `}
                >
                  {/* Checkbox en modo selección */}
                  {selectionMode && (
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                      ${isSelected ? 'bg-primary border-primary' : 'border-white/40'}
                    `}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {chat.isGroup ? (
                      // Avatar de grupo
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      // Avatar de usuario individual
                      <div className="relative">
                        <img
                          src={chatAvatar}
                          alt={chatName}
                          className="w-12 h-12 rounded-full object-cover bg-muted/20 ring-2 ring-transparent group-hover:ring-white/20 transition-all"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=random`;
                          }}
                        />
                        {/* Indicador Online (Simulado por ahora, o podrías usar chat.participants si tuvieramos status) */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Info del Chat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {chat.isPinned && (
                          <Pin className="h-3 w-3 text-primary fill-primary flex-shrink-0" />
                        )}
                        <h3 className={`
                          font-semibold text-sm truncate
                          ${(chat.unreadCount && chat.unreadCount > 0) ? 'text-white' : 'text-white/90'}
                        `}>
                          {chatName}
                        </h3>
                      </div>
                      <span className={`
                        text-[10px] whitespace-nowrap ml-2 flex-shrink-0
                        ${(chat.unreadCount && chat.unreadCount > 0) ? 'text-primary font-bold' : 'text-white/40'}
                      `}>
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`
                        text-xs truncate flex-1
                        ${(chat.unreadCount && chat.unreadCount > 0) ? 'text-white/90 font-medium' : 'text-white/50 group-hover:text-white/70'}
                      `}>
                        {chat.lastMessage || 'Empieza una conversación'}
                      </p>

                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <div className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-primary/20">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menú de opciones */}
                  {!selectionMode && (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor(menuOpenFor === chat.id ? null : chat.id);
                        }}
                        className={`
                          p-1.5 rounded-full transition-all
                          ${menuOpenFor === chat.id
                            ? 'bg-white/10 text-white'
                            : 'text-white/40 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown del menú */}
                      {menuOpenFor === chat.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setMenuOpenFor(null)}
                          />
                          <div className="absolute right-0 top-8 z-40 w-44 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPinChat(chat.id);
                                setMenuOpenFor(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-white/10 text-sm flex items-center gap-3 transition-colors text-white/80 hover:text-white"
                            >
                              <Pin className="h-4 w-4" />
                              {chat.isPinned ? 'Desfijar chat' : 'Fijar chat'}
                            </button>
                            <div className="h-px bg-white/10 mx-2"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                                setMenuOpenFor(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm flex items-center gap-3 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar chat
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}