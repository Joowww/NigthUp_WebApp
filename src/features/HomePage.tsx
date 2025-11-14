import React from 'react'; // Importamos React
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heart, MapPin, Calendar, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';

import { ImageWithFallback } from './ImageWithFallback'; 

// --- DATOS ESTÁTICOS DE EJEMPLO ---
const featuredEvents = [
  {
    id: 'event-1',
    title: 'Noche Electrónica',
    venue: 'Club Paradise',
    date: '15 Oct',
    time: '23:00',
    attendees: 245,
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Electrónica',
  },
  {
    id: 'event-2',
    title: 'Fiesta Latina',
    venue: 'Bar Salsero',
    date: '17 Oct',
    time: '22:00',
    attendees: 180,
    image: 'https://images.unsplash.com/photo-1516998083861-61b5853f9383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbiUyMGRhbmNlJTIwY2x1YnxlbnwxfHx8fDE3NjAwNzg2NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Latina',
  },
  {
    id: 'event-3',
    title: 'Reggaeton Old School',
    venue: 'La Gozadera',
    date: '18 Oct',
    time: '23:30',
    attendees: 310,
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWdnYWV0b24lMjBwYXJ0eXxlbnwxfHx8fDE3NjAwNzg2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Urbano',
  },
];

const upcomingEvents = [
  // (Puedes añadir más eventos aquí si quieres)
  ...featuredEvents.slice(0, 2), // De momento, solo repetimos los dos primeros
];

// --- FIN DE LOS DATOS ESTÁTICOS ---


// Este es el componente de la página de inicio "estático"
// No tiene props ni lógica de estado, solo muestra el HTML
export function HomePage() {
  
  // Hemos quitado:
  // - todas las props (onNavigate, favorites, etc.)
  // - todo el estado (enrolledEvents)
  // - todas las funciones (toggleFavorite, etc.)
  // Los botones ahora no hacen nada (onClick={() => {}})

  return (
    <div className="space-y-8">
      
      {/* --- SECCIÓN DE EVENTOS DESTACADOS --- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Eventos Destacados</h2>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()} // No hace nada todavía
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        
        {/* Carrusel de Destacados (usamos grid/scroll horizontal por ahora) */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {featuredEvents.map((event) => (
            <Card key={event.id} className="min-w-[300px] w-[300px] bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
              <div className="relative">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="h-40 w-full object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white">
                  {event.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
                  onClick={() => {}} // No hace nada todavía
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="text-lg font-semibold truncate">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-chart-5" />
                    <span>{event.attendees} apuntados</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30"
                  onClick={() => {}} // No hace nada todavía
                >
                  Apuntarme
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN DE PRÓXIMOS EVENTOS --- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold">Próximos Eventos</h2>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()} // No hace nada todavía
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        
        {/* Lista de Próximos Eventos */}
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="flex bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="h-32 w-28 object-cover"
              />
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold truncate">{event.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary -mt-2 -mr-2"
                      onClick={() => {}} // No hace nada todavía
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.venue}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-secondary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-chart-5" />
                    <span>{event.attendees} apuntados</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}