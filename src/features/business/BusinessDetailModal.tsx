import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IBusiness } from '../../modules/bussiness';
import type { Event } from '../../modules/event';
import { getEvents, joinEvent, leaveEvent } from '../events/eventService';
import { useAuth } from '../../hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../../ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { MapPin, Phone, Users, Mail, ExternalLink, Heart, Share2 } from 'lucide-react';
import { BusinessEvents } from './BusinessEvents';
import { BusinessMap } from './BusinessMap';
import { ImageWithFallback } from '../ImageWithFallback';

interface BusinessDetailModalProps {
  business: IBusiness | null;
  onClose: () => void;
  hideMapTab?: boolean;
  userLocation?: [number, number];
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  hideMapTab = false,
  userLocation
}) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // 🎊 Efecto de confeti
  useEffect(() => {
    if (!business) return;

    console.log('🎉 CREANDO CONFETI ANIMADO');

    const colors = ['#ff0080', '#00d9ff', '#7928ca', '#50fa7b', '#ffb86c', '#bd93f9'];

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');

        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 300;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const duration = Math.random() * 1000 + 1500;
        const rotation = Math.random() * 720 - 360;

        confetti.style.cssText = `
          position: fixed;
          left: ${startX}px;
          top: -20px;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          z-index: 99999;
          pointer-events: none;
        `;

        document.body.appendChild(confetti);

        confetti.animate([
          {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: 1
          },
          {
            transform: `translateY(${window.innerHeight + 50}px) translateX(${endX - startX}px) rotate(${rotation}deg)`,
            opacity: 0
          }
        ], {
          duration: duration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          fill: 'forwards'
        });

        setTimeout(() => {
          confetti.remove();
        }, duration + 500);
      }, i * 20);
    }
  }, [business]);

  useEffect(() => {
    if (!business) return;

    const loadBusinessEvents = async () => {
      setLoading(true);
      try {
        const response = await getEvents(0, 100);

        const normalizedBusinessEventIds = (business.events || []).map(e =>
          typeof e === 'object' && e !== null && '_id' in (e as { _id?: string }) ? (e as { _id: string })._id : e
        );

        const businessEvents = response.events.filter(event =>
          normalizedBusinessEventIds.includes(event._id)
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

      const response = await getEvents(0, 100);
      const businessEvents = response.events.filter(event =>
        business.events?.includes(event._id)
      );
      setEvents(businessEvents);
    }
  };

  const handleShare = () => {
    if (!business) return;
    navigate(`/chat?shareBusiness=${business._id}&name=${encodeURIComponent(business.name)}`);
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

            <div className="absolute bottom-4 left-4 right-4">
              <DialogTitle className="text-3xl font-bold text-white mb-2">
                {business.name}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${business.active ? 'bg-green-500/90' : 'bg-gray-500/90'
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

          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Grid principal de información */}
            <div className="grid gap-4">
              {business.address && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Dirección</p>
                    <p className="text-foreground">{business.address}</p>
                  </div>
                </div>
              )}

              {business.phone && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">{business.phone}</p>
                  </div>
                </div>
              )}

              {business.email && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">{business.email}</p>
                  </div>
                </div>
              )}

              {business.managers && business.managers.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Managers</p>
                    <p className="text-foreground">
                      {business.managers.length} manager{business.managers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 gap-2">
                <Heart className="h-4 w-4" />
                Guardar
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <ExternalLink className="h-4 w-4" />
                Sitio web
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-6">
            <BusinessEvents
              events={events}
              loading={loading}
              onJoinToggle={handleJoinToggle}
              isUserJoined={isUserJoined}
            />
          </TabsContent>

          {!hideMapTab && (
            <TabsContent value="map" className="mt-6">
              <div className="h-[500px] rounded-lg overflow-hidden">
                <BusinessMap
                  businesses={[business]}
                  selectedBusiness={business}
                  isExpanded={false}
                  userLocation={userLocation}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};