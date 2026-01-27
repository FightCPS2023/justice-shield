import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Upload,
  Settings,
  FileText,
  Clock,
  MapPin,
  Users,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useSubscription } from '../contexts/SubscriptionContext';
import { calendarApi, CalendarEvent } from '../utils/calendar-api';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  caseId?: string;
}

export function CalendarView({ caseId }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { tier, isProfessional } = useSubscription();

  // Form state
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'appointment',
    description: '',
    location: '',
    attendees: [],
    reminder: 60,
    status: 'upcoming',
  });

  // Load events from backend
  useEffect(() => {
    loadEvents();
  }, [caseId]);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const parsedEvents = data.events.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(parsedEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Check Google Calendar connection
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const response = await fetch('/api/calendar/google/status');
      if (response.ok) {
        const data = await response.json();
        setIsGoogleConnected(data.connected);
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    if (!isProfessional) {
      toast.error('Google Calendar integration requires Professional plan or higher');
      return;
    }

    try {
      const response = await fetch('/api/calendar/google/auth');
      if (response.ok) {
        const data = await response.json();
        window.open(data.authUrl, '_blank', 'width=600,height=600');
        
        // Poll for connection status
        const checkInterval = setInterval(async () => {
          const statusResponse = await fetch('/api/calendar/google/status');
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.connected) {
              setIsGoogleConnected(true);
              clearInterval(checkInterval);
              toast.success('Google Calendar connected successfully!');
              syncWithGoogle();
            }
          }
        }, 2000);

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(checkInterval), 120000);
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast.error('Failed to connect Google Calendar');
    }
  };

  // Sync with Google Calendar
  const syncWithGoogle = async () => {
    if (!isGoogleConnected) {
      toast.error('Please connect Google Calendar first');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/calendar/google/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });

      if (response.ok) {
        toast.success('Calendar synced with Google Calendar');
        loadEvents();
      } else {
        toast.error('Failed to sync with Google Calendar');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  // Open event dialog
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventForm(event);
    setIsNewEvent(false);
    setIsEventDialogOpen(true);
  };

  // Open new event dialog
  const handleNewEvent = (slotInfo?: { start: Date; end: Date }) => {
    setIsNewEvent(true);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      type: 'appointment',
      description: '',
      location: '',
      attendees: [],
      reminder: 60,
      status: 'upcoming',
      start: slotInfo?.start || new Date(),
      end: slotInfo?.end || new Date(Date.now() + 3600000), // 1 hour later
    });
    setIsEventDialogOpen(true);
  };

  // Save event
  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.start || !eventForm.end) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const url = isNewEvent ? '/api/calendar/events/create' : '/api/calendar/events/update';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          id: isNewEvent ? undefined : selectedEvent?.id,
          caseId,
        }),
      });

      if (response.ok) {
        toast.success(isNewEvent ? 'Event created' : 'Event updated');
        setIsEventDialogOpen(false);
        loadEvents();
        
        // Sync to Google Calendar if connected
        if (isGoogleConnected) {
          syncEventToGoogle(eventForm);
        }
      } else {
        toast.error('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  // Sync single event to Google
  const syncEventToGoogle = async (event: Partial<CalendarEvent>) => {
    try {
      await fetch('/api/calendar/google/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Error syncing to Google:', error);
    }
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch('/api/calendar/events/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEvent.id }),
      });

      if (response.ok) {
        toast.success('Event deleted');
        setIsEventDialogOpen(false);
        loadEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Extract dates from documents
  const extractDatesFromDocs = async () => {
    if (!isProfessional) {
      toast.error('AI date extraction requires Professional plan or higher');
      return;
    }

    try {
      toast.info('Extracting dates from your documents...');
      
      const response = await fetch('/api/calendar/extract-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Found ${data.eventsCreated} dates in your documents`);
        loadEvents();
      } else {
        toast.error('Failed to extract dates');
      }
    } catch (error) {
      console.error('Error extracting dates:', error);
      toast.error('Failed to extract dates');
    }
  };

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const colors: Record<string, string> = {
      hearing: '#ef4444',
      meeting: '#3b82f6',
      deadline: '#f59e0b',
      appointment: '#8b5cf6',
      visit: '#10b981',
      other: '#6b7280',
    };

    return {
      style: {
        backgroundColor: colors[event.type] || colors.other,
        borderRadius: '5px',
        opacity: event.status === 'completed' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Export calendar
  const exportCalendar = () => {
    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cps-case-calendar.ics';
    link.click();
    toast.success('Calendar exported');
  };

  const generateICS = (events: CalendarEvent[]): string => {
    const header = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CPS Defense//Calendar//EN\n';
    const footer = 'END:VCALENDAR';
    
    const eventBlocks = events.map(event => {
      const start = format(event.start, "yyyyMMdd'T'HHmmss");
      const end = format(event.end, "yyyyMMdd'T'HHmmss");
      
      return [
        'BEGIN:VEVENT',
        `UID:${event.id}@cpsdefense.app`,
        `DTSTAMP:${start}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : '',
        event.location ? `LOCATION:${event.location}` : '',
        'END:VEVENT',
      ].filter(Boolean).join('\n');
    }).join('\n');

    return header + eventBlocks + '\n' + footer;
  };

  // Upcoming events
  const upcomingEvents = events
    .filter(e => e.status === 'upcoming' && e.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Case Calendar
              </CardTitle>
              <CardDescription>
                Manage hearings, deadlines, and appointments
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              {isGoogleConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncWithGoogle}
                  disabled={isSyncing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isSyncing ? 'Syncing...' : 'Sync Google'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectGoogleCalendar}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Connect Google
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={extractDatesFromDocs}
                disabled={!isProfessional}
              >
                <FileText className="w-4 h-4 mr-2" />
                Extract from Docs
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportCalendar}
              >
                <Upload className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button size="sm" onClick={() => handleNewEvent()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upcoming Events Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
              ) : (
                upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectEvent(event)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: eventStyleGetter(event).style.backgroundColor,
                              color: 'white',
                            }}
                          >
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm truncate">{event.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {format(event.start, 'MMM d, h:mm a')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.extractedFromDoc && (
                      <Badge variant="outline" className="text-xs mt-2">
                        <FileText className="w-3 h-3 mr-1" />
                        From Document
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm">Hearing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                <span className="text-sm">Meeting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-sm">Deadline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                <span className="text-sm">Appointment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-sm">Visit</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={(slotInfo) => handleNewEvent(slotInfo)}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day', 'agenda']}
                  style={{ height: '100%' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewEvent ? 'Add New Event' : 'Event Details'}
            </DialogTitle>
            <DialogDescription>
              {isNewEvent ? 'Create a new calendar event' : 'View and edit event details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={eventForm.title || ''}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Court hearing, CPS meeting, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select
                  value={eventForm.type}
                  onValueChange={(value: any) => setEventForm({ ...eventForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hearing">Hearing</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={eventForm.status}
                  onValueChange={(value: any) => setEventForm({ ...eventForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Date & Time *</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={eventForm.start ? format(eventForm.start, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setEventForm({ ...eventForm, start: new Date(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">End Date & Time *</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={eventForm.end ? format(eventForm.end, "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setEventForm({ ...eventForm, end: new Date(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventForm.location || ''}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Courthouse, CPS office, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description || ''}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Event details, notes, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder">Reminder (minutes before)</Label>
              <Select
                value={String(eventForm.reminder)}
                onValueChange={(value) => setEventForm({ ...eventForm, reminder: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                  <SelectItem value="2880">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isNewEvent && selectedEvent?.extractedFromDoc && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">This event was extracted from a document</p>
                    {selectedEvent.relatedDocId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Related Document ID: {selectedEvent.relatedDocId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {!isNewEvent && (
              <Button
                variant="destructive"
                onClick={handleDeleteEvent}
              >
                Delete Event
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>
              {isNewEvent ? 'Create Event' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}