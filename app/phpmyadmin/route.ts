/**
 * Honeypot: Fake phpMyAdmin
 *
 * Este endpoint es un honeypot - parece phpMyAdmin
 * pero está diseñado para detectar atacantes que escanean rutas comunes.
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
