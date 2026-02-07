# Sistema de Roles y Membresías de Comunidades

## 📋 Descripción General

El sistema de comunidades incluye un sistema completo de roles y permisos que permite gestionar quién puede hacer qué dentro de cada comunidad. Además, incluye un innovador sistema de **co-ownership** y **transferencia de propiedad** que le da flexibilidad y continuidad a las comunidades.

## 🎭 Roles Disponibles

### 1. **Owner (Propietario Principal)**
- **Descripción**: El creador original de la comunidad o la persona a quien se le transfirió la propiedad. Es el único con privilegios máximos y control absoluto.
- **Permisos**:
  - ✅ Control total de la comunidad
  - ✅ Editar configuración de la comunidad (nombre, descripción, reglas, etc.)
  - ✅ Eliminar la comunidad
  - ✅ Promover/degradar moderadores
  - ✅ Agregar y remover co-propietarios
  - ✅ Transferir la propiedad principal a otra persona
  - ✅ Banear/expulsar miembros
  - ✅ Publicar y comentar sin restricciones
  - ✅ Moderar contenido (eliminar posts/comentarios, pinear posts, etc.)
  - ❌ No puede salir de la comunidad sin transferir la propiedad

### 1.5. **Co-Owner (Co-Propietario)**
- **Descripción**: Miembros de máxima confianza designados por el propietario principal. Tienen casi los mismos privilegios que el owner, excepto acciones críticas sobre la propiedad.
- **Permisos**:
  - ✅ Editar configuración de la comunidad (nombre, descripción, reglas, etc.)
  - ✅ Promover/degradar moderadores
  - ✅ Banear/expulsar miembros
  - ✅ Publicar y comentar sin restricciones
  - ✅ Moderar contenido (eliminar posts/comentarios, pinear posts, etc.)
  - ✅ Puede salir de la comunidad (se convierte en moderador)
  - ❌ No puede eliminar la comunidad
  - ❌ No puede agregar/remover otros co-propietarios
  - ❌ No puede transferir la propiedad principal

### 2. **Moderator (Moderador)**
- **Descripción**: Miembros de confianza con permisos de moderación.
- **Permisos**:
  - ✅ Moderar contenido
  - ✅ Eliminar posts y comentarios que violen las reglas
  - ✅ Banear/expulsar miembros problemáticos
  - ✅ Pinear posts importantes
  - ✅ Bloquear posts (no más comentarios)
  - ✅ Publicar y comentar sin restricciones
  - ✅ Puede salir de la comunidad
  - ❌ No puede editar configuración de la comunidad
  - ❌ No puede eliminar la comunidad
  - ❌ No puede promover/degradar otros moderadores

### 3. **Member (Miembro)**
- **Descripción**: Miembros regulares de la comunidad.
- **Permisos**:
  - ✅ Ver posts de la comunidad
  - ✅ Crear posts en la comunidad
  - ✅ Comentar en posts
  - ✅ Votar posts y comentarios
  - ✅ Salir de la comunidad
  - ❌ No puede moderar contenido
  - ❌ No puede editar configuración

## 📊 Modelos de Base de Datos

### Community Model
```typescript
{
  id: string;
  ownerId: string;        // ID del propietario principal
  coOwnerIds: Json;       // Array de IDs de co-propietarios (default: [])

  name: string;
  description: string;
  slug: string;
  category: string;
  type: 'public' | 'private' | 'restricted';

  // Branding
  icon?: string;
  iconShape?: string;     // 'circle' | 'square' | 'vertical' | 'horizontal' | 'banner'
  banner?: string;
  bannerShape?: string;
  primaryColor: string;

  memberCount: number;
  postCount: number;
  rules?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

### CommunityMember Model
```typescript
{
  id: string;
  communityId: string;
  userId: string;

  // Rol
  role: 'owner' | 'moderator' | 'member'; // Default: 'member'
  // Nota: Los co-owners se almacenan en Community.coOwnerIds, pero su membresía
  // puede tener role 'owner' o 'moderator' para permisos locales

  // Permisos personalizados (pueden ser ajustados individualmente)
  canPost: boolean;      // Default: true
  canComment: boolean;   // Default: true
  canModerate: boolean;  // Default: false (true para owner/moderator)

  // Estado
  isBanned: boolean;     // Si está baneado de la comunidad
  isMuted: boolean;      // Si está silenciado temporalmente
  mutedUntil?: Date;     // Hasta cuándo está silenciado

  // Métricas
  postCount: number;     // Posts creados en esta comunidad
  commentCount: number;  // Comentarios en esta comunidad

  joinedAt: Date;        // Fecha de unión
}
```

## 🔄 Flujo de Membresía

### Crear Comunidad
1. Usuario crea una comunidad
2. **Automáticamente** se crea como miembro con rol `owner`
3. El contador `memberCount` se actualiza a 1
4. El owner tiene control total desde el inicio

### Unirse a una Comunidad

**Para comunidades públicas:**
```typescript
// Usuario hace clic en "Unirse"
POST /api/community/communities/[id]/join

// Se crea membresía con rol 'member'
// Se incrementa memberCount
// Usuario puede ahora publicar y comentar
```

**Para comunidades privadas:**
- No se puede unir directamente
- Requiere invitación del owner o moderador

**Para comunidades restringidas:**
- Cualquiera puede ver el contenido
- Requiere aprobación del owner/moderador para unirse

### Salir de una Comunidad
```typescript
// Usuario hace clic en "Salir"
POST /api/community/communities/[id]/leave

// Se elimina la membresía
// Se decrementa memberCount
// ⚠️ El owner NO puede salir
```

## 👥 Sistema de Co-Propiedad

### ¿Qué es un Co-Owner?

Un **co-propietario** es un miembro de máxima confianza que tiene casi todos los privilegios del propietario principal. Este sistema permite:

1. **Distribución de responsabilidades**: El owner puede delegar la gestión a personas de confianza
2. **Continuidad de la comunidad**: Si el owner se ausenta, los co-owners pueden mantener la comunidad activa
3. **Preparación para transferencia**: Un co-owner puede convertirse en el nuevo owner principal cuando sea necesario

### Diferencias entre Owner y Co-Owner

| Característica | Owner Principal | Co-Owner |
|---|---|---|
| Editar configuración | ✅ | ✅ |
| Promover/degradar moderadores | ✅ | ✅ |
| Banear/expulsar miembros | ✅ | ✅ |
| Moderar contenido | ✅ | ✅ |
| Agregar co-owners | ✅ | ❌ |
| Remover co-owners | ✅ | ❌ |
| Transferir propiedad | ✅ | ❌ |
| Eliminar comunidad | ✅ | ❌ |
| Puede salir | ❌* | ✅ |

*El owner principal debe transferir la propiedad antes de poder salir

### Agregar un Co-Owner

**Requisitos:**
- Ser el propietario principal de la comunidad
- El usuario debe ser miembro de la comunidad
- El usuario no debe estar ya en la lista de co-owners

**Proceso:**
1. Owner principal va a Configuración de la Comunidad
2. En la sección "Gestión de Propietarios", busca el miembro
3. Hace clic en "Agregar como Co-Owner"
4. El usuario seleccionado se convierte en co-propietario inmediatamente

**Efecto:**
- El ID del usuario se agrega a `community.coOwnerIds`
- El usuario obtiene permisos completos de gestión (excepto gestionar otros co-owners)
- Puede editar la configuración, promover moderadores, etc.

### Remover un Co-Owner

**Requisitos:**
- Ser el propietario principal de la comunidad
- El usuario debe estar en la lista de co-owners

**Proceso:**
1. Owner principal va a Configuración de la Comunidad
2. En la lista de co-owners, hace clic en "Remover Co-Owner"
3. Confirma la acción

**Efecto:**
- El ID del usuario se elimina de `community.coOwnerIds`
- El usuario se convierte automáticamente en **moderador** (no pierde todo acceso)
- Si su membresía era 'owner', se actualiza a 'moderator'
- Conserva privilegios de moderación pero pierde acceso a configuración

## 🔄 Transferencia de Propiedad

### ¿Cuándo transferir la propiedad?

Transfiere la propiedad cuando:
- Vas a dejar de gestionar activamente la comunidad
- Quieres que otra persona tome el control principal
- Necesitas salir de la comunidad pero quieres que continúe

### Proceso de Transferencia

**Requisitos:**
- Ser el propietario principal actual
- El nuevo owner debe ser miembro de la comunidad
- Confirmación explícita (acción irreversible sin ayuda del nuevo owner)

**Pasos:**
1. Owner actual va a Configuración de la Comunidad
2. En "Gestión de Propietarios", selecciona "Transferir Propiedad"
3. Busca y selecciona al nuevo propietario
4. Confirma la acción (aparece advertencia)

**Efecto:**
```typescript
Antes:
- community.ownerId = "user_A"
- community.coOwnerIds = ["user_B", "user_C"]

Usuario A transfiere a Usuario B:

Después:
- community.ownerId = "user_B"  // Nuevo owner principal
- community.coOwnerIds = ["user_A", "user_C"]  // A se convierte en co-owner

// Usuario A mantiene acceso como co-owner
// Usuario B ahora tiene control total
```

### Notas Importantes

1. **Transición suave**: El owner anterior no pierde acceso, se convierte en co-owner
2. **Irreversible (sin colaboración)**: Solo el nuevo owner puede revertir la transferencia
3. **Preserva estructura**: Los co-owners existentes mantienen su estatus
4. **Recomendación**: Hablar con el nuevo owner antes de transferir

## 🛠️ Endpoints del API

### Obtener Información de Comunidad
```typescript
GET /api/community/communities/[id]
// Devuelve:
{
  community: {
    ...communityData,
    isMember: boolean,     // Si el usuario actual es miembro
    memberRole: string | null  // Rol del usuario actual
  }
}
```

### Unirse a Comunidad
```typescript
POST /api/community/communities/[id]/join
// Body: (vacío)
// Response: { member: CommunityMember }
```

### Salir de Comunidad
```typescript
POST /api/community/communities/[id]/leave
// Body: (vacío)
// Response: { success: true }
```

### Banear Miembro (Owner/Moderator)
```typescript
POST /api/community/communities/[id]/ban
// Body: { userId: string, reason?: string }
// Solo owner y moderators
```

### Agregar Co-Owner (Solo Owner Principal)
```typescript
POST /api/community/communities/[id]/owners
// Body: { userId: string }
// Solo el propietario principal puede agregar co-owners

// Response Success:
{
  success: true,
  coOwnerIds: string[]  // Lista actualizada de co-owners
}

// Errores posibles:
- 403: "Solo el propietario principal puede agregar co-propietarios"
- 400: "El usuario no es miembro de esta comunidad"
- 400: "Este usuario ya es co-propietario"
```

### Remover Co-Owner (Solo Owner Principal)
```typescript
DELETE /api/community/communities/[id]/owners?userId=xxx
// Query: userId (ID del co-owner a remover)
// Solo el propietario principal puede remover co-owners

// Response Success:
{
  success: true,
  coOwnerIds: string[]  // Lista actualizada de co-owners
}

// Efecto secundario:
// - Actualiza la membresía del usuario a role: 'moderator'
// - El usuario conserva privilegios de moderación

// Errores posibles:
- 403: "Solo el propietario principal puede remover co-propietarios"
- 400: "Este usuario no es co-propietario"
```

### Transferir Propiedad (Solo Owner Principal)
```typescript
POST /api/community/communities/[id]/transfer
// Body: { newOwnerId: string }
// Solo el propietario principal puede transferir

// Response Success:
{
  success: true,
  community: {
    id: string,
    ownerId: string,      // Nuevo owner
    coOwnerIds: string[]  // Owner anterior agregado como co-owner
  }
}

// Proceso:
// 1. Nuevo usuario se convierte en ownerId
// 2. Owner anterior se agrega a coOwnerIds
// 3. Si nuevo owner estaba en coOwnerIds, se remueve de ahí

// Errores posibles:
- 403: "Solo el propietario principal puede transferir la propiedad"
- 400: "El nuevo propietario debe ser miembro de la comunidad"
- 400: "No puedes transferir la propiedad a ti mismo"
```

## 🎨 UI/UX

### Botones según Estado

**Si NO es miembro:**
```tsx
<Button onClick={joinCommunity}>
  <Users className="h-4 w-4 mr-2" />
  Unirse
</Button>
```

**Si es miembro regular:**
```tsx
<Button onClick={leaveCommunity} variant="outline">
  Salir
</Button>
```

**Si es owner o co-owner:**
```tsx
<Link href={`/community/${slug}/settings`}>
  <Button>
    <Settings className="h-4 w-4 mr-2" />
    Configuración
  </Button>
</Link>
```

**Si es moderator:**
```tsx
<Button onClick={openModPanel}>
  <Shield className="h-4 w-4 mr-2" />
  Moderar
</Button>
```

### Visibilidad de Acciones

```tsx
// Solo miembros pueden crear posts
{community.isMember && (
  <Link href="/community/create">
    <Button>Crear Post</Button>
  </Link>
)}

// Solo owner/co-owner/moderator ven opciones de moderación
{(community.memberRole === 'owner' ||
  community.memberRole === 'moderator' ||
  community.isCoOwner) && (
  <Button onClick={deletePost}>Eliminar Post</Button>
)}

// Owner y co-owners ven configuración
{(community.memberRole === 'owner' || community.isCoOwner) && (
  <Link href={`/community/${slug}/settings`}>
    <Button>Configuración</Button>
  </Link>
)}
```

### Panel de Gestión de Propietarios

Disponible en `/app/community/[slug]/settings` solo para el propietario principal.

**Componente: `OwnersManagementPanel`**

Ubicación: `/components/community/OwnersManagementPanel.tsx`

```tsx
import { OwnersManagementPanel } from '@/components/community';

// En la página de settings
{community?.memberRole === 'owner' && (
  <OwnersManagementPanel
    communityId={community.id}
    principalOwnerId={community.owner.id}
    coOwnerIds={community.coOwnerIds}
    isCurrentUserPrincipalOwner={true}
  />
)}
```

**Características del componente:**

1. **Lista de Co-Owners Actuales**
   - Muestra avatar, nombre de usuario y badge de "Co-Owner"
   - Botón para remover (con confirmación)
   - No se puede remover a uno mismo

2. **Búsqueda de Miembros**
   - Input de búsqueda en tiempo real
   - Filtra solo miembros que NO son co-owners
   - Excluye al propietario principal
   - Muestra botón "+ Agregar como Co-Owner"

3. **Transferir Propiedad**
   - Sección separada con advertencia
   - Búsqueda de miembro para nuevo owner
   - Diálogo de confirmación con advertencia clara
   - Explica que el proceso es irreversible

**Ejemplo de uso:**

```tsx
// settings/page.tsx
<OwnersManagementPanel
  communityId="clx123..."
  principalOwnerId="user_abc"
  coOwnerIds={["user_def", "user_ghi"]}
  isCurrentUserPrincipalOwner={true}
/>
```

## 🔧 Mantenimiento

### Script de Reparación
Si las membresías se desincronizaron, ejecutar:

```bash
npx tsx scripts/fix-community-members.ts
```

Este script:
- Verifica que cada owner sea miembro
- Corrige contadores de `memberCount`
- Muestra un resumen de cambios

### Verificación Manual
```sql
-- Ver comunidades con contadores incorrectos
SELECT
  c.name,
  c.memberCount as "Contador",
  COUNT(cm.id) as "Miembros Reales"
FROM "Community" c
LEFT JOIN "CommunityMember" cm ON c.id = cm."communityId"
GROUP BY c.id
HAVING c.memberCount != COUNT(cm.id);
```

## 📝 Notas Importantes

1. **El owner principal es único**: Solo puede haber un propietario principal a la vez
2. **Owner principal no puede salir**: Debe transferir la propiedad antes de abandonar la comunidad
3. **Co-owners múltiples**: Puede haber varios co-propietarios simultáneamente
4. **Transición suave en transferencia**: El owner anterior se convierte en co-owner automáticamente
5. **Degradación gradual**: Al remover co-owner, se convierte en moderador (no pierde todo acceso)
6. **Moderadores múltiples**: Puede haber varios moderadores
7. **Permisos personalizables**: Cada miembro puede tener permisos individuales ajustados
8. **Bans temporales**: Los bans pueden tener fecha de expiración
9. **Mute temporal**: Los mutes son siempre temporales (requieren `mutedUntil`)
10. **Co-owners en coOwnerIds**: Los IDs se almacenan en JSON array en el modelo Community

## 🚀 Próximas Mejoras

- [x] **Sistema de co-ownership** ✅ Implementado
  - Múltiples co-propietarios con permisos completos de gestión
  - Panel de gestión en configuración de comunidad
  - Agregar/remover co-owners

- [x] **Transferencia de ownership** ✅ Implementado
  - Transferir propiedad principal a otro miembro
  - Transición suave (owner anterior se convierte en co-owner)
  - Confirmación obligatoria para prevenir accidentes

- [ ] Sistema de invitaciones para comunidades privadas
- [ ] Aprobación de solicitudes para comunidades restringidas
- [ ] Roles personalizados (además de los roles base)
- [ ] Historial de acciones de moderación
- [ ] Sistema de apelaciones para bans
- [ ] Notificaciones push cuando se convierte en co-owner
- [ ] Log de transferencias de ownership para auditoría
