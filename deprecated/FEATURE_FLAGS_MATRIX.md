# Feature Flags - Matriz Completa de Features y Limits

Esta es la matriz definitiva de features y límites por tier del sistema de feature flags.

---

## Tabla de Features

| Feature ID | Feature Name | Free | Plus | Ultra | Category |
|------------|--------------|------|------|-------|----------|
| `CHAT_BASIC` | Chat Básico | ✅ | ✅ | ✅ | Chat |
| `VOICE_MESSAGES` | Mensajes de Voz | ❌ | ✅ | ✅ | Chat |
| `IMAGE_GENERATION` | Generación de Imágenes | ❌ | ✅ (10/día) | ✅ (100/día) | Chat |
| `MULTIMODAL_MESSAGES` | Mensajes Multimodales | ❌ | ✅ | ✅ | Chat |
| `AGENT_CREATION` | Creación de Agentes | ✅ | ✅ | ✅ | Agents |
| `AGENT_PUBLISHING` | Publicar Agentes | ❌ | ❌ | ✅ | Agents |
| `AGENT_API_ACCESS` | API de Agentes | ❌ | ❌ | ✅ | Agents |
| `WORLDS` | Mundos Virtuales | ❌ | ✅ | ✅ | Worlds |
| `WORLD_CREATION` | Crear Mundos | ❌ | ✅ | ✅ | Worlds |
| `WORLD_ADVANCED_FEATURES` | Features Avanzadas de Mundos | ❌ | ❌ | ✅ | Worlds |
| `MARKETPLACE_PUBLISHING` | Publicar en Marketplace | ❌ | ✅ | ✅ | Marketplace |
| `MARKETPLACE_UNLIMITED` | Publicaciones Ilimitadas | ❌ | ❌ | ✅ | Marketplace |
| `COMMUNITY_BASIC` | Comunidad Básica | ✅ | ✅ | ✅ | Community |
| `COMMUNITY_ADVANCED` | Comunidad Avanzada | ❌ | ✅ | ✅ | Community |
| `COMMUNITY_MODERATION` | Moderación | ❌ | ❌ | ✅ | Community |
| `ANALYTICS_BASIC` | Analytics Básicas | ✅ | ✅ | ✅ | Analytics |
| `ANALYTICS_ADVANCED` | Analytics Avanzadas | ❌ | ❌ | ✅ | Analytics |
| `ANALYTICS_EXPORT` | Exportar Datos | ❌ | ❌ | ✅ | Analytics |
| `PRIORITY_SUPPORT` | Soporte Prioritario | ❌ | ✅ | ✅ | Support |
| `EARLY_ACCESS` | Early Access | ❌ | ❌ | ✅ | Support |
| `API_ACCESS` | Acceso API | ❌ | ❌ | ✅ | API |
| `API_WEBHOOKS` | Webhooks | ❌ | ❌ | ✅ | API |
| `TEAM_FEATURES` | Equipos | ❌ | ❌ | ✅ | Business |
| `CUSTOM_BRANDING` | Branding Personalizado | ❌ | ❌ | ✅ | Business |
| `SSO` | Single Sign-On | ❌ | ❌ | ✅ | Business |

**Total Features por Tier:**
- **Free**: 4 features
- **Plus**: 12 features
- **Ultra**: 25 features

---

## Tabla de Límites

| Límite | Free | Plus | Ultra | Descripción |
|--------|------|------|-------|-------------|
| **Agents** |
| `maxAgents` | 3 | 20 | 100 | Agentes totales que puede crear |
| `maxAgentsPerWorld` | 0 | 5 | 20 | Agentes por mundo |
| **Worlds** |
| `maxActiveWorlds` | 0 | 5 | 20 | Mundos activos simultáneos |
| `maxWorldAgents` | 0 | 10 | 50 | Agentes totales en mundos |
| **Image Generation** |
| `imageGenerationsPerDay` | 0 | 10 | 100 | Imágenes generadas por día |
| **Marketplace** |
| `maxMarketplaceItems` | 0 | 5 | -1 (∞) | Items publicados en marketplace |
| **Messages** |
| `messagesPerDay` | 100 | 1000 | -1 (∞) | Mensajes por día |
| **API** |
| `apiCallsPerDay` | 0 | 0 | 10000 | Llamadas API por día |
| **Storage** |
| `maxStorageGB` | 1 | 10 | 100 | Almacenamiento en GB |

**Nota**: `-1` significa ilimitado

---

## Features por Categoría

### Chat & Messaging (4 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| CHAT_BASIC | FREE | Chat 1-1 básico con agentes |
| VOICE_MESSAGES | PLUS | Enviar y recibir mensajes de voz |
| IMAGE_GENERATION | PLUS | Generar imágenes con IA (10/día Plus, 100/día Ultra) |
| MULTIMODAL_MESSAGES | PLUS | Mensajes con imágenes, videos, archivos |

### Agents (3 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| AGENT_CREATION | FREE | Crear agentes personalizados (3 Free, 20 Plus, 100 Ultra) |
| AGENT_PUBLISHING | ULTRA | Publicar agentes en marketplace público |
| AGENT_API_ACCESS | ULTRA | Acceder a agentes vía API REST |

### Worlds (3 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| WORLDS | PLUS | Acceder a mundos multi-agente (5 Plus, 20 Ultra) |
| WORLD_CREATION | PLUS | Crear mundos personalizados |
| WORLD_ADVANCED_FEATURES | ULTRA | Eventos emergentes, directores IA, simulaciones |

### Marketplace (2 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| MARKETPLACE_PUBLISHING | PLUS | Publicar characters, prompts, themes (5 items Plus) |
| MARKETPLACE_UNLIMITED | ULTRA | Publicaciones ilimitadas en marketplace |

### Community (3 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| COMMUNITY_BASIC | FREE | Unirse a comunidades, participar en posts |
| COMMUNITY_ADVANCED | PLUS | Crear comunidades, organizar eventos |
| COMMUNITY_MODERATION | ULTRA | Herramientas avanzadas de moderación |

### Analytics (3 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| ANALYTICS_BASIC | FREE | Ver estadísticas básicas de uso |
| ANALYTICS_ADVANCED | ULTRA | Insights profundos, gráficos avanzados |
| ANALYTICS_EXPORT | ULTRA | Exportar datos en CSV/JSON |

### Support (2 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| PRIORITY_SUPPORT | PLUS | Respuestas en < 24h |
| EARLY_ACCESS | ULTRA | Acceso anticipado a nuevas features |

### API (2 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| API_ACCESS | ULTRA | API REST para integraciones (10k calls/día) |
| API_WEBHOOKS | ULTRA | Recibir eventos en tiempo real |

### Business (3 features)

| Feature | Min Tier | Description |
|---------|----------|-------------|
| TEAM_FEATURES | ULTRA | Colaboración en equipo |
| CUSTOM_BRANDING | ULTRA | White-label para empresas |
| SSO | ULTRA | Single Sign-On (SAML, OAuth) |

---

## Pricing

### Free Tier
- **Precio**: $0/mes
- **Features**: 4 básicas
- **Ideal para**: Probar la plataforma

### Plus Tier
- **Precio**: $9.99/mes ($99.99/año)
- **Features**: 12 intermedias
- **Ideal para**: Usuarios activos

### Ultra Tier
- **Precio**: $29.99/mes ($299.99/año)
- **Features**: 25 completas
- **Ideal para**: Power users y empresas

---

## Upgrade Paths

### Free → Plus
**Desbloqueas:**
- ✅ Mundos virtuales (5 activos)
- ✅ Image generation (10/día)
- ✅ Voice messages
- ✅ Marketplace publishing (5 items)
- ✅ 20 agentes (vs 3)
- ✅ Community avanzada
- ✅ Priority support

**Precio**: $9.99/mes

### Plus → Ultra
**Desbloqueas:**
- ✅ 100 agentes (vs 20)
- ✅ 20 mundos (vs 5)
- ✅ Image generation 100/día (vs 10)
- ✅ Mensajes ilimitados
- ✅ API access (10k calls/día)
- ✅ Advanced analytics
- ✅ Marketplace unlimited
- ✅ Early access features
- ✅ Team features

**Precio**: $29.99/mes

### Free → Ultra
**Desbloqueas**: Todas las 25 features

**Precio**: $29.99/mes

---

## Feature Upgrade Messages

Mensajes mostrados cuando usuario no tiene acceso:

| Feature | Upgrade Message |
|---------|-----------------|
| VOICE_MESSAGES | "Actualiza a Plus para habilitar mensajes de voz" |
| IMAGE_GENERATION | "Plus: 10 imágenes/día, Ultra: 100 imágenes/día" |
| WORLDS | "Actualiza a Plus para acceso a Mundos (5 activos) o Ultra (20 activos)" |
| MARKETPLACE_PUBLISHING | "Plus: 5 items, Ultra: Ilimitado" |
| API_ACCESS | "Actualiza a Ultra para acceso API" |
| ANALYTICS_ADVANCED | "Actualiza a Ultra para analytics avanzadas" |
| EARLY_ACCESS | "Actualiza a Ultra para early access" |
| TEAM_FEATURES | "Actualiza a Ultra para features de equipo" |

---

## Uso en Código

### Check Feature

```typescript
import { Feature } from "@/lib/feature-flags/types";

// Backend
await requireFeature(req, Feature.WORLDS);

// Frontend
const { hasFeature } = useFeatures();
if (hasFeature(Feature.WORLDS)) {
  // Show worlds UI
}
```

### Check Limit

```typescript
import { checkLimit } from "@/lib/feature-flags";

const check = await checkLimit(userId, "maxAgents", currentCount);

if (!check.withinLimit) {
  console.log(`Limit reached: ${check.limit}`);
} else {
  console.log(`Can create ${check.remaining} more`);
}
```

### Track Usage

```typescript
import { trackFeatureUsage } from "@/lib/feature-flags";

// After generating image
await trackFeatureUsage(userId, Feature.IMAGE_GENERATION, 1);
```

---

## Endpoints que Requieren Features

| Endpoint | Feature Required | Notes |
|----------|------------------|-------|
| `POST /api/worlds` | WORLD_CREATION | Check limit: maxActiveWorlds |
| `POST /api/worlds/[id]/message` | WORLDS | Check limit: messagesPerDay |
| `POST /api/images/generate` | IMAGE_GENERATION | Check limit: imageGenerationsPerDay |
| `POST /api/marketplace/themes` | MARKETPLACE_PUBLISHING | Check limit: maxMarketplaceItems |
| `POST /api/community/communities` | COMMUNITY_ADVANCED | Para crear |
| `POST /api/community/events` | COMMUNITY_ADVANCED | Para organizar |
| `GET /api/analytics/advanced` | ANALYTICS_ADVANCED | |
| `GET /api/analytics/export` | ANALYTICS_EXPORT | |
| `POST /api/agents/[id]/publish` | AGENT_PUBLISHING | |
| `GET /api/user/api-key` | API_ACCESS | |
| `POST /api/webhooks/register` | API_WEBHOOKS | |

---

## Migración de Checks Existentes

### Antes (hard-coded)

```typescript
// Backend
if (user.plan === "free") {
  return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
}

// Frontend
{user.plan !== "free" && <WorldsButton />}
```

### Después (feature flags)

```typescript
// Backend
await requireFeature(req, Feature.WORLDS);

// Frontend
<FeatureGate feature={Feature.WORLDS}>
  <WorldsButton />
</FeatureGate>
```

---

## Testing Matrix

Para tests completos, verificar:

1. ✅ Free tier NO tiene features premium
2. ✅ Plus tier tiene features intermedias
3. ✅ Ultra tier tiene TODAS las features
4. ✅ Límites son correctos por tier
5. ✅ Upgrade messages son claros
6. ✅ Cache funciona correctamente
7. ✅ Tracking de uso funciona
8. ✅ Invalidación de cache funciona

---

## Quick Reference

```typescript
// Import
import { Feature, UserTier } from "@/lib/feature-flags/types";

// All features
Feature.CHAT_BASIC
Feature.VOICE_MESSAGES
Feature.IMAGE_GENERATION
Feature.MULTIMODAL_MESSAGES
Feature.AGENT_CREATION
Feature.AGENT_PUBLISHING
Feature.AGENT_API_ACCESS
Feature.WORLDS
Feature.WORLD_CREATION
Feature.WORLD_ADVANCED_FEATURES
Feature.MARKETPLACE_PUBLISHING
Feature.MARKETPLACE_UNLIMITED
Feature.COMMUNITY_BASIC
Feature.COMMUNITY_ADVANCED
Feature.COMMUNITY_MODERATION
Feature.ANALYTICS_BASIC
Feature.ANALYTICS_ADVANCED
Feature.ANALYTICS_EXPORT
Feature.PRIORITY_SUPPORT
Feature.EARLY_ACCESS
Feature.API_ACCESS
Feature.API_WEBHOOKS
Feature.TEAM_FEATURES
Feature.CUSTOM_BRANDING
Feature.SSO

// All tiers
UserTier.FREE
UserTier.PLUS
UserTier.ULTRA

// All limits
maxAgents
maxAgentsPerWorld
maxActiveWorlds
maxWorldAgents
imageGenerationsPerDay
maxMarketplaceItems
messagesPerDay
apiCallsPerDay
maxStorageGB
```

---

**Total:**
- 25 Features
- 9 Limits
- 3 Tiers
- Ready for Production ✅
