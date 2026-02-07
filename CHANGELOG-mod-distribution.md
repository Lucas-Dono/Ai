# Sistema de Distribución del Mod de Minecraft - Changelog

## 🎯 Implementación Completada: 2026-01-29

### Resumen

Se implementó un sistema completo de distribución del mod de Minecraft desde el servidor propio, reemplazando la dependencia de GitHub Releases. El sistema usa Cloudflare R2 para almacenamiento y proporciona endpoints API, scripts CLI y panel de administración web.

---

## 📦 Componentes Implementados

### 1. **Base de Datos**

#### Modelo `MinecraftModVersion` (Prisma)
```prisma
model MinecraftModVersion {
  id           String    @id @default(cuid())
  version      String    @unique
  downloadUrl  String
  storageKey   String
  changelog    String    @db.Text
  releaseDate  DateTime  @default(now())
  fileSize     BigInt
  sha256       String
  required     Boolean   @default(false)
  minimumVersion String?
  isLatest     Boolean   @default(false)
  downloadCount Int      @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

**Características:**
- Almacenamiento de metadata de versiones
- Tracking de descargas
- Hash SHA-256 para verificación de integridad
- Flag "latest" para distribución automática
- Soporte para actualizaciones obligatorias

---

### 2. **Sistema de Almacenamiento**

#### Extensión de `lib/storage/cloud-storage.ts`

**Nuevos métodos agregados a `StorageService`:**
```typescript
uploadFile(buffer: Buffer, key: string, contentType?: string): Promise<string>
getFile(key: string): Promise<Buffer>
deleteFile(key: string): Promise<void>
```

**Implementaciones:**
- ✅ S3/R2StorageService (producción)
- ✅ LocalStorageService (desarrollo)

**Storage keys:**
```
minecraft-mod/blaniel-mc-{version}.jar
```

---

### 3. **Servicio de Gestión de Versiones**

#### `lib/minecraft/mod-version-service.ts`

**Métodos principales:**

| Método | Descripción |
|--------|-------------|
| `getLatestVersion()` | Obtener la versión más reciente |
| `checkForUpdate(currentVersion)` | Verificar si hay actualización disponible |
| `getModFile(version)` | Obtener archivo JAR de una versión |
| `uploadNewVersion(params)` | Subir nueva versión a R2/S3 |
| `deleteVersion(version)` | Eliminar versión del sistema |
| `listVersions()` | Listar todas las versiones |
| `setLatestVersion(version)` | Marcar versión como "latest" |
| `getDownloadStats()` | Obtener estadísticas de descargas |

**Características:**
- Cálculo automático de SHA-256
- Gestión de flag "latest"
- Tracking automático de descargas
- Comparación de versiones semver

---

### 4. **Endpoints de API**

#### `GET /api/v1/minecraft/mod/version`

**Query params:**
- `currentVersion`: Versión actual del mod del cliente (opcional)

**Respuesta:**
```json
{
  "version": "0.2.0",
  "downloadUrl": "https://tuservidor.com/api/v1/minecraft/mod/download/0.2.0",
  "changelog": "# Versión 0.2.0\n\n- Nueva feature...",
  "releaseDate": "2026-01-29T00:00:00.000Z",
  "required": false,
  "minimumVersion": "0.1.0",
  "fileSize": 307200,
  "sha256": "abc123...",
  "hasUpdate": true,
  "currentVersion": "0.1.0",
  "updateAvailable": true
}
```

---

#### `GET /api/v1/minecraft/mod/download/[version]`

**Características:**
- Descarga directa del archivo JAR
- Headers optimizados para cache (1 año)
- Content-Type: `application/java-archive`
- Incrementa contador de descargas automáticamente

**Headers de respuesta:**
```
Content-Type: application/java-archive
Content-Disposition: attachment; filename="blaniel-mc-{version}.jar"
Content-Length: {tamaño}
Cache-Control: public, max-age=31536000, immutable
X-Mod-Version: {version}
```

---

#### `POST /api/v1/minecraft/mod/upload`

**Autenticación:** Admin only (email en `ADMIN_EMAIL`)

**Body (multipart/form-data):**
- `file`: Archivo JAR del mod
- `version`: Versión semver (ej: "0.2.0")
- `changelog`: Novedades de esta versión
- `required`: (opcional) Si es obligatorio actualizar
- `minimumVersion`: (opcional) Versión mínima compatible

---

#### `GET /api/v1/minecraft/mod/upload`

**Autenticación:** Admin only

**Respuesta:**
```json
{
  "versions": [...],
  "stats": {
    "totalVersions": 3,
    "totalDownloads": 1542,
    "latestVersion": "0.2.0",
    "latestDownloads": 823,
    "versions": [...]
  }
}
```

---

#### `DELETE /api/v1/minecraft/mod/upload?version=X.X.X`

**Autenticación:** Admin only

**Acción:**
- Elimina archivo de R2/S3
- Elimina registro de BD

---

### 5. **Scripts CLI**

Ubicación: `scripts/minecraft/`

#### `upload-initial-version.ts`
**Propósito:** Migración inicial de GitHub al servidor propio

```bash
npx tsx scripts/minecraft/upload-initial-version.ts
```

**Acciones:**
- Busca JAR de versión 0.1.0 compilado
- Calcula SHA-256
- Sube a Cloudflare R2
- Crea registro en BD
- Marca como "latest"

---

#### `upload-mod-version.ts`
**Propósito:** Subir nuevas versiones

```bash
npx tsx scripts/minecraft/upload-mod-version.ts \
  --jar Juego/Blaniel-MC/build/libs/blaniel-mc-0.2.0.jar \
  --version 0.2.0 \
  --changelog "Descripción de cambios..." \
  [--required] \
  [--minimum-version 0.1.0]
```

---

#### `list-mod-versions.ts`
**Propósito:** Ver todas las versiones

```bash
npx tsx scripts/minecraft/list-mod-versions.ts
```

**Salida:**
```
📊 Estadísticas Generales:
   Total de versiones: 3
   Total de descargas: 1,542
   Versión actual: 0.2.0

┌─────────────┬──────────────────────┬─────────────┬────────────┬──────────┬──────────┐
│ Versión     │ Fecha de Lanzamiento │ Tamaño      │ Descargas  │ Latest   │ Required │
├─────────────┼──────────────────────┼─────────────┼────────────┼──────────┼──────────┤
│ 0.2.0       │ 2026-01-29           │ 300.50 KB   │ 823        │ ✓        │          │
└─────────────┴──────────────────────┴─────────────┴────────────┴──────────┴──────────┘
```

---

#### `delete-mod-version.ts`
**Propósito:** Eliminar versiones antiguas

```bash
npx tsx scripts/minecraft/delete-mod-version.ts --version 0.1.5
```

**Seguridad:**
- Requiere confirmación escribiendo "ELIMINAR"
- Elimina permanentemente archivo y registro

---

#### `set-latest-version.ts`
**Propósito:** Marcar una versión como "latest" (rollback)

```bash
npx tsx scripts/minecraft/set-latest-version.ts --version 0.1.5
```

---

### 6. **Panel de Administración Web**

#### Ubicación: `/congrats/minecraft-mod`

**Características:**
- ✅ Vista de todas las versiones
- ✅ Estadísticas de descargas
- ✅ Tarjetas de métricas (total versiones, descargas, latest)
- ✅ Tabla con detalles de cada versión
- ✅ Descarga directa de versiones
- ✅ Guías de comandos CLI
- ✅ Información del sistema de distribución

**Integración:**
- Agregado al menú lateral con ícono de paquete
- Usa el mismo sistema de autenticación del panel admin
- Responsive y con estilos consistentes

---

## 🚀 Flujo de Trabajo

### Primera Vez (Migración)

1. **Compilar mod:**
   ```bash
   cd Juego/Blaniel-MC
   ./gradlew clean build
   ```

2. **Aplicar cambios de BD:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Subir versión inicial:**
   ```bash
   npx tsx scripts/minecraft/upload-initial-version.ts
   ```

4. **Verificar en panel admin:**
   - Ir a `/congrats/minecraft-mod`
   - Ver versión 0.1.0 listada

---

### Lanzar Nueva Versión

1. **Actualizar versión en código:**
   ```java
   // ModUpdateChecker.java
   private static final String CURRENT_VERSION = "0.2.0";
   ```

2. **Compilar:**
   ```bash
   cd Juego/Blaniel-MC
   ./gradlew clean build
   ```

3. **Subir al servidor:**
   ```bash
   npx tsx scripts/minecraft/upload-mod-version.ts \
     --jar Juego/Blaniel-MC/build/libs/blaniel-mc-0.2.0.jar \
     --version 0.2.0 \
     --changelog "$(cat CHANGELOG.md)"
   ```

4. **Verificar:**
   - CLI: `npx tsx scripts/minecraft/list-mod-versions.ts`
   - Web: `/congrats/minecraft-mod`
   - API: `curl http://localhost:3000/api/v1/minecraft/mod/version`

---

## 💰 Costos y Beneficios

### Cloudflare R2 (Gratis)

**Plan gratuito incluye:**
- 10 GB de almacenamiento
- 1M operaciones Clase A/mes (escrituras)
- 10M operaciones Clase B/mes (lecturas)
- **Egress GRATIS** (sin cargo por transferencia)

**Proyección de costos:**

| Usuarios | Versiones | Almacenamiento | Descargas/mes | Costo/mes |
|----------|-----------|----------------|---------------|-----------|
| 1,000 | 3 | ~1 MB | 3,000 | $0 |
| 10,000 | 5 | ~1.5 MB | 30,000 | $0 |
| 100,000 | 10 | ~3 MB | 300,000 | $0 |

**Tamaño del mod:** ~300 KB por versión

---

### Ventajas vs GitHub Releases

| Característica | GitHub | Servidor Propio |
|----------------|--------|-----------------|
| **Costo** | Gratis | Gratis |
| **Control** | Limitado | Total |
| **Métricas** | ❌ | ✅ (descargas, versiones, etc.) |
| **Cache CDN** | ??? | ✅ (1 año) |
| **SHA-256** | Manual | ✅ Automático |
| **Rollback** | Difícil | ✅ Fácil (1 comando) |
| **Panel Admin** | ❌ | ✅ |
| **API** | Limitada | ✅ Completa |

---

## 🔒 Seguridad

### Autenticación de Endpoints Admin

```typescript
// Verificar que el usuario sea admin
const isAdmin = user.email === process.env.ADMIN_EMAIL;
```

**Configurar en `.env`:**
```bash
ADMIN_EMAIL="tu-email@example.com"
```

---

### Verificación SHA-256

**Servidor (automático):**
```typescript
const sha256 = crypto.createHash('sha256').update(jarBuffer).digest('hex');
```

**Cliente (mod):**
```java
String fileHash = calculateSHA256(downloadedFile);
if (!fileHash.equalsIgnoreCase(expectedSha256)) {
    throw new RuntimeException("SHA-256 verification failed!");
}
```

---

### Rate Limiting

El endpoint de descarga es público (no requiere autenticación), pero se puede agregar rate limiting por IP si es necesario.

---

## 📊 Métricas Rastreadas

### Por Versión
- Número de descargas
- Fecha de lanzamiento
- Tamaño del archivo
- Hash SHA-256
- Estado (latest, required)

### Globales
- Total de versiones
- Total de descargas
- Versión actual (latest)
- Descargas de la versión actual

---

## 🐛 Troubleshooting

### Error: "No hay versiones del mod disponibles"

**Causa:** BD vacía, no se ha subido ninguna versión.

**Solución:**
```bash
npx tsx scripts/minecraft/upload-initial-version.ts
```

---

### Error: "La versión X.X.X ya existe"

**Causa:** Intentas subir una versión duplicada.

**Solución:**
```bash
# Eliminar versión existente
npx tsx scripts/minecraft/delete-mod-version.ts --version X.X.X

# O cambiar el número de versión
```

---

### El mod no descarga la nueva versión

**Verificar:**

1. ¿Está marcada como "latest"?
   ```bash
   npx tsx scripts/minecraft/list-mod-versions.ts
   ```

2. ¿El endpoint responde?
   ```bash
   curl "http://localhost:3000/api/v1/minecraft/mod/version?currentVersion=0.1.0"
   ```

3. ¿R2 está configurado?
   ```bash
   # Verificar en .env
   S3_ENDPOINT="..."
   S3_ACCESS_KEY_ID="..."
   S3_SECRET_ACCESS_KEY="..."
   S3_BUCKET_NAME="..."
   ```

---

## 📝 Documentación Adicional

- **README completo:** `scripts/minecraft/README-mod-distribution.md`
- **Esquema de BD:** `prisma/schema.prisma` (modelo `MinecraftModVersion`)
- **Servicio:** `lib/minecraft/mod-version-service.ts`
- **Endpoints:** `app/api/v1/minecraft/mod/`

---

## ✅ Checklist de Implementación

- [x] Modelo de BD creado y migrado
- [x] Sistema de storage extendido
- [x] Servicio de gestión de versiones
- [x] Endpoint de verificación de versión
- [x] Endpoint de descarga
- [x] Endpoint de subida (admin)
- [x] Script de migración inicial
- [x] Scripts CLI completos
- [x] Panel de admin web
- [x] Documentación completa
- [x] Verificación SHA-256
- [x] Tracking de descargas
- [x] Cache optimizado

---

## 🔮 Mejoras Futuras

### Corto Plazo
- [ ] Modal de subida en panel admin (UI en lugar de CLI)
- [ ] Gráficos de descargas por versión (chart.js)
- [ ] Notificaciones push cuando hay nueva versión

### Mediano Plazo
- [ ] Beta testing (versiones beta solo para usuarios específicos)
- [ ] Changelog automático desde commits de Git
- [ ] Deploy automático con GitHub Actions

### Largo Plazo
- [ ] A/B testing de versiones
- [ ] Métricas de crash reporting por versión
- [ ] Sistema de rollout gradual (5% → 25% → 100%)

---

**Fecha de implementación:** 2026-01-29
**Estado:** ✅ Completado y funcional
**Próximo paso:** Ejecutar migración inicial con `upload-initial-version.ts`
