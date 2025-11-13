/**
 * Server-side authentication helpers for NextAuth v5
 */

import { auth } from '@/lib/auth';

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
