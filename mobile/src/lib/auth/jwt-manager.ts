/**
 * JWT Manager - Gestión segura de tokens con SecureStore
 *
 * Seguridad:
 * - iOS: Keychain (AES-256 hardware-backed)
 * - Android: EncryptedSharedPreferences (AES-256)
 */

import * as SecureStore from 'expo-secure-store';
import type { AuthTokens, DecodedJWT } from './types';

const KEYS = {
  ACCESS_TOKEN: 'blaniel_access_token',
  REFRESH_TOKEN: 'blaniel_refresh_token',
} as const;

/**
 * Decodifica un JWT sin verificar la firma
 * Solo para leer claims (exp, sub, etc.)
 */
function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWTManager] Invalid JWT format');
      return null;
    }

    // Decodificar payload (parte 2)
    const payload = parts[1];

    // Convertir base64url a base64 estándar
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificar base64
    const decoded = atob(base64);

    // Parsear JSON
    const claims = JSON.parse(decoded) as DecodedJWT;

    return claims;
  } catch (error) {
    console.error('[JWTManager] Error decoding JWT:', error);
    return null;
  }
}

/**
 * Verifica si un token está expirado
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return true;

  // Agregar 30 segundos de buffer para prevenir race conditions
  const now = Math.floor(Date.now() / 1000) + 30;
  return decoded.exp < now;
}

export const JWTManager = {
  /**
   * Guardar tokens en SecureStore
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken);

      if (tokens.refreshToken) {
        await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }

      console.log('[JWTManager] ✅ Tokens saved securely');
    } catch (error) {
      console.error('[JWTManager] ❌ Error saving tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  },

  /**
   * Obtener access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);

      if (!token) {
        console.log('[JWTManager] No access token found');
        return null;
      }

      // Verificar si está expirado
      if (isTokenExpired(token)) {
        console.log('[JWTManager] ⚠️ Access token expired');
        return null;
      }

      return token;
    } catch (error) {
      console.error('[JWTManager] Error getting access token:', error);
      return null;
    }
  },

  /**
   * Obtener refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);

      if (!token) {
        console.log('[JWTManager] No refresh token found');
        return null;
      }

      return token;
    } catch (error) {
      console.error('[JWTManager] Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Obtener claims del token (sin verificar firma)
   */
  async getTokenClaims(): Promise<DecodedJWT | null> {
    try {
      const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      if (!token) return null;

      return decodeJWT(token);
    } catch (error) {
      console.error('[JWTManager] Error getting token claims:', error);
      return null;
    }
  },

  /**
   * Verificar si hay sesión activa (token válido)
   */
  async hasValidSession(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  },

  /**
   * Limpiar todos los tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      ]);

      console.log('[JWTManager] 🗑️ Tokens cleared');
    } catch (error) {
      console.error('[JWTManager] Error clearing tokens:', error);
      // No throw - queremos limpiar aunque falle
    }
  },

  /**
   * Obtener información de expiración del token
   */
  async getTokenExpiration(): Promise<Date | null> {
    try {
      const claims = await this.getTokenClaims();
      if (!claims) return null;

      return new Date(claims.exp * 1000);
    } catch (error) {
      console.error('[JWTManager] Error getting token expiration:', error);
      return null;
    }
  },

  /**
   * Verificar si el token necesita refresh (próximo a expirar)
   * @param minutesBeforeExpiration Minutos antes de expiración para considerar refresh
   */
  async needsRefresh(minutesBeforeExpiration: number = 5): Promise<boolean> {
    try {
      const claims = await this.getTokenClaims();
      if (!claims) return false;

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = claims.exp - now;
      const refreshThreshold = minutesBeforeExpiration * 60;

      return expiresIn < refreshThreshold && expiresIn > 0;
    } catch (error) {
      console.error('[JWTManager] Error checking refresh need:', error);
      return false;
    }
  },
};
