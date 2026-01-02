import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, DollarSign, MapPin } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CreateEventModal } from './CreateEventModal';
import { CreatorEventDetailsModal } from './CreatorEventDetailsModal';
import { useAuth } from '../../hooks/useAuth';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { getEventsByManager, createEvent, updateEvent, disableEvent, reactivateEvent } from '../events/eventService';
import { toast } from 'sonner';
import { ImageWithFallback } from '../ImageWithFallback';

import { useTranslation } from 'react-i18next';

interface CreatorPageProps { }

export function CreatorPage({ }: CreatorPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isHighZoomEnabled } = useUIPreferences();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events on mount
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Assuming user.id is the managerId (or use user._id if that's the field)
      const data = await getEventsByManager(user?.id || user?._id);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(t('manager.error_loading_events', 'Error al cargar los eventos'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (editingEvent) {
        // Update
        const updated = await updateEvent(editingEvent._id || editingEvent.id, eventData); // Handle potential _id vs id difference
        setEvents(events.map(e => (e.id === updated.id || e._id === updated._id) ? updated : e));
        toast.success(t('manager.event_updated_success', 'Evento actualizado correctamente'));
      } else {
        // Create
        // Need to attach manager info if not handled by backend session? 
        // Usually backend handles "createdBy" from token.
        const created = await createEvent(user?.id || user?._id, eventData);
        setEvents([created, ...events]);
        toast.success(t('manager.event_created_success', 'Evento creado correctamente'));
      }
      setShowCreateModal(false);
      setEditingEvent(null);
      fetchEvents(); // Refetch to be safe/sync
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Error al guardar el evento');
    }
  };

  const handleDisableEvent = async () => {
    if (!selectedEvent) return;
    try {
      await disableEvent(selectedEvent.id || selectedEvent._id);
      toast.success(t('manager.event_disabled_success', 'Evento desactivado'));
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error disabling event:', error);
      toast.error(t('manager.error_disabling_event', 'Error al desactivar el evento'));
    }
  };

  const handleReactivateEvent = async () => {
    if (!selectedEvent) return;
    try {
      await reactivateEvent(selectedEvent.id || selectedEvent._id);
      toast.success(t('manager.event_reactivated_success', 'Evento reactivado'));
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error reactivating event:', error);
      toast.error(t('manager.error_reactivating_event', 'Error al reactivar el evento'));
    }
  };

  const handleEditClick = () => {
    setEditingEvent(selectedEvent);
    setSelectedEvent(null);
    setShowCreateModal(true);
  };

  // Calcular estadísticas totales
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || event.participants?.length || 0), 0);
  const totalEarnings = events.reduce((sum, event) => sum + ((event.price || 0) * (event.attendees || event.participants?.length || 0)), 0);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{t('manager.loading_panel', 'Cargando panel...')}</div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 w-full">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent animate-fade-in">
              {t('manager.panel_title', 'Panel de Manager')}
            </h1>
            <p className="text-lg text-muted-foreground/80">
              {t('manager.panel_subtitle', 'Gestiona tus eventos, analiza métricas y haz crecer tu comunidad.')}
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingEvent(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:scale-105 transition-all duration-300 px-6 py-6 text-lg rounded-xl"
          >
            <Plus className="h-6 w-6 mr-2" />
            {t('manager.create_event_btn', 'Crear Evento')}
          </Button>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-[#7928ca]/10 shadow-[0_0_15px_rgba(121,40,202,0.2)]">
                  <Calendar className="h-8 w-8 text-[#7928ca]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('manager.total_events', 'Eventos Totales')}</p>
                  <p className="text-3xl font-bold text-foreground">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-[#00d9ff]/10 shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                  <Users className="h-8 w-8 text-[#00d9ff]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('manager.total_assistants', 'Asistentes Totales')}</p>
                  <p className="text-3xl font-bold text-foreground">{totalAttendees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-[#50fa7b]/10 shadow-[0_0_15px_rgba(80,250,123,0.2)]">
                  <DollarSign className="h-8 w-8 text-[#50fa7b]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('manager.total_earnings', 'Ingresos Totales')}</p>
                  <p className="text-3xl font-bold text-foreground">{totalEarnings}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de eventos */}
        <div>
          <h2 className="mb-4 text-foreground">{t('manager.your_events', 'Tus Eventos')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id || event._id}
                className={`group overflow-hidden border-border bg-card transition-all duration-300 cursor-pointer
                  ${isHighZoomEnabled ? 'hover:scale-110 z-10' : 'hover:scale-[1.02]'} hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(121,40,202,0.3)]
                  ${event.disabled ? 'opacity-70 grayscale' : ''}
                `}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.name || event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {event.disabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <span className="bg-red-500/80 text-white px-4 py-2 rounded-full font-bold border border-red-400">
                        {t('manager.event_disabled_badge_uppercase', 'DESACTIVADO')}
                      </span>
                    </div>
                  )}

                  <Badge className="absolute top-3 left-3 bg-[#ff0080] hover:bg-[#ff0080]/80 border-none shadow-lg">
                    {String(t(`dictionary.${event.category}`, event.category))}
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-[#00d9ff] text-black border-none font-bold shadow-lg">
                    {event.price}€
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="mb-3 text-foreground">{event.name || event.title}</h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#00d9ff]" />
                      <span>{event.venue || t('common.location', 'Ubicación')} {event.city ? `(${event.city})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#7928ca]" />
                        <span>{new Date(event.schedule || event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#ffb86c]" />
                        <span>{event.attendees || event.participants?.length || 0} {t('common.people', 'personas')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="grid grid-cols-1 gap-2 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t('manager.earnings_label', 'Ingresos')}</p>
                      <p className="text-foreground">{(event.price || 0) * (event.attendees || event.participants?.length || 0)}€</p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-[#7928ca] to-[#00d9ff] hover:shadow-lg hover:shadow-[#7928ca]/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  >
                    {t('manager.view_details_btn', 'Ver Detalles')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {events.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#ff0080]/20 to-[#7928ca]/20 border border-[#ff0080]/30 mb-4">
                <Calendar className="w-10 h-10 text-[#ff0080]" />
              </div>
              <h3 className="mb-2 text-foreground">{t('manager.no_events_title', 'No tienes eventos aún')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('manager.no_events_desc', 'Crea tu primer evento y empieza a gestionar tu audiencia')}
              </p>
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  setShowCreateModal(true);
                }}
                className="bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('manager.create_first_event_btn', 'Crear Primer Evento')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          initialData={editingEvent}
        />
      )}

      {selectedEvent && (
        <CreatorEventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditClick}
          onDisable={handleDisableEvent}
          onReactivate={handleReactivateEvent}
        />
      )}
    </div>
  );
}
