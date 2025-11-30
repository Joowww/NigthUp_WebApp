// features/HomePage.tsx
import { useEffect, useState } from 'react';
import { getEvents, joinEvent, leaveEvent, type EventsResponse } from './events/eventService';
import type { Event } from '../modules/event';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heart, MapPin, Calendar, Users, Clock, TrendingUp, Loader } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { EventMap } from '../ui/eventMap';

import Loadder from './../ui/loading';
import { ScrollArea } from '../ui/scroll-area';

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    total: 0,
    hasMore: false
  });
  const { user, updateUser } = useAuth();
  const Loader2 = Loadder;

  // Mejorar la verificación de usuario unido
  const isUserJoined = (eventId: string): boolean => {
    if (!user || !user._id) return false;
    if (!user.events || !Array.isArray(user.events)) return false;
    
    return user.events.some((event: any) => {
      // Manejar tanto string como objeto
      if (typeof event === 'string') {
        return event === eventId;
      }
      // Si es un objeto, verificar el _id
      return event._id === eventId;
    });
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data: EventsResponse = await getEvents(0, 10);
        setEvents(data.events);
        setPagination(data.pagination);
      } catch (err) {
        setError('Error cargando eventos');
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [user]);

  // Cargar más eventos
  const loadMoreEvents = async () => {
    if (!pagination.hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextSkip = pagination.skip + pagination.limit;
      const data: EventsResponse = await getEvents(nextSkip, pagination.limit);
      
      setEvents(prevEvents => [...prevEvents, ...data.events]);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error loading more events:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Función para unirse a un evento - MEJORADA
  const handleJoinEvent = async (eventId: string) => {
    if (!user || !user._id) {
      console.log('Usuario no autenticado');
      return;
    }
    
    try {
      console.log('Uniéndose al evento:', eventId, 'Usuario:', user._id);
      await joinEvent(eventId, user._id);
      
      // Actualizar el usuario localmente
      const updatedUser = {
        ...user,
        events: [...(user.events || []), eventId]
      };
      
      updateUser(updatedUser);
      
      // Actualizar el estado de los eventos
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { 
                ...event, 
                participants: [...(event.participants || []), user._id] 
              }
            : event
        )
      );
      
      console.log('Evento unido exitosamente');
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Error al unirse al evento. Por favor, intenta nuevamente.');
    }
  };

  // Función para salirse de un evento - MEJORADA
  const handleLeaveEvent = async (eventId: string) => {
    if (!user || !user._id) return;
    
    try {
      console.log('Saliéndose del evento:', eventId, 'Usuario:', user._id);
      await leaveEvent(eventId, user._id);
      
      // Actualizar el usuario localmente
      const updatedUser = {
        ...user,
        events: (user.events || []).filter((event: any) => {
          if (typeof event === 'string') {
            return event !== eventId;
          }
          return event._id !== eventId;
        })
      };
      
      updateUser(updatedUser);
      
      // Actualizar el estado de los eventos
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { 
                ...event, 
                participants: (event.participants || []).filter(id => id !== user._id) 
              }
            : event
        )
      );
      
      console.log('Evento abandonado exitosamente');
    } catch (error) {
      console.error('Error leaving event:', error);
      alert('Error al salirse del evento. Por favor, intenta nuevamente.');
    }
  };

  // Función para obtener ubicación legible
  const getReadableLocation = (event: Event): string => {
    if (!event.location || !event.location.coordinates) {
      return 'Ubicación no disponible';
    }
    
    const [lng, lat] = event.location.coordinates;
    return `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}`;
  };

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Función para formatear la hora
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      {/* ScrollArea con scrollbar personalizado */}
      <ScrollArea className="h-full w-full custom-scrollbar">
        <div className="space-y-8 px-6 py-6">

          {/* --- MAPA EN LA PARTE SUPERIOR --- */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Eventos en el Mapa</h2>
            <EventMap events={events} />
          </section>

          {/* --- EVENTOS RECOMENDADOS --- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Eventos Recomendados</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                Mostrando {events.length} de {pagination.total} eventos
              </div>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => {
                const isJoined = isUserJoined(event._id);
               
                return (
                  <Card 
                    key={event._id} 
                    className="bg-card border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/20 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <ImageWithFallback
                        src={`https://images.unsplash.com/photo-1541532713592-79a0317b6b77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBwYXJ0eXxlbnwxfHx8fDE3NjAwNzg2Nzl8MA&ixlib=rb-4.1.0&q=80&w=400`}
                        alt={event.name}
                        className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white">
                        {event.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                   
                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-lg font-semibold text-white truncate">{event.name}</h3>
                     
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                     
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{getReadableLocation(event)}</span>
                        </div>
                       
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-secondary" />
                            <span>{formatDate(event.schedule)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span>{formatTime(event.schedule)}</span>
                          </div>
                        </div>
                       
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-chart-5" />
                          <span>{event.participants?.length || 0} apuntados</span>
                        </div>
                      </div>

                      {/* Botón mejorado con mejor feedback */}
                      <Button
                        className={`w-full transition-all duration-200 ${
                          isJoined
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
                        } text-white font-semibold`}
                        onClick={() => {
                          if (!user) {
                            alert('Por favor, inicia sesión para unirte a eventos');
                            return;
                          }
                          isJoined
                            ? handleLeaveEvent(event._id)
                            : handleJoinEvent(event._id);
                        }}
                      >
                        {!user ? 'Inicia sesión' : isJoined ? 'Salirse' : 'Unirse'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Botón para cargar más eventos */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreEvents}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más eventos'
                  )}
                </Button>
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}