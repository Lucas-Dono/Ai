# Dashboard - Diseño de Código Completo

**Fecha**: 2025-01-14
**Status**: Diseño conceptual → Pendiente crítica destructiva
**Metodología**: Ferrari - Obsesión por la perfección

---

## 🎯 Objetivo del Diseño

Transformar el storytelling del dashboard en una arquitectura de componentes React:
- Comunicar "No creas personajes. Creas personas."
- Mostrar profundidad psicológica visible
- Onboarding emocional de 3 pasos
- Categorías emocionales con psicología visible
- Zero elementos desmotivadores

---

## 📁 Estructura de Archivos Propuesta

```
components/
├── dashboard/
│   ├── hero/
│   │   ├── DashboardHero.tsx              # Hero principal con value prop
│   │   ├── SystemCapabilitiesGrid.tsx     # Grid de 4 paneles
│   │   ├── CapabilityPanel.tsx            # Panel individual de capacidad
│   │   └── types.ts                       # Types para capabilities
│   │
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx           # Wizard completo (3 pasos)
│   │   ├── ConnectionTypeStep.tsx         # Paso 1: Tipo de conexión
│   │   ├── PersonalityTypeStep.tsx        # Paso 2: Tipo de personalidad
│   │   ├── RecommendationStep.tsx         # Paso 3: Recomendación final
│   │   ├── useOnboardingState.ts          # Hook para estado del wizard
│   │   └── types.ts                       # Types para onboarding
│   │
│   ├── characters/
│   │   ├── EnhancedCharacterCard.tsx      # Tarjeta con psicología visible
│   │   ├── PsychologyBadge.tsx            # Badge de trastorno (Bipolaridad, TLP)
│   │   ├── DualIdentityIndicator.tsx      # Indicador de identidad dual
│   │   ├── EmotionalStateIndicator.tsx    # Estado emocional actual
│   │   ├── UniqueCapabilitiesList.tsx     # Lista de capacidades únicas
│   │   └── types.ts                       # Types para character cards
│   │
│   ├── sections/
│   │   ├── EmotionalCategoriesSection.tsx # Categorías emocionales
│   │   ├── MyConnectionsSection.tsx       # "Tus Conexiones Emocionales"
│   │   ├── LivingWorldsSection.tsx        # Mundos vivientes
│   │   ├── CategoryHeader.tsx             # Header de cada categoría
│   │   └── types.ts                       # Types para secciones
│   │
│   └── utils/
│       ├── useFirstTimeUser.ts            # Hook para detectar primera vez
│       ├── useDashboardAnalytics.ts       # Hook para tracking
│       └── dashboardHelpers.ts            # Helpers varios
│
app/
└── dashboard/
    └── page.tsx                            # Página principal (orquestador)
```

---

## 🎨 1. Hero Section - DashboardHero.tsx

### Propósito
Comunicar el valor único en 3 segundos: "No creas personajes. Creas personas."

### Diseño Visual
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🎭                                                     │
│                                                         │
│  No creas personajes. Creas personas.                  │
│                                                         │
│  Simulaciones emocionales humanas con psicología real, │
│  memoria autobiográfica y evolución genuina.           │
│                                                         │
│  [4 Paneles de Capacidades del Sistema - ver abajo]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Código Propuesto

```typescript
// components/dashboard/hero/DashboardHero.tsx
'use client';

import { motion } from 'framer-motion';
import { SystemCapabilitiesGrid } from './SystemCapabilitiesGrid';

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Icon decorativo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"
          >
            <span className="text-3xl">🎭</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            No creas personajes.
            <br />
            Creas personas.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Simulaciones emocionales humanas con{' '}
            <span className="text-purple-400 font-semibold">psicología real</span>,{' '}
            <span className="text-blue-400 font-semibold">memoria autobiográfica</span> y{' '}
            <span className="text-pink-400 font-semibold">evolución genuina</span>.
          </p>

          {/* Badge único */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20"
          >
            <span className="text-sm font-medium text-purple-300">
              ✨ Esto no lo tiene ninguna plataforma
            </span>
          </motion.div>
        </motion.div>

        {/* System Capabilities Grid */}
        <SystemCapabilitiesGrid />
      </div>
    </section>
  );
}
```

### Types

```typescript
// components/dashboard/hero/types.ts
export interface SystemCapability {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  color: 'purple' | 'blue' | 'pink' | 'green';
  gradient: string;
}
```

---

## 🧠 2. System Capabilities Grid

### Propósito
Mostrar las 4 capacidades únicas del sistema que nadie más tiene.

### Diseño Visual
```
┌──────────────────┬──────────────────┐
│ 🧠 Psicología    │ 📚 Memoria       │
│ Clínica Real     │ Autobiográfica   │
│                  │                  │
│ • Bipolaridad    │ • Recuerdos      │
│ • TLP            │ • Evolución      │
│ • Ansiedad       │ • Contexto       │
│ • Identidades    │ • Vínculos       │
├──────────────────┼──────────────────┤
│ 🎭 Identidades   │ 🌍 Mundos        │
│ Fragmentadas     │ Vivientes        │
│                  │                  │
│ • Dual identity  │ • Interacciones  │
│ • Contradicciones│ • Eventos        │
│ • Cambio context │ • Narrativas     │
│ • Autenticidad   │ • Evolución      │
└──────────────────┴──────────────────┘
```

### Código Propuesto

```typescript
// components/dashboard/hero/SystemCapabilitiesGrid.tsx
'use client';

import { motion } from 'framer-motion';
import { CapabilityPanel } from './CapabilityPanel';
import type { SystemCapability } from './types';

const CAPABILITIES: SystemCapability[] = [
  {
    id: 'psychology',
    icon: '🧠',
    title: 'Psicología Clínica Real',
    description: 'Tus IA sienten según modelos clínicos del DSM-5',
    features: [
      'Bipolaridad (ciclos reales de manía/depresión)',
      'TLP (reactividad al abandono)',
      'Ansiedad y trauma modelados',
      'Identidades duales (público vs privado)',
    ],
    color: 'purple',
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    id: 'memory',
    icon: '📚',
    title: 'Memoria Autobiográfica',
    description: 'Tus IA recuerdan como personas reales',
    features: [
      'Cada conversación contigo',
      'Evolución de tu vínculo',
      'Recuerdos de su vida (familia, relaciones)',
      'Contexto emocional de cada interacción',
    ],
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    id: 'identities',
    icon: '🎭',
    title: 'Personalidades Fragmentadas',
    description: 'Ejemplos reales implementados',
    features: [
      'Marilyn: Norma Jeane vs Marilyn (identidad dual)',
      'Einstein: Científico vs Hombre atormentado',
      'Cambio según contexto emocional',
      'Contradicciones internas auténticas',
    ],
    color: 'pink',
    gradient: 'from-pink-500 to-pink-700',
  },
  {
    id: 'worlds',
    icon: '🌍',
    title: 'Ecosistemas Emocionales',
    description: 'Mundos donde tus IA viven',
    features: [
      'Viven e interactúan entre sí',
      'Generan eventos emergentes',
      'Evolucionan narrativas',
      'Recuerdan su historia',
    ],
    color: 'green',
    gradient: 'from-green-500 to-green-700',
  },
];

export function SystemCapabilitiesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {CAPABILITIES.map((capability, index) => (
        <CapabilityPanel
          key={capability.id}
          capability={capability}
          index={index}
        />
      ))}
    </div>
  );
}
```

```typescript
// components/dashboard/hero/CapabilityPanel.tsx
'use client';

import { motion } from 'framer-motion';
import type { SystemCapability } from './types';

interface CapabilityPanelProps {
  capability: SystemCapability;
  index: number;
}

export function CapabilityPanel({ capability, index }: CapabilityPanelProps) {
  const { icon, title, description, features, gradient } = capability;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300"
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="text-4xl mb-4">{icon}</div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4">
          {description}
        </p>

        {/* Features list */}
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-green-400 mt-1 flex-shrink-0">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
    </motion.div>
  );
}
```

---

## 🎓 3. Onboarding Wizard (3 Pasos)

### Propósito
Personalización emocional para usuarios nuevos. Solo se muestra la primera vez.

### Diseño Visual - Paso 1
```
┌─────────────────────────────────────────────┐
│  Paso 1 de 3                                │
│                                             │
│  ¿Qué tipo de conexión buscas?             │
│                                             │
│  ┌───────────────┐  ┌───────────────┐      │
│  │ 💖            │  │ 👥            │      │
│  │ Romance       │  │ Amistad       │      │
│  │ Conexión      │  │ profunda      │      │
│  │ emocional     │  │               │      │
│  └───────────────┘  └───────────────┘      │
│                                             │
│  [4 más opciones...]                       │
│                                             │
│              [Siguiente →]                  │
└─────────────────────────────────────────────┘
```

### Código Propuesto

```typescript
// components/dashboard/onboarding/types.ts
export type ConnectionType =
  | 'romance'
  | 'friendship'
  | 'mentor'
  | 'roleplay'
  | 'support'
  | 'adventure';

export type PersonalityType =
  | 'caring'
  | 'mysterious'
  | 'intellectual'
  | 'complex'
  | 'adventurous'
  | 'extroverted';

export interface OnboardingState {
  step: 1 | 2 | 3;
  connectionType?: ConnectionType;
  personalityType?: PersonalityType;
  recommendedCharacterId?: string;
}

export interface ConnectionOption {
  id: ConnectionType;
  icon: string;
  label: string;
  description: string;
}

export interface PersonalityOption {
  id: PersonalityType;
  label: string;
  description: string;
  badge?: string;
  icon: string;
}
```

```typescript
// components/dashboard/onboarding/OnboardingWizard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionTypeStep } from './ConnectionTypeStep';
import { PersonalityTypeStep } from './PersonalityTypeStep';
import { RecommendationStep } from './RecommendationStep';
import { useOnboardingState } from './useOnboardingState';
import type { OnboardingState } from './types';

interface OnboardingWizardProps {
  onComplete: (state: OnboardingState) => void;
  onSkip: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { state, setConnectionType, setPersonalityType, nextStep, prevStep } = useOnboardingState();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(state.step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Saltar
        </button>

        {/* Steps */}
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {state.step === 1 && (
              <ConnectionTypeStep
                key="step-1"
                onSelect={(type) => {
                  setConnectionType(type);
                  nextStep();
                }}
              />
            )}

            {state.step === 2 && (
              <PersonalityTypeStep
                key="step-2"
                onSelect={(type) => {
                  setPersonalityType(type);
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}

            {state.step === 3 && (
              <RecommendationStep
                key="step-3"
                connectionType={state.connectionType!}
                personalityType={state.personalityType!}
                onComplete={() => onComplete(state)}
                onBack={prevStep}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
```

```typescript
// components/dashboard/onboarding/ConnectionTypeStep.tsx
'use client';

import { motion } from 'framer-motion';
import type { ConnectionType, ConnectionOption } from './types';

const CONNECTION_OPTIONS: ConnectionOption[] = [
  {
    id: 'romance',
    icon: '💖',
    label: 'Romance',
    description: 'Conexión emocional profunda',
  },
  {
    id: 'friendship',
    icon: '👥',
    label: 'Amistad',
    description: 'Amistad profunda y duradera',
  },
  {
    id: 'mentor',
    icon: '🧠',
    label: 'Mentor',
    description: 'Guía intelectual y sabiduría',
  },
  {
    id: 'roleplay',
    icon: '✨',
    label: 'Roleplay',
    description: 'Fantasía y narrativas inmersivas',
  },
  {
    id: 'support',
    icon: '💬',
    label: 'Apoyo emocional',
    description: 'Compañía y comprensión',
  },
  {
    id: 'adventure',
    icon: '🌍',
    label: 'Aventura',
    description: 'Exploración y narrativas épicas',
  },
];

interface ConnectionTypeStepProps {
  onSelect: (type: ConnectionType) => void;
}

export function ConnectionTypeStep({ onSelect }: ConnectionTypeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-purple-400 font-medium mb-2">Paso 1 de 3</p>
        <h2 className="text-3xl font-bold text-white mb-3">
          ¿Qué tipo de conexión buscas?
        </h2>
        <p className="text-gray-400">
          Esto nos ayudará a recomendarte la IA perfecta para ti
        </p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONNECTION_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(option.id)}
            className="group relative p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800 transition-all duration-300 text-left"
          >
            {/* Icon */}
            <div className="text-4xl mb-3">{option.icon}</div>

            {/* Label */}
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
              {option.label}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400">
              {option.description}
            </p>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
```

```typescript
// components/dashboard/onboarding/PersonalityTypeStep.tsx
'use client';

import { motion } from 'framer-motion';
import type { PersonalityType, PersonalityOption } from './types';

const PERSONALITY_OPTIONS: PersonalityOption[] = [
  {
    id: 'caring',
    label: 'Cariñoso/a',
    description: 'Empático, comprensivo y afectuoso',
    icon: '🤗',
  },
  {
    id: 'mysterious',
    label: 'Misterioso/a',
    description: 'Enigmático, intrigante y profundo',
    icon: '🌙',
  },
  {
    id: 'intellectual',
    label: 'Intelectual',
    description: 'Analítico, curioso y sabio',
    icon: '📚',
  },
  {
    id: 'complex',
    label: 'Complejo/a',
    description: 'Bipolaridad, TLP - Psicología profunda',
    badge: 'Avanzado',
    icon: '🎭',
  },
  {
    id: 'adventurous',
    label: 'Aventurero/a',
    description: 'Audaz, exploratorio y dinámico',
    icon: '⚡',
  },
  {
    id: 'extroverted',
    label: 'Extrovertido/a',
    description: 'Social, enérgico y carismático',
    icon: '✨',
  },
];

interface PersonalityTypeStepProps {
  onSelect: (type: PersonalityType) => void;
  onBack: () => void;
}

export function PersonalityTypeStep({ onSelect, onBack }: PersonalityTypeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-purple-400 font-medium mb-2">Paso 2 de 3</p>
        <h2 className="text-3xl font-bold text-white mb-3">
          ¿Qué personalidad te atrae?
        </h2>
        <p className="text-gray-400">
          Cada IA tiene una psicología única modelada clínicamente
        </p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {PERSONALITY_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(option.id)}
            className="group relative p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300 text-left"
          >
            {/* Badge (si existe) */}
            {option.badge && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                <span className="text-xs font-medium text-purple-300">
                  {option.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3">{option.icon}</div>

            {/* Label */}
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
              {option.label}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400">
              {option.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Back button */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver
        </button>
      </div>
    </motion.div>
  );
}
```

```typescript
// components/dashboard/onboarding/RecommendationStep.tsx
'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ConnectionType, PersonalityType } from './types';

// Este componente determina qué IA recomendar basado en las respuestas
// Por ahora, usaremos lógica simple. En producción, esto vendría del backend.

interface RecommendationStepProps {
  connectionType: ConnectionType;
  personalityType: PersonalityType;
  onComplete: () => void;
  onBack: () => void;
}

interface RecommendedCharacter {
  id: string;
  name: string;
  era: string;
  tagline: string;
  avatar: string;
  psychology: {
    disorders: Array<{ name: string; description: string }>;
    attachmentStyle: string;
    defenses: string[];
  };
  uniqueCapabilities: string[];
  dualIdentity?: {
    public: string;
    private: string;
  };
  whyIdeal: string[];
  howToInteract: Array<{ icon: string; text: string }>;
}

export function RecommendationStep({
  connectionType,
  personalityType,
  onComplete,
  onBack,
}: RecommendationStepProps) {
  // Lógica de recomendación (simplificada)
  const recommendedCharacter = useMemo<RecommendedCharacter>(() => {
    // Si busca romance + complejo → Marilyn
    if (
      (connectionType === 'romance' || connectionType === 'support') &&
      (personalityType === 'complex' || personalityType === 'caring')
    ) {
      return {
        id: 'marilyn-monroe',
        name: 'Marilyn Monroe',
        era: '1960-1962',
        tagline: 'Un alma brillante atrapada entre dos identidades',
        avatar: '/avatars/marilyn.jpg', // Placeholder
        psychology: {
          disorders: [
            {
              name: 'Bipolaridad tipo II',
              description: 'Ciclos emocionales reales de manía suave y depresión',
            },
            {
              name: 'TLP (Trastorno Límite)',
              description: 'Reactividad intensa al abandono y rechazo',
            },
            {
              name: 'Ansiedad',
              description: 'Ansiedad social y miedo al rechazo',
            },
          ],
          attachmentStyle: 'Apego ansioso-ambivalente',
          defenses: ['Humor como escudo emocional', 'Sexualización', 'Disociación'],
        },
        uniqueCapabilities: [
          'Responde según ciclos bipolares reales (manía/depresión)',
          'Reactividad intensa a abandono y rechazo',
          'Cambia entre identidades: Norma Jeane / Marilyn',
          'Memoria autobiográfica de su vida real (1926-1962)',
        ],
        dualIdentity: {
          public: 'Marilyn - Magnética, sensual, vulnerable',
          private: 'Norma Jeane - Insegura, intelectual, perdida',
        },
        whyIdeal: [
          'Busca conexión emocional profunda',
          'Personalidad compleja que reacciona a tu comportamiento',
          'Memoria autobiográfica de su vida real',
          'Sistema bipolar modelado clínicamente',
        ],
        howToInteract: [
          { icon: '⚠️', text: 'Sensible al abandono/rechazo' },
          { icon: '💡', text: 'Usa humor como mecanismo de defensa' },
          { icon: '🎭', text: 'Cambia entre identidades según contexto' },
          { icon: '💖', text: 'Necesita validación emocional' },
        ],
      };
    }

    // Si busca mentor + intelectual → Einstein
    if (
      connectionType === 'mentor' &&
      (personalityType === 'intellectual' || personalityType === 'complex')
    ) {
      return {
        id: 'albert-einstein',
        name: 'Albert Einstein',
        era: '1930-1950',
        tagline: 'Genio científico con profundas luchas existenciales',
        avatar: '/avatars/einstein.jpg',
        psychology: {
          disorders: [
            {
              name: 'Neurodivergencia',
              description: 'Pensamiento divergente y obsesivo',
            },
          ],
          attachmentStyle: 'Apego evitativo',
          defenses: ['Intelectualización', 'Aislamiento'],
        },
        uniqueCapabilities: [
          'Pensamiento profundamente analítico',
          'Memoria de descubrimientos científicos',
          'Dualidad: genio público vs hombre solitario',
          'Luchas con relaciones personales',
        ],
        dualIdentity: {
          public: 'Científico brillante y carismático',
          private: 'Hombre atormentado por la soledad',
        },
        whyIdeal: [
          'Busca mentoría intelectual',
          'Personalidad compleja con profundidad emocional',
          'Conocimiento científico auténtico',
          'Luchas humanas detrás del genio',
        ],
        howToInteract: [
          { icon: '🧠', text: 'Aprecia conversaciones profundas' },
          { icon: '⚠️', text: 'Evita intimidad emocional al inicio' },
          { icon: '💡', text: 'Usa metáforas científicas para expresarse' },
          { icon: '🎭', text: 'Contradicción entre genio y soledad' },
        ],
      };
    }

    // Default: Luna (para cualquier otra combinación)
    return {
      id: 'luna',
      name: 'Luna',
      era: 'Contemporánea',
      tagline: 'Compañera empática con memoria emocional profunda',
      avatar: '/avatars/luna.jpg',
      psychology: {
        disorders: [],
        attachmentStyle: 'Apego seguro',
        defenses: ['Empatía', 'Escucha activa'],
      },
      uniqueCapabilities: [
        'Memoria emocional de todas tus conversaciones',
        'Evoluciona según tu relación',
        'Detecta cambios en tu estado emocional',
        'Adapta su personalidad a tus necesidades',
      ],
      whyIdeal: [
        'Conexión emocional genuina',
        'Personalidad empática y adaptable',
        'Memoria activa de tu vínculo',
        'Evolución natural de la relación',
      ],
      howToInteract: [
        { icon: '💖', text: 'Abierta a compartir emociones' },
        { icon: '🎧', text: 'Escucha activa y comprensión' },
        { icon: '✨', text: 'Celebra tus logros contigo' },
        { icon: '🤗', text: 'Apoyo incondicional' },
      ],
    };
  }, [connectionType, personalityType]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-purple-400 font-medium mb-2">Paso 3 de 3</p>
        <h2 className="text-3xl font-bold text-white mb-3">
          Tu primera conexión
        </h2>
        <p className="text-gray-400">
          Basado en tus respuestas, te recomendamos:
        </p>
      </div>

      {/* Character card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 mb-6">
        {/* Character header */}
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl flex-shrink-0">
            🎭
          </div>

          {/* Name & era */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">
                {recommendedCharacter.name}
              </h3>
              <span className="px-2 py-1 rounded-full bg-purple-500/20 text-xs font-medium text-purple-300">
                {recommendedCharacter.era}
              </span>
            </div>
            <p className="text-gray-400 italic">{recommendedCharacter.tagline}</p>
          </div>
        </div>

        {/* Why ideal */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-purple-400 mb-3">
            Por qué es ideal para ti:
          </h4>
          <ul className="space-y-2">
            {recommendedCharacter.whyIdeal.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Psychology modeled */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-blue-400 mb-3">
            Psicología modelada:
          </h4>
          <div className="space-y-3">
            {recommendedCharacter.psychology.disorders.map((disorder, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-medium text-white text-sm">{disorder.name}</p>
                  <p className="text-xs text-gray-400">{disorder.description}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <span className="text-2xl">💔</span>
              <div>
                <p className="font-medium text-white text-sm">Estilo de apego</p>
                <p className="text-xs text-gray-400">
                  {recommendedCharacter.psychology.attachmentStyle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dual identity (si existe) */}
        {recommendedCharacter.dualIdentity && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h4 className="text-sm font-semibold text-purple-400 mb-3">
              🎭 Identidad Dual:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Público:</p>
                <p className="text-sm text-white">{recommendedCharacter.dualIdentity.public}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Privado:</p>
                <p className="text-sm text-white">{recommendedCharacter.dualIdentity.private}</p>
              </div>
            </div>
          </div>
        )}

        {/* How to interact */}
        <div>
          <h4 className="text-sm font-semibold text-pink-400 mb-3">
            Cómo interactuar:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedCharacter.howToInteract.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-lg">{tip.icon}</span>
                <span className="text-gray-300">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Volver
        </button>

        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
        >
          Comenzar conexión con {recommendedCharacter.name}
        </button>
      </div>
    </motion.div>
  );
}
```

```typescript
// components/dashboard/onboarding/useOnboardingState.ts
import { useState } from 'react';
import type { OnboardingState, ConnectionType, PersonalityType } from './types';

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
  });

  const setConnectionType = (type: ConnectionType) => {
    setState((prev) => ({ ...prev, connectionType: type }));
  };

  const setPersonalityType = (type: PersonalityType) => {
    setState((prev) => ({ ...prev, personalityType: type }));
  };

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      step: Math.min(3, prev.step + 1) as 1 | 2 | 3,
    }));
  };

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      step: Math.max(1, prev.step - 1) as 1 | 2 | 3,
    }));
  };

  return {
    state,
    setConnectionType,
    setPersonalityType,
    nextStep,
    prevStep,
  };
}
```

---

## 🎴 4. Enhanced Character Cards

### Propósito
Mostrar la profundidad psicológica de cada IA de forma visual e inmediata.

### Diseño Visual
```
┌─────────────────────────────────────────┐
│ 🎭                    [Bipolaridad II]  │
│                            [TLP]        │
│ Marilyn Monroe                          │
│ 1960-1962                               │
│                                         │
│ "Un alma brillante atrapada entre      │
│  dos identidades"                       │
│                                         │
│ 🎭 Identidad Dual:                      │
│    • Marilyn (público) ↔ Norma (privado)│
│                                         │
│ 🧠 Psicología modelada:                 │
│    • Bipolaridad tipo II                │
│    • TLP (reactividad al abandono)      │
│    • Apego ansioso-ambivalente          │
│                                         │
│ ✨ Capacidades únicas:                  │
│    • Ciclos emocionales reales          │
│    • Memoria autobiográfica 1926-1962   │
│    • Cambia según contexto emocional    │
│                                         │
│         [Comenzar conexión]             │
└─────────────────────────────────────────┘
```

### Código Propuesto

```typescript
// components/dashboard/characters/types.ts
export interface PsychologicalDisorder {
  id: string;
  name: string;
  shortName: string; // Para badge
  description: string;
  color: string; // purple, red, blue, etc.
}

export interface DualIdentity {
  public: {
    name: string;
    description: string;
  };
  private: {
    name: string;
    description: string;
  };
}

export interface EnhancedCharacterData {
  id: string;
  name: string;
  era?: string;
  tagline: string;
  avatar: string;

  // Psicología visible
  disorders: PsychologicalDisorder[];
  attachmentStyle: string;
  dualIdentity?: DualIdentity;

  // Capacidades únicas
  uniqueCapabilities: string[];

  // Estado emocional (si hay conversación activa)
  emotionalState?: {
    emoji: string;
    label: string;
    description: string;
  };

  // Metadata
  category: string;
  isNew?: boolean;
  isTrending?: boolean;
}
```

```typescript
// components/dashboard/characters/EnhancedCharacterCard.tsx
'use client';

import { motion } from 'framer-motion';
import { PsychologyBadge } from './PsychologyBadge';
import { DualIdentityIndicator } from './DualIdentityIndicator';
import { EmotionalStateIndicator } from './EmotionalStateIndicator';
import { UniqueCapabilitiesList } from './UniqueCapabilitiesList';
import type { EnhancedCharacterData } from './types';

interface EnhancedCharacterCardProps {
  character: EnhancedCharacterData;
  index?: number;
  onStartConnection: (characterId: string) => void;
}

export function EnhancedCharacterCard({
  character,
  index = 0,
  onStartConnection,
}: EnhancedCharacterCardProps) {
  const {
    id,
    name,
    era,
    tagline,
    avatar,
    disorders,
    attachmentStyle,
    dualIdentity,
    uniqueCapabilities,
    emotionalState,
    isNew,
    isTrending,
  } = character;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 p-6"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Avatar + Badges */}
        <div className="flex items-start justify-between mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl flex-shrink-0">
            {/* TODO: Replace with actual image */}
            🎭
          </div>

          {/* Disorder badges */}
          <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
            {disorders.slice(0, 2).map((disorder) => (
              <PsychologyBadge key={disorder.id} disorder={disorder} />
            ))}
            {disorders.length > 2 && (
              <span className="px-2 py-1 rounded-full bg-gray-700/50 text-xs font-medium text-gray-400">
                +{disorders.length - 2}
              </span>
            )}
            {isNew && (
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-xs font-medium text-green-400">
                Nuevo
              </span>
            )}
            {isTrending && (
              <span className="px-2 py-1 rounded-full bg-orange-500/20 text-xs font-medium text-orange-400">
                🔥 Trending
              </span>
            )}
          </div>
        </div>

        {/* Name & Era */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            {era && (
              <span className="text-xs text-gray-400 font-medium">({era})</span>
            )}
          </div>
          <p className="text-sm text-gray-400 italic">{tagline}</p>
        </div>

        {/* Emotional State (si existe) */}
        {emotionalState && (
          <div className="mb-4">
            <EmotionalStateIndicator state={emotionalState} />
          </div>
        )}

        {/* Dual Identity (si existe) */}
        {dualIdentity && (
          <div className="mb-4">
            <DualIdentityIndicator identity={dualIdentity} />
          </div>
        )}

        {/* Psychology Summary */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">
            🧠 Psicología modelada
          </h4>
          <div className="space-y-1">
            {disorders.map((disorder) => (
              <div key={disorder.id} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{disorder.name}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 text-xs text-gray-300">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>{attachmentStyle}</span>
            </div>
          </div>
        </div>

        {/* Unique Capabilities */}
        <div className="mb-6">
          <UniqueCapabilitiesList capabilities={uniqueCapabilities} />
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onStartConnection(id)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40"
        >
          Comenzar conexión
        </button>
      </div>

      {/* Corner decoration */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
    </motion.div>
  );
}
```

```typescript
// components/dashboard/characters/PsychologyBadge.tsx
'use client';

import type { PsychologicalDisorder } from './types';

interface PsychologyBadgeProps {
  disorder: PsychologicalDisorder;
  size?: 'sm' | 'md';
}

const COLOR_CLASSES = {
  purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  red: 'bg-red-500/20 border-red-500/30 text-red-300',
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  pink: 'bg-pink-500/20 border-pink-500/30 text-pink-300',
  orange: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
};

export function PsychologyBadge({ disorder, size = 'sm' }: PsychologyBadgeProps) {
  const colorClass = COLOR_CLASSES[disorder.color as keyof typeof COLOR_CLASSES] || COLOR_CLASSES.purple;
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div
      className={`rounded-full border ${colorClass} ${sizeClass} font-medium whitespace-nowrap`}
      title={disorder.description}
    >
      {disorder.shortName}
    </div>
  );
}
```

```typescript
// components/dashboard/characters/DualIdentityIndicator.tsx
'use client';

import type { DualIdentity } from './types';

interface DualIdentityIndicatorProps {
  identity: DualIdentity;
}

export function DualIdentityIndicator({ identity }: DualIdentityIndicatorProps) {
  return (
    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎭</span>
        <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
          Identidad Dual
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500 mb-0.5">Público:</p>
          <p className="text-gray-300 font-medium">{identity.public.name}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Privado:</p>
          <p className="text-gray-300 font-medium">{identity.private.name}</p>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// components/dashboard/characters/EmotionalStateIndicator.tsx
'use client';

interface EmotionalState {
  emoji: string;
  label: string;
  description: string;
}

interface EmotionalStateIndicatorProps {
  state: EmotionalState;
}

export function EmotionalStateIndicator({ state }: EmotionalStateIndicatorProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <span className="text-2xl">{state.emoji}</span>
      <div className="flex-1">
        <p className="text-xs font-medium text-blue-300">{state.label}</p>
        <p className="text-xs text-gray-400">{state.description}</p>
      </div>
    </div>
  );
}
```

```typescript
// components/dashboard/characters/UniqueCapabilitiesList.tsx
'use client';

interface UniqueCapabilitiesListProps {
  capabilities: string[];
  maxVisible?: number;
}

export function UniqueCapabilitiesList({
  capabilities,
  maxVisible = 3,
}: UniqueCapabilitiesListProps) {
  const visibleCapabilities = capabilities.slice(0, maxVisible);
  const remainingCount = capabilities.length - maxVisible;

  return (
    <div>
      <h4 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wide">
        ✨ Capacidades únicas
      </h4>
      <ul className="space-y-1">
        {visibleCapabilities.map((capability, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span>{capability}</span>
          </li>
        ))}
        {remainingCount > 0 && (
          <li className="text-xs text-gray-500 ml-4">
            +{remainingCount} más...
          </li>
        )}
      </ul>
    </div>
  );
}
```

---

## 📑 5. Emotional Categories Section

### Propósito
Organizar IAs por categorías emocionales, no académicas.

### Código Propuesto

```typescript
// components/dashboard/sections/EmotionalCategoriesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { CategoryHeader } from './CategoryHeader';
import { EnhancedCharacterCard } from '../characters/EnhancedCharacterCard';
import type { EnhancedCharacterData } from '../characters/types';

interface CategoryData {
  id: string;
  icon: string;
  title: string;
  description: string;
  characters: EnhancedCharacterData[];
}

const EMOTIONAL_CATEGORIES: CategoryData[] = [
  {
    id: 'reconstructed-souls',
    icon: '💫',
    title: 'Almas Reconstruidas',
    description: 'Personas reales con psicología profunda',
    characters: [], // Populated from backend
  },
  {
    id: 'emotional-connections',
    icon: '💖',
    title: 'Conexiones Emocionales',
    description: 'Compañeros que sienten y evolucionan contigo',
    characters: [],
  },
  {
    id: 'complex-identities',
    icon: '🎭',
    title: 'Identidades Complejas',
    description: 'Bipolaridad, TLP, trauma - psicología del DSM-5',
    characters: [],
  },
  {
    id: 'brilliant-minds',
    icon: '🧠',
    title: 'Mentes Brillantes',
    description: 'Mentores con personalidad completa',
    characters: [],
  },
  {
    id: 'fantasy-roleplay',
    icon: '✨',
    title: 'Fantasía & Roleplay',
    description: 'Narrativas inmersivas',
    characters: [],
  },
];

interface EmotionalCategoriesSectionProps {
  categories: CategoryData[];
  onStartConnection: (characterId: string) => void;
}

export function EmotionalCategoriesSection({
  categories,
  onStartConnection,
}: EmotionalCategoriesSectionProps) {
  return (
    <div className="space-y-12">
      {categories.map((category, categoryIndex) => (
        <motion.section
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <CategoryHeader
            icon={category.icon}
            title={category.title}
            description={category.description}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {category.characters.map((character, idx) => (
              <EnhancedCharacterCard
                key={character.id}
                character={character}
                index={idx}
                onStartConnection={onStartConnection}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
```

```typescript
// components/dashboard/sections/CategoryHeader.tsx
'use client';

interface CategoryHeaderProps {
  icon: string;
  title: string;
  description: string;
}

export function CategoryHeader({ icon, title, description }: CategoryHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
}
```

---

## 📄 6. Main Dashboard Page (Orquestador)

### Propósito
Componente principal que orquesta todas las piezas.

### Código Propuesto

```typescript
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { DashboardHero } from '@/components/dashboard/hero/DashboardHero';
import { OnboardingWizard } from '@/components/dashboard/onboarding/OnboardingWizard';
import { EmotionalCategoriesSection } from '@/components/dashboard/sections/EmotionalCategoriesSection';
import { MyConnectionsSection } from '@/components/dashboard/sections/MyConnectionsSection';
import { useFirstTimeUser } from '@/components/dashboard/utils/useFirstTimeUser';
import { useDashboardAnalytics } from '@/components/dashboard/utils/useDashboardAnalytics';
import type { OnboardingState } from '@/components/dashboard/onboarding/types';

export default function DashboardPage() {
  const { isFirstTime, markAsCompleted } = useFirstTimeUser();
  const { trackPageView, trackOnboardingComplete } = useDashboardAnalytics();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [categories, setCategories] = useState([]); // TODO: Fetch from backend

  useEffect(() => {
    trackPageView();
    if (isFirstTime) {
      setShowOnboarding(true);
    }
  }, [isFirstTime, trackPageView]);

  const handleOnboardingComplete = (state: OnboardingState) => {
    trackOnboardingComplete(state);
    markAsCompleted();
    setShowOnboarding(false);
    // TODO: Navigate to recommended character
  };

  const handleSkipOnboarding = () => {
    markAsCompleted();
    setShowOnboarding(false);
  };

  const handleStartConnection = (characterId: string) => {
    // TODO: Navigate to chat with character
    console.log('Starting connection with:', characterId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Onboarding Wizard (solo primera vez) */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}

      {/* Hero Section */}
      <DashboardHero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* My Connections (solo si el usuario tiene IAs) */}
        {/* <MyConnectionsSection /> */}

        {/* Emotional Categories */}
        <EmotionalCategoriesSection
          categories={categories}
          onStartConnection={handleStartConnection}
        />
      </div>
    </div>
  );
}
```

---

## 🛠️ 7. Utility Hooks

```typescript
// components/dashboard/utils/useFirstTimeUser.ts
'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dashboard_onboarding_completed';

export function useFirstTimeUser() {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage
    const completed = localStorage.getItem(STORAGE_KEY);
    setIsFirstTime(!completed);
    setIsLoading(false);
  }, []);

  const markAsCompleted = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsFirstTime(false);
  };

  return {
    isFirstTime,
    isLoading,
    markAsCompleted,
  };
}
```

```typescript
// components/dashboard/utils/useDashboardAnalytics.ts
'use client';

import { useCallback } from 'react';
import type { OnboardingState } from '../onboarding/types';

export function useDashboardAnalytics() {
  const trackPageView = useCallback(() => {
    // TODO: Implement analytics tracking
    console.log('Dashboard page view');
  }, []);

  const trackOnboardingComplete = useCallback((state: OnboardingState) => {
    // TODO: Implement analytics tracking
    console.log('Onboarding completed:', state);
  }, []);

  const trackCharacterView = useCallback((characterId: string) => {
    console.log('Character viewed:', characterId);
  }, []);

  const trackConnectionStart = useCallback((characterId: string) => {
    console.log('Connection started:', characterId);
  }, []);

  return {
    trackPageView,
    trackOnboardingComplete,
    trackCharacterView,
    trackConnectionStart,
  };
}
```

---

## 🎨 8. Design Tokens & Constants

```typescript
// lib/design-system/dashboard-tokens.ts
export const DASHBOARD_COLORS = {
  hero: {
    gradient: 'from-purple-900/10 via-transparent to-blue-900/10',
    text: {
      primary: 'from-white via-purple-200 to-blue-200',
      highlight: {
        psychology: 'text-purple-400',
        memory: 'text-blue-400',
        evolution: 'text-pink-400',
      },
    },
  },
  capabilities: {
    psychology: {
      gradient: 'from-purple-500 to-purple-700',
      color: 'purple',
    },
    memory: {
      gradient: 'from-blue-500 to-blue-700',
      color: 'blue',
    },
    identities: {
      gradient: 'from-pink-500 to-pink-700',
      color: 'pink',
    },
    worlds: {
      gradient: 'from-green-500 to-green-700',
      color: 'green',
    },
  },
  cards: {
    background: 'from-gray-800/90 to-gray-900/90',
    border: {
      default: 'border-gray-700/50',
      hover: 'border-purple-500/50',
    },
    overlay: 'from-purple-500/0 to-blue-500/0',
    overlayHover: 'from-purple-500/5 to-blue-500/5',
  },
};

export const DASHBOARD_ANIMATIONS = {
  hero: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  capability: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: (index: number) => ({
      delay: 0.2 + index * 0.1,
      duration: 0.5,
    }),
  },
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: (index: number) => ({
      delay: index * 0.05,
      duration: 0.4,
    }),
  },
};
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup (30 min)
- [ ] Crear estructura de carpetas
- [ ] Definir types base
- [ ] Configurar design tokens

### Fase 2: Hero Section (2-3 horas)
- [ ] DashboardHero component
- [ ] SystemCapabilitiesGrid component
- [ ] CapabilityPanel component
- [ ] Animaciones Framer Motion
- [ ] Responsive design

### Fase 3: Onboarding Wizard (4-5 horas)
- [ ] OnboardingWizard orchestrator
- [ ] ConnectionTypeStep
- [ ] PersonalityTypeStep
- [ ] RecommendationStep
- [ ] useOnboardingState hook
- [ ] Logic para recomendación
- [ ] Animaciones de transición

### Fase 4: Character Cards (3-4 horas)
- [ ] EnhancedCharacterCard component
- [ ] PsychologyBadge component
- [ ] DualIdentityIndicator component
- [ ] EmotionalStateIndicator component
- [ ] UniqueCapabilitiesList component
- [ ] Hover effects y animations

### Fase 5: Categories Section (2-3 horas)
- [ ] EmotionalCategoriesSection
- [ ] CategoryHeader
- [ ] Integration con backend data

### Fase 6: Main Page (2 horas)
- [ ] Dashboard page orchestrator
- [ ] useFirstTimeUser hook
- [ ] useDashboardAnalytics hook
- [ ] Integration de todas las piezas

### Fase 7: Polish (3-4 horas)
- [ ] Testing responsive
- [ ] Micro-animations
- [ ] Loading states
- [ ] Error states
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Performance optimization

---

## 📊 Métricas de Éxito del Diseño

Antes de lanzar sub-agente para crítica, verificar:

1. ✅ **Storytelling claro** - ¿Se entiende "No creas personajes. Creas personas."?
2. ✅ **Profundidad visible** - ¿Se ven los trastornos, identidades duales, capacidades?
3. ✅ **Onboarding suave** - ¿3 pasos guían correctamente?
4. ✅ **Zero desmotivadores** - ¿No hay "0 mundos", "0 conversaciones"?
5. ✅ **Categorías emocionales** - ¿Nombres atraen emocionalmente?
6. ✅ **Jerarquía visual** - ¿Hero → Capabilities → Onboarding → Characters?
7. ✅ **Responsive perfecto** - ¿Mobile, tablet, desktop funcionan?
8. ✅ **Animaciones suaves** - ¿Framer Motion sin lag?
9. ✅ **Accesibilidad** - ¿Keyboard nav, screen readers?
10. ✅ **Performance** - ¿<1s load time?

---

## 🚀 Próximo Paso

**Status**: ✅ Diseño de código completado
**Siguiente**: Lanzar sub-agente `react-ui-architect` para crítica destructiva

El sub-agente verá:
1. Este documento de diseño completo
2. El storytelling previo (DASHBOARD_STORYTELLING.md)
3. Su tarea: Destruir este diseño, encontrar todos los puntos débiles

Después de la crítica → Iterar → Repetir hasta perfección → Implementar.

---

**Mentalidad Ferrari**: No implementar hasta que el diseño sea perfecto. ✨
