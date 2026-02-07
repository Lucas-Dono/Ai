/**
 * Unified Authentication Helper
 * Soporta tanto NextAuth (web) como JWT Bearer tokens (mobile)
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    plan?: string;
  };
}

/**
 * Obtiene la sesión del usuario desde NextAuth o JWT Bearer token
 * Intenta NextAuth primero (para web), luego JWT (para mobile)
 */
export async function getAuthSession(request: NextRequest): Promise<AuthSession | null> {
  // 1. Intentar better-auth primero (para web)
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || null,
        },
      };
    }
  } catch (error) {
    // better-auth puede fallar, continuar con JWT
    console.log('[AuthHelper] better-auth failed, trying JWT');
  }

  // 2. Intentar JWT Bearer token (para mobile)
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    user: {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      plan: payload.plan,
    },
  };
}
