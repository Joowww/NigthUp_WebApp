import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heart, MapPin, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import type { Page } from '../../App';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  enrolledEvents: Set<string>;
  toggleEnrollment: (eventId: string) => void;
}

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
    title: 'Reggaeton Night',
    venue: 'Fever Club',
    date: '16 Oct',
    time: '00:00',
    attendees: 189,
    image: 'https://images.unsplash.com/photo-1735910142063-228190a5d75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG11c2ljJTIwY29uY2VydHxlbnwxfHx8fDE3NjAxMDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Urbano',
  },
  {
    id: 'event-3',
    title: 'Techno Sessions',
    venue: 'Underground',
    date: '17 Oct',
    time: '22:30',
    attendees: 312,
    image: 'https://images.unsplash.com/photo-1713001800951-708867d45b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2x1YiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAxMDc2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Techno',
  },
];

export function HomePage({ onNavigate, favorites, toggleFavorite, enrolledEvents, toggleEnrollment }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] px-6 py-20 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="mb-6 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
              Vive la noche como nunca antes
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Descubre los mejores eventos, discotecas y fiestas de la ciudad. Únete a la lista, conoce gente nueva y disfruta de experiencias inolvidables.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/50 transition-all"
                onClick={() => onNavigate('events')}
              >
                Explorar Eventos
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-[#00d9ff]/50 text-[#00d9ff] hover:bg-[#00d9ff]/10"
                onClick={() => onNavigate('venues')}
              >
                Ver Discotecas
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Eventos Activos', value: '50+', icon: Calendar },
              { label: 'Usuarios Activos', value: '2.5k', icon: Users },
              { label: 'Discotecas', value: '25+', icon: MapPin },
              { label: 'Popularidad', value: '95%', icon: TrendingUp },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-[#ff0080]" />
                    <p className="text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-foreground">Eventos Destacados</h2>
            <Button 
              variant="link" 
              className="text-[#00d9ff]"
              onClick={() => onNavigate('events')}
            >
              Ver todos
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <Card 
                key={event.id} 
                className="group overflow-hidden border-border bg-card hover:border-[#ff0080]/30 transition-all hover:shadow-xl hover:shadow-[#ff0080]/20"
              >
                <div className="relative aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-3 left-3 bg-[#ff0080] border-none">
                    {event.category}
                  </Badge>
                  <button
                    onClick={() => toggleFavorite(event.id)}
                    className="absolute top-3 right-3 rounded-full bg-black/50 p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
                  >
                    <Heart 
                      className={`h-5 w-5 ${favorites.has(event.id) ? 'fill-[#ff0080] text-[#ff0080]' : 'text-white'}`} 
                    />
                  </button>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="mb-2 text-foreground">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#00d9ff]" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#7928ca]" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#50fa7b]" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#ffb86c]" />
                      <span>{event.attendees} apuntados</span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full ${
                      enrolledEvents.has(event.id)
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30'
                    }`}
                    onClick={() => toggleEnrollment(event.id)}
                  >
                    {enrolledEvents.has(event.id) ? '✓ Apuntado' : 'Apuntarme'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
