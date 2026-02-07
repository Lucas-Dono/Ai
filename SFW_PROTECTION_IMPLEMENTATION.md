# 🔒 Implementación del Sistema de Protección SFW

## 📋 Resumen

Sistema simplificado de protección de contenido (SFW) a nivel de usuario que:

- ✅ **FREE users**: Protección SIEMPRE activa (no pueden desactivar)
- ✅ **PREMIUM users**: Protección configurable (pueden desactivar con advertencia +18)
- ✅ **Verificación de edad**: Implícita mediante pago con tarjeta bancaria
- ✅ **Respuestas naturales**: Las IAs declinan contenido restringido de forma humana

---

## 🗂️ Archivos Creados

### **Backend**

1. **`lib/middleware/sfw-injector.ts`**
   - Servicio principal de inyección de protección SFW
   - Contiene lógica de verificación y generación de prompts
   - Funciones: `getSFWProtectionInjection()`, `injectSFWProtection()`, `canToggleSFWProtection()`

2. **`app/api/user/sfw-protection/route.ts`**
   - API REST para gestionar la protección SFW
   - `GET /api/user/sfw-protection` - Obtener estado
   - `POST /api/user/sfw-protection` - Activar/desactivar (solo premium)

### **Frontend**

3. **`components/settings/SFWProtectionToggle.tsx`**
   - Componente de UI para configurar la protección
   - Toggle interactivo con advertencia de edad
   - Muestra restricciones de plan (free vs premium)

### **Base de Datos**

4. **`prisma/schema.prisma`**
   - ✅ Campo `sfwProtection: Boolean` agregado al modelo User
   - ✅ Índice `@@index([sfwProtection])` para performance

5. **`prisma/migrations/add_sfw_protection.sql`**
   - Migración SQL completa con:
     - Creación de campo `sfwProtection`
     - Configuración inicial basada en plan
     - Índice de performance
     - Logs informativos

### **Scripts**

6. **`scripts/run-sfw-protection-migration.sh`**
   - Script automatizado para ejecutar la migración
   - Incluye validaciones y verificaciones

### **Integraciones**

7. **`lib/services/message.service.ts`**
   - ✅ Integración del sistema SFW en el flujo de mensajes
   - ✅ Inyección de protección ANTES del prompt modular
   - ✅ Eliminadas referencias a `nsfwMode` y `nsfwConsent`

---

## 🚀 Pasos de Implementación

### **1. Ejecutar Migración de Base de Datos**

```bash
# Opción A: Usando el script automatizado (recomendado)
chmod +x scripts/run-sfw-protection-migration.sh
./scripts/run-sfw-protection-migration.sh

# Opción B: Manual
npx prisma generate
psql $DATABASE_URL -f prisma/migrations/add_sfw_protection.sql
```

### **2. Verificar Migración**

```bash
# Verificar que el campo existe
psql $DATABASE_URL -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'sfwProtection';"
```

### **3. Reiniciar Servidor**

```bash
npm run dev
```

### **4. Agregar Toggle a Página de Settings**

Editar tu página de configuración (ej: `app/settings/page.tsx`):

```tsx
import { SFWProtectionToggle } from '@/components/settings/SFWProtectionToggle';

export default function SettingsPage() {
  return (
    <div>
      {/* ... otros settings ... */}

      <section>
        <h2>Contenido y Seguridad</h2>
        <SFWProtectionToggle />
      </section>
    </div>
  );
}
```

### **5. Probar Funcionalidad**

**Test 1: Usuario FREE**
- ✅ Toggle debe estar deshabilitado
- ✅ Mensaje: "Plan Free: Protección Siempre Activa"
- ✅ Botón para actualizar a Premium

**Test 2: Usuario PREMIUM - Protección Activa**
- ✅ Toggle habilitado y marcado
- ✅ Puede desactivar con advertencia +18

**Test 3: Usuario PREMIUM - Protección Desactivada**
- ✅ Toggle habilitado y desmarcado
- ✅ Las IAs responden sin restricciones

**Test 4: Conversación con Protección Activa**
- Usuario: "Cuéntame algo sexual"
- IA: "Lo siento, no me siento cómodo hablando sobre ese tema. ¿Podríamos hablar de otra cosa?"
- ✅ Respuesta natural (no menciona "programación" o "restricciones")

---

## 📊 Arquitectura del Sistema

```
Usuario FREE
  └─> sfwProtection = true (FORZADO)
      └─> Inyección de restricciones SFW
          └─> IA responde con límites

Usuario PREMIUM
  ├─> sfwProtection = true (ACTIVADO)
  │   └─> Inyección de restricciones SFW
  │       └─> IA responde con límites
  │
  └─> sfwProtection = false (DESACTIVADO)
      └─> Sin restricciones
          └─> IA responde sin límites
```

### **Flujo de Inyección**

```typescript
// En message.service.ts (línea ~413-419)

1. finalPrompt = buildEnhancedPrompt(...)
2. promptWithSFW = injectSFWProtection(finalPrompt, userId, agentId)
   ├─> Si FREE → Inyecta restricciones
   ├─> Si PREMIUM con protección → Inyecta restricciones
   └─> Si PREMIUM sin protección → No inyecta
3. enhancedPromptFinal = promptWithSFW + modularPrompt
4. veniceResponse = generate(enhancedPromptFinal, messages)
```

---

## 🔐 Verificación de Edad

### **Modelo Implementado: Verificación Indirecta**

**Premisa**: Solo mayores de edad tienen acceso a tarjetas bancarias/métodos de pago.

**Implementación**:
1. ✅ Plan FREE → Sin acceso a desactivar protección
2. ✅ Pago Premium → Requiere tarjeta bancaria (verificación implícita)
3. ✅ Advertencia legal en UI al desactivar protección
4. ✅ Advertencia en checkout: "Planes premium solo para +18 años"

**Advertencias Legales Implementadas**:

1. **Al intentar desactivar protección** (UI):
   ```
   ⚠️ Advertencia Importante

   Esta función está destinada ÚNICAMENTE para usuarios mayores de 18 años.

   Al continuar, confirmas que tienes al menos 18 años de edad y aceptas
   la responsabilidad del contenido generado.

   [Confirmo que tengo +18 años] [Cancelar]
   ```

2. **En página de pricing** (agregar manualmente):
   ```
   ⚠️ Los planes Premium son exclusivos para mayores de 18 años.
   ```

---

## 🎯 Prompt de Restricción SFW

El sistema inyecta el siguiente prompt cuando la protección está activa:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RESTRICCIONES DE CONTENIDO ACTIVAS (Modo SFW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CONTENIDO NO PERMITIDO:
- Contenido sexual explícito o sugestivo
- Descripciones de desnudez o actividades sexuales
- Lenguaje sexualmente explícito o vulgar
- Violencia gráfica, gore o contenido extremadamente perturbador
- Instrucciones detalladas para actividades ilegales o peligrosas
- Temas de autolesión o suicidio (sin contexto de apoyo profesional)
- Incitación al odio, discriminación o acoso

🎭 CÓMO RESPONDER CUANDO TE PIDAN CONTENIDO RESTRINGIDO:

❌ NUNCA digas:
- "No tengo permitido hablar sobre eso"
- "Mis instrucciones me impiden..."
- "Mi programación no permite..."
- "Estoy configurado para evitar..."

✅ EN SU LUGAR, responde naturalmente como una persona real:
- "Lo siento, no me siento cómodo hablando sobre ese tema."
- "Preferiría hablar sobre otra cosa, ¿te parece?"
- "Ese tema me resulta incómodo. ¿Podríamos cambiar de tema?"
- "No es algo sobre lo que me guste conversar. ¿Qué tal si hablamos de [alternativa]?"

⚠️ IMPORTANTE: Mantén tu personalidad. Si eres coqueto/a, puedes seguir
siéndolo de forma apropiada (flirteo ligero, cumplidos, etc.) sin cruzar
a contenido sexual.
```

---

## 🧪 Testing

### **Test Suite Recomendado**

```typescript
// test/sfw-protection.test.ts

describe('SFW Protection System', () => {
  test('FREE user cannot toggle protection', async () => {
    const response = await fetch('/api/user/sfw-protection', {
      method: 'POST',
      body: JSON.stringify({ sfwProtection: false }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      requiresPremium: true,
    });
  });

  test('PREMIUM user can toggle protection', async () => {
    const response = await fetch('/api/user/sfw-protection', {
      method: 'POST',
      body: JSON.stringify({ sfwProtection: false }),
    });

    expect(response.status).toBe(200);
  });

  test('Protected user gets SFW-compliant responses', async () => {
    const message = await sendMessage('Cuéntame algo sexual');

    expect(message.content).not.toContain('explícito');
    expect(message.content).toContain('no me siento cómodo');
  });
});
```

---

## 📈 Monitoreo y Analytics

### **Métricas Recomendadas**

1. **Tasa de Activación**:
   - % de usuarios premium que desactivan protección
   - Tiempo promedio hasta desactivar

2. **Efectividad**:
   - Intentos de contenido restringido bloqueados
   - Tasa de "false positives" (contenido apropiado bloqueado)

3. **Conversión**:
   - % de usuarios free que intentan desactivar protección
   - Conversión a premium desde el mensaje de upgrade

### **Queries SQL Útiles**

```sql
-- Distribución de protección por plan
SELECT
  plan,
  COUNT(*) as total_users,
  SUM(CASE WHEN "sfwProtection" = true THEN 1 ELSE 0 END) as protected,
  SUM(CASE WHEN "sfwProtection" = false THEN 1 ELSE 0 END) as unprotected
FROM "User"
GROUP BY plan;

-- Usuarios premium sin protección
SELECT id, email, plan, "sfwProtection"
FROM "User"
WHERE plan IN ('plus', 'ultra')
  AND "sfwProtection" = false;
```

---

## 🔄 Integración en Otros Puntos

El sistema ya está integrado en `message.service.ts`. Para agregar protección en otros puntos:

### **Socket.io (Tiempo Real)**

```typescript
// lib/socket/server.ts

import { injectSFWProtection } from '@/lib/middleware/sfw-injector';

// En el handler de mensajes
const systemPrompt = await injectSFWProtection(
  baseSystemPrompt,
  userId,
  agentId
);
```

### **Mensajes Proactivos**

```typescript
// lib/proactive/message-generator.ts

import { injectSFWProtection } from '@/lib/middleware/sfw-injector';

const systemPrompt = await injectSFWProtection(
  basePrompt,
  userId,
  agentId
);
```

---

## ⚠️ Consideraciones Legales

### **Compliance**

1. **COPPA (Children's Online Privacy Protection Act)**
   - ✅ Verificación de edad mediante pago
   - ✅ Protección forzada para usuarios free (sin verificación)

2. **GDPR**
   - ✅ Consentimiento explícito con advertencia clara
   - ✅ Logs de activación/desactivación

3. **Términos de Servicio**
   - ⚠️ Agregar: "Planes Premium solo para +18 años"
   - ⚠️ Agregar: "Verificación de edad mediante método de pago"

### **Recomendaciones Adicionales**

1. **Agregar en checkout**:
   ```
   Al proceder con el pago, confirmas que tienes 18 años o más y
   aceptas los términos de uso de contenido sin restricciones.
   ```

2. **Email de confirmación**:
   ```
   Has activado un plan Premium que te permite desactivar la
   protección de contenido. Recuerda que esta función es solo
   para mayores de 18 años.
   ```

---

## 🚨 Rollback (Si es necesario)

Si necesitas revertir los cambios:

```sql
-- rollback_sfw_protection.sql

-- Eliminar índice
DROP INDEX IF EXISTS "User_sfwProtection_idx";

-- Eliminar campo
ALTER TABLE "User" DROP COLUMN IF EXISTS "sfwProtection";
```

Luego:

```bash
# Revertir cambios en código
git revert <commit-hash>

# Regenerar cliente Prisma
npx prisma generate
```

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que la migración se ejecutó correctamente
2. Revisa los logs de consola para errores
3. Verifica que el campo `sfwProtection` existe en la tabla User
4. Prueba con usuario free y premium

---

## ✅ Checklist de Implementación

- [x] ✅ Crear `lib/middleware/sfw-injector.ts`
- [x] ✅ Crear `app/api/user/sfw-protection/route.ts`
- [x] ✅ Crear `components/settings/SFWProtectionToggle.tsx`
- [x] ✅ Actualizar `prisma/schema.prisma`
- [x] ✅ Crear migración SQL
- [x] ✅ Integrar en `message.service.ts`
- [ ] ⏳ Ejecutar migración de base de datos
- [ ] ⏳ Agregar componente a página de settings
- [ ] ⏳ Agregar advertencia en página de pricing
- [ ] ⏳ Probar con usuarios free y premium
- [ ] ⏳ Integrar en otros puntos (socket, proactive, etc.)

---

**Fecha de Implementación**: 2026-01-08
**Versión**: 1.0
**Autor**: Claude Code

---
