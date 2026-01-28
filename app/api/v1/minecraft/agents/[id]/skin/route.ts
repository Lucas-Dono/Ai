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

    if (!skinTraits) {
      return NextResponse.json(
        {
          error: 'Skin traits not generated yet',
          suggestion: 'Create agent with referenceImageUrl to auto-generate skin',
        },
        { status: 404 }
      );
    }

    // 2. Validar traits
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

    // 3. Generar PNG on-the-fly
    // Convertir nombre a slug para buscar configuración de componentes modulares
    // Ej: "Albert Einstein" -> "albert-einstein"
    const characterSlug = agent.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const skinBuffer = await renderSkinFromTraits(validation.data, characterSlug);

    // 4. Retornar con headers de caché agresivo
    return new NextResponse(new Uint8Array(skinBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
        'ETag': `"${agentId}-${skinTraits.generatedAt}"`,
        'X-Skin-Version': String(skinTraits.version),
        'X-Template-Id': skinTraits.templateId,
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
