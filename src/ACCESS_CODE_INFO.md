# Special Access Code System

## Overview
The CPS Punisher app now includes a **Special Access Code** system that allows certain users to unlock full Enterprise-level access to all premium features without requiring a paid subscription.

## How It Works

### For Users:
1. Click the **"Enter Access Code"** button in the top navigation bar (next to the theme toggle)
2. Enter the special access code when prompted
3. All premium features are immediately unlocked
4. Access persists across sessions (stored in localStorage)

### Special Access Code:
```
CPSPUNISHER2024
```

**You can change this code in:** `/contexts/SubscriptionContext.tsx` (line 25)

## What Gets Unlocked

When a user enters the special access code, they get:

✅ **All Enterprise Features:**
- Unlimited document uploads
- Unlimited violation checks
- 2,000 AI analysis credits (maximum tier)
- Federal Civil Rights Litigation tools
- Multi-client management
- AI Paralegal access
- Virtual Case Binder
- Community Hub & Attorney Directory
- All premium document generators
- Case law research tools
- Multi-state law database
- And ALL other premium features

## Technical Implementation

### Files Modified:
1. **`/contexts/SubscriptionContext.tsx`**
   - Added `hasSpecialAccess` state
   - Added `checkAccessCode()` function
   - Added `removeSpecialAccess()` function
   - Special access overrides all tier restrictions

2. **`/components/SpecialAccessDialog.tsx`** (NEW)
   - Dialog component for entering access code
   - Shows current access status
   - Allows removing special access

3. **`/App.tsx`**
   - Imported and added SpecialAccessDialog to header

### How to Change the Access Code:
Edit `/contexts/SubscriptionContext.tsx` line 25:

```typescript
const SPECIAL_ACCESS_CODE = 'YOUR_NEW_CODE_HERE';
```

### How to Add Multiple Codes:
Replace the single code with an array:

```typescript
const SPECIAL_ACCESS_CODES = [
  'CPSPUNISHER2024',
  'ATTORNEY_ACCESS',
  'BETA_TESTER',
  'VIP_USER'
];

const checkAccessCode = (code: string): boolean => {
  if (SPECIAL_ACCESS_CODES.includes(code)) {
    setHasSpecialAccess(true);
    localStorage.setItem('cps_special_access', 'granted');
    return true;
  }
  return false;
};
```

## Normal Subscription Tiers (Still Active)

The special access code system works **alongside** the normal subscription tiers:

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 1 document, 5 violations, basic features |
| Essential | $39 | 25 documents, unlimited violations, community |
| Professional | $79 | Unlimited docs, AI analysis, case law |
| Attorney | $299 | Multi-client, AI paralegal, federal tools |
| Enterprise | $999 | White label, API access, priority support |

Users can still upgrade to paid tiers via the PremiumUpgrade component.

## Security Notes

⚠️ **Important:**
- The access code is stored in the frontend code
- This is NOT secure for production if you need real access control
- Anyone with code access can view the access code in the source
- This is designed for beta testing, demos, or trusted user groups
- For real security, implement backend authentication

## Use Cases

Perfect for:
- Beta testers
- VIP users
- Demo accounts
- Partner organizations
- Attorneys you're working with
- Family/friends who need access
- Conference demonstrations
- Court presentations

---

**Copyright © 2024 DARREN GUAY. All Rights Reserved.**
