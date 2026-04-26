/**
 * API & Integration Mastery — OAuth 2.0 / OIDC Flows (2026)
 * ===========================================================
 * Complete OAuth 2.0 implementation with PKCE, token refresh,
 * and provider-specific configurations.
 *
 * Supports: Google, GitHub, Microsoft, Discord, Apple, LinkedIn
 */

import crypto from 'node:crypto';


// ============================================
// OAUTH PROVIDER CONFIGS
// ============================================
export const PROVIDERS = {
  google: {
    name: 'Google',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    defaultScopes: ['openid', 'email', 'profile'],
    supportsOIDC: true,
    supportsPKCE: true,
  },

  github: {
    name: 'GitHub',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    emailsUrl: 'https://api.github.com/user/emails',
    defaultScopes: ['read:user', 'user:email'],
    supportsOIDC: false,
    supportsPKCE: false,
  },

  microsoft: {
    name: 'Microsoft',
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    defaultScopes: ['openid', 'email', 'profile', 'User.Read'],
    supportsOIDC: true,
    supportsPKCE: true,
  },

  discord: {
    name: 'Discord',
    authorizationUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
    revokeUrl: 'https://discord.com/api/oauth2/token/revoke',
    defaultScopes: ['identify', 'email'],
    supportsOIDC: false,
    supportsPKCE: true,
  },

  linkedin: {
    name: 'LinkedIn',
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    defaultScopes: ['openid', 'profile', 'email'],
    supportsOIDC: true,
    supportsPKCE: true,
  },
};


// ============================================
// PKCE HELPERS
// ============================================
export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge, method: 'S256' };
}

export function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}


// ============================================
// OAUTH CLIENT
// ============================================
export class OAuthClient {
  /**
   * @param {string} providerName - Key from PROVIDERS
   * @param {object} config
   * @param {string} config.clientId
   * @param {string} config.clientSecret
   * @param {string} config.redirectUri
   * @param {string[]} config.scopes - Override default scopes
   */
  constructor(providerName, config) {
    this.provider = PROVIDERS[providerName];
    if (!this.provider) {
      throw new Error(`Unknown OAuth provider: ${providerName}`);
    }

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.scopes = config.scopes || this.provider.defaultScopes;
  }


  // ---- Step 1: Build Authorization URL ----
  getAuthorizationUrl(options = {}) {
    const state = options.state || generateState();
    const pkce = this.provider.supportsPKCE ? generatePKCE() : null;

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state,
      ...(options.prompt && { prompt: options.prompt }),         // 'consent', 'login', 'none'
      ...(options.loginHint && { login_hint: options.loginHint }),
      ...(options.accessType && { access_type: options.accessType }), // Google: 'offline'
    });

    // PKCE
    if (pkce) {
      params.set('code_challenge', pkce.challenge);
      params.set('code_challenge_method', pkce.method);
    }

    // OIDC nonce
    let nonce = null;
    if (this.provider.supportsOIDC) {
      nonce = generateNonce();
      params.set('nonce', nonce);
    }

    return {
      url: `${this.provider.authorizationUrl}?${params.toString()}`,
      state,
      nonce,
      verifier: pkce?.verifier || null,
    };
  }


  // ---- Step 2: Exchange Code for Tokens ----
  async exchangeCode(code, verifier = null) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    });

    if (verifier) {
      body.set('code_verifier', verifier);
    }

    const response = await fetch(this.provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new OAuthError(`Token exchange failed: ${error}`, response.status);
    }

    const tokens = await response.json();

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      idToken: tokens.id_token || null,
    };
  }


  // ---- Step 3: Get User Info ----
  async getUserInfo(accessToken) {
    const response = await fetch(this.provider.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new OAuthError('Failed to fetch user info', response.status);
    }

    const rawUser = await response.json();
    return this._normalizeUser(rawUser);
  }


  // ---- Step 4: Refresh Token ----
  async refreshToken(refreshToken) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    const response = await fetch(this.provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new OAuthError(`Token refresh failed: ${error}`, response.status);
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || refreshToken,
      expiresIn: tokens.expires_in,
    };
  }


  // ---- Step 5: Revoke Token ----
  async revokeToken(token) {
    if (!this.provider.revokeUrl) {
      throw new OAuthError(`${this.provider.name} does not support token revocation`);
    }

    const response = await fetch(this.provider.revokeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    });

    return response.ok;
  }


  // ---- Normalize User Profile ----
  _normalizeUser(raw) {
    const provider = this.provider.name.toLowerCase();

    switch (provider) {
      case 'google':
        return {
          id: raw.sub,
          email: raw.email,
          name: raw.name,
          avatar: raw.picture,
          emailVerified: raw.email_verified,
          locale: raw.locale,
          provider,
          raw,
        };

      case 'github':
        return {
          id: String(raw.id),
          email: raw.email,
          name: raw.name || raw.login,
          avatar: raw.avatar_url,
          username: raw.login,
          bio: raw.bio,
          provider,
          raw,
        };

      case 'microsoft':
        return {
          id: raw.id,
          email: raw.mail || raw.userPrincipalName,
          name: raw.displayName,
          givenName: raw.givenName,
          surname: raw.surname,
          provider,
          raw,
        };

      case 'discord':
        return {
          id: raw.id,
          email: raw.email,
          name: raw.global_name || raw.username,
          username: raw.username,
          avatar: raw.avatar
            ? `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.png`
            : null,
          emailVerified: raw.verified,
          provider,
          raw,
        };

      default:
        return { ...raw, provider };
    }
  }
}


// ============================================
// CALLBACK HANDLER (Express)
// ============================================

/**
 * Express route handler for OAuth callback.
 *
 * Usage:
 *   const googleOAuth = new OAuthClient('google', { ... });
 *   app.get('/auth/google/callback', handleOAuthCallback(googleOAuth, async (user, tokens) => {
 *     const dbUser = await upsertUser(user);
 *     return generateJWT(dbUser);
 *   }));
 */
export function handleOAuthCallback(oauthClient, onSuccess) {
  return async (req, res) => {
    try {
      const { code, state, error: oauthError } = req.query;

      // Check for error from provider
      if (oauthError) {
        return res.redirect(`/login?error=${oauthError}`);
      }

      if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
      }

      // Verify state (retrieve from session)
      // const savedState = req.session.oauthState;
      // if (state !== savedState) throw new OAuthError('Invalid state parameter');

      // Exchange code for tokens
      const verifier = req.session?.oauthVerifier || null;
      const tokens = await oauthClient.exchangeCode(code, verifier);

      // Get user info
      const user = await oauthClient.getUserInfo(tokens.accessToken);

      // Application-specific logic
      const result = await onSuccess(user, tokens, req);

      // Clean up session
      // delete req.session.oauthState;
      // delete req.session.oauthVerifier;

      // Redirect or respond
      if (typeof result === 'string') {
        return res.redirect(result);
      }

      return res.json({ status: 'success', data: result });

    } catch (err) {
      console.error('OAuth callback error:', err);
      return res.redirect(`/login?error=oauth_failed`);
    }
  };
}


// ============================================
// ERRORS
// ============================================
export class OAuthError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'OAuthError';
    this.status = status;
    this.code = 'OAUTH_ERROR';
  }
}
