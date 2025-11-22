import React, { useEffect, useState } from 'react';
import { getEvents } from './eventService';
import type { Event } from '../../modules/event';
import { useAuth } from '../../hooks/useAuth';

export const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEvents();
       // setEvents(data);
      } catch (err) {
        setError('Error cargando eventos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]); // 1. Añadido 'user' como dependencia para recargar eventos al cambiar el usuario

  if (loading) return <div>Cargando eventos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="event-list-page"> 
      <h2 className='event-header'>EVENTOS</h2>

      <div className="event-list-container">
        {events.map(ev => (

          <div key={ev._id} className="card">
            <div className="no-image">
              <svg
                className="icon"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.1"
                  d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                ></path>
              </svg>
            </div>
            <div className="content">
              <p className="name">{ev.name}</p>
              <p className="address">{ev.category ?? 'No especificado'}</p>
              <p className="time">{ev.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};