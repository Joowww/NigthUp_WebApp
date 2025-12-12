import { useState } from 'react';
import { X, Users, DollarSign, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../ImageWithFallback';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';

interface Participant {
  id: string;
  name: string;
  age?: number;
  photo?: string;
  status?: string;
}

interface CreatorEventDetailsModalProps {
  event: any;
  onClose: () => void;
  onEdit: () => void;
  onDisable: () => void;
  onReactivate?: () => void;
}

export function CreatorEventDetailsModal({ event, onClose, onEdit, onDisable, onReactivate }: CreatorEventDetailsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;
  const allParticipants: Participant[] = event.participants || [];

  const totalPages = Math.ceil(allParticipants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentParticipants = allParticipants.slice(startIndex, endIndex);

  // Calcular estadísticas
  const confirmedCount = allParticipants.filter(p => p.status === 'confirmed').length;

  // Simular ingresos basado en precio y asistentes
  const priceValue = typeof event.price === 'number' ? event.price : (event.price === 'Gratis' ? 0 : parseFloat(event.price?.replace('€', '') || '0'));
  const estimatedEarnings = priceValue * confirmedCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl shadow-[#7928ca]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-20 rounded-full bg-black/70 p-2 backdrop-blur-sm hover:bg-black/90 transition-all"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Header con imagen */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={event.image}
            alt={event.title}
            className={`h-full w-full object-cover ${event.disabled ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

          {event.disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold uppercase tracking-wider">
                Evento Desactivado
              </span>
            </div>
          )}

          {/* Info sobre la imagen */}
          <div className="absolute bottom-4 left-6 right-6">
            <Badge className="mb-2 bg-[#ff0080] border-none">
              {event.category}
            </Badge>
            <h2 className="text-white mb-2">{event.name || event.title}</h2>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-[#00d9ff]" />
                <span>{event.venue || 'Ubicación'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-[#7928ca]" />
                <span>{new Date(event.schedule || event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-[#50fa7b]" />
                <span>{event.time || new Date(event.schedule || event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={onEdit} className="border-[#7928ca] text-[#7928ca] hover:bg-[#7928ca]/10">
              Editar
            </Button>

            {event.disabled ? (
              <Button
                onClick={onReactivate}
                className="bg-green-600 hover:bg-green-700 text-white border-none shadow-none"
              >
                Reactivar Evento
              </Button>
            ) : (
              <Button variant="destructive" onClick={onDisable}>
                Desactivar
              </Button>
            )}

          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00d9ff]/10">
                    <Users className="h-5 w-5 text-[#00d9ff]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Asistentes</p>
                    <p className="text-foreground">{confirmedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#50fa7b]/10">
                    <DollarSign className="h-5 w-5 text-[#50fa7b]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos Est.</p>
                    <p className="text-foreground">{estimatedEarnings}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalles adicionales */}
          <div className="grid md:grid-cols-1 gap-6 mb-6">
            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <h3 className="text-foreground mb-3">Detalles del Evento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio entrada:</span>
                    <span className="text-foreground">{event.price}€</span>
                  </div>
                  {event.capacity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacidad máxima:</span>
                      <span className="text-foreground">{event.capacity} personas</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ocupación:</span>
                    <span className="text-foreground">
                      {event.capacity ? `${Math.round((confirmedCount / Number(event.capacity)) * 100)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de participantes paginada */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Lista de Participantes</h3>
              <Badge variant="outline" className="border-[#00d9ff]/30 text-[#00d9ff]">
                {allParticipants.length} total
              </Badge>
            </div>

            <Card className="border-border bg-background">
              <CardContent className="p-0">
                {/* Tabla de participantes */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="p-4 text-sm text-muted-foreground">Participante</th>
                        <th className="p-4 text-sm text-muted-foreground">Edad</th>
                        <th className="p-4 text-sm text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentParticipants.map((participant, index) => (
                        <tr
                          key={participant.id || index}
                          className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/5' : ''}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <ImageWithFallback
                                src={participant.photo || ''}
                                alt={participant.name || 'Participante'}
                                className="w-10 h-10 rounded-full object-cover border-2 border-border"
                              />
                              <span className="text-foreground">{participant.name || 'Anónimo'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{participant.age ? `${participant.age} años` : 'N/A'}</td>
                          <td className="p-4">
                            <Badge
                              className={
                                participant.status === 'confirmed'
                                  ? 'bg-[#50fa7b]/20 text-[#50fa7b] border-[#50fa7b]/30'
                                  : 'bg-[#ffb86c]/20 text-[#ffb86c] border-[#ffb86c]/30'
                              }
                            >
                              {participant.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, allParticipants.length)} de {allParticipants.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-border"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            page === currentPage
                              ? 'bg-gradient-to-r from-[#ff0080] to-[#7928ca]'
                              : 'border-border'
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-border"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
