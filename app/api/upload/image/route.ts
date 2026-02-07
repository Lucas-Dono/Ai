/**
 * POST /api/upload/image - Upload de imágenes para avatares, perfiles, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { requireAuth } from '@/lib/auth-server';

// Tipos de imágenes permitidos
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

// Tamaño máximo: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await requireAuth(req);

    // Obtener FormData
    const formData = await req.formData();
    const file = (formData as any).get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de archivo no soportado. Usa: ${ALLOWED_TYPES.map(t =>
            t.split('/')[1].toUpperCase()
          ).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo: ${MAX_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Leer bytes del archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const filename = `${user.id}-${timestamp}.${fileExtension}`;

    // Asegurar que existe el directorio de uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Guardar archivo
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Retornar URL pública del archivo
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);

    if (error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Error al subir la imagen. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
