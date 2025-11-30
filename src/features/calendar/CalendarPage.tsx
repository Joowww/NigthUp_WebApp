import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getEvents, joinEvent, leaveEvent } from '../events/eventService';
import type { Event } from '../../modules/event';
import { useNavigate } from 'react-router-dom';

// Componentes UI
import { Calendar } from '../../ui/calendar';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { MapPin, Clock, Users, Calendar as CalendarIcon, ArrowRight, Loader2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function CalendarPage() {
  // --- 1. ESTADOS ---
  const { user, updateUser } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [allEvents, setAllEvents] = useState<Event[]>([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- 2. CARGAR DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getEvents(0, 100);
        setAllEvents(response.events || []);
      } catch (error) {
        console.error("Error cargando calendario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 3. LÓGICA DE FILTRADO (La magia) ---
  
  const isUserJoined = (eventId: string) => {
    if (!user || !user.events) return false;
    return user.events.some((e: any) => (typeof e === 'string' ? e === eventId : e._id === eventId));
  };

  const eventsOnSelectedDate = allEvents.filter(event => 
    date && isSameDay(new Date(event.schedule), date)
  );

  const myEvents = eventsOnSelectedDate.filter(event => isUserJoined(event._id));
  const suggestedEvents = eventsOnSelectedDate.filter(event => !isUserJoined(event._id));

  // --- 4. ACCIONES (Unirse / Ir al evento) ---
  const handleJoinToggle = async (event: Event) => {
    if (!user) return alert("Inicia sesión");
    
    const isJoined = isUserJoined(event._id);
    const prevUserEvents = [...(user.events || [])];

    if (isJoined) {
       const newEvents = prevUserEvents.filter((e: any) => (typeof e === 'string' ? e : e._id) !== event._id);
       updateUser({ ...user, events: newEvents });
       await leaveEvent(event._id, user._id);
    } else {
       const newEvents = [...prevUserEvents, event._id];
       updateUser({ ...user, events: newEvents });
       await joinEvent(event._id, user._id);
    }
  };

  const handleGoToEvent = (eventId: string) => {
    console.log("Navegar al evento:", eventId);
    alert("Próximamente: Ir a la página del evento " + eventId);
  };


  const daysWithEvents = allEvents.map(e => new Date(e.schedule));

  return (
    <div className="min-h-screen w-full bg-background px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        <h1 className="mb-8 text-3xl font-bold text-white">
          Tu Calendario <span className="text-[#ff0080]">Nocturno</span>
        </h1>

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* --- COLUMNA IZQUIERDA: EL CALENDARIO --- */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Card className="border-0 bg-[#1a1a1a] shadow-xl shadow-black/40">
              <CardContent className="p-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={es} // Calendario en español
                  className="rounded-md border-none text-white"
                  // Resaltar días con eventos
                  modifiers={{ hasEvent: daysWithEvents }}
                  modifiersStyles={{
                    hasEvent: { 
                      fontWeight: 'bold', 
                      textDecoration: 'underline',
                      textDecorationColor: '#ff0080',
                      textUnderlineOffset: '4px'
                    }
                  }}
                  classNames={{
                    day_selected: "bg-[#ff0080] text-white hover:bg-[#ff0080]/80 focus:bg-[#ff0080]",
                    day_today: "bg-white/10 text-white",
                  }}
                />
              </CardContent>
            </Card>

            {/* Resumen rápido */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-[#00d9ff]" />
                <div>
                  <p className="text-sm text-gray-400">Fecha seleccionada</p>
                  <p className="font-semibold text-white capitalize">
                    {date ? format(date, 'EEEE, d MMMM', { locale: es }) : 'Selecciona un día'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: LOS EVENTOS --- */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff0080]" />
              </div>
            ) : (
              <>
                {/* SECCIÓN 1: EVENTOS A LOS QUE VAS (JOINED) */}
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-[#00d9ff] shadow-[0_0_10px_#00d9ff]"></span>
                    Tus Planes
                  </h2>
                  
                  {myEvents.length > 0 ? (
                    <div className="grid gap-4">
                      {myEvents.map(event => (
                        <Card key={event._id} className="border-0 bg-[#1a1a1a] border-l-4 border-l-[#00d9ff]">
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <h3 className="font-bold text-white">{event.name}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> 
                                  {format(new Date(event.schedule), 'HH:mm')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> 
                                  {/* Placeholder para location name */}
                                  Club
                                </span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleGoToEvent(event._id)}
                              variant="outline"
                              className="border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff] hover:text-black"
                            >
                              Ir al evento <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No tienes planes confirmados para este día.</p>
                  )}
                </div>

                {/* SECCIÓN 2: SUGERENCIAS (FYP Futuro) */}
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-[#ff0080] shadow-[0_0_10px_#ff0080]"></span>
                    Sugerencias para ti
                  </h2>

                  {suggestedEvents.length > 0 ? (
                    <div className="grid gap-4">
                      {suggestedEvents.map(event => (
                        <Card key={event._id} className="group overflow-hidden border-0 bg-[#0f0f0f] transition-all hover:bg-[#151515]">
                          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                            
                            {/* Info Evento */}
                            <div className="flex items-center gap-4">
                              {/* Fecha cajita */}
                              <div className="flex flex-col items-center justify-center rounded-lg bg-[#2a2a2a] p-3 min-w-[60px]">
                                <span className="text-xs font-bold text-[#ff0080]">
                                  {format(new Date(event.schedule), 'MMM').toUpperCase()}
                                </span>
                                <span className="text-xl font-bold text-white">
                                  {format(new Date(event.schedule), 'd')}
                                </span>
                              </div>
                              
                              <div>
                                <h3 className="font-bold text-white group-hover:text-[#ff0080] transition-colors">
                                  {event.name}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                                  <Badge variant="secondary" className="bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]">
                                    {event.category || 'Evento'}
                                  </Badge>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(event.schedule), 'HH:mm')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.participants?.length || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Botón Unirse */}
                            <Button 
                              onClick={() => handleJoinToggle(event)}
                              className="w-full sm:w-auto bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white hover:opacity-90 transition-opacity"
                            >
                              Unirse
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
                      <p className="text-gray-500">No hay otros eventos disponibles para este día.</p>
                      <Button 
                        variant="link" 
                        onClick={() => setDate(undefined)} // Limpiar filtro fecha
                        className="mt-2 text-[#ff0080]"
                      >
                        Ver todos los eventos
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}