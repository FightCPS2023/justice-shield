# 🚀 GO LIVE WITH PAYMENTS NOW - 60 MINUTES

**Goal:** Accept real payments in the next 60 minutes

---

## ⚡ STEP 1: CREATE STRIPE ACCOUNT (10 MIN)

### **Do This Right Now:**

1. **Go to:** https://dashboard.stripe.com/register
2. **Sign up:**
   - Email: [Your email]
   - Password: [Create strong password]
   - Click "Create account"
3. **Verify email** (check inbox, click link)
4. **Skip onboarding for now** - Click "I'll do this later"

**✅ Done! You have a Stripe account.**

---

## ⚡ STEP 2: GET API KEYS (2 MIN)

### **In Stripe Dashboard:**

1. **Top right:** Make sure you're in **"Test mode"** (toggle should show "Test mode")
2. **Click:** "Developers" (top right)
3. **Click:** "API keys" (left sidebar)

### **Copy These Keys:**

**Publishable key:**
```
pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Copy this ☝️

**Secret key:**
```
Copy this ☝️

**Save both keys** somewhere (Notepad, TextEdit, etc.)

**✅ Done! You have API keys.**

---

## ⚡ STEP 3: CREATE PRODUCTS (15 MIN)

### **In Stripe Dashboard:**

1. **Click:** "Product catalog" → "Products" (left sidebar)
2. **Click:** "+ Add product" (top right)

### **Create Product 1: Essential**

**Fill out:**
- Name: `The CPS Punisher - Essential`
- Description: `Essential tier with 25 documents and basic AI analysis`
- Price: `39.00` USD
- Billing period: `Monthly`
- Recurring: ✅ Checked

**Click:** "Add product"

**IMPORTANT:** After creating, you'll see a **Price ID** like:
```
price_1xxxxxxxxxxxxxxxxxxxxx
```

**Copy this Price ID!** Write it down as: `ESSENTIAL = price_1xxxxx`

### **Create Product 2: Professional**

**Repeat:**
- Name: `The CPS Punisher - Professional`
- Description: `Professional tier with unlimited documents and enhanced AI`
- Price: `79.00` USD
- Billing: Monthly, Recurring

**Copy Price ID:** `PROFESSIONAL = price_1xxxxx`

### **Create Product 3: Attorney**

**Repeat:**
- Name: `The CPS Punisher - Attorney`
- Description: `Attorney tier with multi-case management and federal tools`
- Price: `299.00` USD
- Billing: Monthly, Recurring

**Copy Price ID:** `ATTORNEY = price_1xxxxx`

### **Create Product 4: Enterprise**

**Repeat:**
- Name: `The CPS Punisher - Enterprise`
- Description: `Enterprise tier with unlimited AI and API access`
- Price: `999.00` USD
- Billing: Monthly, Recurring

**Copy Price ID:** `ENTERPRISE = price_1xxxxx`

**✅ Done! You have 4 products with Price IDs.**

---

## ⚡ STEP 4: CREATE WEBHOOK (5 MIN)

### **In Stripe Dashboard:**

1. **Click:** "Developers" → "Webhooks"
2. **Click:** "+ Add endpoint"
3. **Endpoint URL:** Paste this EXACTLY:
```
https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

4. **Click:** "Select events"
5. **Select these events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

6. **Click:** "Add endpoint"

7. **Copy the Signing Secret** (starts with `whsec_`):
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save this:** `WEBHOOK_SECRET = whsec_xxxxx`

**✅ Done! Webhook created.**

---

## ⚡ STEP 5: ADD KEYS TO SUPABASE (10 MIN)

### **Option A: Using Supabase Dashboard (EASIER)**

1. **Go to:** https://supabase.com/dashboard
2. **Select your project:** `rewgkrgmcmikivxjnfdq`
3. **Click:** "Settings" (left sidebar, bottom)
4. **Click:** "Edge Functions" or "Secrets"
5. **Add these secrets ONE BY ONE:**

**Secret 1:**
- Name: `STRIPE_SECRET_KEY`
- Value: `sk_test_51xxxxx` (your secret key from Step 2)

**Secret 2:**
- Name: `STRIPE_WEBHOOK_SECRET`
- Value: `whsec_xxxxx` (your webhook secret from Step 4)

**Secret 3:**
- Name: `STRIPE_PRICE_ESSENTIAL`
- Value: `price_1xxxxx` (Essential price ID from Step 3)

**Secret 4:**
- Name: `STRIPE_PRICE_PROFESSIONAL`
- Value: `price_1xxxxx` (Professional price ID from Step 3)

**Secret 5:**
- Name: `STRIPE_PRICE_ATTORNEY`
- Value: `price_1xxxxx` (Attorney price ID from Step 3)

**Secret 6:**
- Name: `STRIPE_PRICE_ENTERPRISE`
- Value: `price_1xxxxx` (Enterprise price ID from Step 3)

### **Option B: Using Supabase CLI (FASTER if installed)**

**Open terminal and run:**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51xxxxx --project-ref rewgkrgmcmikivxjnfdq
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx --project-ref rewgkrgmcmikivxjnfdq
supabase secrets set STRIPE_PRICE_ESSENTIAL=price_1xxxxx --project-ref rewgkrgmcmikivxjnfdq
supabase secrets set STRIPE_PRICE_PROFESSIONAL=price_1xxxxx --project-ref rewgkrgmcmikivxjnfdq
supabase secrets set STRIPE_PRICE_ATTORNEY=price_1xxxxx --project-ref rewgkrgmcmikivxjnfdq
supabase secrets set STRIPE_PRICE_ENTERPRISE=price_1xxxxx --project-ref rewgkrgmcmikivxjnfdq
```

**Replace the `xxxxx` with your actual values!**

**✅ Done! Secrets added to Supabase.**

---

## ⚡ STEP 6: UPDATE FRONTEND CODE (5 MIN)

### **Open:** `/components/SubscriptionModal.tsx`

**Find line ~30 where it says:**

```typescript
const priceIds: Record<string, string> = {
  essential: 'price_REPLACE_WITH_YOUR_ESSENTIAL_PRICE_ID',
  professional: 'price_REPLACE_WITH_YOUR_PROFESSIONAL_PRICE_ID',
  attorney: 'price_REPLACE_WITH_YOUR_ATTORNEY_PRICE_ID',
  enterprise: 'price_REPLACE_WITH_YOUR_ENTERPRISE_PRICE_ID',
};
```

**Replace with YOUR actual Price IDs:**

```typescript
const priceIds: Record<string, string> = {
  essential: 'price_1xxxxx',      // YOUR Essential Price ID
  professional: 'price_1xxxxx',   // YOUR Professional Price ID
  attorney: 'price_1xxxxx',       // YOUR Attorney Price ID
  enterprise: 'price_1xxxxx',     // YOUR Enterprise Price ID
};
```

**Save the file.**

**✅ Done! Frontend updated with real Price IDs.**

---

## ⚡ STEP 7: DEPLOY (10 MIN)

### **Deploy Supabase Edge Function:**

**Open terminal in your project folder and run:**

```bash
supabase functions deploy make-server-a24eaa40 --project-ref rewgkrgmcmikivxjnfdq
```

**Wait for it to complete** (30-60 seconds)

### **Deploy Frontend (if using Vercel):**

```bash
vercel --prod
```

**OR push to GitHub (if auto-deploy is set up):**

```bash
git add .
git commit -m "Connected Stripe - ready for payments"
git push origin main
```

**Wait for deployment** (1-2 minutes)

**✅ Done! App deployed with Stripe connected.**

---

## ⚡ STEP 8: TEST WITH TEST CARD (5 MIN)

### **Test Right Now:**

1. **Open your app** in browser
2. **Sign up or log in**
3. **Click "Upgrade to Professional"**
4. **You should be redirected to Stripe Checkout** ✅

### **Enter Test Card:**

- **Card number:** `4242 4242 4242 4242`
- **Expiry:** `12/34` (any future date)
- **CVC:** `123` (any 3 digits)
- **ZIP:** `12345` (any 5 digits)
- **Name:** Test User

5. **Click "Subscribe"**
6. **You should be redirected back to your app** ✅
7. **Your tier should be upgraded** ✅

### **Verify in Stripe:**

1. **Go to Stripe Dashboard**
2. **Click:** "Payments"
3. **You should see your test payment** ✅

**✅ Done! Payments working in TEST mode!**

---

## 🎉 YOU'RE LIVE! (Test Mode)

**You can now:**
- ✅ Accept test payments
- ✅ Test the full subscription flow
- ✅ Verify webhooks fire correctly
- ✅ Make sure tier upgrades work

**Test everything before going to LIVE mode!**

---

## 🚀 GO LIVE WITH REAL PAYMENTS (Optional - 15 MIN)

**⚠️ ONLY DO THIS WHEN READY FOR REAL MONEY!**

### **Switch to Live Mode:**

1. **In Stripe Dashboard:** Toggle "Test mode" → "Live mode" (top right)
2. **Complete business verification** (if not done):
   - Business name
   - Tax ID (SSN or EIN)
   - Bank account for payouts
   - Submit

3. **Get LIVE API keys:**
   - Click "Developers" → "API keys"
   - Copy **Live** Publishable key: `pk_live_xxxxx`
   - Copy **Live** Secret key: `sk_live_xxxxx`

4. **Create products in LIVE mode:**
   - Repeat Step 3 (create 4 products)
   - Copy NEW Live Price IDs

5. **Create webhook in LIVE mode:**
   - Repeat Step 4
   - Same URL, same events
   - Copy NEW Live webhook secret

6. **Update Supabase secrets with LIVE keys:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx --project-ref rewgkrgmcmikivxjnfdq
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx --project-ref rewgkrgmcmikivxjnfdq
   supabase secrets set STRIPE_PRICE_ESSENTIAL=price_xxxxx --project-ref rewgkrgmcmikivxjnfdq
   supabase secrets set STRIPE_PRICE_PROFESSIONAL=price_xxxxx --project-ref rewgkrgmcmikivxjnfdq
   supabase secrets set STRIPE_PRICE_ATTORNEY=price_xxxxx --project-ref rewgkrgmcmikivxjnfdq
   supabase secrets set STRIPE_PRICE_ENTERPRISE=price_xxxxx --project-ref rewgkrgmcmikivxjnfdq
   ```

7. **Update frontend with LIVE Price IDs**

8. **Deploy:**
   ```bash
   supabase functions deploy make-server-a24eaa40 --project-ref rewgkrgmcmikivxjnfdq
   vercel --prod
   ```

9. **Test with YOUR real credit card** (you can cancel immediately after)

**✅ NOW ACCEPTING REAL PAYMENTS! 💰**

---

## 📊 QUICK REFERENCE

### **Your Stripe Dashboard:**
- Payments: See all transactions
- Customers: See all subscribers
- Subscriptions: Manage subscriptions
- Products: Edit pricing
- Webhooks: See webhook events

### **Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

### **Where Money Goes:**
- Stripe holds funds for ~7 days (first few transactions)
- Then auto-deposits to your bank account
- You get: 97.1% (2.9% + $0.30 goes to Stripe fees)

---

## ⚠️ IMPORTANT NOTES

### **Test Mode vs Live Mode:**
- **Test mode:** Fake cards, no real money, perfect for testing
- **Live mode:** Real cards, real money, real business

### **Start in Test Mode!**
- Test everything thoroughly
- Make sure webhooks work
- Verify user upgrades happen
- Test all 4 subscription tiers
- **THEN** switch to Live mode

### **When You Get Your First Real Payment:**
🎉 **CONGRATULATIONS!** You just made money helping families! 🎉

---

## 🐛 TROUBLESHOOTING

### **"Checkout session creation failed"**
- Check: Did you add STRIPE_SECRET_KEY to Supabase?
- Check: Did you deploy the edge function?
- Check: Are Price IDs correct?

### **"Redirected but tier didn't upgrade"**
- Check: Did webhook fire? (Stripe Dashboard → Webhooks → Click endpoint → See events)
- Check: Is STRIPE_WEBHOOK_SECRET set in Supabase?
- Check: Did edge function deploy successfully?

### **"No checkout URL returned"**
- Check: Price IDs in SubscriptionModal.tsx are correct
- Check: Edge function logs (Supabase Dashboard → Edge Functions → Logs)

---

## ✅ FINAL CHECKLIST

**Before going live:**
- [ ] Tested successful payment
- [ ] Tested failed payment (use decline card)
- [ ] Verified tier upgrade happens
- [ ] Checked webhook fires correctly
- [ ] Tested all 4 subscription tiers
- [ ] Verified user can access premium features
- [ ] Created Terms of Service page
- [ ] Created Privacy Policy page
- [ ] Set up customer support email
- [ ] Bank account connected in Stripe
- [ ] Business info complete in Stripe

**When all checked:**
- [ ] Switch to Live mode
- [ ] Update to Live API keys
- [ ] Test with real card (your own)
- [ ] Cancel test subscription
- [ ] **GO LIVE! 🚀**

---

## 🎯 TIME BREAKDOWN

- Step 1 (Stripe account): 10 min
- Step 2 (API keys): 2 min
- Step 3 (Create products): 15 min
- Step 4 (Webhook): 5 min
- Step 5 (Supabase secrets): 10 min
- Step 6 (Update code): 5 min
- Step 7 (Deploy): 10 min
- Step 8 (Test): 5 min

**TOTAL: 62 minutes**

**You can be accepting payments in 1 hour!** ⚡

---

## 💪 YOU GOT THIS!

**Follow these steps exactly and you'll be live with payments in 60 minutes!**

**Questions? Check:**
- `/🔌_CONNECT_STRIPE_STEP_BY_STEP.md` (detailed guide)
- `/⚡_STRIPE_SETUP_QUICK_START.md` (quick reference)
- Stripe Dashboard → Help

**NOW GO MAKE MONEY AND HELP FAMILIES! 🚀💰🇺🇸**
