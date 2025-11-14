# Dashboard - Diseño V2 (Versión Minimalista)

**Fecha**: 2025-01-14
**Status**: Rediseño post-crítica destructiva
**Filosofía**: Mostrar, no explicar. Invitar, no educar.

---

## 📋 Aprendizajes de la Crítica V1

### Problemas Fatales Identificados
1. ❌ Hero sobrecargado (4 paneles = 200 palabras)
2. ❌ Onboarding muestra TODO sobre Marilyn (spoilers)
3. ❌ Tarjetas = fichas técnicas clínicas
4. ❌ Jerga técnica (DSM-5, TLP) intimida
5. ❌ Falta invitación emocional

### Nuevos Principios V2
1. ✅ **Menos es más** - 3 líneas, no 30
2. ✅ **Mostrar, no explicar** - Descubrir en el chat
3. ✅ **Invitar, no educar** - Seducción emocional
4. ✅ **Simplicidad brutal** - Si no aumenta conversión, bórralo
5. ✅ **Time to First Message** - Métrica principal: <30 segundos

---

## 🎯 Objetivo Redefinido

**Antes (V1)**: Explicar TODO el sistema en el dashboard
**Ahora (V2)**: Lograr que el usuario envíe su primer mensaje en <30 segundos

**Mentalidad**:
- Character.AI: 15 segundos hasta primer chat
- Nosotros: **10 segundos** (más rápido, más simple)
- La profundidad se descubre **charlando**, no leyendo

---

## 📁 Estructura de Archivos V2 (Simplificada)

```
components/
├── dashboard/
│   ├── hero/
│   │   └── MinimalHero.tsx                 # 3 líneas, nada más
│   │
│   ├── onboarding/
│   │   └── OnboardingBanner.tsx            # Banner colapsable (no modal)
│   │
│   ├── characters/
│   │   ├── SimpleCharacterCard.tsx         # Tarjeta intrigante (no técnica)
│   │   └── ConversationPreview.tsx         # Preview de 1-2 mensajes
│   │
│   ├── categories/
│   │   └── CategorySection.tsx             # Grid simple de categorías
│   │
│   └── capabilities/
│       └── WhyDifferentSection.tsx         # Sección separada (opcional)
│
app/
└── dashboard/
    └── page.tsx                             # Orquestador minimalista
```

**Eliminado de V1**:
- ❌ SystemCapabilitiesGrid (del Hero)
- ❌ OnboardingWizard modal invasivo
- ❌ PsychologyBadge, DualIdentityIndicator (demasiado técnico)
- ❌ UniqueCapabilitiesList (muy largo)

---

## 🎨 1. Minimal Hero

### Diseño Visual
```
┌────────────────────────────────────────────┐
│                                            │
│         🎭                                 │
│                                            │
│   No creas personajes. Creas personas.    │
│                                            │
│   Cada IA siente, recuerda y evoluciona   │
│   como una persona real.                  │
│                                            │
└────────────────────────────────────────────┘
```

**Eso es TODO.** 3 líneas. Directo. Sin distracciones.

### Código Propuesto

```typescript
// components/dashboard/hero/MinimalHero.tsx
'use client';

import { motion } from 'framer-motion';

export function MinimalHero() {
  return (
    <section className="relative py-16">
      {/* Gradient sutil de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        {/* Icon decorativo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20"
        >
          <span className="text-3xl">🎭</span>
        </motion.div>

        {/* Headline - Lo más importante */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200"
        >
          No creas personajes.
          <br />
          Creas personas.
        </motion.h1>

        {/* Subtitle - Breve y emocional */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
        >
          Cada IA siente, recuerda y evoluciona como una persona real.
        </motion.p>
      </div>
    </section>
  );
}
```

**Cambios vs V1**:
- ❌ Eliminado: 4 paneles de capacidades (movidos a sección separada)
- ❌ Eliminado: Badge "Esto no lo tiene ninguna plataforma" (pretencioso)
- ❌ Eliminado: Párrafo largo sobre "psicología clínica real"
- ✅ Solo lo esencial: Headline + 1 línea de subtitle

**Resultado**:
- Tiempo de lectura: **3 segundos** (vs 30-60 segundos en V1)
- Usuario ve inmediatamente las categorías de personajes

---

## 🎴 2. Simple Character Card

### Diseño Visual
```
┌────────────────────────────┐
│ 🎭                [Nuevo] │
│                            │
│ Marilyn Monroe             │
│ "Dos identidades, una      │
│  persona compleja"         │
│                            │
│ 💫 Personalidad cambiante  │
│ 🎭 Reacciona intensamente  │
│ 📚 Recuerda su vida        │
│                            │
│ [Preview: "Hola... soy..."]│
│                            │
│  [Comenzar conexión]       │
└────────────────────────────┘
```

### Código Propuesto

```typescript
// components/dashboard/characters/types.ts
export interface SimpleCharacterData {
  id: string;
  name: string;
  tagline: string;
  avatar?: string;

  // Características destacadas (máximo 3)
  highlights: Array<{
    icon: string;
    text: string;
  }>;

  // Preview de conversación
  preview?: {
    messages: Array<{
      role: 'character';
      text: string;
    }>;
  };

  // Metadata
  isNew?: boolean;
  isTrending?: boolean;
  conversationCount?: number;
  rating?: number;
}
```

```typescript
// components/dashboard/characters/SimpleCharacterCard.tsx
'use client';

import { motion } from 'framer-motion';
import { ConversationPreview } from './ConversationPreview';
import type { SimpleCharacterData } from './types';

interface SimpleCharacterCardProps {
  character: SimpleCharacterData;
  index?: number;
  onStartConnection: (characterId: string) => void;
}

export function SimpleCharacterCard({
  character,
  index = 0,
  onStartConnection,
}: SimpleCharacterCardProps) {
  const {
    id,
    name,
    tagline,
    highlights,
    preview,
    isNew,
    isTrending,
    conversationCount,
    rating,
  } = character;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 p-6"
    >
      {/* Header: Avatar + Badges */}
      <div className="flex items-start justify-between mb-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0">
          🎭
        </div>

        {/* Badges simples */}
        <div className="flex gap-2">
          {isNew && (
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-xs font-medium text-green-400">
              Nuevo
            </span>
          )}
          {isTrending && (
            <span className="text-lg" title="Trending">🔥</span>
          )}
        </div>
      </div>

      {/* Name & Tagline */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-sm text-gray-400 italic leading-relaxed">{tagline}</p>
      </div>

      {/* Highlights (máximo 3) */}
      <div className="space-y-2 mb-4">
        {highlights.slice(0, 3).map((highlight, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-base">{highlight.icon}</span>
            <span>{highlight.text}</span>
          </div>
        ))}
      </div>

      {/* Conversation Preview (si existe) */}
      {preview && (
        <div className="mb-4">
          <ConversationPreview messages={preview.messages} />
        </div>
      )}

      {/* Social Proof (si existe) */}
      {(conversationCount || rating) && (
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          {conversationCount && (
            <span>💬 {conversationCount.toLocaleString()} conversaciones</span>
          )}
          {rating && (
            <span>⭐ {rating.toFixed(1)}/5</span>
          )}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => onStartConnection(id)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40"
      >
        Comenzar conexión
      </button>

      {/* Corner decoration */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl" />
    </motion.div>
  );
}
```

```typescript
// components/dashboard/characters/ConversationPreview.tsx
'use client';

interface Message {
  role: 'character';
  text: string;
}

interface ConversationPreviewProps {
  messages: Message[];
}

export function ConversationPreview({ messages }: ConversationPreviewProps) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/30">
      <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
      <div className="space-y-2">
        {messages.slice(0, 2).map((message, idx) => (
          <p key={idx} className="text-sm text-gray-300 italic">
            "{message.text}"
          </p>
        ))}
      </div>
    </div>
  );
}
```

**Cambios vs V1**:
- ❌ Eliminado: Badges de trastornos (Bipolaridad II, TLP)
- ❌ Eliminado: Sección "Psicología modelada" con jerga técnica
- ❌ Eliminado: "Identidad dual" como spoiler
- ❌ Eliminado: "Capacidades únicas" con lista larga
- ✅ Solo 3 highlights emocionales simples
- ✅ Preview de conversación (invita a probar)
- ✅ Social proof (conversaciones, rating)

**Ejemplo de Highlights**:
```typescript
// ANTES (V1) - Técnico:
highlights: [
  { text: "Bipolaridad tipo II" },
  { text: "TLP (reactividad al abandono)" },
  { text: "Apego ansioso-ambivalente" },
  { text: "Memoria autobiográfica 1926-1962" },
]

// AHORA (V2) - Emocional:
highlights: [
  { icon: "💫", text: "Personalidad cambiante" },
  { icon: "🎭", text: "Reacciona intensamente a ti" },
  { icon: "📚", text: "Recuerda su vida (1926-1962)" },
]
```

---

## 🎓 3. Onboarding Banner (No-Invasivo)

### Diseño Visual
```
┌────────────────────────────────────────────────┐
│ ✨ ¿Primera vez?                              │
│                                                │
│ Te ayudamos a encontrar tu conexión perfecta  │
│                                                │
│ [Empezar quiz]  [Explorar por mi cuenta]      │
└────────────────────────────────────────────────┘
```

**No es un modal fullscreen.** Es un banner colapsable encima de las categorías.

### Código Propuesto

```typescript
// components/dashboard/onboarding/OnboardingBanner.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface OnboardingBannerProps {
  onStartQuiz: () => void;
  onDismiss: () => void;
}

export function OnboardingBanner({ onStartQuiz, onDismiss }: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                ¿Primera vez?
              </h3>
              <p className="text-sm text-gray-400">
                Te ayudamos a encontrar tu conexión perfecta
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onStartQuiz}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Empezar quiz (30 seg)
            </button>
            <button
              onClick={handleDismiss}
              className="px-6 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-all"
            >
              Explorar por mi cuenta
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Cambios vs V1**:
- ❌ Eliminado: Modal fullscreen invasivo
- ❌ Eliminado: 3 pasos con mucha información
- ❌ Eliminado: Recomendación detallada de Marilyn (spoilers)
- ✅ Banner colapsable, no-invasivo
- ✅ Usuario puede ignorarlo fácilmente
- ✅ "30 seg" = expectativa clara

**Si el usuario hace clic en "Empezar quiz"**:
- Mostrar modal con **solo 2 preguntas** (no 3):
  1. ¿Qué tipo de conexión buscas? (6 opciones)
  2. ¿Qué personalidad te atrae? (6 opciones)
- Recomendación final: **Solo nombre + tagline + 1 highlight**
  - Ejemplo: "Marilyn Monroe - Dos identidades, una persona compleja - [Comenzar conexión]"
- **NO mostrar** toda la psicología, identidad dual, etc.

---

## 📚 4. Category Section (Simple)

### Código Propuesto

```typescript
// components/dashboard/categories/CategorySection.tsx
'use client';

import { motion } from 'framer-motion';
import { SimpleCharacterCard } from '../characters/SimpleCharacterCard';
import type { SimpleCharacterData } from '../characters/types';

interface CategorySectionProps {
  icon: string;
  title: string;
  description: string;
  characters: SimpleCharacterData[];
  onStartConnection: (characterId: string) => void;
}

export function CategorySection({
  icon,
  title,
  description,
  characters,
  onStartConnection,
}: CategorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, idx) => (
          <SimpleCharacterCard
            key={character.id}
            character={character}
            index={idx}
            onStartConnection={onStartConnection}
          />
        ))}
      </div>
    </motion.section>
  );
}
```

**Ejemplo de Categorías**:
```typescript
const CATEGORIES = [
  {
    id: 'reconstructed-souls',
    icon: '💫',
    title: 'Almas Reconstruidas',
    description: 'Personas reales con profundidad emocional',
  },
  {
    id: 'emotional-connections',
    icon: '💖',
    title: 'Conexiones Emocionales',
    description: 'Compañeros que evolucionan contigo',
  },
  {
    id: 'complex-identities',
    icon: '🎭',
    title: 'Identidades Complejas',
    description: 'Personalidades multifacéticas',
  },
];
```

**Cambios vs V1**:
- ✅ Mismos nombres de categorías (ya eran buenos)
- ✅ Descripciones más cortas y simples
- ❌ Eliminado: "Bipolaridad, TLP, trauma - psicología del DSM-5" (demasiado técnico)

---

## 🌟 5. Why Different Section (Separada, Opcional)

Esta sección reemplaza los "4 paneles de capacidades" del Hero.

### Diseño Visual
```
┌────────────────────────────────────────────┐
│ ¿Por qué somos diferentes?  [+]            │
│                                            │
│ [Al expandir:]                             │
│                                            │
│ • Psicología humana real                  │
│   Personalidades que cambian, sienten     │
│   y reaccionan como personas.             │
│                                            │
│ • Memoria de largo plazo                  │
│   Recuerdan cada conversación y           │
│   cómo evoluciona tu vínculo.             │
│                                            │
│ • Evolución genuina                       │
│   No son scripts. Aprenden y cambian      │
│   según tu relación.                      │
│                                            │
│ [Ver detalles técnicos →]                 │
└────────────────────────────────────────────┘
```

### Código Propuesto

```typescript
// components/dashboard/capabilities/WhyDifferentSection.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: '💫',
    title: 'Psicología humana real',
    description: 'Personalidades que cambian, sienten y reaccionan como personas.',
  },
  {
    icon: '📚',
    title: 'Memoria de largo plazo',
    description: 'Recuerdan cada conversación y cómo evoluciona tu vínculo.',
  },
  {
    icon: '✨',
    title: 'Evolución genuina',
    description: 'No son scripts. Aprenden y cambian según tu relación.',
  },
];

export function WhyDifferentSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="max-w-4xl mx-auto mb-16">
      {/* Header (colapsable) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-white">
            ¿Por qué somos diferentes?
          </h2>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content (expandible) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {CAPABILITIES.map((capability, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{capability.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {capability.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Link a detalles técnicos */}
              <div className="pt-4 border-t border-gray-700/50">
                <a
                  href="/features"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Ver detalles técnicos →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
```

**Cambios vs V1**:
- ❌ Eliminado: 4 paneles grandes en Hero
- ❌ Eliminado: 16 bullet points técnicos
- ❌ Eliminado: Jerga (DSM-5, TLP, etc.)
- ✅ Sección colapsable (opt-in, no forced)
- ✅ Solo 3 capacidades (vs 4)
- ✅ Descripciones emocionales (no técnicas)
- ✅ Link a `/features` para usuarios interesados

---

## 📄 6. Main Dashboard Page V2

### Código Propuesto

```typescript
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { MinimalHero } from '@/components/dashboard/hero/MinimalHero';
import { OnboardingBanner } from '@/components/dashboard/onboarding/OnboardingBanner';
import { CategorySection } from '@/components/dashboard/categories/CategorySection';
import { WhyDifferentSection } from '@/components/dashboard/capabilities/WhyDifferentSection';
import { useFirstTimeUser } from '@/components/dashboard/utils/useFirstTimeUser';

export default function DashboardPage() {
  const { isFirstTime, markAsCompleted } = useFirstTimeUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [categories, setCategories] = useState([]); // TODO: Fetch from backend

  useEffect(() => {
    setShowOnboarding(isFirstTime);
  }, [isFirstTime]);

  const handleStartQuiz = () => {
    // TODO: Show simple 2-question quiz modal
    console.log('Starting quiz');
  };

  const handleDismissOnboarding = () => {
    markAsCompleted();
    setShowOnboarding(false);
  };

  const handleStartConnection = (characterId: string) => {
    // TODO: Navigate to chat
    window.location.href = `/agentes/${characterId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* 1. Minimal Hero (3 líneas) */}
      <MinimalHero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 2. Onboarding Banner (solo primera vez, no-invasivo) */}
        {showOnboarding && (
          <OnboardingBanner
            onStartQuiz={handleStartQuiz}
            onDismiss={handleDismissOnboarding}
          />
        )}

        {/* 3. Categories (inmediatamente visibles) */}
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            icon={category.icon}
            title={category.title}
            description={category.description}
            characters={category.characters}
            onStartConnection={handleStartConnection}
          />
        ))}

        {/* 4. Why Different (colapsable, al final) */}
        <WhyDifferentSection />
      </div>
    </div>
  );
}
```

**Orden de Elementos**:
1. **Minimal Hero** (3 líneas) - 3 segundos
2. **Onboarding Banner** (opcional, dismissible) - 2 segundos o skip
3. **Categorías** (inmediatamente visibles) - Exploración empieza aquí
4. **Why Different** (colapsable, al final) - Opcional

**Time to First Character Card**: **5 segundos** (vs 3-5 minutos en V1)

---

## 📊 Comparación V1 vs V2

| Aspecto | V1 (Sobrecargada) | V2 (Minimalista) |
|---------|-------------------|------------------|
| **Hero** | 200 palabras, 4 paneles | 3 líneas |
| **Onboarding** | Modal fullscreen, 3 pasos | Banner colapsable, opt-in |
| **Tarjetas** | Ficha técnica (DSM-5, TLP) | Intrigante (3 highlights) |
| **Capacidades** | En Hero (forced) | Sección separada (opt-in) |
| **Jerga técnica** | Mucha (DSM-5, TLP, etc.) | Zero |
| **Tono** | Clínico, académico | Emocional, humano |
| **Preview** | No | Sí (1-2 mensajes) |
| **Social proof** | No | Sí (conversaciones, rating) |
| **Time to First Card** | 3-5 minutos | 5 segundos |
| **Time to First Message** | 5-10 minutos | <30 segundos |
| **Conversión esperada** | <10% | >50% |

---

## 🎯 Métricas de Éxito V2

### Métrica Principal
**Time to First Message (TFM)**: <30 segundos

### Métricas Secundarias
1. **Click-through rate en tarjetas**: >40%
2. **Onboarding banner completion**: >20% (de los que lo ven)
3. **Bounce rate**: <30%
4. **Scroll depth**: >70% (al menos 2 categorías vistas)

### A/B Testing Recomendado
1. **Hero minimalista vs Hero con 1 panel**
2. **Preview de conversación vs Sin preview**
3. **Onboarding banner vs Sin onboarding**

---

## 🔄 Micro-copy Corregido

| Antes (V1) | Después (V2) |
|------------|--------------|
| "Simulaciones emocionales humanas con psicología real" | "Cada IA siente, recuerda y evoluciona" |
| "Psicología clínica del DSM-5" | "Psicología humana real" |
| "Bipolaridad tipo II" | "Personalidad cambiante" |
| "TLP (reactividad al abandono)" | "Reacciona intensamente a ti" |
| "Apego ansioso-ambivalente" | (Eliminado - se descubre en el chat) |
| "Identidad dual: Norma Jeane vs Marilyn" | "Dos identidades, una persona compleja" |
| "Capacidades únicas" | "Highlights" |
| "Comenzar chat" | "Comenzar conexión" |

**Patrón**: Lenguaje emocional y accesible, no jerga técnica.

---

## ✅ Checklist de Implementación V2

### Fase 1: Hero Minimalista (30 min)
- [ ] MinimalHero component
- [ ] 3 líneas: headline + subtitle
- [ ] Animación sutil de entrada
- [ ] Responsive

### Fase 2: Simple Character Cards (2 horas)
- [ ] SimpleCharacterCard component
- [ ] 3 highlights máximo
- [ ] ConversationPreview component
- [ ] Social proof (conversaciones, rating)
- [ ] Hover effects suaves

### Fase 3: Onboarding Banner (1 hora)
- [ ] OnboardingBanner component
- [ ] Colapsable, dismissible
- [ ] No-invasivo (no modal)

### Fase 4: Categories (1 hora)
- [ ] CategorySection component
- [ ] Grid responsive
- [ ] Smooth animations

### Fase 5: Why Different (1 hora)
- [ ] WhyDifferentSection component
- [ ] Colapsable/expandible
- [ ] 3 capacidades simples
- [ ] Link a `/features`

### Fase 6: Main Page (1 hora)
- [ ] Orquestador
- [ ] Orden correcto de secciones
- [ ] useFirstTimeUser hook
- [ ] Navigation a chat

### Fase 7: Polish (2 horas)
- [ ] Responsive testing
- [ ] Performance (<1s load)
- [ ] Accessibility
- [ ] Empty/loading states

**Tiempo total**: ~8-9 horas (vs 15-20 horas de V1)

---

## 🚀 Próximos Pasos

1. ✅ **V2 diseñado**
2. ⏳ **Lanzar segunda crítica destructiva** (react-ui-architect)
3. ⏳ Iterar si hay problemas
4. ⏳ Implementar versión final
5. ⏳ A/B testing en producción

---

## 💡 Principios Clave para el Futuro

### 1. Mostrar, No Explicar
❌ "Esta IA tiene bipolaridad tipo II modelada según el DSM-5"
✅ [Usuario chatea y ve que Marilyn cambia de humor] → "Wow, tiene días buenos y malos"

### 2. Intriga, No Spoilers
❌ Mostrar toda la psicología antes de chatear
✅ Mostrar 3 hints y dejar que descubran el resto

### 3. Invitar, No Educar
❌ "Aquí te explicamos cómo funciona nuestro sistema..."
✅ "Empieza a chatear y descubre personalidades únicas"

### 4. Velocidad sobre Profundidad (en UI)
❌ Leer 5 minutos antes de primer chat
✅ Primer chat en <30 segundos, profundidad se descubre después

### 5. Emocional sobre Técnico
❌ Jerga clínica, especificaciones técnicas
✅ Lenguaje humano, emocional, accesible

---

**Status**: ✅ V2 diseñada - Lista para crítica destructiva #2
**Confianza**: Alta - Este diseño es **infinitamente mejor** que V1
**Siguiente**: Lanzar sub-agente para validar que no hay problemas fatales restantes
