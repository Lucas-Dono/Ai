/**
 * Tipos para el sistema de autenticación JWT
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface DecodedJWT {
  sub: string; // User ID
  email: string;
  name?: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan?: string;
  nsfwConsent?: boolean;
  ageVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

export interface AuthError {
  error: string;
  message?: string;
  statusCode?: number;
}
