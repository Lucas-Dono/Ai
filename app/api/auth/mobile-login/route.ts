import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * Mobile Login Endpoint
 *
 * Usa better-auth internamente para validar credenciales.
 * Recibe email/password por HTTPS (cifrado en tránsito) y retorna JWT.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[MOBILE-LOGIN] 📱 Processing mobile login request');

    // Parsear el body
    const body = await request.json();
    const { email, password } = body;

    console.log('[MOBILE-LOGIN] 📧 Email:', email);
    console.log('[MOBILE-LOGIN] 🔑 Password received (length):', password?.length);

    console.log('[MOBILE-LOGIN] 🔄 About to call auth.api.signInEmail...');
    console.log('[MOBILE-LOGIN] 🔄 Params:', { email, password: '***' });

    let result;
    try {
      // Llamar a better-auth API pasando el body como objeto plano
      result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
      });
      console.log('[MOBILE-LOGIN] ✅ auth.api.signInEmail returned successfully');
    } catch (authError: any) {
      console.error('[MOBILE-LOGIN] ❌ auth.api.signInEmail failed:', authError.message);
      console.error('[MOBILE-LOGIN] ❌ Error type:', authError.constructor?.name);
      console.error('[MOBILE-LOGIN] ❌ Stack:', authError.stack);
      throw authError; // Re-throw to be caught by outer catch
    }

    console.log('[MOBILE-LOGIN] 📦 Better-auth result type:', typeof result);
    console.log('[MOBILE-LOGIN] 📦 Better-auth result keys:', Object.keys(result || {}));

    // Verificar que tengamos token y usuario
    if (!result || !result.token || !result.user) {
      console.log('[MOBILE-LOGIN] ❌ No token or user in result');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    console.log('[MOBILE-LOGIN] ✅ Login successful for:', result.user.email);

    // CRITICAL: Better-auth no incluye campos custom como 'plan'
    // Necesitamos consultar Prisma para obtener el plan real del usuario
    const userWithPlan = await prisma.user.findUnique({
      where: { id: result.user.id },
      select: { plan: true }
    });

    const userPlan = userWithPlan?.plan || 'free';
    console.log('[MOBILE-LOGIN] 📋 User plan from database:', userPlan);

    // Generar JWT propio (no usar el session token de better-auth)
    // El JWT incluye la información del usuario y se puede decodificar en el cliente
    const jwtToken = await generateToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name || null,
      plan: userPlan,
    });

    console.log('[MOBILE-LOGIN] 🎟️ JWT generated successfully');

    // Retornar en formato compatible con mobile
    return NextResponse.json({
      token: jwtToken,
      refreshToken: jwtToken, // Por ahora usar el mismo token
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        plan: userPlan,
        image: result.user.image,
        createdAt: result.user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[MOBILE-LOGIN] ❌ Error:', error.message);
    console.error('[MOBILE-LOGIN] ❌ Stack:', error.stack);

    return NextResponse.json(
      {
        error: 'Error al iniciar sesión',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
