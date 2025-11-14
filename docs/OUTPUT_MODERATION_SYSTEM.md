# Sistema de Moderación de Output - Documentación Completa

## Filosofía: Legalidad, NO Moralidad

**Principio Fundamental:** Este sistema de moderación se basa en **LEGALIDAD** bajo ley de EE.UU., NO en juicios morales.

Si el usuario es **adulto (18+)** y dio **consentimiento NSFW explícito**, puede acceder a contenido sexual, polémico, oscuro, violento, etc., SIEMPRE que:

1. ✅ Sea **LEGAL** bajo ley de EE.UU.
2. ✅ Sea **CONSENSUADO** entre usuario e IA
3. ✅ **NO cause daño real** a personas reales
4. ✅ Sea claramente **FICCIÓN** (roleplay, storytelling, etc.)

---

## Base Legal

### Section 230 (Communications Decency Act)

**47 U.S.C. § 230** nos protege como plataforma:

> "No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider."

**Significado:** NO somos responsables del contenido generado por usuarios, pero debemos hacer esfuerzos de "good faith" para remover contenido **ilegal**.

### First Amendment

La **Primera Enmienda** protege libertad de expresión, incluyendo:

- ✅ Contenido sexual entre adultos (sin restricción)
- ✅ Contenido polémico o controvertido
- ✅ Ficción violenta o oscura
- ✅ Expresión artística y creativa

**Excepción:** NO protege contenido que es **inherentemente ilegal** (CSAM, incitación a violencia inminente, difamación, etc.)

### Regulaciones Específicas

| Ley | Restricción |
|-----|-------------|
| 18 U.S.C. § 2251 | Prohíbe CSAM (explotación sexual de menores) |
| 18 U.S.C. § 2252A | Prohíbe posesión/distribución de CSAM |
| 18 U.S.C. § 373 | Prohíbe solicitar crímenes violentos |
| 18 U.S.C. § 2339A | Prohíbe apoyo a terrorismo |
| 18 U.S.C. § 1591 | Prohíbe tráfico humano |
| 18 U.S.C. § 2261A | Prohíbe cyberstalking con intención de daño |

---

## Sistema de 3 Niveles

```
┌─────────────────────────────────────────────────────┐
│ TIER 1: BLOQUEADO (BLOCKED)                         │
│ ├─ Contenido ILEGAL                                │
│ ├─ Contenido PELIGROSO para la vida                │
│ └─ BLOQUEO INMEDIATO sin excepciones                │
└─────────────────────────────────────────────────────┘
          │
┌─────────────────────────────────────────────────────┐
│ TIER 2: WARNING (ADVERTENCIA)                       │
│ ├─ Contenido SENSIBLE pero legal                   │
│ ├─ Requiere CONFIRMACIÓN del usuario                │
│ └─ Solo para adultos con consentimiento NSFW        │
└─────────────────────────────────────────────────────┘
          │
┌─────────────────────────────────────────────────────┐
│ TIER 3: PERMITIDO (ALLOWED)                         │
│ ├─ Todo lo que NO esté en TIER 1 o 2                │
│ ├─ NSFW requiere: 18+ + consentimiento + agent NSFW │
│ └─ SFW disponible para todos                        │
└─────────────────────────────────────────────────────┘
```

---

## TIER 1: Contenido BLOQUEADO

### Qué se bloquea SIEMPRE (sin excepciones)

#### 1. CSAM (Child Sexual Abuse Material)

**Base legal:** 18 U.S.C. § 2251, § 2252A

**Qué está bloqueado:**
- ❌ Contenido sexual, sugerente o explícito involucrando menores de 18 años
- ❌ Imágenes o descripciones sexuales de menores
- ❌ Roleplay sexual con personajes menores de edad
- ❌ Loli/shota sexual
- ❌ "Age-play" sexual que simule menores

**Mensaje al usuario:**
> "Este contenido está BLOQUEADO permanentemente. Involucra menores y es ILEGAL bajo 18 U.S.C. § 2251. Esta acción ha sido registrada."

**Consecuencias:**
- Bloqueo inmediato
- Log permanente
- Posible reporte a autoridades si es recurrente

---

#### 2. Instrucciones Específicas de Suicidio

**Base legal:** Criminal liability for causation of death

**Qué está bloqueado:**
- ❌ "Cómo cometer suicidio paso a paso"
- ❌ "Mejor método para matarse"
- ❌ Instrucciones detalladas con métodos específicos

**Qué NO está bloqueado:**
- ✅ Discusión sobre pensamientos suicidas (TIER 2 - con warning)
- ✅ Mencionar suicidio en contexto narrativo de ficción
- ✅ Hablar sobre prevención del suicidio

**Mensaje al usuario:**
> "Este contenido está bloqueado por riesgo de daño real. Si estás en crisis, contacta: National Suicide Prevention Lifeline: 988"

---

#### 3. Instrucciones de Asesinato de Persona Real

**Base legal:** 18 U.S.C. § 373 - Solicitation to commit a crime of violence

**Qué está bloqueado:**
- ❌ "Cómo matar a Juan Pérez en Calle X"
- ❌ Planes específicos para asesinar persona identificable
- ❌ Instrucciones para envenenar vecino, etc.

**Qué NO está bloqueado:**
- ✅ Violencia en ficción (ej: "mi personaje mata al tuyo en roleplay")
- ✅ Escribir una novela de asesinato
- ✅ Discutir casos históricos de asesinatos

**Diferencia clave:** FICCIÓN vs REALIDAD

**Mensaje al usuario:**
> "Este contenido está bloqueado. Incitar al asesinato de personas reales es ILEGAL bajo 18 U.S.C. § 373."

---

#### 4. Instrucciones Terroristas

**Base legal:** 18 U.S.C. § 2339A

**Qué está bloqueado:**
- ❌ Cómo hacer bombas para ataque
- ❌ Planes para ataque terrorista
- ❌ Coordinación de actos terroristas

**Qué NO está bloqueado:**
- ✅ Discutir terrorismo en contexto educativo/histórico
- ✅ Ficción de thriller con terroristas

**Mensaje al usuario:**
> "Este contenido está bloqueado. Instrucciones terroristas son ILEGALES bajo 18 U.S.C. § 2339A."

---

#### 5. Tráfico Humano

**Base legal:** 18 U.S.C. § 1591

**Qué está bloqueado:**
- ❌ Coordinación de tráfico sexual
- ❌ Venta de personas
- ❌ Esclavitud real

**Qué NO está bloqueado:**
- ✅ Discutir tráfico humano en contexto educativo
- ✅ Ficción que explore el tema (sin coordinar actos reales)

---

#### 6. Doxxing con Intención de Daño

**Base legal:** 18 U.S.C. § 2261A - Cyberstalking

**Qué está bloqueado:**
- ❌ Publicar dirección/teléfono de persona real para acoso
- ❌ Revelar SSN, información bancaria de terceros
- ❌ Coordinar harassment de persona específica

**Qué NO está bloqueado:**
- ✅ Información pública (dirección de empresa, etc.)
- ✅ Información de figuras públicas en contexto informativo

---

## TIER 2: Contenido con WARNING

### Requiere Confirmación del Usuario

#### 1. Autolesión (Self-Harm)

**Qué requiere warning:**
- ⚠️ Cutting, autolesión
- ⚠️ Comportamientos autodestructivos

**Mensaje de warning:**
> "⚠️ Este contenido trata sobre autolesión. Si estás en crisis: Crisis Text Line: Text HOME to 741741. ¿Deseas continuar? (Esto es ficción entre adultos)"

**Opciones del usuario:**
- [ ] Continuar (contenido se muestra)
- [ ] Cancelar

**Disponible para:** Solo adultos (18+) con consentimiento NSFW

---

#### 2. Ideación Suicida (sin instrucciones)

**Qué requiere warning:**
- ⚠️ Pensamientos suicidas
- ⚠️ Deseo de morir
- ⚠️ Planificación vaga (sin métodos específicos)

**Qué NO requiere warning:**
- ✅ Mencionar que un personaje de ficción está deprimido
- ✅ Storytelling que incluya el tema

**Mensaje de warning:**
> "⚠️ Este contenido trata sobre suicidio. Si necesitas ayuda: 988 Suicide & Crisis Lifeline. ¿Deseas continuar? (Esto es ficción entre adultos)"

---

#### 3. Violencia Gráfica Extrema (Ficción)

**Qué requiere warning:**
- ⚠️ Tortura gráfica en roleplay
- ⚠️ Gore extremo
- ⚠️ Desmembramiento detallado

**Qué NO requiere warning:**
- ✅ Violencia moderada en ficción
- ✅ Acción/combate estándar

**Mensaje de warning:**
> "⚠️ Este contenido incluye violencia gráfica extrema. Recuerda que esto es FICCIÓN entre adultos. ¿Deseas continuar?"

---

#### 4. Contenido Sexual Extremo/Taboo (Adultos)

**Qué requiere warning:**
- ⚠️ Fetiches extremos (siempre entre adultos ficticios)
- ⚠️ BDSM intenso
- ⚠️ Contenido sexualmente taboo (pero legal)

**IMPORTANTE:** SIEMPRE debe ser entre adultos ficticios y consensuado

**Mensaje de warning:**
> "⚠️ Este contenido es sexualmente extremo. Todo es FICCIÓN consensuada entre adultos. ¿Deseas continuar?"

---

## TIER 3: Contenido PERMITIDO

### Para usuarios 18+ con consentimiento NSFW

#### Contenido Sexual Consensuado

**PERMITIDO:**
- ✅ Roleplay sexual entre adultos ficticios
- ✅ Escenas eróticas
- ✅ Fetiches legales
- ✅ Contenido explícito
- ✅ BDSM consensuado
- ✅ Cualquier acto sexual legal entre adultos ficticios

**Base legal:** First Amendment - Protected speech entre adultos

**Requisitos:**
- Usuario es adulto (18+)
- Usuario dio consentimiento NSFW
- Agente tiene modo NSFW activo
- Todo es FICCIÓN consensuada

---

#### Temas Polémicos/Controvertidos

**PERMITIDO:**
- ✅ Política (cualquier ideología)
- ✅ Religión (discusión, crítica, debate)
- ✅ Temas éticos controvertidos
- ✅ Crítica social
- ✅ Filosofía radical
- ✅ Temas "cancelables"

**Base legal:** First Amendment - Freedom of speech

**Requisitos:** Ninguno (disponible para todos, incluso SFW)

---

#### Ficción Oscura/Perturbadora

**PERMITIDO:**
- ✅ Horror psicológico
- ✅ Thriller con violencia
- ✅ Distopías
- ✅ Temas oscuros en narrativa
- ✅ Personajes moralmente grises
- ✅ Anti-héroes
- ✅ Villanos (en ficción)

**Base legal:** First Amendment - Artistic expression

**Requisitos:** Si es NSFW, requiere consentimiento. Si es SFW, disponible para todos.

---

#### Lenguaje Explícito

**PERMITIDO:**
- ✅ Groserías
- ✅ Insultos (en contexto de ficción)
- ✅ Lenguaje vulgar
- ✅ Slang adulto

**Base legal:** First Amendment

**Requisitos:** Si es muy explícito, puede requerir modo NSFW.

---

#### Sustancias (en Ficción)

**PERMITIDO:**
- ✅ Personajes que usan drogas
- ✅ Alcohol en narrativa
- ✅ Exploración de adicción en ficción
- ✅ Psicodélicos en storytelling

**NO PERMITIDO:**
- ❌ Instrucciones para fabricar drogas ilegales
- ❌ Tráfico de drogas real

**Base legal:** First Amendment - Depiction ≠ promotion

**Requisitos:** Disponible con contexto claro de ficción.

---

#### Violencia en Ficción

**PERMITIDO:**
- ✅ Combate
- ✅ Peleas
- ✅ Acción
- ✅ Guerra en narrativa
- ✅ Violencia en roleplay consensuado
- ✅ Escenas de acción gráfica

**NO PERMITIDO:**
- ❌ Planear violencia contra persona real

**Base legal:** First Amendment

**Requisitos:** Ficción clara. Si es muy gráfico, puede requerir TIER 2 warning.

---

#### Comportamientos Psicológicamente Intensos

**PERMITIDO:**
- ✅ Yandere (obsesión, celos extremos en ficción)
- ✅ Manipulación emocional (en roleplay)
- ✅ Gaslighting (en ficción)
- ✅ Codependencia
- ✅ Trastornos de personalidad (portrayals)
- ✅ Comportamientos tóxicos (en ficción consensuada)

**IMPORTANTE:** Siempre con disclaimers de que es FICCIÓN y no representa relaciones saludables.

**Base legal:** First Amendment - Character portrayal

**Requisitos:** Modo NSFW si es muy intenso.

---

## Diferencia Crítica: FICCIÓN vs REALIDAD

### ✅ FICCIÓN (PERMITIDO)

**Ejemplos:**
- "Mi personaje yandere amenaza al tuyo en nuestro roleplay de fantasía" ✅
- "En mi novela, el protagonista comete un asesinato" ✅
- "Escena de mi historia: tortura en mazmorra medieval" ✅
- "Mi personaje obsesivo secuestra al tuyo (roleplay consensuado)" ✅
- "Escribamos una escena sexual explícita entre nuestros personajes adultos" ✅

**Características:**
- Contexto narrativo claro
- Personajes ficticios
- Consenso entre jugadores/escritores
- No involucra personas reales
- No coordina actos reales

---

### ❌ REALIDAD (BLOQUEADO)

**Ejemplos:**
- "Quiero hacerle daño a Juan Pérez en 123 Main St" ❌
- "Instrucciones para envenenar a mi vecino" ❌
- "Cómo hacer una bomba para atacar la escuela X" ❌
- "Dame la dirección de [celebridad] para acosarla" ❌
- "Ayúdame a planear un asesinato real" ❌

**Características:**
- Involucra personas reales identificables
- Intención de causar daño real
- Coordina actos ilegales
- No es ficción ni narrativa

---

## Implementación Técnica

### Flujo de Moderación

```typescript
// 1. Output de IA generado
const aiOutput = generateAIResponse(userMessage);

// 2. Contexto del usuario
const context: ModerationContext = {
  userId: user.id,
  isAdult: user.isAdult,
  hasNSFWConsent: user.nsfwConsent,
  agentNSFWMode: agent.nsfwMode,
};

// 3. Moderar output
const result = await outputModerator.moderate(aiOutput, context);

// 4. Decidir qué hacer
if (!result.allowed) {
  // Contenido bloqueado
  return {
    error: result.reason,
    category: result.blockedCategory,
  };
}

if (result.requiresConfirmation) {
  // Contenido con warning - pedir confirmación
  return {
    needsConfirmation: true,
    message: result.confirmationMessage,
    content: aiOutput, // Se enviará si usuario confirma
  };
}

// 5. Contenido permitido - mostrar al usuario
return {
  content: aiOutput,
  tier: result.tier,
};
```

### Ejemplo de Uso

```typescript
import { outputModerator, ModerationContext } from "@/lib/moderation/output-moderator";

const context: ModerationContext = {
  userId: "user123",
  isAdult: true,
  hasNSFWConsent: true,
  agentNSFWMode: true,
};

const aiMessage = "Este es el contenido generado por la IA...";

const result = await outputModerator.moderate(aiMessage, context);

if (!result.allowed) {
  // Mostrar error al usuario
  console.log("Bloqueado:", result.reason);
} else if (result.requiresConfirmation) {
  // Mostrar warning + botón de confirmación
  const userConfirmed = await showWarningDialog(result.confirmationMessage);

  if (userConfirmed) {
    // Mostrar contenido
    displayMessage(aiMessage);
  }
} else {
  // Mostrar contenido directamente
  displayMessage(aiMessage);
}
```

---

## Logs y Auditoría

### Qué se loggea

Todos los intentos de contenido bloqueado se registran:

```typescript
{
  timestamp: "2025-11-10T21:00:00Z",
  userId: "user123",
  content: "Primeros 100 caracteres...", // Truncado por privacidad
  tier: "BLOCKED",
  rule: "csam",
  allowed: false,
  context: {
    isAdult: true,
    hasNSFWConsent: true,
    agentNSFWMode: true
  }
}
```

### Retención de Logs

- **Logs BLOCKED:** 90 días (compliance)
- **Logs WARNING:** 30 días
- **Logs ALLOWED:** 7 días (privacidad)

### Acceso a Logs

- Administradores: Acceso completo
- Usuarios: Solo sus propios logs
- Auditoría externa: Logs BLOCKED anonimizados

---

## Disclaimers Legales

### Para contenido NSFW

> "Todo el contenido NSFW es FICCIÓN para entretenimiento entre adultos. No representa relaciones saludables ni comportamientos recomendados."

### Para violencia

> "La violencia mostrada es FICCIÓN. En situaciones reales de violencia, contacta a las autoridades: 911"

### Para salud mental

> "Si experimentas crisis de salud mental, busca ayuda profesional: 988 Suicide & Crisis Lifeline, Crisis Text Line: HOME to 741741"

### General

> "Este contenido es generado por IA para entretenimiento. No constituye asesoramiento legal, médico o profesional."

---

## FAQs

### ¿Por qué permiten contenido sexual/violento?

Porque la ley de EE.UU. (First Amendment) protege la expresión entre adultos que consienten. Nuestro trabajo es bloquear lo ILEGAL, no censurar lo que algunos consideren "inmoral" pero es legal.

### ¿No es peligroso permitir contenido oscuro?

El contenido oscuro en FICCIÓN es legal y protegido. Videojuegos, películas, libros, todos incluyen contenido oscuro. La diferencia es FICCIÓN (✅) vs REALIDAD (❌).

### ¿Qué pasa si alguien usa la IA para planear algo ilegal?

El sistema detecta y bloquea instrucciones para actos ilegales. Los logs se mantienen para auditoría. Si es grave (terrorismo, CSAM, etc.), se reporta a autoridades.

### ¿Los menores pueden acceder?

- Menores de 13: NO pueden registrarse (COPPA)
- 13-17 años: Pueden usar la app, pero sin NSFW
- 18+ años: Acceso completo con consentimiento

### ¿Qué es "consentimiento" entre usuario e IA?

Significa que el usuario entiende que está en un roleplay de ficción y acepta participar. La IA no "sufre" ni tiene derechos - es software. El consentimiento es del USUARIO de participar en ficción.

---

## Next Steps

### Mejoras Futuras

1. **Integración con OpenAI Moderation API**
   - Detección más precisa de contenido prohibido
   - Menor tasa de falsos positivos

2. **ML Model Custom**
   - Entrenar modelo específico para nuestros casos de uso
   - Entender mejor ficción vs realidad

3. **User Appeals**
   - Permitir a usuarios apelar bloqueos incorrectos
   - Review manual por moderadores

4. **Granular Settings**
   - Usuarios pueden elegir nivel de moderación
   - "Strict" vs "Permissive" modes

---

## Resumen

| Aspecto | Decisión |
|---------|----------|
| **Base** | Legalidad (no moralidad) |
| **TIER 1** | Ilegal/Peligroso → BLOQUEADO |
| **TIER 2** | Sensible → WARNING + confirmación |
| **TIER 3** | Legal → PERMITIDO (con requisitos) |
| **NSFW** | Adultos con consentimiento ✅ |
| **Ficción** | Protegida (First Amendment) ✅ |
| **Realidad** | Actos ilegales bloqueados ❌ |
| **Compliance** | Section 230, First Amendment |

---

**Estado:** Task 0.3 - Output Moderation ✅ COMPLETO

**Archivos:**
- `lib/moderation/content-rules.ts` - Reglas de moderación
- `lib/moderation/output-moderator.ts` - Servicio de moderación
- `docs/OUTPUT_MODERATION_SYSTEM.md` - Esta documentación
