/**
 * Helper para autenticación que soporta tanto NextAuth (web) como JWT (mobile)
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

/**
 * Obtiene el usuario autenticado desde NextAuth (web) o JWT (mobile)
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  console.log('[AuthHelper] Attempting authentication...');

  // PRIMERO: Intentar autenticación con JWT (mobile) - más rápido y directo
  const authHeader = req.headers.get('Authorization');
  console.log('[AuthHelper] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');

  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    console.log('[AuthHelper] Extracted token:', token ? `${token.substring(0, 30)}...` : 'NONE');

    if (token) {
      const payload = await verifyToken(token);
      console.log('[AuthHelper] Token payload:', payload ? `userId: ${payload.userId}` : 'INVALID');

      if (payload) {
        // Verificar que el usuario existe en la base de datos
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          },
        });

        if (user) {
          console.log('[AuthHelper] ✅ Authenticated via JWT:', user.email);
          return user;
        } else {
          console.log('[AuthHelper] ❌ JWT valid but user not found in database');
        }
      } else {
        console.log('[AuthHelper] ❌ Token verification failed');
      }
    }
  }

  // SEGUNDO: Intentar autenticación con NextAuth (web) - solo si no hay JWT
  try {
    const session = await auth();
    if (session?.user?.id) {
      console.log('[AuthHelper] ✅ Authenticated via NextAuth:', session.user.email);
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || null,
        plan: (session.user as any).plan || 'free',
      };
    }
    console.log('[AuthHelper] NextAuth session not found');
  } catch (error) {
    console.log('[AuthHelper] NextAuth failed:', error);
  }

  console.log('[AuthHelper] ❌ Authentication failed - no valid JWT or NextAuth session');
  return null;
}
