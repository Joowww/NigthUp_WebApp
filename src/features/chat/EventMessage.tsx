import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink, Loader2 } from 'lucide-react';
import type { IEventData } from '../../modules/chat';
import type { Event } from '../../modules/event';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface EventMessageProps {
    eventData: IEventData;
    isOwn: boolean;
}

export function EventMessage({ eventData, isOwn }: EventMessageProps) {
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(eventData.eventDetails || null);
    const [loading, setLoading] = useState(!eventData.eventDetails);

    useEffect(() => {
        if (!event && eventData.eventId) {
            setLoading(true);
            api.get(`/event/${eventData.eventId}`)
                .then(res => {
                    setEvent(res.data);
                })
                .catch(err => console.error('Error fetching event for message:', err))
                .finally(() => setLoading(false));
        }
    }, [eventData.eventId, event]);

    if (loading) {
        return (
            <div className={`
        p-4 w-64 rounded-xl border flex items-center justify-center gap-3
        ${isOwn ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}
      `}>
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                <p className="text-xs text-white/60 italic">Cargando evento...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className={`
        p-4 w-64 rounded-xl border
        ${isOwn ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}
      `}>
                <p className="text-sm text-white/60 italic">Evento no disponible</p>
            </div>
        );
    }

    const eventDate = new Date(event.schedule);
    const isUpcoming = eventDate > new Date();

    return (
        <div
            onClick={() => navigate(`/events/${event._id}`)}
            className={`
        w-full max-w-[320px] overflow-hidden rounded-2xl shadow-lg border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]
        ${isOwn
                    ? 'bg-gradient-to-br from-primary/90 to-primary border-primary/30'
                    : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                }
      `}
        >
            {/* Imagen del evento */}
            {event.image && (
                <div className="relative h-44 overflow-hidden">
                    <img
                        src={event.image}
                        alt={event.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    {/* Badge de estado */}
                    <div className="absolute top-3 right-3">
                        <span className={`
              px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md
              ${isUpcoming
                                ? 'bg-green-500/90 text-white'
                                : 'bg-gray-500/90 text-white'
                            }
            `}>
                            {isUpcoming ? 'Próximamente' : 'Finalizado'}
                        </span>
                    </div>
                </div>
            )}

            {/* Contenido */}
            <div className="p-4">
                {/* Título */}
                <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${isOwn ? 'text-primary-foreground' : 'text-white'}`}>
                    {event.name}
                </h3>

                {/* Descripción */}
                {event.description && (
                    <p className={`text-sm mb-3 line-clamp-2 ${isOwn ? 'text-primary-foreground/70' : 'text-white/60'}`}>
                        {event.description}
                    </p>
                )}

                {/* Info Grid */}
                <div className="space-y-2 mb-3">
                    {/* Fecha */}
                    <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 flex-shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-purple-400'}`} />
                        <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground/90' : 'text-white/80'}`}>
                            {eventDate.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </span>
                    </div>

                    {/* Hora */}
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 flex-shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-blue-400'}`} />
                        <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground/90' : 'text-white/80'}`}>
                            {eventDate.toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>

                    {/* Ubicación */}
                    {event.city && (
                        <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 flex-shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-red-400'}`} />
                            <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground/90' : 'text-white/80'}`}>
                                {event.city}
                            </span>
                        </div>
                    )}

                    {/* Participantes */}
                    {event.participants && (
                        <div className="flex items-center gap-2">
                            <Users className={`w-4 h-4 flex-shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-green-400'}`} />
                            <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground/90' : 'text-white/80'}`}>
                                {event.participants.length} {event.participants.length === 1 ? 'asistente' : 'asistentes'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Precio */}
                {event.price !== undefined && (
                    <div className={`
            flex items-center justify-between p-2 rounded-lg mb-3
            ${isOwn ? 'bg-primary-foreground/10' : 'bg-white/5'}
          `}>
                        <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground/70' : 'text-white/60'}`}>
                            Precio
                        </span>
                        <span className={`text-sm font-bold ${isOwn ? 'text-primary-foreground' : 'text-white'}`}>
                            {event.price === 0 ? 'Gratis' : `${event.price}€`}
                        </span>
                    </div>
                )}

                {/* Botón de acción */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event._id}`);
                    }}
                    className={`
            flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-md
            ${isOwn
                            ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        }
          `}
                >
                    <ExternalLink className="w-4 h-4" />
                    Ver Detalles
                </button>
            </div>
        </div>
    );
}
