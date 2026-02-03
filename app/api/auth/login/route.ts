import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Verify password using better-auth's scrypt format
 * Better-auth uses format: salt:hash (both in hex, separated by colon)
 * - Salt: 16 bytes (32 hex chars)
 * - Hash: 64 bytes (128 hex chars)
 */
async function verifyBetterAuthPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    console.log('[LOGIN DEBUG] ========== BETTER-AUTH VALIDATION START ==========');
    console.log('[LOGIN DEBUG] 🔑 Password to verify:', password);
    console.log('[LOGIN DEBUG] 💾 Stored hash:', storedHash);
    console.log('[LOGIN DEBUG] Parsing better-auth hash format...');

    // Better-auth format: salt:hash
    const parts = storedHash.split(':');
    console.log('[LOGIN DEBUG] 🔍 Split parts:', parts.length);

    if (parts.length !== 2) {
      console.error('[LOGIN DEBUG] ❌ Invalid hash format - expected salt:hash, got', parts.length, 'parts');
      return false;
    }

    const [saltHex, hashHex] = parts;
    console.log('[LOGIN DEBUG] 🧂 Salt (hex):', saltHex);
    console.log('[LOGIN DEBUG] 🔐 Hash (hex):', hashHex);
    console.log('[LOGIN DEBUG] 📏 Salt length:', saltHex.length, 'chars');
    console.log('[LOGIN DEBUG] 📏 Hash length:', hashHex.length, 'chars');

    const salt = Buffer.from(saltHex, 'hex');
    const hash = Buffer.from(hashHex, 'hex');

    console.log('[LOGIN DEBUG] 🧂 Salt buffer length:', salt.length, 'bytes');
    console.log('[LOGIN DEBUG] 🔐 Hash buffer length:', hash.length, 'bytes');

    console.log('[LOGIN DEBUG] ⚙️  Deriving key with scrypt...');
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;

    console.log('[LOGIN DEBUG] ✅ Derived hash length:', derived.length, 'bytes');
    console.log('[LOGIN DEBUG] 🔐 Derived hash (hex):', derived.toString('hex'));
    console.log('[LOGIN DEBUG] 💾 Expected hash (hex):', hash.toString('hex'));

    console.log('[LOGIN DEBUG] 🔍 Comparing hashes with timingSafeEqual...');
    const isValid = timingSafeEqual(hash, derived);

    console.log('[LOGIN DEBUG] ========== RESULT:', isValid ? '✅ VALID' : '❌ INVALID', '==========');

    return isValid;
  } catch (error) {
    console.error('[LOGIN DEBUG] ❌ Error verifying better-auth password:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[LOGIN DEBUG] 🔐 Login attempt for:', email);

    // Validar campos requeridos
    if (!email || !password) {
      console.log('[LOGIN DEBUG] ❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('[LOGIN DEBUG] ❌ User not found:', email);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    console.log('[LOGIN DEBUG] ✅ User found:', { id: user.id, email: user.email, hasPassword: !!user.password });

    // Verificar contraseña
    // Si el usuario no tiene password (creado con OAuth), no puede hacer login con credenciales
    if (!user.password) {
      console.log('[LOGIN DEBUG] ❌ User has no password (OAuth user)');
      return NextResponse.json(
        { error: 'Este usuario fue creado con OAuth. Por favor inicia sesión con el proveedor correspondiente.' },
        { status: 401 }
      );
    }

    console.log('[LOGIN DEBUG] 🔑 Validating password...');
    console.log('[LOGIN DEBUG] 💾 Stored hash (length):', user.password.length);
    console.log('[LOGIN DEBUG] 💾 Stored hash (first 20 chars):', user.password.substring(0, 20));
    console.log('[LOGIN DEBUG] 💾 Stored hash (FULL):', user.password);
    console.log('[LOGIN DEBUG] 🔍 Hash type detection:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$') ? 'BCRYPT' : 'BETTER-AUTH (scrypt)');

    let isValidPassword = false;

    // Check if it's a bcrypt hash (starts with $2a$ or $2b$)
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      console.log('[LOGIN DEBUG] Using bcrypt validation...');
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // It's a better-auth (scrypt) hash
      console.log('[LOGIN DEBUG] Using better-auth (scrypt) validation...');
      isValidPassword = await verifyBetterAuthPassword(password, user.password);
    }

    console.log('[LOGIN DEBUG] Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('[LOGIN DEBUG] ❌ Password validation failed');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    // Devolver respuesta
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        image: user.image,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
