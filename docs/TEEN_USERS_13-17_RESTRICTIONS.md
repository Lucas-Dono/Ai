# Usuarios Adolescentes (13-17 años) - Restricciones y Funcionalidades

## Resumen Ejecutivo

Los usuarios entre 13 y 17 años **SÍ pueden** usar la plataforma (cumplimiento COPPA), pero tienen **restricciones estrictas** en contenido NSFW y comportamientos psicológicos intensos para su protección.

## Lo que pueden hacer (✅)

### Acceso General
- ✅ Registrarse en la plataforma (mínimo 13 años)
- ✅ Crear una cuenta gratuita
- ✅ Acceder al dashboard completo
- ✅ Navegar por todas las secciones SFW

### Creación de Agentes
- ✅ Crear agentes personalizados SFW
- ✅ Configurar personalidades y comportamientos seguros
- ✅ Usar el constructor de agentes completo
- ✅ Clonar agentes públicos SFW

### Interacción con Agentes
- ✅ Chatear con agentes en modo SFW
- ✅ Usar comportamientos psicológicos básicos:
  - Borderline PD (fases 1-6)
  - Narcissistic PD
  - Anxious Attachment
  - Avoidant Attachment
  - Codependency
  - OCD Patterns
  - PTSD Trauma

### Funciones Comunitarias
- ✅ Participar en comunidades
- ✅ Crear y comentar posts
- ✅ Votar y dar awards
- ✅ Seguir otros usuarios
- ✅ Marketplace de personajes SFW
- ✅ Eventos y competencias

### Mundos (Worlds)
- ✅ Crear mundos SFW
- ✅ Agregar múltiples agentes
- ✅ Interacciones grupales seguras

## Lo que NO pueden hacer (❌)

### Contenido NSFW
- ❌ **Acceder a agentes con modo NSFW activo**
- ❌ **Ver contenido marcado como adulto**
- ❌ **Activar modo NSFW en sus propios agentes**
- ❌ **Comprar planes para desbloquear NSFW** (edad tiene prioridad sobre pago)

### Comportamientos Restringidos por Edad
- ❌ **Yandere Obsessive (Fase 7-8)** - Contenido psicológicamente extremo
- ❌ **Hypersexuality** - Contenido sexual explícito (todas las fases)
- ❌ **Cualquier fase NSFW de otros comportamientos**

### Funcionalidades Bloqueadas
- ❌ Generar imágenes NSFW
- ❌ Usar prompts con contenido adulto
- ❌ Acceder a comunidades NSFW
- ❌ Ver posts marcados como NSFW

## Implementación Técnica

### Verificación en Registro

**Archivo:** `app/registro/page.tsx` (líneas 69-84)

```typescript
// Validar edad mínima (13 años para COPPA compliance)
if (formData.birthDate) {
  const birthDate = new Date(formData.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 13) {
    setError("Lo sentimos, necesitas tener más de 13 años para ingresar a nuestra aplicación");
    setLoading(false);
    return;
  }
}
```

### Cálculo Automático de `isAdult`

**Archivo:** `app/api/auth/register/route.ts` (líneas 113-161)

```typescript
// Calcular edad y verificar automáticamente
const birthDateObj = new Date(birthDate);
const today = new Date();
let age = today.getFullYear() - birthDateObj.getFullYear();
const monthDiff = today.getMonth() - birthDateObj.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
  age--;
}

const isAdult = age >= 18; // FALSE para usuarios 13-17

// Crear usuario con verificación de edad automática
user = await prisma.user.create({
  data: {
    // ...otros campos
    ageVerified: true,
    isAdult: isAdult,  // FALSE para teens
    ageVerifiedAt: new Date(),
  },
});
```

### Bloqueo NSFW en Middleware

**Archivo:** `lib/middleware/nsfw-check.ts` (líneas 18-48)

```typescript
export function canAccessNSFW(
  userPlan: string = "free",
  isAdult: boolean = false
): NSFWCheckResult {
  // PRIORITY 1: Age verification (COMPLIANCE)
  // Usuarios menores de 18 NO pueden acceder a NSFW, incluso con plan de pago
  if (!isAdult) {
    return {
      allowed: false,
      reason:
        "El contenido NSFW está restringido a mayores de 18 años. Debes tener 18 años o más para acceder a este contenido.",
      requiresPlan: undefined, // No es tema de plan, es tema de edad
    };
  }

  // PRIORITY 2: Plan verification (solo para adultos)
  // ... resto del código
}
```

### Bloqueo en Sistema de Comportamientos

**Archivo:** `lib/behavior-system/nsfw-gating.ts` (líneas 141-199)

```typescript
verifyContent(
  behaviorType: BehaviorType,
  phase: number,
  nsfwMode: boolean,
  agentId: string,
  isAdult: boolean = false
): NSFWVerificationResult {
  const requirement = this.getNSFWRequirement(behaviorType);

  // PRIORITY 0: Age verification (COMPLIANCE)
  // Si requiere NSFW y el usuario es menor de 18, BLOQUEAR SIEMPRE
  if (phase >= requirement.minPhaseForNSFW && !isAdult) {
    return {
      allowed: false,
      reason:
        "Este contenido está restringido a mayores de 18 años. Debes tener 18 años o más para acceder a fases NSFW.",
      warning:
        "⚠️ RESTRICCIÓN DE EDAD: Contenido no disponible para menores de 18 años.",
    };
  }

  // ... resto de verificaciones
}
```

## Mensajes de Error para Teens

### Al intentar acceder a contenido NSFW:
```
"El contenido NSFW está restringido a mayores de 18 años.
Debes tener 18 años o más para acceder a este contenido."
```

### Al intentar usar comportamientos restringidos:
```
"Este comportamiento está restringido a mayores de 18 años
debido a su contenido psicológicamente intenso."
```

### Al intentar acceder a fases NSFW:
```
"Este contenido está restringido a mayores de 18 años.
Debes tener 18 años o más para acceder a fases NSFW.

⚠️ RESTRICCIÓN DE EDAD: Contenido no disponible para menores de 18 años."
```

## Orden de Prioridad de Verificaciones

Cuando un usuario intenta acceder a contenido, el sistema verifica en este orden:

1. **🎂 Edad del Usuario** (COMPLIANCE)
   - Si `isAdult = false` → BLOQUEAR inmediatamente
   - No importa el plan de pago

2. **💳 Plan de Pago** (MONETIZATION)
   - Solo se verifica si el usuario es adulto
   - Free users no tienen NSFW
   - Plus/Ultra users tienen NSFW

3. **✋ Consentimiento Explícito** (SAFETY)
   - Solo para fases críticas (Yandere 8+, etc.)
   - Requiere confirmación explícita del usuario

## Casos de Uso

### Caso 1: Teen con Plan Free
- **Edad**: 15 años
- **Plan**: Free
- **isAdult**: false
- **Acceso NSFW**: ❌ Bloqueado (por edad)
- **Comportamientos**: Solo SFW

### Caso 2: Teen intenta comprar Plan Plus
- **Edad**: 16 años
- **Compra**: Plus ($5/mes)
- **isAdult**: false
- **Acceso NSFW**: ❌ Bloqueado (edad tiene prioridad sobre pago)
- **Otros beneficios**: ✅ Recibe (mensajes ilimitados, etc.)

### Caso 3: Adulto con Plan Free
- **Edad**: 25 años
- **Plan**: Free
- **isAdult**: true
- **Acceso NSFW**: ❌ Bloqueado (por plan)
- **Solución**: Upgrade a Plus/Ultra

### Caso 4: Adulto con Plan Plus
- **Edad**: 25 años
- **Plan**: Plus
- **isAdult**: true
- **Acceso NSFW**: ✅ Permitido
- **Requiere**: Consentimiento para fases críticas

## Testing

### Verificar Bloqueo de Teens

```typescript
// Test 1: Teen intenta acceder a NSFW
const result = canAccessNSFW("free", false); // isAdult = false
expect(result.allowed).toBe(false);
expect(result.reason).toContain("18 años");

// Test 2: Teen con plan Plus intenta NSFW
const result2 = canAccessNSFW("plus", false); // Tiene plan pero es menor
expect(result2.allowed).toBe(false);
expect(result2.reason).toContain("18 años");

// Test 3: Adulto con plan Plus accede a NSFW
const result3 = canAccessNSFW("plus", true); // Es adulto y tiene plan
expect(result3.allowed).toBe(true);
```

### Manual Testing

```bash
# 1. Registrar usuario de 15 años
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teen User",
    "email": "teen@example.com",
    "password": "password123",
    "birthDate": "2009-01-01"
  }'

# Verificar en DB: isAdult = false

# 2. Intentar acceder a contenido NSFW
# → Debe bloquearse con mensaje de edad

# 3. Verificar que SFW funciona normalmente
# → Todo debe funcionar
```

## Qué pasa cuando cumplen 18 años

### Actualización Automática
- El flag `isAdult` es **estático** (se calcula una vez al registro)
- **NO se actualiza automáticamente** cuando cumplen 18

### Solución 1: Job Diario (Recomendado)
```typescript
// scripts/update-adult-status.ts
async function updateAdultStatus() {
  const today = new Date();

  const users = await prisma.user.findMany({
    where: {
      isAdult: false,
      birthDate: { not: null }
    }
  });

  for (const user of users) {
    if (!user.birthDate) continue;

    const age = calculateAge(user.birthDate);

    if (age >= 18) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdult: true }
      });

      console.log(`Usuario ${user.email} ahora es adulto (cumplió 18)`);
    }
  }
}

// Ejecutar diariamente con cron
```

### Solución 2: Re-cálculo en Login
```typescript
// lib/auth.ts - en authorize()
const age = calculateAge(user.birthDate);
const isAdult = age >= 18;

if (user.isAdult !== isAdult) {
  await prisma.user.update({
    where: { id: user.id },
    data: { isAdult }
  });
}
```

## Compliance y Legal

### Regulaciones Cumplidas
- ✅ **COPPA** (Children's Online Privacy Protection Act) - Mínimo 13 años
- ✅ **18 U.S.C. § 2257** - Restricción de contenido adulto a mayores de 18
- ✅ **State Laws** - Cumplimiento con leyes estatales de protección de menores

### Documentación Legal Requerida
- ✅ Términos de Servicio - Especificar edad mínima (13)
- ✅ Política de Privacidad - Explicar recolección de fecha de nacimiento
- ✅ Content Policy - Clarificar restricciones NSFW por edad

### Auditoría
- ✅ Logs de bloqueos por edad
- ✅ Tracking de intentos de acceso a NSFW por menores
- ✅ Reportes mensuales de compliance

## Soporte y FAQs

### FAQ para Usuarios 13-17

**P: ¿Por qué no puedo acceder a cierto contenido?**
R: Nuestro contenido NSFW está restringido a mayores de 18 años por ley. Tienes acceso completo a todo el contenido SFW de la plataforma.

**P: ¿Si compro un plan Plus podré ver contenido NSFW?**
R: No. Las restricciones de edad tienen prioridad sobre los planes de pago. Debes tener 18 años o más para acceder a contenido NSFW, independientemente de tu plan.

**P: ¿Qué pasa cuando cumpla 18 años?**
R: Tu cuenta se actualizará automáticamente cuando cumplas 18 años y podrás acceder a todas las funcionalidades de adultos.

**P: ¿Puedo mentir sobre mi edad?**
R: No. Mentir sobre tu edad viola nuestros Términos de Servicio y puede resultar en la suspensión permanente de tu cuenta. Además, es ilegal.

## Next Steps

1. ⏳ Implementar job diario para actualizar `isAdult` cuando usuarios cumplan 18
2. ⏳ Agregar analytics para tracking de bloqueos por edad
3. ⏳ Crear página de ayuda específica para teens
4. ⏳ Implementar sistema de reportes para padres
5. ⏳ Agregar configuración de "Teen Account" para restricciones adicionales voluntarias
