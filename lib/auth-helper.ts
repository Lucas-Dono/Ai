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
  image?: string | null;
  createdAt?: Date;
}

/**
 * Obtiene el usuario autenticado desde:
 * 1. API Key (para integraciones externas como Minecraft)
 * 2. JWT (mobile)
 * 3. NextAuth/better-auth (web)
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  console.log('[AuthHelper] Attempting authentication...');

  const authHeader = req.headers.get('Authorization');
  console.log('[AuthHelper] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');

  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    console.log('[AuthHelper] Extracted token:', token ? `${token.substring(0, 30)}...` : 'NONE');

    if (token) {
      // PRIMERO: Intentar con API Key (si empieza con "blnl_")
      if (token.startsWith('blnl_')) {
        console.log('[AuthHelper] Detected API Key format');

        const user = await prisma.user.findUnique({
          where: { apiKey: token },
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
            image: true,
            createdAt: true,
          },
        });

        if (user) {
          console.log('[AuthHelper] ✅ Authenticated via API Key:', user.email);
          return user;
        } else {
          console.log('[AuthHelper] ❌ API Key not found or invalid');
        }
      }
      // SEGUNDO: Intentar con JWT (mobile)
      else {
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
              image: true,
              createdAt: true,
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
  }

  // TERCERO: Intentar autenticación con better-auth (web) - solo si no hay API Key/JWT
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user?.id) {
      console.log('[AuthHelper] ✅ Authenticated via better-auth:', session.user.email);

      // Obtener plan y otros campos de Prisma (better-auth no tiene campos custom)
      const userWithPlan = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true }
      });

      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || null,
        plan: userWithPlan?.plan || 'free',
        image: session.user.image || null,
        createdAt: session.user.createdAt,
      };
    }
    console.log('[AuthHelper] better-auth session not found');
  } catch (error) {
    console.log('[AuthHelper] better-auth failed:', error);
  }

  console.log('[AuthHelper] ❌ Authentication failed - no valid API Key, JWT, or NextAuth session');
  return null;
}
