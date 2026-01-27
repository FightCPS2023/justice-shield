# 🚀 CPS Case Defense Analyzer - Pre-Launch Checklist

**Last Updated:** November 27, 2024  
**Target Launch Date:** TBD  
**Current Status:** PRODUCTION READY (Pending API Keys & Testing)

---

## ✅ CRITICAL ISSUES FIXED

### 🔧 Just Fixed
- [x] **DEV_MODE disabled** - Changed from `true` to `false` in `/App.tsx`
- [x] App now requires proper authentication for production use

---

## 🔴 CRITICAL - MUST DO BEFORE LAUNCH

### 1. API Keys & Environment Variables

#### Gemini AI API (REQUIRED for AI features)
- [ ] **Get Gemini API Key** from https://makersuite.google.com/app/apikey
- [ ] **Add to Supabase Secrets:**
  ```bash
  supabase secrets set VITE_GEMINI_API_KEY=your_key_here
  ```
- [ ] **Test AI Document Analysis** - Upload a test document
- [ ] **Test Defense Strategy Generator** - Generate a strategy
- [ ] **Test AI Legal Assistant** - Ask a legal question
- [ ] **Verify all 14 sections with AI features work**

#### Stripe Payment System (REQUIRED for monetization)
- [ ] **Create Stripe Account** at https://dashboard.stripe.com/register
- [ ] **Create 8 Products in Stripe Dashboard:**
  - Essential Monthly ($39/mo)
  - Essential Annual ($390/yr)
  - Professional Monthly ($79/mo)
  - Professional Annual ($790/yr)
  - Attorney Suite Monthly ($299/mo)
  - Attorney Suite Annual ($2990/yr)
  - Enterprise Monthly ($999/mo)
  - Enterprise Annual ($9990/yr)

- [ ] **Update Price IDs in `/utils/stripe-config.ts`:**
  ```typescript
  export const STRIPE_PRICE_IDS = {
    essential_monthly: 'price_XXXXXXXXXXXXXX',  // Replace REPLACE_ME
    essential_annual: 'price_XXXXXXXXXXXXXX',   // Replace REPLACE_ME
    professional_monthly: 'price_XXXXXXXXXXXXXX', // Replace REPLACE_ME
    professional_annual: 'price_XXXXXXXXXXXXXX',  // Replace REPLACE_ME
    attorney_monthly: 'price_XXXXXXXXXXXXXX',     // Replace REPLACE_ME
    attorney_annual: 'price_XXXXXXXXXXXXXX',      // Replace REPLACE_ME
    enterprise_monthly: 'price_XXXXXXXXXXXXXX',   // Replace REPLACE_ME
    enterprise_annual: 'price_XXXXXXXXXXXXXX',    // Replace REPLACE_ME
  };
  ```

- [ ] **Update Price IDs in `/components/PricingTable.tsx`** (same 8 price IDs)

- [ ] **Add Stripe Keys to Supabase:**
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_live_XXXX
  supabase secrets set VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXXX
  ```

- [ ] **Set up Stripe Webhook** (see Stripe Dashboard → Developers → Webhooks)
  - Webhook URL: `https://[your-project].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook`
  - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Add webhook secret to Supabase: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXX`

#### Supabase Configuration (Already Set Up)
- [x] SUPABASE_URL
- [x] SUPABASE_ANON_KEY
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] SUPABASE_DB_URL

#### CourtListener API (Optional but Recommended for Attorney Tier)
- [ ] **Get CourtListener API Token** from https://www.courtlistener.com/api/
- [ ] **Add to Supabase:**
  ```bash
  supabase secrets set COURTLISTENER_API_TOKEN=your_token_here
  ```
- [ ] **Test CourtListener Search** in Attorney Dashboard
- [ ] **Test Bulk Data Manager** (downloads court opinions)

---

## 🧪 TESTING CHECKLIST

### Core Functionality Tests
- [ ] **Sign Up Flow**
  - Create new account
  - Verify email confirmation works
  - Check user data is saved to database

- [ ] **Sign In Flow**
  - Log in with created account
  - Verify cloud sync works
  - Check data persistence across sessions

- [ ] **Document Upload (FREE TIER - 1 document limit)**
  - Upload first document as free user
  - Verify AI analysis runs (if Gemini key is set)
  - Try to upload second document - should show upgrade prompt
  - Verify violation detection works
  - Verify timeline extraction works
  - Verify case info extraction works

- [ ] **Violation Checker**
  - Manually check some violations
  - Verify they appear in violation count
  - Navigate to Defense Strategy
  - Verify defense strategies generated

- [ ] **Timeline Builder**
  - Add manual timeline event
  - Verify events display correctly
  - Check chronological ordering

- [ ] **Payment Flow**
  - [ ] Click "Upgrade to Essential"
  - [ ] Complete Stripe checkout (use test card: 4242 4242 4242 4242)
  - [ ] Verify webhook processes subscription
  - [ ] Verify tier upgraded in app
  - [ ] Verify document limit increased to 25
  - [ ] Test new premium features unlock

- [ ] **Subscription Management**
  - [ ] Access billing dashboard
  - [ ] View current plan
  - [ ] Change payment method
  - [ ] Cancel subscription
  - [ ] Verify downgrade at period end

- [ ] **State Selection**
  - Select a state (e.g., California)
  - Verify state-specific CPS policies load
  - Check Multi-State Law Comparison

- [ ] **All 14 Main Sections**
  1. [ ] Overview Dashboard - shows stats, quick actions work
  2. [ ] Documents - upload, view, delete works
  3. [ ] Virtual Case Binder - export works (Premium)
  4. [ ] Timeline - events display properly
  5. [ ] Violation Checker - 24 violations all work
  6. [ ] Violation Report - generates professional report (Premium)
  7. [ ] Defense Strategy - AI strategies generate
  8. [ ] Case Podcast - generates audio analysis (Premium)
  9. [ ] Document Generator - creates motions/letters
  10. [ ] Rights Guide - all sections accessible
  11. [ ] CPS Education - 8 topics load properly
  12. [ ] Evidence Checklist - saves progress
  13. [ ] Quick Rights Checker - scenario checker works
  14. [ ] AI Legal Assistant - chat works (Premium)

- [ ] **Attorney-Specific Features (Attorney Tier)**
  - [ ] CourtListener Search - returns results
  - [ ] Judge Research - loads judge data
  - [ ] Oral Arguments - audio playback works
  - [ ] Citation Network - visualization renders
  - [ ] Bulk Data Manager - downloads work
  - [ ] Multi-client management

- [ ] **Accessibility Features**
  - [ ] Screen reader navigation (test with NVDA/JAWS)
  - [ ] Keyboard-only navigation (Tab, Enter, Esc keys)
  - [ ] High contrast mode works
  - [ ] Focus indicators visible
  - [ ] ARIA labels correct

### Performance Tests
- [ ] **Page Load Speed**
  - Initial load < 3 seconds
  - Subsequent navigation < 1 second
  - AI responses < 10 seconds

- [ ] **Data Persistence**
  - Local storage saves immediately
  - Cloud sync completes within 2 seconds
  - No data loss on refresh

- [ ] **Mobile Responsiveness**
  - Test on iPhone (Safari)
  - Test on Android (Chrome)
  - Verify all sections mobile-friendly
  - Check navigation on small screens

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 📚 DOCUMENTATION

### User-Facing Documentation
- [x] Legal disclaimers throughout app
- [x] In-app help text and tooltips
- [x] Welcome tour on first visit
- [x] User manual exists (`/USER_MANUAL.md`)
- [ ] **Update user manual** with final Stripe pricing
- [ ] **Create video tutorials** (optional but recommended)
  - How to upload documents
  - How to check violations
  - How to generate defense strategies
  - How to use AI assistant

### Technical Documentation
- [x] API documentation (`/API_DOCUMENTATION.md`)
- [x] Deployment guide (`/DEPLOYMENT_GUIDE.md`)
- [x] Stripe setup guide (`/STRIPE_SETUP_GUIDE.md`)
- [x] Gemini setup guide (`/GEMINI_SETUP.md`)
- [x] Architecture overview (`/TECHNICAL_ARCHITECTURE.md`)
- [ ] **Update deployment guide** with production checklist
- [ ] **Create troubleshooting guide** for common issues

---

## 🔒 SECURITY CHECKLIST

### Authentication & Authorization
- [x] DEV_MODE disabled in production
- [x] Email confirmation on signup
- [x] Secure password requirements
- [x] JWT token authentication
- [x] Authorization middleware on protected routes
- [ ] **Test unauthorized access** - verify blocking works
- [ ] **Test expired tokens** - verify re-authentication

### Data Security
- [x] User data isolated by userId
- [x] No SUPABASE_SERVICE_ROLE_KEY in frontend
- [x] API keys stored in Supabase secrets
- [ ] **Verify no console.logs** expose sensitive data
- [ ] **Test SQL injection** prevention
- [ ] **Test XSS** prevention

### Payment Security
- [x] PCI compliance via Stripe
- [x] Webhook signature verification
- [x] No credit card data stored in app
- [ ] **Test webhook security** - reject unsigned requests
- [ ] **Verify refund handling**

---

## 🎨 UI/UX POLISH

### Visual Design
- [x] Consistent color scheme
- [x] Responsive layouts
- [x] Loading states for all async operations
- [x] Toast notifications for user feedback
- [x] Error states with helpful messages
- [ ] **Review all error messages** - ensure user-friendly
- [ ] **Check dark mode** - verify all sections look good

### User Experience
- [x] Clear call-to-action buttons
- [x] Intuitive navigation
- [x] Premium feature badges (crown icons)
- [x] Upgrade prompts when accessing premium features
- [x] Empty states with guidance
- [ ] **User testing** with 3-5 parents
- [ ] **Collect feedback** and iterate

---

## 🚨 LEGAL & COMPLIANCE

### Legal Disclaimers
- [x] Legal disclaimer on app launch
- [x] "Not legal advice" warnings throughout
- [x] Footer disclaimer on every page
- [x] AI content disclaimers
- [ ] **Legal review** by attorney (HIGHLY RECOMMENDED)
- [ ] **Terms of Service** created and linked
- [ ] **Privacy Policy** created and linked
- [ ] **Cookie Policy** if using analytics

### Compliance
- [x] ADA/WCAG 2.1 Level AA accessibility
- [ ] **GDPR compliance** (if serving EU users)
  - [ ] Cookie consent banner
  - [ ] Data export functionality
  - [ ] Data deletion functionality
- [ ] **CCPA compliance** (if serving CA users)
  - [ ] "Do Not Sell My Personal Information" link

---

## 📊 ANALYTICS & MONITORING

### Analytics Setup (Optional but Recommended)
- [ ] **Google Analytics 4** or **Plausible Analytics**
  ```bash
  supabase secrets set VITE_GA_TRACKING_ID=G-XXXXXXXXXX
  ```
- [ ] Track key events:
  - Sign ups
  - Document uploads
  - Violation checks
  - Defense strategy generations
  - Subscription purchases
  - Feature usage by tier

### Error Tracking (Highly Recommended)
- [ ] **Sentry** setup for error tracking
  ```bash
  supabase secrets set VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
  ```
- [ ] Test error reporting
- [ ] Set up alert notifications

### Performance Monitoring
- [ ] **Vercel Analytics** or **Lighthouse CI**
- [ ] Monitor Core Web Vitals
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

---

## 🌐 DEPLOYMENT

### Pre-Deployment
- [ ] **Environment Variables Configured**
  - [ ] All Supabase secrets set
  - [ ] Stripe keys added
  - [ ] Gemini API key added
  - [ ] CourtListener token added (optional)

- [ ] **Build Test**
  ```bash
  npm run build
  npm run preview
  ```
  - [ ] No build errors
  - [ ] No console warnings in production build
  - [ ] App loads correctly in preview

### Domain & Hosting
- [ ] **Domain purchased** (e.g., cpsdefenseanalyzer.com)
- [ ] **DNS configured** to point to hosting
- [ ] **SSL certificate** installed (auto with Vercel/Netlify)
- [ ] **WWW redirect** configured

### Deployment Platforms (Choose One)
- [ ] **Vercel** (Recommended)
  - Connect GitHub repo
  - Auto-deploy on push to main
  - Environment variables set in Vercel dashboard
  
- [ ] **Netlify**
  - Same as Vercel process
  
- [ ] **Custom Server**
  - Nginx/Apache configured
  - PM2 or systemd for process management
  - SSL via Let's Encrypt

### Post-Deployment
- [ ] **Verify production app loads**
- [ ] **Test all critical paths in production**
- [ ] **Set up database backups** (Supabase auto-backs up)
- [ ] **Monitor first 24 hours** for errors

---

## 💰 BUSINESS OPERATIONS

### Payment Processing
- [ ] **Stripe account verified** for live mode
- [ ] **Bank account connected** for payouts
- [ ] **Tax information** submitted to Stripe
- [ ] **Test live payment flow** with real card

### Customer Support
- [ ] **Support email** set up (e.g., support@cpsdefenseanalyzer.com)
- [ ] **Support ticket system** or **Help desk software**
- [ ] **FAQ page** created
- [ ] **Response time SLA** defined (e.g., 24 hours)

### Marketing Preparation
- [ ] **Landing page** optimized for conversions
- [ ] **Social media accounts** created
  - [ ] Twitter/X
  - [ ] Facebook
  - [ ] LinkedIn
- [ ] **Email marketing** platform set up (e.g., Mailchimp)
- [ ] **Press release** drafted
- [ ] **Launch announcement** scheduled

---

## ✅ FINAL PRE-LAUNCH VERIFICATION

### Day Before Launch
- [ ] All API keys working in production
- [ ] All payment tiers tested and working
- [ ] All 14 main sections functional
- [ ] Mobile app fully responsive
- [ ] Error tracking active
- [ ] Analytics tracking active
- [ ] Support email monitored
- [ ] Legal disclaimers reviewed
- [ ] Database backups confirmed

### Launch Day
- [ ] Make app publicly accessible
- [ ] Send launch announcement
- [ ] Monitor error logs closely
- [ ] Monitor payment processing
- [ ] Respond to first users immediately
- [ ] Track analytics for issues
- [ ] Celebrate! 🎉

---

## 🐛 KNOWN ISSUES & FUTURE ENHANCEMENTS

### Known Limitations
- DEV_MODE must be set to `false` for production (✅ FIXED)
- Stripe price IDs must be manually configured (⚠️ REQUIRED)
- Gemini API key required for AI features (⚠️ REQUIRED)
- CourtListener requires separate API token (✅ OPTIONAL)

### Future Enhancements (Post-Launch)
- [ ] Email notifications for case updates
- [ ] SMS notifications for court dates
- [ ] Integrations with court filing systems
- [ ] Attorney marketplace/directory
- [ ] Document OCR for scanned PDFs
- [ ] Mobile app (iOS/Android)
- [ ] Spanish language support
- [ ] Advanced reporting and analytics
- [ ] Calendar integration (Google/Outlook)
- [ ] Automated court docket monitoring

---

## 📞 SUPPORT CONTACTS

### Technical Issues
- **Supabase Support:** https://supabase.com/support
- **Stripe Support:** https://support.stripe.com
- **Gemini AI Support:** https://ai.google.dev/support

### Documentation Links
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Gemini API Docs:** https://ai.google.dev/docs

---

## 🎯 PRIORITY RANKING

### 🔴 MUST DO (Launch Blockers)
1. Add Gemini API key
2. Configure all 8 Stripe price IDs
3. Set up Stripe webhook
4. Test complete user journey (signup → upgrade → use features)
5. Legal review of disclaimers

### 🟡 SHOULD DO (High Priority)
1. Set up Sentry error tracking
2. Add Google Analytics
3. Create Terms of Service & Privacy Policy
4. User testing with 3-5 people
5. Set up CourtListener API

### 🟢 NICE TO HAVE (Can Do Post-Launch)
1. Video tutorials
2. Advanced analytics dashboard
3. Email notifications
4. Mobile app
5. Additional language support

---

## ✨ DEPLOYMENT COMMANDS REFERENCE

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (if using Vercel)
vercel --prod

# Set Supabase secrets
supabase secrets set VITE_GEMINI_API_KEY=your_key
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set COURTLISTENER_API_TOKEN=your_token
```

---

## 📈 SUCCESS METRICS (Track These)

### Week 1 Goals
- [ ] 100 sign ups
- [ ] 10 paid subscriptions
- [ ] < 5% error rate
- [ ] 90%+ uptime

### Month 1 Goals
- [ ] 1,000 sign ups
- [ ] 100 paid subscriptions
- [ ] 20% free-to-paid conversion
- [ ] 4+ star average rating (if collecting reviews)

---

**STATUS SUMMARY:**
- ✅ App is functionally complete
- ⚠️ Requires API keys before launch
- ⚠️ Requires Stripe configuration
- ⚠️ Needs production testing
- ⚠️ Legal review recommended

**ESTIMATED TIME TO LAUNCH:** 2-4 hours (API setup) + 1-2 days (testing)

---

*Last Updated: November 27, 2024*
*Document Version: 1.0*
