import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api/middleware';
import { MinecraftSkinTraitsSchema, MinecraftSkinTraits } from '@/types/minecraft-skin';

/**
 * PATCH /api/v1/minecraft/agents/:id/skin/edit
 *
 * Permite al usuario editar manualmente los skin traits de su agente
 * Útil para personalización avanzada sin regenerar desde la foto
 */
export const PATCH = withAuth(async (req, { params, user }) => {
  try {
    const { id: agentId } = await params;
    const updates = await req.json();

    console.log('[Minecraft Skin Edit] Editando traits para agente:', agentId);

    // 1. Verificar que el usuario sea dueño del agente
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId: user.id },
      select: { metadata: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Unauthorized or agent not found' },
        { status: 403 }
      );
    }

    // 2. Validar nuevos traits (partial = permite actualizaciones parciales)
    const validation = MinecraftSkinTraitsSchema.partial().safeParse(updates);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid traits',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // 3. Merge con traits existentes
    const metadata = agent.metadata as any;
    const currentTraits = (metadata?.minecraft?.skinTraits || {}) as Partial<MinecraftSkinTraits>;

    const newTraits: MinecraftSkinTraits = {
      version: 1,
      gender: updates.gender ?? currentTraits.gender ?? 'non_binary',
      skinTone: updates.skinTone ?? currentTraits.skinTone ?? '#F5D7B1',
      hairColor: updates.hairColor ?? currentTraits.hairColor ?? '#3D2817',
      eyeColor: updates.eyeColor ?? currentTraits.eyeColor ?? '#4A7BA7',
      hairStyle: updates.hairStyle ?? currentTraits.hairStyle ?? 'short',
      clothingStyle: updates.clothingStyle ?? currentTraits.clothingStyle ?? 'casual',
      hasGlasses: updates.hasGlasses ?? currentTraits.hasGlasses ?? false,
      hasHat: updates.hasHat ?? currentTraits.hasHat ?? false,
      hasFacialHair: updates.hasFacialHair ?? currentTraits.hasFacialHair ?? false,
      templateId: updates.templateId ?? currentTraits.templateId ?? 'non_binary_casual_short_01',
      generatedAt: new Date().toISOString(), // Actualizar timestamp
    };

    // 4. Actualizar en BD
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        metadata: {
          ...metadata,
          minecraft: {
            ...metadata?.minecraft,
            skinTraits: newTraits,
          },
        },
      },
    });

    console.log('[Minecraft Skin Edit] Traits actualizados:', newTraits);

    return NextResponse.json({
      success: true,
      traits: newTraits,
      skinUrl: `/api/v1/minecraft/agents/${agentId}/skin`, // Nueva URL
      message: 'Skin traits updated successfully',
    });

  } catch (error) {
    console.error('[Minecraft Skin Edit] Error:', error);
    return NextResponse.json(
      {
        error: 'Error updating skin traits',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
