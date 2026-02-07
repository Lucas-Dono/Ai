/**
 * Sistema de autenticación JWT - Exportaciones principales
 */

export { JWTManager } from './jwt-manager';
export { AuthApiClient } from './api-client';
export { AuthService } from './auth-service';
export {
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthActions,
  authApiClient,
  authService,
} from './auth-store';
export type { AuthApiClientConfig } from './api-client';
export type {
  AuthTokens,
  DecodedJWT,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AuthError,
} from './types';
