/**
 * API & Integration Mastery — Universal HTTP Client (2026)
 * =========================================================
 * Production-ready HTTP client with retries, timeouts,
 * interceptors, request/response logging, and rate limiting.
 *
 * Zero dependencies — uses native fetch (Node.js 22+).
 */

// ============================================
// API ERROR CLASS
// ============================================
export class APIError extends Error {
  constructor(message, status, code = 'API_ERROR', details = null, headers = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.headers = headers;
    this.isRetryable = [408, 429, 500, 502, 503, 504].includes(status);
  }
}


// ============================================
// HTTP CLIENT
// ============================================
export class HttpClient {
  /**
   * @param {string} baseURL - Base URL for all requests
   * @param {object} options
   * @param {number} options.timeout - Request timeout in ms (default: 30000)
   * @param {number} options.retries - Max retries for retryable errors (default: 3)
   * @param {number} options.retryDelay - Base delay between retries in ms (default: 1000)
   * @param {object} options.headers - Default headers for all requests
   * @param {Function} options.onRequest - Request interceptor(config)
   * @param {Function} options.onResponse - Response interceptor(response, config)
   * @param {Function} options.onError - Error interceptor(error, config)
   * @param {Function} options.onRetry - Called before each retry(attempt, error)
   * @param {boolean} options.logRequests - Log all requests (default: false)
   */
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.timeout = options.timeout ?? 30000;
    this.retries = options.retries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.logRequests = options.logRequests ?? false;

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': options.userAgent ?? 'HttpClient/1.0',
      ...options.headers,
    };

    // Interceptors
    this.onRequest = options.onRequest ?? null;
    this.onResponse = options.onResponse ?? null;
    this.onError = options.onError ?? null;
    this.onRetry = options.onRetry ?? null;
  }


  // ---- Core Request Method ----
  async request(method, path, options = {}) {
    let url = `${this.baseURL}${path}`;

    // Query parameters
    if (options.params) {
      const filtered = Object.fromEntries(
        Object.entries(options.params).filter(([, v]) => v != null)
      );
      if (Object.keys(filtered).length > 0) {
        const search = new URLSearchParams(filtered);
        url += (url.includes('?') ? '&' : '?') + search.toString();
      }
    }

    // Build config
    const config = {
      method: method.toUpperCase(),
      headers: { ...this.defaultHeaders, ...options.headers },
    };

    // Body
    if (options.body && !['GET', 'HEAD'].includes(config.method)) {
      if (options.body instanceof FormData) {
        config.body = options.body;
        delete config.headers['Content-Type']; // Let browser set multipart boundary
      } else if (typeof options.body === 'string') {
        config.body = options.body;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    // Request interceptor
    if (this.onRequest) {
      await this.onRequest(config, { method, path, url });
    }

    // Retry loop
    let lastError;
    const maxAttempts = options.retries ?? this.retries;

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutMs = options.timeout ?? this.timeout;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const startTime = Date.now();

      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        // Logging
        if (this.logRequests) {
          console.log(`${config.method} ${url} → ${response.status} (${duration}ms)`);
        }

        // Response interceptor
        if (this.onResponse) {
          await this.onResponse(response, { method, path, url, duration, attempt });
        }

        // Handle non-OK responses
        if (!response.ok) {
          const error = await this._buildError(response);

          // Should we retry?
          if (error.isRetryable && attempt < maxAttempts) {
            lastError = error;
            await this._waitBeforeRetry(attempt, error);
            if (this.onRetry) this.onRetry(attempt + 1, error);
            continue;
          }

          throw error;
        }

        // Parse response
        return await this._parseResponse(response);

      } catch (err) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        // Timeout
        if (err.name === 'AbortError') {
          const timeoutError = new APIError(
            `Request timeout after ${timeoutMs}ms`, 408, 'TIMEOUT'
          );
          if (attempt < maxAttempts) {
            lastError = timeoutError;
            await this._waitBeforeRetry(attempt, timeoutError);
            if (this.onRetry) this.onRetry(attempt + 1, timeoutError);
            continue;
          }
          throw timeoutError;
        }

        // Network error
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' ||
            err.code === 'ENOTFOUND' || err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
          const netError = new APIError(
            `Network error: ${err.message}`, 0, 'NETWORK_ERROR'
          );
          netError.isRetryable = true;
          if (attempt < maxAttempts) {
            lastError = netError;
            await this._waitBeforeRetry(attempt, netError);
            if (this.onRetry) this.onRetry(attempt + 1, netError);
            continue;
          }
          throw netError;
        }

        // Error interceptor
        if (this.onError) {
          this.onError(err, { method, path, url, duration, attempt });
        }

        if (attempt === maxAttempts) throw err;
        lastError = err;
        await this._waitBeforeRetry(attempt, err);
      }
    }

    throw lastError;
  }


  // ---- Convenience Methods ----
  get(path, params, options = {})   { return this.request('GET', path, { params, ...options }); }
  post(path, body, options = {})    { return this.request('POST', path, { body, ...options }); }
  put(path, body, options = {})     { return this.request('PUT', path, { body, ...options }); }
  patch(path, body, options = {})   { return this.request('PATCH', path, { body, ...options }); }
  delete(path, options = {})        { return this.request('DELETE', path, options); }
  head(path, options = {})          { return this.request('HEAD', path, options); }


  // ---- Auth Helpers ----
  setBearerToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    return this;
  }

  setApiKey(key, headerName = 'X-API-Key') {
    this.defaultHeaders[headerName] = key;
    return this;
  }

  setBasicAuth(username, password) {
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    this.defaultHeaders['Authorization'] = `Basic ${encoded}`;
    return this;
  }

  clearAuth() {
    delete this.defaultHeaders['Authorization'];
    delete this.defaultHeaders['X-API-Key'];
    return this;
  }


  // ---- Upload Helper ----
  async upload(path, file, fieldName = 'file', extraFields = {}) {
    const formData = new FormData();
    formData.append(fieldName, file);
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

    return this.post(path, formData, {
      headers: {},  // Remove Content-Type; let browser set boundary
    });
  }


  // ---- Private Helpers ----
  async _parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    }
    if (contentType.includes('text/')) {
      return response.text();
    }
    if (contentType.includes('application/octet-stream') ||
        contentType.includes('image/') ||
        contentType.includes('audio/') ||
        contentType.includes('video/')) {
      return response.arrayBuffer();
    }

    // Fallback: try JSON, then text
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async _buildError(response) {
    let message = response.statusText;
    let code = 'API_ERROR';
    let details = null;

    try {
      const body = await response.json();
      message = body.error?.message || body.message || message;
      code = body.error?.code || code;
      details = body.error?.details || null;
    } catch {
      // Response body is not JSON
    }

    return new APIError(message, response.status, code, details, response.headers);
  }

  async _waitBeforeRetry(attempt, error) {
    // Respect Retry-After header
    if (error.headers?.get?.('retry-after')) {
      const retryAfter = parseInt(error.headers.get('retry-after'));
      if (!isNaN(retryAfter)) {
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        return;
      }
    }

    // Exponential backoff with jitter
    const delay = Math.min(this.retryDelay * Math.pow(2, attempt), 30000);
    const jitter = delay * 0.2 * Math.random();
    await new Promise(r => setTimeout(r, delay + jitter));
  }
}


// ============================================
// FACTORY — Pre-configured Clients
// ============================================

/**
 * Create an API client with sensible defaults.
 * @param {string} baseURL
 * @param {string} authToken - Bearer token
 */
export function createClient(baseURL, authToken) {
  const client = new HttpClient(baseURL, {
    timeout: 15000,
    retries: 3,
    logRequests: process.env.NODE_ENV === 'development',
  });

  if (authToken) {
    client.setBearerToken(authToken);
  }

  return client;
}
