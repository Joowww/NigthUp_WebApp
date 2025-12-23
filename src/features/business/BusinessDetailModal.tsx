// features/business/BusinessDetailModal.tsx
import { useState, useEffect } from 'react';
import type { IBusiness } from '../../modules/bussiness';
import type { Event } from '../../modules/event';
import { useAuth } from '../../hooks/useAuth';
import { getEvents, joinEvent, leaveEvent } from '../events/eventService';
import { BusinessMap } from './BusinessMap';
import { ImageWithFallback } from '../ImageWithFallback';

import {
    Dialog,
    DialogContent,
    DialogTitle,
  } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Clock,
  ExternalLink,
  Heart,
  Share2,
  Loader2
} from 'lucide-react';

interface BusinessDetailModalProps {
  business: IBusiness | null;
  onClose: () => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose
}) => {
  const { user, updateUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!business) return;

    const loadBusinessEvents = async () => {
      setLoading(true);
      try {
        // Obtener todos los eventos y filtrar los de este negocio
        const response = await getEvents(0, 100);
        const businessEvents = response.events.filter(event =>
          business.events?.includes(event._id)
        );
        setEvents(businessEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessEvents();
  }, [business]);

  if (!business) return null;

  const isUserJoined = (eventId: string): boolean => {
    if (!user?.events) return false;
    return user.events.some((e: any) =>
      typeof e === 'string' ? e === eventId : e._id === eventId
    );
  };

  const handleJoinToggle = async (eventId: string) => {
    if (!user) {
      alert('Necesitas iniciar sesión');
      return;
    }

    const isJoined = isUserJoined(eventId);

    try {
      // Actualizar UI optimistamente
      setEvents(current =>
        current.map(ev => {
          if (ev._id === eventId) {
            const currentParticipants = ev.participants || [];
            const newParticipants = isJoined
              ? currentParticipants.filter(id => id !== user._id)
              : [...currentParticipants, user._id];
            return { ...ev, participants: newParticipants };
          }
          return ev;
        })
      );

      if (isJoined) {
        await leaveEvent(eventId, user._id);
        const newUserEvents = (user.events || []).filter((e: any) =>
          (typeof e === 'string' ? e : e._id) !== eventId
        );
        updateUser({ ...user, events: newUserEvents });
      } else {
        await joinEvent(eventId, user._id);
        updateUser({ ...user, events: [...(user.events || []), eventId] });
      }
    } catch (error) {
      console.error('Error en join/leave:', error);
      alert('Hubo un error al procesar tu solicitud.');
    }
  };

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

  return (
    <Dialog open={!!business} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background border-border">
            <div className="relative -m-6 mb-0">
            <div className="relative h-64 w-full overflow-hidden">
                <ImageWithFallback
                src={business.avatar || ''}
                alt={business.name}
                className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute top-4 left-4 flex gap-2 z-20">
                <Button
                    size="icon"
                    variant="ghost"
                    className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                    title="Compartir"
                >
                    <Share2 className="h-5 w-5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                    title="Me gusta"
                >
                    <Heart className="h-5 w-5" />
                </Button>
                </div>

                {/* Info sobre la imagen */}
                <div className="absolute bottom-4 left-4 right-4">
                <DialogTitle className="text-3xl font-bold text-white mb-2">
                    {business.name}
                </DialogTitle>
                <div className="flex items-center gap-3">
                    <Badge
                    className={`${
                        business.active ? 'bg-green-500/90' : 'bg-gray-500/90'
                    } text-white`}
                    >
                    {business.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge className="bg-primary/90 text-white">
                    {events.length} eventos
                    </Badge>
                </div>
                </div>
            </div>
            </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="events">
              Eventos ({events.length})
            </TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>

          {/* TAB: INFORMACIÓN */}
          <TabsContent value="info" className="space-y-6 mt-6">
            <div className="grid gap-4">
              {business.address && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Dirección</p>
                    <p className="text-muted-foreground">{business.address}</p>
                  </div>
                </div>
              )}

              {business.phone && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <Phone className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Teléfono</p>
                    <a
                      href={`tel:${business.phone}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {business.email && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <Mail className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a
                      href={`mailto:${business.email}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
              )}

              {business.location && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <ExternalLink className="h-5 w-5 text-chart-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Coordenadas</p>
                    <p className="text-muted-foreground">
                      {business.location.coordinates[1].toFixed(4)},{' '}
                      {business.location.coordinates[0].toFixed(4)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: EVENTOS */}
          <TabsContent value="events" className="space-y-4 mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-4">
                {events.map(event => {
                  const isJoined = isUserJoined(event._id);

                  return (
                    <Card
                      key={event._id}
                      className="overflow-hidden border-2 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Imagen del evento */}
                        <div className="relative h-48 md:h-auto md:w-48 overflow-hidden">
                          <ImageWithFallback
                            src={
                              'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-3 left-3 bg-primary/90">
                            {event.category || 'General'}
                          </Badge>
                        </div>

                        {/* Contenido */}
                        <CardContent className="flex-1 p-5 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {event.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          </div>

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
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="outline">
                                  {event.price > 0 ? `${event.price}€` : 'Gratis'}
                                </Badge>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleJoinToggle(event._id)}
                            className={`w-full ${
                              isJoined
                                ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                                : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02]'
                            } transition-all duration-300`}
                          >
                            {isJoined ? '✓ Ya estás apuntado' : 'Apuntarme al evento'}
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay eventos programados en este local
                </p>
              </div>
            )}
          </TabsContent>

          {/* TAB: MAPA */}
          <TabsContent value="map" className="mt-6">
            <div className="h-[500px] rounded-lg overflow-hidden">
              <BusinessMap
                businesses={[business]}
                selectedBusiness={business}
                isExpanded={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};