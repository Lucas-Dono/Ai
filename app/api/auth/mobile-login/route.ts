import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Mobile Login Endpoint - Proxy to better-auth without Origin validation
 *
 * Este endpoint actúa como proxy a better-auth para permitir login desde móviles
 * sin validación de Origin (que falla con IPs dinámicas)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[MOBILE-LOGIN] 📱 Attempting mobile login for:', email);

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    // Llamar directamente a better-auth sin pasar por el endpoint HTTP
    // Esto bypasea la validación de Origin
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        // Opcional: agregar metadata del móvil
        callbackURL: '/',
      },
      headers: request.headers,
    });

    if (!result) {
      console.log('[MOBILE-LOGIN] ❌ Authentication failed');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    console.log('[MOBILE-LOGIN] ✅ Authentication successful');
    console.log('[MOBILE-LOGIN] Session:', result.session);
    console.log('[MOBILE-LOGIN] User:', result.user);

    // Extraer session token
    const sessionToken = result.session?.token;

    if (!sessionToken) {
      console.error('[MOBILE-LOGIN] ❌ No session token returned');
      return NextResponse.json(
        { error: 'Error al crear sesión' },
        { status: 500 }
      );
    }

    // Devolver token y datos del usuario
    // Formato compatible con JWT esperado por el móvil
    return NextResponse.json({
      token: sessionToken,
      refreshToken: sessionToken, // Better-auth usa el mismo token
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        plan: result.user.plan,
        image: result.user.image,
        createdAt: result.user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[MOBILE-LOGIN] ❌ Error:', error);

    // Si es error de better-auth
    if (error.status) {
      return NextResponse.json(
        { error: error.message || 'Error al iniciar sesión' },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
