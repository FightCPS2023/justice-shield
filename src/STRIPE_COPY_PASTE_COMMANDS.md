# 📋 STRIPE SETUP - COPY & PASTE COMMANDS

**Everything you need to copy and paste - no typing required!**

---

## 🔐 ENVIRONMENT VARIABLES FOR SUPABASE

When you get to Supabase → Settings → Edge Functions → Secrets, add these 3 secrets:

### Secret 1: STRIPE_PUBLISHABLE_KEY
```
Name: STRIPE_PUBLISHABLE_KEY
Value: [Paste your pk_test_... key here]
```

### Secret 2: STRIPE_SECRET_KEY
```
Name: STRIPE_SECRET_KEY
Value: [Paste your sk_test_... key here]
```

### Secret 3: STRIPE_WEBHOOK_SECRET
```
Name: STRIPE_WEBHOOK_SECRET
Value: [Paste your whsec_... key here]
```

---

## 🛍️ PRODUCT DETAILS FOR STRIPE DASHBOARD

Copy and paste these into Stripe when creating products:

### PRODUCT 1: ESSENTIAL PLAN

**Product Name:**
```
CPS Punisher - Essential Plan
```

**Description:**
```
Perfect for parents starting their CPS defense. Includes 25 document uploads, basic AI analysis, motion templates, and community forum access.
```

**Monthly Price:**
```
Amount: 39.00
Currency: USD
Billing: Recurring monthly
```

**Annual Price:**
```
Amount: 390.00
Currency: USD
Billing: Recurring yearly
```

---

### PRODUCT 2: PROFESSIONAL PLAN

**Product Name:**
```
CPS Punisher - Professional Plan
```

**Description:**
```
Complete legal defense toolkit with unlimited document uploads, advanced AI analysis, case law research, podcast generator, and priority support. 7-day free trial included!
```

**Monthly Price:**
```
Amount: 79.00
Currency: USD
Billing: Recurring monthly
Trial: 7 days
```

**Annual Price:**
```
Amount: 790.00
Currency: USD
Billing: Recurring yearly
```

---

### PRODUCT 3: ATTORNEY SUITE

**Product Name:**
```
CPS Punisher - Attorney Suite
```

**Description:**
```
Professional litigation tools for attorneys. Includes multi-client management (10 clients), CourtListener API, AI Paralegal (500 requests/day), Federal §1983 tools, and priority phone support.
```

**Monthly Price:**
```
Amount: 299.00
Currency: USD
Billing: Recurring monthly
```

**Annual Price:**
```
Amount: 2990.00
Currency: USD
Billing: Recurring yearly
```

---

### PRODUCT 4: ENTERPRISE PLAN

**Product Name:**
```
CPS Punisher - Enterprise Plan
```

**Description:**
```
Complete platform for law firms and organizations. Unlimited clients, 5 team users, 2,000 AI requests/day, custom integrations, dedicated support, training, custom branding, and white-label portal.
```

**Monthly Price:**
```
Amount: 999.00
Currency: USD
Billing: Recurring monthly
```

**Annual Price:**
```
Amount: 9990.00
Currency: USD
Billing: Recurring yearly
```

---

## 🔔 WEBHOOK CONFIGURATION

### Webhook Endpoint URL Format:
```
https://[YOUR-PROJECT-ID].supabase.co/functions/v1/server/make-server-a24eaa40/stripe/webhook
```

**Replace `[YOUR-PROJECT-ID]` with your actual Supabase project ID**

Example:
```
https://rdrpwrwjqayhbsyxqaej.supabase.co/functions/v1/server/make-server-a24eaa40/stripe/webhook
```

### Events to Select (check all 6):
```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

---

## 💳 TEST CARD DETAILS

### Successful Payment Test Card:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### Payment Declined Test Card:
```
Card Number: 4000 0000 0000 0002
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### 3D Secure Test Card:
```
Card Number: 4000 0025 0000 3155
Expiry: 12/34
CVC: 123
ZIP: 12345
```

---

## 📊 CURRENT PRICE IDS IN YOUR CODE

**These are already configured in `/utils/stripe-config.ts`:**

```typescript
// Monthly Prices
essential_monthly:     'price_1SZChVLer5ye2GBih8C2Cn8U'
professional_monthly:  'price_1SZDlfLer5ye2GBidSCef53l'
attorney_monthly:      'price_1SZDnkLer5ye2GBisGCQtncE'
enterprise_monthly:    'price_1SZDpeLer5ye2GBi9gT16zyW'

// Annual Prices
essential_annual:      'price_1SZDqXLer5ye2GBi27cH4jsS'
professional_annual:   'price_1SZDwnLer5ye2GBiqEl9SAba'
attorney_annual:       'price_1SZDsSLer5ye2GBieHTotLLO'
enterprise_annual:     'price_1SZDueLer5ye2GBiRifVwAeC'
```

**After creating products in Stripe, verify these IDs match. If not, let me know and I'll update the code.**

---

## 🔗 USEFUL LINKS

### Stripe Dashboard Links:
```
Account Registration: https://dashboard.stripe.com/register
API Keys (Test): https://dashboard.stripe.com/test/apikeys
API Keys (Live): https://dashboard.stripe.com/apikeys
Products (Test): https://dashboard.stripe.com/test/products
Products (Live): https://dashboard.stripe.com/products
Webhooks (Test): https://dashboard.stripe.com/test/webhooks
Webhooks (Live): https://dashboard.stripe.com/webhooks
Payments (Test): https://dashboard.stripe.com/test/payments
Subscriptions (Test): https://dashboard.stripe.com/test/subscriptions
```

### Stripe Documentation:
```
Getting Started: https://stripe.com/docs/payments
Testing: https://stripe.com/docs/testing
Webhooks: https://stripe.com/docs/webhooks
Subscriptions: https://stripe.com/docs/billing/subscriptions
Test Cards: https://stripe.com/docs/testing#cards
```

### Supabase Links:
```
Dashboard: https://supabase.com/dashboard
Edge Functions: [Your Project] → Settings → Edge Functions
Secrets: [Your Project] → Settings → Edge Functions → Secrets
Table Editor: [Your Project] → Table Editor
```

---

## 📝 STEP-BY-STEP COPY-PASTE WORKFLOW

### STEP 1: Get Stripe API Keys
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)
4. Save both keys in a text file temporarily

### STEP 2: Add Keys to Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Navigate to: Settings → Edge Functions → Secrets
4. Add Secret #1:
   ```
   Name: STRIPE_PUBLISHABLE_KEY
   Value: [Paste pk_test_ key]
   ```
5. Add Secret #2:
   ```
   Name: STRIPE_SECRET_KEY
   Value: [Paste sk_test_ key]
   ```

### STEP 3: Create Products
1. Go to: https://dashboard.stripe.com/test/products
2. Click "+ Add product"
3. For **Essential Plan**:
   - Copy name from above ↑
   - Copy description from above ↑
   - Add monthly price: $39
   - Add annual price: $390
   - Save product
   - **Copy both Price IDs**
4. Repeat for Professional, Attorney, Enterprise

### STEP 4: Setup Webhook
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Paste your webhook URL:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/functions/v1/server/make-server-a24eaa40/stripe/webhook
   ```
4. Select the 6 events listed above
5. Click "Add endpoint"
6. Click on your new webhook
7. Reveal and copy the signing secret (starts with `whsec_`)
8. Add to Supabase secrets:
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: [Paste whsec_ key]
   ```

### STEP 5: Test Payment
1. Open your app
2. Go to pricing page
3. Click "Select Plan" on any tier
4. Use test card:
   ```
   4242 4242 4242 4242
   12/34
   123
   12345
   ```
5. Complete checkout
6. Verify in Stripe Dashboard → Payments
7. Check webhook received in Webhooks → [Your webhook] → Events

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

### Stripe Dashboard Checks:
```
□ Products created (4 products with 8 total prices)
□ Webhook endpoint created and active
□ Test payment appears in Payments section
□ Subscription appears in Subscriptions section
□ Webhook events showing in webhook Events tab
```

### Supabase Dashboard Checks:
```
□ All 3 environment variables added to Edge Functions secrets
□ Check Table Editor → user_subscriptions for test subscription
□ Check user metadata updated with subscription tier
```

### App Checks:
```
□ Pricing page displays all 5 tiers correctly
□ Clicking "Select Plan" opens checkout
□ Checkout redirects to Stripe
□ After payment, redirects back to app
□ User's tier updates in app
□ Features unlock based on tier
```

---

## 🚨 TROUBLESHOOTING QUICK FIXES

### Error: "Invalid API key"
**Fix:** 
1. Go to Supabase → Settings → Edge Functions → Secrets
2. Verify `STRIPE_SECRET_KEY` value matches your Stripe dashboard
3. Make sure there's no extra spaces or quotes

### Error: "No such price"
**Fix:**
1. Go to Stripe Dashboard → Products
2. Copy the actual Price IDs
3. Tell me - I'll update `/utils/stripe-config.ts`

### Error: "Webhook signature verification failed"
**Fix:**
1. Go to Stripe Dashboard → Webhooks → [Your webhook]
2. Copy the signing secret again
3. Update `STRIPE_WEBHOOK_SECRET` in Supabase

### Webhook not receiving events
**Fix:**
1. Verify webhook URL format is correct
2. Check your Supabase project URL
3. Make sure endpoint ends with `/stripe/webhook`
4. Verify all 6 events are selected

### Payment succeeds but tier doesn't update
**Fix:**
1. Check Stripe Dashboard → Webhooks → [Your webhook] → Events
2. Look for errors in event processing
3. Check Supabase Edge Function logs
4. Verify `user_id` is in metadata

---

## 💰 PRICING QUICK REFERENCE

```
FREE:         $0/month   - 1 doc, basic features
ESSENTIAL:    $39/month  - 25 docs, AI analysis
PROFESSIONAL: $79/month  - Unlimited docs, research (7-day trial)
ATTORNEY:     $299/month - Multi-client, §1983 tools
ENTERPRISE:   $999/month - Unlimited everything, team

Annual: Save 17% on all paid plans
```

---

## 🎯 ESTIMATED TIME PER STEP

```
Create Stripe account:    5 minutes
Get API keys:             2 minutes
Add to Supabase:          2 minutes
Create 4 products:        20 minutes
Setup webhook:            5 minutes
Test payment:             5 minutes
────────────────────────────────────
TOTAL:                    39 minutes
```

---

## 🎉 SUCCESS!

When you complete all steps, you'll have:
- ✅ Live payment processing
- ✅ Automatic subscription management
- ✅ Usage-based feature gating
- ✅ 5-tier pricing system
- ✅ 7-day trial on Professional
- ✅ Customer billing portal
- ✅ Webhook automation

**Ready to start making money! 💸**

---

*Last Updated: January 25, 2026*  
*All copy-paste content verified and ready to use*