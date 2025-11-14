import { useState } from 'react';
import { MoreVertical, Pin, Trash2 } from 'lucide-react';
import type { Chat } from '../../modules/chat';

// --- Helper para formatear horas ---
const formatTime = (date: Date | string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onPinChat: (chatId: string) => void;
}

export function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  onPinChat
}: ChatListProps) {

  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // --- Manejo de selección ---
  const toggleSelection = (chatId: string) => {
    const updated = new Set(selectedChats);
    updated.has(chatId) ? updated.delete(chatId) : updated.add(chatId);
    setSelectedChats(updated);
    if (updated.size === 0) setSelectionMode(false);
  };

  const handleLongPress = (chatId: string) => {
    setSelectionMode(true);
    setSelectedChats(new Set([chatId]));
  };

  const sortedChats = [...chats].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col">

        {sortedChats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No hay chats</div>
        ) : (
          sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer transition-colors 
                ${selectedChatId === chat.id ? 'bg-muted' : 'hover:bg-muted/50'}
                ${selectionMode ? 'pl-8' : ''}
              `}
              onClick={() =>
                selectionMode ? toggleSelection(chat.id) : onSelectChat(chat.id)
              }
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(chat.id);
              }}
            >
              {/* Checkbox de selección */}
              {selectionMode && (
                <input
                  type="checkbox"
                  checked={selectedChats.has(chat.id)}
                  onChange={() => toggleSelection(chat.id)}
                  className="mr-3"
                />
              )}

              {/* Avatar */}
              <img
                src={chat.avatar || 'https://via.placeholder.com/150'}
                alt={chat.name}
                className="w-12 h-12 rounded-full mr-4"
              />

              {/* Datos del chat */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage || '...'}
                  </p>

                  {chat.unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Menú de 3 puntos */}
              {!selectionMode && (
                <div className="relative">
                  <MoreVertical
                    className="cursor-pointer ml-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFor(menuOpenFor === chat.id ? null : chat.id);
                    }}
                  />
                  
                  {menuOpenFor === chat.id && (
                    <div className="absolute right-0 top-6 bg-popover border rounded shadow-md p-2 z-10">
                      <button
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded w-full"
                        onClick={() => {
                          onPinChat(chat.id);
                          setMenuOpenFor(null);
                        }}
                      >
                        <Pin size={16} /> Fijar
                      </button>

                      <button
                        className="flex items-center gap-2 p-2 hover:bg-destructive/20 text-destructive rounded w-full"
                        onClick={() => {
                          onDeleteChat(chat.id);
                          setMenuOpenFor(null);
                        }}
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
