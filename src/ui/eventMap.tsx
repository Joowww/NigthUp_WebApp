// features/EventMap.tsx
import React, { useState } from 'react';
import type { Event } from '../modules/event';
import { Calendar, Users, ChevronRight, MapPin } from 'lucide-react';

interface EventMapProps {
  events: Event[];
}

export const EventMap: React.FC<EventMapProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Función para crear URL de OpenStreetMap con múltiples marcadores
  const createMapUrl = () => {
    if (events.length === 0) {
      return "https://www.openstreetmap.org/export/embed.html?bbox=-3.8889,40.3111,-3.4558,40.6436&layer=mapnik";
    }

    // Si hay un evento seleccionado, centrar en ese evento
    if (selectedEvent) {
      const [lng, lat] = selectedEvent.location.coordinates;
      const bbox = `${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    }

    // Si no hay evento seleccionado, mostrar todos los eventos
    const markers = events.map(event => {
      const [lng, lat] = event.location.coordinates;
      return `&marker=${lat},${lng}`;
    }).join('');

    // Calcular bounding box que incluya todos los eventos
    const lngs = events.map(event => event.location.coordinates[0]);
    const lats = events.map(event => event.location.coordinates[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    const bbox = `${minLng-0.05},${minLat-0.05},${maxLng+0.05},${maxLat+0.05}`;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markers}`;
  };

  // Función para crear URL del mapa completo
  const createFullMapUrl = () => {
    if (events.length === 0) {
      return "https://www.openstreetmap.org/#map=13/40.4168/-3.7038";
    }

    if (selectedEvent) {
      const [lng, lat] = selectedEvent.location.coordinates;
      return `https://www.openstreetmap.org/#map=16/${lat}/${lng}`;
    }

    const firstEvent = events[0];
    const [lng, lat] = firstEvent.location.coordinates;
    return `https://www.openstreetmap.org/#map=13/${lat}/${lng}`;
  };

  // Función para obtener ubicación legible
  const getReadableLocation = (event: Event): string => {
    if (!event.location || !event.location.coordinates) {
      return 'Ubicación no disponible';
    }
    
    const [lng, lat] = event.location.coordinates;
    return `Lat: ${lat?.toFixed(4)}, Lng: ${lng?.toFixed(4)}`;
  };

  return (
    <div className="space-y-4">
      {/* Mapa embebido */}
      <div className="w-full h-96 rounded-lg overflow-hidden border border-border bg-gray-800">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={createMapUrl()}
          className="border-0"
          title="Mapa de eventos"
        />
      </div>

      {/* Información del evento seleccionado */}
      {selectedEvent && (
        <div className="bg-card border border-border rounded-lg p-4 animate-in fade-in duration-300">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white text-lg">{selectedEvent.name}</h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-muted-foreground hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-muted-foreground mb-3">{selectedEvent.description}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{getReadableLocation(selectedEvent)}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedEvent.schedule).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{selectedEvent.participants.length} participantes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="space-y-2">
        <h4 className="text-white font-semibold">Eventos en el mapa:</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {events.map((event) => (
            <button
              key={event._id}
              onClick={() => setSelectedEvent(event)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedEvent?._id === event._id
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{event.name}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </div>
              <div className="text-xs mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{getReadableLocation(event)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enlace al mapa completo */}
      <div className="text-center pt-2">
        <a 
          href={createFullMapUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Ver mapa completo en OpenStreetMap
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};