# ⚡ STRIPE QUICK SETUP GUIDE

## 🎯 5-MINUTE STRIPE ACTIVATION

Follow these steps to activate payments in The CPS Punisher.

---

## STEP 1: Get Your Stripe Keys (2 min)

### A. Login to Stripe
Go to: https://dashboard.stripe.com/

### B. Get API Keys
1. Click **Developers** → **API Keys**
2. Copy your **Secret key** (starts with `sk_live_...`)
   - ⚠️ NEVER share this key publicly
3. Copy your **Publishable key** (starts with `pk_live_...`)

---

## STEP 2: Add Keys to Supabase (1 min)

### Go to Supabase Dashboard:
https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/settings/functions

### Add Environment Variables:
Click **Edge Functions** → **Manage Secrets** → Add:

```
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
```

**Note:** Don't add `STRIPE_PUBLISHABLE_KEY` - it's not needed for server-side operations.

---

## STEP 3: Create Stripe Webhook (2 min)

### A. Go to Webhooks
https://dashboard.stripe.com/webhooks

### B. Add Endpoint
Click **"Add endpoint"** button

### C. Enter Endpoint URL
**IMPORTANT:** Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID:

```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

**Example:**
```
https://abcdefghijklmnop.supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

### D. Select Events to Send
Select these 5 events:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### E. Add Endpoint

Click **"Add endpoint"**

### F. Copy Signing Secret
After creating, click the endpoint to view details.
Copy the **Signing secret** (starts with `whsec_...`)

### G. Add to Supabase
Go back to Supabase → Edge Functions → Add secret:

```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

---

## STEP 4: Test the Integration (30 sec)

### Test Mode (Use Test Cards):

1. Open your app
2. Navigate to pricing page
3. Click any paid plan
4. Use test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ZIP: Any 5 digits
   ```
5. Complete checkout
6. Check if subscription activated

### Verify Webhook:
1. Go to Stripe Dashboard → Webhooks
2. Click your endpoint
3. Check "Recent deliveries"
4. Should see successful webhook events (200 status)

---

## ✅ VERIFICATION CHECKLIST

After setup, verify these:

- [ ] Stripe Secret Key added to Supabase
- [ ] Webhook endpoint created in Stripe
- [ ] Webhook signing secret added to Supabase
- [ ] 5 webhook events selected
- [ ] Test payment completed successfully
- [ ] Webhook showing 200 status in Stripe
- [ ] User subscription tier updated in app
- [ ] Features unlocked after payment

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "Missing STRIPE_SECRET_KEY"
**Fix:** Add the key to Supabase Environment Variables

### ❌ Error: "Webhook signature verification failed"
**Fix:** Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### ❌ Error: "404 Not Found" on webhook
**Fix:** Check webhook URL matches exactly:
```
https://[PROJECT_ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

### ❌ Subscription not activating
**Fix:** 
1. Check Stripe webhook logs for errors
2. Verify all 5 events are selected
3. Check Supabase Edge Function logs

---

## 📊 ALL 8 PRODUCTS ARE READY

Your Stripe account already has these products configured:

### Monthly:
- Essential: `price_1SZChVLer5ye2GBih8C2Cn8U` ($39)
- Professional: `price_1SZDlfLer5ye2GBidSCef53l` ($79)
- Attorney: `price_1SZDnkLer5ye2GBisGCQtncE` ($299)
- Enterprise: `price_1SZDpeLer5ye2GBi9gT16zyW` ($999)

### Annual:
- Essential: `price_1SZDqXLer5ye2GBi27cH4jsS` ($390)
- Professional: `price_1SZDwnLer5ye2GBiqEl9SAba` ($790)
- Attorney: `price_1SZDsSLer5ye2GBieHTotLLO` ($2,990)
- Enterprise: `price_1SZDueLer5ye2GBiRifVwAeC` ($9,990)

---

## 🎉 YOU'RE DONE!

The CPS Punisher is now ready to accept payments.

**Next Steps:**
1. Switch from test mode to live mode in Stripe
2. Use live API keys instead of test keys
3. Update webhook to use live endpoint
4. Start marketing and generating revenue!

---

## 📞 NEED HELP?

### Stripe Support:
https://support.stripe.com/

### Supabase Docs:
https://supabase.com/docs/guides/functions

### Stripe Testing:
https://stripe.com/docs/testing

---

**Copyright © 2024 DARREN P. GUAY**
All rights reserved.
