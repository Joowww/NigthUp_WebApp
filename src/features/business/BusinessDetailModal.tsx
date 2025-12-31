// features/business/BusinessDetailModal.tsx
import { useState, useEffect } from 'react';
import type { IBusiness } from '../../modules/bussiness';
import type { Event } from '../../modules/event';
import { useAuth } from '../../hooks/useAuth';
import { getEvents, joinEvent, leaveEvent } from '../events/eventService';
import { BusinessMap } from './BusinessMap';
import { BusinessEvents } from './BusinessEvents';
import { ImageWithFallback } from '../ImageWithFallback';

import {
    Dialog,
    DialogContent,
    DialogTitle,
  } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Heart,
  Share2,
} from 'lucide-react';

interface BusinessDetailModalProps {
  business: IBusiness | null;
  onClose: () => void;
  hideMapTab?: boolean;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  hideMapTab = false
}) => {
  const { user, updateUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!business) return;
  
    console.log('🏢 Business:', business.name);
    console.log('📋 Business.events:', business.events);
  
    const loadBusinessEvents = async () => {
      setLoading(true);
      try {
        const response = await getEvents(0, 100);
        console.log('📦 Total eventos disponibles:', response.events.length);
        
        // Normalizar los IDs de eventos del negocio
        const normalizedBusinessEventIds = (business.events || []).map(e => 
          typeof e === 'object' && e !== null && '_id' in (e as { _id?: string }) ? (e as { _id: string })._id : e
        );
        
        console.log('🎯 IDs de eventos del negocio normalizados:', normalizedBusinessEventIds);
        
        const businessEvents = response.events.filter(event =>
          normalizedBusinessEventIds.includes(event._id)
        );
        
        console.log('✅ Eventos filtrados:', businessEvents.length, businessEvents);
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
      // Actualizar optimistamente el estado local
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
      
      // Revertir el cambio optimista en caso de error
      const response = await getEvents(0, 100);
      const businessEvents = response.events.filter(event =>
        business.events?.includes(event._id)
      );
      setEvents(businessEvents);
    }
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
                  {events.length} evento{events.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className={`grid w-full ${hideMapTab ? 'grid-cols-2' : 'grid-cols-3'} bg-muted`}>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="events">
              Eventos ({events.length})
            </TabsTrigger>
            {!hideMapTab && (
              <TabsTrigger value="map">Mapa</TabsTrigger>
            )}
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
              <BusinessEvents
                events={events}
                loading={loading}
                onJoinToggle={handleJoinToggle}
                isUserJoined={isUserJoined}
              />
            </TabsContent>

          {/* TAB: MAPA */}
          {!hideMapTab && (
            <TabsContent value="map" className="mt-6">
              <div className="h-[500px] rounded-lg overflow-hidden">
                <BusinessMap
                  businesses={[business]}
                  selectedBusiness={business}
                  isExpanded={false}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};