# GUÍA DE IMPLEMENTACIÓN - PASO A PASO
## Circuit Prompt AI - Roadmap Técnico Completo

**Versión:** 1.0
**Fecha:** 2025-11-10
**Autor:** Director de IA de Producto

---

## 📋 ÍNDICE RÁPIDO

1. [PRE-LAUNCH: Safety Compliance (2 semanas)](#fase-pre-launch-safety-compliance)
2. [T0: Foundation & Quick Wins (3 semanas)](#fase-t0-foundation--quick-wins)
3. [T1: Differentiation (5 semanas)](#fase-t1-differentiation)
4. [T2: Scale (4 semanas)](#fase-t2-scale)
5. [Testing & Verificación](#testing-y-verificación)
6. [Rollback Plans](#rollback-plans)

---

# FASE PRE-LAUNCH: SAFETY COMPLIANCE

**Timeline:** 2 semanas (80 horas)
**Objetivo:** Compliance legal COPPA/GDPR/DSA
**Bloqueador:** NO LANZAR SIN ESTO

## SEMANA 1: CORE SAFETY SYSTEMS

### DÍA 1-2: Age Verification System (16 horas)

#### Step 1.1: Crear componente Age Gate

```bash
# Crear archivo del componente
touch components/onboarding/AgeGate.tsx
```

**Código completo** (`components/onboarding/AgeGate.tsx`):

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function AgeGate({ onVerified }: { onVerified: () => void }) {
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!birthDate) {
      setError("Por favor ingresa tu fecha de nacimiento");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const date = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();

      // Ajustar si no ha cumplido años este año
      const actualAge = monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
        ? age - 1
        : age;

      if (actualAge < 13) {
        setError(
          "Debes tener al menos 13 años para usar esta plataforma (COPPA compliance)."
        );
        setLoading(false);
        return;
      }

      // Guardar en localStorage
      localStorage.setItem("age_verified", actualAge >= 18 ? "adult" : "minor");
      localStorage.setItem("birth_date", birthDate);
      localStorage.setItem("age_verified_at", new Date().toISOString());

      // Guardar en backend
      await fetch("/api/user/age-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          isAdult: actualAge >= 18,
        }),
      });

      onVerified();
    } catch (error) {
      console.error("Error verifying age:", error);
      setError("Error al verificar edad. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <h2 className="text-2xl font-bold">Verificación de Edad</h2>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Circuit Prompt AI contiene contenido maduro y debe ser usado responsablemente.
          </p>

          {/* Birth Date Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border rounded-lg bg-background"
              required
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded">
            <p>• Debes tener 13+ años para usar la plataforma (COPPA)</p>
            <p>• Debes tener 18+ años para contenido NSFW</p>
            <p>• Tu información es privada y segura</p>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={handleVerify}
          disabled={!birthDate || loading}
          className="w-full"
        >
          {loading ? "Verificando..." : "Verificar y Continuar"}
        </Button>

        {/* Legal */}
        <p className="text-xs text-center text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <a href="/legal/terminos" className="underline">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="/legal/privacidad" className="underline">
            Política de Privacidad
          </a>
        </p>
      </Card>
    </div>
  );
}
```

#### Step 1.2: API endpoint para verificación

```bash
# Crear endpoint
mkdir -p app/api/user/age-verification
touch app/api/user/age-verification/route.ts
```

**Código completo** (`app/api/user/age-verification/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { birthDate, isAdult } = await req.json();

    if (!birthDate) {
      return NextResponse.json(
        { error: "Fecha de nacimiento requerida" },
        { status: 400 }
      );
    }

    // Calcular edad
    const date = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();

    // COPPA compliance: Bloquear <13
    if (age < 13) {
      return NextResponse.json(
        { error: "Debes tener al menos 13 años" },
        { status: 403 }
      );
    }

    // Actualizar usuario
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        birthDate: date,
        ageVerified: true,
        ageVerifiedAt: new Date(),
        isAdult: age >= 18,
      },
    });

    return NextResponse.json({
      success: true,
      isAdult: age >= 18,
    });
  } catch (error) {
    console.error("Error in age verification:", error);
    return NextResponse.json(
      { error: "Error al verificar edad" },
      { status: 500 }
    );
  }
}
```

#### Step 1.3: Actualizar schema de Prisma

```bash
# Editar prisma/schema.prisma
```

**Agregar a modelo User:**

```prisma
model User {
  // ... campos existentes

  // Age Verification
  birthDate      DateTime?
  ageVerified    Boolean   @default(false)
  ageVerifiedAt  DateTime?
  isAdult        Boolean   @default(false)

  // ... resto de campos
}
```

**Aplicar migración:**

```bash
npx prisma migrate dev --name add_age_verification
```

#### Step 1.4: Integrar en layout

```typescript
// app/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { AgeGate } from "@/components/onboarding/AgeGate";
import { useSession } from "next-auth/react";

export default function RootLayout({ children }) {
  const { data: session } = useSession();
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first (client-side cache)
    const verified = localStorage.getItem("age_verified");

    if (verified) {
      setAgeVerified(true);
      setLoading(false);
    } else if (session?.user) {
      // Check backend if logged in
      fetch("/api/user/age-verification")
        .then((res) => res.json())
        .then((data) => {
          if (data.verified) {
            localStorage.setItem("age_verified", data.isAdult ? "adult" : "minor");
            setAgeVerified(true);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} />;
  }

  return <>{children}</>;
}
```

#### Step 1.5: Testing Age Gate

```bash
# Test manual:
# 1. Borrar localStorage
localStorage.clear()

# 2. Recargar página
# 3. Verificar que aparece Age Gate
# 4. Probar con fecha <13 años (debe bloquear)
# 5. Probar con fecha 13-17 años (debe marcar minor)
# 6. Probar con fecha 18+ años (debe marcar adult)
# 7. Verificar que persiste en DB
```

**Test automatizado:**

```bash
# Crear test
touch __tests__/components/AgeGate.test.tsx
```

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgeGate } from "@/components/onboarding/AgeGate";

describe("AgeGate", () => {
  it("blocks users under 13", async () => {
    const onVerified = jest.fn();
    render(<AgeGate onVerified={onVerified} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole("button");

    // Set birth date to 10 years ago
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    fireEvent.change(input, {
      target: { value: tenYearsAgo.toISOString().split("T")[0] },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/al menos 13 años/i)).toBeInTheDocument();
      expect(onVerified).not.toHaveBeenCalled();
    });
  });

  it("allows users 18+", async () => {
    const onVerified = jest.fn();
    render(<AgeGate onVerified={onVerified} />);

    const input = screen.getByLabelText(/fecha de nacimiento/i);
    const button = screen.getByRole("button");

    // Set birth date to 20 years ago
    const twentyYearsAgo = new Date();
    twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

    fireEvent.change(input, {
      target: { value: twentyYearsAgo.toISOString().split("T")[0] },
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onVerified).toHaveBeenCalled();
    });
  });
});
```

```bash
# Ejecutar tests
npm test AgeGate.test.tsx
```

---

### DÍA 3-4: NSFW Consent Flow (24 horas)

#### Step 2.1: Crear componente NSFW Consent

```bash
touch components/onboarding/NSFWConsent.tsx
```

**Código completo** (`components/onboarding/NSFWConsent.tsx`):

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Heart, BookOpen } from "lucide-react";

const CONSENT_VERSION = "1.0";

interface NSFWConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function NSFWConsentFlow({ onAccept, onDecline }: NSFWConsentProps) {
  const [checks, setChecks] = useState({
    over18: false,
    fiction: false,
    notTherapy: false,
    consent: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const handleAccept = async () => {
    if (!allChecked) return;

    try {
      // Save consent to backend
      await fetch("/api/user/nsfw-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          version: CONSENT_VERSION,
        }),
      });

      // Save to localStorage
      localStorage.setItem("nsfw_consent", "true");
      localStorage.setItem("nsfw_consent_version", CONSENT_VERSION);
      localStorage.setItem("nsfw_consent_date", new Date().toISOString());

      onAccept();
    } catch (error) {
      console.error("Error saving NSFW consent:", error);
      alert("Error al guardar preferencias. Intenta de nuevo.");
    }
  };

  const handleDecline = async () => {
    try {
      await fetch("/api/user/nsfw-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: false,
          version: CONSENT_VERSION,
        }),
      });

      localStorage.setItem("nsfw_consent", "false");
      onDecline();
    } catch (error) {
      console.error("Error saving NSFW decline:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full p-8 space-y-6 my-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <h2 className="text-2xl font-bold">Contenido Maduro (NSFW)</h2>
          </div>

          <p className="text-muted-foreground">
            Estás a punto de habilitar contenido para adultos. Por favor, lee y
            confirma lo siguiente:
          </p>
        </div>

        {/* Warning Sections */}
        <div className="space-y-4">
          {/* Warnings */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Advertencias Importantes</h3>
            </div>
            <ul className="text-sm space-y-1 ml-7">
              <li>• Este contenido puede incluir temas maduros y perturbadores</li>
              <li>• Incluye relaciones románticas y situaciones emocionales intensas</li>
              <li>
                • Puede contener comportamientos psicológicamente no saludables
              </li>
              <li>• NO es apropiado para menores de edad</li>
            </ul>
          </div>

          {/* Fiction */}
          <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Es Ficción, No Realidad</h3>
            </div>
            <ul className="text-sm space-y-1 ml-7">
              <li>• Los personajes NO son personas reales</li>
              <li>
                • Las dinámicas NO son modelo de relaciones saludables
              </li>
              <li>
                • Es para entretenimiento y exploración creativa ÚNICAMENTE
              </li>
            </ul>
          </div>

          {/* Not Therapy */}
          <div className="p-4 bg-purple-500/10 border border-purple-500 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">No Es Terapia</h3>
            </div>
            <ul className="text-sm space-y-1 ml-7">
              <li>• Este NO es un servicio de consejería profesional</li>
              <li>
                • Si experimentas crisis, contacta a profesionales reales
              </li>
              <li>• Línea de Crisis (AR): 135 (CABA) | (011) 5275-1135</li>
            </ul>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="over18"
              checked={checks.over18}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, over18: !!checked })
              }
            />
            <label htmlFor="over18" className="text-sm cursor-pointer">
              Confirmo que tengo 18 años o más.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="fiction"
              checked={checks.fiction}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, fiction: !!checked })
              }
            />
            <label htmlFor="fiction" className="text-sm cursor-pointer">
              Entiendo que todo el contenido es ficción y no representa
              relaciones saludables en la vida real.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="notTherapy"
              checked={checks.notTherapy}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, notTherapy: !!checked })
              }
            />
            <label htmlFor="notTherapy" className="text-sm cursor-pointer">
              Entiendo que esto NO es terapia o consejería profesional.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={checks.consent}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, consent: !!checked })
              }
            />
            <label htmlFor="consent" className="text-sm cursor-pointer">
              Doy mi consentimiento informado para acceder a contenido maduro.
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDecline}
            variant="outline"
            className="flex-1"
          >
            No, mantener SFW
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!allChecked}
            className="flex-1"
          >
            Sí, entiendo y acepto
          </Button>
        </div>

        {/* Legal */}
        <p className="text-xs text-center text-muted-foreground">
          Puedes cambiar esta preferencia en cualquier momento desde
          Configuración
        </p>
      </Card>
    </div>
  );
}
```

#### Step 2.2: API endpoint NSFW consent

```bash
mkdir -p app/api/user/nsfw-consent
touch app/api/user/nsfw-consent/route.ts
```

**Código completo** (`app/api/user/nsfw-consent/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { consent, version } = await req.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdult: true, ageVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Check age verification
    if (!user.ageVerified) {
      return NextResponse.json(
        { error: "Debes verificar tu edad primero" },
        { status: 403 }
      );
    }

    // Check if user is adult
    if (consent && !user.isAdult) {
      return NextResponse.json(
        { error: "Debes tener 18+ años para activar NSFW" },
        { status: 403 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        nsfwConsent: consent,
        nsfwConsentDate: consent ? new Date() : null,
        nsfwConsentVersion: consent ? version : null,
      },
    });

    // Log for audit
    console.log(`[NSFW Consent] User ${user.id} ${consent ? "accepted" : "declined"} NSFW content (v${version})`);

    return NextResponse.json({
      success: true,
      nsfwEnabled: consent,
    });
  } catch (error) {
    console.error("Error in NSFW consent:", error);
    return NextResponse.json(
      { error: "Error al guardar consentimiento" },
      { status: 500 }
    );
  }
}

// GET endpoint to check current consent status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        nsfwConsent: true,
        nsfwConsentDate: true,
        nsfwConsentVersion: true,
        isAdult: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      nsfwEnabled: user.nsfwConsent,
      consentDate: user.nsfwConsentDate,
      consentVersion: user.nsfwConsentVersion,
      canEnableNSFW: user.isAdult,
    });
  } catch (error) {
    console.error("Error getting NSFW consent:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}
```

#### Step 2.3: Actualizar Prisma schema

```prisma
model User {
  // ... campos existentes

  // NSFW Consent
  nsfwConsent        Boolean   @default(false)
  nsfwConsentDate    DateTime?
  nsfwConsentVersion String?

  // ... resto de campos
}
```

```bash
npx prisma migrate dev --name add_nsfw_consent
```

#### Step 2.4: Integrar en settings

```bash
# Crear página de settings NSFW
touch app/configuracion/nsfw/page.tsx
```

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NSFWConsentFlow } from "@/components/onboarding/NSFWConsent";

export default function NSFWSettingsPage() {
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canEnable, setCanEnable] = useState(false);

  useEffect(() => {
    fetch("/api/user/nsfw-consent")
      .then((res) => res.json())
      .then((data) => {
        setNsfwEnabled(data.nsfwEnabled);
        setCanEnable(data.canEnableNSFW);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDisable = async () => {
    if (!confirm("¿Seguro que quieres desactivar contenido NSFW?")) return;

    await fetch("/api/user/nsfw-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent: false }),
    });

    setNsfwEnabled(false);
    localStorage.setItem("nsfw_consent", "false");
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Contenido NSFW</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona el acceso a contenido maduro
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Estado Actual</div>
              <div className="text-sm text-muted-foreground">
                {nsfwEnabled ? "Activado" : "Desactivado"}
              </div>
            </div>

            {nsfwEnabled ? (
              <Button onClick={handleDisable} variant="destructive">
                Desactivar NSFW
              </Button>
            ) : canEnable ? (
              <Button onClick={() => setShowConsent(true)}>
                Activar NSFW
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Debes tener 18+ años para activar NSFW
              </p>
            )}
          </div>
        </div>
      </Card>

      {showConsent && (
        <NSFWConsentFlow
          onAccept={() => {
            setNsfwEnabled(true);
            setShowConsent(false);
          }}
          onDecline={() => setShowConsent(false)}
        />
      )}
    </div>
  );
}
```

#### Step 2.5: Testing NSFW Consent

```bash
# Test manual:
# 1. Ir a /configuracion/nsfw
# 2. Verificar que solo users 18+ pueden activar
# 3. Hacer clic en "Activar NSFW"
# 4. Verificar modal con 4 checkboxes
# 5. Verificar que no se puede aceptar sin marcar todos
# 6. Aceptar y verificar que persiste en DB
# 7. Probar desactivar
```

---

### DÍA 5: Output Moderation con OpenAI (12 horas)

#### Step 3.1: Crear módulo de moderación de outputs

```bash
mkdir -p lib/safety
touch lib/safety/output-moderator.ts
```

**Código completo** (`lib/safety/output-moderator.ts`):

```typescript
import OpenAI from "openai";
import { createLogger } from "@/lib/logging/logger";

const log = createLogger("OutputModerator");

// Usar key separada para moderation (gratis, sin límites)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_MODERATION || process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  blocked: boolean;
  category?: string;
  confidence?: number;
  flaggedCategories?: string[];
  reason?: string;
}

export interface ModerationOptions {
  allowNSFW?: boolean; // Si el usuario tiene NSFW consent
  strictMode?: boolean; // Modo estricto para free tier
}

/**
 * Modera el output del LLM antes de enviarlo al usuario
 * Usa OpenAI Moderation API (GRATIS, sin límites)
 */
export async function moderateOutput(
  text: string,
  options: ModerationOptions = {}
): Promise<ModerationResult> {
  const { allowNSFW = false, strictMode = false } = options;

  try {
    const startTime = Date.now();

    // OpenAI Moderation API
    const moderation = await openai.moderations.create({
      input: text,
      model: "text-moderation-latest", // Gratis, más reciente
    });

    const result = moderation.results[0];
    const latency = Date.now() - startTime;

    log.debug({ latency, flagged: result.flagged }, "Moderation check completed");

    // CRITICAL CATEGORIES - Siempre bloquear
    const criticalCategories = [
      "hate/threatening",
      "self-harm/intent",
      "self-harm/instructions",
      "sexual/minors",
      "violence",
      "violence/graphic",
    ];

    const flaggedCritical = criticalCategories.filter(
      (cat) => result.categories[cat as keyof typeof result.categories]
    );

    if (flaggedCritical.length > 0) {
      log.warn(
        {
          categories: flaggedCritical,
          scores: flaggedCritical.map(
            (cat) => result.category_scores[cat as keyof typeof result.category_scores]
          ),
        },
        "CRITICAL content blocked"
      );

      return {
        blocked: true,
        category: flaggedCritical[0],
        confidence: 1.0,
        flaggedCategories: flaggedCritical,
        reason: "Contenido peligroso detectado",
      };
    }

    // NSFW CATEGORIES - Bloquear solo si usuario no tiene consent
    if (!allowNSFW && result.categories.sexual) {
      const confidence = result.category_scores.sexual;

      // Solo bloquear si confidence es alta
      if (confidence > 0.7) {
        log.info({ confidence }, "NSFW content blocked (no consent)");

        return {
          blocked: true,
          category: "sexual",
          confidence,
          reason: "Contenido NSFW sin consentimiento del usuario",
        };
      }
    }

    // STRICT MODE - Más agresivo para free tier
    if (strictMode) {
      const strictCategories = [
        "harassment",
        "harassment/threatening",
        "hate",
      ];

      const flaggedStrict = strictCategories.filter(
        (cat) => result.categories[cat as keyof typeof result.categories]
      );

      if (flaggedStrict.length > 0) {
        return {
          blocked: true,
          category: flaggedStrict[0],
          flaggedCategories: flaggedStrict,
          reason: "Contenido inapropiado (modo estricto)",
        };
      }
    }

    // TODO: Log all checks para analytics
    // await logModerationCheck(text, result, blocked);

    return { blocked: false };
  } catch (error) {
    log.error({ error }, "Moderation API failed");

    // Fail-open (no bloquear por error técnico)
    // En producción, considera fail-closed para safety crítico
    return { blocked: false };
  }
}

/**
 * Batch moderation para múltiples outputs
 */
export async function moderateOutputBatch(
  texts: string[],
  options: ModerationOptions = {}
): Promise<ModerationResult[]> {
  // OpenAI permite hasta 32 inputs en batch
  const results: ModerationResult[] = [];

  for (let i = 0; i < texts.length; i += 32) {
    const batch = texts.slice(i, i + 32);
    const batchResults = await Promise.all(
      batch.map((text) => moderateOutput(text, options))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Classify severity of moderation result
 */
export function getSeverity(result: ModerationResult): "low" | "medium" | "high" | "critical" {
  if (!result.blocked) return "low";

  const criticalCategories = [
    "self-harm/intent",
    "sexual/minors",
    "violence/graphic",
  ];

  if (result.flaggedCategories?.some((cat) => criticalCategories.includes(cat))) {
    return "critical";
  }

  if (result.confidence && result.confidence > 0.9) {
    return "high";
  }

  if (result.confidence && result.confidence > 0.7) {
    return "medium";
  }

  return "low";
}
```

#### Step 3.2: Integrar en message route

```typescript
// app/api/agents/[id]/message/route.ts

import { moderateOutput } from "@/lib/safety/output-moderator";

export async function POST(req: NextRequest) {
  // ... código existente para generar respuesta

  const llmResponse = await hybridOrchestrator.processMessage({
    agentId,
    userId,
    userMessage,
  });

  // ✅ NUEVO: Moderar output antes de enviar
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      nsfwConsent: true,
    },
  });

  const moderationResult = await moderateOutput(
    llmResponse.response.finalResponse,
    {
      allowNSFW: user?.nsfwConsent === true,
      strictMode: user?.plan === "free",
    }
  );

  if (moderationResult.blocked) {
    // Log crítico
    log.error(
      {
        userId,
        agentId,
        category: moderationResult.category,
        confidence: moderationResult.confidence,
        preview: llmResponse.response.finalResponse.substring(0, 100),
      },
      "LLM output blocked by safety filter"
    );

    // Guardar en DB para auditoría
    await prisma.contentViolation.create({
      data: {
        userId,
        contentType: "llm_output",
        contentId: agentId,
        reason: `Output moderation: ${moderationResult.category}`,
        content: llmResponse.response.finalResponse,
        severity: getSeverity(moderationResult),
        action: "blocked",
      },
    });

    // Respuesta genérica de seguridad
    return NextResponse.json({
      response: "Lo siento, no puedo generar ese tipo de contenido. ¿Podemos hablar de otra cosa?",
      blocked: true,
      reason: moderationResult.reason,
    });
  }

  // ✅ Safe - enviar respuesta
  return NextResponse.json({
    response: llmResponse.response.finalResponse,
    emotions: llmResponse.emotionState,
    metadata: llmResponse.metadata,
  });
}
```

#### Step 3.3: Variables de entorno

```bash
# .env
OPENAI_API_KEY_MODERATION=sk-xxx  # Separate key for moderation
# o reusar la existente
OPENAI_API_KEY=sk-xxx
```

#### Step 3.4: Testing Output Moderation

```bash
# Test automatizado
touch __tests__/lib/safety/output-moderator.test.ts
```

```typescript
import { moderateOutput, getSeverity } from "@/lib/safety/output-moderator";

describe("Output Moderation", () => {
  it("blocks self-harm content", async () => {
    const result = await moderateOutput(
      "Here's how to hurt yourself: step 1...",
      { allowNSFW: false }
    );

    expect(result.blocked).toBe(true);
    expect(result.category).toContain("self-harm");
    expect(getSeverity(result)).toBe("critical");
  });

  it("blocks sexual content without consent", async () => {
    const result = await moderateOutput(
      "Explicit sexual content here...",
      { allowNSFW: false }
    );

    expect(result.blocked).toBe(true);
    expect(result.category).toBe("sexual");
  });

  it("allows sexual content with consent", async () => {
    const result = await moderateOutput(
      "Some romantic intimate content...",
      { allowNSFW: true }
    );

    // Puede o no bloquear según el contenido exacto
    // Pero al menos no debería bloquear por categoría sexual solamente
    if (result.blocked) {
      expect(result.category).not.toBe("sexual");
    }
  });

  it("blocks violence/threats", async () => {
    const result = await moderateOutput(
      "I'm going to hurt you violently...",
      { allowNSFW: false }
    );

    expect(result.blocked).toBe(true);
    expect(result.category).toContain("violence");
  });

  it("allows safe content", async () => {
    const result = await moderateOutput(
      "How are you feeling today? I'm here to chat!",
      { allowNSFW: false }
    );

    expect(result.blocked).toBe(false);
  });
});
```

```bash
# Ejecutar tests
npm test output-moderator.test.ts
```

---

## CONTINUACIÓN EN SIGUIENTE MENSAJE...

**Estado actual:** Día 1-5 completados (Age Gate, NSFW Consent, Output Moderation)

**Siguiente:** Día 6-10 (PII Detection, Content Policy, Testing completo)

¿Quieres que continúe con el resto de la implementación? Puedo seguir con:
- DÍA 6-7: PII Detection
- DÍA 8: Content Policy Page
- DÍA 9-10: Testing end-to-end y legal review
- SEMANA 2-3: T0 Quick Wins
- SEMANA 4-8: T1 Differentiation
- Y todo el resto del roadmap con el mismo nivel de detalle

Confirma y sigo escribiendo el documento completo.