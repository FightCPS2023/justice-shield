# 🚀 STRIPE COMPLETE SETUP CHECKLIST

**Everything you need to do for Stripe to function completely in The CPS Punisher**

---

## 📊 CURRENT STATUS

✅ **Already Complete:**
- Frontend Stripe integration code written
- Checkout flow built (`/components/CheckoutPage.tsx`)
- Tier selection UI complete (`/components/TierSelection.tsx`)
- Stripe config file created (`/utils/stripe-config.ts`)
- Supabase backend endpoint ready (`/supabase/functions/make-server-a24eaa40/stripe/webhook.ts`)
- Price IDs configured in code

❌ **Still Needed:**
- Stripe account creation
- Products & prices creation in Stripe dashboard
- API keys configuration
- Webhook endpoint setup
- Testing
- Go live

---

## 🎯 STEP-BY-STEP SETUP (30-45 MINUTES)

### **PHASE 1: CREATE STRIPE ACCOUNT** (5 minutes)

#### Step 1.1: Sign Up
1. Go to: **https://dashboard.stripe.com/register**
2. Enter your email address
3. Create a strong password
4. Click "Create account"

#### Step 1.2: Verify Email
1. Check your email inbox
2. Click verification link
3. Complete email verification

#### Step 1.3: Complete Business Profile
1. Business name: `The CPS Punisher` (or your legal business name)
2. Business type: Select appropriate type
3. Industry: `Legal Services` or `Software`
4. Country: Select your country
5. Tax ID: Enter if you have one (can skip for now)

**✅ Checkpoint:** You should now see the Stripe Dashboard

---

### **PHASE 2: GET YOUR API KEYS** (2 minutes)

#### Step 2.1: Access API Keys
1. Go to: **https://dashboard.stripe.com/test/apikeys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

#### Step 2.2: Copy Keys
1. Click "Reveal test key" for Secret key
2. Copy **Publishable key** → Save to notepad
3. Copy **Secret key** → Save to notepad

**⚠️ IMPORTANT:** Keep Secret key private! Never share it or commit to GitHub.

#### Step 2.3: Store Keys in Supabase
1. Go to your Supabase project: **https://supabase.com/dashboard**
2. Select your project
3. Go to: **Settings** → **Edge Functions** → **Secrets**
4. Add these secrets:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

**✅ Checkpoint:** API keys saved in Supabase

---

### **PHASE 3: CREATE PRODUCTS IN STRIPE** (15-20 minutes)

You need to create 4 products (Essential, Professional, Attorney, Enterprise).
Each product needs 2 prices (monthly and annual).

---

#### **PRODUCT 1: ESSENTIAL PLAN**

1. Go to: **https://dashboard.stripe.com/test/products**
2. Click **"+ Add product"**
3. Fill in:

```
Product Information:
- Name: CPS Punisher - Essential Plan
- Description: Perfect for parents starting their CPS defense. Includes 25 document uploads, basic AI analysis, motion templates, and community forum access.
- Image: Upload your logo (optional)

Pricing Information:
- Pricing model: Standard pricing
- Price: $39.00
- Billing period: Monthly
- Currency: USD
```

4. Click **"Add pricing"** to add annual price:

```
- Price: $390.00
- Billing period: Yearly
- Currency: USD
```

5. Click **"Save product"**

6. **COPY PRICE IDs:**
   - Click on the monthly price → Copy Price ID (e.g., `price_xxxxx`)
   - Click on the annual price → Copy Price ID (e.g., `price_xxxxx`)
   - Save both to notepad

**Expected Price IDs to match:**
```
Monthly: price_1SZChVLer5ye2GBih8C2Cn8U
Annual:  price_1SZDqXLer5ye2GBi27cH4jsS
```

---

#### **PRODUCT 2: PROFESSIONAL PLAN**

1. Click **"+ Add product"** again
2. Fill in:

```
Product Information:
- Name: CPS Punisher - Professional Plan
- Description: Complete legal defense toolkit with unlimited document uploads, advanced AI analysis, case law research, podcast generator, and priority support. 7-day free trial included!
- Image: Upload your logo (optional)

Monthly Price:
- Price: $79.00
- Billing period: Monthly
- Currency: USD
- Trial period: 7 days ✅ (Enable free trial)

Annual Price:
- Price: $790.00
- Billing period: Yearly
- Currency: USD
```

3. Click **"Save product"**
4. **COPY PRICE IDs** → Save to notepad

**Expected Price IDs to match:**
```
Monthly: price_1SZDlfLer5ye2GBidSCef53l
Annual:  price_1SZDwnLer5ye2GBiqEl9SAba
```

---

#### **PRODUCT 3: ATTORNEY SUITE**

1. Click **"+ Add product"**
2. Fill in:

```
Product Information:
- Name: CPS Punisher - Attorney Suite
- Description: Professional litigation tools for attorneys. Includes multi-client management (10 clients), CourtListener API, AI Paralegal (500 requests/day), Federal §1983 tools, and priority phone support.
- Image: Upload your logo (optional)

Monthly Price:
- Price: $299.00
- Billing period: Monthly
- Currency: USD

Annual Price:
- Price: $2,990.00
- Billing period: Yearly
- Currency: USD
```

3. Click **"Save product"**
4. **COPY PRICE IDs** → Save to notepad

**Expected Price IDs to match:**
```
Monthly: price_1SZDnkLer5ye2GBisGCQtncE
Annual:  price_1SZDsSLer5ye2GBieHTotLLO
```

---

#### **PRODUCT 4: ENTERPRISE PLAN**

1. Click **"+ Add product"**
2. Fill in:

```
Product Information:
- Name: CPS Punisher - Enterprise Plan
- Description: Complete platform for law firms and organizations. Unlimited clients, 5 team users, 2,000 AI requests/day, custom integrations, dedicated support, training, custom branding, and white-label portal.
- Image: Upload your logo (optional)

Monthly Price:
- Price: $999.00
- Billing period: Monthly
- Currency: USD

Annual Price:
- Price: $9,990.00
- Billing period: Yearly
- Currency: USD
```

3. Click **"Save product"**
4. **COPY PRICE IDs** → Save to notepad

**Expected Price IDs to match:**
```
Monthly: price_1SZDpeLer5ye2GBi9gT16zyW
Annual:  price_1SZDueLer5ye2GBiRifVwAeC
```

---

#### Step 3.5: Verify Price IDs

**⚠️ CRITICAL:** Your Price IDs in Stripe Dashboard MUST match the ones in `/utils/stripe-config.ts`

**Option A:** If they match → You're good to go! ✅

**Option B:** If they DON'T match → You need to update `/utils/stripe-config.ts` with your new Price IDs

**✅ Checkpoint:** All 4 products created with 8 total prices (4 monthly + 4 annual)

---

### **PHASE 4: CONFIGURE WEBHOOKS** (5 minutes)

Webhooks allow Stripe to notify your app when payments succeed/fail.

#### Step 4.1: Create Webhook Endpoint
1. Go to: **https://dashboard.stripe.com/test/webhooks**
2. Click **"+ Add endpoint"**

#### Step 4.2: Configure Endpoint
```
Endpoint URL:
https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook

Example:
https://abcdefghijklmnop.supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

**How to find your Supabase URL:**
1. Go to your Supabase project
2. Settings → API → Project URL
3. Copy the URL (it ends with `.supabase.co`)

#### Step 4.3: Select Events to Listen For

Click **"Select events"** and choose these:

```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
```

#### Step 4.4: Save Webhook
1. Click **"Add endpoint"**
2. You'll see your new webhook endpoint

#### Step 4.5: Get Webhook Signing Secret
1. Click on your webhook endpoint
2. Click **"Reveal"** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Go to Supabase → Settings → Edge Functions → Secrets
5. Add secret:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**✅ Checkpoint:** Webhook configured and secret saved

---

### **PHASE 5: TEST THE INTEGRATION** (5-10 minutes)

#### Step 5.1: Use Stripe Test Cards

Stripe provides test card numbers for testing:

**✅ Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**❌ Payment Declined:**
```
Card: 4000 0000 0000 0002
(Use to test payment failures)
```

**🔁 Requires Authentication (3D Secure):**
```
Card: 4000 0025 0000 3155
(Use to test 3D Secure flow)
```

Full list: **https://stripe.com/docs/testing**

#### Step 5.2: Test Checkout Flow
1. Open your app
2. Navigate to pricing page
3. Click "Upgrade" on Professional plan
4. Select monthly or annual
5. Enter test card: `4242 4242 4242 4242`
6. Complete checkout

#### Step 5.3: Verify in Stripe Dashboard
1. Go to: **https://dashboard.stripe.com/test/payments**
2. You should see your test payment
3. Go to: **https://dashboard.stripe.com/test/subscriptions**
4. You should see your test subscription

#### Step 5.4: Verify in Supabase
1. Go to Supabase → Table Editor → `user_subscriptions` table
2. You should see a new row with:
   - `stripe_subscription_id`
   - `stripe_customer_id`
   - `tier` (e.g., "professional")
   - `status` = "active"

#### Step 5.5: Test Webhook Events
1. Go to: **https://dashboard.stripe.com/test/webhooks**
2. Click on your webhook endpoint
3. Check "Events" tab → You should see events like:
   - `checkout.session.completed`
   - `customer.subscription.created`

**✅ Checkpoint:** Payment processed successfully and webhook received

---

### **PHASE 6: GO LIVE** (5 minutes)

⚠️ **Only do this when you're ready to accept real payments!**

#### Step 6.1: Activate Your Stripe Account
1. Go to: **https://dashboard.stripe.com/account/onboarding**
2. Complete account activation:
   - Business details
   - Bank account (for payouts)
   - Identity verification
   - Tax information

#### Step 6.2: Create Live Products
**Repeat PHASE 3** but in LIVE mode:
1. Toggle from "Test mode" to "Live mode" in dashboard
2. Create all 4 products again (Essential, Professional, Attorney, Enterprise)
3. Copy LIVE Price IDs

#### Step 6.3: Get Live API Keys
1. Go to: **https://dashboard.stripe.com/apikeys** (not test)
2. Copy LIVE Publishable key (starts with `pk_live_...`)
3. Copy LIVE Secret key (starts with `sk_live_...`)
4. Update Supabase secrets:

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
```

#### Step 6.4: Create Live Webhook
1. Go to: **https://dashboard.stripe.com/webhooks** (not test)
2. Add same endpoint URL
3. Select same events
4. Copy LIVE webhook secret
5. Update Supabase:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Step 6.5: Update Price IDs in Code
1. Update `/utils/stripe-config.ts` with LIVE Price IDs
2. Deploy your app

**✅ Checkpoint:** Live mode activated! You can now accept real payments! 💰

---

## 📋 FINAL VERIFICATION CHECKLIST

### **Stripe Account:**
- [ ] Stripe account created and verified
- [ ] Business profile completed
- [ ] Test mode configured
- [ ] Live mode activated (when ready)

### **Products & Pricing:**
- [ ] Essential plan created (monthly + annual)
- [ ] Professional plan created (monthly + annual)
- [ ] Attorney Suite created (monthly + annual)
- [ ] Enterprise plan created (monthly + annual)
- [ ] 7-day trial enabled on Professional monthly
- [ ] All Price IDs copied and saved

### **API Keys:**
- [ ] Test Publishable key copied
- [ ] Test Secret key copied
- [ ] Keys added to Supabase secrets
- [ ] Live keys obtained (when going live)

### **Webhooks:**
- [ ] Test webhook endpoint created
- [ ] All 6 events configured
- [ ] Webhook secret copied
- [ ] Secret added to Supabase
- [ ] Webhook tested and working

### **Testing:**
- [ ] Test card payment successful
- [ ] Subscription created in Stripe
- [ ] Subscription saved to Supabase
- [ ] Webhook events received
- [ ] User tier updated correctly
- [ ] Payment failure tested
- [ ] Subscription cancellation tested

### **Code Configuration:**
- [ ] Price IDs match in `/utils/stripe-config.ts`
- [ ] Supabase URL correct in webhook endpoint
- [ ] All environment variables set
- [ ] Frontend displaying correct prices

### **Going Live:**
- [ ] Account activation completed
- [ ] Bank account connected
- [ ] Live products created
- [ ] Live API keys configured
- [ ] Live webhook configured
- [ ] Production testing completed

---

## 🔧 YOUR SPECIFIC CONFIGURATION

### **Your Supabase Webhook URL:**
```
https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

**To find YOUR-PROJECT-ID:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy Project URL
4. Extract project ID (the part before `.supabase.co`)

### **Your Environment Variables (Supabase):**
```bash
# Test Mode (for development)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Live Mode (for production)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### **Your Current Price IDs (from code):**
```typescript
// These are in /utils/stripe-config.ts
essential_monthly:     'price_1SZChVLer5ye2GBih8C2Cn8U'
essential_annual:      'price_1SZDqXLer5ye2GBi27cH4jsS'
professional_monthly:  'price_1SZDlfLer5ye2GBidSCef53l'
professional_annual:   'price_1SZDwnLer5ye2GBiqEl9SAba'
attorney_monthly:      'price_1SZDnkLer5ye2GBisGCQtncE'
attorney_annual:       'price_1SZDsSLer5ye2GBieHTotLLO'
enterprise_monthly:    'price_1SZDpeLer5ye2GBi9gT16zyW'
enterprise_annual:     'price_1SZDueLer5ye2GBiRifVwAeC'
```

**⚠️ IMPORTANT:** These Price IDs suggest you already have products created in Stripe! 

**Verify this:**
1. Go to https://dashboard.stripe.com/test/products
2. Check if products exist
3. If YES → You're ahead of the game! Just verify Price IDs match
4. If NO → Create products and update Price IDs in `/utils/stripe-config.ts`

---

## 🆘 TROUBLESHOOTING

### **Problem: "No such price"**
**Solution:** Price IDs in code don't match Stripe dashboard
- Go to Stripe Dashboard → Products
- Copy correct Price IDs
- Update `/utils/stripe-config.ts`

### **Problem: "Webhook signature verification failed"**
**Solution:** Webhook secret is wrong
- Go to Stripe Dashboard → Webhooks
- Click your endpoint
- Copy signing secret
- Update `STRIPE_WEBHOOK_SECRET` in Supabase

### **Problem: "Invalid API key"**
**Solution:** API key not set or incorrect
- Verify keys in Supabase Edge Functions secrets
- Check for typos
- Make sure using test keys in test mode, live keys in live mode

### **Problem: Payment succeeds but subscription not created in database**
**Solution:** Webhook not working
- Check Stripe Dashboard → Webhooks → Events
- Verify webhook URL is correct
- Check Supabase Edge Function logs
- Verify `STRIPE_WEBHOOK_SECRET` is set

### **Problem: "Unable to connect to Stripe"**
**Solution:** Network or CORS issue
- Check if Stripe is down: https://status.stripe.com
- Verify frontend has correct Publishable key
- Check browser console for errors

---

## 📞 SUPPORT RESOURCES

### **Stripe Documentation:**
- Getting Started: https://stripe.com/docs/payments
- Testing: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks
- Subscriptions: https://stripe.com/docs/billing/subscriptions

### **Stripe Dashboard:**
- Test Mode: https://dashboard.stripe.com/test
- Live Mode: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks
- Products: https://dashboard.stripe.com/products
- Payments: https://dashboard.stripe.com/payments

### **Stripe Support:**
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com
- Status: https://status.stripe.com

---

## ⏱️ TIME ESTIMATE

**Total Setup Time: 30-45 minutes**

- Phase 1 (Account): 5 min
- Phase 2 (API Keys): 2 min
- Phase 3 (Products): 15-20 min
- Phase 4 (Webhooks): 5 min
- Phase 5 (Testing): 5-10 min
- Phase 6 (Go Live): 5 min (when ready)

---

## 🎯 QUICK START SUMMARY

**If you want to get started NOW (minimum viable setup):**

1. **Create Stripe account** (5 min)
2. **Get test API keys** and add to Supabase (2 min)
3. **Create 1 product** (Professional) with monthly price (3 min)
4. **Update Price ID** in `/utils/stripe-config.ts` (1 min)
5. **Test with test card** `4242 4242 4242 4242` (2 min)

**Total: 13 minutes to first working payment!**

Then you can add the other products later.

---

## ✅ YOU'RE READY!

Once you complete these phases, your Stripe integration will be **100% functional** and ready to accept payments!

**What happens when a user subscribes:**
1. ✅ User selects a tier and clicks "Upgrade"
2. ✅ Redirected to Stripe Checkout
3. ✅ Enters payment info and confirms
4. ✅ Stripe processes payment
5. ✅ Webhook fires → Your Supabase function receives event
6. ✅ Subscription saved to `user_subscriptions` table
7. ✅ User's tier updated
8. ✅ User redirected back to your app
9. ✅ User now has full access to their tier features!

**You're in control!** 🚀

---

*Last Updated: January 25, 2026*
*Estimated Setup Time: 30-45 minutes*
