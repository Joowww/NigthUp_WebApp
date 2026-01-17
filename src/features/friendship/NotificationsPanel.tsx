// src/features/friendship/NotificationsPanel.tsx (NUEVO ARCHIVO)
import { Bell, Check, CheckCheck, Trash2, X, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { useNotifications } from '../../hooks/useNotifications';
import { getAvatarUrl, getFullName } from '../../modules/friendship';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = async (notificationId: string, read: boolean) => {
    if (!read) {
      await markAsRead(notificationId);
    }
  };

  const handleGoToFriendship = () => {
    navigate('/friendship');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-20 right-4 w-96 max-h-[600px] bg-background border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({unreadCount} nuevas)
                </span>
              )}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="gap-2 text-xs"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No tienes notificaciones nuevas
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => {
                const isUnread = !notification.read;
                const fullName = notification.sender.firstName || notification.sender.lastName
                  ? `${notification.sender.firstName || ''} ${notification.sender.lastName || ''}`.trim()
                  : notification.sender.username;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification._id, notification.read)}
                    className={`
                      p-4 cursor-pointer transition-all
                      ${isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}
                    `}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12 border-2 border-border">
                          <AvatarImage 
                            src={getAvatarUrl(notification.sender)} 
                            alt={notification.sender.username} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                            {notification.sender.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Icon tipo notificación */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                          {notification.type === 'friend_request' ? (
                            <UserPlus className="w-3 h-3 text-primary" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {fullName}
                          </p>
                          {isUnread && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.type === 'friend_request' 
                            ? 'Te envió una solicitud de amistad'
                            : 'Aceptó tu solicitud de amistad'
                          }
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </span>

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                                title="Marcar como leída"
                              >
                                <Check className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border/50 bg-muted/20">
            <Button
              onClick={handleGoToFriendship}
              variant="ghost"
              className="w-full text-sm"
            >
              Ver todas las solicitudes de amistad
            </Button>
          </div>
        )}
      </div>
    </>
  );
}