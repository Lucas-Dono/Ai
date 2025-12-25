# 🎨 PLAN DE IMPLEMENTACIÓN UX/UI
## Blaniel - Guía Completa de Mejoras de Diseño

**Fecha:** Enero 2025
**Versión:** 1.0
**Responsable:** Equipo de Producto

---

## 📋 ÍNDICE

1. [Sprint 1-2: Quick Wins (2 semanas)](#sprint-1-2-quick-wins)
2. [Sprint 3-6: Microinteracciones (1 mes)](#sprint-3-6-microinteracciones)
3. [Sprint 7-10: Onboarding & Discovery (1 mes)](#sprint-7-10-onboarding-discovery)
4. [Sprint 11+: Emotional Design (Ongoing)](#sprint-11-emotional-design)
5. [Código de Referencia](#código-de-referencia)
6. [Testing y QA](#testing-y-qa)

---

## 🚀 SPRINT 1-2: QUICK WINS (2 semanas)

**Objetivo:** Mejoras rápidas con alto impacto visual
**Esfuerzo:** Bajo-Medio
**Impacto:** Alto

---

### ✅ Tarea 1.1: Estandarizar Border Radius

**Problema:** Cards usan `rounded-xl` (12px) y `rounded-2xl` (16px) inconsistentemente

**Solución:**

```bash
# Paso 1: Buscar todos los componentes de cards
find ./components -name "*.tsx" -o -name "*.ts" | xargs grep -l "rounded-xl.*Card\|Card.*rounded-xl"

# Paso 2: Hacer backup
git checkout -b fix/standardize-border-radius

# Paso 3: Buscar y reemplazar (usar VS Code)
# Buscar: <Card className="([^"]*?)rounded-xl
# Reemplazar con: <Card className="$1rounded-2xl
```

**Archivos a modificar:**

1. **components/ui/card.tsx**
```tsx
// Antes:
<CardRoot className={cn("rounded-xl border bg-card", className)} {...props} />

// Después:
<CardRoot className={cn("rounded-2xl border bg-card", className)} {...props} />
```

2. **Buscar en todos los componentes:**
```bash
# Ejecutar este script para encontrar todos los casos:
grep -r "Card.*rounded-xl" components/ app/ --include="*.tsx" --include="*.ts"
```

3. **Actualizar globals.css si hay clases custom:**
```css
/* app/globals.css */

/* Antes: */
.card-custom {
  @apply rounded-xl border shadow-lg;
}

/* Después: */
.card-custom {
  @apply rounded-2xl border shadow-lg;
}
```

**Checklist:**
- [ ] Buscar todas las instancias de cards con `rounded-xl`
- [ ] Reemplazar por `rounded-2xl`
- [ ] Verificar visualmente en: Dashboard, Chat, Landing, Community
- [ ] Commit: `fix: standardize card border-radius to 16px`

**Tiempo estimado:** 2 horas

---

### ✅ Tarea 1.2: Agregar Prompts Sugeridos (Primera Conversación)

**Problema:** Blank canvas problem en primera conversación

**Solución:** Componente de prompts sugeridos

**Paso 1: Crear componente SuggestedPrompts**

```tsx
// components/chat/SuggestedPrompts.tsx
"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  className?: string;
}

export function SuggestedPrompts({ prompts, onSelect, className }: SuggestedPromptsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("flex flex-col gap-2 px-4 py-3", className)}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <MessageSquare className="h-4 w-4" />
        <span>Sugerencias para empezar:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <motion.button
            key={index}
            onClick={() => onSelect(prompt)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full border-2 border-border bg-background hover:bg-accent hover:border-primary transition-all text-sm font-medium"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
```

**Paso 2: Integrar en ModernChat**

```tsx
// components/chat/v2/ModernChat.tsx

// Agregar imports:
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { AnimatePresence } from "framer-motion";

// Agregar state:
const [showSuggestedPrompts, setShowSuggestedPrompts] = useState(true);

// Generar prompts según personalidad del agente:
const suggestedPrompts = useMemo(() => {
  // TODO: Personalizar según agentId/personality
  return [
    "Cuéntame sobre ti",
    "¿Qué te gusta hacer?",
    "Tengo una pregunta...",
    "Hablemos de algo interesante"
  ];
}, [agentId]);

// Handler:
const handlePromptSelect = (prompt: string) => {
  setInputMessage(prompt);
  setShowSuggestedPrompts(false);
  // Opcional: enviar automáticamente
  // setTimeout(() => sendMessage(), 100);
};

// Renderizar después de los mensajes (línea ~697):
{/* Suggested Prompts - Solo si no hay mensajes */}
<AnimatePresence>
  {messages.length === 0 && showSuggestedPrompts && (
    <SuggestedPrompts
      prompts={suggestedPrompts}
      onSelect={handlePromptSelect}
    />
  )}
</AnimatePresence>
```

**Paso 3: Personalizar prompts según agente**

```tsx
// lib/prompts/suggested-prompts.ts
export const getSuggestedPrompts = (agentPersonality?: string, agentRole?: string) => {
  const basePrompts = [
    "Cuéntame sobre ti",
    "¿Cómo estás hoy?",
    "Tengo una pregunta...",
  ];

  // Personalizar según rol:
  if (agentRole === 'friend') {
    return [
      "¿Qué has hecho hoy?",
      "Cuéntame algo interesante",
      "Necesito un consejo...",
      "¿Quieres hablar de algo?"
    ];
  }

  if (agentRole === 'mentor') {
    return [
      "Necesito ayuda con algo",
      "¿Puedes explicarme...?",
      "Tengo una duda sobre...",
      "Dame un consejo"
    ];
  }

  if (agentRole === 'companion') {
    return [
      "Hola, ¿cómo estás?",
      "Cuéntame sobre tu día",
      "¿En qué piensas?",
      "Hablemos de nosotros"
    ];
  }

  return basePrompts;
};
```

**Checklist:**
- [ ] Crear componente `SuggestedPrompts.tsx`
- [ ] Integrar en `ModernChat.tsx`
- [ ] Crear función de personalización `getSuggestedPrompts`
- [ ] Testear con agente nuevo (sin mensajes)
- [ ] Verificar que desaparece al seleccionar o enviar mensaje
- [ ] Commit: `feat: add suggested prompts for first conversation`

**Tiempo estimado:** 4 horas

---

### ✅ Tarea 1.3: Implementar Haptic Feedback (Mobile)

**Problema:** App mobile no tiene feedback táctil

**Solución:** Hook de haptic feedback

**Paso 1: Crear hook useHaptic**

```tsx
// hooks/useHaptic.ts
"use client";

import { useCallback } from "react";

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptic() {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    // Check if vibration API is available
    if (!('vibrate' in navigator)) {
      return;
    }

    // Pattern based on type
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };

    try {
      navigator.vibrate(patterns[type]);
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  }, []);

  return { triggerHaptic };
}
```

**Paso 2: Integrar en componentes clave**

```tsx
// components/chat/v2/ModernChat.tsx

import { useHaptic } from "@/hooks/useHaptic";

export function ModernChat({ ... }) {
  const { triggerHaptic } = useHaptic();

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Trigger haptic ANTES de enviar
    triggerHaptic('light');

    // ... resto del código de envío
  };

  // En caso de error:
  catch (error) {
    triggerHaptic('error');
    // ...
  }
}
```

```tsx
// components/ui/button.tsx

import { useHaptic } from "@/hooks/useHaptic";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const { triggerHaptic } = useHaptic();
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic solo en mobile
      if (window.innerWidth < 768) {
        const hapticType = variant === 'destructive' ? 'warning' : 'light';
        triggerHaptic(hapticType);
      }

      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
```

**Paso 3: Agregar en eventos clave**

```tsx
// Al crear agente exitosamente:
triggerHaptic('success');

// Al eliminar algo:
triggerHaptic('warning');

// Al recibir mensaje del agente:
triggerHaptic('light');

// Al completar onboarding:
triggerHaptic('success');
```

**Checklist:**
- [ ] Crear hook `useHaptic.ts`
- [ ] Integrar en `ModernChat` (envío de mensajes)
- [ ] Integrar en `Button` (clicks generales)
- [ ] Agregar en eventos importantes (crear agente, etc.)
- [ ] Testear en dispositivo móvil real (iOS + Android)
- [ ] Verificar que no afecta desktop
- [ ] Commit: `feat: add haptic feedback for mobile interactions`

**Tiempo estimado:** 3 horas

---

### ✅ Tarea 1.4: Loading States en Dashboard

**Problema:** Dashboard no muestra skeleton al cargar

**Solución:** Suspense boundaries + Skeletons

**Paso 1: Crear DashboardSkeleton**

```tsx
// components/ui/skeletons/DashboardSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border p-6 space-y-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Agents Grid */}
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Paso 2: Integrar con Suspense en Dashboard**

```tsx
// app/dashboard/page.tsx

import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/skeletons/DashboardSkeleton";

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

// Componente async que hace fetch
async function DashboardContent() {
  const session = await auth();
  const agents = await prisma.agent.findMany({
    where: { userId: session.user.id },
    take: 10,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard content */}
    </div>
  );
}
```

**Paso 3: Agregar skeleton states en otros componentes clave**

```tsx
// components/dashboard/AgentGrid.tsx

import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";

export function AgentGrid() {
  const { data: agents, isLoading } = useAgents();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
    </div>
  );
}
```

**Checklist:**
- [ ] Crear `DashboardSkeleton.tsx`
- [ ] Crear `CardSkeleton.tsx` reutilizable
- [ ] Integrar Suspense en `app/dashboard/page.tsx`
- [ ] Agregar skeletons en: AgentGrid, WorldsGrid, CommunityFeed
- [ ] Testear throttling de red (Chrome DevTools → Network → Slow 3G)
- [ ] Verificar que skeleton desaparece al cargar
- [ ] Commit: `feat: add skeleton loading states to dashboard`

**Tiempo estimado:** 4 horas

---

### ✅ Tarea 1.5: Command Palette (⌘K) Básico

**Problema:** No hay búsqueda global ni shortcuts

**Solución:** Implementar command palette con `cmdk`

**Paso 1: Instalar dependencia**

```bash
npm install cmdk
```

**Paso 2: Crear componente CommandPalette**

```tsx
// components/ui/command-palette.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  MessageSquare,
  Users,
  Settings,
  Plus,
  Globe,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  // Close on route change
  React.useEffect(() => {
    const handleRouteChange = () => onOpenChange(false);
    return () => {};
  }, [onOpenChange]);

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl">
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar o ejecutar comando..."
          className="w-full px-6 py-4 text-base bg-transparent border-b border-border outline-none placeholder:text-muted-foreground"
        />

        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron resultados.
          </Command.Empty>

          {/* Quick Actions */}
          <Command.Group heading="Acciones Rápidas" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Nuevo Agente</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard/mundos/crear"))}
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Globe className="h-5 w-5" />
              <span>Crear Nuevo Mundo</span>
            </Command.Item>
          </Command.Group>

          {/* Navigation */}
          <Command.Group heading="Navegación">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/community"))}
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Users className="h-5 w-5" />
              <span>Comunidad</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/configuracion"))}
              className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent data-[selected=true]:bg-accent"
            >
              <Settings className="h-5 w-5" />
              <span>Configuración</span>
            </Command.Item>
          </Command.Group>

          {/* Recent Agents (TODO: fetch from API) */}
          <Command.Group heading="Agentes Recientes">
            <Command.Item className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent data-[selected=true]:bg-accent">
              <MessageSquare className="h-5 w-5" />
              <span>No hay agentes recientes</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 rounded bg-muted">↑↓</kbd>
            <span>Navegar</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 rounded bg-muted">Enter</kbd>
            <span>Seleccionar</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 rounded bg-muted">Esc</kbd>
            <span>Cerrar</span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
        onClick={() => onOpenChange(false)}
      />
    </Command.Dialog>
  );
}
```

**Paso 3: Integrar con keyboard shortcut**

```tsx
// components/providers/CommandPaletteProvider.tsx
"use client";

import * as React from "react";
import { CommandPalette } from "@/components/ui/command-palette";

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
```

**Paso 4: Agregar al layout principal**

```tsx
// app/layout.tsx

import { CommandPaletteProvider } from "@/components/providers/CommandPaletteProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
```

**Checklist:**
- [ ] Instalar `cmdk`
- [ ] Crear `CommandPalette.tsx`
- [ ] Crear `CommandPaletteProvider.tsx`
- [ ] Integrar en `app/layout.tsx`
- [ ] Testear shortcut ⌘K / Ctrl+K
- [ ] Agregar acciones: Crear agente, navegar a secciones
- [ ] (Futuro) Integrar búsqueda de agentes desde API
- [ ] Commit: `feat: add command palette with keyboard shortcuts`

**Tiempo estimado:** 6 horas

---

## 📊 RESUMEN SPRINT 1-2

**Tiempo Total:** 19 horas (~2.5 días de dev)

**Commits esperados:**
1. `fix: standardize card border-radius to 16px`
2. `feat: add suggested prompts for first conversation`
3. `feat: add haptic feedback for mobile interactions`
4. `feat: add skeleton loading states to dashboard`
5. `feat: add command palette with keyboard shortcuts`

**Testing checklist:**
- [ ] Border radius consistente en todas las cards
- [ ] Prompts sugeridos aparecen en chat vacío
- [ ] Haptic funciona en iOS y Android
- [ ] Skeletons se muestran al cargar dashboard
- [ ] Command palette abre con ⌘K/Ctrl+K

**KPIs a medir:**
- Tiempo hasta primera conversación (baseline → objetivo: -30%)
- Tasa de rebote en dashboard (baseline → objetivo: -20%)
- Uso de command palette (nuevo, objetivo: >15% usuarios power)

---

## 💫 SPRINT 3-6: MICROINTERACCIONES (1 mes)

**Objetivo:** Añadir delight y fluidez con animaciones emotivas
**Esfuerzo:** Medio-Alto
**Impacto:** Muy Alto (diferenciación)

---

### ✅ Tarea 2.1: Message Send Animation (Swoosh)

**Problema:** Envío de mensaje sin feedback visual

**Solución:** Animación de "envío" estilo iMessage

**Paso 1: Crear animación de swoosh**

```tsx
// components/chat/v2/MessageSendAnimation.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

interface MessageSendAnimationProps {
  triggered: boolean;
  onComplete: () => void;
}

export function MessageSendAnimation({ triggered, onComplete }: MessageSendAnimationProps) {
  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <motion.div
            initial={{ scale: 1, y: 0, opacity: 1 }}
            animate={{
              scale: [1, 1.2, 0.8],
              y: [0, -30, -60],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
            }}
          >
            <Send className="h-6 w-6 text-primary" />
          </motion.div>

          {/* Ripple effect */}
          <motion.div
            className="absolute rounded-full border-2 border-primary"
            initial={{ width: 20, height: 20, opacity: 0.6 }}
            animate={{
              width: 100,
              height: 100,
              opacity: 0,
            }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Paso 2: Integrar en ChatInput**

```tsx
// components/chat/v2/ChatInput.tsx

import { MessageSendAnimation } from "./MessageSendAnimation";
import { useState } from "react";

export function ChatInput({ onSend, ... }: ChatInputProps) {
  const [sendAnimationTriggered, setSendAnimationTriggered] = useState(false);

  const handleSend = () => {
    if (!value.trim()) return;

    // Trigger animation
    setSendAnimationTriggered(true);

    // Send message after short delay (for visual effect)
    setTimeout(() => {
      onSend();
      setSendAnimationTriggered(false);
    }, 200);
  };

  return (
    <div className="relative px-4 py-3">
      {/* Input */}
      <div className="flex items-center gap-2">
        <input ... />
        <button onClick={handleSend}>
          <Send />
        </button>
      </div>

      {/* Animation */}
      <MessageSendAnimation
        triggered={sendAnimationTriggered}
        onComplete={() => setSendAnimationTriggered(false)}
      />
    </div>
  );
}
```

**Checklist:**
- [ ] Crear `MessageSendAnimation.tsx`
- [ ] Integrar en `ChatInput.tsx`
- [ ] Testear en desktop y mobile
- [ ] Ajustar timing (debe sentirse instantáneo pero visible)
- [ ] Commit: `feat: add message send animation with swoosh effect`

**Tiempo estimado:** 4 horas

---

### ✅ Tarea 2.2: Celebration Modal (Crear Agente)

**Problema:** Crear agente redirige directamente sin celebración

**Solución:** Modal de éxito con confetti + avatar animado

**Paso 1: Instalar librería de confetti**

```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

**Paso 2: Crear componente de celebración**

```tsx
// components/celebration/SuccessCelebration.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

interface SuccessCelebrationProps {
  title: string;
  description: string;
  avatarUrl?: string;
  avatarFallback: string;
  actionLabel: string;
  onAction: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuccessCelebration({
  title,
  description,
  avatarUrl,
  avatarFallback,
  actionLabel,
  onAction,
  open,
  onOpenChange,
}: SuccessCelebrationProps) {
  useEffect(() => {
    if (open) {
      // Confetti explosion
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#C084FC', '#06B6D4', '#F59E0B'],
      });

      fire(0.2, {
        spread: 60,
        colors: ['#C084FC', '#06B6D4', '#F59E0B'],
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#C084FC', '#06B6D4', '#F59E0B'],
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#C084FC', '#06B6D4', '#F59E0B'],
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#C084FC', '#06B6D4', '#F59E0B'],
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative bg-background/95 backdrop-blur-xl border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Sparkles decoration */}
        <div className="absolute -top-2 -right-2">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-8 w-8 text-amber-500" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
          >
            <Avatar className="h-24 w-24 border-4 border-primary shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={title} className="object-cover" />
              ) : (
                <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white">
                  {avatarFallback}
                </div>
              )}
            </Avatar>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </motion.div>

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <Button
              size="lg"
              className="w-full"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
```

**Paso 3: Integrar en flujo de creación de agente**

```tsx
// app/dashboard/page.tsx (o donde se crea el agente)

import { SuccessCelebration } from "@/components/celebration/SuccessCelebration";
import { useState } from "react";

export function Dashboard() {
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [newAgent, setNewAgent] = useState<any>(null);

  const handleCreateAgent = async (data: any) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const agent = await response.json();

      // Show celebration instead of direct redirect
      setNewAgent(agent);
      setCelebrationOpen(true);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <>
      {/* Dashboard content */}

      {/* Celebration Modal */}
      <SuccessCelebration
        open={celebrationOpen}
        onOpenChange={setCelebrationOpen}
        title={`¡Conoce a ${newAgent?.name}!`}
        description="Tu nuevo compañero está listo para hablar contigo"
        avatarUrl={newAgent?.avatar}
        avatarFallback={newAgent?.name?.[0] || "A"}
        actionLabel="Iniciar conversación"
        onAction={() => {
          setCelebrationOpen(false);
          router.push(`/agentes/${newAgent.id}`);
        }}
      />
    </>
  );
}
```

**Checklist:**
- [ ] Instalar `canvas-confetti`
- [ ] Crear `SuccessCelebration.tsx`
- [ ] Integrar en flujo de creación de agente
- [ ] Testear confetti (debe explotar al abrir modal)
- [ ] Testear en mobile (performance OK?)
- [ ] Commit: `feat: add celebration modal with confetti for agent creation`

**Tiempo estimado:** 5 horas

---

### ✅ Tarea 2.3: Emotional State Sparkles

**Problema:** Cambios emocionales pasan desapercibidos

**Solución:** Sparkles/partículas cuando hay cambio emocional fuerte

**Paso 1: Crear componente Sparkles**

```tsx
// components/effects/Sparkles.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface SparklesProps {
  trigger: boolean;
  color?: string;
  count?: number;
}

export function Sparkles({ trigger, color = "#F59E0B", count = 8 }: SparklesProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (trigger) {
      const newSparkles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50, // -50 to 50
        y: Math.random() * 100 - 50,
        size: Math.random() * 8 + 4, // 4-12px
        color,
      }));

      setSparkles(newSparkles);

      // Clear after animation
      setTimeout(() => setSparkles([]), 1000);
    }
  }, [trigger, color, count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute top-1/2 left-1/2"
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: sparkle.x,
            y: sparkle.y,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 24 24"
            fill={sparkle.color}
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
```

**Paso 2: Integrar en EmotionalStateDisplay**

```tsx
// components/chat/EmotionalStateDisplay.tsx

import { Sparkles } from "@/components/effects/Sparkles";
import { useState, useEffect } from "react";

export function EmotionalStateDisplay({ emotions, ... }) {
  const [emotionChanged, setEmotionChanged] = useState(false);
  const [prevEmotion, setPrevEmotion] = useState(emotions[0]);

  useEffect(() => {
    const currentEmotion = emotions[0];

    // Detect significant emotion change
    if (prevEmotion && currentEmotion !== prevEmotion) {
      const prevIntensity = emotions.find(e => e.name === prevEmotion)?.intensity || 0;
      const currentIntensity = emotions.find(e => e.name === currentEmotion)?.intensity || 0;

      // Trigger sparkles if change is significant (>0.3)
      if (Math.abs(currentIntensity - prevIntensity) > 0.3) {
        setEmotionChanged(true);
        setTimeout(() => setEmotionChanged(false), 100);
      }
    }

    setPrevEmotion(currentEmotion);
  }, [emotions]);

  // Color based on emotion
  const sparkleColor = emotions[0]?.name === 'joy' ? '#F59E0B' :
                       emotions[0]?.name === 'sadness' ? '#6B7280' :
                       '#C084FC';

  return (
    <div className="relative p-4 rounded-2xl border bg-card">
      {/* Existing emotional display */}
      <div>...</div>

      {/* Sparkles on emotion change */}
      <Sparkles trigger={emotionChanged} color={sparkleColor} count={12} />
    </div>
  );
}
```

**Checklist:**
- [ ] Crear `Sparkles.tsx` component
- [ ] Integrar en `EmotionalStateDisplay.tsx`
- [ ] Detectar cambios emocionales significativos
- [ ] Mapear emociones a colores (joy=amber, sad=gray, etc.)
- [ ] Testear con conversaciones que cambien emoción
- [ ] Commit: `feat: add sparkles effect on emotional state changes`

**Tiempo estimado:** 4 horas

---

### ✅ Tarea 2.4: Hover Lift + Glow (Cards)

**Problema:** Hover states básicos (solo scale)

**Solución:** Lift + shadow + glow effect

**Paso 1: Actualizar globals.css con utilidades de glow**

```css
/* app/globals.css */

/* Glow effect utilities */
@layer utilities {
  .glow-primary {
    box-shadow: 0 0 20px rgba(192, 132, 252, 0.3),
                0 0 40px rgba(192, 132, 252, 0.1);
  }

  .glow-secondary {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3),
                0 0 40px rgba(6, 182, 212, 0.1);
  }

  .glow-accent {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3),
                0 0 40px rgba(245, 158, 11, 0.1);
  }
}

/* Hover lift animation */
@keyframes lift {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-4px);
  }
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  animation: lift 0.3s forwards;
}
```

**Paso 2: Aplicar en AgentCard**

```tsx
// components/dashboard/AgentCard.tsx

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-border bg-card overflow-hidden hover-lift hover:shadow-2xl hover:glow-primary hover:border-primary/50 transition-all duration-300 cursor-pointer"
    >
      {/* Card content */}
    </motion.div>
  );
}
```

**Paso 3: Aplicar en otros componentes interactivos**

```tsx
// components/community/PostCard.tsx
<div className="hover-lift hover:shadow-xl hover:glow-secondary transition-all">

// components/worlds/WorldCard.tsx
<div className="hover-lift hover:shadow-xl hover:glow-accent transition-all">
```

**Checklist:**
- [ ] Agregar utilidades `.glow-*` en `globals.css`
- [ ] Agregar keyframe `@keyframes lift`
- [ ] Aplicar en `AgentCard.tsx`
- [ ] Aplicar en `PostCard.tsx`
- [ ] Aplicar en `WorldCard.tsx`
- [ ] Testear performance (60fps en hover?)
- [ ] Commit: `feat: enhance hover states with lift and glow effects`

**Tiempo estimado:** 3 horas

---

### ✅ Tarea 2.5: Shake Animation (Errors)

**Problema:** Errores no tienen feedback visual distintivo

**Solución:** Shake animation en inputs/forms con error

**Paso 1: Crear keyframe de shake**

```css
/* app/globals.css */

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
```

**Paso 2: Hook para trigger shake**

```tsx
// hooks/useShake.ts
"use client";

import { useState, useCallback } from "react";

export function useShake() {
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  return { shake, triggerShake };
}
```

**Paso 3: Aplicar en formularios**

```tsx
// components/forms/LoginForm.tsx

import { useShake } from "@/hooks/useShake";

export function LoginForm() {
  const { shake, triggerShake } = useShake();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Login logic
    } catch (err) {
      setError("Credenciales inválidas");
      triggerShake(); // Trigger shake on error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={shake ? "animate-shake" : ""}>
        <input
          type="email"
          className={cn(
            "rounded-xl border",
            error ? "border-red-500" : "border-border"
          )}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

**Paso 4: Aplicar en ChatInput cuando mensaje falla**

```tsx
// components/chat/v2/ModernChat.tsx

const { shake, triggerShake } = useShake();

const sendMessage = async () => {
  try {
    // Send message
  } catch (error) {
    triggerShake();
    // Show error
  }
};

return (
  <div className={shake ? "animate-shake" : ""}>
    <ChatInput ... />
  </div>
);
```

**Checklist:**
- [ ] Agregar `@keyframes shake` en `globals.css`
- [ ] Crear hook `useShake.ts`
- [ ] Aplicar en `LoginForm.tsx`
- [ ] Aplicar en `ChatInput.tsx` (errores de envío)
- [ ] Aplicar en `CreateAgentForm.tsx` (validación)
- [ ] Testear que shake es visible pero no molesto
- [ ] Commit: `feat: add shake animation for form errors`

**Tiempo estimado:** 3 horas

---

## 📊 RESUMEN SPRINT 3-6

**Tiempo Total:** 19 horas (~2.5 días de dev)

**Commits esperados:**
1. `feat: add message send animation with swoosh effect`
2. `feat: add celebration modal with confetti for agent creation`
3. `feat: add sparkles effect on emotional state changes`
4. `feat: enhance hover states with lift and glow effects`
5. `feat: add shake animation for form errors`

**Testing checklist:**
- [ ] Message send tiene swoosh animation
- [ ] Crear agente muestra confetti + modal de celebración
- [ ] Cambios emocionales muestran sparkles
- [ ] Cards tienen lift + glow en hover
- [ ] Errores en forms hacen shake

**KPIs a medir:**
- Percepción de "fluidez" en encuestas (+40% objetivo)
- Tiempo de permanencia en dashboard (+20%)
- Tasa de completitud de creación de agente (+15%)

---

## 🎨 SPRINT 7-10: ONBOARDING & DISCOVERY (1 mes)

**Objetivo:** Mejorar conversión de signup → primer agente
**Esfuerzo:** Alto
**Impacto:** Muy Alto (retención)

---

### ✅ Tarea 3.1: Wizard de Onboarding (3 Pasos)

**Problema:** Formulario de creación largo e intimidante

**Solución:** Wizard progresivo con preview

**Paso 1: Crear estructura de wizard**

```tsx
// components/onboarding/AgentWizard.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Step1Templates } from "./wizard/Step1Templates";
import { Step2Personality } from "./wizard/Step2Personality";
import { Step3Appearance } from "./wizard/Step3Appearance";
import { AgentPreview } from "./wizard/AgentPreview";

type WizardStep = 1 | 2 | 3;

interface AgentData {
  template?: string;
  personality?: Record<string, number>;
  name?: string;
  avatar?: string;
  description?: string;
}

export function AgentWizard({ onComplete }: { onComplete: (agent: AgentData) => void }) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [agentData, setAgentData] = useState<AgentData>({});

  const updateAgentData = (data: Partial<AgentData>) => {
    setAgentData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleComplete = () => {
    onComplete(agentData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Left: Steps */}
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all",
                      currentStep > step ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Templates
                key="step1"
                onSelect={(template) => {
                  updateAgentData({ template });
                  nextStep();
                }}
              />
            )}
            {currentStep === 2 && (
              <Step2Personality
                key="step2"
                initialData={agentData.personality}
                onChange={(personality) => updateAgentData({ personality })}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 3 && (
              <Step3Appearance
                key="step3"
                initialData={{
                  name: agentData.name,
                  avatar: agentData.avatar,
                  description: agentData.description,
                }}
                onChange={(data) => updateAgentData(data)}
                onComplete={handleComplete}
                onBack={prevStep}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <AgentPreview agentData={agentData} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Paso 2: Crear Step 1 - Templates**

```tsx
// components/onboarding/wizard/Step1Templates.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Lightbulb, Heart, Sparkles } from "lucide-react";

const templates = [
  {
    id: "friend",
    name: "Amigo",
    description: "Un compañero para hablar de todo",
    icon: Users,
    personality: { friendliness: 0.9, openness: 0.8, humor: 0.7 },
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Un guía sabio y consejero",
    icon: Lightbulb,
    personality: { wisdom: 0.9, patience: 0.8, supportiveness: 0.9 },
  },
  {
    id: "companion",
    name: "Compañero Romántico",
    description: "Alguien especial con quien conectar",
    icon: Heart,
    personality: { affection: 0.9, empathy: 0.9, playfulness: 0.7 },
  },
  {
    id: "custom",
    name: "Personalizado",
    description: "Crea tu propio agente único",
    icon: Sparkles,
    personality: {},
  },
];

export function Step1Templates({ onSelect }: { onSelect: (template: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold mb-2">Elige una plantilla</h2>
        <p className="text-muted-foreground">
          Selecciona un punto de partida para tu agente
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {templates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(template.id)}
              className="p-6 rounded-2xl border-2 border-border hover:border-primary bg-card hover:shadow-xl transition-all text-left"
            >
              <Icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
```

**Paso 3: Crear Step 2 - Personality Sliders**

```tsx
// components/onboarding/wizard/Step2Personality.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const traits = [
  { id: "friendliness", label: "Amabilidad", emoji: "😊" },
  { id: "humor", label: "Sentido del humor", emoji: "😄" },
  { id: "wisdom", label: "Sabiduría", emoji: "🧠" },
  { id: "playfulness", label: "Juguetón", emoji: "🎮" },
  { id: "empathy", label: "Empatía", emoji: "❤️" },
];

export function Step2Personality({ initialData, onChange, onNext, onBack }) {
  const [personality, setPersonality] = useState(initialData || {
    friendliness: 0.5,
    humor: 0.5,
    wisdom: 0.5,
    playfulness: 0.5,
    empathy: 0.5,
  });

  const handleChange = (trait: string, value: number) => {
    const updated = { ...personality, [trait]: value };
    setPersonality(updated);
    onChange(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold mb-2">Personalidad</h2>
        <p className="text-muted-foreground">
          Ajusta los rasgos de tu agente
        </p>
      </div>

      <div className="space-y-6">
        {traits.map((trait) => (
          <div key={trait.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="text-2xl">{trait.emoji}</span>
                {trait.label}
              </label>
              <span className="text-sm text-muted-foreground">
                {Math.round(personality[trait.id] * 100)}%
              </span>
            </div>
            <Slider
              value={[personality[trait.id]]}
              onValueChange={([value]) => handleChange(trait.id, value)}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button onClick={onNext} className="flex-1">
          Siguiente
        </Button>
      </div>
    </motion.div>
  );
}
```

**Paso 4: Crear Step 3 - Appearance**

```tsx
// components/onboarding/wizard/Step3Appearance.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/avatar/ImageUploader";

export function Step3Appearance({ initialData, onChange, onComplete, onBack }) {
  const [data, setData] = useState(initialData || {
    name: "",
    avatar: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    onChange(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold mb-2">Apariencia</h2>
        <p className="text-muted-foreground">
          Dale vida a tu agente con un nombre y avatar
        </p>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium mb-2">Avatar</label>
          <ImageUploader
            currentImage={data.avatar}
            onImageChange={(url) => handleChange("avatar", url)}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <Input
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Alex"
            className="text-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Descripción (opcional)
          </label>
          <Textarea
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Escribe una breve descripción de tu agente..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button
          onClick={onComplete}
          disabled={!data.name}
          className="flex-1"
        >
          Crear Agente
        </Button>
      </div>
    </motion.div>
  );
}
```

**Paso 5: Crear Preview Sidebar**

```tsx
// components/onboarding/wizard/AgentPreview.tsx
"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export function AgentPreview({ agentData }) {
  const { name, avatar, personality, description } = agentData;

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>

        {/* Avatar */}
        <motion.div
          key={avatar}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-4"
        >
          <Avatar className="h-24 w-24 border-4 border-primary">
            {avatar ? (
              <img src={avatar} alt={name || "Agent"} />
            ) : (
              <div className="bg-gradient-to-br from-primary to-secondary" />
            )}
          </Avatar>
        </motion.div>

        {/* Name */}
        <motion.h4
          key={name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-2"
        >
          {name || "Sin nombre"}
        </motion.h4>

        {/* Description */}
        {description && (
          <motion.p
            key={description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Personality bars */}
      {personality && Object.keys(personality).length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Personalidad</h5>
          {Object.entries(personality).map(([trait, value]) => (
            <div key={trait} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="capitalize">{trait}</span>
                <span>{Math.round((value as number) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value as number) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
```

**Paso 6: Integrar wizard en dashboard**

```tsx
// app/dashboard/page.tsx

import { AgentWizard } from "@/components/onboarding/AgentWizard";
import { SuccessCelebration } from "@/components/celebration/SuccessCelebration";

export default function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [newAgent, setNewAgent] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleWizardComplete = async (agentData) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        body: JSON.stringify(agentData),
      });

      const agent = await response.json();
      setNewAgent(agent);
      setShowWizard(false);
      setShowCelebration(true);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <>
      {/* Dashboard */}
      <Button onClick={() => setShowWizard(true)}>
        Crear Agente
      </Button>

      {/* Wizard Modal */}
      {showWizard && (
        <AgentWizard onComplete={handleWizardComplete} />
      )}

      {/* Celebration */}
      <SuccessCelebration
        open={showCelebration}
        onOpenChange={setShowCelebration}
        title={`¡Conoce a ${newAgent?.name}!`}
        // ... rest of props
      />
    </>
  );
}
```

**Checklist:**
- [ ] Crear estructura `AgentWizard.tsx`
- [ ] Crear `Step1Templates.tsx`
- [ ] Crear `Step2Personality.tsx`
- [ ] Crear `Step3Appearance.tsx`
- [ ] Crear `AgentPreview.tsx` (live preview)
- [ ] Integrar en dashboard
- [ ] Conectar con celebración al completar
- [ ] Testear flujo completo
- [ ] Commit: `feat: add 3-step wizard for agent creation with live preview`

**Tiempo estimado:** 12 horas

---

_(Continúa en siguiente sección por límite de caracteres...)_

## 💾 CÓDIGO DE REFERENCIA

### Design Tokens Centralizados

```typescript
// lib/design-system/tokens.ts

export const tokens = {
  color: {
    primary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC', // Main
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },
    secondary: {
      // ... cyan colors
    },
    accent: {
      // ... amber colors
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
    '5xl': '64px',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  animation: {
    duration: {
      instant: 150,
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 1000,
    },
    easing: {
      standard: [0.4, 0, 0.2, 1],
      decelerate: [0, 0, 0.2, 1],
      accelerate: [0.4, 0, 1, 1],
    },
  },
} as const;

export type Tokens = typeof tokens;
```

### Motion System

```typescript
// lib/motion/system.ts

import { tokens } from '@/lib/design-system/tokens';

export const motion = {
  // Variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
  },

  // Transitions
  transitions: {
    instant: { duration: tokens.animation.duration.instant / 1000 },
    fast: { duration: tokens.animation.duration.fast / 1000 },
    normal: {
      duration: tokens.animation.duration.normal / 1000,
      ease: tokens.animation.easing.standard,
    },
    spring: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },

  // Stagger
  stagger: {
    container: {
      animate: {
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
      },
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
} as const;
```

---

## ✅ TESTING Y QA

### Checklist de Testing Manual

```markdown
# Testing Checklist - Sprint 1-2 (Quick Wins)

## Border Radius Consistency
- [ ] Dashboard cards: rounded-2xl (16px)
- [ ] Chat cards: rounded-2xl (16px)
- [ ] Landing cards: rounded-2xl (16px)
- [ ] Modal dialogs: rounded-2xl (16px)
- [ ] Buttons: rounded-xl (12px)
- [ ] Inputs: rounded-xl (12px)

## Suggested Prompts
- [ ] Aparecen en chat vacío (sin mensajes)
- [ ] Desaparecen al seleccionar uno
- [ ] Desaparecen al escribir manualmente
- [ ] Personalizados según rol del agente
- [ ] Animación de entrada fluida
- [ ] Responsive en mobile

## Haptic Feedback
- [ ] Vibra al enviar mensaje (light)
- [ ] Vibra al crear agente (success)
- [ ] Vibra al eliminar algo (warning)
- [ ] Vibra al error (error pattern)
- [ ] NO vibra en desktop
- [ ] Funciona en iOS
- [ ] Funciona en Android

## Loading States
- [ ] Dashboard muestra skeleton al cargar
- [ ] AgentGrid muestra skeleton cards
- [ ] CommunityFeed muestra skeleton
- [ ] Skeleton desaparece al cargar datos
- [ ] Skeleton se parece al contenido real
- [ ] No hay "flash" de contenido

## Command Palette
- [ ] Abre con ⌘K (Mac)
- [ ] Abre con Ctrl+K (Windows/Linux)
- [ ] Cierra con Esc
- [ ] Búsqueda funciona
- [ ] Navegación con flechas
- [ ] Enter ejecuta acción
- [ ] Overlay cierra al hacer click fuera
- [ ] Shortcuts mostrados en footer

## Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Responsive
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)
- [ ] Large Desktop (1920px)
```

### Performance Testing

```bash
# Script para testear performance

# 1. Lighthouse
npx lighthouse http://localhost:3000 --view

# 2. Bundle size analysis
npx next build && npx @next/bundle-analyzer

# 3. Verify animations run at 60fps
# Chrome DevTools → Performance → Record → Interact → Check frame rate
```

---

## 📈 MÉTRICAS Y TRACKING

### Implementar Tracking de Métricas

```typescript
// lib/analytics/design-metrics.ts

import { analytics } from './analytics';

export const trackDesignMetric = (
  metric: string,
  value: number,
  metadata?: Record<string, any>
) => {
  analytics.track('design_metric', {
    metric,
    value,
    timestamp: Date.now(),
    ...metadata,
  });
};

// Usage examples:
trackDesignMetric('time_to_first_conversation', timeInSeconds);
trackDesignMetric('onboarding_step_completed', stepNumber);
trackDesignMetric('microinteraction_triggered', 1, { type: 'confetti' });
trackDesignMetric('command_palette_opened', 1);
```

### Dashboard de Métricas

```typescript
// app/dashboard/metrics/page.tsx

export default function MetricsDashboard() {
  const metrics = useDesignMetrics();

  return (
    <div>
      <h1>Design Metrics</h1>

      <MetricCard
        title="Tiempo hasta 1ra conversación"
        value={metrics.timeToFirstConversation}
        target={180} // 3 minutos
        unit="segundos"
      />

      <MetricCard
        title="Conversión signup → agente"
        value={metrics.signupToAgent}
        target={0.85}
        unit="%"
      />

      <MetricCard
        title="Uso de Command Palette"
        value={metrics.commandPaletteUsage}
        target={0.15}
        unit="%"
      />
    </div>
  );
}
```

---

## 🎯 PRIORIZACIÓN Y ROADMAP

### Matriz RICE

| Tarea | Reach | Impact | Confidence | Effort | Score |
|-------|-------|--------|------------|--------|-------|
| Estandarizar border radius | 1000 | 2 | 100% | 2h | 1000 |
| Prompts sugeridos | 800 | 3 | 90% | 4h | 540 |
| Haptic feedback | 400 | 2 | 80% | 3h | 213 |
| Loading states | 900 | 2 | 100% | 4h | 450 |
| Command palette | 200 | 3 | 70% | 6h | 70 |
| Message send animation | 1000 | 1 | 100% | 4h | 250 |
| Celebration modal | 800 | 3 | 90% | 5h | 432 |
| Emotional sparkles | 600 | 2 | 80% | 4h | 240 |
| Hover lift+glow | 1000 | 1 | 100% | 3h | 333 |
| Shake animation | 700 | 1 | 100% | 3h | 233 |
| Wizard onboarding | 800 | 4 | 80% | 12h | 213 |

**Orden recomendado (por RICE score):**
1. Estandarizar border radius (1000)
2. Prompts sugeridos (540)
3. Loading states (450)
4. Celebration modal (432)
5. Hover lift+glow (333)
6. Message send animation (250)
7. Emotional sparkles (240)
8. Shake animation (233)
9. Haptic feedback (213)
10. Wizard onboarding (213)
11. Command palette (70)

---

## 🚀 DEPLOYMENT

### Pre-Deploy Checklist

```bash
# 1. Run all tests
npm run test

# 2. Build locally
npm run build

# 3. Check bundle size
npm run analyze

# 4. Lighthouse score (must be >90)
npx lighthouse http://localhost:3000 --view

# 5. Visual regression tests (if Chromatic setup)
npx chromatic --project-token=YOUR_TOKEN

# 6. Verify animations respect prefers-reduced-motion
# DevTools → Rendering → Emulate CSS media prefers-reduced-motion

# 7. Test on real devices:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Desktop (Chrome, Firefox, Safari)
```

### Feature Flags

```typescript
// lib/feature-flags.ts

export const features = {
  suggestedPrompts: true,
  hapticFeedback: true,
  commandPalette: true,
  celebrationModal: true,
  wizardOnboarding: false, // Beta
} as const;

// Usage:
if (features.commandPalette) {
  return <CommandPalette />;
}
```

---

## 📝 NOTAS FINALES

### Consideraciones Importantes

1. **Performance First:** Todas las animaciones deben correr a 60fps
2. **Accessibility:** Respetar `prefers-reduced-motion`
3. **Mobile:** Testear en dispositivos reales, no solo emuladores
4. **Bundle Size:** Mantener JS bundle < 200KB (gzipped)
5. **SEO:** Animaciones no deben bloquear First Contentful Paint

### Próximos Pasos

Después de completar estos sprints:
1. Medir KPIs durante 2 semanas
2. Recopilar feedback cualitativo (encuestas)
3. Iterar sobre los elementos con menor adopción
4. Considerar implementar features de Sprint 11+ (gamificación)

---

**Última actualización:** Enero 2025
**Versión:** 1.0
**Mantenido por:** Equipo de Producto
