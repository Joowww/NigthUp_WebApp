import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Music, Loader2 } from 'lucide-react';
import type { IBusinessData } from '../../modules/chat';
import type { IBusiness } from '../../modules/bussiness';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface BusinessMessageProps {
    businessData: IBusinessData;
    isOwn: boolean;
}

export function BusinessMessage({ businessData, isOwn }: BusinessMessageProps) {
    const navigate = useNavigate();
    const [business, setBusiness] = useState<IBusiness | null>(businessData.businessDetails || null);
    const [loading, setLoading] = useState(!businessData.businessDetails);

    useEffect(() => {
        if (!business && businessData.businessId) {
            setLoading(true);
            api.get(`/business/${businessData.businessId}`)
                .then(res => {
                    setBusiness(res.data);
                })
                .catch(err => console.error('Error fetching business for message:', err))
                .finally(() => setLoading(false));
        }
    }, [businessData.businessId, business]);

    if (loading) {
        return (
            <div className={`
        p-4 w-64 rounded-xl border flex items-center justify-center gap-3
        ${isOwn ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}
      `}>
                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                <p className="text-xs text-white/60 italic">Cargando discoteca...</p>
            </div>
        );
    }

    if (!business) {
        return (
            <div className={`
        p-4 w-64 rounded-xl border
        ${isOwn ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/10'}
      `}>
                <p className="text-sm text-white/60 italic">Discoteca no disponible</p>
            </div>
        );
    }

    return (
        <div
            onClick={() => navigate(`/business/${business._id}`)}
            className={`
        w-full max-w-[320px] overflow-hidden rounded-2xl shadow-lg border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]
        ${isOwn
                    ? 'bg-gradient-to-br from-primary/90 to-primary border-primary/30'
                    : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                }
      `}
        >
            {/* Header con imagen o gradiente */}
            <div className="relative h-32 overflow-hidden">
                {business.avatar ? (
                    <img
                        src={business.avatar}
                        alt={business.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/40 via-pink-600/40 to-blue-600/40 flex items-center justify-center">
                        <Music className="w-16 h-16 text-white/30" />
                    </div>
                )}

                {/* Badge de estado */}
                {business.active && (
                    <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-green-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-lg">
                            Abierto
                        </span>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4">
                {/* Nombre */}
                <h3 className={`font-bold text-xl mb-2 line-clamp-1 ${isOwn ? 'text-primary-foreground' : 'text-white'}`}>
                    {business.name}
                </h3>

                {/* Info */}
                <div className="space-y-2 mb-4">
                    {/* Dirección */}
                    {business.address && (
                        <div className="flex items-start gap-2">
                            <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isOwn ? 'text-primary-foreground/70' : 'text-red-400'}`} />
                            <span className={`text-xs flex-1 ${isOwn ? 'text-primary-foreground/80' : 'text-white/70'}`}>
                                {business.address}
                            </span>
                        </div>
                    )}

                    {/* Número de eventos */}
                    {business.events && business.events.length > 0 && (
                        <div className={`
              flex items-center justify-between p-2 rounded-lg
              ${isOwn ? 'bg-primary-foreground/10' : 'bg-white/5'}
            `}>
                            <span className={`text-xs font-medium ${isOwn ? 'text-primary-foreground/70' : 'text-white/60'}`}>
                                Eventos próximos
                            </span>
                            <span className={`text-sm font-bold ${isOwn ? 'text-primary-foreground' : 'text-white'}`}>
                                {business.events.length}
                            </span>
                        </div>
                    )}

                    {/* Teléfono */}
                    {business.phone && (
                        <div className={`
              p-2 rounded-lg text-center
              ${isOwn ? 'bg-primary-foreground/10' : 'bg-white/5'}
            `}>
                            <p className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-white/60'}`}>
                                Teléfono
                            </p>
                            <a
                                href={`tel:${business.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`text-sm font-semibold hover:underline ${isOwn ? 'text-primary-foreground' : 'text-white'}`}
                            >
                                {business.phone}
                            </a>
                        </div>
                    )}
                </div>

                {/* Botón de acción */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/business/${business._id}`);
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
                    Ver Discoteca
                </button>
            </div>
        </div>
    );
}
