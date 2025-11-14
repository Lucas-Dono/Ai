/**
 * Pending Images API
 *
 * GET /api/agents/[id]/pending-images
 * - Retorna imágenes pendientes y completadas para un agente
 * - Permite al frontend hacer polling para detectar nuevas imágenes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { apiLogger as log } from '@/lib/logging';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // Autenticación
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Verificar que el agente pertenece al usuario
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { userId: true },
    });

    if (!agent || agent.userId !== userId) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
    }

    // Obtener imágenes pendientes y recientemente completadas
    const pendingImages = await prisma.pendingImageGeneration.findMany({
      where: {
        agentId,
        userId,
        OR: [
          { status: 'pending' },
          { status: 'generating' },
          {
            // Incluir completadas en los últimos 5 minutos
            status: 'completed',
            completedAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000),
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        description: true,
        status: true,
        imageUrl: true,
        errorMessage: true,
        waitingMessageId: true,
        completedMessageId: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Para cada imagen completada, obtener el mensaje
    const completedWithMessages = await Promise.all(
      pendingImages
        .filter((img) => img.status === 'completed' && img.completedMessageId)
        .map(async (img) => {
          const message = await prisma.message.findUnique({
            where: { id: img.completedMessageId! },
            select: {
              id: true,
              content: true,
              metadata: true,
              createdAt: true,
            },
          });

          return {
            ...img,
            completedMessage: message,
          };
        })
    );

    // Combinar con imágenes pendientes/generando
    const pendingWithoutMessages = pendingImages.filter(
      (img) => img.status === 'pending' || img.status === 'generating'
    );

    log.info(
      {
        agentId,
        userId,
        pending: pendingWithoutMessages.length,
        completed: completedWithMessages.length,
      },
      'Pending images retrieved'
    );

    return NextResponse.json({
      pending: pendingWithoutMessages,
      completed: completedWithMessages,
      totalPending: pendingWithoutMessages.length,
      totalCompleted: completedWithMessages.length,
    });
  } catch (error) {
    log.error({ error }, 'Failed to get pending images');
    return NextResponse.json(
      {
        error: 'Failed to get pending images',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
