# ⚡ STRIPE SETUP - QUICK START (30 MINUTES)

**Good News:** Your Stripe integration code is already built! You just need to configure it.

---

## 🎯 WHAT YOU HAVE

✅ **Stripe routes already coded** (`/supabase/functions/server/stripe.tsx`)  
✅ **Webhook handler built**  
✅ **Checkout flow ready**  
✅ **Customer portal ready**  
✅ **Subscription management ready**

**You just need to:**
1. Create Stripe account
2. Create 4 products
3. Add API keys
4. Update frontend to use your tier names

---

## 🚀 4-STEP QUICK SETUP

### **STEP 1: Create Stripe Account** (15 minutes)

1. Go to: https://dashboard.stripe.com/register
2. Sign up with email
3. Verify email
4. Complete business profile:
   - Business type: Individual or Company
   - Legal name
   - SSN (for tax reporting)
   - Bank account
5. **Done!** Account created ✅

---

### **STEP 2: Create Products** (10 minutes)

**In Stripe Dashboard:**

1. Click "Products" → "+ Add product"

**Create these 4 products:**

#### **Product 1: Essential**
```
Name: The CPS Punisher - Essential
Price: $39.00 USD / month
Billing: Recurring
```
📝 **Copy Price ID:** `price_xxxxx` → Save as `STRIPE_PRICE_ESSENTIAL`

#### **Product 2: Professional**
```
Name: The CPS Punisher - Professional
Price: $79.00 USD / month
Billing: Recurring
```
📝 **Copy Price ID:** `price_xxxxx` → Save as `STRIPE_PRICE_PROFESSIONAL`

#### **Product 3: Attorney**
```
Name: The CPS Punisher - Attorney
Price: $299.00 USD / month
Billing: Recurring
```
📝 **Copy Price ID:** `price_xxxxx` → Save as `STRIPE_PRICE_ATTORNEY`

#### **Product 4: Enterprise**
```
Name: The CPS Punisher - Enterprise
Price: $999.00 USD / month
Billing: Recurring
```
📝 **Copy Price ID:** `price_xxxxx` → Save as `STRIPE_PRICE_ENTERPRISE`

---

### **STEP 3: Get API Keys & Setup Webhook** (5 minutes)

#### **3A: Get API Keys**

1. Click "Developers" → "API keys"
2. **Copy:**
   - Publishable key: `pk_test_51xxxxx`
   - Secret key: `sk_test_51xxxxx`

#### **3B: Create Webhook**

1. Click "Developers" → "Webhooks"
2. Click "+ Add endpoint"
3. **Endpoint URL:**
   ```
   https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
   ```
4. **Select events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy Signing Secret:** `whsec_xxxxx`

---

### **STEP 4: Add to Supabase** (5 minutes)

**Using Supabase CLI:**

```bash
# Add all secrets at once
supabase secrets set STRIPE_SECRET_KEY=sk_test_51xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set STRIPE_PRICE_ESSENTIAL=price_xxxxx
supabase secrets set STRIPE_PRICE_PROFESSIONAL=price_xxxxx
supabase secrets set STRIPE_PRICE_ATTORNEY=price_xxxxx
supabase secrets set STRIPE_PRICE_ENTERPRISE=price_xxxxx

# Deploy function
supabase functions deploy make-server-a24eaa40 --project-ref rewgkrgmcmikivxjnfdq
```

**OR using Supabase Dashboard:**

1. Go to Supabase Dashboard
2. Edge Functions → Settings/Secrets
3. Add each secret one by one

---

## ✅ DONE! Now Test

### **Test Payment:**

1. Open your app
2. Click "Upgrade to Professional"
3. Enter test card: `4242 4242 4242 4242`
4. Complete checkout
5. You should be redirected back
6. Check Stripe Dashboard → Payments (payment should appear)

---

## 🔧 UPDATE YOUR CODE

Your Stripe code is already built, but you need to update the frontend to send the right tier names.

### **Update: `/utils/stripe-client.ts`** (Already created ✅)

Use the file I just created above!

### **Update: `/components/SubscriptionModal.tsx`**

Change the `handleUpgrade` function to use the Stripe client:

```typescript
import { createStripeCheckout } from '../utils/stripe-client';
import { toast } from 'sonner@2.0.3';

const handleUpgrade = async (selectedTier: 'essential' | 'professional' | 'attorney' | 'enterprise') => {
  try {
    // Get user ID
    const userId = localStorage.getItem('cps_user_id');
    
    if (!userId) {
      toast.error('Please log in to upgrade');
      return;
    }

    // Get the price ID for this tier
    const priceIds: Record<string, string> = {
      essential: 'price_xxxxx', // YOUR ESSENTIAL PRICE ID
      professional: 'price_xxxxx', // YOUR PROFESSIONAL PRICE ID
      attorney: 'price_xxxxx', // YOUR ATTORNEY PRICE ID
      enterprise: 'price_xxxxx', // YOUR ENTERPRISE PRICE ID
    };

    // Call your Stripe endpoint
    const response = await fetch(
      'https://rewgkrgmcmikivxjnfdq.supabase.co/functions/v1/make-server-a24eaa40/stripe/create-checkout',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[selectedTier],
          userId: userId,
          email: localStorage.getItem('cps_user_email'),
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      }
    );

    const { url } = await response.json();
    
    if (url) {
      window.location.href = url; // Redirect to Stripe
    }
  } catch (error) {
    console.error('Upgrade error:', error);
    toast.error('Failed to start checkout. Please try again.');
  }
};
```

---

## 📊 HOW IT WORKS

### **User Flow:**

1. **User clicks "Upgrade"** in your app
2. **Frontend calls** `/stripe/create-checkout` with price ID
3. **Backend creates** Stripe Checkout Session
4. **User redirected** to Stripe payment page
5. **User enters** credit card
6. **Stripe processes** payment
7. **Webhook fires** `customer.subscription.created`
8. **Backend updates** user tier in database
9. **User redirected** back to your app
10. **Features unlocked** automatically!

### **Your Existing Code Handles:**

✅ Creating checkout sessions  
✅ Processing webhooks  
✅ Updating user tiers  
✅ Managing subscriptions  
✅ Customer portal  
✅ Cancellations  

**You just need to add the keys and price IDs!**

---

## 🧪 TEST CARDS

**Use these to test:**

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Decline |
| `4000 0025 0000 3155` | 🔒 Requires auth |

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

---

## 🎯 CURRENT vs CONNECTED

### **NOW (Before Stripe):**
```
User clicks "Upgrade"
→ Modal shows
→ User manually changes tier
→ No payment
```

### **AFTER (With Stripe):**
```
User clicks "Upgrade"
→ Redirects to Stripe
→ User pays
→ Webhook updates tier
→ Features unlock automatically
→ Monthly recurring billing
```

---

## 🚀 GO LIVE

**When ready for real payments:**

1. **Switch Stripe to Live mode**
2. **Create products in Live mode**
3. **Get Live API keys**
4. **Create Live webhook**
5. **Update Supabase secrets with Live keys**
6. **Done!** Accepting real payments ✅

---

## ✅ SUMMARY

**Time:** 30-45 minutes  
**Difficulty:** Easy (code already written!)  
**Result:** Real payment processing

**You have:**
- ✅ Stripe integration code
- ✅ Webhook handler
- ✅ Checkout flow
- ✅ All routes ready

**You need:**
- ⏱️ 30 minutes to configure
- 🔑 API keys from Stripe
- 💰 4 products created
- 🔗 Webhook connected

---

## 📞 NEXT STEPS

1. **For congressional meeting:** Use access code `CPSPUNISHER2024`
2. **After meeting:** Set up Stripe (30 minutes)
3. **Go live:** Switch to Live mode
4. **Start earning!** 🚀

---

**Your Stripe integration is 90% done! Just needs configuration!** 🎉

Full detailed guide: `/🔌_CONNECT_STRIPE_STEP_BY_STEP.md`
