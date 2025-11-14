import { useState } from 'react';
import { ImageWithFallback } from '../ImageWithFallback';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Heart, MapPin, Calendar, Users, Clock, Search } from 'lucide-react';

interface EventsPageProps {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  enrolledEvents: Set<string>;
  toggleEnrollment: (eventId: string) => void;
}

const allEvents = [
  {
    id: 'event-1',
    title: 'Noche Electrónica',
    venue: 'Club Paradise',
    date: '15 Oct',
    time: '23:00',
    attendees: 245,
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Electrónica',
    price: 'Gratis',
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
    price: '15€',
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
    price: '20€',
  },
  {
    id: 'event-4',
    title: 'House Music Vibes',
    venue: 'Club Paradise',
    date: '18 Oct',
    time: '23:30',
    attendees: 198,
    image: 'https://images.unsplash.com/photo-1663566394632-394c11f21dac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMGZsb29yJTIwcGFydHl8ZW58MXx8fHwxNzYwMTA3NjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'House',
    price: '10€',
  },
  {
    id: 'event-5',
    title: 'Latin Beats',
    venue: 'Salsa Club',
    date: '19 Oct',
    time: '22:00',
    attendees: 156,
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Latino',
    price: '12€',
  },
  {
    id: 'event-6',
    title: 'Rock Night',
    venue: 'Rock Bar',
    date: '20 Oct',
    time: '21:00',
    attendees: 134,
    image: 'https://images.unsplash.com/photo-1735910142063-228190a5d75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG11c2ljJTIwY29uY2VydHxlbnwxfHx8fDE3NjAxMDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Rock',
    price: '8€',
  },
];

export function EventsPage({ favorites, toggleFavorite, enrolledEvents, toggleEnrollment }: EventsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Todos los Eventos
          </h1>
          <p className="text-muted-foreground">
            Descubre y únete a los mejores eventos de la ciudad
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos o discotecas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        {/* Categories */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="electrónica">Electrónica</TabsTrigger>
            <TabsTrigger value="urbano">Urbano</TabsTrigger>
            <TabsTrigger value="techno">Techno</TabsTrigger>
            <TabsTrigger value="house">House</TabsTrigger>
            <TabsTrigger value="latino">Latino</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
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
                <Badge className="absolute top-3 right-14 bg-[#00d9ff] text-black border-none">
                  {event.price}
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

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron eventos con los criterios seleccionados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
