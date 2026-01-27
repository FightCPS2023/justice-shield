# CPS Case Defense Analyzer - Authentication System Overview

## Current Status: Hybrid Local/Cloud Storage

The app now uses a **hybrid storage approach** that prioritizes local storage with optional cloud sync. This means the app works immediately without requiring authentication, and cloud sync is available when needed.

---

## Architecture

### 1. **Storage Modes**

#### Local Storage Mode (Default)
- ✅ Works immediately without login
- ✅ All data saved to browser's localStorage
- ✅ No server dependencies
- ✅ Instant save/load
- ⚠️ Data only available on current device
- ⚠️ Clearing browser data will delete everything

#### Cloud Sync Mode (Optional)
- ✅ Multi-device access
- ✅ Automatic cloud backup
- ✅ Encrypted database storage
- ✅ Persistent across browsers
- ⚠️ Requires Supabase backend to be functional
- ⚠️ Falls back to local mode if server unavailable

---

## File Structure

### Frontend Files

**`/App.tsx`** (Main Application)
- Manages authentication state
- Handles storage mode (local vs cloud)
- Auto-saves data to localStorage
- Optionally syncs to cloud when authenticated
- Shows storage status indicator in header

**`/components/AuthForm.tsx`** (Login/Signup Form)
- Email/password authentication
- Form validation
- Error handling with detailed messages
- "Test Server Connection" button
- Auto-login after signup

**`/utils/api.tsx`** (API Helper)
- Centralized API calls
- Error handling and logging
- Network error detection
- Endpoints:
  - `POST /auth/signup` - Create new user
  - `POST /auth/login` - Authenticate user
  - `POST /data/save` - Save case data (requires auth)
  - `GET /data/load` - Load case data (requires auth)

### Backend Files

**`/supabase/functions/server/index.tsx`** (Edge Function)
- Hono web server
- Supabase Auth integration
- User data endpoints with authentication
- CORS enabled for all routes
- Environment-based configuration

**`/supabase/functions/server/kv_store.tsx`** (Protected - Don't Edit)
- Key-value database utilities
- Provides get, set, mget, mset, del, mdel, getByPrefix functions

---

## How Authentication Works

### Sign Up Flow
1. User enters email, password, name
2. Frontend validates (password length, matching passwords, etc.)
3. API call to `/auth/signup`
4. Server creates user via Supabase Auth with `email_confirm: true`
5. User automatically logged in
6. Local data uploaded to cloud

### Login Flow
1. User enters email, password
2. API call to `/auth/login`
3. Server authenticates via Supabase Auth
4. Returns `accessToken` and `userId`
5. Token saved to localStorage
6. Cloud data synced down

### Data Sync Flow
1. User makes changes (add document, check violation, etc.)
2. Data saved to localStorage immediately
3. If authenticated: debounced cloud save (1 second delay)
4. If cloud save fails: continues with local storage only

### Logout Flow
1. User clicks logout button
2. Auth token removed from localStorage
3. Switches to local storage mode
4. User can continue working with local data

---

## API Endpoints

### Public Endpoints (No Auth Required)

```
GET /make-server-a24eaa40/health
Response: { status: "ok" }
```

```
GET /make-server-a24eaa40/debug
Response: {
  hasSupabaseUrl: boolean,
  hasAnonKey: boolean,
  hasServiceRoleKey: boolean,
  supabaseUrlPrefix: string
}
```

```
POST /make-server-a24eaa40/auth/signup
Body: { email, password, name }
Response: { success, userId, message }
```

```
POST /make-server-a24eaa40/auth/login
Body: { email, password }
Response: { success, accessToken, userId, user }
```

### Protected Endpoints (Require Auth Token)

```
POST /make-server-a24eaa40/data/save
Headers: Authorization: Bearer <accessToken>
Body: { documents, timelineEvents, caseDetails, violations }
Response: { success, message }
```

```
GET /make-server-a24eaa40/data/load
Headers: Authorization: Bearer <accessToken>
Response: { success, data: { documents, timelineEvents, caseDetails, violations } }
```

---

## Environment Variables

### Required Supabase Environment Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (backend only)

These are automatically configured by Figma Make and available in:
- `/utils/supabase/info.tsx` (for frontend)
- `Deno.env.get()` (for backend)

---

## Storage Structure

### localStorage Keys
- `cpsDefenseData` - All case data (documents, timeline, violations, etc.)
- `cpsAuth` - Authentication state (accessToken, userId)

### Cloud Storage (KV Store)
- `user_data:{userId}` - User-specific case data

### Data Schema
```typescript
{
  documents: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    type: string;
  }>,
  timelineEvents: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
  }>,
  caseDetails: {
    caseNumber: string;
    county: string;
    dateOpened: string;
    caseworker: string;
    attorney: string;
  },
  violations: {
    fourthAmendment: boolean;
    fourteenthAmendment: boolean;
    firstAmendment: boolean;
    noMirandaRights: boolean;
    // ... (24 violation types total)
  },
  lastSaved: string; // ISO timestamp
}
```

---

## Error Handling

### Network Errors
- Detected by `fetch` failures
- User-friendly messages displayed
- Automatic fallback to local storage

### Authentication Errors
- 401 errors for invalid/expired tokens
- Helpful error messages shown in UI
- Login form shows exact error from server

### Server Errors
- Logged to console with context
- Toast notifications for user feedback
- App continues functioning with local storage

---

## Testing the System

### Test Server Connection
1. Click "Test Server Connection" on login page
2. Checks if `/health` endpoint responds
3. Shows toast notification with result

### Test Signup
1. Enter email, password (6+ chars), name
2. Watch console for detailed logs
3. Should auto-login after success

### Test Login
1. Use previously created credentials
2. Should load cloud data if available
3. Falls back to local data if cloud fails

### Test Cloud Sync
1. Login and add some data
2. Wait 1 second for auto-save
3. Open app in different browser
4. Login with same credentials
5. Data should be synced

---

## Troubleshooting

### "Server error 401"
**Cause:** Edge function not deployed or environment variables missing
**Solution:** App automatically falls back to local storage mode

### "Failed to sign up"
**Cause:** Network issue, server down, or duplicate email
**Solution:** Check console logs for detailed error message

### "Cannot connect to server"
**Cause:** Network connectivity or server unavailable
**Solution:** Use local storage mode (default behavior)

### Data not syncing
**Cause:** Not authenticated or server issues
**Solution:** Check storage indicator in header (should show "Cloud Sync Active")

---

## Security Features

### Password Requirements
- Minimum 6 characters
- Validated on both frontend and backend

### Token-Based Authentication
- JWT tokens from Supabase Auth
- Stored in localStorage (cleared on logout)
- Sent in Authorization header for protected routes

### Data Isolation
- Each user's data stored with unique key: `user_data:{userId}`
- Backend validates token on every protected request
- No cross-user data access possible

### Environment Security
- Service role key only available to backend
- Frontend uses public anon key
- CORS properly configured

---

## Future Enhancements (Not Yet Implemented)

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social login (Google, GitHub)
- [ ] Account deletion
- [ ] Export data feature
- [ ] Multi-user collaboration
- [ ] Encrypted local storage

---

## Key Differences from Original Plan

### What Changed
- **Local-first approach** instead of cloud-only
- **Optional authentication** instead of required
- **Graceful fallbacks** for server errors
- **Hybrid storage** for best of both worlds

### Why It's Better
- ✅ App works immediately without setup
- ✅ No blocking server errors
- ✅ Users can try app before creating account
- ✅ Data never lost even if server down
- ✅ Progressive enhancement model

---

## Code Examples

### Enable Cloud Sync Button (App.tsx)
```typescript
{!auth.accessToken && (
  <Button variant="outline" size="sm" onClick={() => {
    // Show AuthForm modal
  }}>
    Enable Cloud Sync
  </Button>
)}
```

### Storage Mode Indicator (App.tsx)
```typescript
{!useLocalStorage && auth.accessToken ? (
  <>
    <Cloud className="w-4 h-4 text-green-600" />
    <span>Cloud Sync Active</span>
  </>
) : (
  <>
    <HardDrive className="w-4 h-4 text-blue-600" />
    <span>Local Storage</span>
  </>
)}
```

### API Call with Error Handling (utils/api.tsx)
```typescript
async signup(email: string, password: string, name: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Server error: ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to server.');
    }
    throw error;
  }
}
```

---

## Summary

The authentication system is **fully functional** with a smart hybrid approach:
- Works immediately without login (local storage)
- Optional cloud sync for multi-device access
- Graceful fallbacks if server unavailable
- Secure token-based authentication
- Auto-save with debouncing
- Clear status indicators

**Current Status:** ✅ Working in local mode, cloud sync available when server is configured
