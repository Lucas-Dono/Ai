import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderSkinFromTraits } from '@/lib/minecraft/skin-renderer';
import { MinecraftSkinTraitsSchema, MinecraftSkinTraits } from '@/types/minecraft-skin';

/**
 * GET /api/v1/minecraft/agents/:id/skin
 *
 * Genera y retorna la skin PNG (64x64) del agente desde sus traits
 * La skin se genera on-the-fly y se cachea agresivamente en el cliente
 *
 * Costo: $0 (generación local con Sharp)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    console.log('[Minecraft Skin] Solicitud de skin para agente:', agentId);

    // 1. Obtener traits del agente
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        metadata: true,
        name: true, // Para buscar configuración de componentes por nombre
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const metadata = agent.metadata as any;
    const skinTraits = metadata?.minecraft?.skinTraits as MinecraftSkinTraits | undefined;

    // Convertir nombre a slug para buscar configuración de componentes modulares
    // Ej: "Albert Einstein" -> "albert-einstein"
    const characterSlug = agent.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Si hay skinTraits, validarlos
    if (skinTraits) {
      const validation = MinecraftSkinTraitsSchema.safeParse(skinTraits);
      if (!validation.success) {
        console.error('[Minecraft Skin] Invalid traits:', validation.error);
        return NextResponse.json(
          {
            error: 'Invalid skin traits',
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }

      // 3. Generar PNG on-the-fly desde traits
      const skinBuffer = await renderSkinFromTraits(validation.data, characterSlug);

      return new NextResponse(new Uint8Array(skinBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
          'ETag': `"${agentId}-${skinTraits.generatedAt}"`,
          'X-Skin-Version': String(skinTraits.version),
          'X-Template-Id': skinTraits.templateId,
        },
      });
    }

    // Si NO hay skinTraits, intentar con configuración de componentes
    console.log('[Minecraft Skin] No skinTraits, intentando con configuración de componentes para:', characterSlug);

    // Crear skinTraits dummy para el renderer (solo se usará characterSlug)
    const dummyTraits: MinecraftSkinTraits = {
      version: 1,
      gender: 'female',
      skinTone: '#F5D7B1',
      hairColor: '#3D2817',
      eyeColor: '#4A7BA7',
      hairStyle: 'long',
      clothingStyle: 'casual',
      templateId: 'default',
      generatedAt: new Date().toISOString(),
    };

    const skinBuffer = await renderSkinFromTraits(dummyTraits, characterSlug);

    // 4. Retornar con headers de caché agresivo (desde configuración de componentes)
    return new NextResponse(new Uint8Array(skinBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
        'ETag': `"${agentId}-component-config"`,
        'X-Skin-Source': 'component-config',
        'X-Character-Slug': characterSlug,
      },
    });

  } catch (error) {
    console.error('[Minecraft Skin] Error:', error);
    return NextResponse.json(
      {
        error: 'Error rendering skin',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
