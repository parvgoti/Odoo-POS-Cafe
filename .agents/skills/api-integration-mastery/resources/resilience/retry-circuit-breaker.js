/**
 * API & Integration Mastery — Retry & Circuit Breaker (2026)
 * ===========================================================
 * Production-grade resilience patterns for external service calls.
 *
 * Includes:
 * - Exponential backoff with jitter
 * - Circuit breaker (Closed → Open → Half-Open)
 * - Bulkhead (concurrency limiter)
 * - Timeout wrapper
 * - Combined resilience pipeline
 */


// ============================================
// 1. RETRY WITH EXPONENTIAL BACKOFF
// ============================================
export class RetryPolicy {
  /**
   * @param {object} options
   * @param {number} options.maxRetries - Max retry attempts (default: 3)
   * @param {number} options.baseDelay - Initial delay in ms (default: 1000)
   * @param {number} options.maxDelay - Max delay cap in ms (default: 30000)
   * @param {number} options.factor - Exponential multiplier (default: 2)
   * @param {boolean} options.jitter - Add random jitter (default: true)
   * @param {Function} options.shouldRetry - Custom retry condition (error) => bool
   * @param {Function} options.onRetry - Callback(attempt, error, delay)
   */
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.factor = options.factor ?? 2;
    this.jitter = options.jitter ?? true;
    this.shouldRetry = options.shouldRetry ?? this._defaultShouldRetry;
    this.onRetry = options.onRetry ?? null;
  }

  async execute(fn) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;

        if (attempt === this.maxRetries) break;
        if (!this.shouldRetry(error, attempt)) break;

        const delay = this._calculateDelay(attempt, error);

        if (this.onRetry) {
          this.onRetry(attempt + 1, error, delay);
        }

        await this._sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Wrap a function to always retry on failure.
   */
  wrap(fn) {
    return (...args) => this.execute((attempt) => fn(...args, attempt));
  }

  _defaultShouldRetry(error) {
    // HTTP retryable statuses
    if (error.status && [408, 429, 500, 502, 503, 504].includes(error.status)) return true;
    // Network errors
    if (['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code)) return true;
    if (error.name === 'AbortError') return true;
    return false;
  }

  _calculateDelay(attempt, error) {
    // Respect Retry-After header
    if (error.headers?.get?.('retry-after')) {
      const ra = parseInt(error.headers.get('retry-after'));
      if (!isNaN(ra)) return ra * 1000;
    }

    let delay = Math.min(this.baseDelay * Math.pow(this.factor, attempt), this.maxDelay);

    if (this.jitter) {
      // Full jitter: random between 0 and calculated delay
      delay = Math.random() * delay;
    }

    return Math.floor(delay);
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


// ============================================
// 2. CIRCUIT BREAKER
// ============================================
/**
 * States:
 *   CLOSED   → Normal operation. Failures tracked.
 *   OPEN     → All requests fail immediately. Waits for reset timeout.
 *   HALF_OPEN → Allows limited test requests. Success → CLOSED, Fail → OPEN.
 */
export class CircuitBreaker {
  /**
   * @param {object} options
   * @param {number} options.failureThreshold - Failures before opening (default: 5)
   * @param {number} options.resetTimeout - Ms before trying half-open (default: 60000)
   * @param {number} options.halfOpenMaxAttempts - Max test requests in half-open (default: 1)
   * @param {number} options.successThreshold - Successes in half-open to close (default: 2)
   * @param {Function} options.isFailure - Custom failure detection (error) => bool
   * @param {Function} options.onStateChange - Callback(fromState, toState)
   * @param {string} options.name - Name for logging
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 60000;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts ?? 1;
    this.successThreshold = options.successThreshold ?? 2;
    this.isFailure = options.isFailure ?? (() => true);
    this.onStateChange = options.onStateChange ?? null;
    this.name = options.name ?? 'default';

    // Internal state
    this._state = 'CLOSED';
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = null;
    this._halfOpenAttempts = 0;
    this._metrics = { totalCalls: 0, totalFailures: 0, totalSuccess: 0, shortCircuits: 0 };
  }

  get state() { return this._state; }

  async execute(fn, fallback) {
    this._metrics.totalCalls++;

    // CHECK: Should we allow the request?
    if (this._state === 'OPEN') {
      const elapsed = Date.now() - this._lastFailureTime;
      if (elapsed >= this.resetTimeout) {
        this._transition('HALF_OPEN');
      } else {
        this._metrics.shortCircuits++;
        if (fallback) return fallback();
        throw new CircuitBreakerOpenError(
          `Circuit "${this.name}" is OPEN. Retry in ${Math.ceil((this.resetTimeout - elapsed) / 1000)}s.`,
          this.name
        );
      }
    }

    if (this._state === 'HALF_OPEN') {
      if (this._halfOpenAttempts >= this.halfOpenMaxAttempts) {
        this._metrics.shortCircuits++;
        if (fallback) return fallback();
        throw new CircuitBreakerOpenError(
          `Circuit "${this.name}" is HALF_OPEN — max test requests reached.`,
          this.name
        );
      }
      this._halfOpenAttempts++;
    }

    // EXECUTE the function
    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      if (this.isFailure(error)) {
        this._onFailure();
      }
      throw error;
    }
  }

  /**
   * Wrap a function so it's always protected by the circuit breaker.
   */
  wrap(fn, fallback) {
    return (...args) => this.execute(() => fn(...args), fallback);
  }

  /**
   * Force reset to CLOSED state.
   */
  reset() {
    this._transition('CLOSED');
    this._failureCount = 0;
    this._successCount = 0;
    this._halfOpenAttempts = 0;
  }

  /**
   * Get current metrics.
   */
  getMetrics() {
    return {
      name: this.name,
      state: this._state,
      failures: this._failureCount,
      successStreak: this._successCount,
      lastFailure: this._lastFailureTime
        ? new Date(this._lastFailureTime).toISOString()
        : null,
      ...this._metrics,
    };
  }

  // ---- Private ----

  _onSuccess() {
    this._metrics.totalSuccess++;
    this._failureCount = 0;

    if (this._state === 'HALF_OPEN') {
      this._successCount++;
      if (this._successCount >= this.successThreshold) {
        this._transition('CLOSED');
      }
    }
  }

  _onFailure() {
    this._metrics.totalFailures++;
    this._failureCount++;
    this._successCount = 0;
    this._lastFailureTime = Date.now();

    if (this._state === 'HALF_OPEN') {
      this._transition('OPEN');
    } else if (this._failureCount >= this.failureThreshold) {
      this._transition('OPEN');
    }
  }

  _transition(newState) {
    if (this._state === newState) return;
    const oldState = this._state;
    this._state = newState;

    if (newState === 'HALF_OPEN') {
      this._halfOpenAttempts = 0;
      this._successCount = 0;
    }

    if (this.onStateChange) {
      this.onStateChange(oldState, newState, this.name);
    }
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message, circuitName) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.status = 503;
    this.code = 'CIRCUIT_OPEN';
    this.circuitName = circuitName;
  }
}


// ============================================
// 3. BULKHEAD (Concurrency Limiter)
// ============================================
export class Bulkhead {
  /**
   * @param {number} maxConcurrent - Max simultaneous executions
   * @param {number} maxQueue - Max waiting queue size (default: Infinity)
   */
  constructor(maxConcurrent, maxQueue = Infinity) {
    this.maxConcurrent = maxConcurrent;
    this.maxQueue = maxQueue;
    this._running = 0;
    this._queue = [];
  }

  async execute(fn) {
    if (this._running >= this.maxConcurrent) {
      if (this._queue.length >= this.maxQueue) {
        throw new Error('Bulkhead queue full');
      }

      await new Promise((resolve, reject) => {
        this._queue.push({ resolve, reject });
      });
    }

    this._running++;
    try {
      return await fn();
    } finally {
      this._running--;
      if (this._queue.length > 0) {
        const next = this._queue.shift();
        next.resolve();
      }
    }
  }

  wrap(fn) {
    return (...args) => this.execute(() => fn(...args));
  }

  get stats() {
    return {
      running: this._running,
      queued: this._queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}


// ============================================
// 4. TIMEOUT WRAPPER
// ============================================
export async function withTimeout(fn, ms, message) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  try {
    const result = await Promise.race([
      fn(controller.signal),
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(message || `Operation timed out after ${ms}ms`));
        });
      }),
    ]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}


// ============================================
// 5. RESILIENCE PIPELINE (combine all patterns)
// ============================================
/**
 * Combine retry, circuit breaker, bulkhead, and timeout.
 *
 * Usage:
 *   const pipeline = new ResiliencePipeline({
 *     timeout: 5000,
 *     retry: { maxRetries: 3 },
 *     circuitBreaker: { failureThreshold: 5, resetTimeout: 30000 },
 *     bulkhead: { maxConcurrent: 10 },
 *   });
 *
 *   const result = await pipeline.execute(() => api.get('/endpoint'));
 */
export class ResiliencePipeline {
  constructor(options = {}) {
    this.timeoutMs = options.timeout ?? null;
    this.retry = options.retry ? new RetryPolicy(options.retry) : null;
    this.breaker = options.circuitBreaker ? new CircuitBreaker(options.circuitBreaker) : null;
    this.bulkhead = options.bulkhead ? new Bulkhead(
      options.bulkhead.maxConcurrent,
      options.bulkhead.maxQueue
    ) : null;
    this.fallback = options.fallback ?? null;
  }

  async execute(fn) {
    // Layer 1: Bulkhead (concurrency control)
    const bulkheadFn = this.bulkhead
      ? () => this.bulkhead.execute(fn)
      : fn;

    // Layer 2: Timeout
    const timeoutFn = this.timeoutMs
      ? () => withTimeout(bulkheadFn, this.timeoutMs)
      : bulkheadFn;

    // Layer 3: Retry
    const retryFn = this.retry
      ? () => this.retry.execute(timeoutFn)
      : timeoutFn;

    // Layer 4: Circuit Breaker
    const breakerFn = this.breaker
      ? () => this.breaker.execute(retryFn, this.fallback)
      : retryFn;

    return breakerFn();
  }

  wrap(fn) {
    return (...args) => this.execute(() => fn(...args));
  }

  getMetrics() {
    return {
      circuitBreaker: this.breaker?.getMetrics() ?? null,
      bulkhead: this.bulkhead?.stats ?? null,
    };
  }
}
