# 🚀 Guía Rápida de Implementación UX/UI
**Blaniel - Mejoras Críticas**

---

## 📊 Resumen
- **Problemas críticos:** 4
- **Tiempo total:** 12 días
- **Impacto:** +120% en conversión

---

## 🔴 PRIORIDAD 0 - Críticas

### 1️⃣ Navegación Móvil (2 días)

**Crear:** `components/mobile/BottomNav.tsx`

```tsx
"use client";
import { Home, Bot, MessageSquare, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { icon: Home, label: "Inicio", href: "/dashboard" },
    { icon: Bot, label: "IAs", href: "/dashboard/mundos" },
    { icon: MessageSquare, label: "Chat", href: "/agentes" },
    { icon: Users, label: "Comunidad", href: "/community" },
    { icon: User, label: "Perfil", href: "/configuracion" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                    bg-card/80 backdrop-blur-lg border-t
                    safe-area-inset-bottom">
      <div className="flex justify-around px-2 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg",
                active ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Integrar en:** `app/dashboard/layout.tsx`

```tsx
import { BottomNav } from "@/components/mobile/BottomNav";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

---

### 2️⃣ Constructor Responsive (3 días)

**Modificar:** `app/constructor/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function ConstructorPage() {
  const [tab, setTab] = useState<"chat" | "preview">("chat");

  return (
    <div className="h-screen flex flex-col">
      {/* Tabs móvil */}
      <div className="lg:hidden p-4 border-b">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">💬 Chat</TabsTrigger>
            <TabsTrigger value="preview">👁️ Preview</TabsTrigger>
          </Tabs>
        </Tabs>
      </div>

      {/* Layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className={cn("flex-1", tab === "preview" && "hidden lg:block")}>
          <ConstructorChat />
        </div>
        <div className={cn("w-full lg:w-96 border-l", tab === "chat" && "hidden lg:block")}>
          <PreviewSidebar />
        </div>
      </div>
    </div>
  );
}
```

---

### 3️⃣ Quick Create (5 días)

**Crear:** `components/constructor/QuickCreate.tsx`

```tsx
"use client";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const STEPS = [
  { id: "name", title: "¿Cómo se llama?" },
  { id: "personality", title: "¿Qué personalidad tiene?" },
  { id: "ready", title: "¡Listo!" },
];

export function QuickCreate() {
  const [step, setStep] = useState(0);
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Paso {step + 1} de {STEPS.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Content */}
      <div className="mb-6">
        <h2 className="text-2xl mb-4">{STEPS[step].title}</h2>
        <StepContent step={STEPS[step]} />
      </div>

      {/* Botones editar */}
      {step > 0 && (
        <div className="flex gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
            ✏️ Editar nombre
          </Button>
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              ✏️ Editar personalidad
            </Button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            ← Anterior
          </Button>
        )}
        <Button onClick={() => setStep(step + 1)} className="flex-1">
          {step === STEPS.length - 1 ? "Crear IA 🎉" : "Siguiente →"}
        </Button>
      </div>

      {/* Opciones avanzadas */}
      {step === STEPS.length - 1 && (
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="advanced">
            <AccordionTrigger>⚙️ Opciones Avanzadas</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Modo NSFW</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Traumas</span>
                </label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
```

---

### 4️⃣ Arreglar Tours (2 días)

**Modificar:** `contexts/OnboardingContext.tsx`

```tsx
// ❌ ELIMINAR estas líneas:
useEffect(() => {
  if (activeTour) {
    const handleWheel = (e: WheelEvent) => e.preventDefault();
    window.addEventListener('wheel', handleWheel, { passive: false });
    // ...
  }
}, [activeTour]);

// ✅ AGREGAR scroll suave:
const scrollToTarget = useCallback((targetId: string) => {
  const element = document.querySelector(`[data-tour="${targetId}"]`);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}, []);

useEffect(() => {
  if (currentStep?.target) {
    scrollToTarget(currentStep.target);
  }
}, [currentStep]);
```

---

## 🟠 PRIORIDAD 1 - Altas

### 5️⃣ Accesibilidad (3 días)

**Skip Links en** `app/layout.tsx`:

```tsx
<body>
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50">
    Saltar al contenido
  </a>

  <Navigation />

  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</body>
```

**ARIA labels:**

```bash
# Buscar iconos sin labels
grep -r "<Search" components/ --include="*.tsx" | grep -v "aria-label"
```

```tsx
// ❌ ANTES:
<Button><Search /></Button>

// ✅ DESPUÉS:
<Button aria-label="Buscar">
  <Search aria-hidden="true" />
</Button>
```

---

### 6️⃣ Motion Tokens (1 día)

**Crear:** `lib/motion/tokens.ts`

```typescript
export const motion = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    smooth: [0.4, 0, 0.2, 1],
  },
  spring: {
    responsive: { stiffness: 500, damping: 30 },
  },
} as const;

export const toSeconds = (ms: number) => ms / 1000;
```

**Usar:**

```tsx
import { motion as tokens, toSeconds } from '@/lib/motion/tokens';

<motion.div
  transition={{
    duration: toSeconds(tokens.duration.normal),
    ease: tokens.easing.smooth,
  }}
/>
```

---

### 7️⃣ Filtros Sticky (2 días)

**Modificar:** `app/community/page.tsx`

```tsx
<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
  <Accordion type="single" collapsible defaultValue="filters">
    <AccordionItem value="filters" className="border-none">
      <AccordionTrigger>
        🔍 Filtros {activeCount > 0 && `(${activeCount})`}
      </AccordionTrigger>
      <AccordionContent>
        <FilterButtons />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>
```

---

## ✅ Checklist

### Semana 1-2
- [ ] Crear BottomNav
- [ ] Integrar en layout
- [ ] Tabs en constructor
- [ ] Eliminar preventDefault tours
- [ ] Scroll suave tours

### Semana 3
- [ ] QuickCreate (3 pasos)
- [ ] Progress bar
- [ ] Botones editar pasos
- [ ] Opciones avanzadas (accordion)

### Semana 4
- [ ] Skip links
- [ ] ARIA labels (grep + fix)
- [ ] Motion tokens
- [ ] Filtros sticky

---

## 🧪 Testing Rápido

```bash
# Móvil
# Chrome DevTools > iPhone SE (375px)
✓ Bottom nav visible
✓ Tabs funcionan
✓ Safe area insets

# Constructor
# Tablet (768px)
✓ Tabs switch sin perder estado
✓ Preview actualiza en tiempo real

# Tours
# Iniciar "first-agent"
✓ Puedo scrollear libremente
✓ No hay lag
```

---

## 📈 Métricas

```sql
-- Conversión móvil (Baseline)
SELECT
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT CASE WHEN created_agent THEN user_id END) as converted
FROM user_sessions
WHERE device_type = 'mobile';

-- Comparar después de 2 semanas
-- Target: +40% conversión móvil
```

---

## 🚀 Deploy

```bash
# 1. Deploy a staging
vercel deploy

# 2. Test manual
npm run test:e2e

# 3. Canary 5%
vercel promote [deployment] --scale 5%

# 4. Monitorear 3 días

# 5. Full rollout si OK
vercel promote [deployment] --scale 100%
```

---

**Creado:** 2025-11-10
**Versión:** 1.0 (Resumida)
