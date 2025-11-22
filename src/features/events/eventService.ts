// services/eventService.ts
import api from '../../api';
import type { Event } from '../../modules/event';

export interface EventsResponse {
  events: Event[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export const getEvents = async (skip: number = 0, limit: number = 10): Promise<EventsResponse> => {
  const res = await api.get('/event', {
    params: { skip, limit }
  });
  return res.data; 
};

export const joinEvent = async (eventId: string, userId : string): Promise<void> => {
  try {
    await api.post(`/event/${eventId}/join`, { userId });
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
};

export const leaveEvent = async (eventId: string, userId : string): Promise<void> => {
  try {
    await api.post(`/event/${eventId}/leave`, { userId });
  } catch (error) {
    console.error('Error leaving event:', error);
    throw error;
  }
};