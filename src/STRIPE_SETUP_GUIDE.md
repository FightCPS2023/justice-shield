# 🚀 STRIPE SETUP GUIDE - Start Accepting Payments

## ✅ I Just Built For You:

```
✓ /utils/stripe-config.ts          → Pricing & tier configuration
✓ /components/PricingTable.tsx      → Beautiful pricing page
✓ /components/CheckoutPage.tsx      → Checkout flow
✓ /components/BillingDashboard.tsx  → Subscription management
✓ /components/UpgradePrompt.tsx     → Upgrade modals & banners
✓ /supabase/functions/server/stripe.tsx → Backend API
✓ Updated /supabase/functions/server/index.tsx → Stripe routes mounted
```

---

## 📋 SETUP CHECKLIST (30-60 Minutes)

### **STEP 1: Create Stripe Account** (5 minutes)

1. Go to https://dashboard.stripe.com/register
2. Create account with your email
3. Verify email
4. Complete business profile (can use personal info to start)
5. Go to **Developers** → **API Keys**

---

### **STEP 2: Get Your API Keys** (2 minutes)

In Stripe Dashboard → **Developers** → **API Keys**:

```
✅ Publishable key (starts with pk_test_...)
✅ Secret key (starts with sk_test_...)
```

**Click "Reveal test key"** and copy both!

---

### **STEP 3: Add Keys to Supabase** (5 minutes)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **Settings** (gear icon) → **Edge Functions** → **Environment Variables**
3. Add these variables:

```bash
STRIPE_SECRET_KEY = sk_test_YOUR_KEY_HERE
```

**Note:** The publishable key will be used in frontend (no need to store in Supabase)

---

### **STEP 4: Create Stripe Products** (10 minutes)

In Stripe Dashboard → **Products** → **Add Product**

#### **Product 1: Premium Monthly**
- Name: `CPS Defense - Premium`
- Description: `Full AI-powered CPS case defense with unlimited access`
- Pricing:
  - Price: `$19.99`
  - Billing period: `Monthly`
  - Free trial: `7 days`
- Click **Save Product**
- Copy the **Price ID** (starts with `price_...`)

#### **Product 2: Premium Annual**
- Name: `CPS Defense - Premium (Annual)`
- Description: `Full AI-powered CPS case defense - Save 17%`
- Pricing:
  - Price: `$199`
  - Billing period: `Yearly`
- Click **Save Product**
- Copy the **Price ID**

#### **Product 3: Attorney Suite Monthly**
- Name: `CPS Defense - Attorney Suite`
- Description: `Professional tools for family law attorneys`
- Pricing:
  - Price: `$99`
  - Billing period: `Monthly`
  - Free trial: `None`
- Click **Save Product**
- Copy the **Price ID**

#### **Product 4: Attorney Suite Annual**
- Name: `CPS Defense - Attorney Suite (Annual)`
- Description: `Professional tools for attorneys - Save 16%`
- Pricing:
  - Price: `$999`
  - Billing period: `Yearly`
- Click **Save Product**
- Copy the **Price ID**

---

### **STEP 5: Update Price IDs in Code** (5 minutes)

Open `/utils/stripe-config.ts` and replace the price IDs:

```typescript
export const STRIPE_PRICE_IDS = {
  premium_monthly: 'price_YOUR_PREMIUM_MONTHLY_ID',
  premium_annual: 'price_YOUR_PREMIUM_ANNUAL_ID',
  attorney_monthly: 'price_YOUR_ATTORNEY_MONTHLY_ID',
  attorney_annual: 'price_YOUR_ATTORNEY_ANNUAL_ID',
};
```

Also update in `/components/PricingTable.tsx`:
- Search for `REPLACE_ME`
- Replace with actual price IDs

---

### **STEP 6: Set Up Stripe Webhooks** (10 minutes)

Webhooks let Stripe notify your app when payments succeed/fail.

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-a24eaa40/stripe/webhook
   ```
   Replace `YOUR_PROJECT_ID` with your actual Supabase project ID

4. Select events to listen for:
   ```
   ✓ customer.subscription.created
   ✓ customer.subscription.updated
   ✓ customer.subscription.deleted
   ✓ invoice.payment_succeeded
   ✓ invoice.payment_failed
   ```

5. Click **Add endpoint**

6. **Copy the Signing Secret** (starts with `whsec_...`)

7. Add to Supabase Environment Variables:
   ```bash
   STRIPE_WEBHOOK_SECRET = whsec_YOUR_SECRET_HERE
   ```

---

### **STEP 7: Test in Test Mode** (15 minutes)

Stripe provides test cards for testing:

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

Use any future expiry date (e.g., 12/25)
Use any 3-digit CVC
Use any 5-digit ZIP
```

**Test the flow:**
1. Go to your pricing page
2. Click "Choose Premium"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify:
   - Payment appears in Stripe Dashboard → **Payments**
   - Subscription created in **Subscriptions**
   - Webhook fired in **Webhooks** log
   - User upgraded in your app

---

### **STEP 8: Go Live!** (5 minutes)

When ready to accept real payments:

1. **Activate your Stripe account:**
   - Complete business verification
   - Add bank account for payouts
   - Verify identity

2. **Switch to Live Mode:**
   - In Stripe Dashboard, toggle **Test Mode** to **OFF**
   - Get your LIVE API keys (starts with `pk_live_...` and `sk_live_...`)

3. **Update Supabase environment variables:**
   ```bash
   STRIPE_SECRET_KEY = sk_live_YOUR_LIVE_KEY
   ```

4. **Create webhook for LIVE mode:**
   - Same URL as test
   - Select same events
   - Get new webhook secret (`whsec_live_...`)
   - Update in Supabase

5. **Update Price IDs:**
   - Create products in LIVE mode (same prices)
   - Update price IDs in `/utils/stripe-config.ts`

---

## 💳 INTEGRATE INTO YOUR APP

### **1. Add Pricing Page**

Create a new tab or page in your app:

```tsx
import { PricingTable } from './components/PricingTable';

function PricingPage() {
  const handleSelectPlan = (priceId: string, planName: string) => {
    // Redirect to checkout
    window.location.href = `/checkout?priceId=${priceId}&planName=${planName}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <PricingTable 
        onSelectPlan={handleSelectPlan}
        currentTier={userTier} // 'free', 'premium', or 'attorney'
      />
    </div>
  );
}
```

### **2. Add Checkout Flow**

When user clicks a plan:

```tsx
import { CheckoutPage } from './components/CheckoutPage';

function CheckoutFlow() {
  const searchParams = new URLSearchParams(window.location.search);
  const priceId = searchParams.get('priceId');
  const planName = searchParams.get('planName');

  return (
    <CheckoutPage
      priceId={priceId}
      planName={planName}
      price={19.99} // Get from config
      interval="month"
      userId={user.id}
      userEmail={user.email}
      onSuccess={() => window.location.href = '/success'}
      onCancel={() => window.location.href = '/pricing'}
    />
  );
}
```

### **3. Add Billing Dashboard**

In your Settings tab:

```tsx
import { BillingDashboard } from './components/BillingDashboard';

function SettingsPage() {
  return (
    <Tabs>
      <TabsContent value="billing">
        <BillingDashboard 
          userId={user.id}
          accessToken={user.accessToken}
        />
      </TabsContent>
    </Tabs>
  );
}
```

### **4. Add Upgrade Prompts**

When user hits a limit or tries premium feature:

```tsx
import { UpgradePrompt } from './components/UpgradePrompt';

function DocumentAnalysis() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleAnalyze = () => {
    if (userTier === 'free') {
      setShowUpgrade(true);
      return;
    }
    // Do AI analysis...
  };

  return (
    <>
      <Button onClick={handleAnalyze}>Analyze Document</Button>
      
      <UpgradePrompt
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => window.location.href = '/pricing'}
        feature="AI Document Analysis"
        description="Automatically detect violations and extract key information with AI"
        requiredTier="premium"
      />
    </>
  );
}
```

---

## 🔒 ENFORCE FEATURE LIMITS

### **Track Usage**

```typescript
import { canPerformAction, getUsageKey } from './utils/stripe-config';

async function uploadDocument() {
  // Check tier access
  const check = canPerformAction(userTier, 'aiAnalysis');
  
  if (!check.allowed) {
    showUpgradePrompt(check.reason);
    return;
  }

  // Check usage limits
  const usageKey = getUsageKey(userId, 'documents');
  const currentUsage = await getUsage(usageKey);
  
  const limitCheck = canPerformAction(
    userTier, 
    'documentsPerMonth', 
    currentUsage
  );
  
  if (!limitCheck.allowed) {
    showUpgradePrompt(limitCheck.reason);
    return;
  }

  // Proceed with upload
  await uploadDocument();
  
  // Increment usage
  await incrementUsage(usageKey);
}
```

---

## 📊 REVENUE DASHBOARD

View in Stripe:
- **Home** → Revenue chart
- **Payments** → All successful charges
- **Subscriptions** → Active subscribers
- **Analytics** → Detailed metrics

Track:
- Monthly Recurring Revenue (MRR)
- Active subscribers by tier
- Churn rate
- Failed payments
- Trial conversions

---

## 🎯 TESTING SCENARIOS

### **Test 1: Successful Subscription**
1. Choose Premium plan
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Verify subscription created
5. Check webhook logs
6. Confirm tier updated in app

### **Test 2: Free Trial**
1. Choose Premium Monthly
2. Complete checkout (not charged yet)
3. Verify trial period in Stripe
4. Check trial end date in app
5. Wait 7 days or manually end trial
6. Verify first payment processed

### **Test 3: Card Declined**
1. Choose any plan
2. Use decline card: `4000 0000 0000 0002`
3. Verify error message shown
4. Try again with valid card
5. Verify subscription created

### **Test 4: Cancel Subscription**
1. Go to Billing Dashboard
2. Click "Manage Subscription"
3. Cancel in Stripe portal
4. Verify cancellation webhook received
5. Check tier downgraded to free
6. Verify access restricted

### **Test 5: Upgrade**
1. Start with Premium
2. Go to pricing page
3. Choose Attorney Suite
4. Verify proration calculated
5. Complete upgrade
6. Verify new features unlocked

---

## ✅ PRE-LAUNCH CHECKLIST

Before going live with real money:

- [ ] All Stripe products created
- [ ] Price IDs updated in code
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to Supabase
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test free trial (if applicable)
- [ ] Test cancellation
- [ ] Test upgrade/downgrade
- [ ] Verify feature gates work
- [ ] Verify usage limits enforced
- [ ] Test Billing Dashboard
- [ ] Test Customer Portal
- [ ] Terms of Service posted
- [ ] Privacy Policy posted
- [ ] Refund policy defined
- [ ] Support email configured
- [ ] Receipt emails working

---

## 💰 PRICING STRATEGY

### **Recommended Tiers:**

**Free Tier:**
- Purpose: Hook users, show value
- Limits: 3 documents, no AI
- Goal: 20% convert to Premium

**Premium ($19.99/month):**
- Purpose: Main revenue driver
- Target: Parents in CPS cases
- Goal: 80% of paid users

**Attorney Suite ($99/month):**
- Purpose: High-value customers
- Target: Lawyers, legal aid
- Goal: 20% of paid users

### **Pricing Psychology:**

```
Free:    $0   → Get started (low barrier)
Premium: $20  → Under psychological threshold
Attorney: $99 → Makes Premium look affordable

Annual: 15-17% discount → Reward commitment, upfront cash
Trial: 7 days → Reduce risk, increase conversion
```

---

## 🚨 COMMON ISSUES & FIXES

### **Issue: Webhook not firing**
**Fix:** 
- Check webhook URL is correct
- Verify events are selected
- Check Supabase logs for errors
- Test with Stripe CLI: `stripe trigger customer.subscription.created`

### **Issue: Payment succeeds but user not upgraded**
**Fix:**
- Check webhook logs in Stripe
- Verify webhook secret is correct
- Check Supabase function logs
- Manually trigger webhook event

### **Issue: Customer can't access portal**
**Fix:**
- Verify Stripe customer ID saved
- Check customer exists in Stripe
- Verify return URL is correct

### **Issue: Test cards not working**
**Fix:**
- Verify in Test Mode
- Use Stripe test card numbers
- Check card hasn't "expired" (use future date)

---

## 📞 SUPPORT

**Stripe Support:**
- Dashboard → **Help** button
- Chat available 24/7
- Email: support@stripe.com

**Testing:**
- Use Stripe CLI for local testing
- Check webhook logs frequently
- Monitor Supabase Edge Function logs

---

## 🎉 YOU'RE READY!

**Once completed, you can:**
- ✅ Accept credit card payments
- ✅ Manage subscriptions automatically
- ✅ Track revenue in real-time
- ✅ Handle trials and cancellations
- ✅ Enforce feature limits by tier
- ✅ Scale to thousands of users

**Estimated Time to First Dollar:** 1-2 hours after completing this guide!

**Next:** Market your app and start getting customers! 🚀💰
