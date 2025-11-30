import { useState, useEffect } from 'react';
import { ChatList } from './ChatList';
import { ChatConversation } from './ChatConversation';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import axios from 'axios';
import type { 
  IConversationFormatted, 
  IMessageFormatted,
  SocketNewMessageEvent,
  SocketMessageEditedEvent 
} from '../../modules/chat';

export function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [chats, setChats] = useState<IConversationFormatted[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, IMessageFormatted[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});

  // Función helper para transformar mensaje del socket al formato del frontend
  const transformSocketMessage = (socketMessage: SocketNewMessageEvent | SocketMessageEditedEvent): IMessageFormatted => {
    return {
      id: socketMessage._id,
      sender: typeof socketMessage.sender === 'string' 
        ? socketMessage.sender 
        : { ...socketMessage.sender },
      text: socketMessage.isDeleted ? 'Mensaje eliminado' : socketMessage.text,
      createdAt: socketMessage.createdAt,
      isEdited: socketMessage.isEdited,
      isDeleted: socketMessage.isDeleted,
      replyTo: typeof socketMessage.replyTo === 'string' 
        ? { text: 'Mensaje referenciado', sender: socketMessage.replyTo } 
        : socketMessage.replyTo,
      reactions: socketMessage.reactions,
      read: socketMessage.readBy.length > 1
    };
  };

  // Cargar conversaciones
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/chat', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (user?.token) {
      fetchConversations();
    }
  }, [user?.token]);

  // Configurar listeners de socket
  useEffect(() => {
    if (!socket.isConnected()) return;

    // Nuevo mensaje
    socket.onNewMessage((message) => {
      const conversationId = message.conversation;
      const formattedMessage = transformSocketMessage(message);

      // Actualizar mensajes si estamos viendo esa conversación
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), formattedMessage],
      }));

      // Actualizar última actividad en la lista de chats
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                lastMessage: message.text,
                lastMessageTime: message.createdAt,
                unreadCount: selectedChat === conversationId ? 0 : (chat.unreadCount || 0) + 1,
              }
            : chat
        )
      );
    });

    // Mensaje editado
    socket.onMessageEdited((editedMessage) => {
      const conversationId = editedMessage.conversation;
      const formattedMessage = transformSocketMessage(editedMessage);

      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((msg) =>
          msg.id === editedMessage._id ? formattedMessage : msg
        ),
      }));
    });

    // Mensaje eliminado
    socket.onMessageDeleted(({ messageId, conversationId }) => {
      if (conversationId) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((msg) =>
            msg.id === messageId ? { ...msg, text: 'Mensaje eliminado', isDeleted: true } : msg
          ),
        }));
      }
    });

    // Reacción a mensaje
    socket.onMessageReacted(({ messageId, reactions }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((convId) => {
          updated[convId] = updated[convId].map((msg) =>
            msg.id === messageId ? { ...msg, reactions } : msg
          );
        });
        return updated;
      });
    });

    // Nuevo grupo
    socket.onNewGroup((group) => {
      setChats((prev) => [
        {
          id: group.groupId,
          isGroup: true,
          name: group.groupName,
          avatar: group.groupAvatar || '',
          lastMessage: '',
          lastMessageTime: group.createdAt,
          unreadCount: 0,
        },
        ...prev,
      ]);
    });

    // Usuario escribiendo
    socket.onUserTyping(({ userId }) => {
      if (selectedChat) {
        setTypingUsers((prev) => ({
          ...prev,
          [selectedChat]: new Set([...(prev[selectedChat] || []), userId]),
        }));
      }
    });

    // Usuario dejó de escribir
    socket.onUserStoppedTyping(({ userId }) => {
      if (selectedChat) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev[selectedChat] || []);
          newSet.delete(userId);
          return { ...prev, [selectedChat]: newSet };
        });
      }
    });

    // Mensaje bloqueado por moderación
    socket.onMessageBlocked((data) => {
      alert(`Mensaje bloqueado: ${data.reason}`);
    });

    // Error
    socket.onError((error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.offAll();
    };
  }, [socket, selectedChat]);

  // Cargar mensajes al seleccionar un chat
  useEffect(() => {
    if (!selectedChat || messages[selectedChat]) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${selectedChat}/messages`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setMessages((prev) => ({ ...prev, [selectedChat]: response.data }));
        socket.joinRoom(selectedChat);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      if (selectedChat) {
        socket.leaveRoom(selectedChat);
      }
    };
  }, [selectedChat, user?.token, socket]);

  const handleSendMessage = (chatId: string, text: string) => {
    socket.sendMessage({ conversationId: chatId, text });
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const handlePinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const currentChat = chats.find((chat) => chat.id === selectedChat);
  const currentMessages = selectedChat ? messages[selectedChat] || [] : [];

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background">
      <ChatList
        chats={chats}
        selectedChatId={selectedChat}
        onSelectChat={setSelectedChat}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
      />
      {selectedChat && currentChat && (
        <ChatConversation
          chat={{ ...currentChat, messages: currentMessages }}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedChat(null)}
          currentUserId={user?.id || ''}
          typingUsers={typingUsers[selectedChat] || new Set()} // ⬅️ Añadir esto
        />
      )}
    </div>
  );
}