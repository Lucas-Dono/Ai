# 🚀 Plan de Mejora del Sistema de Tours

## ✅ Fase 1 Completada (1-2 días)

### Logros:
- ✅ Eliminado ProgressTracker (componente duplicado)
- ✅ Actualizado contenido de tours con información actual (2025)
- ✅ Agregado data-attributes a elementos clave del UI
- ✅ Tours más concisos y enfocados (6 tours → contenido modernizado)

### Cambios Realizados:

#### Tours Actualizados:
1. **Welcome Tour** - Introducción rápida al dashboard y navegación
2. **First Agent** - Guía para crear tu primera IA
3. **Chat Basics** - Cómo chatear e interactuar con tus AIs
4. **Community Tour** - Explorar comunidad y marketplace (actualizado desde "Marketplace")
5. **Worlds Intro** - Crear mundos multi-agente
6. **Plans & Features** - Planes y características (eliminadas referencias a API inexistente)

#### Data-Attributes Agregados:
- `data-tour="sidebar-nav"` - Navegación lateral
- `data-tour="dashboard-main"` - Contenido principal dashboard
- `data-tour="create-ai-button"` - Botón crear IA (navbar y FAB)
- `data-tour="community-link"` - Link a comunidad
- `data-tour="worlds-link"` - Link a mundos
- `data-tour="billing-link"` - Link a billing
- `data-tour="my-stats-link"` - Link a progreso
- `data-tour="agent-card"` - Tarjeta de agente
- `data-tour="agent-name-input"` - Preview nombre en constructor
- `data-tour="agent-personality"` - Preview personalidad
- `data-tour="agent-avatar"` - Avatar en constructor
- `data-tour="agent-input"` - Input principal en constructor
- `data-tour="agent-submit"` - Botón submit en constructor
- `data-tour="create-world-button"` - Botón crear mundo

---

## 📋 Fase 2: Tours Inteligentes y Analytics (1 semana)

### Objetivos:
Hacer que los tours sean contextuales, inteligentes y medir su efectividad.

### 2.1 Sistema de Tours Contextuales

**Problema:** Los tours actuales solo se activan manualmente. Los usuarios pueden perderse features importantes.

**Solución:** Sistema de hints automáticos basados en comportamiento.

```typescript
// lib/onboarding/contextual-tours.ts
export interface ContextualTrigger {
  id: string;
  tourId: string;
  condition: () => boolean | Promise<boolean>;
  priority: number; // 1-10, mayor = más urgente
  cooldown?: number; // ms antes de poder mostrar again
  maxShows?: number; // veces máximas que se puede mostrar
}

export const contextualTriggers: ContextualTrigger[] = [
  {
    id: "first-ai-needed",
    tourId: "first-agent",
    condition: async () => {
      const stats = await getUserStats();
      return stats.agentCount === 0 && stats.timeSinceLogin > 120000; // 2 minutos
    },
    priority: 10, // Muy importante
    maxShows: 1,
  },
  {
    id: "first-chat-needed",
    tourId: "chat-basics",
    condition: async () => {
      const stats = await getUserStats();
      return stats.agentCount > 0 && stats.totalMessages === 0;
    },
    priority: 9,
    maxShows: 1,
  },
  {
    id: "worlds-feature-discovery",
    tourId: "worlds-intro",
    condition: async () => {
      const stats = await getUserStats();
      return stats.agentCount >= 2 && stats.worldCount === 0;
    },
    priority: 5,
    cooldown: 86400000, // 1 día
    maxShows: 2,
  },
  {
    id: "community-engagement",
    tourId: "community-tour",
    condition: async () => {
      const stats = await getUserStats();
      return stats.agentCount >= 1 &&
             stats.messageCount >= 20 &&
             !stats.hasVisitedCommunity;
    },
    priority: 4,
  },
];

// Hook para detectar y mostrar tours contextuales
export function useContextualTours() {
  useEffect(() => {
    const checkTriggers = async () => {
      for (const trigger of contextualTriggers.sort((a, b) => b.priority - a.priority)) {
        if (await shouldShowTrigger(trigger)) {
          showContextualHint(trigger);
          break; // Solo mostrar uno a la vez
        }
      }
    };

    checkTriggers();
    const interval = setInterval(checkTriggers, 30000); // Revisar cada 30s
    return () => clearInterval(interval);
  }, []);
}
```

**Implementación:**
1. Crear `lib/onboarding/contextual-tours.ts`
2. Crear `components/onboarding/ContextualHint.tsx` (hint no intrusivo)
3. Integrar en `app/layout.tsx` o `app/dashboard/layout.tsx`
4. Agregar tracking de eventos de usuario (usar PostHog o similar)

### 2.2 Sistema de Analytics de Tours

**Objetivo:** Medir qué tours son útiles y dónde los usuarios se atascan.

```typescript
// lib/onboarding/tour-analytics.ts
export interface TourAnalytics {
  tourId: string;
  stepId: string;
  action: 'start' | 'complete' | 'skip' | 'abandon' | 'timeout';
  timeSpent: number; // ms
  timestamp: Date;
  userId: string;
}

export async function trackTourEvent(event: TourAnalytics) {
  // Enviar a PostHog, Mixpanel, o tu sistema de analytics
  await fetch('/api/analytics/tours', {
    method: 'POST',
    body: JSON.stringify(event),
  });

  // También trackear en PostHog si está disponible
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('tour_interaction', event);
  }
}

// Dashboard de métricas
export interface TourMetrics {
  tourId: string;
  starts: number;
  completions: number;
  skips: number;
  abandons: number;
  avgTimeSpent: number;
  completionRate: number;
  helpfulnessScore?: number; // rating 1-5 de usuarios
  stepMetrics: {
    stepId: string;
    avgTimeSpent: number;
    dropoffRate: number;
  }[];
}
```

**Features a Implementar:**
- Trackear inicio/completado/skip de cada tour
- Medir tiempo en cada step
- Detectar abandono (usuario cierra sin completar)
- Rating opcional al final ("¿Te fue útil este tour?")
- Dashboard admin para ver métricas (app/admin/tours-analytics)

### 2.3 Tours para Features Específicas

Crear micro-tours especializados para features complejas:

```typescript
// Tours nuevos a agregar:
export const specializedTours = [
  {
    id: "nsfw-content-guide",
    name: "Contenido NSFW",
    description: "Aprende a manejar contenido para adultos de forma segura",
    trigger: "when user enables NSFW mode first time",
    steps: [...],
  },
  {
    id: "voice-chat-intro",
    name: "Chat de Voz",
    description: "Habla con tus AIs usando tu voz",
    trigger: "when user hovers voice button 3+ times without using",
    steps: [...],
  },
  {
    id: "behaviors-advanced",
    name: "Comportamientos Proactivos",
    description: "Programa comportamientos avanzados para tus AIs",
    trigger: "when user has 2+ AIs and hasn't used behaviors",
    steps: [...],
  },
  {
    id: "memory-system",
    name: "Sistema de Memoria",
    description: "Cómo funciona la memoria episódica de tus AIs",
    trigger: "after 50 messages with any AI",
    steps: [...],
  },
];
```

---

## 🎮 Fase 3: Gamificación y Experiencia (2 semanas)

### 3.1 Sistema de Gamificación

**Objetivo:** Hacer los tours más engaging con recompensas.

```typescript
// lib/onboarding/gamification.ts
export interface TourReward {
  tourId: string;
  karma: number;
  badge?: {
    id: string;
    name: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  unlock?: string; // Feature ID desbloqueada
}

export const tourRewards: Record<string, TourReward> = {
  "welcome": {
    tourId: "welcome",
    karma: 50,
    badge: {
      id: "explorer",
      name: "Explorador",
      icon: "🗺️",
      rarity: "common",
    },
  },
  "first-agent": {
    tourId: "first-agent",
    karma: 100,
    badge: {
      id: "creator",
      name: "Creador",
      icon: "🎨",
      rarity: "rare",
    },
    unlock: "advanced_personality_traits",
  },
  // ... más recompensas
};

// Al completar tour:
export async function awardTourCompletion(tourId: string, userId: string) {
  const reward = tourRewards[tourId];
  if (!reward) return;

  // Dar karma
  await updateUserKarma(userId, reward.karma);

  // Desbloquear badge
  if (reward.badge) {
    await unlockBadge(userId, reward.badge.id);
    showBadgeAnimation(reward.badge);
  }

  // Desbloquear feature
  if (reward.unlock) {
    await unlockFeature(userId, reward.unlock);
    showUnlockNotification(reward.unlock);
  }

  // Confetti animation 🎉
  showConfetti();
}
```

**Features:**
- Karma points por completar tours
- Badges coleccionables
- Desbloqueo de features avanzadas
- Progress bar en OnboardingMenu
- Leaderboard de "Tour Masters" (opcional)

### 3.2 Tours por Nivel de Experiencia

**Objetivo:** Mostrar contenido relevante según experiencia del usuario.

```typescript
// lib/onboarding/experience-levels.ts
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export function getUserExperienceLevel(stats: UserStats): ExperienceLevel {
  const { agentCount, worldCount, messageCount, daysSinceSignup } = stats;

  // Expert: Usuario power
  if (agentCount >= 10 && worldCount >= 3 && messageCount >= 500) {
    return 'expert';
  }

  // Advanced: Usuario experimentado
  if (agentCount >= 5 && messageCount >= 100 && daysSinceSignup >= 7) {
    return 'advanced';
  }

  // Intermediate: Usuario con experiencia básica
  if (agentCount >= 2 && messageCount >= 20) {
    return 'intermediate';
  }

  // Beginner: Usuario nuevo
  return 'beginner';
}

export const toursByLevel: Record<ExperienceLevel, string[]> = {
  beginner: [
    'welcome',
    'first-agent',
    'chat-basics',
  ],
  intermediate: [
    'worlds-intro',
    'community-tour',
    'behaviors-basic',
  ],
  advanced: [
    'behaviors-advanced',
    'memory-system',
    'plans-and-features',
  ],
  expert: [
    'api-integration', // Cuando esté disponible
    'custom-prompts-advanced',
    'performance-optimization',
  ],
};

// Filtrar tours en OnboardingMenu según nivel
export function getRelevantTours(level: ExperienceLevel): OnboardingTour[] {
  const tourIds = toursByLevel[level];
  return onboardingTours.filter(tour => tourIds.includes(tour.id));
}
```

### 3.3 Mejoras de UI/UX

**Objetivo:** Hacer el TourOverlay más moderno y agradable.

```typescript
// Mejoras visuales a implementar:

// 1. Animaciones suaves con Framer Motion
const tourVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', duration: 0.5 }
  },
  exit: { opacity: 0, scale: 0.9 }
};

// 2. Modo oscuro/claro adaptativo
const tourCardStyle = {
  light: "bg-white border-gray-200",
  dark: "bg-gray-900 border-gray-700"
};

// 3. Keyboard shortcuts
const shortcuts = {
  'ArrowRight': () => nextStep(),
  'ArrowLeft': () => prevStep(),
  'Escape': () => skipTour(),
  'Enter': () => action?.onClick(),
};

// 4. Mobile-responsive (drawer en vez de tooltip)
const isMobile = useMediaQuery('(max-width: 768px)');
return isMobile ? <TourDrawer /> : <TourCard />;

// 5. Videos/GIFs demostrativos
<TourStep
  title="Crea tu Primera IA"
  description="..."
  media={{
    type: 'video',
    url: '/tours/create-ai.mp4',
    thumbnail: '/tours/create-ai-thumb.jpg'
  }}
/>

// 6. Progress indicators mejorados
<div className="flex gap-1">
  {tour.steps.map((_, idx) => (
    <div
      key={idx}
      className={cn(
        "h-1 flex-1 rounded-full transition-all",
        idx <= currentStep ? "bg-primary" : "bg-gray-300"
      )}
    />
  ))}
</div>

// 7. Búsqueda de tours
<Input
  placeholder="Buscar tours..."
  onChange={(e) => filterTours(e.target.value)}
/>

// 8. Tour preview antes de iniciar
<TourCard
  preview
  tour={selectedTour}
  onStart={() => startTour(selectedTour.id)}
/>
```

---

## 🌐 Fase 2.5: Internacionalización (paralelo con Fase 2)

**Objetivo:** Traducir todos los tours al español e inglés.

### Archivos a Crear:

```json
// messages/es/tours.json
{
  "tours": {
    "welcome": {
      "name": "Tour de Bienvenida",
      "description": "Aprende lo básico de Creador de Inteligencias",
      "steps": {
        "intro": {
          "title": "¡Bienvenido a Creador de Inteligencias!",
          "description": "Esta plataforma te permite crear y gestionar compañeros AI..."
        }
      }
    }
  }
}

// messages/en/tours.json
{
  "tours": {
    "welcome": {
      "name": "Welcome Tour",
      "description": "Learn the basics of AI Creator",
      "steps": {
        "intro": {
          "title": "Welcome to AI Creator!",
          "description": "This platform allows you to create and manage AI companions..."
        }
      }
    }
  }
}
```

### Actualizar Componentes:

```typescript
// lib/onboarding/tours.ts
import { useTranslations } from 'next-intl';

export function useOnboardingTours() {
  const t = useTranslations('tours');

  return onboardingTours.map(tour => ({
    ...tour,
    name: t(`${tour.id}.name`),
    description: t(`${tour.id}.description`),
    steps: tour.steps.map((step, idx) => ({
      ...step,
      title: t(`${tour.id}.steps.${idx}.title`),
      description: t(`${tour.id}.steps.${idx}.description`),
    })),
  }));
}
```

---

## 📊 Métricas de Éxito

### KPIs a Medir:

1. **Completion Rate**: % de usuarios que completan cada tour
   - Target: >60% para tours required, >30% para opcionales

2. **Time to First AI**: Tiempo desde signup hasta crear primera IA
   - Target: <5 minutos para usuarios que usan tours

3. **Feature Discovery**: % de usuarios que descubren features clave (Worlds, Community, etc.)
   - Target: >70% descubren Worlds, >80% descubren Community

4. **Retention Impact**: % de usuarios que completan tours vs. no completan
   - Hypothesis: +20% retention para quienes completan tours

5. **User Satisfaction**: Rating de utilidad de tours
   - Target: 4.0+ de 5.0 estrellas

---

## 🛠️ Stack Tecnológico

### Herramientas Necesarias:

1. **Analytics**: PostHog o Mixpanel
2. **A/B Testing**: PostHog Feature Flags (ya implementado)
3. **Animations**: Framer Motion (ya instalado)
4. **i18n**: next-intl (ya instalado)
5. **Storage**: localStorage para progreso, DB para analytics

### Integraciones:

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
    });
  }
}

export function trackTourEvent(event: {
  tourId: string;
  action: string;
  properties?: Record<string, any>;
}) {
  posthog.capture(`tour_${event.action}`, {
    tour_id: event.tourId,
    ...event.properties,
  });
}
```

---

## ⚠️ Consideraciones Importantes

### Performance:
- Tours no deben afectar tiempo de carga inicial
- Lazy load componentes de tours
- Caché de progreso en localStorage

### UX:
- NUNCA bloquear funcionalidad principal
- Siempre permitir skip/cerrar
- No mostrar múltiples hints simultáneos
- Respetar cooldowns entre hints

### Accessibility:
- Soporte completo para keyboard navigation
- ARIA labels para screen readers
- Alto contraste en modo accesibilidad
- Focus trap en tour overlay

### Mobile:
- Tours adaptativos a pantalla pequeña
- Touch-friendly (botones grandes)
- Drawer en vez de tooltips flotantes

---

## 📅 Timeline Sugerido

### Semana 1 (Fase 2 - Parte 1):
- [ ] Sistema de tours contextuales básico
- [ ] Triggers para 3-4 casos comunes
- [ ] ContextualHint component
- [ ] Testing en desarrollo

### Semana 2 (Fase 2 - Parte 2):
- [ ] Sistema de analytics completo
- [ ] Integración con PostHog
- [ ] API endpoint para tracking
- [ ] Tours especializados (NSFW, Voice, etc.)

### Semana 3 (Fase 3 - Parte 1):
- [ ] Sistema de gamificación
- [ ] Badges y recompensas
- [ ] Animaciones y confetti
- [ ] Tours por nivel de experiencia

### Semana 4 (Fase 3 - Parte 2):
- [ ] Mejoras de UI/UX
- [ ] Mobile-responsive
- [ ] Videos/GIFs demostrativos
- [ ] Búsqueda de tours
- [ ] Testing final y bug fixes

### Paralelo (i18n):
- [ ] Traducir todos los tours (1-2 días)
- [ ] Crear archivos messages/
- [ ] Actualizar componentes con useTranslations
- [ ] Testing en ambos idiomas

---

## 🎯 Prioridades

### Must Have (Crítico):
1. ✅ Tours contextuales automáticos
2. ✅ Analytics básico
3. ✅ i18n (español/inglés)
4. ✅ Mobile-responsive

### Should Have (Importante):
5. Gamificación (badges, karma)
6. Tours por nivel de experiencia
7. Tours especializados (NSFW, Voice, etc.)

### Nice to Have (Opcional):
8. Videos/GIFs demostrativos
9. Búsqueda de tours
10. Dashboard de analytics admin
11. A/B testing de tours diferentes

---

## 💡 Ideas Futuras

### Fase 4 (Largo Plazo):
- **Tours personalizados con IA**: Generar tours dinámicos basados en comportamiento
- **Tours colaborativos**: Usuarios crean y comparten sus propios tours
- **Tours en video**: Tours narrados por voz sintética
- **Tours gamificados**: Quests y achievements
- **Tours adaptativos**: Machine learning para optimizar tours según métricas

---

## 📝 Notas Finales

### Lecciones Aprendidas (Fase 1):
- Data-attributes son mucho más robustos que selectores CSS
- Tours deben ser concisos (3-4 pasos máximo)
- Contenido debe actualizarse regularmente con la app
- Eliminar tours duplicados es importante para UX

### Próximos Pasos Inmediatos:
1. Decidir si implementar Fase 2 completa o por partes
2. Configurar PostHog para analytics (si aún no está)
3. Diseñar sistema de badges y recompensas
4. Crear mockups para mejoras de UI

### Preguntas para Discutir:
- ¿Qué tours contextuales son más importantes?
- ¿Cuánto karma dar por cada tour?
- ¿Qué features desbloquear con tours?
- ¿Mostrar tours en modo producción desde el inicio?
