// Token Manager - Handles all JWT token operations
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  /**
   * Store authentication tokens securely
   */
  static storeTokens(accessToken: string, refreshToken?: string): void {
    console.log('🔐 Attempting to store tokens...');
    console.log('🔐 Access token length:', accessToken?.length || 'undefined');
    console.log('🔐 Refresh token length:', refreshToken?.length || 'undefined');
    
    if (typeof window === 'undefined') {
      console.log('🔐 Not in browser environment, skipping token storage');
      return;
    }

    try {
      // Decode JWT to get expiration
      const decoded = this.decodeJWT(accessToken);
      console.log('🔐 Decoded JWT:', decoded);
      
      const expiryTime = decoded?.exp ? decoded.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000); // Default 24h
      console.log('🔐 Calculated expiry time:', new Date(expiryTime).toISOString());

      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }

      // Verify storage
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      console.log('🔐 Stored token length:', storedToken?.length || 'undefined');
      console.log('🔐 Stored expiry:', storedExpiry);

      console.log('🔐 Tokens stored successfully');
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Get the current access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return null;

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log('⏰ Token expired, clearing...');
        this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get the refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Check if user has valid authentication
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && this.isValidToken(token);
  }

  /**
   * Check if token is valid (format + expiration)
   */
  static isValidToken(token: string): boolean {
    try {
      // Check JWT format
      if (!this.hasValidJWTFormat(token)) {
        return false;
      }

      // Check expiration
      if (this.isTokenExpired(token)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeJWT(token);
      if (!decoded?.exp) return true;

      const currentTime = Date.now() / 1000;
      const bufferTime = 60; // 1 minute buffer

      return decoded.exp < (currentTime + bufferTime);
    } catch (error) {
      console.error('❌ Failed to check token expiration:', error);
      return true;
    }
  }

  /**
   * Check JWT format validity
   */
  static hasValidJWTFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3 && parts.every(part => part.length > 0);
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT payload (without verification)
   */
  static decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('❌ Failed to decode JWT:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null;

    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry) : null;
    } catch (error) {
      console.error('❌ Failed to get token expiry:', error);
      return null;
    }
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiry(): number {
    const expiry = this.getTokenExpiry();
    if (!expiry) return 0;

    const now = Date.now();
    return Math.max(0, expiry - now);
  }

  /**
   * Check if token needs refresh (within 5 minutes of expiry)
   */
  static needsRefresh(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    return timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes;
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      console.log('🗑️ All tokens cleared');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  }

  /**
   * Get user info from token
   */
  static getUserFromToken(): { id: string; email: string; role: string } | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const decoded = this.decodeJWT(token);
      if (!decoded) return null;

      return {
        id: decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      console.error('❌ Failed to get user from token:', error);
      return null;
    }
  }
}

export default TokenManager;
