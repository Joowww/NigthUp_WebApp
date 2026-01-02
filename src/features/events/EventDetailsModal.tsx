import { X, MapPin, Calendar, Clock, DollarSign, Users, Heart } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ImageWithFallback } from '../ImageWithFallback'; // Adjust path if needed
import { type Event } from '../../modules/event';
import { useTranslation } from 'react-i18next';

interface EventDetailsModalProps {
    event: Event;
    onClose: () => void;
    onJoinToggle: (eventId: string) => void;
    isJoined: boolean;
}

export function EventDetailsModal({ event, onClose, onJoinToggle, isJoined }: EventDetailsModalProps) {
    const { t } = useTranslation();

    const formatDate = (date: Date | string) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (date: Date | string) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to construct map URL
    const getMapUrl = () => {
        if (event.location && event.location.coordinates && event.location.coordinates.length === 2) {
            // GeoJSON stores as [longitude, latitude]
            const [lng, lat] = event.location.coordinates;
            return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
        if (event.city) {
            return `https://maps.google.com/maps?q=${encodeURIComponent(event.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        }
        return null;
    };

    const mapUrl = getMapUrl();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

            {/* Modal Content */}
            <div
                className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f0f0f] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white/70 hover:bg-black/70 hover:text-white backdrop-blur-sm transition-all"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="grid md:grid-cols-2">
                    {/* Left Column: Image */}
                    <div className="relative h-64 md:h-full min-h-[300px]">
                        <ImageWithFallback
                            src={'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80'}
                            alt={event.name}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f0f0f]/50"></div>

                        <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className="bg-[#ff0080] text-white border-none px-3 py-1">
                                {event.category || 'Evento'}
                            </Badge>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{event.name}</h2>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <MapPin className="h-4 w-4 text-[#00d9ff]" />
                                <span>{event.location ? t('home.view_location', 'Ver Ubicación') : t('home.location_unavailable', 'Ubicación secreta')} {event.city ? `(${event.city})` : ''}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Calendar className="h-4 w-4 text-[#7928ca]" />
                                    {t('common.date', 'Fecha')}
                                </div>
                                <p className="text-white font-medium">{formatDate(event.schedule)}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Clock className="h-4 w-4 text-[#50fa7b]" />
                                    {t('common.time', 'Hora')}
                                </div>
                                <p className="text-white font-medium">{formatTime(event.schedule)}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <DollarSign className="h-4 w-4 text-[#f1fa8c]" />
                                    {t('common.price', 'Precio')}
                                </div>
                                <p className="text-white font-medium">{event.price > 0 ? `${event.price}€` : t('common.free', 'Gratis')}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Users className="h-4 w-4 text-[#ffb86c]" />
                                    {t('common.assistants', 'Asistentes')}
                                </div>
                                <p className="text-white font-medium">{event.participants?.length || 0}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">{t('event_details.about', 'Sobre el evento')}</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {event.description || t('event_details.no_description', 'Sin descripción disponible.')}
                            </p>
                        </div>

                        {/* Map Section */}
                        <div className="space-y-2 pt-4 border-t border-zinc-800">
                            <h3 className="text-lg font-semibold text-white">{t('common.location', 'Ubicación')}</h3>
                            <div className="w-full h-48 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 relative group">
                                {mapUrl ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={mapUrl}
                                        className="opacity-80 hover:opacity-100 transition-opacity"
                                    ></iframe>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                                        <div className="text-center">
                                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">{t('manager.no_location', 'No hay ubicación definida')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => onJoinToggle(event._id)}
                                className={`w-full h-12 text-lg font-bold transition-all duration-300 ${isJoined
                                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                    : 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white hover:shadow-[0_0_30px_rgba(255,0,128,0.4)] hover:scale-[1.02]'
                                    }`}
                            >
                                {isJoined ? t('home.leave_btn', 'Ya estás apuntado') : t('home.join_btn', 'Apuntarme al evento')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
