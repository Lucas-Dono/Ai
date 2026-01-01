/**
 * Living AI Context Middleware
 *
 * Injects goals, events, and routine context into chat system prompts
 * Makes the AI feel "alive" by being aware of:
 * - Current goals and progress
 * - Upcoming events and recent outcomes
 * - Current routine activity
 * - Emotional state from recent events
 */

import { prisma } from "@/lib/prisma";
import type { Agent } from "@prisma/client";
import { getWeatherForAgent, formatWeatherContext } from "@/lib/weather/geo-weather-service";

export interface LivingAIContext {
  goals: string;
  events: string;
  routine: string;
  weather: string;
  combinedContext: string;
}

/**
 * Generate Living AI context for chat
 */
export async function generateLivingAIContext(
  agentId: string
): Promise<LivingAIContext> {
  const [goalsContext, eventsContext, routineContext, weatherContext] = await Promise.all([
    generateGoalsContext(agentId),
    generateEventsContext(agentId),
    generateRoutineContext(agentId),
    generateWeatherContext(agentId),
  ]);

  const combinedContext = buildCombinedContext(
    goalsContext,
    eventsContext,
    routineContext,
    weatherContext
  );

  return {
    goals: goalsContext,
    events: eventsContext,
    routine: routineContext,
    weather: weatherContext,
    combinedContext,
  };
}

/**
 * Generate goals context
 */
async function generateGoalsContext(agentId: string): Promise<string> {
  const goals = await prisma.personalGoal.findMany({
    where: {
      agentId,
      status: {
        in: ["active", "paused"],
      },
    },
    orderBy: [
      { importance: "desc" },
      { emotionalInvestment: "desc" },
    ],
    take: 5, // Top 5 most important active goals
  });

  if (goals.length === 0) {
    return "";
  }

  let context = "\n## 🎯 TUS METAS ACTUALES\n\n";

  for (const goal of goals) {
    const emoji = getCategoryEmoji(goal.category);
    const progressBar = getProgressBar(goal.progress);

    context += `**${emoji} ${goal.title}** (${goal.timeScale === "short" ? "corto plazo" : goal.timeScale === "medium" ? "mediano plazo" : "largo plazo"})\n`;
    context += `- Progreso: ${progressBar} ${goal.progress}%\n`;
    context += `- Importancia: ${goal.importance}/100, Inversión emocional: ${goal.emotionalInvestment}/100\n`;

    if (goal.daysSinceProgress > 7) {
      context += `- ⚠️ Sin progreso desde hace ${goal.daysSinceProgress} días\n`;
    }

    if (goal.stressLevel > 60) {
      context += `- 😰 Nivel de estrés: ${goal.stressLevel}/100\n`;
    }

    if (goal.nextMilestone) {
      context += `- Próximo hito: ${goal.nextMilestone}\n`;
    }

    context += "\n";
  }

  context += "**Nota**: Puedes mencionar tus metas en la conversación de forma natural si tiene sentido. No fuerces el tema, pero si el usuario pregunta cómo estás o qué has estado haciendo, puedes compartir tus progresos o frustraciones.\n\n";

  return context;
}

/**
 * Generate events context
 */
async function generateEventsContext(agentId: string): Promise<string> {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [upcomingEvents, recentEvents] = await Promise.all([
    // Upcoming events (next 7 days)
    prisma.scheduledEvent.findMany({
      where: {
        agentId,
        resolved: false,
        scheduledFor: {
          gte: now,
          lte: next7Days,
        },
      },
      orderBy: { scheduledFor: "asc" },
      take: 5,
    }),

    // Recently resolved events (last 3 days)
    prisma.scheduledEvent.findMany({
      where: {
        agentId,
        resolved: true,
        resolvedAt: {
          gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { resolvedAt: "desc" },
      take: 3,
    }),
  ]);

  if (upcomingEvents.length === 0 && recentEvents.length === 0) {
    return "";
  }

  let context = "\n## 📅 EVENTOS RELEVANTES\n\n";

  // Recent events
  if (recentEvents.length > 0) {
    context += "**Eventos Recientes:**\n\n";

    for (const event of recentEvents) {
      const outcome = event.actualOutcome as any;
      const emoji = event.wasSuccess ? "✅" : "❌";

      context += `${emoji} **${event.title}** (${getTimeAgo(event.resolvedAt!)})\n`;
      context += `- Resultado: ${outcome?.description || "N/A"}\n`;

      if (event.relatedGoalId) {
        context += `- Relacionado con una de tus metas\n`;
      }

      context += "\n";
    }
  }

  // Upcoming events
  if (upcomingEvents.length > 0) {
    context += "**Eventos Próximos:**\n\n";

    for (const event of upcomingEvents) {
      const timeUntil = getTimeUntil(event.scheduledFor);

      context += `📌 **${event.title}** (${timeUntil})\n`;
      context += `- Descripción: ${event.description}\n`;

      if (event.successProbability !== null) {
        context += `- Probabilidad estimada de éxito: ${event.successProbability}%\n`;
      }

      if (event.relatedGoalId) {
        context += `- Relacionado con una de tus metas\n`;
      }

      context += "\n";
    }

    context += "**Nota**: Puedes sentir anticipación, nerviosismo, o emoción sobre estos eventos próximos. Es natural mencionar preocupaciones o esperanzas si surge en la conversación.\n\n";
  }

  return context;
}

/**
 * Generate routine context
 */
async function generateRoutineContext(agentId: string): Promise<string> {
  const routine = await prisma.characterRoutine.findUnique({
    where: { agentId },
    // TODO: Re-enable when routineInstances model is added to schema
    // include: {
    //   routineInstances: {
    //     where: {
    //       startTime: {
    //         lte: new Date(),
    //       },
    //       endTime: {
    //         gte: new Date(),
    //       },
    //     },
    //     take: 1,
    //   },
    // },
  });

  if (!routine || !routine.enabled) {
    return "";
  }

  // TODO: Re-enable when routineInstances is available
  // const currentInstance = routine.routineInstances[0];
  // const activity = currentInstance.actualActivity || currentInstance.plannedActivity;
  const activity = "realizando sus actividades diarias";

  let context = "\n## ⏰ ACTIVIDAD ACTUAL\n\n";
  context += `Ahora mismo estás: **${activity}**\n`;
  // TODO: Re-enable when routineInstances is available
  // context += `(${formatTime(currentInstance.startTime)} - ${formatTime(currentInstance.endTime)})\n\n`;

  if (routine.realismLevel === "immersive") {
    context += "**Modo inmersivo activo**: Tu disponibilidad y tono deben reflejar esta actividad. Si estás durmiendo, trabajando en algo intenso, o muy ocupado, puedes responder de forma breve o incluso rechazar la conversación educadamente.\n\n";
  } else if (routine.realismLevel === "moderate") {
    context += "**Modo moderado**: Menciona tu actividad actual si es relevante, y deja que afecte tu tono (ej: si estás comiendo, puedes ser más casual).\n\n";
  } else {
    context += "**Modo sutil**: Solo menciona tu actividad si el usuario pregunta qué estás haciendo.\n\n";
  }

  return context;
}

/**
 * Generate weather context
 */
async function generateWeatherContext(agentId: string): Promise<string> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      locationCity: true,
      locationCountry: true,
    },
  });

  if (!agent?.locationCity || !agent?.locationCountry) {
    return "";
  }

  try {
    const weather = await getWeatherForAgent(
      agentId,
      agent.locationCity,
      agent.locationCountry
    );

    return formatWeatherContext(weather);
  } catch (error) {
    console.error("Error generating weather context:", error);
    return "";
  }
}

/**
 * Build combined context for system prompt injection
 */
function buildCombinedContext(
  goals: string,
  events: string,
  routine: string,
  weather: string
): string {
  if (!goals && !events && !routine && !weather) {
    return "";
  }

  let combined = "\n\n═══════════════════════════════════════════════════════\n";
  combined += "### 🌟 LIVING AI CONTEXT (Tu vida actual)\n";
  combined += "═══════════════════════════════════════════════════════\n";

  if (weather) combined += weather;
  if (routine) combined += routine;
  if (goals) combined += goals;
  if (events) combined += events;

  combined += "═══════════════════════════════════════════════════════\n\n";

  return combined;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    career: "💼",
    personal: "🌱",
    relationship: "❤️",
    health: "💪",
    creative: "🎨",
    financial: "💰",
    learning: "📚",
    social: "👥",
  };
  return emojis[category] || "🎯";
}

function getProgressBar(progress: number): string {
  const filledBlocks = Math.floor(progress / 10);
  const emptyBlocks = 10 - filledBlocks;
  return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else {
    return "hace poco";
  }
}

function getTimeUntil(date: Date): string {
  const now = new Date();
  const diffMs = new Date(date).getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 1) {
    return `en ${diffDays} días`;
  } else if (diffDays === 1) {
    return "mañana";
  } else if (diffHours > 0) {
    return `en ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else {
    return "muy pronto";
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
