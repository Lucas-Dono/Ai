# Cloud Storage Setup - Preparación para Producción

## 🎯 Por Qué Es Necesario

Con **1,000+ usuarios**, el filesystem local NO escala:

| Métrica | Local Filesystem | Cloud Storage + CDN |
|---------|-----------------|---------------------|
| **Escalabilidad Horizontal** | ❌ No funciona | ✅ Múltiples servidores |
| **Persistencia** | ❌ Se pierde al reiniciar | ✅ Datos persistentes |
| **Performance** | ❌ Lento con miles de archivos | ✅ CDN global |
| **Costo Storage** | $$$ Disco del servidor | $ S3/R2 optimizado |
| **Ancho de Banda** | $$$$ Costoso | $ Gratis con R2 |
| **Backups** | ❌ Manual | ✅ Automático |

**Estimación de costos** para 1,000 usuarios activos:
- 1,000 usuarios × 3 agentes × 2 imágenes × 200KB = **1.2 GB storage**
- **AWS S3**: ~$0.03/mes + $0.09/GB transferencia = ~$1/mes
- **Cloudflare R2**: ~$0.02/mes + $0 transferencia = **~$0.02/mes** ✅

---

## 🚀 Opción 1: Cloudflare R2 (Recomendado)

**Por qué R2:**
- ✅ **Gratis egress** (transferencia de datos)
- ✅ Compatible con S3 API
- ✅ Más barato que S3
- ✅ CDN integrado de Cloudflare

### Setup Rápido (10 minutos)

#### 1. Crear cuenta en Cloudflare

```bash
# 1. Ir a https://dash.cloudflare.com
# 2. Crear cuenta gratis
# 3. Navegar a R2 Object Storage
# 4. Crear un bucket: "creador-ia-avatars"
```

#### 2. Obtener credenciales

```bash
# En Cloudflare Dashboard → R2 → Manage R2 API Tokens
# Crear token con permisos: Object Read & Write
```

Obtendrás:
- Access Key ID: `abc123...`
- Secret Access Key: `xyz789...`
- Endpoint: `https://<account-id>.r2.cloudflarestorage.com`

#### 3. Configurar variables de entorno

Agregar a `.env`:

```bash
# Cloudflare R2 Configuration
STORAGE_PROVIDER=r2
S3_ENDPOINT=https://abc123.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_access_key_here
S3_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=creador-ia-avatars
AWS_REGION=auto

# CDN (opcional pero recomendado)
CDN_URL=https://cdn.tudominio.com
```

#### 4. Instalar dependencias

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp
```

#### 5. Actualizar código de creación de agentes

```typescript
// En app/api/agents/route.ts
import { uploadImageFromDataUrl } from '@/lib/storage/cloud-storage';

// En lugar de:
// finalAvatar = await saveDataUrlAsFile(avatar, userId);

// Usar:
finalAvatar = await uploadImageFromDataUrl(avatar, userId, `${name}-avatar.png`);
```

#### 6. Configurar CDN público (opcional)

```bash
# En Cloudflare Dashboard → R2 → tu bucket → Settings
# Habilitar "Public Access"
# O crear un Custom Domain: cdn.tudominio.com
```

---

## 🚀 Opción 2: AWS S3

### Setup

```bash
# 1. Crear cuenta en AWS
# 2. Ir a S3 → Create bucket: "creador-ia-avatars"
# 3. IAM → Create user con permisos S3
```

Variables de entorno:

```bash
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
S3_ACCESS_KEY_ID=your_key
S3_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=creador-ia-avatars

# Opcional: CloudFront CDN
CDN_URL=https://d111111abcdef8.cloudfront.net
```

---

## 🚀 Opción 3: Mantener Local (Solo Desarrollo)

Si vas a mantener local temporalmente, al menos **organiza por carpetas**:

```
public/uploads/
├── user-123/
│   ├── avatar-1.webp
│   └── avatar-2.webp
├── user-456/
│   ├── avatar-1.webp
│   └── reference-1.webp
```

La implementación en `lib/storage/cloud-storage.ts` ya lo hace automáticamente.

---

## 📊 Comparación de Opciones

| Proveedor | Costo/GB/mes | Transferencia | Setup | Recomendado |
|-----------|-------------|---------------|-------|-------------|
| **Cloudflare R2** | $0.015 | **GRATIS** ✅ | Fácil | **SÍ** ⭐ |
| AWS S3 | $0.023 | $0.09/GB | Medio | Sí |
| Google Cloud Storage | $0.020 | $0.12/GB | Medio | Sí |
| DigitalOcean Spaces | $0.020 | $0.01/GB | Fácil | Sí |
| Local Filesystem | $0 | $0 | Gratis | **NO** ❌ |

---

## 🔥 Implementación Paso a Paso

### 1. Instalar dependencias

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Actualizar lib/utils/image-helpers.ts

```typescript
// Reemplazar saveDataUrlAsFile con:
import { uploadImageFromDataUrl } from '@/lib/storage/cloud-storage';

export async function saveDataUrlAsFile(dataUrl: string, userId: string): Promise<string> {
  return await uploadImageFromDataUrl(dataUrl, userId);
}
```

### 4. Testing

```bash
# Crear un agente desde web
# Verificar que la imagen se sube a R2/S3
# Verificar que la URL retornada apunta al CDN
```

---

## 🛡️ Seguridad

### Bucket Policy (S3/R2)

Asegurar que el bucket sea **privado** pero accesible vía CDN:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::creador-ia-avatars/avatars/*"
    }
  ]
}
```

### Rate Limiting

Agregar límites de uploads por usuario:

```typescript
// lib/usage/tracker.ts
export async function canUploadImage(userId: string): Promise<boolean> {
  // Límite: 10 imágenes por día para usuarios FREE
  // Límite: 100 imágenes por día para usuarios PLUS
}
```

---

## 📈 Monitoreo

### Métricas a trackear:

1. **Storage usado** (GB)
2. **Transferencia mensual** (GB)
3. **Requests por segundo**
4. **Costo mensual**

```typescript
// lib/storage/analytics.ts
export async function trackStorageUsage() {
  // Guardar métricas en base de datos
}
```

---

## ⚠️ Migración de Datos Existentes

Si ya tienes agentes con imágenes en `public/uploads/`:

```typescript
// scripts/migrate-to-cloud-storage.ts
async function migrateExistingImages() {
  const agents = await prisma.agent.findMany({
    where: {
      avatar: { startsWith: '/uploads/' }
    }
  });

  for (const agent of agents) {
    // 1. Leer archivo local
    const localPath = path.join(process.cwd(), 'public', agent.avatar);
    const buffer = await readFile(localPath);

    // 2. Subir a cloud
    const cloudUrl = await storageService.uploadImage(
      buffer,
      path.basename(agent.avatar),
      agent.userId || 'system'
    );

    // 3. Actualizar BD
    await prisma.agent.update({
      where: { id: agent.id },
      data: { avatar: cloudUrl }
    });

    console.log(`Migrated ${agent.name}: ${agent.avatar} → ${cloudUrl}`);
  }
}
```

---

## 🎯 Resumen

**Para DESARROLLO:**
- ✅ Puedes usar local filesystem temporalmente
- ✅ La arquitectura ya está preparada

**Para PRODUCCIÓN (1000+ usuarios):**
- ⚠️ **DEBES migrar a Cloud Storage**
- ⭐ **Recomendado: Cloudflare R2** (más barato, más simple)
- 💰 **Costo estimado: $0.02-$1/mes** para 1,000 usuarios

**Próximos pasos:**
1. ✅ Crear cuenta en Cloudflare R2
2. ✅ Configurar variables de entorno
3. ✅ Actualizar `image-helpers.ts` para usar el nuevo servicio
4. ✅ Testear creación de agentes
5. ✅ Migrar imágenes existentes (si aplica)
