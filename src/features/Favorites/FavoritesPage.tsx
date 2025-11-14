import { ImageWithFallback } from '../ImageWithFallback';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Heart, MapPin, Calendar, Users, Clock, Star, Phone } from 'lucide-react';

interface FavoritesPageProps {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  enrolledEvents: Set<string>;
  toggleEnrollment: (eventId: string) => void;
}

const allItems = {
  'event-1': {
    type: 'event',
    title: 'Noche Electrónica',
    venue: 'Club Paradise',
    date: '15 Oct',
    time: '23:00',
    attendees: 245,
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Electrónica',
  },
  'event-2': {
    type: 'event',
    title: 'Reggaeton Night',
    venue: 'Fever Club',
    date: '16 Oct',
    time: '00:00',
    attendees: 189,
    image: 'https://images.unsplash.com/photo-1735910142063-228190a5d75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG11c2ljJTIwY29uY2VydHxlbnwxfHx8fDE3NjAxMDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Urbano',
  },
  'event-3': {
    type: 'event',
    title: 'Techno Sessions',
    venue: 'Underground',
    date: '17 Oct',
    time: '22:30',
    attendees: 312,
    image: 'https://images.unsplash.com/photo-1713001800951-708867d45b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2x1YiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAxMDc2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Techno',
  },
  'venue-1': {
    type: 'venue',
    name: 'Club Paradise',
    address: 'Calle Mayor 45, Madrid',
    rating: 4.8,
    reviews: 324,
    phone: '+34 91 123 4567',
    hours: '23:00 - 06:00',
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  'venue-2': {
    type: 'venue',
    name: 'Fever Club',
    address: 'Avenida Libertad 23, Madrid',
    rating: 4.6,
    reviews: 287,
    phone: '+34 91 234 5678',
    hours: '00:00 - 07:00',
    image: 'https://images.unsplash.com/photo-1735910142063-228190a5d75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG11c2ljJTIwY29uY2VydHxlbnwxfHx8fDE3NjAxMDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  'venue-3': {
    type: 'venue',
    name: 'Underground',
    address: 'Plaza Central 12, Madrid',
    rating: 4.9,
    reviews: 412,
    phone: '+34 91 345 6789',
    hours: '22:30 - 06:30',
    image: 'https://images.unsplash.com/photo-1713001800951-708867d45b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2x1YiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAxMDc2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
};

export function FavoritesPage({ favorites, toggleFavorite, enrolledEvents, toggleEnrollment }: FavoritesPageProps) {
  const favoriteItems = Array.from(favorites)
    .map(id => ({ id, ...allItems[id as keyof typeof allItems] }))
    .filter(item => item.type);

  const favoriteEvents = favoriteItems.filter(item => item.type === 'event');
  const favoriteVenues = favoriteItems.filter(item => item.type === 'venue');

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Mis Favoritos
          </h1>
          <p className="text-muted-foreground">
            Todos tus eventos y discotecas favoritos
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">Todos ({favoriteItems.length})</TabsTrigger>
            <TabsTrigger value="events">Eventos ({favoriteEvents.length})</TabsTrigger>
            <TabsTrigger value="venues">Discotecas ({favoriteVenues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {favoriteItems.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No tienes favoritos guardados todavía
                  </p>
                  <Button className="bg-gradient-to-r from-[#ff0080] to-[#7928ca]">
                    Explorar Eventos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favoriteItems.map((item: any) => (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden border-border bg-card hover:border-[#ff0080]/30 transition-all hover:shadow-xl hover:shadow-[#ff0080]/20"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title || item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      {item.type === 'event' && item.category && (
                        <Badge className="absolute top-3 left-3 bg-[#ff0080] border-none">
                          {item.category}
                        </Badge>
                      )}
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 right-3 rounded-full bg-black/50 p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
                      >
                        <Heart className="h-5 w-5 fill-[#ff0080] text-[#ff0080]" />
                      </button>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="mb-2 text-foreground">{item.title || item.name}</h3>
                      
                      {item.type === 'event' ? (
                        <>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#00d9ff]" />
                              <span>{item.venue}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#7928ca]" />
                                <span>{item.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#50fa7b]" />
                                <span>{item.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#ffb86c]" />
                              <span>{item.attendees} apuntados</span>
                            </div>
                          </div>

                          <Button 
                            className={`w-full ${
                              enrolledEvents.has(item.id)
                                ? 'bg-muted text-foreground hover:bg-muted/80'
                                : 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30'
                            }`}
                            onClick={() => toggleEnrollment(item.id)}
                          >
                            {enrolledEvents.has(item.id) ? '✓ Apuntado' : 'Apuntarme'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#00d9ff]" />
                              <span>{item.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 fill-[#f1fa8c] text-[#f1fa8c]" />
                              <span>{item.rating} ({item.reviews} reseñas)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#50fa7b]" />
                              <span>{item.hours}</span>
                            </div>
                          </div>

                          <Button className="w-full bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30">
                            Ver Eventos
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {favoriteEvents.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No tienes eventos favoritos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favoriteEvents.map((item: any) => (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden border-border bg-card hover:border-[#ff0080]/30 transition-all hover:shadow-xl hover:shadow-[#ff0080]/20"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <Badge className="absolute top-3 left-3 bg-[#ff0080] border-none">
                        {item.category}
                      </Badge>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 right-3 rounded-full bg-black/50 p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
                      >
                        <Heart className="h-5 w-5 fill-[#ff0080] text-[#ff0080]" />
                      </button>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="mb-2 text-foreground">{item.title}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#00d9ff]" />
                          <span>{item.venue}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#7928ca]" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#50fa7b]" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#ffb86c]" />
                          <span>{item.attendees} apuntados</span>
                        </div>
                      </div>

                      <Button 
                        className={`w-full ${
                          enrolledEvents.has(item.id)
                            ? 'bg-muted text-foreground hover:bg-muted/80'
                            : 'bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30'
                        }`}
                        onClick={() => toggleEnrollment(item.id)}
                      >
                        {enrolledEvents.has(item.id) ? '✓ Apuntado' : 'Apuntarme'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="venues">
            {favoriteVenues.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No tienes discotecas favoritas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favoriteVenues.map((item: any) => (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden border-border bg-card hover:border-[#ff0080]/30 transition-all hover:shadow-xl hover:shadow-[#ff0080]/20"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 right-3 rounded-full bg-black/50 p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
                      >
                        <Heart className="h-5 w-5 fill-[#ff0080] text-[#ff0080]" />
                      </button>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                        <Star className="h-4 w-4 fill-[#f1fa8c] text-[#f1fa8c]" />
                        <span className="font-medium">{item.rating}</span>
                        <span className="text-sm text-gray-300">({item.reviews})</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="mb-3 text-foreground">{item.name}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#00d9ff]" />
                          <span>{item.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#50fa7b]" />
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#ffb86c]" />
                          <span>{item.hours}</span>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30">
                        Ver Eventos
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
