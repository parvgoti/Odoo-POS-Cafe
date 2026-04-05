/**
 * API & Integration Mastery — Webhook Handler (2026)
 * ====================================================
 * Production patterns for receiving and sending webhooks.
 *
 * Includes:
 * - HMAC signature verification (SHA-256, SHA-512)
 * - Stripe/GitHub/Slack-specific verifiers
 * - Idempotent event processing
 * - Webhook event dispatcher
 * - Webhook sender with retries
 */

import crypto from 'node:crypto';


// ============================================
// 1. GENERIC WEBHOOK SIGNATURE VERIFIER
// ============================================
export class WebhookVerifier {
  /**
   * @param {string} secret - Signing secret
   * @param {object} options
   * @param {string} options.algorithm - Hash algorithm (default: sha256)
   * @param {string} options.signatureHeader - Header name (default: x-webhook-signature)
   * @param {string} options.encoding - Encoding (default: hex)
   * @param {string} options.prefix - Signature prefix to strip (e.g., 'sha256=')
   * @param {number} options.tolerance - Timestamp tolerance in seconds (default: 300)
   */
  constructor(secret, options = {}) {
    this.secret = secret;
    this.algorithm = options.algorithm ?? 'sha256';
    this.signatureHeader = options.signatureHeader ?? 'x-webhook-signature';
    this.encoding = options.encoding ?? 'hex';
    this.prefix = options.prefix ?? '';
    this.tolerance = options.tolerance ?? 300; // 5 minutes
  }

  /**
   * Verify webhook signature.
   * @param {Buffer|string} payload - Raw request body
   * @param {string} signature - Signature from header
   * @param {number} timestamp - Optional timestamp for replay protection
   * @returns {boolean}
   */
  verify(payload, signature, timestamp) {
    // Replay protection
    if (timestamp) {
      const age = Math.abs(Date.now() / 1000 - timestamp);
      if (age > this.tolerance) {
        throw new WebhookError('Webhook timestamp too old (possible replay attack)');
      }
    }

    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');

    // Build the signed content (may include timestamp)
    const signedContent = timestamp
      ? `${timestamp}.${payloadString}`
      : payloadString;

    // Compute expected signature
    const expected = crypto
      .createHmac(this.algorithm, this.secret)
      .update(signedContent)
      .digest(this.encoding);

    // Strip prefix from received signature
    const received = this.prefix && signature.startsWith(this.prefix)
      ? signature.slice(this.prefix.length)
      : signature;

    // Timing-safe comparison
    if (expected.length !== received.length) {
      throw new WebhookError('Invalid webhook signature');
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(received)
    );

    if (!isValid) {
      throw new WebhookError('Invalid webhook signature');
    }

    return true;
  }

  /**
   * Express middleware for webhook verification.
   */
  middleware() {
    return (req, res, next) => {
      try {
        const signature = req.headers[this.signatureHeader];
        if (!signature) {
          return res.status(401).json({ error: 'Missing webhook signature' });
        }

        const timestamp = req.headers['x-webhook-timestamp']
          ? parseInt(req.headers['x-webhook-timestamp'])
          : null;

        this.verify(req.body, signature, timestamp);
        next();
      } catch (err) {
        return res.status(401).json({ error: err.message });
      }
    };
  }
}


// ============================================
// 2. PROVIDER-SPECIFIC VERIFIERS
// ============================================

/**
 * Stripe webhook verification.
 */
export function verifyStripeWebhook(payload, sigHeader, secret) {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parseInt(parts.t);
  const signature = parts.v1;

  if (!timestamp || !signature) {
    throw new WebhookError('Invalid Stripe signature format');
  }

  // Check timestamp tolerance (5 minutes)
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
    throw new WebhookError('Stripe webhook timestamp too old');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    throw new WebhookError('Invalid Stripe webhook signature');
  }

  return JSON.parse(payload);
}

/**
 * GitHub webhook verification.
 */
export function verifyGitHubWebhook(payload, sigHeader, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader))) {
    throw new WebhookError('Invalid GitHub webhook signature');
  }

  return JSON.parse(payload);
}

/**
 * Slack webhook verification.
 */
export function verifySlackWebhook(body, timestamp, signature, secret) {
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
    throw new WebhookError('Slack request too old');
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const expected = 'v0=' + crypto
    .createHmac('sha256', secret)
    .update(sigBasestring)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    throw new WebhookError('Invalid Slack signature');
  }

  return JSON.parse(body);
}


// ============================================
// 3. IDEMPOTENT EVENT PROCESSOR
// ============================================
export class WebhookProcessor {
  /**
   * @param {object} options
   * @param {object} options.store - Persistence store (must implement has/set/delete)
   * @param {object} options.handlers - Event type → handler function map
   * @param {number} options.dedupeWindowMs - Deduplication window (default: 24h)
   */
  constructor(options = {}) {
    this.store = options.store ?? new InMemoryStore();
    this.handlers = options.handlers ?? {};
    this.dedupeWindow = options.dedupeWindowMs ?? 24 * 60 * 60 * 1000;
    this.deadLetterHandler = options.onDeadLetter ?? null;
  }

  /**
   * Process a webhook event idempotently.
   */
  async process(event) {
    const eventId = event.id || event.idempotency_key;

    if (!eventId) {
      throw new WebhookError('Event missing id for idempotency');
    }

    // Check if already processed
    if (await this.store.has(eventId)) {
      return { status: 'duplicate', eventId };
    }

    // Find handler
    const handler = this.handlers[event.type];
    if (!handler) {
      if (this.deadLetterHandler) {
        await this.deadLetterHandler(event);
      }
      return { status: 'unhandled', eventType: event.type };
    }

    // Process
    try {
      await handler(event.data || event.data?.object || event);
      await this.store.set(eventId, {
        processedAt: Date.now(),
        type: event.type,
      });
      return { status: 'processed', eventId, eventType: event.type };
    } catch (error) {
      // Don't mark as processed so it can be retried
      throw error;
    }
  }

  /**
   * Register event handlers.
   */
  on(eventType, handler) {
    this.handlers[eventType] = handler;
    return this;
  }
}


// ============================================
// 4. WEBHOOK SENDER
// ============================================
export class WebhookSender {
  /**
   * @param {object} options
   * @param {string} options.secret - Signing secret
   * @param {number} options.timeout - Request timeout ms (default: 10000)
   * @param {number} options.maxRetries - Max retry attempts (default: 5)
   * @param {string} options.algorithm - Hash algorithm (default: sha256)
   */
  constructor(options = {}) {
    this.secret = options.secret;
    this.timeout = options.timeout ?? 10000;
    this.maxRetries = options.maxRetries ?? 5;
    this.algorithm = options.algorithm ?? 'sha256';
  }

  /**
   * Send a webhook to a URL.
   */
  async send(url, eventType, payload, options = {}) {
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      data: payload,
      created_at: new Date().toISOString(),
      api_version: options.apiVersion || '2026-01-01',
    };

    const body = JSON.stringify(event);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this._sign(`${timestamp}.${body}`);

    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Id': event.id,
      'X-Webhook-Timestamp': timestamp.toString(),
      'X-Webhook-Signature': `${this.algorithm}=${signature}`,
      'User-Agent': 'WebhookSender/1.0',
    };

    // Retry with exponential backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok || (response.status >= 200 && response.status < 300)) {
          return {
            success: true,
            eventId: event.id,
            status: response.status,
            attempt: attempt + 1,
          };
        }

        // 4xx = client error (don't retry, it's their problem)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            eventId: event.id,
            status: response.status,
            attempt: attempt + 1,
            permanent: true,
          };
        }

        // 5xx = server error (retry)
      } catch (err) {
        if (attempt === this.maxRetries) {
          return {
            success: false,
            eventId: event.id,
            error: err.message,
            attempt: attempt + 1,
          };
        }
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(r => setTimeout(r, delay));
    }

    return {
      success: false,
      eventId: event.id,
      error: 'Max retries exceeded',
      attempt: this.maxRetries + 1,
    };
  }

  _sign(payload) {
    return crypto
      .createHmac(this.algorithm, this.secret)
      .update(payload)
      .digest('hex');
  }
}


// ============================================
// HELPERS
// ============================================

class WebhookError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WebhookError';
    this.status = 401;
  }
}

class InMemoryStore {
  constructor() { this.data = new Map(); }
  async has(key) { return this.data.has(key); }
  async set(key, value) { this.data.set(key, value); }
  async delete(key) { this.data.delete(key); }
}

export { WebhookError };
