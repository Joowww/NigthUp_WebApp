import { Calendar as CalendarComponent } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Clock, Users, X } from 'lucide-react';
import { useState } from 'react';

interface CalendarPageProps {
  enrolledEvents: Set<string>;
  toggleEnrollment: (eventId: string) => void;
}

const eventDetails = {
  'event-1': { title: 'Noche Electrónica', venue: 'Club Paradise', date: new Date(2025, 9, 15), time: '23:00', attendees: 245 },
  'event-2': { title: 'Reggaeton Night', venue: 'Fever Club', date: new Date(2025, 9, 16), time: '00:00', attendees: 189 },
  'event-3': { title: 'Techno Sessions', venue: 'Underground', date: new Date(2025, 9, 17), time: '22:30', attendees: 312 },
  'event-4': { title: 'House Music Vibes', venue: 'Club Paradise', date: new Date(2025, 9, 18), time: '23:30', attendees: 198 },
  'event-5': { title: 'Latin Beats', venue: 'Salsa Club', date: new Date(2025, 9, 19), time: '22:00', attendees: 156 },
  'event-6': { title: 'Rock Night', venue: 'Rock Bar', date: new Date(2025, 9, 20), time: '21:00', attendees: 134 },
};

export function CalendarPage({ enrolledEvents, toggleEnrollment }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const enrolledEventsList = Array.from(enrolledEvents)
    .map(id => ({ id, ...eventDetails[id as keyof typeof eventDetails] }))
    .filter(event => event.title);

  const eventsOnSelectedDate = enrolledEventsList.filter(event => {
    if (!selectedDate || !event.date) return false;
    return (
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
    );
  });

  const eventDates = enrolledEventsList
    .filter(event => event.date)
    .map(event => event.date);

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#00d9ff] bg-clip-text text-transparent">
            Mi Calendario
          </h1>
          <p className="text-muted-foreground">
            Todos tus eventos en un solo lugar
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Calendar */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Calendario de Eventos</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-lg border border-border bg-card"
                modifiers={{
                  booked: eventDates,
                }}
                modifiersClassNames={{
                  booked: 'bg-[#ff0080]/20 text-[#ff0080] font-bold',
                }}
              />
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-foreground">
              {selectedDate ? 'Eventos del día seleccionado' : 'Próximos eventos'}
            </h2>
            
            {selectedDate && eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map((event) => (
                <Card key={event.id} className="border-border bg-card hover:border-[#ff0080]/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-foreground mb-1">{event.title}</h3>
                        <Badge className="bg-[#ff0080] border-none">
                          {event.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </Badge>
                      </div>
                      <button
                        onClick={() => toggleEnrollment(event.id)}
                        className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-all"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#00d9ff]" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#50fa7b]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#ffb86c]" />
                        <span>{event.attendees} apuntados</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : selectedDate && eventsOnSelectedDate.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No tienes eventos para este día
                  </p>
                </CardContent>
              </Card>
            ) : (
              enrolledEventsList.length > 0 ? (
                enrolledEventsList.slice(0, 5).map((event) => (
                  <Card key={event.id} className="border-border bg-card hover:border-[#ff0080]/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-foreground mb-1">{event.title}</h3>
                          <Badge className="bg-[#ff0080] border-none">
                            {event.date?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </Badge>
                        </div>
                        <button
                          onClick={() => toggleEnrollment(event.id)}
                          className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-all"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#00d9ff]" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#50fa7b]" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#ffb86c]" />
                          <span>{event.attendees} apuntados</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-border bg-card">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No tienes eventos programados
                    </p>
                    <Button className="bg-gradient-to-r from-[#ff0080] to-[#7928ca]">
                      Explorar Eventos
                    </Button>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>

        {/* Summary */}
        {enrolledEventsList.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-gradient-to-br from-[#ff0080]/10 to-[#ff0080]/5">
              <CardContent className="p-6 text-center">
                <p className="text-foreground mb-1">{enrolledEventsList.length}</p>
                <p className="text-sm text-muted-foreground">Eventos apuntados</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-gradient-to-br from-[#7928ca]/10 to-[#7928ca]/5">
              <CardContent className="p-6 text-center">
                <p className="text-foreground mb-1">
                  {new Set(enrolledEventsList.map(e => e.venue)).size}
                </p>
                <p className="text-sm text-muted-foreground">Discotecas diferentes</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-gradient-to-br from-[#00d9ff]/10 to-[#00d9ff]/5">
              <CardContent className="p-6 text-center">
                <p className="text-foreground mb-1">
                  {enrolledEventsList.filter(e => e.date && e.date > new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Próximos eventos</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
