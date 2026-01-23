import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { formatZodError } from '@/lib/validation/schemas';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/minecraft-login
 *
 * Endpoint de autenticación específico para integraciones externas (Minecraft, CLI, etc.)
 *
 * Diferencias con /api/auth/login normal:
 * - Retorna JWT de larga duración (30 días) en lugar de session cookie
 * - Incluye datos completos del usuario (agentes, plan, etc.)
 * - Diseñado para clients que no soportan cookies
 */

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return formatZodError(validation.error);
    }

    const { email, password } = validation.data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        password: true,
        Agent: {
          select: {
            id: true,
            name: true,
            gender: true,
            profile: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!user.password) {
      return NextResponse.json(
        { error: 'Usuario sin contraseña configurada. Usa login social desde la web.' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Generar JWT de larga duración (30 días por defecto en generateToken)
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    // Registrar login exitoso
    console.log(`[Minecraft Login] Usuario autenticado: ${user.email}`);

    // Retornar JWT + datos del usuario
    return NextResponse.json({
      token,
      expiresIn: 30 * 24 * 60 * 60, // 30 días en segundos
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        plan: user.plan,
      },
      agents: user.Agent.map(agent => {
        // Extraer edad del profile JSON si existe
        const profile = agent.profile as any;
        const age = profile?.identidad?.edad || profile?.age || null;

        return {
          id: agent.id,
          name: agent.name,
          gender: agent.gender || 'unknown',
          age: age,
        };
      }),
      message: 'Login exitoso',
    });

  } catch (error: any) {
    console.error('[Minecraft Login Error]', error);
    return NextResponse.json(
      {
        error: 'Error al iniciar sesión',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
