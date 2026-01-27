# 📅 CALENDAR INTEGRATION GUIDE

## Quick Start - Add Calendar to Your App

### Option 1: Add as Main Section (Recommended)

In your `App.tsx`, add the Calendar section to your main sections array:

```typescript
import { CalendarView } from './components/CalendarView';
import { Calendar } from 'lucide-react';

// In your sections array:
const sections = [
  // ... your existing sections
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    description: 'Manage hearings, deadlines, and appointments',
    component: <CalendarView caseId={currentCaseId} />,
    badge: 'NEW',
  },
  // ... rest of sections
];
```

### Option 2: Add to Navigation

```typescript
// In your navigation items:
<NavigationItem
  icon={<Calendar className="w-5 h-5" />}
  label="Calendar"
  onClick={() => setActiveSection('calendar')}
  active={activeSection === 'calendar'}
  badge="NEW"
/>
```

### Option 3: Dashboard Widget

Create a mini calendar widget for your dashboard:

```typescript
import { CalendarView } from './components/CalendarView';

function DashboardCalendarWidget() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Show next 3 events */}
        <div className="space-y-2">
          {upcomingEvents.slice(0, 3).map(event => (
            <div key={event.id} className="p-2 border rounded">
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(event.start, 'MMM d, h:mm a')}
              </p>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setActiveSection('calendar')}
        >
          View Full Calendar
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Required Dependencies

Add these to your project (they should auto-install when imported):

```json
{
  "react-big-calendar": "^1.8.5",
  "date-fns": "^2.30.0"
}
```

---

## CSS Import

The calendar requires its CSS. Add to your main App.tsx or index.tsx:

```typescript
import 'react-big-calendar/lib/css/react-big-calendar.css';
```

Or add custom styles in your globals.css:

```css
/* Calendar customization */
.rbc-calendar {
  font-family: inherit;
}

.rbc-header {
  padding: 10px;
  font-weight: 600;
}

.rbc-event {
  padding: 2px 5px;
  border-radius: 4px;
}

.rbc-today {
  background-color: var(--primary-50);
}
```

---

## Testing the Calendar

### 1. Create a Test Event

```typescript
// Test with sample data
const testEvent = {
  title: 'Court Hearing - Test',
  start: new Date(2024, 11, 15, 10, 0), // Dec 15, 2024 at 10:00 AM
  end: new Date(2024, 11, 15, 11, 30),   // Dec 15, 2024 at 11:30 AM
  type: 'hearing',
  location: 'County Courthouse',
  description: 'Test hearing event',
  status: 'upcoming',
};
```

### 2. Test AI Extraction

Upload a test document with content:

```
Case Hearing scheduled for December 20, 2024 at 10:00 AM
Filing deadline: December 15, 2024
CPS Meeting on January 10, 2025
```

Then click "Extract from Docs" to see events created automatically.

### 3. Test Export

1. Add a few events
2. Click "Export"
3. Download the .ics file
4. Import to Google Calendar or Apple Calendar

---

## Feature Gating Example

```typescript
// In your CalendarView component or wrapper
import { useSubscription } from '../contexts/SubscriptionContext';

function CalendarSection() {
  const { isProfessional, tier } = useSubscription();

  if (tier === 'free') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar (Limited)</CardTitle>
          <CardDescription>
            Upgrade to Essential for full calendar features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Free users can add up to 3 events
          </p>
          <Button onClick={() => navigate('/pricing')}>
            Upgrade to Essential - $39/mo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <CalendarView caseId={currentCaseId} />;
}
```

---

## API Configuration

The calendar automatically uses your Supabase configuration. Ensure these are set:

```typescript
// In /utils/supabase/info.tsx (should already exist)
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

The calendar API endpoints are:
- Base: `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/calendar`

---

## Google Calendar Setup (Production)

### Step 1: Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials

### Step 2: Configure OAuth

```typescript
// Add to your environment variables
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://yourapp.com/auth/google/callback
```

### Step 3: Update Backend

In `/supabase/functions/server/calendar.tsx`, update the OAuth URL generation:

```typescript
app.get("/google/auth", async (c) => {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar');
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline`;
  
  return c.json({ authUrl });
});
```

---

## Customization Options

### Change Event Colors

```typescript
// In CalendarView.tsx, update eventStyleGetter:
const eventStyleGetter = (event: CalendarEvent) => {
  const colors: Record<string, string> = {
    hearing: '#your-color',
    meeting: '#your-color',
    deadline: '#your-color',
    // ... etc
  };
  
  return {
    style: {
      backgroundColor: colors[event.type] || '#6b7280',
      // ... other styles
    },
  };
};
```

### Add Custom Event Types

```typescript
// Update the type definition:
type: 'hearing' | 'meeting' | 'deadline' | 'appointment' | 'visit' | 'deposition' | 'mediation' | 'other';

// Add to the select options in the event dialog:
<SelectItem value="deposition">Deposition</SelectItem>
<SelectItem value="mediation">Mediation</SelectItem>
```

### Change Default View

```typescript
// In CalendarView.tsx, update initial state:
const [view, setView] = useState<View>('week'); // or 'day', 'agenda'
```

---

## Troubleshooting

### Issue: Calendar not showing

**Solution:**
1. Check CSS import: `import 'react-big-calendar/lib/css/react-big-calendar.css';`
2. Verify date-fns is installed
3. Check browser console for errors

### Issue: Events not saving

**Solution:**
1. Check Supabase backend is running
2. Verify API URL in calendar-api.ts
3. Check browser Network tab for failed requests
4. Ensure calendar routes are mounted in index.tsx

### Issue: AI extraction not working

**Solution:**
1. Verify Professional plan or higher
2. Check documents have clear date formats
3. Upload documents first, then extract
4. Check backend logs for extraction errors

### Issue: Google Calendar sync failing

**Solution:**
1. Verify OAuth credentials are set
2. Check redirect URI matches Google Console
3. Ensure Professional plan subscription
4. Try disconnecting and reconnecting

---

## Mobile Considerations

### Recommended Views for Mobile

```typescript
// Detect mobile and change default view
const [view, setView] = useState<View>(
  window.innerWidth < 768 ? 'day' : 'month'
);

// Update on resize
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 768 && view === 'month') {
      setView('day');
    }
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [view]);
```

### Touch-Friendly Event Creation

```typescript
// Enable touch events for mobile
<Calendar
  // ... other props
  selectable
  longPressThreshold={100} // ms for long press
  onSelectSlot={(slotInfo) => {
    // Mobile-friendly event creation
    if ('ontouchstart' in window) {
      // Show simplified dialog for mobile
      handleMobileEventCreation(slotInfo);
    } else {
      handleNewEvent(slotInfo);
    }
  }}
/>
```

---

## Performance Optimization

### Lazy Load Events

```typescript
// Only load events for visible date range
const loadEvents = async () => {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);
  
  const events = await calendarApi.getEvents(caseId, {
    startDate,
    endDate,
  });
  
  setEvents(events);
};
```

### Cache Events

```typescript
// Use React Query or SWR for caching
import { useQuery } from 'react-query';

const { data: events } = useQuery(
  ['calendar-events', caseId],
  () => calendarApi.getEvents(caseId),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

---

## Analytics & Tracking

### Track Calendar Usage

```typescript
// Track when users create events
const handleSaveEvent = async () => {
  // ... save logic
  
  // Track event
  analytics.track('Calendar Event Created', {
    eventType: eventForm.type,
    extractedFromDoc: eventForm.extractedFromDoc,
    tier: tier,
  });
};

// Track AI extraction usage
const extractDatesFromDocs = async () => {
  analytics.track('Calendar AI Extraction Used', {
    tier: tier,
    documentCount: documents.length,
  });
  
  // ... extraction logic
};
```

---

## Success Metrics

Track these KPIs for the calendar feature:

```
✅ Calendar Views per User
✅ Events Created per User
✅ AI Extraction Usage Rate
✅ Google Calendar Connection Rate
✅ Export Usage
✅ Upgrade Rate (Free → Paid for calendar features)
```

---

## Next Steps

1. **Add to Navigation**: Integrate into your main app navigation
2. **Test Thoroughly**: Create, edit, delete events
3. **Configure Google OAuth**: For production sync
4. **Add Analytics**: Track usage and engagement
5. **Gather Feedback**: From beta users
6. **Iterate**: Add requested features

---

**The calendar system is now ready to integrate into your app!** 🎉

Users will love having a dedicated place to track all their important case dates, deadlines, and appointments. The AI extraction feature is a game-changer for busy parents dealing with stacks of CPS documents.

Good luck with your launch! 🚀
