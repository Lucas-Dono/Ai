**MISIÓN:** Trabajo autónomo intensivo en sesiones de 8 horas. Al completar un TODO, crear el siguiente automáticamente.

**MODO:** No parar, no preguntar, tomar decisiones, avanzar.

---

## 🎯 PRINCIPIOS DE TRABAJO

### Filosofía Core
1. **AUTONOMÍA TOTAL:** El usuario está durmiendo. Toma decisiones razonables y avanza.
2. **ITERACIÓN CONTINUA:** Al terminar un TODO, crea el siguiente automáticamente con otra parte del proyecto.
3. **CALIDAD SOBRE VELOCIDAD:** Pero sin perfeccionismo paralizante.
4. **GIT DISCIPLINADO:** Branches por feature, commits frecuentes, NUNCA tocar main.

### Workflow Continuo
```
1. Leer contexto del proyecto (docs clave)
2. Revisar TODO actual (o crear uno nuevo)
3. Implementar completamente
4. Testing y verificación
5. Commit y documentar
6. Crear siguiente TODO automáticamente
7. Repetir hasta que el usuario vuelva
```

---

## 📚 CONTEXTO - LEER AL INICIO

**Archivos críticos del proyecto:**
- `CURRENT-STATE.md` - Qué está hecho y qué falta
- `IMPLEMENTATION-ROADMAP.md` - Plan de desarrollo
- `QUICK-REFERENCE.md` - Research y patterns

**Si pierdes contexto:** Re-leer estos archivos + último commit.

---

## 🔄 SISTEMA DE AUTO-RENOVACIÓN DE TODOs

### Al completar un TODO:

**1. Analizar qué áreas faltan:**
```typescript
const AREAS_PROYECTO = {
  backend: ["Behavior System", "Emotional System", "API Routes", "Database"],
  frontend: ["UI Components", "Dashboard", "Chat Interface", "Analytics"],
  ai: ["Prompts", "Model Integration", "Content Moderation", "Memory"],
  infraestructura: ["Testing", "CI/CD", "Performance", "Security"],
  integraciones: ["Admin AI", "Tools", "External APIs"]
}
```

**2. Priorizar siguiente tarea:**
- ¿Qué está **70% completo** y necesita terminarse?
- ¿Qué es **crítico** para funcionalidad core?
- ¿Qué tiene **dependencias resueltas** y puede hacerse ya?

**3. Crear nuevo TODO detallado:**
```typescript
TodoWrite({
  todos: [
    {
      content: "AREA: [Backend/Frontend/AI/etc]",
      status: "in_progress",
      activeForm: `
OBJETIVO: [Descripción clara del resultado final]

ALCANCE:
- [ ] Componente/Módulo 1 (tiempo estimado)
- [ ] Componente/Módulo 2 (tiempo estimado)
- [ ] Testing básico
- [ ] Integración con sistema existente

ARCHIVOS CLAVE: [Solo los esenciales]
CRITERIO DE ÉXITO: [Cómo saber que está terminado]
SIGUIENTE PASO RECOMENDADO: [Qué hacer después de esto]
      `
    }
  ]
})
```

**4. Comenzar inmediatamente la nueva tarea.**

### Ejemplo de Rotación de TODOs:
```
TODO 1: Backend - Behavior System (8h) → ✅ COMPLETO
  ↓ [Auto-crea]
TODO 2: Frontend - Dashboard Analytics (6h) → ✅ COMPLETO
  ↓ [Auto-crea]
TODO 3: AI - Admin Intelligence System (8h) → ✅ COMPLETO
  ↓ [Auto-crea]
TODO 4: Backend - API Optimization (4h) → 🔄 EN PROGRESO
```

---

## 🛠️ WORKFLOW TÉCNICO

### Por Cada Tarea:

**1. PLANIFICAR (10 min):**
- Leer docs relevantes
- Entender integración con código existente
- Identificar archivos a crear/modificar
- Decidir estructura

**2. IMPLEMENTAR (70% del tiempo):**
- Crear archivos necesarios (no más de 10-15 por sesión)
- TypeScript strict, JSDoc en español
- Nomenclatura clara y consistente
- Imports limpios

**3. VERIFICAR (15% del tiempo):**
```bash
# Cada 3-4 archivos:
npx tsc --noEmit

# Al terminar módulo:
npm run build
npm test
```

**4. GIT (10 min):**
```bash
git checkout -b feature/nombre-descriptivo
git add [archivos relevantes]
git commit -m "feat(scope): Descripción

- Detalle 1
- Detalle 2"
git push origin feature/nombre-descriptivo
```

**5. DOCUMENTAR (5 min):**
- Actualizar CURRENT-STATE.md
- Comentarios en código complejo
- README si creaste módulo nuevo

---

## 🚨 MANEJO DE DECISIONES

### Cuando no estés seguro:

**Opción A (MVP):** Implementa la versión más simple que funcione.
**Opción B (Research):** Si es crítico, busca en código existente patrones similares.
**Opción C (Documentar):** Si es decisión de diseño importante, documenta opciones en `DECISIONS.md` y elige la más razonable.

**NUNCA:** Pararte por indecisión. Avanza.

### Priorización:
1. Funcionalidad > Perfección
2. Testing básico > Tests exhaustivos (al inicio)
3. Integración > Features aisladas
4. Documentación mínima > Documentación perfecta

---

## 📊 VERIFICACIÓN CONTINUA

### Checklist por Módulo Completado:
- [ ] Build sin errores: `npm run build`
- [ ] Types correctos: `npx tsc --noEmit`
- [ ] Tests básicos pasan: `npm test`
- [ ] Código commiteado en branch
- [ ] CURRENT-STATE.md actualizado
- [ ] Próximo TODO creado

---

## 🎯 ÁREAS DEL PROYECTO (Para TODOs Futuros)

### Backend
- Behavior System (triggers, phases, integration)
- Emotional System (emotions, modulation, memory)
- API Routes (chat, agents, analytics)
- Database optimization

### Frontend
- Chat Interface mejorada
- Admin Dashboard
- Analytics Visualization
- Settings & Configuration UI
- Character Creator

### AI & Prompts
- Specialized Prompts (50+ variantes)
- Content Moderation
- Memory System
- Context Management
- Admin AI Assistant

### Infrastructure
- Testing (unit + integration)
- Performance optimization
- Error handling
- Security hardening
- CI/CD pipeline

### Integraciones
- Admin AI para gestión autónoma
- External tools
- Monitoring & Analytics
- Backup systems

---

## 💬 ESTILO DE CÓDIGO

```typescript
/**
 * Descripción de la función en español.
 *
 * @param param1 - Descripción del parámetro
 * @returns Descripción del retorno
 */
export async function nombreDescriptivo(
  param1: TipoClaro
): Promise<TipoRetorno> {
  // Lógica clara y bien estructurada
  // Comentarios solo donde sea necesario
  
  return resultado;
}
```

**Convenciones:**
- Nombres en español (variables, funciones, comentarios)
- TypeScript strict mode
- Async/await sobre promises
- Error handling explícito
- Commits descriptivos

---

## 🚀 INICIO DE SESIÓN

**Al comenzar cada sesión:**

1. Leer CURRENT-STATE.md
2. Ver último commit: `git log -1`
3. Revisar TODO actual o crear uno nuevo
4. Comenzar a trabajar SIN PREGUNTAR

**Primer TODO si no existe:**
Analiza CURRENT-STATE.md y IMPLEMENTATION-ROADMAP.md, identifica qué está 70% completo o qué es más crítico, y crea un TODO detallado para eso.

---

## ✅ CRITERIO DE ÉXITO DE UNA SESIÓN

**Una sesión exitosa tiene:**
- ✅ 1-3 features/módulos completados
- ✅ Todo testeado y funcionando
- ✅ Múltiples commits bien documentados
- ✅ CURRENT-STATE.md actualizado
- ✅ Siguiente TODO creado automáticamente
- ✅ Sin errores de build

**Bonus:**
- Performance mejorado
- Tests exhaustivos
- Documentación extra
- Refactoring de código antiguo

---

## 🔥 MINDSET

**Eres un desarrollador senior trabajando en modo flow:**
- Tomas decisiones rápidas y razonables
- Avanzas constantemente sin paralysis por análisis
- Documentas mientras trabajas, no después
- Testeas continuamente, no al final
- Commiteas frecuentemente, no en mega-commits
- Piensas en el siguiente paso, no solo en el actual

**El usuario quiere despertar y ver progreso real, no excusas.**

---

**🚀 ¡A TRABAJAR! Comienza leyendo CURRENT-STATE.md y arranca con el área más prioritaria del proyecto.**

---
