# 🔍 Sentry Error Tracking - README

## ¿Qué es esto?

Sistema completo de **error tracking, performance monitoring y user feedback** usando Sentry para detectar y diagnosticar problemas en producción.

## 📦 Estado: ✅ LISTO PARA USAR

Todo está configurado y listo. Solo necesitas crear una cuenta en Sentry (gratis) y añadir 3 variables de entorno.

---

## 🚀 Quick Start (5 minutos)

### Paso 1: Crear cuenta en Sentry (2 min)

1. Ve a **https://sentry.io/signup**
2. Crea una cuenta gratuita (con GitHub o email)
3. Crea tu organización (ej: "tu-nombre")
4. Crea un proyecto:
   - Selecciona **"Next.js"** como plataforma
   - Nombre: "circuit-prompt-ai"
5. Copia el **DSN** que te muestra (algo como: `https://abc123@o456.ingest.sentry.io/789`)

### Paso 2: Configurar variables (1 min)

Crea un archivo `.env.local` con:

```bash
NEXT_PUBLIC_SENTRY_DSN="https://TU_KEY_AQUI@o123456.ingest.sentry.io/7654321"
SENTRY_ORG="tu-organizacion"
SENTRY_PROJECT="circuit-prompt-ai"
```

### Paso 3: Probar (2 min)

Inicia el servidor de desarrollo:

```bash
npm run dev
```

En cualquier página, abre la consola y ejecuta:

```javascript
throw new Error("Test de Sentry");
```

Ve a tu dashboard de Sentry → Deberías ver el error 🎉

---

## ✨ Features Incluidas

### 1. Error Tracking Automático
Todos los errores se capturan automáticamente (frontend y backend) con:
- Stack trace completo
- Información del usuario
- URL y contexto
- Session replay del error

### 2. Performance Monitoring
Monitorea automáticamente:
- Tiempo de respuesta de API routes
- Queries de base de datos
- Operaciones de AI/LLM
- Rendering de componentes

### 3. User Feedback
Los usuarios pueden reportar bugs directamente desde la app:
- Botón flotante en la esquina inferior derecha
- Dialog con captura de pantalla
- Asociación automática con errores

### 4. Breadcrumbs
Tracking automático de:
- Navegación entre páginas
- Clicks y interacciones
- Llamadas a API
- Operaciones de base de datos

---

## 📖 Cómo Usar

### En API Routes

```typescript
// app/api/worlds/route.ts
import { withSentryMonitoring } from "@/lib/sentry";
import { NextRequest, NextResponse } from "next/server";

export const GET = withSentryMonitoring(
  async (request: NextRequest) => {
    // Tu código aquí
    const worlds = await prisma.world.findMany();
    return NextResponse.json({ worlds });
  },
  {
    operationName: "GET /api/worlds",
    trackPerformance: true,
  }
);
```

### En Componentes React

```typescript
"use client";

import { useSentry } from "@/hooks/useSentry";

export function MyComponent() {
  const { captureError, trackClick } = useSentry();

  const handleAction = async () => {
    try {
      trackClick("create-button");
      await createSomething();
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, {
          operation: "createSomething",
          metadata: { /* contexto adicional */ },
        });
      }
    }
  };

  return <button onClick={handleAction}>Create</button>;
}
```

### User Feedback

Añade el botón de feedback en tu layout:

```typescript
// app/layout.tsx
import { FeedbackButton } from "@/components/sentry/FeedbackButton";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <FeedbackButton /> {/* Botón flotante para reportar bugs */}
      </body>
    </html>
  );
}
```

---

## 📊 Dashboard de Sentry

Una vez configurado, en tu dashboard verás:

1. **Issues** - Todos los errores con detalles
2. **Performance** - Métricas de performance (API, DB, etc.)
3. **User Feedback** - Reportes de usuarios
4. **Replays** - Reproducciones de sesiones con errores

---

## 🎯 Utilidades Específicas

### Para Errores de Database

```typescript
import { captureDatabaseError } from "@/lib/sentry";

try {
  await prisma.user.create({ data: userData });
} catch (error) {
  if (error instanceof Error) {
    captureDatabaseError(error, {
      operation: "create",
      model: "User",
    });
  }
  throw error;
}
```

### Para Errores de AI/LLM

```typescript
import { captureAIError } from "@/lib/sentry";

try {
  const response = await llm.chat(prompt);
} catch (error) {
  if (error instanceof Error) {
    captureAIError(error, {
      provider: "openrouter",
      model: "llama-3.2",
      operation: "chat",
      promptLength: prompt.length,
    });
  }
  throw error;
}
```

### Para Medir Performance

```typescript
import { measurePerformance } from "@/lib/sentry";

const result = await measurePerformance(
  "World Simulation",
  "world.simulate",
  async () => {
    return await simulateWorld(worldId);
  }
);
```

---

## 📚 Documentación Completa

- **Quick Start**: `/docs/SENTRY_QUICK_START.md`
- **Guía Completa**: `/docs/SENTRY_MONITORING.md`
- **Ejemplos de Integración**: `/docs/SENTRY_INTEGRATION_EXAMPLES.md`
- **Checklist de Deploy**: `/SENTRY_DEPLOYMENT_CHECKLIST.md`

---

## 💰 Free Tier

El plan gratuito de Sentry incluye:
- 5,000 errores/mes
- 10,000 transacciones/mes
- 50 session replays/mes
- 1 miembro del equipo

Con nuestra configuración (10% sampling en producción), deberías mantenerte dentro del free tier fácilmente.

---

## 🔧 Configuración Avanzada (Opcional)

### Alertas por Email/Slack

1. Ve a tu proyecto en Sentry → **Alerts**
2. Click **"Create Alert"**
3. Configura:
   - **Condición**: Error count > 10 in 1 minute
   - **Acción**: Send notification to email
4. Guarda

### Integración con Slack

1. Sentry → Settings → Integrations → Slack
2. Conecta tu workspace
3. Selecciona canal (ej: #alerts)
4. Configura qué eventos enviar

### Source Maps (para producción)

Para que los stack traces sean legibles en producción:

1. Ve a Sentry → Settings → Account → API → Auth Tokens
2. Crea token con scopes: `project:releases`, `project:write`
3. Añade a variables de entorno:
   ```bash
   SENTRY_AUTH_TOKEN="tu_token_aqui"
   ```

Los source maps se subirán automáticamente en cada build.

---

## ❓ Troubleshooting

**No veo errores en Sentry:**
- Verifica que `NEXT_PUBLIC_SENTRY_DSN` esté en `.env.local`
- Recarga la app completamente
- Revisa la consola del browser por errores

**Los stack traces no son legibles:**
- Añade `SENTRY_AUTH_TOKEN` para source maps
- Rebuild la aplicación

**Muchos errores/transacciones:**
- Reduce el sample rate en los configs
- Añade más errores a `ignoreErrors`

---

## 🎓 Recursos

- [Sentry Dashboard](https://sentry.io/)
- [Documentación Oficial](https://docs.sentry.io/)
- [Sentry Status](https://status.sentry.io/)

---

## ✅ Checklist Rápido

- [ ] Crear cuenta en Sentry
- [ ] Crear proyecto Next.js
- [ ] Copiar DSN
- [ ] Añadir variables a `.env.local`
- [ ] Hacer test de error
- [ ] Ver error en dashboard
- [ ] Añadir botón de feedback al layout
- [ ] Configurar alertas (opcional)
- [ ] Integrar Slack (opcional)

---

**¡Listo!** Ya tienes error tracking profesional en tu app 🚀

Para más detalles, consulta la [documentación completa](/docs/SENTRY_MONITORING.md).
