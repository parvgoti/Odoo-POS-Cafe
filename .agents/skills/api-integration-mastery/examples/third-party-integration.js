/**
 * API & Integration Mastery — Third-Party API Integration Pattern (2026)
 * ======================================================================
 * Production pattern for integrating any third-party API.
 * Wraps the external service with retry, circuit breaker,
 * caching, error normalization, and health monitoring.
 *
 * This example shows a generic "ExternalService" class that
 * you can adapt for any API (Twilio, SendGrid, OpenAI, etc.)
 */

import { HttpClient, APIError } from '../resources/rest/http-client.js';
import { CircuitBreaker } from '../resources/resilience/retry-circuit-breaker.js';


// ============================================
// BASE: Third-Party Service Wrapper
// ============================================
export class ThirdPartyService {
  /**
   * @param {object} config
   * @param {string} config.name - Service name (for logging)
   * @param {string} config.baseURL
   * @param {string} config.apiKey
   * @param {number} config.timeout - Request timeout ms
   * @param {number} config.maxRetries
   * @param {object} config.circuitBreakerOptions
   * @param {object} config.cache - Cache instance (must implement get/set)
   */
  constructor(config) {
    this.name = config.name;
    this.cache = config.cache || null;

    // HTTP client
    this.client = new HttpClient(config.baseURL, {
      timeout: config.timeout || 10000,
      retries: config.maxRetries || 3,
      headers: this._buildAuthHeaders(config),
      logRequests: config.debug || false,
      onError: (err) => {
        console.error(`[${this.name}] API Error:`, err.message);
      },
    });

    // Circuit breaker
    this.breaker = new CircuitBreaker({
      name: config.name,
      failureThreshold: config.circuitBreakerOptions?.failureThreshold ?? 5,
      resetTimeout: config.circuitBreakerOptions?.resetTimeout ?? 60000,
      onStateChange: (from, to, name) => {
        console.warn(`[${name}] Circuit: ${from} → ${to}`);
      },
    });
  }

  /**
   * Execute a request through the circuit breaker.
   */
  async _execute(method, path, options = {}) {
    // Check cache for GET requests
    if (method === 'GET' && this.cache) {
      const cacheKey = `${this.name}:${path}:${JSON.stringify(options.params || {})}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // Execute through circuit breaker
    const result = await this.breaker.execute(
      () => this.client.request(method, path, options),
      options.fallback || null
    );

    // Cache successful GET responses
    if (method === 'GET' && this.cache && result) {
      const cacheKey = `${this.name}:${path}:${JSON.stringify(options.params || {})}`;
      await this.cache.set(cacheKey, result, options.cacheTTL || 300);
    }

    return result;
  }

  /**
   * Health check — call the service's health/ping endpoint.
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await this.client.get('/health', null, { retries: 0, timeout: 5000 });
      return {
        service: this.name,
        status: 'healthy',
        responseTime: Date.now() - start,
        circuit: this.breaker.getMetrics(),
      };
    } catch (err) {
      return {
        service: this.name,
        status: 'unhealthy',
        error: err.message,
        circuit: this.breaker.getMetrics(),
      };
    }
  }

  _buildAuthHeaders(config) {
    if (config.bearerToken) return { 'Authorization': `Bearer ${config.bearerToken}` };
    if (config.apiKey && config.apiKeyHeader) return { [config.apiKeyHeader]: config.apiKey };
    if (config.apiKey) return { 'Authorization': `Bearer ${config.apiKey}` };
    return {};
  }
}


// ============================================
// EXAMPLE 1: OpenAI / LLM Integration
// ============================================
export class OpenAIService extends ThirdPartyService {
  constructor(apiKey, options = {}) {
    super({
      name: 'OpenAI',
      baseURL: 'https://api.openai.com/v1',
      bearerToken: apiKey,
      timeout: 60000,          // LLMs can be slow
      maxRetries: 2,
      circuitBreakerOptions: {
        failureThreshold: 3,
        resetTimeout: 120000,  // 2 min cooldown
      },
      ...options,
    });
  }

  async chatCompletion(messages, options = {}) {
    return this._execute('POST', '/chat/completions', {
      body: {
        model: options.model || 'gpt-4o',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: false,
      },
    });
  }

  async embedding(input) {
    return this._execute('POST', '/embeddings', {
      body: {
        model: 'text-embedding-3-small',
        input,
      },
    });
  }

  async moderateContent(input) {
    return this._execute('POST', '/moderations', {
      body: { input },
    });
  }
}


// ============================================
// EXAMPLE 2: Twilio SMS / WhatsApp
// ============================================
export class TwilioService extends ThirdPartyService {
  constructor(accountSid, authToken, fromNumber) {
    super({
      name: 'Twilio',
      baseURL: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`,
      timeout: 10000,
      maxRetries: 2,
    });

    this.accountSid = accountSid;
    this.fromNumber = fromNumber;

    // Twilio uses Basic Auth
    this.client.setBasicAuth(accountSid, authToken);
    // Twilio expects form-urlencoded
    this.client.defaultHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  async sendSMS(to, body) {
    return this._execute('POST', '/Messages.json', {
      body: new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: body,
      }).toString(),
    });
  }

  async sendWhatsApp(to, body) {
    return this._execute('POST', '/Messages.json', {
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${this.fromNumber}`,
        Body: body,
      }).toString(),
    });
  }
}


// ============================================
// EXAMPLE 3: Generic REST API
// ============================================
export class GenericAPIService extends ThirdPartyService {
  constructor(config) {
    super({
      name: config.name || 'ExternalAPI',
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      apiKeyHeader: config.apiKeyHeader || 'X-API-Key',
      timeout: config.timeout || 15000,
      maxRetries: config.maxRetries || 3,
      ...config,
    });
  }

  async get(path, params, options = {}) {
    return this._execute('GET', path, { params, ...options });
  }

  async post(path, body, options = {}) {
    return this._execute('POST', path, { body, ...options });
  }

  async put(path, body, options = {}) {
    return this._execute('PUT', path, { body, ...options });
  }

  async patch(path, body, options = {}) {
    return this._execute('PATCH', path, { body, ...options });
  }

  async delete(path, options = {}) {
    return this._execute('DELETE', path, options);
  }
}


// ============================================
// INTEGRATION HEALTH DASHBOARD
// ============================================
export class IntegrationHealthMonitor {
  constructor() {
    this.services = new Map();
  }

  register(service) {
    this.services.set(service.name, service);
  }

  async checkAll() {
    const results = await Promise.allSettled(
      Array.from(this.services.values()).map(s => s.healthCheck())
    );

    const health = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      const name = Array.from(this.services.keys())[i];
      return { service: name, status: 'error', error: r.reason?.message };
    });

    const allHealthy = health.every(h => h.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: health,
    };
  }
}


// ============================================
// USAGE EXAMPLE
// ============================================
/*
  // Initialize services
  const openai = new OpenAIService(process.env.OPENAI_API_KEY);
  const twilio = new TwilioService(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN,
    process.env.TWILIO_FROM_NUMBER
  );

  // Health monitoring
  const monitor = new IntegrationHealthMonitor();
  monitor.register(openai);
  monitor.register(twilio);

  // Health check endpoint
  app.get('/health/integrations', async (req, res) => {
    const health = await monitor.checkAll();
    const status = health.status === 'healthy' ? 200 : 503;
    res.status(status).json(health);
  });

  // Use services
  const chat = await openai.chatCompletion([
    { role: 'user', content: 'Hello!' }
  ]);

  await twilio.sendSMS('+1234567890', 'Your order is confirmed!');
*/

console.log('✅ Third-party integration patterns loaded — OpenAI, Twilio, Generic API, Health Monitor');
