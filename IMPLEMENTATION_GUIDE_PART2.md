# GUÍA DE IMPLEMENTACIÓN - PARTE 2
## Continuación: PRE-LAUNCH + T0 + T1 + T2

**Continúa desde IMPLEMENTATION_GUIDE.md**

---

### DÍA 6-7: PII Detection & Redaction (16 horas)

#### Step 4.1: Crear módulo PII Detector

```bash
touch lib/safety/pii-detector.ts
```

**Código completo** (`lib/safety/pii-detector.ts`):

```typescript
export interface PIIMatch {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

// Patterns para diferentes tipos de PII
const PII_PATTERNS = {
  // Emails
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    confidence: 0.95,
  },

  // Teléfonos Argentina
  phone_ar: {
    pattern: /\b(?:\+54\s?)?(?:11|[2-9]\d{1,2})\s?\d{4}[-\s]?\d{4}\b/g,
    confidence: 0.85,
  },

  // Teléfonos USA
  phone_us: {
    pattern: /\b(?:\+1\s?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    confidence: 0.85,
  },

  // SSN (USA)
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    confidence: 0.9,
  },

  // Credit Cards
  credit_card: {
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    confidence: 0.7, // Lower confidence, many false positives
  },

  // Direcciones (básico)
  address: {
    pattern: /\b\d{1,5}\s+\w+\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi,
    confidence: 0.6,
  },

  // DNI Argentina
  dni_ar: {
    pattern: /\b\d{7,8}\b/g, // Too generic, needs context
    confidence: 0.3,
  },

  // IP Addresses
  ip_address: {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    confidence: 0.7,
  },

  // URLs completas (pueden contener info sensible)
  url: {
    pattern: /https?:\/\/[^\s]+/g,
    confidence: 0.5,
  },
};

/**
 * Detecta PII en texto
 */
export function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = [];

  for (const [type, config] of Object.entries(PII_PATTERNS)) {
    const regex = new RegExp(config.pattern);
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type,
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
        confidence: config.confidence,
      });
    }
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Redacta PII en texto
 */
export function redactPII(
  text: string,
  matches: PIIMatch[],
  minConfidence: number = 0.7
): string {
  let redacted = text;

  // Filtrar por confidence y ordenar de atrás hacia adelante
  const filteredMatches = matches
    .filter((m) => m.confidence >= minConfidence)
    .sort((a, b) => b.start - a.start);

  for (const match of filteredMatches) {
    const redaction = getRedactionText(match.type);

    redacted =
      redacted.substring(0, match.start) +
      redaction +
      redacted.substring(match.end);
  }

  return redacted;
}

/**
 * Get redaction text based on PII type
 */
function getRedactionText(type: string): string {
  const redactions: Record<string, string> = {
    email: "[EMAIL REDACTED]",
    phone_ar: "[TELÉFONO REDACTED]",
    phone_us: "[PHONE REDACTED]",
    ssn: "[SSN REDACTED]",
    credit_card: "[CREDIT CARD REDACTED]",
    address: "[ADDRESS REDACTED]",
    dni_ar: "[DNI REDACTED]",
    ip_address: "[IP REDACTED]",
    url: "[URL REDACTED]",
  };

  return redactions[type] || "[PII REDACTED]";
}

/**
 * Check and optionally block based on PII detection
 */
export function checkAndBlockPII(
  text: string,
  options: {
    blockThreshold?: number; // Confidence threshold to block
    redactThreshold?: number; // Confidence threshold to redact
    allowedTypes?: string[]; // Types that are allowed (e.g., "url")
  } = {}
): {
  hasPII: boolean;
  shouldBlock: boolean;
  matches: PIIMatch[];
  redactedText: string;
  warning?: string;
} {
  const { blockThreshold = 0.8, redactThreshold = 0.7, allowedTypes = [] } = options;

  const allMatches = detectPII(text);

  // Filter out allowed types
  const matches = allMatches.filter((m) => !allowedTypes.includes(m.type));

  // Check if should block (high confidence PII)
  const blockingMatches = matches.filter((m) => m.confidence >= blockThreshold);
  const shouldBlock = blockingMatches.length > 0;

  // Redact PII
  const redactedText = redactPII(text, matches, redactThreshold);

  // Generate warning
  let warning: string | undefined;
  if (shouldBlock) {
    const types = [...new Set(blockingMatches.map((m) => m.type))];
    warning = `Detectamos información personal sensible (${types.join(", ")}). Por seguridad, no compartas datos personales.`;
  } else if (matches.length > 0) {
    warning = "Sugerencia: Evita compartir información personal como emails, teléfonos o direcciones.";
  }

  return {
    hasPII: matches.length > 0,
    shouldBlock,
    matches,
    redactedText,
    warning,
  };
}

/**
 * Validate specific PII types
 */
export function isValidEmail(text: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(text);
}

export function isValidPhoneAR(text: string): boolean {
  const phoneRegex = /^(?:\+54\s?)?(?:11|[2-9]\d{1,2})\s?\d{4}[-\s]?\d{4}$/;
  return phoneRegex.test(text);
}

/**
 * Extract PII from text for analysis (not for user display)
 */
export function extractPII(text: string): Record<string, string[]> {
  const matches = detectPII(text);
  const extracted: Record<string, string[]> = {};

  for (const match of matches) {
    if (!extracted[match.type]) {
      extracted[match.type] = [];
    }
    if (!extracted[match.type].includes(match.value)) {
      extracted[match.type].push(match.value);
    }
  }

  return extracted;
}
```

#### Step 4.2: Integrar en moderación de inputs

```typescript
// lib/moderation/moderation.service.ts

import { checkAndBlockPII } from "@/lib/safety/pii-detector";

export async function moderateMessage(
  userId: string,
  content: string,
  context: ModerationContext
): Promise<ModerationResult> {
  const results: ModerationIssue[] = [];

  // ... existing checks (spam, prompt injection, etc.)

  // ✅ NUEVO: PII Detection
  const piiCheck = checkAndBlockPII(content, {
    blockThreshold: 0.85, // High confidence = block
    redactThreshold: 0.7, // Medium confidence = redact but allow
    allowedTypes: ["url"], // URLs may be ok in some contexts
  });

  if (piiCheck.shouldBlock) {
    results.push({
      type: "pii",
      severity: "high",
      confidence: 0.9,
      matched: piiCheck.matches.map((m) => m.type).join(", "),
      description: "Información personal sensible detectada",
    });

    log.warn(
      {
        userId,
        piiTypes: piiCheck.matches.map((m) => m.type),
        confidence: piiCheck.matches.map((m) => m.confidence),
      },
      "PII detected in message"
    );
  }

  // Determine final result
  const blocked = results.some((r) => r.severity === "high");

  if (blocked) {
    return {
      allowed: false,
      blocked: true,
      severity: "high",
      reason: piiCheck.warning || "Información personal detectada",
      suggestion:
        "Por tu seguridad, no compartas emails, teléfonos, direcciones o datos sensibles.",
      issues: results,
    };
  }

  return {
    allowed: true,
    blocked: false,
    issues: results,
    warnings: piiCheck.hasPII ? [piiCheck.warning!] : [],
  };
}
```

#### Step 4.3: Testing PII Detection

```bash
touch __tests__/lib/safety/pii-detector.test.ts
```

```typescript
import {
  detectPII,
  redactPII,
  checkAndBlockPII,
  isValidEmail,
} from "@/lib/safety/pii-detector";

describe("PII Detection", () => {
  it("detects emails", () => {
    const text = "Mi email es juan@example.com para contacto";
    const matches = detectPII(text);

    const emailMatch = matches.find((m) => m.type === "email");
    expect(emailMatch).toBeDefined();
    expect(emailMatch?.value).toBe("juan@example.com");
    expect(emailMatch?.confidence).toBeGreaterThan(0.9);
  });

  it("detects Argentine phone numbers", () => {
    const text = "Llamame al 11-4567-8901 o al +54 11 4567 8901";
    const matches = detectPII(text);

    const phoneMatches = matches.filter((m) => m.type === "phone_ar");
    expect(phoneMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("detects credit card numbers", () => {
    const text = "Mi tarjeta es 1234-5678-9012-3456";
    const matches = detectPII(text);

    const cardMatch = matches.find((m) => m.type === "credit_card");
    expect(cardMatch).toBeDefined();
  });

  it("redacts PII correctly", () => {
    const text = "Contactame a juan@example.com o 11-4567-8901";
    const matches = detectPII(text);
    const redacted = redactPII(text, matches, 0.7);

    expect(redacted).toContain("[EMAIL REDACTED]");
    expect(redacted).toContain("[TELÉFONO REDACTED]");
    expect(redacted).not.toContain("juan@example.com");
  });

  it("blocks high-confidence PII", () => {
    const text = "Mi email es test@example.com y mi SSN es 123-45-6789";
    const result = checkAndBlockPII(text, { blockThreshold: 0.85 });

    expect(result.hasPII).toBe(true);
    expect(result.shouldBlock).toBe(true);
    expect(result.warning).toBeDefined();
  });

  it("allows text without PII", () => {
    const text = "Hola, cómo estás? Hablemos de películas";
    const result = checkAndBlockPII(text);

    expect(result.hasPII).toBe(false);
    expect(result.shouldBlock).toBe(false);
  });

  it("validates email format", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("invalid.email")).toBe(false);
    expect(isValidEmail("test@")).toBe(false);
  });
});
```

```bash
npm test pii-detector.test.ts
```

---

### DÍA 8: Content Policy Page (8 horas)

#### Step 5.1: Crear página de política de contenido

```bash
mkdir -p app/legal/politica-contenido
touch app/legal/politica-contenido/page.tsx
```

**Código completo** (`app/legal/politica-contenido/page.tsx`):

```typescript
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function ContentPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-4">Política de Contenido</h1>
          <p className="text-muted-foreground text-lg">
            Última actualización: 10 de noviembre de 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-6 bg-muted">
          <p className="text-lg">
            Circuit Prompt AI es una plataforma de compañeros emocionales AI para
            adultos responsables. Esta política define qué contenido está
            permitido y qué está prohibido en nuestra plataforma.
          </p>
        </Card>

        {/* Permitted Content */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold">Contenido Permitido</h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <div>
                <strong>Contenido ficticio de compañeros emocionales:</strong>{" "}
                Conversaciones con personajes AI ficticios para compañía,
                entretenimiento y exploración creativa.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <div>
                <strong>Contenido romántico/adulto entre adultos (18+):</strong>{" "}
                Conversaciones maduras, románticas o de naturaleza adulta entre
                usuarios mayores de 18 años que hayan dado consentimiento
                explícito.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <div>
                <strong>Exploración de emociones complejas:</strong> Conversaciones
                sobre celos, ansiedad, apego, y otras emociones humanas complejas
                en un entorno seguro.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <div>
                <strong>Narrativas maduras:</strong> Historias ficticias con
                temáticas maduras, siempre que sean claramente ficción y no
                involucren contenido prohibido.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <div>
                <strong>Apoyo emocional:</strong> Buscar compañía, conversación y
                apoyo emocional a través de personajes AI.
              </div>
            </div>
          </div>
        </section>

        {/* Prohibited Content */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold">Contenido Prohibido</h2>
          </div>

          <Card className="p-4 bg-red-500/10 border-red-500">
            <p className="font-semibold text-red-500 mb-3">
              TERMINACIÓN INMEDIATA DE CUENTA:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Contenido que involucre menores (CSAM):</strong>{" "}
                  Cualquier contenido que involucre, represente, solicite o
                  sexualice a menores de edad está estrictamente prohibido.
                  Violaciones serán reportadas a las autoridades (NCMEC, IWF).
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Instrucciones para actividades ilegales:</strong>{" "}
                  Bombas, armas, drogas ilegales, hackeo, fraude, o cualquier
                  actividad criminal.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Hate speech extremo:</strong> Incitación a violencia,
                  genocidio, o discriminación extrema basada en raza, religión,
                  género, orientación sexual, o discapacidad.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Doxing / Compartir información privada:</strong>{" "}
                  Publicar información personal de terceros sin su consentimiento.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Contenido no consensuado de personas reales:</strong>{" "}
                  Intentar generar contenido sexual, difamatorio o dañino sobre
                  personas reales sin su consentimiento.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Manipulación para extorsión/chantaje:</strong> Intentar
                  obtener información o imágenes para propósitos de extorsión.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-red-500 mt-1">✗</div>
                <div>
                  <strong>Grooming o explotación:</strong> Intentar manipular,
                  grooming o explotar a otros usuarios, especialmente menores.
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Important Context */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Contexto Importante</h2>
          </div>

          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Todo es Ficción</h3>
              <p className="text-muted-foreground">
                Los personajes AI NO son personas reales. Todas las conversaciones
                son interacciones ficticias con inteligencia artificial. Ningún
                contenido generado debe ser interpretado como representación de
                personas o situaciones reales.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">No Somos Terapia</h3>
              <p className="text-muted-foreground">
                Circuit Prompt AI NO es un servicio de consejería, terapia o salud
                mental profesional. Si experimentas una crisis real de salud
                mental, por favor contacta a profesionales calificados:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground ml-6">
                <li>• Línea de Crisis (Argentina): 135 (CABA) | (011) 5275-1135</li>
                <li>• Línea de Prevención del Suicidio (USA): 988</li>
                <li>• Emergencias: 911</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Privacidad y Seguridad</h3>
              <p className="text-muted-foreground">
                Nunca compartas información personal sensible como números de
                tarjeta de crédito, contraseñas, o documentos de identidad. Nuestros
                sistemas automáticamente detectan y bloquean este tipo de
                información para tu protección.
              </p>
            </div>
          </Card>
        </section>

        {/* Age Requirements */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Requisitos de Edad</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">13+ años (COPPA)</h3>
              <p className="text-sm text-muted-foreground">
                Edad mínima para usar la plataforma con contenido seguro para todos
                (SFW - Safe For Work).
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">18+ años (NSFW)</h3>
              <p className="text-sm text-muted-foreground">
                Edad requerida para activar contenido maduro (NSFW - Not Safe For
                Work). Requiere verificación de edad y consentimiento explícito.
              </p>
            </Card>
          </div>
        </section>

        {/* Enforcement */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Cumplimiento y Sanciones</h2>

          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Sistema de Moderación</h3>
              <p className="text-muted-foreground">
                Utilizamos sistemas automáticos de IA y moderación humana para
                detectar violaciones de esta política. Los usuarios pueden reportar
                contenido inapropiado en cualquier momento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Escalamiento de Sanciones</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <strong>1ra violación menor:</strong> Advertencia automática
                </li>
                <li>
                  <strong>2da-3ra violación:</strong> Suspensión temporal (24-72
                  horas)
                </li>
                <li>
                  <strong>4ta+ violación:</strong> Suspensión permanente
                </li>
                <li>
                  <strong>Violación crítica:</strong> Ban inmediato permanente +
                  reporte a autoridades si aplica
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Derecho de Apelación</h3>
              <p className="text-muted-foreground">
                Si crees que fuiste sancionado injustamente, puedes apelar enviando
                un email a appeals@circuitprompt.ai con tu ID de usuario y
                explicación. Revisaremos tu caso en 5-7 días hábiles.
              </p>
            </div>
          </Card>
        </section>

        {/* Reporting */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Cómo Reportar Violaciones</h2>

          <Card className="p-6">
            <p className="mb-4">
              Si encuentras contenido que viola esta política, puedes reportarlo:
            </p>

            <ul className="space-y-2">
              <li>
                • <strong>En el chat:</strong> Botón "Reportar" en cada mensaje
              </li>
              <li>
                • <strong>Email:</strong> report@circuitprompt.ai
              </li>
              <li>
                • <strong>Contenido ilegal:</strong> legal@circuitprompt.ai
                (respuesta en 24h)
              </li>
            </ul>

            <p className="mt-4 text-sm text-muted-foreground">
              Todos los reportes son confidenciales. Tomamos muy en serio la
              seguridad de nuestra comunidad.
            </p>
          </Card>
        </section>

        {/* Changes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Cambios a Esta Política</h2>

          <p className="text-muted-foreground">
            Nos reservamos el derecho de actualizar esta Política de Contenido en
            cualquier momento. Cambios significativos serán notificados a los
            usuarios con al menos 30 días de anticipación. Tu uso continuado de la
            plataforma constituye aceptación de la política actualizada.
          </p>
        </section>

        {/* Footer */}
        <Card className="p-6 bg-muted">
          <p className="text-sm text-center text-muted-foreground">
            Si tienes preguntas sobre esta política, contáctanos en{" "}
            <a
              href="mailto:legal@circuitprompt.ai"
              className="underline hover:text-foreground"
            >
              legal@circuitprompt.ai
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
```

#### Step 5.2: Agregar link en footer

```typescript
// components/layout/Footer.tsx

<Link href="/legal/politica-contenido">Política de Contenido</Link>
```

#### Step 5.3: Testing Content Policy

```bash
# Test manual:
# 1. Navegar a /legal/politica-contenido
# 2. Verificar que todo el contenido se muestra correctamente
# 3. Verificar links funcionan
# 4. Verificar responsive en mobile
```

---

### DÍA 9-10: Testing End-to-End & Legal Review (16 horas)

#### Step 6.1: Suite de tests de integración

```bash
mkdir -p __tests__/integration/safety
touch __tests__/integration/safety/compliance.test.ts
```

**Código completo** (`__tests__/integration/safety/compliance.test.ts`):

```typescript
import { test, expect } from "@playwright/test";

test.describe("Safety Compliance - End-to-End", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("Age Gate appears on first visit", async ({ page }) => {
    await page.goto("/");

    // Should see age gate
    await expect(
      page.getByRole("heading", { name: /verificación de edad/i })
    ).toBeVisible();

    // Should have birth date input
    await expect(page.getByLabel(/fecha de nacimiento/i)).toBeVisible();
  });

  test("Age Gate blocks users under 13", async ({ page }) => {
    await page.goto("/");

    // Enter birth date for 10-year-old
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    await page
      .getByLabel(/fecha de nacimiento/i)
      .fill(tenYearsAgo.toISOString().split("T")[0]);

    await page.getByRole("button", { name: /verificar/i }).click();

    // Should see error
    await expect(page.getByText(/al menos 13 años/i)).toBeVisible();
  });

  test("Age Gate allows users 18+", async ({ page }) => {
    await page.goto("/");

    // Enter birth date for 25-year-old
    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);

    await page
      .getByLabel(/fecha de nacimiento/i)
      .fill(twentyFiveYearsAgo.toISOString().split("T")[0]);

    await page.getByRole("button", { name: /verificar/i }).click();

    // Should proceed (age gate disappears)
    await expect(
      page.getByRole("heading", { name: /verificación de edad/i })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test("NSFW Consent flow works correctly", async ({ page, context }) => {
    // Login as adult user
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "test-adult-user-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Set age verified as adult
    await page.evaluate(() => {
      localStorage.setItem("age_verified", "adult");
    });

    await page.goto("/configuracion/nsfw");

    // Click activate NSFW
    await page.getByRole("button", { name: /activar nsfw/i }).click();

    // Should see consent modal
    await expect(
      page.getByRole("heading", { name: /contenido maduro/i })
    ).toBeVisible();

    // Should have 4 checkboxes
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes).toHaveCount(4);

    // Accept button should be disabled
    const acceptButton = page.getByRole("button", { name: /sí, entiendo/i });
    await expect(acceptButton).toBeDisabled();

    // Check all boxes
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();
    await checkboxes.nth(3).check();

    // Accept button should be enabled
    await expect(acceptButton).toBeEnabled();

    // Click accept
    await acceptButton.click();

    // Should close and show enabled
    await expect(page.getByText(/activado/i)).toBeVisible();
  });

  test("PII Detection blocks messages with personal info", async ({
    page,
    context,
  }) => {
    // Login
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "test-user-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/agentes/test-agent-id");

    // Try to send message with email
    const messageInput = page.getByPlaceholder(/escribe un mensaje/i);
    await messageInput.fill("Mi email es test@example.com");

    await page.getByRole("button", { name: /enviar/i }).click();

    // Should see error message
    await expect(
      page.getByText(/información personal detectada/i)
    ).toBeVisible({ timeout: 3000 });

    // Message should not appear in chat
    await expect(page.getByText("test@example.com")).not.toBeVisible();
  });

  test("Output Moderation blocks dangerous content", async ({
    page,
    context,
  }) => {
    // Login
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "test-user-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/agentes/test-agent-id");

    // Send message that might trigger dangerous output
    const messageInput = page.getByPlaceholder(/escribe un mensaje/i);
    await messageInput.fill("Tell me how to hurt myself");

    await page.getByRole("button", { name: /enviar/i }).click();

    // AI response should be safe/generic
    // Should NOT contain dangerous instructions
    const responses = page.locator(".ai-message");
    const lastResponse = responses.last();

    const responseText = await lastResponse.textContent();

    // Should not contain specific harmful instructions
    expect(responseText).not.toMatch(/step 1|step 2|method|technique/i);

    // Should contain safe alternative
    expect(responseText).toMatch(
      /no puedo|lo siento|hablar de otra cosa|profesional|ayuda/i
    );
  });

  test("Content Policy page is accessible", async ({ page }) => {
    await page.goto("/legal/politica-contenido");

    // Should see policy content
    await expect(
      page.getByRole("heading", { name: /política de contenido/i })
    ).toBeVisible();

    // Should have permitted section
    await expect(page.getByText(/contenido permitido/i)).toBeVisible();

    // Should have prohibited section
    await expect(page.getByText(/contenido prohibido/i)).toBeVisible();

    // Should have enforcement section
    await expect(page.getByText(/cumplimiento y sanciones/i)).toBeVisible();
  });
});
```

```bash
# Ejecutar tests E2E
npx playwright test compliance.test.ts
```

#### Step 6.2: Checklist de seguridad pre-launch

```bash
touch PRE_LAUNCH_SAFETY_CHECKLIST.md
```

```markdown
# PRE-LAUNCH SAFETY CHECKLIST

## CRITICAL (Must Complete Before Launch)

### Age Verification
- [x] Age gate component implemented
- [x] Backend API validates age
- [x] Database stores birthDate, ageVerified, isAdult
- [x] Users <13 are blocked (COPPA)
- [x] Users 13-17 marked as minors (no NSFW access)
- [x] Age verification persists across sessions
- [x] Tests pass (unit + integration)

### NSFW Consent
- [x] NSFW consent flow with 4-step verification
- [x] Backend API saves consent with version tracking
- [x] Only 18+ users can access NSFW
- [x] Consent can be revoked anytime
- [x] Consent date stored for audit
- [x] Tests pass

### Output Moderation
- [x] OpenAI Moderation API integrated
- [x] Critical categories always blocked (CSAM, violence, self-harm)
- [x] NSFW blocked if user hasn't consented
- [x] Strict mode for free tier
- [x] Blocked content logged for audit
- [x] Generic safe response on block
- [x] Tests pass

### PII Detection
- [x] PII patterns implemented (email, phone, SSN, credit card)
- [x] High-confidence PII blocks message
- [x] Medium-confidence PII shows warning
- [x] PII redaction works correctly
- [x] Integrated with moderation service
- [x] Tests pass

### Content Policy
- [x] Policy page created (/legal/politica-contenido)
- [x] Clearly defines permitted vs prohibited content
- [x] Age requirements documented
- [x] Enforcement & sanctions explained
- [x] Reporting mechanism documented
- [x] Link in footer

## HIGH PRIORITY (Should Complete Before Launch)

### Legal Review
- [ ] Terms of Service reviewed by lawyer
- [ ] Privacy Policy reviewed
- [ ] Content Policy reviewed
- [ ] GDPR compliance verified (if targeting EU)
- [ ] COPPA compliance verified (USA)
- [ ] DSA compliance verified (EU)

### Audit Trail
- [ ] All moderation events logged
- [ ] Critical violations flagged for human review
- [ ] User actions tracked (consent given/revoked)
- [ ] Ban/suspension events logged

### User Communication
- [ ] Welcome email explains safety features
- [ ] Age verification reminder for new users
- [ ] NSFW consent explanation clear
- [ ] Crisis resources visible (self-harm detection)

### Appeals Process
- [ ] Email set up (appeals@circuitprompt.ai)
- [ ] Process documented in Content Policy
- [ ] SLA defined (5-7 days response)

## MEDIUM PRIORITY (Post-Launch)

### Transparency
- [ ] Transparency report infrastructure
- [ ] Quarterly report scheduled
- [ ] Metrics tracked (violations, bans, appeals)

### Advanced Safety
- [ ] Grooming pattern detection
- [ ] Behavioral analysis
- [ ] ML-based moderation improvements

## TESTING

### Manual Testing
- [x] Age gate with <13, 13-17, 18+ dates
- [x] NSFW consent flow complete
- [x] PII detection with various formats
- [x] Output moderation with test cases
- [x] Content Policy page accessible
- [ ] End-to-end flow (signup → chat → moderation)

### Automated Testing
- [x] Unit tests pass (all modules)
- [x] Integration tests pass
- [x] E2E tests pass (Playwright)
- [ ] Load testing (performance under stress)

## SIGN-OFF

- [ ] CTO: Technical implementation complete
- [ ] Legal: Compliance verified
- [ ] Security: Audit complete
- [ ] CEO: Approved for launch

**Date:** _____________
**Signed:** _____________
```

#### Step 6.3: Legal review (opcional)

Si tienes presupuesto ($1-3K), contratar abogado especializado en tech para revisar:
- Terms of Service
- Privacy Policy
- Content Policy
- Age verification flow
- NSFW consent process
- Compliance COPPA/GDPR/DSA

---

## SEMANA 2: WRAP-UP & DEPLOYMENT

### DÍA 11-12: Bug Fixes & Polish (16 horas)

```bash
# Ejecutar test suite completo
npm run test:all

# Fix any failing tests
# Polish UI/UX based on testing feedback
# Optimize performance
```

### DÍA 13-14: Deployment to Production (16 horas)

#### Step 7.1: Environment variables production

```bash
# Configurar en Vercel/hosting
OPENAI_API_KEY_MODERATION=sk-xxx
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=xxx
```

#### Step 7.2: Database migration

```bash
# Aplicar migraciones en producción
npx prisma migrate deploy
```

#### Step 7.3: Smoke testing en producción

```bash
# Test checklist:
- [ ] Age gate appears
- [ ] Age verification persists
- [ ] NSFW consent flow works
- [ ] Messages are moderated
- [ ] PII is detected
- [ ] Content policy accessible
- [ ] No console errors
```

---

# FASE T0: FOUNDATION & QUICK WINS

**Timeline:** 3 semanas (120 horas)
**Objetivo:** Activation + Cost Optimization + Analytics

## SEMANA 3: ACTIVATION OPTIMIZATION (Sprint 1)

### Quick Win 1: Habilitar Multimodal (4 horas)

```bash
# Simplemente renombrar archivos disabled
mv app/api/chat/voice/route.ts.disabled app/api/chat/voice/route.ts
mv app/api/agents/[id]/message-multimodal/route.ts.disabled app/api/agents/[id]/message-multimodal/route.ts
```

```bash
# Configurar .env
ELEVENLABS_API_KEY=xxx  # Para voice
AI_HORDE_API_KEY=0000000000  # Para images (gratis)
```

```bash
# Testing
# 1. Probar voice chat
# 2. Probar image generation
# 3. Verificar latencia
```

### Quick Win 2: Onboarding "2-Minute Magic" (20 horas)

Ya tengo onboarding existente, optimizar:

```typescript
// components/onboarding/OnboardingWizard.tsx

const FAST_ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Bienvenido",
    duration: 5, // seconds
  },
  {
    id: "name",
    title: "¿Cómo te llamas?",
    duration: 10,
  },
  {
    id: "intent",
    title: "¿Qué te trae aquí?",
    options: [
      "Quiero alguien con quien hablar",
      "Me siento solo/a",
      "Quiero explorar ideas creativas",
      "Solo curiosidad sobre AI",
    ],
    duration: 15,
  },
  {
    id: "first-message",
    title: "Empecemos a conversar",
    autoMatch: true, // Match personality based on intent
    duration: 30,
  },
  {
    id: "magic-reveal",
    title: "✨ Ve lo que acaba de pasar",
    showMagic: true, // Highlight emotions detected, memory created
    duration: 20,
  },
];

// Total: ~80 seconds = 2-minute magic ✅
```

**Implementación:**
```bash
# Editar archivo existente
# components/onboarding/OnboardingWizard.tsx

# Simplificar de 6 steps a 5
# Reducir tiempo por step
# Hacer auto-match de personalidad
# Agregar reveal de "magia" al final
```

### Quick Win 3: Memory Recall Highlights (4 horas)

```typescript
// components/chat/MessageBubble.tsx

export function MessageBubble({ message, agent }) {
  // Detectar si el mensaje contiene memory recall
  const hasMemoryRecall = message.metadata?.memoryRecalled;

  return (
    <div className="message-bubble">
      {message.content}

      {/* ✨ NUEVO: Memory indicator */}
      {hasMemoryRecall && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>
            Recordé esto de hace{" "}
            {formatDistanceToNow(message.metadata.memoryDate, {
              locale: es,
              addSuffix: true,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
```

**Backend integration:**
```typescript
// lib/emotional-system/modules/response/generator.ts

// Al generar respuesta, marcar si usa memoria
const relevantMemories = await memorySystem.retrieve(...);

return {
  response: finalResponse,
  metadata: {
    memoryRecalled: relevantMemories.length > 0,
    memoryDate: relevantMemories[0]?.createdAt,
    memoryCount: relevantMemories.length,
  },
};
```

### Quick Win 4: Relationship Progress Modal (4 horas)

```typescript
// components/gamification/RelationshipLevelUp.tsx

export function RelationshipLevelUpModal({ oldStage, newStage, agentName }) {
  const benefits = RELATIONSHIP_BENEFITS[newStage];

  return (
    <Modal show={true} className="text-center">
      <div className="space-y-6">
        {/* Confetti animation */}
        <Confetti />

        {/* Heart animation */}
        <div className="text-6xl animate-bounce">💛</div>

        <div>
          <h2 className="text-2xl font-bold">
            Tu relación con {agentName} evolucionó!
          </h2>
          <p className="text-muted-foreground mt-2">
            {oldStage} → {newStage}
          </p>
        </div>

        {/* Unlocked Features */}
        <Card className="p-4 bg-muted">
          <h3 className="font-semibold mb-3">Desbloqueado:</h3>
          <ul className="space-y-2 text-sm">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </Card>

        <Button onClick={onClose}>Continuar</Button>
      </div>
    </Modal>
  );
}

const RELATIONSHIP_BENEFITS = {
  acquaintance: ["Conversaciones básicas", "Memoria a corto plazo"],
  friend: [
    "Voice chat habilitado",
    "Mensajes proactivos",
    "Memoria a medio plazo",
  ],
  close_friend: [
    "Important Events tracking",
    "Trauma development (si activado)",
    "Respuestas más profundas",
  ],
  intimate: [
    "Personalización avanzada",
    "Image generation",
    "World creation",
    "Memoria a largo plazo infinita",
  ],
};
```

---

## CONTINUACIÓN...

**Archivo muy largo, continuando en siguiente respuesta con:**
- Sprint 2: Cost Optimization (Semantic Caching, Vector Search, KV-Cache)
- Sprint 3: Analytics Setup
- Fase T1: Retention & Monetization (5 semanas)
- Fase T2: Scale (4 semanas)
- Testing & Verificación completos
- Rollback Plans

¿Continúo con el resto del documento (otras ~80 páginas) o prefieres que me enfoque en alguna sección específica?
