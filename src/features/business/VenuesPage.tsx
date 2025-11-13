import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heart, MapPin, Star, Phone, Clock } from 'lucide-react';

interface VenuesPageProps {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
}

const venues = [
  {
    id: 'venue-1',
    name: 'Club Paradise',
    address: 'Calle Mayor 45, Madrid',
    rating: 4.8,
    reviews: 324,
    phone: '+34 91 123 4567',
    hours: '23:00 - 06:00',
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['Electrónica', 'House', 'VIP'],
  },
  {
    id: 'venue-2',
    name: 'Fever Club',
    address: 'Avenida Libertad 23, Madrid',
    rating: 4.6,
    reviews: 287,
    phone: '+34 91 234 5678',
    hours: '00:00 - 07:00',
    image: 'https://images.unsplash.com/photo-1735910142063-228190a5d75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMG11c2ljJTIwY29uY2VydHxlbnwxfHx8fDE3NjAxMDc2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['Urbano', 'Reggaeton', 'Latino'],
  },
  {
    id: 'venue-3',
    name: 'Underground',
    address: 'Plaza Central 12, Madrid',
    rating: 4.9,
    reviews: 412,
    phone: '+34 91 345 6789',
    hours: '22:30 - 06:30',
    image: 'https://images.unsplash.com/photo-1713001800951-708867d45b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2x1YiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAxMDc2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['Techno', 'Underground', 'Industrial'],
  },
  {
    id: 'venue-4',
    name: 'Salsa Club',
    address: 'Calle Ritmo 8, Madrid',
    rating: 4.7,
    reviews: 198,
    phone: '+34 91 456 7890',
    hours: '22:00 - 05:00',
    image: 'https://images.unsplash.com/photo-1663566394632-394c11f21dac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5jZSUyMGZsb29yJTIwcGFydHl8ZW58MXx8fHwxNzYwMTA3NjY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['Salsa', 'Bachata', 'Latino'],
  },
  {
    id: 'venue-5',
    name: 'Rock Bar',
    address: 'Calle Rock 33, Madrid',
    rating: 4.5,
    reviews: 156,
    phone: '+34 91 567 8901',
    hours: '21:00 - 04:00',
    image: 'https://images.unsplash.com/photo-1625612446042-afd3fe024131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGNsdWIlMjBwYXJ0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAwNzg1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['Rock', 'Metal', 'Alternative'],
  },
  {
    id: 'venue-6',
    name: 'Neon Lounge',
    address: 'Boulevard Noche 67, Madrid',
    rating: 4.8,
    reviews: 289,
    phone: '+34 91 678 9012',
    hours: '23:30 - 06:00',
    image: 'https://images.unsplash.com/photo-1713001800951-708867d45b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY2x1YiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjAxMDc2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    tags: ['Chill', 'Lounge', 'Cocktails'],
  },
];

export function VenuesPage({ favorites, toggleFavorite }: VenuesPageProps) {
  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Discotecas y Locales
          </h1>
          <p className="text-muted-foreground">
            Los mejores lugares para disfrutar de la noche
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card 
              key={venue.id} 
              className="group overflow-hidden border-border bg-card hover:border-[#ff0080]/30 transition-all hover:shadow-xl hover:shadow-[#ff0080]/20"
            >
              <div className="relative aspect-video overflow-hidden">
                <ImageWithFallback
                  src={venue.image}
                  alt={venue.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button
                  onClick={() => toggleFavorite(venue.id)}
                  className="absolute top-3 right-3 rounded-full bg-black/50 p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
                >
                  <Heart 
                    className={`h-5 w-5 ${favorites.has(venue.id) ? 'fill-[#ff0080] text-[#ff0080]' : 'text-white'}`} 
                  />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <Star className="h-4 w-4 fill-[#f1fa8c] text-[#f1fa8c]" />
                  <span className="font-medium">{venue.rating}</span>
                  <span className="text-sm text-gray-300">({venue.reviews})</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="mb-3 text-foreground">{venue.name}</h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#00d9ff]" />
                    <span>{venue.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#50fa7b]" />
                    <span>{venue.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#ffb86c]" />
                    <span>{venue.hours}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {venue.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-[#7928ca]/30 text-[#7928ca] bg-[#7928ca]/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-[#ff0080] to-[#7928ca] hover:shadow-lg hover:shadow-[#ff0080]/30"
                >
                  Ver Eventos
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
