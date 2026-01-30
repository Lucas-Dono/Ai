# Sistema de Distribución del Mod de Minecraft

Este sistema permite alojar y distribuir el mod de Blaniel desde tu propio servidor, usando Cloudflare R2/S3 como almacenamiento.

## 🎯 Ventajas

- **Control total**: El mod se descarga desde tu servidor, no desde GitHub
- **Tamaño pequeño**: El mod pesa solo ~300 KB (menos que una imagen)
- **Métricas**: Rastreo de descargas por versión
- **Verificación**: Hash SHA-256 para integridad del archivo
- **Caché**: CDN-friendly con cache de 1 año para versiones específicas
- **Sin costos extra**: Cloudflare R2 es gratis hasta 10 GB y sin egress fees

## 📋 Arquitectura

```
┌─────────────────┐
│  Minecraft Mod  │
│   (Cliente)     │
└────────┬────────┘
         │
         │ 1. Verificar versión
         │ GET /api/v1/minecraft/mod/version?currentVersion=0.1.0
         │
         ▼
┌─────────────────┐
│   Next.js API   │
│   (Servidor)    │
└────────┬────────┘
         │
         │ 2. Consultar BD
         │
         ▼
┌─────────────────┐        ┌──────────────┐
│   PostgreSQL    │◄──────►│ Cloudflare R2│
│  (Metadata)     │        │  (Archivos)  │
└─────────────────┘        └──────────────┘
         │
         │ 3. Retornar info de actualización
         │
         ▼
┌─────────────────┐
│  Minecraft Mod  │
│   (Cliente)     │
└────────┬────────┘
         │
         │ 4. Descargar nueva versión
         │ GET /api/v1/minecraft/mod/download/0.2.0
         │
         ▼
┌─────────────────┐
│   Next.js API   │
└────────┬────────┘
         │
         │ 5. Obtener JAR de R2
         │
         ▼
┌──────────────┐
│ Cloudflare R2│
└──────────────┘
```

## 🗄️ Modelo de Datos

```prisma
model MinecraftModVersion {
  id           String    @id @default(cuid())
  version      String    @unique // "0.1.0", "0.2.0", etc.
  downloadUrl  String    // URL de descarga desde el servidor
  storageKey   String    // Key en R2/S3: "minecraft-mod/blaniel-mc-0.1.0.jar"
  changelog    String    // Novedades de esta versión
  releaseDate  DateTime
  fileSize     BigInt    // Tamaño en bytes
  sha256       String    // Hash SHA-256 para verificación
  required     Boolean   // Si es obligatorio actualizar
  minimumVersion String? // Versión mínima compatible
  isLatest     Boolean   // Si es la versión más reciente
  downloadCount Int      // Contador de descargas
}
```

## 📡 Endpoints de la API

### 1. Verificar Versión

```http
GET /api/v1/minecraft/mod/version?currentVersion=0.1.0
```

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
  "sha256": "abc123def456...",
  "hasUpdate": true,
  "currentVersion": "0.1.0",
  "updateAvailable": true
}
```

### 2. Descargar Versión

```http
GET /api/v1/minecraft/mod/download/0.2.0
```

**Headers de respuesta:**
```
Content-Type: application/java-archive
Content-Disposition: attachment; filename="blaniel-mc-0.2.0.jar"
Content-Length: 307200
Cache-Control: public, max-age=31536000, immutable
X-Mod-Version: 0.2.0
```

### 3. Subir Nueva Versión (Admin)

```http
POST /api/v1/minecraft/mod/upload
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

file: blaniel-mc-0.2.0.jar
version: 0.2.0
changelog: Mejoras de rendimiento...
required: false
minimumVersion: 0.1.0
```

## 🛠️ Scripts CLI

### 1. Subir Versión Inicial (0.1.0)

```bash
# Ejecutar UNA SOLA VEZ para migrar de GitHub al servidor
npx tsx scripts/minecraft/upload-initial-version.ts
```

Este script:
- Busca el JAR compilado de la versión 0.1.0
- Calcula el hash SHA-256
- Sube el archivo a Cloudflare R2
- Crea el registro en la base de datos
- Marca como "latest"

### 2. Listar Versiones

```bash
npx tsx scripts/minecraft/list-mod-versions.ts
```

Muestra:
- Tabla con todas las versiones
- Tamaño de cada versión
- Número de descargas
- Versión marcada como "latest"
- Versiones obligatorias

**Ejemplo de salida:**
```
📊 Estadísticas Generales:
   Total de versiones: 3
   Total de descargas: 1,542
   Versión actual: 0.2.0
   Descargas de la versión actual: 823

📋 Versiones Disponibles:

┌─────────────┬──────────────────────┬─────────────┬────────────┬──────────┬──────────┐
│ Versión     │ Fecha de Lanzamiento │ Tamaño      │ Descargas  │ Latest   │ Required │
├─────────────┼──────────────────────┼─────────────┼────────────┼──────────┼──────────┤
│ 0.2.0       │ 2026-01-29           │ 300.50 KB   │ 823        │ ✓        │          │
│ 0.1.5       │ 2026-01-25           │ 295.20 KB   │ 512        │          │          │
│ 0.1.0       │ 2026-01-20           │ 290.00 KB   │ 207        │          │          │
└─────────────┴──────────────────────┴─────────────┴────────────┴──────────┴──────────┘
```

### 3. Subir Nueva Versión

```bash
npx tsx scripts/minecraft/upload-mod-version.ts \
  --jar Juego/Blaniel-MC/build/libs/blaniel-mc-0.2.0.jar \
  --version 0.2.0 \
  --changelog "# Versión 0.2.0

## Nuevas Características
- Soporte para grupos de hasta 10 IAs
- Sistema de relaciones IA-IA mejorado

## Correcciones
- Fix memory leak en conversation players" \
  --required \
  --minimum-version 0.1.0
```

**Parámetros:**
- `--jar`: Ruta al archivo JAR compilado (requerido)
- `--version`: Versión semver (ej: 0.2.0) (requerido)
- `--changelog`: Descripción de cambios (requerido)
- `--required`: Marcar como actualización obligatoria (opcional)
- `--minimum-version`: Versión mínima compatible (opcional)

### 4. Eliminar Versión

```bash
npx tsx scripts/minecraft/delete-mod-version.ts --version 0.1.5
```

⚠️ **ADVERTENCIA**: Esto eliminará permanentemente:
- El archivo JAR de Cloudflare R2
- El registro de la base de datos
- **Esta acción NO SE PUEDE DESHACER**

### 5. Marcar Versión como Latest

```bash
npx tsx scripts/minecraft/set-latest-version.ts --version 0.1.5
```

Útil para hacer rollback a una versión anterior si la última tiene problemas.

## 🚀 Flujo de Trabajo: Lanzar Nueva Versión

### Paso 1: Compilar el Mod

```bash
cd Juego/Blaniel-MC
./gradlew clean build
```

El JAR se generará en `build/libs/blaniel-mc-X.X.X.jar`

### Paso 2: Actualizar Versión en el Código

Editar `ModUpdateChecker.java`:
```java
private static final String CURRENT_VERSION = "0.2.0"; // Actualizar aquí
```

### Paso 3: Subir al Servidor

```bash
npx tsx scripts/minecraft/upload-mod-version.ts \
  --jar Juego/Blaniel-MC/build/libs/blaniel-mc-0.2.0.jar \
  --version 0.2.0 \
  --changelog "$(cat CHANGELOG.md)"
```

### Paso 4: Verificar

```bash
# Listar versiones
npx tsx scripts/minecraft/list-mod-versions.ts

# Probar endpoint
curl "http://localhost:3000/api/v1/minecraft/mod/version?currentVersion=0.1.0"
```

### Paso 5: Actualizar Schema de BD

```bash
npx prisma db push
```

## 🔒 Seguridad

### Autenticación para Subida

El endpoint `/api/v1/minecraft/mod/upload` requiere:
1. Usuario autenticado
2. Email del usuario debe coincidir con `ADMIN_EMAIL` en `.env`

Configurar en `.env`:
```bash
ADMIN_EMAIL="tu-email@example.com"
```

### Verificación SHA-256

El mod descarga el archivo y verifica el hash SHA-256 para asegurar integridad:

```java
String fileHash = calculateSHA256(downloadedFile);
if (!fileHash.equalsIgnoreCase(expectedSha256)) {
    throw new RuntimeException("SHA-256 verification failed!");
}
```

## 💰 Costos

### Cloudflare R2

**Gratis:**
- 10 GB de almacenamiento
- 1 millón de operaciones Clase A por mes (escrituras)
- 10 millones de operaciones Clase B por mes (lecturas)
- **Egress GRATIS** (sin cargo por transferencia de datos)

**Con 1,000 usuarios activos:**
- Almacenamiento: ~1 MB (3 versiones × 300 KB)
- Descargas mensuales: ~3,000 (3 descargas por usuario)
- **Costo: $0/mes** (dentro del plan gratuito)

**A escala (100,000 usuarios):**
- Almacenamiento: ~1 MB
- Descargas mensuales: ~300,000
- **Costo: $0/mes** (todavía dentro del plan gratuito)

### Comparación con GitHub Releases

| Característica | GitHub Releases | Servidor Propio (R2) |
|----------------|-----------------|----------------------|
| Costo | Gratis | Gratis |
| Límite de tamaño | 2 GB por archivo | 5 TB por archivo |
| Límite de ancho de banda | ??? | Ilimitado (sin egress) |
| Control total | ❌ | ✅ |
| Métricas de descarga | ❌ | ✅ |
| CDN | Depende | ✅ |
| Verificación SHA-256 | Manual | Automático |

## 📊 Métricas y Analytics

### Tracking de Descargas

Cada vez que se descarga una versión, el contador se incrementa automáticamente:

```typescript
await prisma.minecraftModVersion.update({
  where: { version },
  data: {
    downloadCount: { increment: 1 }
  }
});
```

### Estadísticas Disponibles

```typescript
const stats = await ModVersionService.getDownloadStats();

// Retorna:
{
  totalVersions: 3,
  totalDownloads: 1542,
  latestVersion: "0.2.0",
  latestDownloads: 823,
  versions: [
    { version: "0.2.0", downloads: 823, releaseDate: "...", isLatest: true },
    { version: "0.1.5", downloads: 512, releaseDate: "...", isLatest: false },
    { version: "0.1.0", downloads: 207, releaseDate: "...", isLatest: false }
  ]
}
```

## 🐛 Troubleshooting

### Error: "No hay versiones del mod disponibles"

**Causa**: La base de datos no tiene ninguna versión registrada.

**Solución**:
```bash
npx tsx scripts/minecraft/upload-initial-version.ts
```

### Error: "La versión X.X.X ya existe"

**Causa**: Intentaste subir una versión que ya está en el servidor.

**Solución**: Cambia el número de versión o elimina la versión existente:
```bash
npx tsx scripts/minecraft/delete-mod-version.ts --version X.X.X
```

### El mod no se está descargando

**Verificar:**
1. ¿La versión está marcada como "latest"?
   ```bash
   npx tsx scripts/minecraft/list-mod-versions.ts
   ```

2. ¿El endpoint de versión responde?
   ```bash
   curl "http://localhost:3000/api/v1/minecraft/mod/version"
   ```

3. ¿Cloudflare R2 está configurado en `.env`?
   ```bash
   S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   S3_ACCESS_KEY_ID="..."
   S3_SECRET_ACCESS_KEY="..."
   S3_BUCKET_NAME="creador-ia-avatars"
   ```

### Error de permisos al subir

**Causa**: El usuario no es administrador.

**Solución**: Configurar `ADMIN_EMAIL` en `.env`:
```bash
ADMIN_EMAIL="tu-email@example.com"
```

## 📝 Notas Importantes

1. **Versión semántica**: Siempre usa formato semver (X.Y.Z)
2. **Changelog descriptivo**: Incluye changelog detallado para cada versión
3. **Testing**: Prueba localmente antes de marcar como "latest"
4. **Backup**: Guarda una copia local de cada JAR antes de subirlo
5. **Rollback**: Puedes hacer rollback marcando una versión anterior como "latest"

## 🔮 Futuras Mejoras

- [ ] Panel web de administración (UI en lugar de CLI)
- [ ] Notificaciones push cuando hay nueva versión
- [ ] Beta testing (versiones beta solo para usuarios específicos)
- [ ] Changelog automático desde commits de Git
- [ ] Deploy automático con GitHub Actions
- [ ] Versionado automático con conventional commits
- [ ] A/B testing de versiones
- [ ] Métricas de crash reporting por versión

---

**Última actualización**: 2026-01-29
