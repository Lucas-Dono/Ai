/**
 * Honeypot: Fake Administrator Panel
 *
 * Este endpoint es un honeypot - parece un panel de administrador
 * pero está diseñado para detectar atacantes que escanean rutas comunes.
 *
 * NOTA: El panel admin REAL está en /admin (protegido con mTLS en producción)
 */

import { NextRequest } from 'next/server';
import { handleHoneypotRequest } from '@/lib/security/honeypots';

export async function GET(request: NextRequest) {
  const response = await handleHoneypotRequest(request);
  return response || new Response('Not Found', { status: 404 });
}

export async function POST(request: NextRequest) {
  const response = await handleHoneypotRequest(request);
  return response || new Response('Not Found', { status: 404 });
}
