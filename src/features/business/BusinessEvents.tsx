import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../modules/event';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ImageWithFallback } from '../ImageWithFallback';
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Share2,
  Loader2
} from 'lucide-react';

interface BusinessEventsProps {
  events: Event[];
  loading: boolean;
  onJoinToggle?: (eventId: string) => void;
  isUserJoined?: (eventId: string) => boolean;
}

export const BusinessEvents: React.FC<BusinessEventsProps> = ({
  events,
  loading,
  onJoinToggle,
  isUserJoined
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 3;

  // Reset page when events change
  useEffect(() => {
    setCurrentPage(0);
  }, [events]);

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const paginatedEvents = events.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No hay eventos programados en este local
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de eventos */}
      <div className="grid gap-4">
        {paginatedEvents.map(event => {
          const isJoined = isUserJoined?.(event._id) || false;

          return (
            <Card
              key={event._id}
              className="overflow-hidden border-2 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagen del evento */}
                <div className="relative h-48 md:h-auto md:w-48 overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=400&q=80"
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Icono de evento flotante */}
                  <div className="absolute top-3 left-3">
                    <div className="p-2 rounded-full bg-primary/90 backdrop-blur-sm">
                      <PartyPopper className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-primary/90">
                    {event.category || 'General'}
                  </Badge>
                </div>

                {/* Contenido */}
                <CardContent className="flex-1 p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <PartyPopper className="h-5 w-5 text-primary" />
                      {event.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Información del evento */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span>{formatDate(event.schedule)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>{formatTime(event.schedule)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-chart-5" />
                      <span>
                        {event.participants?.length || 0} asistirán
                      </span>
                    </div>
                    {event.price !== undefined && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {event.price > 0 ? `${event.price}€` : 'Gratis'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="flex gap-2">
                    {onJoinToggle && (
                      <Button
                        onClick={() => onJoinToggle(event._id)}
                        className={`flex-1 ${isJoined
                            ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                            : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02]'
                          } transition-all duration-300`}
                      >
                        {isJoined ? '✓ Ya estás apuntado' : 'Apuntarme al evento'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-white/10 hover:bg-white/10"
                      onClick={() => navigate(`/chat?shareEvent=${event._id}&name=${encodeURIComponent(event.name)}`)}
                      title="Compartir evento"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages} ({events.length} eventos en total)
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
              className="gap-2"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};