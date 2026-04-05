---
name: api-integration-mastery
description: >
  Comprehensive API & Integration skill covering REST API design and consumption,
  GraphQL, WebSocket, OAuth 2.0/OIDC, webhook patterns, third-party service integration,
  SDK/client library design, API gateway patterns, rate limiting, retry strategies,
  circuit breakers, and production-grade error handling. Use when building, consuming,
  or integrating any API — internal or external. Covers OpenAPI 3.1, fetch/axios patterns,
  Stripe/AWS/Twilio/SendGrid integrations, and 2026 best practices.
---

# API & Integration Mastery Skill

A complete, opinionated guide for designing, building, consuming, and integrating APIs
and third-party services in production applications. This skill covers both the server
side (building APIs) and client side (consuming APIs & integrating services).

---

## When to Use This Skill

- Building a **REST API** with proper OpenAPI documentation
- Consuming **external APIs** (Stripe, AWS, Google, GitHub, etc.)
- Implementing **OAuth 2.0 / OIDC** authentication flows
- Setting up **webhook receivers** and event-driven integrations
- Building **GraphQL** APIs or consuming GraphQL endpoints
- Implementing **real-time communication** (WebSocket, SSE, long-polling)
- Designing **SDK / client libraries** for your API
- Configuring **API gateways** and reverse proxies
- Implementing **retry strategies, circuit breakers, and rate limiting**
- Handling **file uploads** to S3/R2/cloud storage
- Sending **emails, SMS, push notifications** via third-party services
- Integrating **payment processors** (Stripe, PayPal, Razorpay)
- Building **event-driven architectures** with message queues

---

## Architecture Principles

### 1. Design Consumer-First
Build APIs from the consumer's perspective. What data do they need? In what shape?
Never expose internal database structure directly.

### 2. Fail Gracefully with External Services
External APIs WILL fail. Every integration must handle:
- Timeouts (set explicit, aggressive timeouts)
- Retries with exponential backoff
- Circuit breakers for cascading failure prevention
- Fallback behavior when service is unavailable

### 3. Never Trust External Data
Always validate and sanitize data from external APIs, webhooks, and user input.
Schema-validate with Zod before processing.

### 4. Idempotency Everywhere
Use idempotency keys for payment processing, webhook handling, and retryable operations.
The same request sent twice should produce the same result.

### 5. Secrets Never in Code
API keys, tokens, and credentials go in environment variables or secret managers.
Never commit to git. Use `.env` files locally, vault/KMS in production.

### 6. Log Everything, Expose Nothing
Log all API calls (request/response) for debugging but redact sensitive data
(tokens, passwords, PII, card numbers).

---

## Universal HTTP Client

### Fetch API (Modern Standard — 2026)

```javascript
// The modern way — Node.js 22+ has native fetch
// No external dependencies needed

class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.onRequest = options.onRequest || null;   // request interceptor
    this.onResponse = options.onResponse || null;  // response interceptor
    this.onError = options.onError || null;         // error interceptor
  }

  async request(method, path, options = {}) {
    const url = `${this.baseURL}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const config = {
      method,
      headers: { ...this.headers, ...options.headers },
      signal: controller.signal,
    };

    if (options.body && !['GET', 'HEAD'].includes(method)) {
      config.body = JSON.stringify(options.body);
    }

    if (options.params) {
      const search = new URLSearchParams(options.params);
      const separator = url.includes('?') ? '&' : '?';
      url += separator + search.toString();
    }

    // Request interceptor
    if (this.onRequest) await this.onRequest(config);

    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Response interceptor
        if (this.onResponse) await this.onResponse(response);

        if (!response.ok) {
          const error = await this._parseError(response);
          if (!this._isRetryable(response.status) || attempt === this.retries) {
            throw error;
          }
          lastError = error;
          await this._delay(attempt);
          continue;
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }
        if (contentType?.includes('text/')) {
          return await response.text();
        }
        return response;

      } catch (err) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT');
        }

        if (this.onError) this.onError(err);

        if (attempt === this.retries) throw err;
        lastError = err;
        await this._delay(attempt);
      }
    }
    throw lastError;
  }

  // Convenience methods
  get(path, params)         { return this.request('GET', path, { params }); }
  post(path, body, opts)    { return this.request('POST', path, { body, ...opts }); }
  put(path, body, opts)     { return this.request('PUT', path, { body, ...opts }); }
  patch(path, body, opts)   { return this.request('PATCH', path, { body, ...opts }); }
  delete(path, opts)        { return this.request('DELETE', path, opts); }

  // Set auth token
  setToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  setApiKey(key, headerName = 'X-API-Key') {
    this.headers[headerName] = key;
    return this;
  }

  // Private helpers
  _isRetryable(status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  _delay(attempt) {
    const ms = Math.min(1000 * Math.pow(2, attempt), 30000);
    const jitter = ms * 0.1 * Math.random();
    return new Promise(r => setTimeout(r, ms + jitter));
  }

  async _parseError(response) {
    try {
      const body = await response.json();
      return new APIError(
        body.error?.message || body.message || response.statusText,
        response.status,
        body.error?.code || 'API_ERROR',
        body.error?.details || null
      );
    } catch {
      return new APIError(response.statusText, response.status);
    }
  }
}

class APIError extends Error {
  constructor(message, status, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
```

### Usage Examples

```javascript
// Initialize client
const api = new APIClient('https://api.example.com/v1', {
  timeout: 10000,
  retries: 3,
  headers: { 'X-API-Key': process.env.API_KEY },
});

// GET with query params
const users = await api.get('/users', { page: 1, limit: 20 });

// POST with body
const user = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// With auth token
api.setToken(accessToken);
const profile = await api.get('/me');

// Error handling
try {
  await api.post('/orders', orderData);
} catch (err) {
  if (err instanceof APIError) {
    console.error(`API Error ${err.status}: ${err.message}`);
    if (err.status === 429) {
      // Rate limited — wait and retry
    }
  }
}
```

---

## REST API Design (Building APIs)

### URL Convention Reference

```
# Standard CRUD
GET    /api/v1/resources              List (paginated)
GET    /api/v1/resources/:id          Get one
POST   /api/v1/resources              Create
PATCH  /api/v1/resources/:id          Partial update
PUT    /api/v1/resources/:id          Full replace
DELETE /api/v1/resources/:id          Delete

# Nested resources
GET    /api/v1/users/:userId/orders   User's orders
POST   /api/v1/users/:userId/orders   Create order for user

# Actions (non-CRUD verbs)
POST   /api/v1/orders/:id/cancel      Cancel order
POST   /api/v1/users/:id/verify       Verify user
POST   /api/v1/auth/login             Login
POST   /api/v1/auth/refresh           Refresh token

# Filtering, Search, Sort, Pagination
GET    /api/v1/users?status=active&role=admin
GET    /api/v1/users?q=john&fields=name,email
GET    /api/v1/users?sort=-createdAt,name
GET    /api/v1/users?page=2&limit=20
GET    /api/v1/users?cursor=abc123&limit=20

# Batch operations
POST   /api/v1/users/batch            Batch create
DELETE /api/v1/users/batch            Batch delete (body: {ids: [...]})
```

### Standard Response Envelope

```javascript
// Success (single resource)
{
  "status": "success",
  "data": { "id": "1", "name": "John", ... },
  "message": "User created successfully"   // optional
}

// Success (list with pagination)
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}

// Error
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email" }
    ]
  },
  "requestId": "req_abc123"
}
```

### HTTP Status Codes Quick Reference

```
200 OK              GET/PATCH/PUT success
201 Created         POST success (include Location header)
204 No Content      DELETE success
301 Moved           Resource permanently moved
304 Not Modified    Conditional GET, use cache

400 Bad Request     Validation error
401 Unauthorized    No/invalid auth credentials
403 Forbidden       Auth valid but insufficient permissions
404 Not Found       Resource doesn't exist
405 Not Allowed     HTTP method not supported
409 Conflict        Duplicate/state conflict
413 Too Large       Request body/file too large
415 Unsupported     Wrong Content-Type
422 Unprocessable   Semantically invalid request
429 Too Many        Rate limited (include Retry-After header)

500 Internal        Unexpected server error
502 Bad Gateway     Upstream service error
503 Unavailable     Server overloaded/maintenance
504 Timeout         Upstream service timeout
```

### API Versioning Strategies

```
# URL Path (RECOMMENDED — most explicit)
/api/v1/users
/api/v2/users

# Query Parameter
/api/users?version=1

# Header
Accept: application/vnd.myapi.v1+json

# Date-based (Stripe style)
Stripe-Version: 2024-12-18
```

---

## OpenAPI 3.1 Specification

```yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: Production API documentation
  contact:
    name: API Support
    email: api@example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: http://localhost:3000/api/v1
    description: Development

security:
  - BearerAuth: []

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1, minimum: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
        - name: sort
          in: query
          schema: { type: string, enum: [createdAt, -createdAt, name] }
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string, example: success }
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/User' }
                  meta: { $ref: '#/components/schemas/Pagination' }
        '401': { $ref: '#/components/responses/Unauthorized' }

    post:
      summary: Create user
      operationId: createUser
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateUser' }
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string }
                  data: { $ref: '#/components/schemas/User' }
        '400': { $ref: '#/components/responses/ValidationError' }
        '409': { $ref: '#/components/responses/Conflict' }

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKey:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    User:
      type: object
      properties:
        id:    { type: string, format: cuid }
        name:  { type: string }
        email: { type: string, format: email }
        role:  { type: string, enum: [USER, ADMIN] }
        createdAt: { type: string, format: date-time }

    CreateUser:
      type: object
      required: [name, email, password]
      properties:
        name:     { type: string, minLength: 2, maxLength: 100 }
        email:    { type: string, format: email }
        password: { type: string, minLength: 8 }

    Pagination:
      type: object
      properties:
        total:      { type: integer }
        page:       { type: integer }
        limit:      { type: integer }
        totalPages: { type: integer }
        hasNext:    { type: boolean }
        hasPrev:    { type: boolean }

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              status: { type: string, example: error }
              error:
                type: object
                properties:
                  code: { type: string, example: UNAUTHORIZED }
                  message: { type: string }

    ValidationError:
      description: Invalid input
      content:
        application/json:
          schema:
            type: object
            properties:
              status: { type: string, example: error }
              error:
                type: object
                properties:
                  code: { type: string, example: VALIDATION_ERROR }
                  message: { type: string }
                  details:
                    type: array
                    items:
                      type: object
                      properties:
                        field: { type: string }
                        message: { type: string }

    Conflict:
      description: Resource conflict
```

---

## OAuth 2.0 & Authentication Integration

### OAuth 2.0 Authorization Code Flow (PKCE)

```javascript
// Step 1: Generate PKCE challenge
import crypto from 'node:crypto';

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

// Step 2: Build authorization URL
function buildAuthURL(provider, config) {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  // Store verifier + state in session
  return {
    url: `${provider.authorizationUrl}?${params}`,
    state,
    verifier,
  };
}

// Step 3: Exchange code for tokens
async function exchangeCodeForTokens(provider, code, verifier, config) {
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return response.json();
  // Returns: { access_token, refresh_token, expires_in, token_type, id_token }
}

// Step 4: Refresh access token
async function refreshAccessToken(provider, refreshToken, config) {
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}
```

### Provider Configurations

```javascript
const OAUTH_PROVIDERS = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopes: ['openid', 'email', 'profile'],
    // Token response includes id_token (OIDC)
  },

  github: {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['read:user', 'user:email'],
  },

  microsoft: {
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['openid', 'email', 'profile', 'User.Read'],
  },

  discord: {
    authorizationUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
    scopes: ['identify', 'email'],
  },
};
```

---

## Webhook Integration

### Receiving Webhooks (Server)

```javascript
import crypto from 'node:crypto';
import express from 'express';

const router = express.Router();

// 1. RAW BODY — Webhooks need raw body for signature verification
// Must be registered BEFORE express.json()
router.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body; // Buffer

    // 2. VERIFY SIGNATURE (Stripe example)
    try {
      const event = verifyStripeWebhook(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

      // 3. IDEMPOTENCY — Check if already processed
      const processed = await isEventProcessed(event.id);
      if (processed) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      // 4. RESPOND IMMEDIATELY (200) — Process async
      res.status(200).json({ received: true });

      // 5. PROCESS IN BACKGROUND
      await processWebhookEvent(event);
      await markEventProcessed(event.id);

    } catch (err) {
      console.error('Webhook error:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }
);

// Generic HMAC signature verification
function verifyWebhookSignature(payload, signature, secret, algorithm = 'sha256') {
  const expected = crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest('hex');

  const sig = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  // Timing-safe comparison (prevent timing attacks)
  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

// Event processor with routing
async function processWebhookEvent(event) {
  const handlers = {
    'payment_intent.succeeded': handlePaymentSuccess,
    'payment_intent.failed': handlePaymentFailed,
    'customer.subscription.created': handleSubscriptionCreated,
    'customer.subscription.deleted': handleSubscriptionCanceled,
    'invoice.paid': handleInvoicePaid,
    'invoice.payment_failed': handleInvoicePaymentFailed,
  };

  const handler = handlers[event.type];
  if (handler) {
    await handler(event.data.object);
  } else {
    console.log(`Unhandled webhook event: ${event.type}`);
  }
}
```

### Sending Webhooks (Your API → Consumers)

```javascript
class WebhookDispatcher {
  constructor(options = {}) {
    this.secret = options.secret;
    this.timeout = options.timeout || 10000;
    this.maxRetries = options.maxRetries || 5;
  }

  async dispatch(url, event, payload) {
    const body = JSON.stringify({
      id: crypto.randomUUID(),
      type: event,
      data: payload,
      created_at: new Date().toISOString(),
    });

    const signature = this._sign(body);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
            'X-Webhook-Id': crypto.randomUUID(),
            'X-Webhook-Timestamp': Date.now().toString(),
          },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) return { success: true, attempt };

        // Don't retry 4xx (client error on their side)
        if (response.status >= 400 && response.status < 500) {
          return { success: false, status: response.status, attempt };
        }

      } catch (err) {
        if (attempt === this.maxRetries) {
          return { success: false, error: err.message, attempt };
        }
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  _sign(payload) {
    return crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
  }
}
```

---

## Retry Strategies & Circuit Breakers

### Exponential Backoff with Jitter

```javascript
class RetryStrategy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelay = options.baseDelay ?? 1000;      // 1 second
    this.maxDelay = options.maxDelay ?? 30000;        // 30 seconds
    this.jitter = options.jitter ?? true;
    this.retryableErrors = options.retryableErrors ?? [408, 429, 500, 502, 503, 504];
  }

  async execute(fn) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;

        if (attempt === this.maxRetries) break;
        if (!this._isRetryable(error)) break;

        const delay = this._calculateDelay(attempt, error);
        console.warn(`Retry ${attempt + 1}/${this.maxRetries} in ${delay}ms: ${error.message}`);
        await this._sleep(delay);
      }
    }

    throw lastError;
  }

  _isRetryable(error) {
    if (error.status && this.retryableErrors.includes(error.status)) return true;
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
    if (error.name === 'AbortError') return true;
    return false;
  }

  _calculateDelay(attempt, error) {
    // Respect Retry-After header (429 responses)
    if (error.headers?.get?.('retry-after')) {
      const retryAfter = parseInt(error.headers.get('retry-after'));
      if (!isNaN(retryAfter)) return retryAfter * 1000;
    }

    let delay = Math.min(this.baseDelay * Math.pow(2, attempt), this.maxDelay);
    if (this.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5); // 50-100% jitter
    }
    return Math.floor(delay);
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 60000;    // 1 minute
    this.halfOpenMax = options.halfOpenMax ?? 1;

    this.state = 'CLOSED';      // CLOSED | OPEN | HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenAttempts = 0;
      } else {
        throw new CircuitBreakerError('Circuit is OPEN — service unavailable');
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenAttempts >= this.halfOpenMax) {
      throw new CircuitBreakerError('Circuit is HALF_OPEN — max attempts reached');
    }

    try {
      if (this.state === 'HALF_OPEN') this.halfOpenAttempts++;
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure();
      throw error;
    }
  }

  _onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('Circuit breaker: CLOSED (recovered)');
    }
  }

  _onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker: OPEN (${this.failures} failures)`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime,
    };
  }
}

class CircuitBreakerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.status = 503;
  }
}

// Usage:
// const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000 });
// const result = await breaker.execute(() => api.get('/health'));
```

---

## Rate Limiting (Client-Side)

```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const waitMs = this.requests[0] + this.windowMs - now;
      await new Promise(r => setTimeout(r, waitMs));
      return this.acquire();
    }

    this.requests.push(now);
  }

  // Wrap an async function with rate limiting
  wrap(fn) {
    return async (...args) => {
      await this.acquire();
      return fn(...args);
    };
  }
}

// Usage: max 100 requests per 60 seconds
// const limiter = new RateLimiter(100, 60000);
// const rateLimitedFetch = limiter.wrap(fetch);
```

---

## File Upload Integration (S3 / Cloudflare R2)

```javascript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }
  from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import path from 'node:path';

class FileStorage {
  constructor(config) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region || 'auto',
      endpoint: config.endpoint,         // For R2: https://xxx.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.publicUrl = config.publicUrl;   // CDN URL prefix
  }

  async upload(file, options = {}) {
    const ext = path.extname(file.originalname);
    const key = options.key || `${options.folder || 'uploads'}/${crypto.randomUUID()}${ext}`;

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      Metadata: options.metadata || {},
    }));

    return {
      key,
      url: this.publicUrl ? `${this.publicUrl}/${key}` : key,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async getPresignedUploadUrl(key, contentType, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getPresignedDownloadUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key) {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
```

---

## Email Integration

```javascript
// Nodemailer + Resend example
class EmailService {
  constructor(config) {
    this.provider = config.provider;  // 'resend' | 'sendgrid' | 'smtp'
    this.from = config.from;
    this.apiKey = config.apiKey;
  }

  async send({ to, subject, html, text, replyTo }) {
    switch (this.provider) {
      case 'resend':
        return this._sendResend({ to, subject, html, text, replyTo });
      case 'sendgrid':
        return this._sendSendGrid({ to, subject, html, text, replyTo });
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  async _sendResend({ to, subject, html, text, replyTo }) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Email failed: ${error.message}`);
    }
    return response.json();
  }

  async _sendSendGrid({ to, subject, html, text }) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: this.from },
        subject,
        content: [
          ...(text ? [{ type: 'text/plain', value: text }] : []),
          ...(html ? [{ type: 'text/html', value: html }] : []),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.status}`);
    }
  }
}
```

---

## Payment Integration (Stripe)

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18',
});

// Create checkout session
async function createCheckoutSession(priceId, customerId, successUrl, cancelUrl) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',           // or 'payment' for one-time
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    payment_method_types: ['card'],
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });
}

// Create customer
async function createCustomer(email, name, metadata = {}) {
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}

// Create payment intent (custom flow)
async function createPaymentIntent(amount, currency, customerId) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),  // Convert to cents
    currency,
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    idempotency_key: `pi_${customerId}_${Date.now()}`, // Prevent duplicates
  });
}

// Handle subscription webhook events
async function handleSubscriptionEvent(event) {
  const subscription = event.data.object;

  switch (event.type) {
    case 'customer.subscription.created':
      await db.user.update({
        where: { stripeCustomerId: subscription.customer },
        data: {
          subscriptionId: subscription.id,
          plan: subscription.items.data[0].price.id,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;

    case 'customer.subscription.deleted':
      await db.user.update({
        where: { stripeCustomerId: subscription.customer },
        data: { status: 'CANCELED', plan: null },
      });
      break;

    case 'invoice.payment_failed':
      await db.user.update({
        where: { stripeCustomerId: subscription.customer },
        data: { status: 'PAST_DUE' },
      });
      // Send email notification
      break;
  }
}
```

---

## WebSocket & Real-Time Patterns

### Server-Sent Events (SSE) — Simpler Alternative

```javascript
// Server (Express)
app.get('/api/v1/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Send events
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping', time: Date.now() })}\n\n`);
  }, 30000);

  // Custom event emitter
  const handler = (data) => {
    res.write(`event: notification\ndata: ${JSON.stringify(data)}\n\n`);
  };
  eventEmitter.on('notification', handler);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    eventEmitter.off('notification', handler);
  });
});

// Client (Browser)
const eventSource = new EventSource('/api/v1/events');
eventSource.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
eventSource.addEventListener('notification', (e) => {
  console.log('Notification:', JSON.parse(e.data));
});
eventSource.onerror = () => console.error('SSE connection error');
```

---

## GraphQL Integration

### Apollo Client Setup (Frontend)

```javascript
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({ uri: '/api/graphql' });

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: localStorage.getItem('token')
      ? `Bearer ${localStorage.getItem('token')}`
      : '',
  },
}));

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
});

// Queries
const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      name
      email
      avatar
    }
  }
`;

// Mutations
const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;
```

---

## Integration Testing

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { APIClient } from './client.js';

describe('External API Integration', () => {
  const api = new APIClient(process.env.API_BASE_URL);

  it('handles successful response', async () => {
    const result = await api.get('/health');
    expect(result.status).toBe('healthy');
  });

  it('handles 404 gracefully', async () => {
    await expect(api.get('/nonexistent'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('handles timeout', async () => {
    const slowApi = new APIClient(process.env.API_BASE_URL, { timeout: 1 });
    await expect(slowApi.get('/slow'))
      .rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('retries on 503', async () => {
    const retry = new RetryStrategy({ maxRetries: 2, baseDelay: 100 });
    let attempts = 0;

    await retry.execute(async () => {
      attempts++;
      if (attempts < 3) throw { status: 503 };
      return { ok: true };
    });

    expect(attempts).toBe(3);
  });
});
```

---

## Security Checklist for API Integrations

- [ ] **API keys** stored in environment variables (never in code)
- [ ] **Secrets** rotated periodically (90 days minimum)
- [ ] **HTTPS** used for ALL external API calls
- [ ] **Webhook signatures** verified before processing
- [ ] **Input validated** from external APIs with Zod
- [ ] **Rate limiting** implemented for outgoing calls
- [ ] **Timeouts** set on every external request (5-30s max)
- [ ] **Retry logic** with exponential backoff
- [ ] **Circuit breaker** for critical third-party dependencies
- [ ] **PII/secrets redacted** from logs
- [ ] **Idempotency keys** used for payment/mutation operations
- [ ] **Error responses** don't expose internal details
- [ ] **Token refresh** implemented for OAuth integrations
- [ ] **Scopes limited** to minimum required permissions
- [ ] **IP allowlisting** for webhook sources (where supported)

---

## Anti-Patterns to Avoid

❌ **Never store API keys in source code** — use environment variables  
❌ **Never trust webhook payloads without signature verification**  
❌ **Never make external calls without timeouts** — set 5-30s max  
❌ **Never retry without backoff** — you'll DDoS the service  
❌ **Never ignore rate limit headers** — respect Retry-After  
❌ **Never process webhooks synchronously** — respond 200, then process async  
❌ **Never expose upstream error details** — wrap in your own error format  
❌ **Never hardcode URLs** — use configs for different environments  
❌ **Never skip idempotency** for payments/financial operations  
❌ **Never poll when webhooks/SSE are available** — push > pull  
❌ **Never log full request/response bodies in production** — redact PII  
❌ **Never treat 3rd-party APIs as 100% reliable** — always have fallbacks  
