import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password y name son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (existingUser) {
      // Si el usuario existe pero no tiene contraseña (creado desde web con OAuth/email),
      // actualizar con contraseña y nombre
      if (!existingUser.password) {
        user = await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            name, // Actualizar nombre también
          },
        });
      } else {
        // Si ya tiene contraseña, no permitir registro
        return NextResponse.json(
          { error: 'El email ya está registrado. Por favor inicia sesión.' },
          { status: 409 }
        );
      }
    } else {
      // Crear usuario nuevo
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          plan: 'free',
        },
      });
    }

    // Generar token JWT
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    // Devolver respuesta
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          image: user.image,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
