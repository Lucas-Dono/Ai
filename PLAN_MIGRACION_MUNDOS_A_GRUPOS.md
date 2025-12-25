# PLAN DE MIGRACIÓN: MUNDOS → GRUPOS

## RESUMEN EJECUTIVO

Este documento describe la estrategia completa para migrar el sistema de "Mundos/Worlds" a "Grupos/Groups" en toda la aplicación.

**Alcance**: ~200-250 archivos afectados
**Duración estimada**: 32-45 horas de desarrollo (25-35 con paralelización)
**Período de transición**: 1-2 semanas de backward compatibility antes de limpieza final
**Riesgo**: MEDIO-ALTO (mitigado con estrategia de fases y rollback)

---

## ESTRATEGIA: STRANGLER FIG PATTERN

Usaremos una migración **gradual y reversible** en lugar de un "big bang":

1. **Type Aliases**: Crear aliases temporales que permitan usar ambos nombres
2. **API Versioning**: Mantener APIs antiguas con redirects/proxies
3. **Feature Flags**: Controlar el rollout progresivo
4. **Database Migration**: Migración de schema con backward compatibility usando `@@map`
5. **Phased Rollout**: Migrar capa por capa con verificación

**Ventaja clave**: La aplicación seguirá funcionando durante toda la migración.

---

## FASE 0: PREPARACIÓN Y SAFETY NETS
**Duración**: 2-3 horas
**Objetivo**: Crear infraestructura de seguridad y reversión

### Tareas

1. **Backup de base de datos**
```bash
pg_dump -h <host> -U <user> -d <database> > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
```

2. **Crear rama de feature**
```bash
git checkout -b feature/worlds-to-groups-migration
git add -A
git commit -m "chore: Pre-migration checkpoint - World system snapshot"
```

3. **Configurar feature flags** en `/lib/feature-flags/config.ts`
```typescript
GROUPS_MIGRATION: {
  enabled: process.env.NEXT_PUBLIC_ENABLE_GROUPS === 'true',
  phases: {
    DATABASE: process.env.GROUPS_MIGRATION_DB === 'true',
    BACKEND: process.env.GROUPS_MIGRATION_BACKEND === 'true',
    FRONTEND: process.env.GROUPS_MIGRATION_FRONTEND === 'true',
    MOBILE: process.env.GROUPS_MIGRATION_MOBILE === 'true',
  }
}
```

4. **Crear logger de migración** en `/lib/logger/migration-logger.ts`

### Verificación
- [ ] Backup creado y verificado
- [ ] Rama de feature creada
- [ ] Feature flags configurados
- [ ] Logger funcionando

---

## FASE 1: BASE DE DATOS - MIGRACIÓN DE SCHEMA
**Duración**: 4-6 horas
**Objetivo**: Renombrar modelos en Prisma SIN migrar datos

### Estrategia Clave: Uso de `@@map`

**CRÍTICO**: Usaremos `@@map("World")` para mapear el nuevo modelo `Group` a la tabla existente `World`. Esto significa:
- ✅ NO se necesita migración de datos
- ✅ Las tablas de PostgreSQL mantienen sus nombres originales
- ✅ Solo cambiamos los nombres en TypeScript/Prisma
- ✅ Migración reversible sin pérdida de datos

### Cambios en `/prisma/schema.prisma`

#### Modelo Principal: World → Group

```prisma
model Group {
  id String @id @default(cuid())
  userId String?
  name String
  description String?

  // Sistema de grupos predefinidos
  isPredefined Boolean @default(false)
  category String?
  featured Boolean @default(false)
  difficulty String?

  // Configuración del entorno
  scenario String? @db.Text
  initialContext String? @db.Text
  rules Json?

  // Estado de la simulación
  status GroupStatus @default(STOPPED)
  visibility String @default("private")

  // Configuración de simulación
  autoMode Boolean @default(true)
  turnsPerCycle Int @default(1)
  interactionDelay Int @default(3000)
  maxInteractions Int?

  // Configuración de personalidad grupal
  allowEmotionalBonds Boolean @default(true)
  allowConflicts Boolean @default(true)
  topicFocus String?

  // Sistema de narrativa guiada
  storyMode Boolean @default(false)
  currentStoryBeat String?
  storyProgress Float @default(0)
  directorAgentId String?
  storyScript Json?
  directorState Json?
  currentSceneDirection Json?
  currentEmergentEvent Json?

  // Especificación editable
  worldSpec Json?
  creationMode String?

  // Métricas
  viewCount Int @default(0)
  totalTimeSpent Int @default(0)
  lastViewedAt DateTime?
  rating Float?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  groupMembers GroupMember[]
  messages Message[]
  interactions GroupInteraction[]
  simulationState GroupSimulationState?
  agentRelations AgentToAgentRelation[]
  storyEvents StoryEvent[]
  characterArcs CharacterArc[]

  // Índices
  @@index([userId])
  @@index([status])
  @@index([visibility])
  @@index([isPredefined])
  @@index([category])
  @@index([featured])
  @@index([storyMode])
  @@index([viewCount])
  @@index([rating])
  @@index([lastViewedAt])

  @@map("World") // CRÍTICO: Mapea a tabla existente
}
```

#### Enum: WorldStatus → GroupStatus

```prisma
enum GroupStatus {
  RUNNING
  PAUSED
  STOPPED

  @@map("WorldStatus")
}
```

#### Modelo: WorldAgent → GroupMember

```prisma
model GroupMember {
  groupId String
  agentId String
  joinedAt DateTime @default(now())

  role String?
  isActive Boolean @default(true)
  totalInteractions Int @default(0)
  lastInteractionAt DateTime?

  importanceLevel String @default("secondary")
  screenTime Int @default(0)
  promotionScore Float @default(0.5)
  characterArcStage String?
  emotionalState Json?
  isFocused Boolean @default(false)
  focusedUntil DateTime?

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  agent Agent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@id([groupId, agentId])
  @@index([groupId, isActive])
  @@index([groupId, importanceLevel])

  @@map("WorldAgent")
}
```

#### Otros modelos (WorldInteraction, WorldSimulationState, etc.)

Seguir el mismo patrón con `@@map` para todos los modelos relacionados.

### Comandos

```bash
# Actualizar schema.prisma (manualmente según arriba)

# Generar migración
npx prisma migrate dev --name rename_worlds_to_groups --create-only

# IMPORTANTE: Revisar migración generada
cat prisma/migrations/*/migration.sql
# Debe estar VACÍA o mínima porque usamos @@map

# Aplicar migración
npx prisma migrate dev

# Regenerar cliente Prisma
npx prisma generate

# Verificar tipos
npx tsc --noEmit

# Commit
git add prisma/
git commit -m "feat(db): Rename World models to Group with @@map compatibility"
```

### Verificación
- [ ] Schema actualizado con `@@map`
- [ ] Migración aplicada (vacía o mínima)
- [ ] Prisma Client regenerado
- [ ] Tipos TypeScript correctos
- [ ] Tablas de BD sin cambios (verificar con psql)
- [ ] Datos existentes accesibles

```bash
# Verificar tablas
psql -h <host> -U <user> -d <database> -c "\dt" | grep -i world

# Verificar datos
psql -h <host> -U <user> -d <database> -c "SELECT COUNT(*) FROM \"World\";"
```

---

## FASE 2: BACKEND - SERVICIOS Y LÓGICA
**Duración**: 6-8 horas
**Objetivo**: Actualizar servicios manteniendo compatibilidad

### Estrategia

1. Crear nuevo directorio `/lib/groups/`
2. Copiar archivos de `/lib/worlds/`
3. Actualizar imports, tipos y nombres
4. Mantener `/lib/worlds/` con wrappers de compatibilidad

### Estructura

```
lib/groups/
├── types.ts
├── simulation-engine.ts
├── story-engine.ts
├── ai-director.ts
├── world-generator.ts
├── group-state-redis.ts
├── group-state-manager.ts
├── templates.ts
├── event-types.ts
├── emergent-events.ts
├── character-importance-manager.ts
├── narrative-analyzer.ts
├── director-prompts.ts
├── event-application.service.ts
└── jobs/
    ├── auto-pause-job.ts
    ├── cleanup-job.ts
    ├── emergent-events-job.ts
    ├── memory-consolidation-job.ts
    └── sync-job.ts
```

### Ejemplo: simulation-engine.ts

**Nuevo archivo**: `/lib/groups/simulation-engine.ts`
```typescript
export class GroupSimulationEngine {
  async startSimulation(groupId: string) {
    // Lógica actualizada
  }

  async stopSimulation(groupId: string) {
    // ...
  }

  async pauseSimulation(groupId: string) {
    // ...
  }
}
```

**Wrapper de compatibilidad**: `/lib/worlds/simulation-engine.ts`
```typescript
import { GroupSimulationEngine } from '@/lib/groups/simulation-engine';

/**
 * @deprecated Use GroupSimulationEngine from @/lib/groups/simulation-engine instead
 */
export class WorldSimulationEngine extends GroupSimulationEngine {
  // Hereda todo
}

// Re-export para compatibilidad
export { GroupSimulationEngine };
```

### Redis Keys con Migración Automática

**Archivo**: `/lib/groups/group-state-redis.ts`

```typescript
const REDIS_KEYS = {
  state: (groupId: string) => `group:${groupId}:state`,
  lock: (groupId: string) => `group:${groupId}:lock`,

  // Legacy keys
  legacyState: (worldId: string) => `world:${worldId}:state`,
  legacyLock: (worldId: string) => `world:${worldId}:lock`,
};

async getGroupState(groupId: string): Promise<GroupState | null> {
  // Intentar nueva clave
  let state = await this.redis.get(REDIS_KEYS.state(groupId));

  if (!state) {
    // Fallback a clave antigua y migrar
    state = await this.redis.get(REDIS_KEYS.legacyState(groupId));
    if (state) {
      await this.redis.set(REDIS_KEYS.state(groupId), state);
      migrationLogger.info({ groupId }, 'Migrated Redis key');
    }
  }

  return state;
}
```

### Middleware: world-access.ts → group-access.ts

**Nuevo**: `/lib/middleware/group-access.ts`
```typescript
export function canAccessGroup(groupId: string, userPlan: string): GroupAccessResult {
  // Lógica actualizada
}

export function canCreateGroup(count: number, userPlan: string): GroupAccessResult {
  // Lógica actualizada
}

export const FREE_GROUPS = ["academia-sakura"];
```

**Wrapper**: `/lib/middleware/world-access.ts`
```typescript
export {
  canAccessGroup as canAccessWorld,
  canCreateGroup as canCreateWorld,
  FREE_GROUPS as FREE_WORLDS,
  type GroupAccessResult as WorldAccessResult
} from './group-access';
```

### Comandos

```bash
# Crear directorio
mkdir -p lib/groups

# Copiar archivos
cp -r lib/worlds/* lib/groups/

# Actualizar imports y nombres en lib/groups/ (manualmente o con scripts)
# - World → Group
# - world → group
# - WorldAgent → GroupMember
# etc.

# Verificar tipos
npx tsc --noEmit

# Ejecutar tests
npm test -- __tests__/lib/groups/

# Commit
git add lib/groups/ lib/worlds/
git commit -m "feat(backend): Migrate world services to groups with compatibility"
```

### Verificación
- [ ] Servicios copiados a `/lib/groups/`
- [ ] Wrappers creados en `/lib/worlds/`
- [ ] Redis keys con fallback
- [ ] Tests pasando
- [ ] Sin errores de TypeScript

---

## FASE 3: API - ENDPOINTS Y RUTAS
**Duración**: 4-6 horas
**Objetivo**: Crear nuevas APIs manteniendo las antiguas

### Estrategia: Proxies en lugar de Redirects

Mantener `/api/worlds/*` funcionando mediante proxies a `/api/groups/*`:

```typescript
// app/api/worlds/route.ts
import { GET as getGroups, POST as postGroups } from '../groups/route';

/**
 * @deprecated Use /api/groups instead
 */
export async function GET(req: NextRequest) {
  console.warn('[DEPRECATED] /api/worlds → /api/groups');
  return getGroups(req);
}

export async function POST(req: NextRequest) {
  console.warn('[DEPRECATED] /api/worlds → /api/groups');
  return postGroups(req);
}
```

### Estructura de Nuevos Endpoints

```
app/api/groups/
├── route.ts (GET, POST)
├── [id]/
│   ├── route.ts (GET, PUT, DELETE)
│   ├── message/route.ts
│   ├── start/route.ts
│   ├── stop/route.ts
│   ├── pause/route.ts
│   ├── reset-status/route.ts
│   ├── agents/route.ts
│   ├── clone/route.ts
│   ├── interactions/route.ts
│   └── track-view/route.ts
├── predefined/route.ts
├── trending/route.ts
├── ai/
│   └── generate/route.ts
└── tts/route.ts
```

### Ejemplo: Endpoint Principal

**Nuevo**: `/app/api/groups/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  const groups = await prisma.group.findMany({
    where: { userId: session.user.id },
    include: {
      groupMembers: {
        include: { agent: true }
      },
      simulationState: true
    }
  });

  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const body = await req.json();

  const group = await prisma.group.create({
    data: {
      ...body,
      userId: session.user.id
    }
  });

  return NextResponse.json(group);
}
```

**Proxy**: `/app/api/worlds/route.ts`
```typescript
import { GET as getGroups, POST as postGroups } from '../groups/route';

export async function GET(req: NextRequest) {
  console.warn('[DEPRECATED] /api/worlds is deprecated');
  return getGroups(req);
}

export async function POST(req: NextRequest) {
  console.warn('[DEPRECATED] /api/worlds is deprecated');
  return postGroups(req);
}
```

### Comandos

```bash
# Crear directorio
mkdir -p app/api/groups

# Copiar estructura
cp -r app/api/worlds/* app/api/groups/

# Actualizar imports y lógica (manualmente)
# - @/lib/worlds/* → @/lib/groups/*
# - prisma.world → prisma.group
# - worldId → groupId

# Actualizar endpoints antiguos con proxies

# Verificar build
npm run build

# Probar endpoints
curl http://localhost:3000/api/groups
curl http://localhost:3000/api/worlds

# Commit
git add app/api/groups/ app/api/worlds/
git commit -m "feat(api): Create /api/groups with /api/worlds proxies"
```

### Verificación
- [ ] Nuevos endpoints en `/api/groups/*`
- [ ] Proxies en `/api/worlds/*`
- [ ] Build sin errores
- [ ] GET /api/groups funciona
- [ ] POST /api/groups funciona
- [ ] /api/worlds redirige correctamente

---

## FASE 4: FRONTEND - PÁGINAS Y COMPONENTES
**Duración**: 6-8 horas
**Objetivo**: Migrar UI manteniendo URLs con redirects

### Nuevas Rutas

```
app/dashboard/grupos/
├── page.tsx (lista)
├── [id]/page.tsx (detalle)
└── crear/
    ├── page.tsx
    ├── simple/page.tsx
    └── avanzado/page.tsx
```

### Redirects Automáticos

**Opción 1: Redirects en Componentes**

```typescript
// app/dashboard/mundos/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MundosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/grupos');
  }, [router]);

  return null;
}
```

**Opción 2: Redirects en Middleware**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard/mundos')) {
    const newPath = pathname.replace('/dashboard/mundos', '/dashboard/grupos');
    return NextResponse.redirect(new URL(newPath, request.url), 308);
  }

  // ... resto
}
```

### Componentes

```
components/groups/
├── AgentSelector.tsx
├── TrendingGroupsCarousel.tsx
├── GroupPausedBadge.tsx
├── GroupPausedBanner.tsx
├── creator/
├── creator-v2/
├── panels/
│   └── GroupStatePanel.tsx
└── visual-novel/
    ├── VisualNovelViewer.tsx
    ├── VNStage.tsx
    ├── DialogueBox.tsx
    ├── SimulationControls.tsx
    └── CharacterSprite.tsx
```

### Ejemplo de Componente Migrado

**Nuevo**: `/components/groups/TrendingGroupsCarousel.tsx`
```typescript
export function TrendingGroupsCarousel() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch('/api/groups/trending')
      .then(res => res.json())
      .then(setGroups);
  }, []);

  return (
    <div className="carousel">
      {groups.map(group => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
```

**Re-export**: `/components/worlds/TrendingWorldsCarousel.tsx`
```typescript
/**
 * @deprecated Use TrendingGroupsCarousel
 */
export { TrendingGroupsCarousel as TrendingWorldsCarousel } from '@/components/groups/TrendingGroupsCarousel';
```

### Comandos

```bash
# Crear directorios
mkdir -p app/dashboard/grupos
mkdir -p components/groups

# Copiar archivos
cp -r app/dashboard/mundos/* app/dashboard/grupos/
cp -r components/worlds/* components/groups/

# Actualizar imports, API calls, traducciones (manualmente)

# Crear redirects en mundos/

# Verificar build
npm run build

# Dev server
npm run dev

# Commit
git add app/dashboard/grupos/ components/groups/
git commit -m "feat(frontend): Create grupos pages/components with redirects"
```

### Verificación
- [ ] Páginas creadas en `/app/dashboard/grupos/*`
- [ ] Redirects desde `/dashboard/mundos/*`
- [ ] Componentes en `/components/groups/*`
- [ ] Re-exports de compatibilidad
- [ ] Build sin errores
- [ ] UI renderiza correctamente
- [ ] Navegación funciona

---

## FASE 5: TRADUCCIONES
**Duración**: 2-3 horas
**Objetivo**: Actualizar i18n con fallbacks

### Archivos a Actualizar

- `messages/es.json`
- `messages/en.json`
- `messages/es-landing.json`
- `mobile/src/i18n/locales/es.json`

### Estructura de Traducciones

**messages/es.json**
```json
{
  "groups": {
    "title": "Grupos",
    "description": "Crea y gestiona grupos de IAs",
    "myGroups": "Mis Grupos",
    "predefinedGroups": "Grupos Predefinidos",
    "createGroup": "Crear Grupo",
    "groupSettings": "Configuración del Grupo",
    "members": "Miembros",
    "simulation": "Simulación",
    "status": {
      "running": "En Ejecución",
      "paused": "Pausado",
      "stopped": "Detenido"
    }
  },

  "worlds": {
    // Mantener temporalmente para compatibilidad
    "title": "Mundos",
    ...
  }
}
```

### Helper con Fallback

```typescript
// lib/i18n/translation-helper.ts
import { useTranslations } from 'next-intl';

export function useGroupTranslations() {
  const t = useTranslations();

  return {
    t: (key: string, ...args: any[]) => {
      const groupKey = `groups.${key}`;
      let translation = t(groupKey, ...args);

      // Fallback a world key
      if (translation === groupKey) {
        translation = t(`worlds.${key}`, ...args);
      }

      return translation;
    }
  };
}
```

### Comandos

```bash
# Actualizar archivos manualmente

# Verificar build
npm run build

# Commit
git add messages/
git commit -m "feat(i18n): Add groups translations with fallbacks"
```

### Verificación
- [ ] Traducciones en español
- [ ] Traducciones en inglés
- [ ] Fallbacks funcionando
- [ ] UI mostrando textos correctos

---

## FASE 6: MOBILE APP
**Duración**: 3-4 horas
**Objetivo**: Actualizar mobile con compatibilidad

### Navegación

```typescript
// mobile/src/navigation/types.ts
export type RootStackParamList = {
  GroupsList: undefined;
  GroupDetail: { groupId: string };
  CreateGroup: undefined;

  // DEPRECATED
  WorldsList: undefined;
  WorldDetail: { worldId: string };
};
```

### API Service

```typescript
// mobile/src/services/api/groups.api.ts
export const groupsApi = {
  async fetchGroups() {
    return api.get('/api/groups');
  },

  async fetchGroupById(id: string) {
    return api.get(`/api/groups/${id}`);
  },
};

// mobile/src/services/api/worlds.api.ts
export const worldsApi = {
  fetchWorlds: groupsApi.fetchGroups,
  fetchWorldById: groupsApi.fetchGroupById,
};
```

### Componentes

```typescript
// mobile/src/components/ui/GroupCard.tsx
export function GroupCard({ group }) {
  // Nueva implementación
}

// mobile/src/components/ui/WorldCard.tsx
export function WorldCard({ world }) {
  return <GroupCard group={world} />;
}
```

### Comandos

```bash
cd mobile

# Actualizar navegación, componentes, API

# Build
npm run build

# Tests
npm test

# Commit
cd ..
git add mobile/
git commit -m "feat(mobile): Migrate to groups with compatibility"
```

### Verificación
- [ ] Navegación actualizada
- [ ] Componentes migrados
- [ ] API calls actualizados
- [ ] Build sin errores
- [ ] Tests pasando

---

## FASE 7: TESTS Y DOCUMENTACIÓN
**Duración**: 3-4 horas
**Objetivo**: Tests y docs actualizados

### Tests

```
__tests__/lib/groups/
├── group-agent-memory.test.ts
├── group-simulation-engine.test.ts
└── group-state-redis.test.ts
```

### Documentación

**Nuevo**: `docs/GROUPS_SYSTEM.md`
```markdown
# Sistema de Grupos

El sistema de "Mundos" ha sido renombrado a "Grupos".

## Migración

- `World` → `Group`
- `WorldAgent` → `GroupMember`
- URLs: `/dashboard/mundos` → `/dashboard/grupos`
- APIs: `/api/worlds` → `/api/groups`

## Compatibilidad

Las URLs antiguas redirigen automáticamente.
```

### Comandos

```bash
# Copiar tests
cp -r __tests__/lib/worlds/* __tests__/lib/groups/

# Actualizar tests

# Ejecutar
npm test

# Commit
git add __tests__/ docs/
git commit -m "feat(tests): Migrate tests and update docs"
```

### Verificación
- [ ] Tests migrados
- [ ] Tests pasando (100%)
- [ ] Docs actualizados
- [ ] Coverage > 80%

---

## FASE 8: LIMPIEZA (POST-LAUNCH)
**Duración**: 2-3 horas
**Ejecutar**: Después de 1-2 semanas en producción

### Remover Código Deprecated

```bash
rm -rf lib/worlds/
rm -rf components/worlds/
rm -rf app/api/worlds/
rm -rf app/dashboard/mundos/
rm -rf __tests__/lib/worlds/
```

### Limpiar Traducciones

Remover secciones `"worlds"` de archivos de traducción.

### Migrar Redis Keys

```typescript
// scripts/migrate-redis-keys.ts
async function migrateRedisKeys() {
  const worldKeys = await redis.keys('world:*');

  for (const oldKey of worldKeys) {
    const newKey = oldKey.replace(/^world:/, 'group:');
    const value = await redis.get(oldKey);

    if (value) {
      await redis.set(newKey, value);
      // Opcional: await redis.del(oldKey);
    }
  }
}
```

### Actualizar Schema Final

Remover `@@map` de schema.prisma (requiere migración de tablas):

```bash
npx prisma migrate dev --name finalize_groups_migration
npx prisma migrate deploy
```

### Verificación
- [ ] Código deprecated eliminado
- [ ] Traducciones limpias
- [ ] Redis migrado
- [ ] Sin warnings
- [ ] App funcionando

---

## ESTRATEGIA DE ROLLBACK

### Rollback Rápido (< 5 min)

```bash
# Revertir deploy
vercel rollback <deployment-id>

# Revertir código
git revert HEAD~1
git push origin main
```

### Rollback de Base de Datos

```bash
# Restaurar backup
psql -h <host> -U <user> -d <database> < backup_pre_migration.sql
```

**Nota**: Si usaste `@@map`, NO necesitas rollback de BD.

---

## CRONOGRAMA

| Fase | Duración | Puede paralelizarse |
|------|----------|---------------------|
| 0 - Preparación | 2-3h | No |
| 1 - Base de Datos | 4-6h | No |
| 2 - Backend | 6-8h | No |
| 3 - API | 4-6h | Parcial |
| 4 - Frontend | 6-8h | Sí |
| 5 - Traducciones | 2-3h | Sí |
| 6 - Mobile | 3-4h | Sí |
| 7 - Tests/Docs | 3-4h | Parcial |
| 8 - Limpieza | 2-3h | No |

**Total**: 32-45 horas
**Con paralelización**: 25-35 horas

---

## ARCHIVOS CRÍTICOS

1. `/prisma/schema.prisma` - **ALTO RIESGO** - Usar `@@map`
2. `/lib/worlds/types.ts` → `/lib/groups/types.ts` - MEDIO
3. `/lib/worlds/simulation-engine.ts` - **ALTO** - Cron jobs
4. `/lib/worlds/world-state-redis.ts` - **ALTO** - Estado de simulaciones
5. `/app/api/worlds/route.ts` - MEDIO - Endpoint principal
6. `/app/dashboard/mundos/page.tsx` - MEDIO - UX
7. `/lib/middleware/world-access.ts` - **ALTO** - Seguridad
8. `/messages/es.json` - BAJO - UI
9. `/lib/worlds/jobs/cron-manager.ts` - MEDIO - Jobs automáticos
10. `/mobile/src/services/api/worlds.api.ts` - MEDIO - Mobile

---

## RECOMENDACIONES

1. **Usar `@@map`**: CRÍTICO para evitar migración de datos
2. **Backward compatibility**: Mantener 1-2 semanas
3. **Monitorear errores**: Usar Sentry
4. **Feature flags**: Controlar rollout
5. **Tests exhaustivos**: No saltar Fase 7
6. **Comunicar cambios**: Avisar a usuarios
7. **Documentar**: Mantener docs actualizadas
8. **Rollback preparado**: Tener plan probado
9. **Deploy en bajo tráfico**: Madrugada/fin de semana
10. **Equipo disponible**: Post-deploy support

---

## SIGUIENTE PASO

Una vez aprobado este plan, procederemos con la **Fase 0: Preparación** para crear la infraestructura de seguridad antes de comenzar con los cambios.

¿Apruebas este plan o necesitas ajustes?
