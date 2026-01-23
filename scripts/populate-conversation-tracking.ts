/**
 * Script: Poblar ConversationTracking con conversaciones existentes
 * Analiza todos los mensajes existentes y crea registros de tracking
 */

import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma';

async function populateConversationTracking() {
  console.log('🚀 Iniciando población de ConversationTracking...\n');

  try {
    // Obtener todas las conversaciones únicas (userId + agentId)
    const conversations = await prisma.message.groupBy({
      by: ['userId', 'agentId'],
      _count: {
        id: true
      },
      _max: {
        createdAt: true
      }
    });

    console.log(`📊 Encontradas ${conversations.length} conversaciones únicas\n`);

    // Obtener conteo de mensajes del asistente (sin leer) por conversación
    const assistantMessageCounts = await prisma.message.groupBy({
      by: ['userId', 'agentId'],
      where: {
        role: 'assistant'
      },
      _count: {
        id: true
      }
    });

    // Crear un mapa para búsqueda rápida
    const unreadCountMap = new Map<string, number>();
    assistantMessageCounts.forEach(item => {
      if (item.userId && item.agentId) {
        const key = `${item.userId}:${item.agentId}`;
        unreadCountMap.set(key, item._count.id);
      }
    });

    if (conversations.length === 0) {
      console.log('✅ No hay conversaciones para procesar');
      return;
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const conversation of conversations) {
      try {
        const { userId, agentId, _count, _max } = conversation;

        // Skip if userId or agentId is null
        if (!userId || !agentId) {
          console.log(`  ⚠️  Skipping conversation with null userId or agentId`);
          continue;
        }

        // Verificar si ya existe un registro
        const existing = await prisma.conversationTracking.findUnique({
          where: {
            userId_agentId: {
              userId,
              agentId
            }
          }
        });

        // Obtener conteo de mensajes sin leer (solo asistente)
        const conversationKey = `${userId}:${agentId}`;
        const unreadCount = unreadCountMap.get(conversationKey) || 0;

        if (existing) {
          // Actualizar registro existente
          await prisma.conversationTracking.update({
            where: {
              userId_agentId: {
                userId,
                agentId
              }
            },
            data: {
              totalMessages: _count.id,
              lastMessageAt: _max.createdAt || new Date(),
              unreadCount, // Solo mensajes del asistente
            }
          });
          updated++;
          console.log(`  ✅ Actualizado: User ${userId.substring(0, 8)} → Agent ${agentId.substring(0, 8)} (${_count.id} msgs, ${unreadCount} unread)`);
        } else {
          // Crear nuevo registro
          await prisma.conversationTracking.create({
            data: {
              id: nanoid(),
              updatedAt: new Date(),
              userId,
              agentId,
              totalMessages: _count.id,
              lastMessageAt: _max.createdAt || new Date(),
              lastSeenAt: new Date(0), // Epoch = nunca visto
              unreadCount, // Solo mensajes del asistente
              isPinned: false
            }
          });
          created++;
          console.log(`  ✅ Creado: User ${userId.substring(0, 8)} → Agent ${agentId.substring(0, 8)} (${_count.id} msgs, ${unreadCount} unread)`);
        }
      } catch (error) {
        errors++;
        console.error(`  ❌ Error procesando conversación:`, error);
      }
    }

    console.log(`\n
═══════════════════════════════════════
   POBLACIÓN COMPLETADA
═══════════════════════════════════════
✅ Creados: ${created}
🔄 Actualizados: ${updated}
${errors > 0 ? `❌ Errores: ${errors}` : ''}
═══════════════════════════════════════\n`);

  } catch (error) {
    console.error('💥 Error fatal:', error);
    throw error;
  }
}

// Ejecutar script
populateConversationTracking()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
