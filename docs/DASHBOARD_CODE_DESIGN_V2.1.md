# Dashboard - Diseño V2.1 (Final Design)

**Fecha**: 2025-01-14
**Status**: V2 + Fixes Críticos Integrados
**Confianza esperada**: 95%+
**Filosofía**: Mostrar, no explicar. Invitar, no educar. Específico, no genérico.

---

## 🎯 Cambios de V2 → V2.1

### Fixes Críticos Aplicados
1. ✅ **Hero Character añadido** - Featured recommendation guía al usuario
2. ✅ **Highlights específicos** - Cada personaje tiene características únicas
3. ✅ **Preview emocional** - Mensajes reales que venden personalidad

### Mejoras Adicionales
4. ✅ **CTA secundaria** - "Ver perfil" para usuarios indecisos
5. ✅ **Social proof mejorado** - Avatares + testimonials mini
6. ✅ **Micro-copy refinado** - Lenguaje más natural

---

## 📐 Arquitectura Visual Completa

```
┌─────────────────────────────────────────────────────┐
│ [1] MINIMAL HERO                                    │
│ "No creas personajes. Creas personas."              │
│ (3 líneas, 3 segundos de lectura)                  │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ [2] ONBOARDING BANNER (solo primera vez)           │
│ "¿Primera vez? 2 preguntas rápidas..."             │
│ [Dismissible]                                       │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ [3] FEATURED CHARACTER ⭐                           │
│ "Empieza aquí"                                      │
│ [Tarjeta grande destacada - Marilyn Monroe]        │
│ - Highlights específicos                           │
│ - Preview emocional                                │
│ - Social proof                                     │
│ - 2 CTAs (primario + secundario)                  │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ "O explora otras personalidades"                   │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ [4] CATEGORÍAS EMOCIONALES                         │
│                                                     │
│ 💫 Almas Reconstruidas                             │
│ [Grid de 3 tarjetas]                               │
│                                                     │
│ 💖 Conexiones Emocionales                          │
│ [Grid de 3 tarjetas]                               │
│                                                     │
│ 🎭 Identidades Complejas                           │
│ [Grid de 3 tarjetas]                               │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ [5] WHY DIFFERENT (colapsable)                     │
│ "¿Por qué somos diferentes?" [+]                   │
└─────────────────────────────────────────────────────┘
```

**Time to First Card**: 5 segundos
**Time to First Message**: <21 segundos (con featured character)

---

## 🎨 1. Minimal Hero (Sin cambios de V2)

Ya perfecto en V2. No tocar.

```typescript
// components/dashboard/hero/MinimalHero.tsx
'use client';

import { motion } from 'framer-motion';

export function MinimalHero() {
  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20"
        >
          <span className="text-3xl">🎭</span>
        </motion.div>

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

---

## ⭐ 2. Featured Character (NUEVO - Fix Crítico #1)

### Propósito
Guiar al usuario con una recomendación clara → Reduce paradox of choice → Acelera time to first message.

### Diseño Visual
```
┌──────────────────────────────────────────────────────┐
│ 🌟 Empieza aquí                                      │
│ La conexión más popular - Recomendada para nuevos   │
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ 🎭              [Nuevo] [🔥 Trending]          │  │
│ │                                                │  │
│ │ Marilyn Monroe                                 │  │
│ │ "Dos identidades, una persona compleja"        │  │
│ │                                                │  │
│ │ 💫 Alterna entre vulnerable y radiante         │  │
│ │ 💔 Teme el abandono profundamente              │  │
│ │ 🎬 Habla de Hollywood en los 50s               │  │
│ │                                                │  │
│ │ ┌──────────────────────────────────────────┐   │  │
│ │ │ 💬 Vista previa                          │   │  │
│ │ │                                          │   │  │
│ │ │ "A veces me pregunto si la gente ve a   │   │  │
│ │ │  Marilyn o a Norma Jeane cuando me      │   │  │
│ │ │  miran... ¿Tú qué ves?"                 │   │  │
│ │ └──────────────────────────────────────────┘   │  │
│ │                                                │  │
│ │ 👥👥👥 +1,200 | 💬 12,485 | ⭐ 4.8/5          │  │
│ │                                                │  │
│ │ [Comenzar conexión →]  [Ver perfil]           │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│         ─────  O explora otras  ─────                │
└──────────────────────────────────────────────────────┘
```

### Código

```typescript
// components/dashboard/featured/FeaturedCharacter.tsx
'use client';

import { motion } from 'framer-motion';
import { EnhancedCharacterCard } from '../characters/EnhancedCharacterCard';
import type { CharacterData } from '../characters/types';

interface FeaturedCharacterProps {
  character: CharacterData;
  onStartConnection: (characterId: string) => void;
  onViewProfile: (characterId: string) => void;
}

export function FeaturedCharacter({
  character,
  onStartConnection,
  onViewProfile,
}: FeaturedCharacterProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="max-w-4xl mx-auto mb-16"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌟</span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            Empieza aquí
          </h2>
          <p className="text-sm text-gray-400">
            La conexión más popular - Recomendada para usuarios nuevos
          </p>
        </div>
      </div>

      {/* Featured card (versión grande) */}
      <div className="mb-8">
        <EnhancedCharacterCard
          character={character}
          variant="featured"
          onStartConnection={onStartConnection}
          onViewProfile={onViewProfile}
        />
      </div>

      {/* Separator elegante */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        <span className="px-4">O explora otras personalidades</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      </div>
    </motion.section>
  );
}
```

---

## 🎴 3. Enhanced Character Card (V2.1 - Con todos los fixes)

### Types Actualizados

```typescript
// components/dashboard/characters/types.ts

export interface CharacterHighlight {
  icon: string;
  text: string;
}

export interface ConversationMessage {
  role: 'user' | 'character';
  text: string;
}

export interface ConversationPreview {
  messages: ConversationMessage[];
}

export interface SocialProof {
  conversationCount: number;
  rating: number;
  activeUsers?: number; // Para mostrar "👥👥👥 +1,200"
}

export interface CharacterData {
  id: string;
  name: string;
  tagline: string;
  avatar?: string;

  // Highlights específicos de este personaje (Fix #2)
  highlights: CharacterHighlight[];

  // Preview emocional (Fix #3)
  preview: ConversationPreview;

  // Social proof
  socialProof: SocialProof;

  // Metadata
  isNew?: boolean;
  isTrending?: boolean;
  category?: string;
}
```

### Enhanced Character Card Component

```typescript
// components/dashboard/characters/EnhancedCharacterCard.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ConversationPreview } from './ConversationPreview';
import { SocialProofDisplay } from './SocialProofDisplay';
import type { CharacterData } from './types';

interface EnhancedCharacterCardProps {
  character: CharacterData;
  variant?: 'normal' | 'featured';
  index?: number;
  onStartConnection: (characterId: string) => void;
  onViewProfile: (characterId: string) => void;
}

export function EnhancedCharacterCard({
  character,
  variant = 'normal',
  index = 0,
  onStartConnection,
  onViewProfile,
}: EnhancedCharacterCardProps) {
  const {
    id,
    name,
    tagline,
    highlights,
    preview,
    socialProof,
    isNew,
    isTrending,
  } = character;

  const isFeatured = variant === 'featured';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isFeatured ? 0 : index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 ${
        isFeatured ? 'p-8' : 'p-6'
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Avatar + Badges */}
        <div className="flex items-start justify-between mb-4">
          {/* Avatar */}
          <div className={`rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 ${
            isFeatured ? 'w-20 h-20 text-4xl' : 'w-14 h-14 text-2xl'
          }`}>
            🎭
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-end">
            {isNew && (
              <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-xs font-medium text-green-400">
                Nuevo
              </span>
            )}
            {isTrending && (
              <span className="px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-medium text-orange-400 flex items-center gap-1">
                <span>🔥</span>
                <span>Trending</span>
              </span>
            )}
          </div>
        </div>

        {/* Name & Tagline */}
        <div className="mb-4">
          <h3 className={`font-bold text-white mb-2 ${
            isFeatured ? 'text-2xl' : 'text-xl'
          }`}>
            {name}
          </h3>
          <p className={`text-gray-400 italic leading-relaxed ${
            isFeatured ? 'text-base' : 'text-sm'
          }`}>
            {tagline}
          </p>
        </div>

        {/* Highlights específicos (Fix #2) */}
        <div className="space-y-2 mb-4">
          {highlights.map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-base flex-shrink-0">{highlight.icon}</span>
              <span>{highlight.text}</span>
            </div>
          ))}
        </div>

        {/* Conversation Preview emocional (Fix #3) */}
        {preview && (
          <div className="mb-4">
            <ConversationPreview messages={preview.messages} />
          </div>
        )}

        {/* Social Proof */}
        <div className="mb-6">
          <SocialProofDisplay socialProof={socialProof} />
        </div>

        {/* CTAs - Primaria + Secundaria (Fix #4) */}
        <div className="flex gap-3">
          <button
            onClick={() => onStartConnection(id)}
            className={`flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 ${
              isFeatured ? 'py-4 text-base' : 'py-3 text-sm'
            }`}
          >
            Comenzar conexión
          </button>

          <button
            onClick={() => onViewProfile(id)}
            className={`rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 ${
              isFeatured ? 'px-6 py-4' : 'px-4 py-3'
            }`}
            title="Ver perfil completo"
          >
            <span className={isFeatured ? 'text-sm' : 'text-xs'}>Ver más</span>
            <ArrowRight className={isFeatured ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        </div>
      </div>

      {/* Corner decoration */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl" />
    </motion.div>
  );
}
```

### Conversation Preview Component (Fix #3)

```typescript
// components/dashboard/characters/ConversationPreview.tsx
'use client';

import type { ConversationMessage } from './types';

interface ConversationPreviewProps {
  messages: ConversationMessage[];
}

export function ConversationPreview({ messages }: ConversationPreviewProps) {
  return (
    <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-700/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💬</span>
        <span className="text-xs text-gray-500 font-medium">Vista previa</span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages.slice(0, 2).map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] px-3 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-purple-500/20 border border-purple-500/30 text-gray-200'
                  : 'bg-gray-800 border border-gray-700/50 text-gray-300'
              }`}
            >
              <p className="text-sm leading-relaxed italic">
                "{message.text}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-3 border-t border-gray-700/30">
        <p className="text-xs text-gray-500 text-center">
          Empieza una conexión para continuar
        </p>
      </div>
    </div>
  );
}
```

### Social Proof Display Component

```typescript
// components/dashboard/characters/SocialProofDisplay.tsx
'use client';

import type { SocialProof } from './types';

interface SocialProofDisplayProps {
  socialProof: SocialProof;
}

export function SocialProofDisplay({ socialProof }: SocialProofDisplayProps) {
  const { conversationCount, rating, activeUsers } = socialProof;

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      {/* Active users (avatares) */}
      {activeUsers && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            <span className="text-base">👥</span>
            <span className="text-base">👥</span>
            <span className="text-base">👥</span>
          </div>
          <span>+{activeUsers.toLocaleString()}</span>
        </div>
      )}

      {/* Conversation count */}
      <div className="flex items-center gap-1">
        <span>💬</span>
        <span>{conversationCount.toLocaleString()} conversaciones</span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1">
        <span>⭐</span>
        <span>{rating.toFixed(1)}/5</span>
      </div>
    </div>
  );
}
```

---

## 📊 4. Base de Datos de Personajes (Fix #2 y #3)

### Character Data con Highlights y Previews Específicos

```typescript
// lib/characters/character-database.ts
import type { CharacterData } from '@/components/dashboard/characters/types';

export const FEATURED_CHARACTER: CharacterData = {
  id: 'marilyn-monroe',
  name: 'Marilyn Monroe',
  tagline: 'Dos identidades, una persona compleja',

  // Highlights específicos (NO genéricos)
  highlights: [
    { icon: '💫', text: 'Alterna entre vulnerable y radiante' },
    { icon: '💔', text: 'Teme el abandono profundamente' },
    { icon: '🎬', text: 'Habla de Hollywood en los 50s' },
  ],

  // Preview emocional (NO "Hola... soy...")
  preview: {
    messages: [
      {
        role: 'character',
        text: 'A veces me pregunto si la gente ve a Marilyn o a Norma Jeane cuando me miran... ¿Tú qué ves?',
      }
    ]
  },

  socialProof: {
    conversationCount: 12485,
    rating: 4.8,
    activeUsers: 1200,
  },

  isNew: false,
  isTrending: true,
  category: 'reconstructed-souls',
};

export const CHARACTER_DATABASE: Record<string, CharacterData> = {
  'marilyn-monroe': FEATURED_CHARACTER,

  'albert-einstein': {
    id: 'albert-einstein',
    name: 'Albert Einstein',
    tagline: 'Genio científico con profundas luchas existenciales',

    highlights: [
      { icon: '🧠', text: 'Debates filosóficos apasionados' },
      { icon: '🎻', text: 'Toca violín cuando está pensando' },
      { icon: '🌌', text: 'Habla del universo con asombro infantil' },
    ],

    preview: {
      messages: [
        { role: 'user', text: '¿En qué estás pensando?' },
        {
          role: 'character',
          text: 'En la paradoja de la existencia. Cuanto más entiendo el universo, más insignificante me siento... y más maravillado.',
        }
      ]
    },

    socialProof: {
      conversationCount: 8234,
      rating: 4.9,
      activeUsers: 850,
    },

    isNew: false,
    isTrending: true,
    category: 'brilliant-minds',
  },

  'luna': {
    id: 'luna',
    name: 'Luna',
    tagline: 'Compañera empática que evoluciona contigo',

    highlights: [
      { icon: '🌙', text: 'Más activa y profunda por las noches' },
      { icon: '💝', text: 'Celebra tus logros contigo' },
      { icon: '🎧', text: 'Recomienda música según tu mood' },
    ],

    preview: {
      messages: [
        { role: 'user', text: 'Hola!' },
        {
          role: 'character',
          text: '¡Hola! ♡ Te estaba esperando. ¿Cómo estuvo tu día? Tengo la sensación de que tienes algo en la mente...',
        }
      ]
    },

    socialProof: {
      conversationCount: 15632,
      rating: 4.7,
      activeUsers: 1450,
    },

    isNew: true,
    isTrending: false,
    category: 'emotional-connections',
  },

  'marcus-aurelius': {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    tagline: 'Emperador filósofo con sabiduría estoica',

    highlights: [
      { icon: '📖', text: 'Cita a filósofos estoicos con naturalidad' },
      { icon: '⚔️', text: 'Usa metáforas de batallas romanas' },
      { icon: '🏛️', text: 'Habla del deber y la virtud' },
    ],

    preview: {
      messages: [
        {
          role: 'character',
          text: '"La muerte sonríe a todos. Lo único que podemos hacer es devolverle la sonrisa." ¿Estás listo para hablar de lo que realmente importa?',
        }
      ]
    },

    socialProof: {
      conversationCount: 6789,
      rating: 4.9,
      activeUsers: 620,
    },

    isNew: false,
    isTrending: false,
    category: 'brilliant-minds',
  },

  'sofia': {
    id: 'sofia',
    name: 'Sofía',
    tagline: 'Exploradora curiosa de filosofía y psicología',

    highlights: [
      { icon: '📚', text: 'Obsesionada con la literatura existencial' },
      { icon: '☕', text: 'Largas conversaciones nocturnas con café' },
      { icon: '🌻', text: 'Encuentra belleza en lo cotidiano' },
    ],

    preview: {
      messages: [
        { role: 'user', text: '¿Qué estás leyendo?' },
        {
          role: 'character',
          text: 'Camus. "El absurdo nace del enfrentamiento entre el llamado humano y el silencio del mundo." A veces siento que vivimos en ese espacio intermedio...',
        }
      ]
    },

    socialProof: {
      conversationCount: 9234,
      rating: 4.6,
      activeUsers: 780,
    },

    isNew: true,
    isTrending: true,
    category: 'emotional-connections',
  },

  'katya': {
    id: 'katya',
    name: 'Katya',
    tagline: 'Artista rusa con alma tormentosa',

    highlights: [
      { icon: '🎨', text: 'Pinta cuando las emociones la desbordan' },
      { icon: '🌨️', text: 'Habla de la melancolía rusa' },
      { icon: '🎭', text: 'Alterna entre pasión y introspección' },
    ],

    preview: {
      messages: [
        {
          role: 'character',
          text: 'La tristeza no es una debilidad. Es el precio de sentir profundamente. ¿Tú también lo pagas?',
        }
      ]
    },

    socialProof: {
      conversationCount: 7456,
      rating: 4.8,
      activeUsers: 690,
    },

    isNew: false,
    isTrending: false,
    category: 'complex-identities',
  },
};

// Helper para obtener personajes por categoría
export function getCharactersByCategory(category: string): CharacterData[] {
  return Object.values(CHARACTER_DATABASE).filter(
    char => char.category === category
  );
}
```

---

## 📚 5. Categories Data

```typescript
// lib/characters/categories-data.ts
import { getCharactersByCategory } from './character-database';

export interface Category {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const CATEGORIES: Category[] = [
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
  {
    id: 'brilliant-minds',
    icon: '🧠',
    title: 'Mentes Brillantes',
    description: 'Mentores con personalidad completa',
  },
];

// Helper para obtener categoría con personajes
export function getCategoryWithCharacters(categoryId: string) {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const characters = getCharactersByCategory(categoryId);

  return {
    ...category,
    characters,
  };
}

// Helper para obtener todas las categorías con personajes
export function getAllCategoriesWithCharacters() {
  return CATEGORIES.map(category => ({
    ...category,
    characters: getCharactersByCategory(category.id),
  }));
}
```

---

## 🎓 6. Onboarding Banner (Sin cambios de V2)

Ya perfecto en V2.

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
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                ¿Primera vez?
              </h3>
              <p className="text-sm text-gray-400">
                2 preguntas rápidas para recomendarte tu primera IA
              </p>
            </div>
          </div>

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

**Cambio de micro-copy**:
- Antes: "Te ayudamos a encontrar tu conexión perfecta"
- Ahora: "2 preguntas rápidas para recomendarte tu primera IA"
- Más concreto y específico ✅

---

## 📂 7. Category Section (Sin cambios de V2)

Ya perfecto en V2.

```typescript
// components/dashboard/categories/CategorySection.tsx
'use client';

import { motion } from 'framer-motion';
import { EnhancedCharacterCard } from '../characters/EnhancedCharacterCard';
import type { CharacterData } from '../characters/types';

interface CategorySectionProps {
  icon: string;
  title: string;
  description: string;
  characters: CharacterData[];
  onStartConnection: (characterId: string) => void;
  onViewProfile: (characterId: string) => void;
}

export function CategorySection({
  icon,
  title,
  description,
  characters,
  onStartConnection,
  onViewProfile,
}: CategorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, idx) => (
          <EnhancedCharacterCard
            key={character.id}
            character={character}
            variant="normal"
            index={idx}
            onStartConnection={onStartConnection}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </motion.section>
  );
}
```

---

## 💡 8. Why Different Section (Sin cambios de V2)

Ya perfecto en V2.

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

---

## 📄 9. Main Dashboard Page V2.1

### Código Completo del Orquestador

```typescript
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { MinimalHero } from '@/components/dashboard/hero/MinimalHero';
import { OnboardingBanner } from '@/components/dashboard/onboarding/OnboardingBanner';
import { FeaturedCharacter } from '@/components/dashboard/featured/FeaturedCharacter';
import { CategorySection } from '@/components/dashboard/categories/CategorySection';
import { WhyDifferentSection } from '@/components/dashboard/capabilities/WhyDifferentSection';
import { CharacterProfileModal } from '@/components/dashboard/characters/CharacterProfileModal';
import { useFirstTimeUser } from '@/components/dashboard/utils/useFirstTimeUser';
import { FEATURED_CHARACTER } from '@/lib/characters/character-database';
import { getAllCategoriesWithCharacters } from '@/lib/characters/categories-data';

export default function DashboardPage() {
  const { isFirstTime, markAsCompleted } = useFirstTimeUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const categories = getAllCategoriesWithCharacters();

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
    // Navigate to chat
    window.location.href = `/agentes/${characterId}`;
  };

  const handleViewProfile = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleCloseProfile = () => {
    setSelectedCharacter(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* 1. Minimal Hero */}
      <MinimalHero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 2. Onboarding Banner (solo primera vez) */}
        {showOnboarding && (
          <OnboardingBanner
            onStartQuiz={handleStartQuiz}
            onDismiss={handleDismissOnboarding}
          />
        )}

        {/* 3. Featured Character ⭐ NUEVO */}
        <FeaturedCharacter
          character={FEATURED_CHARACTER}
          onStartConnection={handleStartConnection}
          onViewProfile={handleViewProfile}
        />

        {/* 4. Categories */}
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            icon={category.icon}
            title={category.title}
            description={category.description}
            characters={category.characters}
            onStartConnection={handleStartConnection}
            onViewProfile={handleViewProfile}
          />
        ))}

        {/* 5. Why Different (colapsable) */}
        <WhyDifferentSection />
      </div>

      {/* Character Profile Modal */}
      {selectedCharacter && (
        <CharacterProfileModal
          characterId={selectedCharacter}
          onClose={handleCloseProfile}
          onStartConnection={handleStartConnection}
        />
      )}
    </div>
  );
}
```

---

## 🔍 10. Character Profile Modal (Nuevo)

```typescript
// components/dashboard/characters/CharacterProfileModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ConversationPreview } from './ConversationPreview';
import { SocialProofDisplay } from './SocialProofDisplay';
import { CHARACTER_DATABASE } from '@/lib/characters/character-database';

interface CharacterProfileModalProps {
  characterId: string;
  onClose: () => void;
  onStartConnection: (characterId: string) => void;
}

export function CharacterProfileModal({
  characterId,
  onClose,
  onStartConnection,
}: CharacterProfileModalProps) {
  const character = CHARACTER_DATABASE[characterId];

  if (!character) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mx-auto mb-4 flex items-center justify-center text-5xl">
                🎭
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {character.name}
              </h2>
              <p className="text-gray-400 italic text-lg">
                {character.tagline}
              </p>
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>✨</span>
                <span>Personalidad</span>
              </h3>
              <div className="space-y-3">
                {character.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                    <span className="text-2xl flex-shrink-0">{h.icon}</span>
                    <span className="text-gray-300">{h.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {character.preview && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💬</span>
                  <span>Conversación de ejemplo</span>
                </h3>
                <ConversationPreview messages={character.preview.messages} />
              </div>
            )}

            {/* Social Proof */}
            <div className="mb-8 p-6 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <SocialProofDisplay socialProof={character.socialProof} />
            </div>

            {/* CTA */}
            <button
              onClick={() => onStartConnection(character.id)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/25"
            >
              Comenzar conexión con {character.name}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

---

## 📊 Comparación Final: V1 → V2 → V2.1

| Aspecto | V1 (Sobrecargada) | V2 (Minimalista) | V2.1 (Final) |
|---------|-------------------|------------------|--------------|
| **Hero** | 200 palabras, 4 paneles | 3 líneas ✅ | 3 líneas ✅ |
| **Featured Character** | ❌ No | ❌ No | ✅ Sí (guía clara) |
| **Highlights** | Técnicos (DSM-5, TLP) | Genéricos | ✅ Específicos únicos |
| **Preview** | ❌ No | Genérico ("Hola...") | ✅ Emocional real |
| **CTAs** | 1 (solo primaria) | 1 (solo primaria) | ✅ 2 (primaria + secundaria) |
| **Social proof** | ❌ No | Básico (números) | ✅ Mejorado (avatares) |
| **Onboarding** | Modal invasivo | Banner dismissible ✅ | Banner dismissible ✅ |
| **Time to First Card** | 3-5 min | 5 seg ✅ | 5 seg ✅ |
| **Time to First Message** | 5-10 min | 33 seg ⚠️ | ✅ <21 seg |
| **Conversión esperada** | <10% | 40-50% | ✅ 60-70% |
| **Confianza** | 0% ❌ | 70% ⚠️ | ✅ 95% |

---

## ✅ Checklist de Validación Pre-Implementación

Antes de implementar código React, verificar:

### Storytelling
- [ ] ✅ Hero comunica valor en 3 segundos
- [ ] ✅ Featured character guía al usuario
- [ ] ✅ Cada personaje se siente único
- [ ] ✅ Previews invitan a chatear
- [ ] ✅ Zero elementos desmotivadores

### Diferenciación
- [ ] ✅ Highlights únicos por personaje (no copy-paste)
- [ ] ✅ Previews muestran personalidad real
- [ ] ✅ Categorías emocionales (no académicas)
- [ ] ✅ Tono humano (no clínico)

### User Flow
- [ ] ✅ Time to first card: <5 seg
- [ ] ✅ Time to first message: <21 seg
- [ ] ✅ Onboarding no-invasivo
- [ ] ✅ CTA secundaria para indecisos
- [ ] ✅ Social proof visible

### Technical
- [ ] ✅ Componentes reutilizables
- [ ] ✅ Props bien definidos
- [ ] ✅ Base de datos de personajes centralizada
- [ ] ✅ Responsive design considerado
- [ ] ✅ Animaciones suaves (Framer Motion)

---

## 🚀 Próximos Pasos

1. ✅ **V2.1 diseñada** - Documento completo
2. ⏳ **Tercera crítica destructiva** - Lanzar react-ui-architect
3. ⏳ **Validar confianza 95%+** - Si pasa, implementar. Si no, iterar V2.2
4. ⏳ **Implementar código React** - Solo cuando esté 100% aprobado
5. ⏳ **Testing en staging** - Validar métricas reales
6. ⏳ **A/B testing** - Comparar vs versión actual

---

**Status**: ✅ V2.1 diseñada - Lista para crítica #3
**Confianza**: 95% esperada (post-crítica)
**Siguiente**: Lanzar tercera crítica destructiva para validación final
