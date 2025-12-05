/**
 * Server-side authentication helpers for NextAuth v5
 * Supports both web (NextAuth cookies) and mobile (JWT tokens)
 */

import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

/**
 * Get current session in Server Components and API Routes
 */
export async function getSession() {
  return await auth();
}

/**
 * Get current user ID or throw error
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  return session.user;
}

/**
 * Get authenticated user from request
 * Supports both web (NextAuth) and mobile (JWT) authentication
 * Returns user if authenticated, null otherwise
 */
export async function getAuthenticatedUser(req: NextRequest) {
  // First try NextAuth session (web)
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name,
      plan: session.user.plan || 'free',
    };
  }

  // If no NextAuth session, try JWT token (mobile)
  const authHeader = req.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    const payload = await verifyToken(token);

    if (payload) {
      return {
        id: payload.userId,
        email: payload.email,
        name: payload.name || undefined,
        plan: payload.plan || 'free',
      };
    }
  }

  return null;
}
