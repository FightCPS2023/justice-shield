# 📊 Analytics & Monitoring Setup Guide

**The CPS Punisher** - Google Analytics & Sentry Configuration

---

## Overview

The CPS Punisher now includes comprehensive analytics and error tracking:

### ✅ Google Analytics 4 (GA4)
- **Purpose:** Track user behavior, feature usage, and engagement
- **Features:** Page views, custom events, user properties, conversion tracking
- **Privacy:** Respects user privacy, no PII tracking

### ✅ Sentry Error Tracking
- **Purpose:** Monitor crashes, errors, and performance issues
- **Features:** Real-time error alerts, performance monitoring, session replay
- **Privacy:** Automatically scrubs sensitive data

---

## 🎯 Google Analytics Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Click **Create Property**
4. Enter property details:
   - **Property name:** The CPS Punisher
   - **Reporting time zone:** Your timezone
   - **Currency:** USD
5. Click **Next**
6. Fill in business information
7. Click **Create**

### Step 2: Get Your Measurement ID

1. In your new property, go to **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter your website URL
4. Click **Create stream**
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Add to Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Measurement ID:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Restart your development server

### Step 4: Verify Installation

1. Open your app in browser
2. Open Google Analytics
3. Go to **Reports** → **Realtime**
4. You should see your session appear within 30 seconds

---

## 🐛 Sentry Error Tracking Setup

### Step 1: Create Sentry Account

1. Go to [Sentry.io](https://sentry.io/)
2. Sign up for a free account (up to 5,000 errors/month free)
3. Choose **React** as your platform

### Step 2: Create Project

1. Click **Create Project**
2. Select platform: **React**
3. Set alert frequency (recommended: **Alert on every new issue**)
4. Name your project: **cps-punisher**
5. Click **Create Project**

### Step 3: Get Your DSN

1. After project creation, you'll see installation instructions
2. Copy the **DSN** (format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
3. Or find it later in **Settings** → **Projects** → **cps-punisher** → **Client Keys (DSN)**

### Step 4: Add to Environment Variables

Add to your `.env` file:

```env
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_APP_VERSION=1.0.0
```

### Step 5: Test Error Tracking

Add a test error to your app:

```typescript
// Temporary test button
<Button onClick={() => {
  throw new Error("Test Sentry Error");
}}>
  Test Sentry
</Button>
```

Click the button and check Sentry dashboard for the error.

---

## 📋 Environment Variables Reference

Create a `.env` file with these values:

```env
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_APP_VERSION=1.0.0

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
VITE_STRIPE_PRICE_ESSENTIAL=price_xxxxxxxxxxxx
VITE_STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxx
VITE_STRIPE_PRICE_ATTORNEY=price_xxxxxxxxxxxx
VITE_STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxx
```

---

## 🎨 Custom Events Being Tracked

### Document Management
- `document_uploaded` - When user uploads a document
- `document_analyzed` - When AI analyzes a document
- `file_uploaded_to_binder` - Virtual Case Binder uploads
- `audio_recorded` - Audio recording created

### Violations & Defense
- `violation_checked` - Violation checkbox toggled
- `strategy_generated` - Defense strategy created
- `strategy_exported` - Strategy exported/downloaded

### Timeline & Case Management
- `timeline_event_added` - Timeline event created

### Legal Research
- `case_law_searched` - CourtListener search performed
- `case_law_viewed` - Case law document opened
- `rights_guide_viewed` - Rights guide section viewed

### Subscriptions
- `subscription_viewed` - Pricing page viewed
- `subscription_upgraded` - Successful upgrade
  - Includes: `from_tier`, `to_tier`, `value`

### Authentication
- `sign_up` - New user registration
- `sign_in` - User login

### Engagement
- `tab_switched` - User navigates between tabs
- `help_modal_opened` - User opens help/info

### AI Usage
- `ai_analysis_run` - AI analysis executed
  - Includes: `subscription_tier`, `tokens_used`

---

## 🔧 Tracked Errors (Sentry)

### Automatic Error Capture
- JavaScript runtime errors
- React component errors (via ErrorBoundary)
- Unhandled promise rejections
- Network request failures

### Custom Error Tracking
- `document_upload_failed` - File upload errors
- `document_analysis_failed` - AI analysis errors
- `ai_request_failed` - OpenAI API errors
- `case_law_search_failed` - CourtListener errors
- `payment_failed` - Stripe payment errors
- `auth_failed` - Authentication errors
- `file_storage_failed` - File storage errors
- `critical_error` - Critical application errors

---

## 🔒 Privacy & Data Protection

### Google Analytics Privacy

**What We Track:**
- Page views and navigation
- Feature usage (buttons clicked, forms submitted)
- Time spent on features
- User flow through app
- Subscription tier (anonymized)

**What We DON'T Track:**
- Personal names
- Email addresses
- Case details
- Document content
- Payment information
- IP addresses (anonymized)

**Privacy Controls:**
```typescript
// User can opt out
setTrackingConsent(false);

// All cookies are secure and SameSite
cookie_flags: 'SameSite=None;Secure'
```

### Sentry Privacy

**Automatic PII Scrubbing:**
```typescript
beforeSend(event) {
  // Remove sensitive data
  delete event.request.cookies;
  delete event.user.email;
  delete event.user.ip_address;
  
  // Scrub query params
  event.request.url = url.replace(
    /([?&])(email|password|token)=[^&]*/gi,
    '$1$2=REDACTED'
  );
  
  return event;
}
```

**Ignored Errors:**
- Browser extensions (MetaMask, etc.)
- Third-party script errors
- Network errors outside our control

---

## 📊 Accessing Your Data

### Google Analytics Dashboard

**Real-time Monitoring:**
1. Go to **Reports** → **Realtime**
2. See live users and current page views

**User Behavior:**
1. **Engagement** → **Events** - See all tracked events
2. **Engagement** → **Pages and screens** - Popular pages
3. **User** → **User attributes** - Subscription tiers

**Custom Reports:**
1. Go to **Explore**
2. Create custom reports with:
   - Event parameters
   - User properties
   - Conversion funnels

### Sentry Dashboard

**Error Overview:**
1. Go to **Issues** - See all errors
2. Click an issue for details:
   - Stack trace
   - Breadcrumbs (event trail)
   - User context
   - Device/browser info

**Performance:**
1. Go to **Performance** - Transaction times
2. See slowest pages and operations

**Alerts:**
1. Go to **Alerts** - Configure notifications
2. Get emails/Slack for new errors

---

## 🎯 Key Metrics to Monitor

### User Engagement
- **Active users** - Daily/weekly/monthly
- **Session duration** - Time spent in app
- **Feature adoption** - Which tools are used most
- **Subscription conversions** - Free → Paid upgrades

### Feature Usage
- **Document uploads** - Files processed per day
- **AI analyses** - Analysis requests per user
- **Case law searches** - Research activity
- **Strategy generations** - Defense strategies created

### Error Rates
- **Error frequency** - Errors per session
- **Error severity** - Critical vs. minor issues
- **Affected users** - Number of users impacted
- **Resolution time** - Time to fix bugs

### Performance
- **Page load times** - Speed metrics
- **API response times** - Backend performance
- **Transaction success rate** - Failed operations

---

## 🚀 Production Deployment

### Checklist Before Launch

- [ ] Google Analytics configured with production domain
- [ ] Sentry configured with `environment: 'production'`
- [ ] All `.env` variables set in hosting platform
- [ ] Privacy policy updated with tracking disclosure
- [ ] Cookie consent banner added (if required by jurisdiction)
- [ ] Test all tracking in production
- [ ] Set up Sentry alerts for critical errors
- [ ] Configure GA4 conversions for key actions

### Environment-Specific Configuration

The app automatically adjusts based on environment:

**Development:**
```typescript
// Sentry disabled
enabled: import.meta.env.MODE === 'production'

// More verbose logging
console.log('✅ Google Analytics initialized')
```

**Production:**
```typescript
// Sentry enabled
// GA tracking active
// Privacy controls enforced
```

---

## 🛠️ Troubleshooting

### Google Analytics Not Working

**Problem:** No data showing in GA dashboard

**Solutions:**
1. Check `.env` has correct `VITE_GA_MEASUREMENT_ID`
2. Restart dev server after adding `.env`
3. Check browser console for `✅ Google Analytics initialized`
4. Disable ad blockers (they block GA scripts)
5. Wait 24 hours for data to fully process
6. Check Realtime reports (updates faster)

**Problem:** Events not tracked

**Solution:**
```typescript
// Add console.log to verify
trackCPSEvent.documentUploaded('report', 'pdf');
console.log('Event tracked'); // Should appear in console
```

### Sentry Not Working

**Problem:** Errors not appearing in Sentry

**Solutions:**
1. Check `.env` has correct `VITE_SENTRY_DSN`
2. Verify Sentry is enabled: `enabled: true` in production
3. Check browser console for `✅ Sentry error tracking initialized`
4. Trigger a test error manually
5. Check Sentry's Inbound Filters (might be blocking)

**Problem:** Too many errors

**Solution:**
```typescript
// Adjust sample rate in sentry.ts
tracesSampleRate: 0.05, // 5% instead of 10%
```

### Environment Variables Not Loading

**Problem:** `import.meta.env.VITE_*` returns undefined

**Solutions:**
1. Ensure `.env` file is in project root
2. All variables must start with `VITE_`
3. Restart dev server after editing `.env`
4. Check `.env` syntax (no quotes usually needed)
5. Don't commit `.env` to git (use `.env.example`)

---

## 📚 Additional Resources

### Google Analytics
- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Event Tracking Guide](https://support.google.com/analytics/answer/9267735)
- [Privacy & GDPR](https://support.google.com/analytics/answer/9019185)

### Sentry
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [PII Scrubbing](https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/)

### Privacy & Compliance
- [GDPR Compliance](https://gdpr.eu/cookies/)
- [CCPA Requirements](https://oag.ca.gov/privacy/ccpa)
- [Cookie Consent](https://cookieconsent.orestbida.com/)

---

## 🎓 Best Practices

### DO ✅
- Track meaningful events that help improve UX
- Set up alerts for critical errors
- Review analytics weekly
- Fix high-frequency errors first
- Use custom dashboards for key metrics
- Document what you're tracking
- Test tracking in staging before production

### DON'T ❌
- Track sensitive case information
- Log personal identifying information
- Ignore error patterns
- Over-track every button click
- Forget to set up alerts
- Leave test data in production
- Track without user consent (where required)

---

## 🔄 Regular Maintenance

### Weekly Tasks
- [ ] Review new errors in Sentry
- [ ] Check GA4 for usage anomalies
- [ ] Verify tracking is working correctly
- [ ] Review slow transactions

### Monthly Tasks
- [ ] Analyze feature adoption trends
- [ ] Review error resolution rates
- [ ] Optimize slow page loads
- [ ] Update event tracking as needed
- [ ] Check subscription conversion rates

### Quarterly Tasks
- [ ] Review and update custom events
- [ ] Audit privacy compliance
- [ ] Analyze user retention
- [ ] Plan feature improvements based on data
- [ ] Update this documentation

---

## 📞 Support

### Getting Help

**Google Analytics:**
- [Google Analytics Help Center](https://support.google.com/analytics/)
- [GA4 Community Forum](https://www.en.advertisercommunity.com/t5/Google-Analytics/ct-p/Google_Analytics)

**Sentry:**
- [Sentry Discord](https://discord.gg/sentry)
- [Sentry Support](https://sentry.io/support/)
- [Documentation](https://docs.sentry.io/)

---

## ✅ Setup Complete Checklist

- [ ] Google Analytics property created
- [ ] GA Measurement ID added to `.env`
- [ ] GA tracking verified in Realtime reports
- [ ] Sentry project created
- [ ] Sentry DSN added to `.env`
- [ ] Test error captured in Sentry
- [ ] All environment variables configured
- [ ] Privacy policy updated
- [ ] Error alerts configured
- [ ] Team has access to dashboards
- [ ] Documentation reviewed by team
- [ ] Tracking tested in production

---

**Setup Date:** November 28, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Production

---

*For questions about this setup, refer to the development team or create an issue in the project repository.*
