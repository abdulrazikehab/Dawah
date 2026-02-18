import { API_URL, ENDPOINTS } from '../constants/api';

export const apiService = {
  async getEvents() {
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async getEventById(id: string) {
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  },

  async createEvent(eventData: any) {
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  async getTemplates() {
    const response = await fetch(`${API_URL}${ENDPOINTS.TEMPLATES}`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  },

  async getPackages() {
    const response = await fetch(`${API_URL}${ENDPOINTS.PACKAGES}`);
    if (!response.ok) throw new Error('Failed to fetch packages');
    return response.json();
  },

  async updateRSVP(guestId: string, rsvpData: { rsvpStatus: string, actualCompanions: number }) {
    const response = await fetch(`${API_URL}${ENDPOINTS.GUESTS}/${guestId}/rsvp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvpData),
    });
    if (!response.ok) throw new Error('Failed to update RSVP');
    return response.json();
  },

  async addGuest(eventId: string, guestData: any) {
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}/${eventId}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData),
    });
    if (!response.ok) throw new Error('Failed to add guest');
    return response.json();
  }
};
