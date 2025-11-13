/**
 * Script para crear notificaciones de prueba
 *
 * Uso:
 * npx tsx scripts/test-notifications.ts <userId>
 *
 * Ejemplo:
 * npx tsx scripts/test-notifications.ts cm4zmsu1b0001qnxjm5qb5h3j
 */

import { NotificationService } from '@/lib/services/notification.service';

// Tipos de notificaciones de ejemplo
const SAMPLE_NOTIFICATIONS = [
  {
    type: 'new_comment',
    title: 'Nuevo comentario en tu post',
    message: 'Alguien comentó en "Cómo crear una IA emocional"',
    actionUrl: '/community/posts/123',
    metadata: { postId: '123', commentId: '456' }
  },
  {
    type: 'comment_reply',
    title: 'Nueva respuesta a tu comentario',
    message: 'Respondieron a tu comentario sobre GPT-4',
    actionUrl: '/community/posts/123#comment-789',
    metadata: { commentId: '789', replyId: '101' }
  },
  {
    type: 'post_milestone',
    title: '¡50 upvotes!',
    message: 'Tu post "Tutorial de LangChain" alcanzó 50 upvotes',
    actionUrl: '/community/posts/456',
    metadata: { postId: '456', upvotes: 50 }
  },
  {
    type: 'award_received',
    title: '¡Recibiste un award!',
    message: 'Tu post "Guía completa de RAG" recibió un award: Gold',
    actionUrl: '/community/posts/789',
    metadata: { postId: '789', awardType: 'gold' }
  },
  {
    type: 'answer_accepted',
    title: '¡Tu respuesta fue aceptada!',
    message: 'El autor aceptó tu respuesta como la solución',
    actionUrl: '/community/posts/111#comment-222',
    metadata: { postId: '111', commentId: '222' }
  },
  {
    type: 'new_follower',
    title: 'Nuevo seguidor',
    message: 'Carlos García comenzó a seguirte',
    actionUrl: '/profile/carlos-garcia',
    metadata: { followerId: 'carlos-garcia' }
  },
  {
    type: 'badge_earned',
    title: '¡Nuevo badge desbloqueado!',
    message: 'Ganaste el badge: 🏆 Contributor',
    actionUrl: '/profile',
    metadata: { badgeName: 'Contributor', badgeIcon: '🏆' }
  },
  {
    type: 'level_up',
    title: '¡Nivel alcanzado!',
    message: 'Alcanzaste el nivel 5',
    actionUrl: '/profile',
    metadata: { level: 5 }
  },
  {
    type: 'direct_message',
    title: 'Mensaje de Ana López',
    message: 'Hola, me gustaría colaborar en tu proyecto...',
    actionUrl: '/messages/conv-123',
    metadata: { conversationId: 'conv-123', senderId: 'ana-lopez' }
  },
  {
    type: 'event_reminder',
    title: 'Recordatorio de evento',
    message: 'El evento "AI Summit 2025" comienza en 1 hora',
    actionUrl: '/community/events/summit-2025',
    metadata: { eventId: 'summit-2025' }
  },
  {
    type: 'mention',
    title: 'Te mencionaron',
    message: '@usuario te mencionó en un comentario',
    actionUrl: '/community/posts/999#comment-888',
    metadata: { postId: '999', commentId: '888' }
  },
  {
    type: 'new_post',
    title: 'Nuevo post en Comunidad AI',
    message: 'Se publicó: "El futuro de los LLMs"',
    actionUrl: '/community/posts/777',
    metadata: { postId: '777', communityId: 'ai-community' }
  },
  {
    type: 'project_accepted',
    title: '¡Solicitud aceptada!',
    message: 'Fuiste aceptado como colaborador en: Sistema de RAG avanzado',
    actionUrl: '/research/projects/rag-system',
    metadata: { projectId: 'rag-system' }
  },
];

async function createTestNotifications(userId: string) {
  console.log(`🔔 Creando ${SAMPLE_NOTIFICATIONS.length} notificaciones de prueba para usuario: ${userId}\n`);

  for (let i = 0; i < SAMPLE_NOTIFICATIONS.length; i++) {
    const sample = SAMPLE_NOTIFICATIONS[i];

    try {
      await NotificationService.createNotification({
        userId,
        ...sample
      });

      console.log(`✅ [${i + 1}/${SAMPLE_NOTIFICATIONS.length}] ${sample.type}: ${sample.title}`);

      // Pequeña pausa para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error creando notificación ${sample.type}:`, error);
    }
  }

  console.log(`\n✨ ¡Listo! Se crearon todas las notificaciones de prueba.`);
  console.log(`\n📱 Ahora puedes:`);
  console.log(`   1. Abrir la aplicación en /dashboard`);
  console.log(`   2. Ver el badge de notificaciones en el navbar`);
  console.log(`   3. Hacer click para abrir el dropdown`);
  console.log(`   4. O visitar /notifications para ver el centro completo`);
}

// Ejecutar
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: Debes proporcionar un userId');
  console.log('\nUso:');
  console.log('  npx tsx scripts/test-notifications.ts <userId>');
  console.log('\nEjemplo:');
  console.log('  npx tsx scripts/test-notifications.ts cm4zmsu1b0001qnxjm5qb5h3j');
  process.exit(1);
}

createTestNotifications(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
