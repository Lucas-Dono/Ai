/**
 * Servicio de autenticación - Operaciones de login/register/logout
 */

import { AuthApiClient } from './api-client';
import { JWTManager } from './jwt-manager';
import { StorageService } from '../../services/storage';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AuthUser,
  AuthError,
} from './types';

export class AuthService {
  private apiClient: AuthApiClient;

  constructor(apiClient: AuthApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Login con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      console.log('[AuthService] ========== LOGIN START ==========');
      console.log('[AuthService] 📧 Email:', credentials.email);
      console.log('[AuthService] 🔑 Password length:', credentials.password?.length);
      console.log('[AuthService] 🔑 Password first 3 chars:', credentials.password?.substring(0, 3));
      console.log('[AuthService] 🔑 Password last 3 chars:', credentials.password?.substring(credentials.password.length - 3));
      console.log('[AuthService] 🔑 Password FULL (for debugging):', credentials.password);

      const payload = {
        email: credentials.email,
        password: credentials.password,
      };

      console.log('[AuthService] 📤 Sending request to /api/auth/login');
      console.log('[AuthService] 📦 Payload:', JSON.stringify(payload, null, 2));

      const response = await this.apiClient.post<AuthResponse>(
        '/api/auth/sign-in/email',
        payload
      );

      console.log('[AuthService] 📥 Response received');
      console.log('[AuthService] 📥 Response status:', response);
      console.log('[AuthService] 📥 Response data:', JSON.stringify(response, null, 2));
      console.log('[AuthService] 🎟️ Token present:', !!response.token);
      console.log('[AuthService] 🎟️ Token length:', response.token?.length);
      console.log('[AuthService] 🎟️ Token first 20 chars:', response.token?.substring(0, 20));
      console.log('[AuthService] 🎟️ RefreshToken present:', !!response.refreshToken);
      console.log('[AuthService] 👤 User data:', JSON.stringify(response.user, null, 2));

      // Guardar tokens
      console.log('[AuthService] 💾 Saving tokens to SecureStore...');
      await this.apiClient.setAuthTokens(response.token, response.refreshToken);
      console.log('[AuthService] ✅ Tokens saved');

      // Guardar datos de usuario
      console.log('[AuthService] 💾 Saving user data to storage...');
      await StorageService.setUserData(response.user);
      console.log('[AuthService] ✅ User data saved');

      console.log('[AuthService] ========== LOGIN SUCCESS ==========');
      console.log('[AuthService] ✅ Login successful for:', response.user.email);

      return response.user;
    } catch (error: any) {
      console.log('[AuthService] ========== LOGIN ERROR ==========');
      console.error('[AuthService] ❌ Error type:', error.constructor.name);
      console.error('[AuthService] ❌ Error message:', error.message);
      console.error('[AuthService] ❌ Error response status:', error.response?.status);
      console.error('[AuthService] ❌ Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('[AuthService] ❌ Error response headers:', JSON.stringify(error.response?.headers, null, 2));
      console.error('[AuthService] ❌ Full error:', error);

      const authError: AuthError = {
        error: 'login_failed',
        message: error.response?.data?.error || error.response?.data?.message || 'Error al iniciar sesión',
        statusCode: error.response?.status,
      };

      console.error('[AuthService] ❌ Throwing AuthError:', JSON.stringify(authError, null, 2));
      console.log('[AuthService] ========== LOGIN END (FAILED) ==========');

      throw authError;
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    try {
      console.log('[AuthService] 📝 Attempting register:', credentials.email);

      const response = await this.apiClient.post<AuthResponse>(
        '/api/auth/sign-up/email',
        {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        }
      );

      // Guardar tokens
      await this.apiClient.setAuthTokens(response.token, response.refreshToken);

      // Guardar datos de usuario
      await StorageService.setUserData(response.user);

      console.log('[AuthService] ✅ Register successful:', response.user.email);

      return response.user;
    } catch (error: any) {
      console.error('[AuthService] ❌ Register failed:', error);

      const authError: AuthError = {
        error: 'register_failed',
        message: error.response?.data?.message || 'Error al registrar usuario',
        statusCode: error.response?.status,
      };

      throw authError;
    }
  }

  /**
   * Logout - limpiar sesión local y notificar al servidor
   */
  async logout(): Promise<void> {
    try {
      console.log('[AuthService] 🚪 Logging out...');

      // Intentar notificar al servidor (best effort)
      try {
        await this.apiClient.post('/api/auth/sign-out', {});
      } catch (error) {
        console.warn('[AuthService] ⚠️ Server logout failed (continuing local logout):', error);
      }

      // Limpiar datos locales
      await Promise.all([
        this.apiClient.clearAuth(),
        StorageService.clearAll(),
      ]);

      console.log('[AuthService] ✅ Logout complete');
    } catch (error) {
      console.error('[AuthService] ❌ Logout error:', error);
      // Siempre limpiar localmente aunque falle
      await this.apiClient.clearAuth();
      await StorageService.clearAll();
    }
  }

  /**
   * Obtener información del usuario autenticado actual
   */
  async getMe(): Promise<AuthUser> {
    try {
      console.log('[AuthService] 👤 Fetching current user');

      const response = await this.apiClient.get<{ user: AuthUser }>(
        '/api/auth/session'
      );

      // Actualizar datos locales
      await StorageService.setUserData(response.user);

      return response.user;
    } catch (error: any) {
      console.error('[AuthService] ❌ getMe failed:', error);

      const authError: AuthError = {
        error: 'fetch_user_failed',
        message: error.response?.data?.message || 'Error al obtener usuario',
        statusCode: error.response?.status,
      };

      throw authError;
    }
  }

  /**
   * Verificar si hay sesión activa
   */
  async hasActiveSession(): Promise<boolean> {
    return await this.apiClient.isAuthenticated();
  }

  /**
   * Restaurar sesión desde tokens guardados
   */
  async restoreSession(): Promise<AuthUser | null> {
    try {
      const hasSession = await this.hasActiveSession();

      if (!hasSession) {
        console.log('[AuthService] ⚠️ No active session found');
        return null;
      }

      // Intentar obtener usuario del storage primero (más rápido)
      const cachedUser = await StorageService.getUserData<AuthUser>();

      if (cachedUser) {
        console.log('[AuthService] ✅ Session restored from cache');

        // Verificar con el servidor en background
        this.getMe().catch((error) => {
          console.warn('[AuthService] ⚠️ Background session verification failed:', error);
        });

        return cachedUser;
      }

      // Si no hay cache, obtener del servidor
      console.log('[AuthService] 📡 Fetching session from server');
      return await this.getMe();
    } catch (error) {
      console.error('[AuthService] ❌ Session restore failed:', error);
      // Limpiar sesión inválida
      await this.logout();
      return null;
    }
  }

  /**
   * Actualizar información del usuario
   */
  async updateUser(updates: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const response = await this.apiClient.patch<{ user: AuthUser }>(
        '/api/user/profile',
        updates
      );

      // Actualizar cache local
      await StorageService.setUserData(response.user);

      return response.user;
    } catch (error: any) {
      console.error('[AuthService] ❌ Update user failed:', error);

      const authError: AuthError = {
        error: 'update_failed',
        message: error.response?.data?.message || 'Error al actualizar usuario',
        statusCode: error.response?.status,
      };

      throw authError;
    }
  }
}
