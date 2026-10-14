import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Manages DR TV user authentication and token refresh lifecycle.
 * Supports persistent session caching on disk to avoid rate-limiting and redundant login cycles.
 */
export class DRAuthManager {
  constructor(options = {}) {
    this.email = options.email || process.env.DR_EMAIL || '';
    this.password = options.password || process.env.DR_PASSWORD || '';
    this.sessionPath = options.sessionPath || process.env.SESSION_STORAGE_PATH || './.session_cache.json';
    
    // Massive Interactive / DRTV API endpoints
    this.apiBase = 'https://isl.dr-massive.com/api';
    this.cachedSession = null;
    this.loadSessionFromDisk();
  }

  loadSessionFromDisk() {
    try {
      const resolved = path.resolve(this.sessionPath);
      if (fs.existsSync(resolved)) {
        const raw = fs.readFileSync(resolved, 'utf-8');
        const data = JSON.parse(raw);
        if (data && data.expiration && new Date(data.expiration) > new Date()) {
          this.cachedSession = data;
          console.log(`[DR Auth] Loaded valid session from disk (expires: ${data.expiration})`);
          return;
        }
      }
    } catch (err) {
      console.warn(`[DR Auth] Notice loading session cache: ${err.message}`);
    }
    this.cachedSession = null;
  }

  saveSessionToDisk(sessionData) {
    try {
      const resolved = path.resolve(this.sessionPath);
      fs.writeFileSync(resolved, JSON.stringify(sessionData, null, 2), 'utf-8');
      console.log(`[DR Auth] Session cached to ${resolved}`);
    } catch (err) {
      console.error(`[DR Auth] Failed to save session to disk: ${err.message}`);
    }
  }

  async getSessionToken() {
    // 1. Check if we have an active, non-expired cached token
    if (this.cachedSession && this.cachedSession.token) {
      const expiresAt = new Date(this.cachedSession.expiration).getTime();
      const now = Date.now();
      // If valid for at least 5 more minutes, use it
      if (expiresAt - now > 5 * 60 * 1000) {
        return this.cachedSession.token;
      }
      console.log('[DR Auth] Cached session expired or expiring soon. Refreshing...');
    }

    // 2. If credentials are provided, attempt user account login
    if (this.email && this.password) {
      try {
        console.log(`[DR Auth] Authenticating account for ${this.email}...`);
        const loginPayload = {
          email: this.email,
          password: this.password,
          device: 'web_browser'
        };

        const res = await axios.post(`${this.apiBase}/account/login`, loginPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 10000
        });

        if (res.data && (res.data.token || res.data.sessionToken || (res.data.user && res.data.user.token))) {
          const token = res.data.token || res.data.sessionToken || res.data.user.token;
          const expiration = res.data.expiration || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
          
          this.cachedSession = {
            token,
            type: 'user',
            expiration
          };
          this.saveSessionToDisk(this.cachedSession);
          console.log('[DR Auth] Successfully authenticated user session.');
          return token;
        }
      } catch (err) {
        console.warn(`[DR Auth] User login request error: ${err.response?.status || err.message}. Falling back to anonymous session.`);
      }
    }

    // 3. Fallback: Obtain Anonymous SSO / Client Session token
    try {
      console.log('[DR Auth] Requesting Anonymous SSO token from DR platform...');
      const ssoRes = await axios.post(`${this.apiBase}/authorization/anonymous-sso`, {
        device: 'web_browser',
        scopes: ['Catalog', 'Playback']
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 8000
      });

      if (ssoRes.data && (ssoRes.data.value || ssoRes.data.token)) {
        const token = ssoRes.data.value || ssoRes.data.token;
        const expiration = ssoRes.data.expiration || new Date(Date.now() + 12 * 3600 * 1000).toISOString();
        this.cachedSession = {
          token,
          type: 'anonymous',
          expiration
        };
        this.saveSessionToDisk(this.cachedSession);
        return token;
      }
    } catch (ssoErr) {
      console.warn(`[DR Auth] Anonymous SSO endpoint unavailable (${ssoErr.message}). Continuing in public/direct mode.`);
    }

    return null;
  }

  /**
   * Generates authorization header object for DR TV requests
   */
  async getAuthHeaders() {
    const token = await this.getSessionToken();
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.dr.dk/drtv/',
      'Origin': 'https://www.dr.dk',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}
