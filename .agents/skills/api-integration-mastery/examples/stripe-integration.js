/**
 * API & Integration Mastery — Stripe Integration Example (2026)
 * ==============================================================
 * Complete Stripe integration covering:
 * - Customer management
 * - Checkout Sessions
 * - Subscriptions
 * - Payment Intents
 * - Webhook handling
 * - Billing portal
 */

import Stripe from 'stripe';


// ============================================
// STRIPE CLIENT INITIALIZATION
// ============================================
export function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18',           // Pin API version
    maxNetworkRetries: 3,               // Auto retry on network errors
    timeout: 10000,                     // 10s timeout
    telemetry: false,                   // Disable telemetry in prod
  });
}


// ============================================
// CUSTOMER MANAGEMENT
// ============================================
export class StripeCustomerService {
  constructor(stripe, db) {
    this.stripe = stripe;
    this.db = db;
  }

  async getOrCreateCustomer(userId) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    await this.db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }
}


// ============================================
// CHECKOUT SESSION
// ============================================
export class StripeCheckoutService {
  constructor(stripe) {
    this.stripe = stripe;
  }

  /**
   * Create a subscription checkout session.
   */
  async createSubscriptionCheckout(customerId, priceId, options = {}) {
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${options.successUrl || process.env.APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${options.cancelUrl || process.env.APP_URL}/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: { name: 'auto', address: 'auto' },
      tax_id_collection: { enabled: true },
      payment_method_types: ['card'],
      subscription_data: {
        trial_period_days: options.trialDays || null,
        metadata: options.metadata || {},
      },
    });
  }

  /**
   * Create a one-time payment checkout session.
   */
  async createPaymentCheckout(customerId, items, options = {}) {
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: items.map(item => ({
        price_data: {
          currency: options.currency || 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images || [],
          },
          unit_amount: Math.round(item.price * 100),  // cents
        },
        quantity: item.quantity || 1,
      })),
      success_url: `${options.successUrl || process.env.APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${options.cancelUrl || process.env.APP_URL}/checkout?canceled=true`,
      payment_intent_data: {
        metadata: options.metadata || {},
      },
    });
  }
}


// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================
export class StripeSubscriptionService {
  constructor(stripe, db) {
    this.stripe = stripe;
    this.db = db;
  }

  async getSubscription(subscriptionId) {
    return this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'default_payment_method'],
    });
  }

  async cancelSubscription(subscriptionId, immediately = false) {
    if (immediately) {
      return this.stripe.subscriptions.cancel(subscriptionId);
    }
    // Cancel at end of billing period
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async resumeSubscription(subscriptionId) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async changePlan(subscriptionId, newPriceId) {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });
  }
}


// ============================================
// BILLING PORTAL
// ============================================
export async function createBillingPortalSession(stripe, customerId, returnUrl) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.APP_URL}/billing`,
  });
}


// ============================================
// WEBHOOK HANDLER
// ============================================
export function createStripeWebhookHandler(stripe, db) {
  /**
   * Express middleware for Stripe webhooks.
   * Mount with raw body parser:
   *   app.post('/webhooks/stripe', express.raw({type: 'application/json'}), handler);
   */
  return async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Respond immediately
    res.status(200).json({ received: true });

    // Process event
    try {
      await handleStripeEvent(event, db);
    } catch (err) {
      console.error(`Webhook processing error [${event.type}]:`, err);
      // Don't throw — we already sent 200
    }
  };
}

async function handleStripeEvent(event, db) {
  const { type, data } = event;
  const obj = data.object;

  switch (type) {
    // ---- Checkout completed ----
    case 'checkout.session.completed': {
      if (obj.mode === 'subscription') {
        await db.user.update({
          where: { stripeCustomerId: obj.customer },
          data: {
            subscriptionId: obj.subscription,
            subscriptionStatus: 'ACTIVE',
          },
        });
      }
      break;
    }

    // ---- Subscription lifecycle ----
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const statusMap = {
        active: 'ACTIVE',
        past_due: 'PAST_DUE',
        canceled: 'CANCELED',
        incomplete: 'INCOMPLETE',
        trialing: 'TRIALING',
        unpaid: 'UNPAID',
      };

      await db.user.update({
        where: { stripeCustomerId: obj.customer },
        data: {
          subscriptionId: obj.id,
          subscriptionStatus: statusMap[obj.status] || obj.status,
          plan: obj.items.data[0]?.price?.id,
          currentPeriodEnd: new Date(obj.current_period_end * 1000),
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      await db.user.update({
        where: { stripeCustomerId: obj.customer },
        data: {
          subscriptionId: null,
          subscriptionStatus: 'CANCELED',
          plan: null,
        },
      });
      break;
    }

    // ---- Invoice events ----
    case 'invoice.paid': {
      console.log(`Invoice paid: ${obj.id} for customer ${obj.customer}`);
      // Record payment, send receipt email, etc.
      break;
    }

    case 'invoice.payment_failed': {
      await db.user.update({
        where: { stripeCustomerId: obj.customer },
        data: { subscriptionStatus: 'PAST_DUE' },
      });
      // Send dunning email
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${type}`);
  }
}


// ============================================
// PRICE / PLAN CONSTANTS
// ============================================
export const PLANS = {
  FREE: {
    name: 'Free',
    priceId: null,
    limits: { projects: 3, storage: '100MB', members: 1 },
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO,            // price_xxx from Stripe Dashboard
    priceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL,
    price: 29,
    limits: { projects: 50, storage: '10GB', members: 10 },
  },
  TEAM: {
    name: 'Team',
    priceId: process.env.STRIPE_PRICE_TEAM,
    priceIdAnnual: process.env.STRIPE_PRICE_TEAM_ANNUAL,
    price: 79,
    limits: { projects: -1, storage: '100GB', members: -1 },  // -1 = unlimited
  },
};

console.log('✅ Stripe integration example loaded — Checkout, Subscriptions, Webhooks, Billing Portal');
