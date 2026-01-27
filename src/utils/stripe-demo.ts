/**
 * Stripe Demo Mode - Frontend Simulation
 * 
 * This simulates Stripe checkout without a backend.
 * Use this for demos when Edge Functions aren't available.
 */

export interface DemoCheckoutSession {
  id: string;
  url: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  status: 'open' | 'complete' | 'expired';
}

/**
 * Simulates creating a Stripe checkout session
 */
export async function createDemoCheckoutSession(params: {
  priceId: string;
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Get plan name from priceId
  const planMap: Record<string, { name: string; price: number }> = {
    'price_essential': { name: 'Essential', price: 39 },
    'price_professional': { name: 'Professional', price: 79 },
    'price_attorney': { name: 'Attorney Suite', price: 299 },
    'price_enterprise': { name: 'Enterprise', price: 999 },
  };

  const plan = planMap[params.priceId] || { name: 'Unknown', price: 0 };

  // Create a demo session
  const sessionId = `cs_demo_${Date.now()}`;
  
  // Store session data in localStorage
  const sessionData: DemoCheckoutSession = {
    id: sessionId,
    url: '#demo-checkout',
    customer_email: params.email,
    amount_total: plan.price * 100,
    currency: 'usd',
    status: 'open',
  };

  localStorage.setItem(`stripe_demo_session_${sessionId}`, JSON.stringify(sessionData));
  localStorage.setItem('stripe_demo_latest_session', sessionId);
  localStorage.setItem('stripe_demo_plan', JSON.stringify(plan));
  localStorage.setItem('stripe_demo_user_email', params.email);

  // Return demo checkout URL
  return {
    url: `/demo-stripe-checkout?session_id=${sessionId}`,
    sessionId,
  };
}

/**
 * Simulates completing a Stripe checkout
 */
export function completeDemoCheckout(sessionId: string): boolean {
  const sessionData = localStorage.getItem(`stripe_demo_session_${sessionId}`);
  
  if (!sessionData) {
    return false;
  }

  const session: DemoCheckoutSession = JSON.parse(sessionData);
  session.status = 'complete';
  
  localStorage.setItem(`stripe_demo_session_${sessionId}`, JSON.stringify(session));
  localStorage.setItem('stripe_demo_subscription_active', 'true');
  localStorage.setItem('stripe_demo_subscription_start', new Date().toISOString());

  return true;
}

/**
 * Check if demo subscription is active
 */
export function isDemoSubscriptionActive(): boolean {
  return localStorage.getItem('stripe_demo_subscription_active') === 'true';
}

/**
 * Get demo subscription info
 */
export function getDemoSubscription() {
  const isActive = isDemoSubscriptionActive();
  const planData = localStorage.getItem('stripe_demo_plan');
  const startDate = localStorage.getItem('stripe_demo_subscription_start');
  const email = localStorage.getItem('stripe_demo_user_email');

  if (!isActive || !planData) {
    return null;
  }

  const plan = JSON.parse(planData);

  return {
    status: 'active',
    plan: plan.name,
    amount: plan.price,
    current_period_start: startDate,
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    customer_email: email,
  };
}

/**
 * Cancel demo subscription
 */
export function cancelDemoSubscription(): void {
  localStorage.setItem('stripe_demo_subscription_active', 'false');
  localStorage.removeItem('stripe_demo_plan');
  localStorage.removeItem('stripe_demo_subscription_start');
}
