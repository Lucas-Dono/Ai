/**
 * SISTEMA DE EVENTOS ESPECIALES
 *
 * Ofrece upgrades temporales en fechas especiales (Navidad, etc.)
 * para aumentar engagement SIN devaluar el producto.
 *
 * Estrategia:
 * - NO ofrecer trials aleatorios ("parece desesperado")
 * - SÍ ofrecer en fechas especiales ("regalo de la empresa")
 * - Crear FOMO con duración limitada
 */

export interface SpecialEvent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  startDate: Date;
  endDate: Date;
  benefits: {
    tier: 'free' | 'plus';
    tempUpgradeTo: 'plus' | 'ultra';
    durationHours: number; // Duración del upgrade temporal
    message: string;
  };
  active: boolean;
}

/**
 * Eventos especiales del año
 */
export const SPECIAL_EVENTS: Record<string, SpecialEvent> = {
  christmas: {
    id: 'christmas-2025',
    name: 'Navidad',
    emoji: '🎄',
    description: 'Papa Noel ha llegado con regalos para todos!',
    startDate: new Date('2025-12-24T00:00:00'),
    endDate: new Date('2025-12-26T23:59:59'),
    benefits: {
      tier: 'free',
      tempUpgradeTo: 'plus',
      durationHours: 24,
      message: `🎄 ¡JOJOJO! Papa Noel ha llegado!

Te ha regalado **1 día completo** de nuestro plan Plus ($10/mes)

🎁 Hoy disfrutas de:
• 100 mensajes (vs 10 normal)
• Contexto extendido (40 mensajes)
• Behaviors avanzados (Yandere, BPD, etc.)
• NSFW sin restricciones

⏰ Válido hasta: Mañana a las 11:59 PM
🎅 Felices fiestas de parte de todo el equipo!`,
    },
    active: true,
  },

  newYear: {
    id: 'new-year-2026',
    name: 'Año Nuevo',
    emoji: '🎆',
    description: 'Empieza el año con todo!',
    startDate: new Date('2026-01-01T00:00:00'),
    endDate: new Date('2026-01-02T23:59:59'),
    benefits: {
      tier: 'free',
      tempUpgradeTo: 'plus',
      durationHours: 48, // 2 días para año nuevo
      message: `🎆 ¡FELIZ AÑO NUEVO!

Para celebrar el inicio del 2026, te regalamos **2 días** de Plus!

✨ Empieza el año conociendo mejor a tus IAs:
• 100 mensajes/día
• Memoria extendida
• Todos los behaviors desbloqueados

⏰ Válido hasta: 2 de enero, 11:59 PM
🥳 ¡Que sea un gran año!`,
    },
    active: true,
  },

  valentines: {
    id: 'valentines-2026',
    name: 'San Valentín',
    emoji: '💝',
    description: 'Celebra el amor con tus IAs favoritas',
    startDate: new Date('2026-02-14T00:00:00'),
    endDate: new Date('2026-02-15T23:59:59'),
    benefits: {
      tier: 'free',
      tempUpgradeTo: 'plus',
      durationHours: 24,
      message: `💝 ¡FELIZ SAN VALENTÍN!

El amor está en el aire... y en nuestro código!

🎁 Por hoy, disfruta Plus GRATIS:
• Conversaciones ilimitadas con quien quieras
• Behaviors románticos avanzados
• Sin restricciones NSFW

⏰ Válido por 24 horas
💕 Celebra el amor de la forma que quieras!`,
    },
    active: true,
  },

  halloween: {
    id: 'halloween-2025',
    name: 'Halloween',
    emoji: '🎃',
    description: 'Una noche de terror... o placer',
    startDate: new Date('2025-10-31T00:00:00'),
    endDate: new Date('2025-11-01T23:59:59'),
    benefits: {
      tier: 'free',
      tempUpgradeTo: 'plus',
      durationHours: 24,
      message: `🎃 ¡FELIZ HALLOWEEN!

Esta noche, tus IAs están más... intensas de lo normal.

👻 Regalo de Halloween:
• Plus GRATIS por 24 horas
• Behaviors oscuros desbloqueados (Yandere, BPD)
• Sin restricciones... si te atreves

⏰ Solo por esta noche
🕷️ ¿Te atreves a explorar su lado oscuro?`,
    },
    active: true,
  },

  birthday: {
    id: 'app-birthday-2026',
    name: 'Aniversario de la App',
    emoji: '🎂',
    description: 'Celebramos 1 año juntos!',
    startDate: new Date('2026-06-01T00:00:00'),
    endDate: new Date('2026-06-03T23:59:59'),
    benefits: {
      tier: 'free',
      tempUpgradeTo: 'plus',
      durationHours: 72, // 3 días (aniversario especial)
      message: `🎂 ¡FELIZ PRIMER ANIVERSARIO!

Hace 1 año lanzamos esta app... ¡Y sigues aquí!

🎁 Como agradecimiento, te regalamos **3 DÍAS de Plus**:
• 100 mensajes/día
• Todo desbloqueado
• Nuestra forma de decir "gracias"

⏰ Válido hasta el 3 de junio
❤️ Gracias por ser parte de esta comunidad!`,
    },
    active: false, // Activar cuando corresponda
  },

  // EVENTO DE EMERGENCIA: Si necesitas aumentar engagement rápido
  flashEvent: {
    id: 'flash-event-emergency',
    name: 'Flash Event',
    emoji: '⚡',
    description: 'Sorpresa! Evento relámpago',
    startDate: new Date(), // Configurar manualmente
    endDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 horas
    benefits: {
      tier: 'free',
      tempUpgradeTo: 'plus',
      durationHours: 12,
      message: `⚡ ¡EVENTO FLASH!

Solo por las próximas 12 HORAS:
Plus GRATIS para todos!

🚀 Aprovecha AHORA:
• 100 mensajes
• Todo desbloqueado
• Solo 12 horas!

⏰ Termina hoy a las 11 PM
🏃 ¡Corre, el tiempo vuela!`,
    },
    active: false, // Activar manualmente en emergencias
  },
};

/**
 * Verifica si hay un evento activo en este momento
 */
export function getActiveEvent(): SpecialEvent | null {
  const now = new Date();

  for (const event of Object.values(SPECIAL_EVENTS)) {
    if (!event.active) continue;

    if (now >= event.startDate && now <= event.endDate) {
      return event;
    }
  }

  return null;
}

/**
 * Verifica si un usuario es elegible para el evento
 */
export async function isEligibleForEvent(
  userId: string,
  event: SpecialEvent
): Promise<boolean> {
  // Importar Prisma
  const { prisma } = await import('@/lib/prisma');

  // Verificar si ya usó este evento
  const existingGrant = await prisma.tempTierGrant.findFirst({
    where: {
      userId,
      eventId: event.id,
    },
  });

  if (existingGrant) {
    // Ya usó este evento
    return false;
  }

  // Verificar tier actual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return false;

  // Solo usuarios del tier especificado
  return user.plan === event.benefits.tier;
}

/**
 * Activa un evento para un usuario
 */
export async function activateEventForUser(
  userId: string,
  event: SpecialEvent
): Promise<{
  success: boolean;
  message: string;
  expiresAt?: Date;
}> {
  const { prisma } = await import('@/lib/prisma');

  // Verificar elegibilidad
  const eligible = await isEligibleForEvent(userId, event);
  if (!eligible) {
    return {
      success: false,
      message: 'No eres elegible para este evento (ya lo usaste o no aplica a tu tier)',
    };
  }

  // Calcular fecha de expiración
  const expiresAt = new Date(Date.now() + event.benefits.durationHours * 60 * 60 * 1000);

  // Crear grant temporal
  await prisma.tempTierGrant.create({
    data: {
      userId,
      eventId: event.id,
      fromTier: event.benefits.tier,
      toTier: event.benefits.tempUpgradeTo,
      expiresAt,
      active: true,
    },
  });

  console.log(`[SpecialEvents] ✅ Activated ${event.id} for user ${userId} until ${expiresAt}`);

  return {
    success: true,
    message: event.benefits.message,
    expiresAt,
  };
}

/**
 * Verifica si un usuario tiene un tier temporal activo
 */
export async function getActiveTempTier(userId: string): Promise<{
  hasTempTier: boolean;
  tier?: 'plus' | 'ultra';
  expiresAt?: Date;
  eventName?: string;
} | null> {
  const { prisma } = await import('@/lib/prisma');

  const activGrant = await prisma.tempTierGrant.findFirst({
    where: {
      userId,
      active: true,
      expiresAt: {
        gt: new Date(), // Aún no expiró
      },
    },
    orderBy: {
      expiresAt: 'desc', // El más reciente
    },
  });

  if (!activGrant) {
    return { hasTempTier: false };
  }

  // Encontrar el evento
  const event = Object.values(SPECIAL_EVENTS).find(e => e.id === activGrant.eventId);

  return {
    hasTempTier: true,
    tier: activGrant.toTier as 'plus' | 'ultra',
    expiresAt: activGrant.expiresAt,
    eventName: event?.name || 'Evento especial',
  };
}

/**
 * Desactiva grants expirados (ejecutar en cron job)
 */
export async function deactivateExpiredGrants(): Promise<number> {
  const { prisma } = await import('@/lib/prisma');

  const result = await prisma.tempTierGrant.updateMany({
    where: {
      active: true,
      expiresAt: {
        lt: new Date(), // Ya expiró
      },
    },
    data: {
      active: false,
    },
  });

  console.log(`[SpecialEvents] 🔄 Deactivated ${result.count} expired grants`);

  return result.count;
}

/**
 * Helper: Obtener tier efectivo de un usuario (considerando temp grants)
 */
export async function getEffectiveTier(userId: string, baseTier: string): Promise<string> {
  const tempTier = await getActiveTempTier(userId);

  if (tempTier && tempTier.hasTempTier) {
    console.log(`[SpecialEvents] 🎁 User ${userId} has temp tier: ${tempTier.tier} (expires ${tempTier.expiresAt})`);
    return tempTier.tier!;
  }

  return baseTier;
}
