# 🔌 STRIPE API INTEGRATION REFERENCE

Quick reference for all Stripe API endpoints and usage in The CPS Punisher.

---

## 📡 API ENDPOINTS

### Base URL:
```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-a24eaa40
```

Replace `[YOUR_PROJECT_ID]` with your actual Supabase project ID.

---

## 1️⃣ CREATE CHECKOUT SESSION

**Create a Stripe checkout session to collect payment**

### Endpoint:
```
POST /stripe/create-checkout
```

### Headers:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
}
```

### Request Body:
```javascript
{
  "priceId": "price_1SZChVLer5ye2GBih8C2Cn8U",  // Required
  "userId": "user-uuid-here",                    // Required
  "email": "user@example.com",                   // Optional but recommended
  "successUrl": "https://yourapp.com/success",   // Optional
  "cancelUrl": "https://yourapp.com/pricing",    // Optional
  "trialDays": 7                                 // Optional (for trial periods)
}
```

### Response:
```javascript
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### Usage Example:
```javascript
const createCheckout = async (priceId, userId, email) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/create-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        priceId,
        userId,
        email,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/pricing',
      }),
    }
  );

  const data = await response.json();
  
  if (data.url) {
    window.location.href = data.url;  // Redirect to Stripe Checkout
  }
};
```

---

## 2️⃣ CREATE CUSTOMER PORTAL SESSION

**Allow users to manage their subscription**

### Endpoint:
```
POST /stripe/create-portal-session
```

### Headers:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
}
```

### Request Body:
```javascript
{
  "userId": "user-uuid-here",                    // Required
  "returnUrl": "https://yourapp.com/settings"    // Optional
}
```

### Response:
```javascript
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

### Usage Example:
```javascript
const openBillingPortal = async (userId) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/create-portal-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        userId,
        returnUrl: window.location.origin + '/settings',
      }),
    }
  );

  const data = await response.json();
  
  if (data.url) {
    window.location.href = data.url;  // Redirect to Stripe Portal
  }
};
```

---

## 3️⃣ GET SUBSCRIPTION STATUS

**Check user's current subscription tier and status**

### Endpoint:
```
GET /stripe/subscription-status/:userId
```

### Headers:
```javascript
{
  'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
}
```

### Response:
```javascript
{
  "status": "active",        // or "free", "canceled", "past_due"
  "tier": "professional",    // or "free", "essential", "attorney", "enterprise"
  "subscription": {
    "id": "sub_...",
    "current_period_end": 1234567890,
    "cancel_at_period_end": false,
    "trial_end": null
  }
}
```

### Usage Example:
```javascript
const getSubscriptionStatus = async (userId) => {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/subscription-status/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${anonKey}`,
      },
    }
  );

  const data = await response.json();
  console.log('Current tier:', data.tier);
  return data;
};
```

---

## 4️⃣ WEBHOOK ENDPOINT

**Stripe sends events here (configured in Stripe Dashboard)**

### Endpoint:
```
POST /stripe/webhook
```

### URL for Stripe Dashboard:
```
https://[YOUR_PROJECT_ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

### Events Handled:
- `customer.subscription.created` - New subscription activated
- `customer.subscription.updated` - Subscription changed (upgrade/downgrade)
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### What Happens:
1. Stripe sends webhook event
2. Server verifies signature (security)
3. Updates KV store with subscription data
4. Updates Supabase user metadata
5. Returns 200 status to Stripe

**Note:** You don't call this endpoint directly - Stripe calls it automatically.

---

## 💳 ALL 8 PRICE IDs

Copy these exact IDs for API calls:

### Monthly Plans:
```javascript
const MONTHLY_PLANS = {
  essential: 'price_1SZChVLer5ye2GBih8C2Cn8U',      // $39/mo
  professional: 'price_1SZDlfLer5ye2GBidSCef53l',   // $79/mo
  attorney: 'price_1SZDnkLer5ye2GBisGCQtncE',       // $299/mo
  enterprise: 'price_1SZDpeLer5ye2GBi9gT16zyW',     // $999/mo
};
```

### Annual Plans:
```javascript
const ANNUAL_PLANS = {
  essential: 'price_1SZDqXLer5ye2GBi27cH4jsS',      // $390/yr
  professional: 'price_1SZDwnLer5ye2GBiqEl9SAba',   // $790/yr
  attorney: 'price_1SZDsSLer5ye2GBieHTotLLO',       // $2,990/yr
  enterprise: 'price_1SZDueLer5ye2GBiRifVwAeC',     // $9,990/yr
};
```

---

## 🎯 COMPLETE PAYMENT FLOW

### Step-by-step API calls:

```javascript
// 1. User clicks "Choose Professional" plan
const priceId = 'price_1SZDlfLer5ye2GBidSCef53l';
const planName = 'Professional Monthly';

// 2. Create checkout session
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/create-checkout`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      priceId: priceId,
      userId: currentUser.id,
      email: currentUser.email,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/pricing`,
      trialDays: 7,  // Professional plan has 7-day trial
    }),
  }
);

const { url } = await response.json();

// 3. Redirect user to Stripe Checkout
window.location.href = url;

// 4. User completes payment on Stripe
// (Stripe handles credit card form, validation, etc.)

// 5. Stripe sends webhook to your server
// Server automatically updates subscription in KV store

// 6. User redirected back to /success page

// 7. Check subscription status
const status = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-a24eaa40/stripe/subscription-status/${currentUser.id}`,
  {
    headers: { Authorization: `Bearer ${anonKey}` }
  }
).then(r => r.json());

console.log('New tier:', status.tier);  // "professional"
console.log('Status:', status.status);  // "active"

// 8. Features now unlocked!
// SubscriptionContext will show tier === 'professional'
```

---

## 🔐 AUTHENTICATION

All API endpoints require authentication via Bearer token.

### Get Token:
```javascript
import { publicAnonKey } from './utils/supabase/info';

const token = publicAnonKey;
```

### Use in Headers:
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

---

## ⚠️ ERROR HANDLING

### Common Errors:

#### 400 - Bad Request
```javascript
{
  "error": "Missing required fields"
}
```
**Fix:** Ensure all required fields are provided

#### 404 - Not Found
```javascript
{
  "error": "No Stripe customer found"
}
```
**Fix:** User needs to complete checkout first

#### 500 - Server Error
```javascript
{
  "error": "Detailed error message"
}
```
**Fix:** Check server logs in Supabase

### Example Error Handling:
```javascript
try {
  const response = await fetch(endpoint, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Payment failed');
  }
  
  return data;
} catch (error) {
  console.error('Payment error:', error);
  toast.error(error.message);
}
```

---

## 🧪 TESTING

### Test Card Numbers:

#### Successful Payment:
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

#### Declined Payment:
```
Card: 4000 0000 0000 0002
```

#### 3D Secure Authentication:
```
Card: 4000 0027 6000 3184
```

### Test in Stripe Dashboard:
1. Go to: https://dashboard.stripe.com/test/payments
2. View all test payments
3. See webhook events in real-time

---

## 📊 SUBSCRIPTION DATA STORAGE

### KV Store Keys:

#### Customer Mapping:
```
Key: stripe_customer_${userId}
Value: "cus_ABC123..."
```

#### Subscription Data:
```
Key: user_subscription_${userId}
Value: {
  tier: "professional",
  status: "active",
  subscription_id: "sub_XYZ789...",
  price_id: "price_1SZDlfLer5ye2GBidSCef53l",
  current_period_end: 1234567890,
  cancel_at_period_end: false,
  trial_end: null
}
```

### Access in Code:
```javascript
import * as kv from './supabase/functions/server/kv_store.tsx';

// Get customer ID
const customerId = await kv.get(`stripe_customer_${userId}`);

// Get subscription
const subscription = await kv.get(`user_subscription_${userId}`);
console.log('Current tier:', subscription.tier);
```

---

## 🎨 REACT COMPONENTS

### Use Built-In Components:

#### Full Pricing Page:
```tsx
import { PaymentIntegration } from './components/PaymentIntegration';

<PaymentIntegration
  userId={user.id}
  userEmail={user.email}
  onSuccess={() => router.push('/dashboard')}
/>
```

#### Subscription Status Card:
```tsx
import { SubscriptionStatus } from './components/PaymentIntegration';

<SubscriptionStatus userId={user.id} />
```

#### Upgrade Prompt:
```tsx
import { InlineUpgradePrompt } from './components/PaymentIntegration';

<InlineUpgradePrompt
  feature="AI Document Analysis"
  requiredTier="professional"
  onUpgrade={() => router.push('/upgrade')}
/>
```

---

## 🔍 DEBUGGING

### Check Subscription Status:
```javascript
// In browser console
const userId = 'your-user-id-here';
const response = await fetch(
  `https://YOUR_PROJECT.supabase.co/functions/v1/make-server-a24eaa40/stripe/subscription-status/${userId}`,
  {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`
    }
  }
);
const data = await response.json();
console.log(data);
```

### View Stripe Logs:
1. **Payments:** https://dashboard.stripe.com/payments
2. **Subscriptions:** https://dashboard.stripe.com/subscriptions
3. **Webhooks:** https://dashboard.stripe.com/webhooks
4. **Customers:** https://dashboard.stripe.com/customers

### View Supabase Logs:
1. Go to Supabase Dashboard
2. Click **Edge Functions**
3. View logs for `/make-server-a24eaa40`

---

## 📚 ADDITIONAL RESOURCES

### Stripe Documentation:
- [Checkout](https://stripe.com/docs/payments/checkout)
- [Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

### Supabase Documentation:
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Environment Variables](https://supabase.com/docs/guides/functions/secrets)

---

## ✅ QUICK REFERENCE

### Environment Variables Needed:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Webhook URL:
```
https://[PROJECT_ID].supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
```

### Webhook Events to Select:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

---

**Copyright © 2024 DARREN P. GUAY**
All rights reserved.
