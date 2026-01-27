# Developer Mode

## Overview
The app includes a Developer Mode that bypasses authentication and subscription restrictions while building and testing the application.

## Current Status
**DEV_MODE is ENABLED** - All features are unlocked for development.

## What Dev Mode Does

### 1. **Bypasses Authentication**
- Automatically logs you in with a dev token
- No need to sign up or sign in during development
- Skip the auth form entirely

### 2. **Unlocks Premium Features**
- Unlimited document uploads (no 3-document limit)
- Unlimited document generation (no 5-document limit)
- Unlimited podcast generation (no 1-podcast limit)
- All premium AI features enabled
- No upgrade prompts

### 3. **Visual Indicator**
- Yellow "DEV MODE: All Features Unlocked" badge in header
- Clear indication you're in development mode

## How to Toggle Dev Mode

### Enable Dev Mode (Default)
Located in `/App.tsx` line 7:
```typescript
const DEV_MODE = true;
```

Located in `/contexts/SubscriptionContext.tsx` line 31:
```typescript
const DEV_MODE = true;
```

### Disable Dev Mode (Production)
Before deploying to production, set to `false` in both files:
```typescript
const DEV_MODE = false;
```

## Files Modified
- `/App.tsx` - Bypasses authentication
- `/contexts/SubscriptionContext.tsx` - Sets premium tier by default
- `/components/AuthForm.tsx` - Multi-provider auth ready
- `/components/SubscriptionModal.tsx` - Upgrade UI ready ($20/month)

## For Production
1. Set `DEV_MODE = false` in both files
2. Users will need to authenticate
3. Free tier limits will be enforced
4. Subscription system will be active

## Testing Subscription Features
To test the subscription limits while in dev:
1. Temporarily set `DEV_MODE = false`
2. Refresh the app
3. Test the free tier (3 uploads, 5 generations, 1 podcast)
4. Test the upgrade modal
5. Set `DEV_MODE = true` when done

---

**Note:** Remember to disable dev mode before production deployment!