# Guía de Migración de Rutinas

Esta guía explica cómo migrar agentes existentes al nuevo sistema de rutinas dinámicas.

## Scripts Disponibles

### 1. `migrate-existing-agents-to-routines.ts`
Migración masiva de todos los agentes premium sin rutinas.

### 2. `generate-routine-for-agent.ts`
Generación individual o por usuario específico.

---

## Opción 1: Migración Masiva (Todos los Agentes)

### Dry Run (Recomendado Primero)

Ejecuta sin hacer cambios para ver qué se haría:

```bash
npx tsx scripts/migrate-existing-agents-to-routines.ts --dry-run
```

Ejemplo de output:
```
============================================================
ROUTINE MIGRATION SCRIPT
============================================================
Mode: DRY RUN (no changes)
Batch size: 10
============================================================

🔍 Finding eligible agents...
✅ Found 47 eligible agents

📦 Batch 1/5 (10 agents)
------------------------------------------------------------
  📝 Generating routine for: Luna Chen
     User: user1@example.com (plus)
     ⚠️  DRY RUN - Would generate routine
  ...
```

### Migración Real

Una vez confirmado, ejecuta sin `--dry-run`:

```bash
npx tsx scripts/migrate-existing-agents-to-routines.ts
```

Esto:
- ✅ Genera rutinas para todos los agentes premium sin rutina
- ✅ Detecta timezone automáticamente según ubicación
- ✅ Procesa en batches de 10 (configurable)
- ✅ Espera 2 segundos entre batches (evita rate limits)
- ✅ Muestra estadísticas al final

### Configuración de Batches

Si tienes muchos agentes, puedes ajustar el tamaño de batch:

```bash
# Batches de 5 (más lento pero más seguro)
npx tsx scripts/migrate-existing-agents-to-routines.ts --batch-size=5

# Batches de 20 (más rápido pero puede triggear rate limits)
npx tsx scripts/migrate-existing-agents-to-routines.ts --batch-size=20
```

---

## Opción 2: Migración Individual/Selectiva

### Por Agent ID

```bash
npx tsx scripts/generate-routine-for-agent.ts --agent-id=clxx123456789
```

### Por Email de Usuario

Genera rutinas para todos los agentes de un usuario:

```bash
npx tsx scripts/generate-routine-for-agent.ts --user-email=user@example.com
```

### Con Parámetros Personalizados

```bash
# Modo immersive
npx tsx scripts/generate-routine-for-agent.ts \
  --agent-id=clxx123 \
  --realism=immersive

# Con timezone específico
npx tsx scripts/generate-routine-for-agent.ts \
  --agent-id=clxx123 \
  --timezone="America/New_York"

# Con prompt personalizado
npx tsx scripts/generate-routine-for-agent.ts \
  --agent-id=clxx123 \
  --prompt="Character is a night owl who works from home"
```

### Niveles de Realismo

- **subtle**: Solo contexto conversacional
- **moderate**: Afecta tono y velocidad (recomendado)
- **immersive**: Afecta disponibilidad completa

---

## Detección Automática de Timezone

El script detecta automáticamente la timezone basándose en la ciudad del perfil:

| Ciudad | Timezone |
|--------|----------|
| Buenos Aires | America/Argentina/Buenos_Aires |
| Madrid, Barcelona | Europe/Madrid |
| CDMX, México | America/Mexico_City |
| Santiago | America/Santiago |
| Bogotá | America/Bogota |
| Lima | America/Lima |
| New York | America/New_York |
| Los Angeles | America/Los_Angeles |
| London | Europe/London |
| Tokyo | Asia/Tokyo |
| Paris | Europe/Paris |

Si no se detecta, usa `America/Argentina/Buenos_Aires` por defecto.

---

## Ejemplos de Uso Completos

### Ejemplo 1: Migración Completa Gradual

```bash
# Paso 1: Ver cuántos agentes hay
npx tsx scripts/migrate-existing-agents-to-routines.ts --dry-run

# Paso 2: Migrar primeros 10
npx tsx scripts/migrate-existing-agents-to-routines.ts --batch-size=10

# Paso 3: Si todo OK, continuar con el resto
npx tsx scripts/migrate-existing-agents-to-routines.ts
```

### Ejemplo 2: Migrar Solo Usuarios VIP

```bash
# Lista de emails VIP
npx tsx scripts/generate-routine-for-agent.ts --user-email=vip1@example.com
npx tsx scripts/generate-routine-for-agent.ts --user-email=vip2@example.com
npx tsx scripts/generate-routine-for-agent.ts --user-email=vip3@example.com
```

### Ejemplo 3: Crear Rutinas Personalizadas

```bash
# Personaje nocturno
npx tsx scripts/generate-routine-for-agent.ts \
  --agent-id=clxx123 \
  --realism=immersive \
  --prompt="Character is a night owl, sleeps 4am-12pm, works from home"

# Personaje workaholic
npx tsx scripts/generate-routine-for-agent.ts \
  --agent-id=clxx456 \
  --realism=moderate \
  --prompt="Character is a workaholic, works 9am-11pm most days"
```

---

## Monitoring y Logs

Los scripts muestran progreso detallado:

```
📦 Batch 1/5 (10 agents)
------------------------------------------------------------
  📝 Generating routine for: Luna Chen
     User: user@example.com (plus)
     📍 Timezone: America/Argentina/Buenos_Aires
     💼 Occupation: Escritora freelance
     ✅ Routine created: clrtn_xxx
     📋 Templates created: 8

   Templates:
      - Dormir (sleep): 01:00 - 09:00
      - Desayuno (meal): 09:30 - 10:00
      - Escribir (work): 10:00 - 14:00
      - Almuerzo (meal): 14:00 - 15:00
      - Escribir (work): 15:00 - 19:00
      - Ejercicio (exercise): 19:00 - 20:00
      - Cena (meal): 20:30 - 21:30
      - Lectura (hobby): 22:00 - 00:30
```

---

## Estadísticas Finales

Al terminar, verás un resumen:

```
============================================================
MIGRATION COMPLETE
============================================================
Total agents: 47
✅ Successful: 45
❌ Failed: 2
⏱️  Duration: 123s
============================================================

⚠️  ERRORS:
------------------------------------------------------------
Agent: Broken Agent (clxx999)
Error: Agent missing personality core
------------------------------------------------------------
```

---

## Manejo de Errores

### Error: "Agent missing personality core"

**Causa:** El agente no tiene `PersonalityCore` creado.

**Solución:**
```bash
# Crear PersonalityCore manualmente o regenerar el agente
```

### Error: "All Gemini API keys quota exhausted"

**Causa:** Se agotó el quota de todas las API keys de Gemini.

**Solución:**
- Esperar a que se renueve el quota (daily reset)
- Añadir más API keys: `GOOGLE_AI_API_KEY_2`, `GOOGLE_AI_API_KEY_3`, etc.
- Reducir batch size: `--batch-size=5`

### Error: "Routine already exists"

**Causa:** El agente ya tiene una rutina.

**Solución:** Script skip automáticamente. Si quieres regenerar:
```bash
# Primero eliminar la rutina existente
# Luego regenerar
```

---

## Costos Estimados

- **Por agente:** ~$0.0004 (Gemini 2.5 Flash-Lite)
- **100 agentes:** ~$0.04
- **1000 agentes:** ~$0.40

Muy económico gracias a Gemini 2.5 Flash-Lite 💰

---

## Verificación Post-Migración

### Ver agentes migrados

```sql
SELECT
  a.name,
  a.id as agent_id,
  u.email,
  u.plan,
  cr.timezone,
  cr."realismLevel",
  COUNT(rt.id) as template_count
FROM "Agent" a
JOIN "User" u ON a."userId" = u.id
LEFT JOIN "CharacterRoutine" cr ON a.id = cr."agentId"
LEFT JOIN "RoutineTemplate" rt ON cr.id = rt."routineId"
WHERE u.plan IN ('plus', 'ultra')
GROUP BY a.id, a.name, u.email, u.plan, cr.timezone, cr."realismLevel"
ORDER BY cr."createdAt" DESC;
```

### Ver estadísticas

```sql
-- Total de rutinas por plan
SELECT
  u.plan,
  COUNT(DISTINCT cr.id) as total_routines,
  AVG(template_count) as avg_templates_per_routine
FROM "CharacterRoutine" cr
JOIN "Agent" a ON cr."agentId" = a.id
JOIN "User" u ON a."userId" = u.id
LEFT JOIN (
  SELECT "routineId", COUNT(*) as template_count
  FROM "RoutineTemplate"
  GROUP BY "routineId"
) rt ON cr.id = rt."routineId"
GROUP BY u.plan;
```

---

## Troubleshooting

### "Permission denied"

```bash
chmod +x scripts/*.ts
```

### "Module not found"

```bash
npm install
```

### Verificar agentes sin rutina

```sql
SELECT COUNT(*) as agents_without_routine
FROM "Agent" a
JOIN "User" u ON a."userId" = u.id
WHERE u.plan IN ('plus', 'ultra')
AND NOT EXISTS (
  SELECT 1 FROM "CharacterRoutine" cr
  WHERE cr."agentId" = a.id
);
```

---

## Recomendaciones

1. ✅ **Siempre empezar con --dry-run**
2. ✅ **Empezar con batch-size pequeño** (5-10)
3. ✅ **Monitorear logs** para detectar errores early
4. ✅ **Tener backup de DB** antes de migración masiva
5. ✅ **Verificar quota de Gemini** antes de empezar
6. ✅ **Migrar en horarios de bajo tráfico** (2am-6am)

---

## Próximos Pasos

Después de la migración:

1. **Comunicar a usuarios premium** que sus personajes ahora tienen rutinas
2. **Crear UI** para que vean/editen rutinas
3. **Monitorear engagement** con la nueva funcionalidad
4. **Recopilar feedback** sobre realismo y experiencia
5. **Iterar** basado en uso real

---

## Soporte

Para problemas o preguntas:
- Revisar logs detallados del script
- Verificar estado de Gemini API
- Consultar `lib/routine/README.md`
- Revisar `ROUTINE_SYSTEM_IMPLEMENTATION.md`

¡Buena suerte con la migración! 🚀
