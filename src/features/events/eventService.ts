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

export const getEvents = async (skip: number = 0, limit: number = 50): Promise<EventsResponse> => {
  const res = await api.get('/event', {
    params: { skip, limit }
  });
  return res.data;
};

export const getEventsByManager = async (managerId: string): Promise<any[]> => {
  const res = await api.get(`/event/manager/${managerId}`);
  return res.data;
};

export const createEvent = async (managerId: string, eventData: any): Promise<any> => {
  const res = await api.post(`/event/create/${managerId}`, eventData);
  return res.data;
};

export const updateEvent = async (eventId: string, eventData: any): Promise<any> => {
  const res = await api.patch(`/event/${eventId}`, eventData);
  return res.data;
};

export const disableEvent = async (identifier: string): Promise<void> => {
  await api.patch(`/event/${identifier}/disable`);
};

export const reactivateEvent = async (identifier: string): Promise<void> => {
  await api.patch(`/event/${identifier}/reactivate`);
};


export const joinEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    await api.post(`/event/${eventId}/join`, { userId });
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
};

export const leaveEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    await api.post(`/event/${eventId}/leave`, { userId });
  } catch (error) {
    console.error('Error leaving event:', error);
    throw error;
  }
};