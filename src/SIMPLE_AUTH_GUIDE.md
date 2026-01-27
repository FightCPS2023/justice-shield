# Simple Auth System Guide

## The Problem: 401 Error

When you try to sign up, you get a **401 Unauthorized** error. This means:
- The Supabase Edge Function is not properly deployed
- OR environment variables are missing
- OR the function can't access Supabase Auth

## The Solution: Hybrid Storage

The app now works in TWO modes:

### Mode 1: LOCAL STORAGE (Default)
- Works immediately
- No login needed
- Data saved to browser
- No server required

### Mode 2: CLOUD SYNC (Optional)
- Requires login
- Data saved to Supabase
- Access from any device
- Only works if server is configured

## How It Works Now

1. **App starts** → Loads data from localStorage
2. **User can use all features** → Documents, violations, defense strategies, etc.
3. **Data auto-saves** → To localStorage every time something changes
4. **Optional:** User clicks "Enable Cloud Sync" → Creates account → Data backed up to cloud

## Key Files

### Frontend
- `/App.tsx` - Main app with storage logic
- `/components/AuthForm.tsx` - Login/signup form
- `/utils/api.tsx` - API calls to server

### Backend
- `/supabase/functions/server/index.tsx` - Hono server with auth routes

## API Routes

```
POST /make-server-a24eaa40/auth/signup
Body: { email, password, name }
Returns: { success, userId }

POST /make-server-a24eaa40/auth/login
Body: { email, password }
Returns: { success, accessToken, userId }

POST /make-server-a24eaa40/data/save
Headers: Authorization: Bearer {token}
Body: { documents, timelineEvents, caseDetails, violations }
Returns: { success }

GET /make-server-a24eaa40/data/load
Headers: Authorization: Bearer {token}
Returns: { success, data }
```

## Testing Steps

### Test Local Storage (Should Work)
1. Open app
2. Add a document
3. Refresh page
4. Document should still be there

### Test Cloud Sync (May Fail with 401)
1. Click "Enable Cloud Sync"
2. Fill out signup form
3. If 401 error → Server not configured (app continues in local mode)
4. If success → Login works and data syncs to cloud

## Why 401 Happens

The edge function needs:
1. To be deployed to Supabase
2. Environment variables set:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Auth service enabled in Supabase dashboard

## What Happens If 401 Occurs

1. User sees error message
2. App automatically falls back to local storage
3. User can continue working
4. All features still work
5. Shows "Local Storage" indicator in header

## Benefits of This Approach

✅ App works immediately
✅ No blocking errors
✅ Users can try before creating account
✅ Progressive enhancement
✅ Data never lost

## Storage Indicators

In the app header, you'll see:
- 🖥️ "Local Storage" = Data on this device only
- ☁️ "Cloud Sync Active" = Data backed up to cloud

## Clean Code Files

I've created simplified versions:
- `/utils/api-clean.tsx` - 76 lines, easy to read
- `/supabase/functions/server/index-clean.tsx` - 169 lines, easy to read

These have:
- No extra logging
- No complex error handling
- Simple, clear structure
- Easy to copy and modify

## Summary

**Current Status:** App works in local storage mode
**Cloud Sync:** Optional, requires server configuration
**User Experience:** Seamless, no blocking errors
**Data Safety:** Always saved, never lost
