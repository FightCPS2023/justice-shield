/**
 * Stripe Integration - Server Side
 * 
 * SETUP REQUIRED:
 * 1. Install Stripe in Supabase:
 *    Add STRIPE_SECRET_KEY to Supabase env variables
 * 
 * 2. Set up webhook endpoint:
 *    URL: https://YOUR_PROJECT.supabase.co/functions/v1/make-server-a24eaa40/stripe-webhook
 *    Events to listen for:
 *    - customer.subscription.created
 *    - customer.subscription.updated
 *    - customer.subscription.deleted
 *    - invoice.payment_succeeded
 *    - invoice.payment_failed
 * 
 * 3. Add STRIPE_WEBHOOK_SECRET to env variables (from Stripe webhook page)
 */

import { Hono } from 'npm:hono';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Check if Stripe is configured
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const IS_STRIPE_CONFIGURED = STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_');

const stripe = IS_STRIPE_CONFIGURED 
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

const stripeApp = new Hono();

/**
 * Health Check / Test Endpoint
 * Returns status of Stripe configuration
 */
stripeApp.get('/health', async (c) => {
  return c.json({
    status: 'ok',
    stripe_configured: IS_STRIPE_CONFIGURED,
    message: IS_STRIPE_CONFIGURED 
      ? 'Stripe is configured and ready' 
      : 'Stripe not configured - add STRIPE_SECRET_KEY to environment variables',
    timestamp: new Date().toISOString()
  });
});

/**
 * Create Checkout Session
 * Creates a Stripe checkout session for the user to complete payment
 */
stripeApp.post('/create-checkout', async (c) => {
  try {
    // Check if Stripe is configured
    if (!IS_STRIPE_CONFIGURED || !stripe) {
      console.log('Stripe not configured - returning mock response');
      return c.json({ 
        error: 'Stripe is not configured yet. Please add STRIPE_SECRET_KEY to Supabase Edge Function secrets.',
        setupRequired: true,
        setupInstructions: 'Go to Supabase Dashboard → Settings → Edge Functions → Secrets and add STRIPE_SECRET_KEY'
      }, 400);
    }

    const body = await c.req.json();
    const { priceId, userId, email, successUrl, cancelUrl, trialDays } = body;

    if (!priceId || !userId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if customer already exists
    const existingCustomerId = await kv.get(`stripe_customer_${userId}`);
    
    let customerId = existingCustomerId;
    
    // Create new customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
      await kv.set(`stripe_customer_${userId}`, customerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${c.req.url.split('/stripe')[0]}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${c.req.url.split('/stripe')[0]}/pricing`,
      metadata: {
        user_id: userId,
      },
      subscription_data: trialDays ? {
        trial_period_days: trialDays,
        metadata: {
          user_id: userId,
        },
      } : {
        metadata: {
          user_id: userId,
        },
      },
    });

    return c.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Create Customer Portal Session
 * Allows users to manage their subscription (update payment method, cancel, etc.)
 */
stripeApp.post('/create-portal-session', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, returnUrl } = body;

    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400);
    }

    const customerId = await kv.get(`stripe_customer_${userId}`);
    
    if (!customerId) {
      return c.json({ error: 'No Stripe customer found' }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${c.req.url.split('/stripe')[0]}/settings`,
    });

    return c.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Get Subscription Status
 * Retrieves current subscription information for a user
 */
stripeApp.get('/subscription-status/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const customerId = await kv.get(`stripe_customer_${userId}`);
    
    if (!customerId) {
      return c.json({
        status: 'free',
        tier: 'free',
        subscription: null,
      });
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return c.json({
        status: 'free',
        tier: 'free',
        subscription: null,
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;

    // Determine tier from price
    let tier = 'free';
    if (priceId.includes('premium')) {
      tier = 'premium';
    } else if (priceId.includes('attorney')) {
      tier = 'attorney';
    }

    return c.json({
      status: subscription.status,
      tier: tier,
      subscription: {
        id: subscription.id,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_end: subscription.trial_end,
      },
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * Webhook Handler
 * Processes Stripe webhook events to update subscription status
 */
stripeApp.post('/webhook', async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'No signature' }, 400);
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set');
      return c.json({ error: 'Webhook secret not configured' }, 500);
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return c.json({ error: 'Invalid signature' }, 400);
    }

    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        const priceId = subscription.items.data[0].price.id;
        
        // Determine tier
        let tier = 'free';
        if (priceId.includes('premium')) {
          tier = 'premium';
        } else if (priceId.includes('attorney')) {
          tier = 'attorney';
        }

        // Update user subscription status
        await kv.set(`user_subscription_${userId}`, {
          tier: tier,
          status: subscription.status,
          subscription_id: subscription.id,
          price_id: priceId,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_end: subscription.trial_end,
        });

        // Update Supabase user metadata
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            subscription_tier: tier,
            subscription_status: subscription.status,
            stripe_customer_id: subscription.customer,
          },
        });

        console.log(`Updated subscription for user ${userId} to ${tier}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        // Downgrade to free
        await kv.set(`user_subscription_${userId}`, {
          tier: 'free',
          status: 'canceled',
          subscription_id: null,
          price_id: null,
        });

        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            subscription_tier: 'free',
            subscription_status: 'canceled',
          },
        });

        console.log(`Canceled subscription for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        // Optionally send receipt email here
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        // Optionally send payment failure notification
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default stripeApp;