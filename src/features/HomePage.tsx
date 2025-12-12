// features/HomePage.tsx
import { useEffect, useState } from 'react';
import {
  getEvents,
  joinEvent,
  leaveEvent,
  type EventsResponse
} from './events/eventService';
import type { Event } from '../modules/event';
import { useAuth } from '../hooks/useAuth';

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Loader,
  TrendingUp,
  Phone,
  Mail,
  Heart
} from 'lucide-react';

import { ImageWithFallback } from './ImageWithFallback';
import { EventMap } from '../ui/eventMap';

import { getBusinesses } from './business/bussinessService';
import type { IBusiness } from '../modules/bussiness';

import { Input } from '../ui/input';
import Loadder from './../ui/loading';
import { ScrollArea } from '../ui/scroll-area';

/* -------------------------------------------------------
   TARJETA DE LOCALES / DISCOTECAS
--------------------------------------------------------- */
interface BusinessCardProps {
  business: IBusiness;
  onClick?: () => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onClick }) => {
  const [lng, lat] = business.location.coordinates;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={business.avatar || ''}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge
            className={`${
              business.active ? 'bg-green-500/90' : 'bg-gray-500/90'
            } text-white backdrop-blur-sm`}
          >
            {business.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
            {business.name}
          </h3>
          {business.address && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {business.address}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">
              {business.address ||
                `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`}
            </span>
          </div>

          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary flex-shrink-0" />
              <span className="truncate">{business.phone}</span>
            </div>
          )}

          {business.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="truncate">{business.email}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-chart-5 flex-shrink-0" />
            <span>{business.events?.length || 0} eventos</span>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 text-white font-semibold transition-all duration-200"
          disabled={!business.active}
        >
          Ver eventos
        </Button>
      </CardContent>
    </Card>
  );
};

/* -------------------------------------------------------
   HOME PAGE
--------------------------------------------------------- */

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

  /* -------------------------------
     BUSQUEDA DE LOCALES
  -------------------------------- */
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessLoading, setBusinessLoading] = useState(false);

  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(
    null
  );
  const [businessEvents, setBusinessEvents] = useState<Event[]>([]);

  const fetchBusinesses = async (query = '') => {
    setBusinessLoading(true);
    try {
      const data = await getBusinesses(0, 10, query);
      setBusinesses(data.businesses);
    } catch (err) {
      console.error(err);
      setBusinesses([]);
    } finally {
      setBusinessLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm.length > 0) fetchBusinesses(searchTerm);
      else setBusinesses([]);
    }, 300);

    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSelectBusiness = (b: IBusiness) => {
    setSelectedBusiness(b);
    setBusinessEvents((b.events || []).map(eventId => ({ _id: eventId } as Event)));
  };

  const handleBackToEvents = () => {
    setSelectedBusiness(null);
    setBusinessEvents([]);
  };

  /* -------------------------------
     VERIFICAR SI EL USUARIO ESTÁ UNIDO
  -------------------------------- */
  const isUserJoined = (eventId: string): boolean => {
    if (!user || !user._id) return false;
    if (!user.events || !Array.isArray(user.events)) return false;

    return user.events.some((event: any) => {
      return typeof event === 'string'
        ? event === eventId
        : event._id === eventId;
    });
  };

  /* -------------------------------
     CARGAR EVENTOS GLOBALES
  -------------------------------- */
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data: EventsResponse = await getEvents(0, 10);
        setEvents(data.events);
        setPagination(data.pagination);
      } catch (err) {
        setError('Error cargando eventos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [user]);

  const loadMoreEvents = async () => {
    if (!pagination.hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const data = await getEvents(pagination.skip + pagination.limit, 10);
      setEvents(prev => [...prev, ...data.events]);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* -------------------------------
     JOIN / LEAVE EVENT
  -------------------------------- */
  const handleJoinEvent = async (eventId: string) => {
    if (!user?._id) return alert('Debes iniciar sesión');

    try {
      await joinEvent(eventId, user._id);

      setEvents(prev =>
        prev.map(ev =>
          ev._id === eventId
            ? { ...ev, participants: [...(ev.participants || []), user._id] }
            : ev
        )
      );

      if (updateUser)
        updateUser({
          ...user,
          events: [...(user.events || []), eventId]
        });
    } catch (err) {
      console.error(err);
      alert('Error al unirse');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!user?._id) return;

    try {
      await leaveEvent(eventId, user._id);

      setEvents(prev =>
        prev.map(ev =>
          ev._id === eventId
            ? {
                ...ev,
                participants: (ev.participants || []).filter(id => id !== user._id)
              }
            : ev
        )
      );

      if (updateUser)
        updateUser({
          ...user,
          events: (user.events || []).filter((e: string | { _id: string }) =>
        typeof e === 'string' ? e !== eventId : e._id !== eventId
          )
        });
    } catch (err) {
      console.error(err);
      alert('Error al salir');
    }
  };

  /* -------------------------------
     HELPERS
  -------------------------------- */
  const getReadableLocation = (event: Event): string => {
    if (!event.location?.coordinates) return 'Ubicación no disponible';
    const [lng, lat] = event.location.coordinates;
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  };

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });

  const formatTime = (d: Date) =>
    new Date(d).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

  /* -------------------------------
     RENDER
  -------------------------------- */

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <ScrollArea className="h-full w-full custom-scrollbar">
        <div className="space-y-8 px-6 py-6">

          {/* ---------------------------------------
              MAPA GLOBAL ARRIBA
          ----------------------------------------- */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Mapa de Eventos
            </h2>
            <EventMap 
              events={events} 
              businesses={businesses} 
              onBoundsChange={(bounds) => console.log('Bounds changed:', bounds)} 
            />
          </section>

          {/* ---------------------------------------
              BUSCADOR DE LOCALES
          ----------------------------------------- */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Buscar Locales
            </h2>

            <Input
              type="text"
              placeholder="Buscar discotecas o locales..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-card border-border text-white placeholder:text-muted-foreground"
            />

            {businessLoading && (
              <div className="flex justify-center py-4">
                <Loader className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}

            {searchTerm.length > 0 && !businessLoading && businesses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {businesses.map(b => (
                  <BusinessCard
                    key={b._id}
                    business={b}
                    onClick={() => handleSelectBusiness(b)}
                  />
                ))}
              </div>
            )}

            {searchTerm.length > 0 &&
              !businessLoading &&
              businesses.length === 0 && (
                <p className="text-muted-foreground mt-4">
                  No se encontraron locales con "{searchTerm}".
                </p>
              )}
          </section>

          {/* ---------------------------------------
              EVENTOS DEL LOCAL SELECCIONADO
          ----------------------------------------- */}
          {selectedBusiness && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Eventos en {selectedBusiness.name}
                </h2>
                <Button onClick={handleBackToEvents}>Volver</Button>
              </div>

              <EventMap 
                events={businessEvents} 
                businesses={businesses} 
                onBoundsChange={(bounds) => console.log('Bounds changed:', bounds)} 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {businessEvents.map(event => {
                  const joined = isUserJoined(event._id);

                  return (
                    <Card
                      key={event._id}
                      className="group overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={event.imageUrl || ''}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 right-3 bg-primary/90 text-white">
                          {event.category || 'General'}
                        </Badge>
                      </div>

                      <CardContent className="p-5 space-y-4">
                        <h3 className="text-xl font-bold text-white">
                          {event.name}
                        </h3>

                        <p className="text-sm text-muted-foreground">
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

                        <Button
                          className={`w-full ${
                            joined
                              ? 'bg-gray-600'
                              : 'bg-gradient-to-r from-primary to-secondary'
                          } text-white`}
                          onClick={() =>
                            joined
                              ? handleLeaveEvent(event._id)
                              : handleJoinEvent(event._id)
                          }
                        >
                          {joined ? 'Salirse' : 'Unirse'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* ---------------------------------------
              EVENTOS GLOBALES (si NO hay local seleccionado)
          ----------------------------------------- */}
          {!selectedBusiness && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-white">
                    Eventos Recomendados
                  </h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  Mostrando {events.length} de {pagination.total} eventos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                  const joined = isUserJoined(event._id);

                  return (
                    <Card
                      key={event._id}
                      className="group overflow-hidden border-2 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={event.imageUrl || ''}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 right-3 bg-primary/90 text-white">
                          {event.category}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/30 text-white"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>

                      <CardContent className="p-5 space-y-4">
                        <h3 className="text-xl font-bold text-white">
                          {event.name}
                        </h3>

                        <p className="text-sm text-muted-foreground">
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

                        <Button
                          className={`w-full ${
                            joined
                              ? 'bg-gray-600'
                              : 'bg-gradient-to-r from-primary to-secondary'
                          } text-white`}
                          onClick={() =>
                            joined
                              ? handleLeaveEvent(event._id)
                              : handleJoinEvent(event._id)
                          }
                        >
                          {joined ? 'Salirse' : 'Unirse'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {pagination.hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMoreEvents}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8"
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
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
