import { useState } from 'react';
import { MoreVertical, Pin, Trash2, Check } from 'lucide-react';
import type { Chat } from './ChatPage';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onPinChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat, onDeleteChat, onPinChat }: ChatListProps) {
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

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

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Selection Mode Header */}
      {selectionMode && (
        <div className="sticky top-0 z-10 p-4 bg-card border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectionMode(false);
                setSelectedChats(new Set());
              }}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <span className="text-sm text-muted-foreground">
              {selectedChats.size} seleccionado{selectedChats.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePinSelected}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Fijar"
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteSelected}
              className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chats */}
      <div className="divide-y divide-border">
        {chats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No hay conversaciones
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = selectedChats.has(chat.id);
            const isActive = selectedChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={`relative flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                  isActive ? 'bg-muted' : ''
                } ${isSelected ? 'bg-[#ff0080]/10' : ''}`}
                onClick={() => {
                  if (selectionMode) {
                    toggleSelection(chat.id);
                  } else {
                    onSelectChat(chat.id);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleLongPress(chat.id);
                }}
              >
                {/* Selection Checkbox */}
                {selectionMode && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#ff0080] border-[#ff0080]'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                )}

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.type === 'user' && chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                  )}
                  {chat.type === 'venue' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#ff0080] to-[#7928ca] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {chat.isPinned && (
                        <Pin className="h-3.5 w-3.5 text-[#ff0080] fill-[#ff0080]" />
                      )}
                      <h3 className={`truncate ${chat.unreadCount > 0 ? '' : ''}`}>
                        {chat.name}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'text-white' : 'text-muted-foreground'
                    }`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-[#ff0080] text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu Button */}
                {!selectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFor(menuOpenFor === chat.id ? null : chat.id);
                    }}
                    className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}

                {/* Dropdown Menu */}
                {menuOpenFor === chat.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpenFor(null)}
                    />
                    <div className="absolute right-4 top-16 z-20 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinChat(chat.id);
                          setMenuOpenFor(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 text-sm"
                      >
                        <Pin className="h-4 w-4" />
                        {chat.isPinned ? 'Desfijar' : 'Fijar'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                          setMenuOpenFor(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-500/20 text-red-500 transition-colors flex items-center gap-3 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
