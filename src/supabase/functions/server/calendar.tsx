import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
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
  userId?: string;
  caseId?: string;
}

// Get all events for a case
app.post("/events", async (c) => {
  try {
    const { caseId } = await c.req.json();
    
    // Get all events for this case
    const eventsKey = caseId ? `calendar_events_case_${caseId}` : 'calendar_events_all';
    const events = await kv.get(eventsKey) || [];
    
    return c.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Create new event
app.post("/events/create", async (c) => {
  try {
    const eventData = await c.req.json();
    
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      type: eventData.type || 'other',
      description: eventData.description,
      location: eventData.location,
      attendees: eventData.attendees || [],
      reminder: eventData.reminder || 60,
      status: eventData.status || 'upcoming',
      notes: eventData.notes,
      extractedFromDoc: eventData.extractedFromDoc || false,
      relatedDocId: eventData.relatedDocId,
      caseId: eventData.caseId,
      userId: eventData.userId,
    };

    // Store event
    const eventsKey = eventData.caseId ? `calendar_events_case_${eventData.caseId}` : 'calendar_events_all';
    const events = await kv.get(eventsKey) || [];
    events.push(newEvent);
    await kv.set(eventsKey, events);

    // Store individual event for quick lookup
    await kv.set(`calendar_event_${newEvent.id}`, newEvent);

    return c.json({ event: newEvent });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update event
app.post("/events/update", async (c) => {
  try {
    const eventData = await c.req.json();
    
    if (!eventData.id) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    // Get existing event
    const existingEvent = await kv.get(`calendar_event_${eventData.id}`);
    if (!existingEvent) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Update event
    const updatedEvent: CalendarEvent = {
      ...existingEvent,
      ...eventData,
      id: eventData.id, // Preserve ID
    };

    // Update in list
    const eventsKey = updatedEvent.caseId ? `calendar_events_case_${updatedEvent.caseId}` : 'calendar_events_all';
    const events = await kv.get(eventsKey) || [];
    const updatedEvents = events.map((e: CalendarEvent) => 
      e.id === updatedEvent.id ? updatedEvent : e
    );
    await kv.set(eventsKey, updatedEvents);

    // Update individual event
    await kv.set(`calendar_event_${updatedEvent.id}`, updatedEvent);

    return c.json({ event: updatedEvent });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// Delete event
app.post("/events/delete", async (c) => {
  try {
    const { id } = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    // Get event to find case
    const event = await kv.get(`calendar_event_${id}`);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Remove from list
    const eventsKey = event.caseId ? `calendar_events_case_${event.caseId}` : 'calendar_events_all';
    const events = await kv.get(eventsKey) || [];
    const filteredEvents = events.filter((e: CalendarEvent) => e.id !== id);
    await kv.set(eventsKey, filteredEvents);

    // Delete individual event
    await kv.del(`calendar_event_${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// Extract dates from documents using AI
app.post("/extract-dates", async (c) => {
  try {
    const { caseId } = await c.req.json();
    
    // Get all documents for this case
    const documentsKey = `documents_${caseId}`;
    const documents = await kv.get(documentsKey) || [];
    
    const extractedEvents: CalendarEvent[] = [];
    
    // Simple date extraction (in production, use Gemini AI)
    for (const doc of documents) {
      const text = doc.content || '';
      
      // Look for common date patterns
      const datePatterns = [
        /hearing\s+(?:on|scheduled for)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
        /court\s+date:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
        /deadline:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
        /meeting\s+(?:on|scheduled for)\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/gi,
      ];
      
      for (const pattern of datePatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          try {
            const dateStr = match[1];
            const eventType = match[0].toLowerCase().includes('hearing') ? 'hearing' :
                            match[0].toLowerCase().includes('deadline') ? 'deadline' :
                            match[0].toLowerCase().includes('meeting') ? 'meeting' : 'other';
            
            // Parse date
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              const event: CalendarEvent = {
                id: crypto.randomUUID(),
                title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} - From Document`,
                start: date.toISOString(),
                end: new Date(date.getTime() + 3600000).toISOString(), // 1 hour later
                type: eventType as any,
                description: `Extracted from: ${doc.name || 'Untitled Document'}`,
                status: 'upcoming',
                extractedFromDoc: true,
                relatedDocId: doc.id,
                caseId,
              };
              
              extractedEvents.push(event);
            }
          } catch (e) {
            console.error('Error parsing date:', e);
          }
        }
      }
    }
    
    // Save extracted events
    if (extractedEvents.length > 0) {
      const eventsKey = `calendar_events_case_${caseId}`;
      const existingEvents = await kv.get(eventsKey) || [];
      
      // Avoid duplicates
      const newEvents = extractedEvents.filter(newEvent => 
        !existingEvents.some((existing: CalendarEvent) => 
          existing.relatedDocId === newEvent.relatedDocId &&
          existing.start === newEvent.start
        )
      );
      
      const allEvents = [...existingEvents, ...newEvents];
      await kv.set(eventsKey, allEvents);
      
      // Store individual events
      for (const event of newEvents) {
        await kv.set(`calendar_event_${event.id}`, event);
      }
      
      return c.json({ 
        eventsCreated: newEvents.length,
        events: newEvents 
      });
    }
    
    return c.json({ eventsCreated: 0, events: [] });
  } catch (error) {
    console.error('Error extracting dates from documents:', error);
    return c.json({ error: 'Failed to extract dates' }, 500);
  }
});

// Google Calendar Integration Routes
// Note: These would need proper OAuth setup in production

// Check Google Calendar connection status
app.get("/google/status", async (c) => {
  try {
    // In production, check if user has valid Google OAuth token
    const userId = c.req.header('X-User-Id');
    if (!userId) {
      return c.json({ connected: false });
    }
    
    const googleToken = await kv.get(`google_calendar_token_${userId}`);
    return c.json({ connected: !!googleToken });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return c.json({ connected: false });
  }
});

// Get Google OAuth URL
app.get("/google/auth", async (c) => {
  try {
    // In production, generate proper OAuth URL
    // For now, return a placeholder
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=https://www.googleapis.com/auth/calendar';
    
    return c.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return c.json({ error: 'Failed to generate auth URL' }, 500);
  }
});

// Sync with Google Calendar
app.post("/google/sync", async (c) => {
  try {
    const { caseId } = await c.req.json();
    const userId = c.req.header('X-User-Id');
    
    if (!userId) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    // Get Google token
    const googleToken = await kv.get(`google_calendar_token_${userId}`);
    if (!googleToken) {
      return c.json({ error: 'Google Calendar not connected' }, 400);
    }
    
    // Get local events
    const eventsKey = caseId ? `calendar_events_case_${caseId}` : 'calendar_events_all';
    const events = await kv.get(eventsKey) || [];
    
    // In production, sync with Google Calendar API
    // For now, just return success
    console.log(`Would sync ${events.length} events to Google Calendar`);
    
    return c.json({ 
      success: true, 
      synced: events.length 
    });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return c.json({ error: 'Failed to sync with Google Calendar' }, 500);
  }
});

// Create/update single event in Google Calendar
app.post("/google/event", async (c) => {
  try {
    const event = await c.req.json();
    const userId = c.req.header('X-User-Id');
    
    if (!userId) {
      return c.json({ error: 'User not authenticated' }, 401);
    }
    
    // Get Google token
    const googleToken = await kv.get(`google_calendar_token_${userId}`);
    if (!googleToken) {
      return c.json({ error: 'Google Calendar not connected' }, 400);
    }
    
    // In production, create/update event in Google Calendar API
    console.log('Would sync event to Google Calendar:', event.title);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error syncing event to Google Calendar:', error);
    return c.json({ error: 'Failed to sync event' }, 500);
  }
});

export default app;
