# 🚀 STRIPE INTEGRATION GUIDE - The CPS Punisher

**Complete Step-by-Step Setup Instructions**

---

## ✅ CURRENT STATUS
Your app is **99% ready** for Stripe integration! The code is already in place. You just need to:
1. Create a Stripe account
2. Set up your products & prices
3. Add environment variables
4. Configure webhook

---

## 📋 STEP 1: CREATE STRIPE ACCOUNT

### 1.1 Sign Up
1. Go to: **https://dashboard.stripe.com/register**
2. Create your account with email
3. Verify your email address
4. Complete business information

### 1.2 Get API Keys
1. Go to: **https://dashboard.stripe.com/test/apikeys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to use in frontend
   - **Secret key** (starts with `sk_test_...`) - ⚠️ NEVER expose this publicly

3. **Copy both keys** - you'll need them in Step 3

> 💡 **TIP:** Start with TEST mode keys. Switch to LIVE mode when ready to accept real payments.

---

## 📦 STEP 2: CREATE PRODUCTS & PRICES IN STRIPE

You need to create 8 price IDs (4 tiers × 2 billing cycles):

### 2.1 Navigate to Products
1. Go to: **https://dashboard.stripe.com/test/products**
2. Click **"+ Create product"**

### 2.2 Create Each Plan

Create these 4 products:

#### **Product 1: Essential**
- **Name:** Essential Plan
- **Description:** Perfect for parents starting their defense
- **Pricing:**
  - Monthly: **$39.00** USD → Note the Price ID (e.g., `price_abc123...`)
  - Annual: **$390.00** USD → Note the Price ID
- **Billing Period:** Recurring
  - Monthly price: Set to "Monthly"
  - Annual price: Set to "Yearly"

#### **Product 2: Professional**
- **Name:** Professional Plan
- **Description:** Complete legal defense toolkit
- **Pricing:**
  - Monthly: **$79.00** USD → Note the Price ID
  - Annual: **$790.00** USD → Note the Price ID

#### **Product 3: Attorney Suite**
- **Name:** Attorney Suite
- **Description:** Professional tools for solo attorneys & legal aid
- **Pricing:**
  - Monthly: **$299.00** USD → Note the Price ID
  - Annual: **$2,990.00** USD → Note the Price ID

#### **Product 4: Enterprise**
- **Name:** Enterprise Plan
- **Description:** For law firms & legal aid organizations
- **Pricing:**
  - Monthly: **$999.00** USD → Note the Price ID
  - Annual: **$9,990.00** USD → Note the Price ID

### 2.3 Save All 8 Price IDs
After creating all products, you should have **8 Price IDs**. Keep them handy!

Example:
```
Essential Monthly: price_1ABC123xyz...
Essential Annual: price_1DEF456xyz...
Professional Monthly: price_1GHI789xyz...
Professional Annual: price_1JKL012xyz...
Attorney Monthly: price_1MNO345xyz...
Attorney Annual: price_1PQR678xyz...
Enterprise Monthly: price_1STU901xyz...
Enterprise Annual: price_1VWX234xyz...
```

---

## 🔐 STEP 3: ADD STRIPE KEYS TO SUPABASE

### 3.1 Open Supabase Dashboard
1. Go to your project: **https://supabase.com/dashboard**
2. Select your CPS Punisher project
3. Navigate to: **Settings → Edge Functions → Secrets**

### 3.2 Add Environment Variables
Click **"Add new secret"** for each of these:

**Variable 1:**
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your secret key from Step 1.2 (starts with `sk_test_...`)

**Variable 2:**
- **Name:** `STRIPE_PUBLISHABLE_KEY`
- **Value:** Your publishable key from Step 1.2 (starts with `pk_test_...`)

**Variable 3:** (You'll get this in Step 4)
- **Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** (Wait for Step 4.3)

---

## ⚙️ STEP 4: UPDATE PRICE IDS IN YOUR CODE

### 4.1 Open the Config File
Edit the file: `/utils/stripe-config.ts`

### 4.2 Replace Price IDs (Lines 16-25)
Replace `'price_..._REPLACE_ME'` with your actual Price IDs from Step 2.3:

```typescript
export const STRIPE_PRICE_IDS = {
  essential_monthly: 'price_1ABC123xyz...',      // ← Your actual ID
  essential_annual: 'price_1DEF456xyz...',       // ← Your actual ID
  professional_monthly: 'price_1GHI789xyz...',   // ← Your actual ID
  professional_annual: 'price_1JKL012xyz...',    // ← Your actual ID
  attorney_monthly: 'price_1MNO345xyz...',       // ← Your actual ID
  attorney_annual: 'price_1PQR678xyz...',        // ← Your actual ID
  enterprise_monthly: 'price_1STU901xyz...',     // ← Your actual ID
  enterprise_annual: 'price_1VWX234xyz...',      // ← Your actual ID
};
```

### 4.3 Save the File
That's it! Your pricing is now connected.

---

## 🪝 STEP 5: SET UP STRIPE WEBHOOKS

Webhooks allow Stripe to notify your app when subscriptions change.

### 5.1 Get Your Webhook URL
Your webhook URL is:
```
https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

**Find YOUR-PROJECT-ID:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "Project URL" (it's something like `abcdefgh.supabase.co`)
3. Your Project ID is the first part: `abcdefgh`

**Final webhook URL example:**
```
https://abcdefgh.supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

### 5.2 Create Webhook in Stripe
1. Go to: **https://dashboard.stripe.com/test/webhooks**
2. Click **"+ Add endpoint"**
3. Enter your webhook URL from 5.1
4. Click **"Select events"**
5. Choose these 5 events:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **"Add endpoint"**

### 5.3 Get Webhook Signing Secret
1. After creating the endpoint, click on it
2. Click **"Reveal"** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Go back to Supabase → Settings → Edge Functions → Secrets
5. Add a new secret:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** Your webhook signing secret

---

## 🧪 STEP 6: TEST YOUR INTEGRATION

### 6.1 Use Stripe Test Cards
Use these test card numbers in TEST mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**More test cards:** https://stripe.com/docs/testing#cards

### 6.2 Test the Flow
1. **Start your app**
2. **Navigate to Pricing** page
3. **Click "Upgrade" on any plan**
4. **Enter test card** details
5. **Complete checkout**
6. **Verify:**
   - You're redirected back to the app
   - Your subscription tier updates
   - Check Stripe Dashboard → Customers (you should see the test customer)

### 6.3 Test Webhook Events
1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select event type (e.g., `customer.subscription.created`)
4. Click **"Send test webhook"**
5. Verify response is `200 OK`

---

## 🚀 STEP 7: GO LIVE (When Ready)

### 7.1 Activate Your Stripe Account
1. Go to: **https://dashboard.stripe.com/account/onboarding**
2. Complete business verification
3. Add bank account for payouts
4. Submit for review

### 7.2 Switch to Live Mode
1. Toggle from **"Test mode"** to **"Live mode"** in Stripe Dashboard
2. Get your LIVE API keys:
   - Go to: **https://dashboard.stripe.com/apikeys**
   - Copy **live** publishable key (`pk_live_...`)
   - Copy **live** secret key (`sk_live_...`)

### 7.3 Create LIVE Products
Repeat Step 2 in LIVE mode to create your live products and prices.

### 7.4 Update Supabase Environment Variables
Replace test keys with live keys:
- `STRIPE_SECRET_KEY` → Your live secret key
- `STRIPE_PUBLISHABLE_KEY` → Your live publishable key

### 7.5 Create LIVE Webhook
Repeat Step 5 in LIVE mode to create a live webhook endpoint.

### 7.6 Update Price IDs
Update `/utils/stripe-config.ts` with your LIVE price IDs.

---

## 📊 WHAT'S ALREADY IMPLEMENTED

Your app already has these features ready:

✅ **Checkout Flow** (`/components/CheckoutPage.tsx`)
- Beautiful checkout UI
- Email collection
- Plan selection
- Stripe integration

✅ **Billing Dashboard** (`/components/BillingDashboard.tsx`)
- View current subscription
- Manage payment methods
- Cancel subscription
- Update billing info

✅ **Subscription Context** (`/contexts/SubscriptionContext.tsx`)
- Tier management
- Feature gating
- Usage tracking

✅ **Backend Server** (`/supabase/functions/server/stripe.tsx`)
- Create checkout sessions
- Create portal sessions
- Handle webhooks
- Subscription status API

✅ **Pricing Table** (`/components/PricingTable.tsx`)
- Beautiful pricing display
- All 5 tiers (Free, Essential, Professional, Attorney, Enterprise)
- Monthly/Annual toggle
- Feature comparison

---

## 🔍 TROUBLESHOOTING

### Issue: "No price ID found"
**Solution:** Make sure you updated `/utils/stripe-config.ts` with your actual Price IDs from Step 4.

### Issue: "Webhook signature verification failed"
**Solution:** 
1. Make sure `STRIPE_WEBHOOK_SECRET` is set in Supabase
2. Verify you copied the correct signing secret from Stripe webhook settings

### Issue: "Subscription not updating after payment"
**Solution:**
1. Check Stripe Dashboard → Webhooks → Check if events are being received
2. Click on a webhook event to see the response
3. Make sure webhook secret is correct

### Issue: "Card declined"
**Solution:** 
- In TEST mode, use test card `4242 4242 4242 4242`
- In LIVE mode, use a real card

### Issue: "Customer not found"
**Solution:**
- The customer is created on first checkout
- Try creating a new test user and going through checkout again

---

## 📞 SUPPORT RESOURCES

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions

---

## ✅ QUICK CHECKLIST

Before launching:

- [ ] Stripe account created & verified
- [ ] 8 products/prices created in Stripe Dashboard
- [ ] `STRIPE_SECRET_KEY` added to Supabase
- [ ] `STRIPE_PUBLISHABLE_KEY` added to Supabase
- [ ] Price IDs updated in `/utils/stripe-config.ts`
- [ ] Webhook endpoint created in Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` added to Supabase
- [ ] Tested checkout flow with test card
- [ ] Tested webhook delivery
- [ ] Verified subscription updates correctly
- [ ] (For production) Business verification completed
- [ ] (For production) Switched to live keys & products

---

## 🎉 YOU'RE DONE!

Once you complete all steps, your Stripe integration will be fully functional!

**Next Steps:**
1. Test thoroughly in TEST mode
2. When ready, activate your account and switch to LIVE mode
3. Start accepting real payments!

**Copyright © 2024 DARREN GUAY - All Rights Reserved**
