import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { getEvents, joinEvent, leaveEvent } from './eventService';
import type { Event } from '../../modules/event';

import { ImageWithFallback } from '../ImageWithFallback';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Heart, MapPin, Calendar, Users, Clock, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cities } from '../../assets/dataCA';
import { EventDetailsModal } from './EventDetailsModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export function EventsPage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { isHighZoomEnabled } = useUIPreferences();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros locales 
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Paginación local
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Traducir categorías si es necesario, o mantenerlas como claves
  const categories = [
    t('dictionary.Todos', 'Todos'),
    ...['Trap', 'Reagge', 'Edgy', 'Tecno', 'Reaggeton', 'House', 'Loofy', 'Funk', 'Pop', 'Indie', 'Rock', 'Metal', 'Trendy', 'Pop con ñ', 'España 2000']
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Pedimos 100 eventos de golpe para tener data suficiente para filtrar
        // Si tuvieras miles, aquí usaríamos paginación, pero para empezar así es más rápido y fluido.
        const response = await getEvents(0, 100);

        // Verificación de seguridad por si el backend devuelve estructura distinta
        const eventsList = response.events || [];
        setEvents(eventsList);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  const filteredEvents = events.filter((event) => {
    // A. Filtro por Categoría
    const matchCategory =
      selectedCategory === 'Todos' ||
      (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchSearch =
      searchTerm === '' ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCity =
      selectedCity === 'Todas' ||
      (event.city && event.city === selectedCity);

    return matchCategory && matchSearch && matchCity;
  });

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedCity]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const isUserJoined = (eventId: string): boolean => {
    if (!user || !user.events) return false;
    return user.events.some((e: any) =>
      (typeof e === 'string' ? e === eventId : e._id === eventId)
    );
  };

  const handleJoinToggle = async (eventId: string) => {
    if (!user) {
      alert(t('home.login_required_join', "Necesitas iniciar sesión"));
      return;
    }

    const isJoined = isUserJoined(eventId);

    const prevEvents = [...events];
    const prevUserEvents = user.events ? [...user.events] : [];

    try {
      setEvents(current => current.map(ev => {
        if (ev._id === eventId) {
          const currentParticipants = ev.participants || [];
          const newParticipants = isJoined
            ? currentParticipants.filter(id => id !== user._id)
            : [...currentParticipants, user._id];
          return { ...ev, participants: newParticipants };
        }
        return ev;
      }));

      if (isJoined) {
        const newUserEvents = prevUserEvents.filter((e: any) => (typeof e === 'string' ? e : e._id) !== eventId);
        updateUser({ ...user, events: newUserEvents });
        await leaveEvent(eventId, user._id);
      } else {
        const newUserEvents = [...prevUserEvents, eventId];
        updateUser({ ...user, events: newUserEvents });
        await joinEvent(eventId, user._id);
      }

    } catch (error) {
      console.error("Error en join/leave:", error);
      setEvents(prevEvents);
      updateUser({ ...user, events: prevUserEvents });
      alert(t('home.error_joining', "Hubo un error al procesar tu solicitud."));
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen w-full bg-background p-6 lg:p-8">
      <div className="w-full space-y-8">

        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent inline-block">
            {t('events_page.title', 'Eventos Disponibles')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('events_page.subtitle', 'Encuentra tu próxima fiesta')}
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder={t('events_page.search_placeholder', "Buscar por nombre (ej: Concierto, Techno...)")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-xl border-none bg-[#1a1a1a] pl-12 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#ff0080]"
          />
        </div>

        {/* FILTROS (Ciudad y Categoría) */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Buscador de Ciudades */}
          <div className="w-full md:w-64">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-10 bg-[#1a1a1a] border-none text-white">
                <SelectValue placeholder="Selecciona ciudad" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="Todas">{t('dictionary.Todos', 'Todas las ciudades')}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TABS DE CATEGORÍAS */}
          <div className="flex flex-wrap gap-2 flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 border border-transparent
                   ${selectedCategory === cat
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRID DE RESULTADOS */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#ff0080]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.length > 0 ? (
              visibleEvents.map((event) => {
                const isJoined = isUserJoined(event._id);

                return (
                  <Card
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    className={`group relative overflow-hidden rounded-2xl border-0 bg-[#0f0f0f] shadow-lg transition-all 
                      hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#ff0080]/30 
                      ${isHighZoomEnabled ? 'hover:scale-110 z-10' : 'hover:scale-105'} 
                      cursor-pointer`}
                  >
                    {/* IMAGEN */}
                    <div className="relative h-48 w-full overflow-hidden">
                      <ImageWithFallback
                        src={event.image || ''}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <Badge className="absolute left-3 top-3 bg-[#ff0080] text-white border-none">
                        {event.category || 'General'}
                      </Badge>

                      <Badge className="absolute right-12 top-3 bg-[#00d9ff] text-black border-none font-bold">
                        {event.price > 0 ? `${event.price}€` : 'Gratis'}
                      </Badge>

                      {/* Icono Favorito (Visual) */}
                      <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>

                    {/* CONTENIDO TEXTO */}
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white line-clamp-1">{event.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4 text-[#00d9ff]" />
                          <span className="truncate">
                            {event.city || (event.location ? t('home.view_location', 'Ver Ubicación') : t('home.location_unavailable', 'Ubicación secreta'))}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#7928ca]" />
                          <span>{formatDate(event.schedule)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#50fa7b]" />
                          <span>{formatTime(event.schedule)}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <Users className="h-4 w-4 text-[#ffb86c]" />
                          <span>{event.participants ? event.participants.length : 0} {t('events_page.assistants', 'asistirán')}</span>
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar abrir el modal al hacer click en el botón
                          handleJoinToggle(event._id);
                        }}
                        className={`w-full h-11 font-semibold transition-all duration-300 ${isJoined
                          ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                          : 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,128,0.4)]'
                          }`}
                      >
                        {isJoined ? t('home.leave_btn', 'Ya estás apuntado') : t('home.join_btn', 'Apuntarme')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // EMPTY STATE (Cuando no hay resultados)
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-[#1a1a1a] p-4 mb-4">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white">{t('events_page.no_results', 'No encontramos eventos')}</h3>
                <p className="text-gray-400 max-w-sm mt-2">
                  {t('events_page.no_results_desc', { search: searchTerm, category: selectedCategory })}
                </p>
                <Button
                  variant="link"
                  onClick={() => { setSelectedCategory('Todos'); setSearchTerm(''); }}
                  className="mt-4 text-[#ff0080]"
                >
                  {t('events_page.clear_filters', 'Limpiar filtros')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* PAGINACIÓN CLÁSICA */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Mostrar solo algunas páginas si hay demasiadas
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-gray-500">...</span>;
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`h-10 w-10 min-w-0 p-0 font-medium ${currentPage === page
                        ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white border-none'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                        }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 h-10 w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              {t('common.showing_range', {
                start: startIndex + 1,
                end: Math.min(startIndex + ITEMS_PER_PAGE, filteredEvents.length),
                total: filteredEvents.length
              })}
            </p>
          </div>
        )}
      </div>
      {/* Modal de Detalle */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onJoinToggle={handleJoinToggle}
          isJoined={isUserJoined(selectedEvent._id)}
        />
      )}
    </div>
  );
}