# Migración del Sistema de Moderación

Instrucciones paso a paso para aplicar el sistema de moderación en tu base de datos.

## Pre-requisitos

- ✅ Código del sistema de moderación ya implementado
- ✅ Acceso a la base de datos PostgreSQL
- ✅ Prisma CLI instalado (`npm install -D prisma`)

## Pasos de Migración

### 1. Verificar Schema

Confirma que `prisma/schema.prisma` contiene los nuevos modelos:

```bash
# Buscar los modelos nuevos
grep -A 20 "MODERATION SYSTEM" prisma/schema.prisma
```

Deberías ver:
- `model ContentViolation`
- `model UserBan`

### 2. Generar Migración

```bash
# Generar archivo de migración
npx prisma migrate dev --name add_moderation_system --create-only

# Esto crea: prisma/migrations/YYYYMMDDHHMMSS_add_moderation_system/
```

### 3. Revisar SQL de Migración

```bash
# Ver el SQL generado
cat prisma/migrations/*/add_moderation_system/migration.sql
```

Debería contener:

```sql
-- CreateTable
CREATE TABLE "ContentViolation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT,
    "reason" TEXT NOT NULL,
    "content" TEXT,
    "severity" TEXT NOT NULL,
    "action" TEXT,
    "metadata" JSONB,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentViolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedBy" TEXT,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "UserBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentViolation_userId_idx" ON "ContentViolation"("userId");
CREATE INDEX "ContentViolation_createdAt_idx" ON "ContentViolation"("createdAt");
CREATE INDEX "ContentViolation_severity_idx" ON "ContentViolation"("severity");
CREATE INDEX "ContentViolation_contentType_idx" ON "ContentViolation"("contentType");
CREATE INDEX "ContentViolation_action_idx" ON "ContentViolation"("action");
CREATE INDEX "ContentViolation_userId_createdAt_idx" ON "ContentViolation"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBan_userId_key" ON "UserBan"("userId");
CREATE INDEX "UserBan_userId_idx" ON "UserBan"("userId");
CREATE INDEX "UserBan_expiresAt_idx" ON "UserBan"("expiresAt");

-- AddForeignKey
ALTER TABLE "ContentViolation" ADD CONSTRAINT "ContentViolation_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBan" ADD CONSTRAINT "UserBan_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 4. Aplicar Migración

```bash
# Aplicar migración a la base de datos
npx prisma migrate deploy
```

**Desarrollo**:
```bash
npx prisma migrate dev
```

**Producción**:
```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### 5. Generar Prisma Client

```bash
# Regenerar el cliente de Prisma con los nuevos modelos
npx prisma generate
```

### 6. Verificar Tablas

```bash
# Abrir Prisma Studio para verificar
npx prisma studio

# O usar psql
psql $DATABASE_URL -c "\\dt ContentViolation"
psql $DATABASE_URL -c "\\dt UserBan"
```

### 7. Verificar Relaciones

```sql
-- Verificar que las foreign keys existan
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('ContentViolation', 'UserBan');
```

## Verificación Post-Migración

### Test 1: Crear Violación

```typescript
// test-db.ts
import { prisma } from './lib/prisma';

async function testViolation() {
  const violation = await prisma.contentViolation.create({
    data: {
      userId: 'test-user-id', // Usar un user ID real de tu DB
      contentType: 'message',
      reason: 'Test violation',
      severity: 'low',
      action: 'warning',
    },
  });

  console.log('✅ Violation created:', violation.id);

  // Cleanup
  await prisma.contentViolation.delete({ where: { id: violation.id } });
  console.log('✅ Violation deleted');
}

testViolation().catch(console.error);
```

```bash
npx tsx test-db.ts
```

### Test 2: Crear Ban

```typescript
async function testBan() {
  const ban = await prisma.userBan.create({
    data: {
      userId: 'test-user-id', // Usar un user ID real
      reason: 'Test ban',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  console.log('✅ Ban created:', ban.id);

  // Cleanup
  await prisma.userBan.delete({ where: { id: ban.id } });
  console.log('✅ Ban deleted');
}

testBan().catch(console.error);
```

### Test 3: Query con Relaciones

```typescript
async function testRelations() {
  // Buscar violaciones de un usuario con info del usuario
  const violations = await prisma.contentViolation.findMany({
    where: { userId: 'test-user-id' },
    include: { user: true },
    take: 10,
  });

  console.log('✅ Found violations:', violations.length);
}

testRelations().catch(console.error);
```

## Rollback (Si es necesario)

### Opción 1: Rollback con Prisma

```bash
# Ver historial de migraciones
npx prisma migrate status

# Rollback última migración
npx prisma migrate resolve --rolled-back add_moderation_system
```

### Opción 2: Rollback Manual

```sql
-- Drop foreign keys primero
ALTER TABLE "ContentViolation" DROP CONSTRAINT "ContentViolation_userId_fkey";
ALTER TABLE "UserBan" DROP CONSTRAINT "UserBan_userId_fkey";

-- Drop tables
DROP TABLE "ContentViolation";
DROP TABLE "UserBan";
```

## Problemas Comunes

### Error: "Relation fields missing"

**Solución**: Asegúrate de que el modelo `User` tenga las relaciones:

```prisma
model User {
  // ... otros campos
  violations ContentViolation[] @relation("UserViolations")
  bans       UserBan[]          @relation("UserBans")
}
```

Luego ejecuta `npx prisma generate` nuevamente.

### Error: "Foreign key constraint failed"

**Solución**: La tabla `User` debe existir antes de crear las tablas de moderación.

```bash
# Verificar que User existe
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

### Error: "Column already exists"

**Solución**: Ya aplicaste la migración. Verifica:

```bash
npx prisma migrate status
```

Si la migración ya fue aplicada, solo ejecuta:

```bash
npx prisma generate
```

## Configuración Adicional

### 1. Crear Usuario Admin

```sql
-- Dar permisos de admin a un usuario existente
UPDATE "User"
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

### 2. Verificar Permisos

```typescript
import { prisma } from './lib/prisma';

const user = await prisma.user.findUnique({
  where: { email: 'admin@example.com' },
  select: { metadata: true },
});

console.log('User metadata:', user?.metadata);
// Debería mostrar: { role: 'admin' }
```

### 3. Test Endpoints

```bash
# Test moderation endpoint (requiere estar autenticado)
curl -X POST http://localhost:3000/api/agents/AGENT_ID/message \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"content": "FREE MONEY!!! CLICK NOW!!!"}'

# Debería retornar 400 con mensaje de moderación
```

## Monitoreo Post-Deploy

### Queries Útiles

```sql
-- Ver total de violaciones
SELECT COUNT(*) FROM "ContentViolation";

-- Ver violaciones por severidad
SELECT severity, COUNT(*)
FROM "ContentViolation"
GROUP BY severity;

-- Ver top 10 usuarios con más violaciones
SELECT "userId", COUNT(*) as violations
FROM "ContentViolation"
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY "userId"
ORDER BY violations DESC
LIMIT 10;

-- Ver usuarios actualmente baneados
SELECT * FROM "UserBan"
WHERE "expiresAt" IS NULL OR "expiresAt" > NOW();
```

### Logs de Aplicación

```bash
# Ver logs de moderación
grep "moderation" logs/app.log | tail -50

# Ver violaciones bloqueadas
grep "blocked by moderation" logs/app.log | wc -l
```

## Mantenimiento

### Limpieza Periódica (Opcional)

```sql
-- Limpiar violaciones antiguas de baja severidad (>30 días)
DELETE FROM "ContentViolation"
WHERE severity = 'low'
  AND "createdAt" < NOW() - INTERVAL '30 days';

-- Limpiar bans expirados
DELETE FROM "UserBan"
WHERE "expiresAt" IS NOT NULL
  AND "expiresAt" < NOW();
```

Crear un cron job:

```bash
# Ejecutar limpieza semanalmente
0 0 * * 0 psql $DATABASE_URL -f cleanup-violations.sql
```

## Checklist Final

- [ ] Schema actualizado con nuevos modelos
- [ ] Migración generada
- [ ] SQL de migración revisado
- [ ] Migración aplicada en development
- [ ] Prisma client regenerado
- [ ] Tablas verificadas en DB
- [ ] Foreign keys verificadas
- [ ] Tests de creación pasados
- [ ] Tests de queries con relaciones pasados
- [ ] Usuario admin configurado
- [ ] Endpoints probados
- [ ] Logs de aplicación monitoreados
- [ ] Migración aplicada en producción
- [ ] Sistema funcionando en producción

## Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs de Prisma: `prisma migrate dev --create-only`
2. Verifica el estado: `npx prisma migrate status`
3. Consulta la documentación: `docs/MODERATION_SYSTEM.md`
4. Ejecuta tests: `npx tsx scripts/test-moderation.ts`

---

**Última actualización**: 2025-10-31
