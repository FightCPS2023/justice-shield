import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/calendar`;

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'hearing' | 'meeting' | 'deadline' | 'appointment' | 'visit' | 'other';
  description?: string;
  location?: string;
  attendees?: string[];
  relatedDocId?: string;
  googleEventId?: string;
  reminder?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  extractedFromDoc?: boolean;
}

export const calendarApi = {
  // Get all events
  async getEvents(caseId?: string): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ caseId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const data = await response.json();
    return data.events.map((e: any) => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end),
    }));
  },

  // Create event
  async createEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE}/events/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        ...event,
        start: event.start?.toISOString(),
        end: event.end?.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    const data = await response.json();
    return {
      ...data.event,
      start: new Date(data.event.start),
      end: new Date(data.event.end),
    };
  },

  // Update event
  async updateEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE}/events/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update event');
    }

    const data = await response.json();
    return {
      ...data.event,
      start: new Date(data.event.start),
      end: new Date(data.event.end),
    };
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/events/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ id: eventId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  },

  // Extract dates from documents
  async extractDates(caseId: string): Promise<{ eventsCreated: number; events: CalendarEvent[] }> {
    const response = await fetch(`${API_BASE}/extract-dates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ caseId }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract dates');
    }

    const data = await response.json();
    return {
      eventsCreated: data.eventsCreated,
      events: data.events.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      })),
    };
  },

  // Google Calendar Integration
  async checkGoogleStatus(): Promise<boolean> {
    const response = await fetch(`${API_BASE}/google/status`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.connected;
  },

  async getGoogleAuthUrl(): Promise<string> {
    const response = await fetch(`${API_BASE}/google/auth`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get auth URL');
    }

    const data = await response.json();
    return data.authUrl;
  },

  async syncWithGoogle(caseId?: string): Promise<void> {
    const response = await fetch(`${API_BASE}/google/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ caseId }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync with Google Calendar');
    }
  },

  async syncEventToGoogle(event: CalendarEvent): Promise<void> {
    const response = await fetch(`${API_BASE}/google/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync event to Google Calendar');
    }
  },
};
