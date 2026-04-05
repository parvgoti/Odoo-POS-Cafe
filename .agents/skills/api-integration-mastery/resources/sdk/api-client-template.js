/**
 * API & Integration Mastery — SDK / Client Library Template (2026)
 * =================================================================
 * Template for building a client library for your own API.
 * Users of your API import this SDK instead of crafting raw HTTP calls.
 *
 * Features:
 * - Type-safe resource methods
 * - Automatic auth management
 * - Pagination helpers
 * - Rate limiting awareness
 * - Error normalization
 * - Configurable base URL & timeout
 */


// ============================================
// SDK ERROR
// ============================================
class MyAppSDKError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'MyAppSDKError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}


// ============================================
// SDK CLIENT
// ============================================
class MyAppSDK {
  /**
   * Initialize the SDK.
   * @param {object} options
   * @param {string} options.apiKey - API key for authentication
   * @param {string} options.baseURL - Override base URL (default: production)
   * @param {number} options.timeout - Request timeout in ms (default: 15000)
   * @param {number} options.maxRetries - Max retries for failed requests (default: 3)
   */
  constructor(options = {}) {
    if (!options.apiKey) {
      throw new Error('MyAppSDK requires an apiKey');
    }

    this.apiKey = options.apiKey;
    this.baseURL = (options.baseURL || 'https://api.myapp.com/v1').replace(/\/$/, '');
    this.timeout = options.timeout || 15000;
    this.maxRetries = options.maxRetries || 3;

    // Initialize resource namespaces
    this.users = new UsersResource(this);
    this.posts = new PostsResource(this);
    this.files = new FilesResource(this);
  }

  /**
   * Core request method used by all resources.
   */
  async _request(method, path, options = {}) {
    let url = `${this.baseURL}${path}`;

    // Query params
    if (options.params) {
      const search = new URLSearchParams(
        Object.entries(options.params).filter(([, v]) => v != null)
      );
      if (search.toString()) url += `?${search}`;
    }

    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MyAppSDK/1.0.0',
        ...options.headers,
      },
    };

    if (options.body && !['GET', 'HEAD'].includes(method)) {
      config.body = options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body);

      if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    }

    // Idempotency key for mutations
    if (['POST', 'PUT', 'PATCH'].includes(method) && options.idempotencyKey) {
      config.headers['Idempotency-Key'] = options.idempotencyKey;
    }

    // Retry loop
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, { ...config, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await this._handleError(response);

          // Retry on server errors and rate limits
          if ([429, 500, 502, 503, 504].includes(response.status) && attempt < this.maxRetries) {
            lastError = error;

            // Respect Retry-After header
            const retryAfter = response.headers.get('retry-after');
            const delay = retryAfter
              ? parseInt(retryAfter) * 1000
              : Math.min(1000 * Math.pow(2, attempt), 15000);

            await new Promise(r => setTimeout(r, delay));
            continue;
          }

          throw error;
        }

        if (response.status === 204) return null;
        return response.json();

      } catch (err) {
        if (err.name === 'AbortError') {
          throw new MyAppSDKError('Request timed out', 408, 'TIMEOUT');
        }
        if (attempt === this.maxRetries) throw err;
        lastError = err;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
    throw lastError;
  }

  async _handleError(response) {
    try {
      const body = await response.json();
      return new MyAppSDKError(
        body.error?.message || body.message || response.statusText,
        response.status,
        body.error?.code || 'API_ERROR',
        body.error?.details || null
      );
    } catch {
      return new MyAppSDKError(response.statusText, response.status, 'API_ERROR');
    }
  }
}


// ============================================
// RESOURCE: Users
// ============================================
class UsersResource {
  constructor(client) {
    this._client = client;
  }

  /**
   * List users with pagination.
   * @param {object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {string} params.sort
   * @param {string} params.role
   * @param {string} params.q
   * @returns {Promise<{data: User[], meta: Pagination}>}
   */
  async list(params = {}) {
    return this._client._request('GET', '/users', { params });
  }

  /**
   * Get a single user by ID.
   * @param {string} id
   * @returns {Promise<{data: User}>}
   */
  async get(id) {
    return this._client._request('GET', `/users/${id}`);
  }

  /**
   * Create a new user.
   * @param {object} data - { name, email, password, role? }
   * @param {object} options - { idempotencyKey? }
   * @returns {Promise<{data: User}>}
   */
  async create(data, options = {}) {
    return this._client._request('POST', '/users', { body: data, ...options });
  }

  /**
   * Update a user.
   * @param {string} id
   * @param {object} data - { name?, email?, avatar? }
   * @returns {Promise<{data: User}>}
   */
  async update(id, data) {
    return this._client._request('PATCH', `/users/${id}`, { body: data });
  }

  /**
   * Delete a user.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    return this._client._request('DELETE', `/users/${id}`);
  }

  /**
   * Auto-paginate through all users.
   * @param {object} params - Filter params
   * @yields {User} Each user
   */
  async *listAll(params = {}) {
    let page = 1;
    const limit = params.limit || 100;

    while (true) {
      const response = await this.list({ ...params, page, limit });
      for (const user of response.data) {
        yield user;
      }
      if (!response.meta?.hasNext) break;
      page++;
    }
  }
}


// ============================================
// RESOURCE: Posts
// ============================================
class PostsResource {
  constructor(client) {
    this._client = client;
  }

  async list(params = {}) {
    return this._client._request('GET', '/posts', { params });
  }

  async get(id) {
    return this._client._request('GET', `/posts/${id}`);
  }

  async create(data, options = {}) {
    return this._client._request('POST', '/posts', { body: data, ...options });
  }

  async update(id, data) {
    return this._client._request('PATCH', `/posts/${id}`, { body: data });
  }

  async delete(id) {
    return this._client._request('DELETE', `/posts/${id}`);
  }

  async publish(id) {
    return this._client._request('POST', `/posts/${id}/publish`);
  }

  async unpublish(id) {
    return this._client._request('POST', `/posts/${id}/unpublish`);
  }
}


// ============================================
// RESOURCE: Files
// ============================================
class FilesResource {
  constructor(client) {
    this._client = client;
  }

  /**
   * Get a presigned upload URL.
   * @param {string} filename
   * @param {string} contentType
   * @returns {Promise<{uploadUrl: string, key: string}>}
   */
  async getUploadUrl(filename, contentType) {
    return this._client._request('POST', '/files/upload-url', {
      body: { filename, contentType },
    });
  }

  /**
   * Upload a file using presigned URL.
   * @param {string} uploadUrl - Presigned URL from getUploadUrl
   * @param {Buffer|Blob} file - File content
   * @param {string} contentType
   */
  async uploadToPresignedUrl(uploadUrl, file, contentType) {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
    });
    if (!response.ok) {
      throw new MyAppSDKError('File upload failed', response.status, 'UPLOAD_FAILED');
    }
  }

  async delete(key) {
    return this._client._request('DELETE', `/files/${encodeURIComponent(key)}`);
  }
}


// ============================================
// EXPORT
// ============================================
export { MyAppSDK, MyAppSDKError };

// Usage example:
// const sdk = new MyAppSDK({ apiKey: 'my-api-key' });
//
// const users = await sdk.users.list({ page: 1, limit: 20 });
// const user = await sdk.users.create({ name: 'John', email: 'john@example.com' });
//
// // Auto-pagination
// for await (const user of sdk.users.listAll({ role: 'ADMIN' })) {
//   console.log(user.name);
// }
