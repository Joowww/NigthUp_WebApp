import { X, MapPin, Calendar, Heart, Users } from 'lucide-react';
import type { User } from '../../modules/user';
import { OnlineStatusBadge } from '../OnlineStatusBadge';

interface UserProfileModalProps {
    user: User;
    onClose: () => void;
    onStartChat?: () => void;
    onShareEvent?: (eventId: string) => void;
    onShareBusiness?: (businessId: string) => void;
}

export function UserProfileModal({ user, onClose, onStartChat, onShareEvent, onShareBusiness }: UserProfileModalProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/10"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-all hover:scale-110 active:scale-95 backdrop-blur-md border border-white/10"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Header con Cover Photo y Avatar */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-blue-600/30 overflow-hidden">
                        {user.coverPhoto ? (
                            <img
                                src={user.coverPhoto}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20" />
                        )}

                        {/* Avatar */}
                        <div className="absolute -bottom-16 left-6">
                            <div className="relative">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=128&background=random`}
                                    alt={user.username}
                                    className="w-32 h-32 rounded-full border-4 border-[#1a1a1a] shadow-2xl object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=128&background=random`;
                                    }}
                                />
                                <div className="absolute bottom-2 right-2">
                                    <OnlineStatusBadge
                                        userId={user._id}
                                        size="lg"
                                        showOffline={true}
                                        className="border-4 border-[#1a1a1a]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-20 overflow-y-auto max-h-[calc(90vh-12rem)] custom-scrollbar">
                        {/* Nombre y bio */}
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-white mb-1">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username}
                            </h2>
                            <p className="text-white/50 text-sm mb-3">@{user.username}</p>
                            {user.bio && (
                                <p className="text-white/80 text-sm leading-relaxed">{user.bio}</p>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {user.city && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Ubicación</p>
                                        <p className="text-sm text-white font-medium">{user.city}{user.country && `, ${user.country}`}</p>
                                    </div>
                                </div>
                            )}

                            {user.birthday && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Calendar className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Cumpleaños</p>
                                        <p className="text-sm text-white font-medium">
                                            {new Date(user.birthday).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Intereses */}
                        {user.intereses && user.intereses.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    Intereses
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.intereses.map((interes, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-white/90 font-medium"
                                        >
                                            {interes}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Eventos - Solo si tiene eventos */}
                        {user.events && user.events.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Eventos ({user.events.length})
                                </h3>
                                <div className="space-y-2">
                                    {user.events.slice(0, 3).map((eventId) => (
                                        <div
                                            key={eventId}
                                            className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                                            onClick={() => onShareEvent?.(eventId)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                                                    Ver evento
                                                </p>
                                                <button className="text-xs text-primary hover:text-primary-foreground px-3 py-1 bg-primary/20 hover:bg-primary rounded-lg transition-all">
                                                    Compartir
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {user.events.length > 3 && (
                                        <p className="text-xs text-white/40 text-center py-2">
                                            +{user.events.length - 3} eventos más
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        {onStartChat && (
                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <button
                                    onClick={onStartChat}
                                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-98 shadow-lg shadow-primary/25"
                                >
                                    Enviar Mensaje
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
