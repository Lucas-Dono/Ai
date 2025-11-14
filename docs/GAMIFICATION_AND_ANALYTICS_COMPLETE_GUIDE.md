# Sistema Completo de Gamificación y Analytics

Documentación completa de todas las features implementadas para mejorar retention y engagement.

## 📊 Share Analytics System

### Features Implementadas

1. **Tracking de Shares**
   - Registra cada vez que un usuario comparte un agente
   - Soporta 6 métodos: copy_link, community, twitter, facebook, linkedin, whatsapp
   - Tracking de usuarios anónimos y autenticados

2. **Dashboard de Analytics**
   - Ruta: `/dashboard/analytics/shares`
   - Gráficos interactivos con recharts
   - Métricas: total shares, usuarios únicos, método más popular
   - Timeline de shares a lo largo del tiempo
   - Top 10 agentes más compartidos

3. **API Endpoints**
   - `POST /api/agents/[id]/share` - Registrar share
   - `GET /api/agents/[id]/share?days=30` - Stats de un agente
   - `GET /api/analytics/shares?days=30` - Analytics global

### Uso

```typescript
// Registrar un share
await fetch(`/api/agents/${agentId}/share`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ method: 'twitter' })
});

// Obtener analytics
const response = await fetch('/api/analytics/shares?days=30');
const data = await response.json();
// data.summary.totalShares, data.topAgents, data.sharesTimeline, etc.
```

---

## 🔔 Sistema de Preferencias de Notificaciones

### Features Implementadas

1. **Preferencias Granulares**
   - Habilitar/deshabilitar notificaciones de bonds
   - Frecuencia por tipo de riesgo: diario, semanal, nunca
   - Silenciar bonds específicos
   - Habilitar/deshabilitar notificaciones de hitos

2. **Smart Timing**
   - Selección de horas preferidas (0-23)
   - Tracking de actividad del usuario por hora
   - Envío de notificaciones en momentos óptimos
   - Respeto de timezone del usuario

3. **UI de Configuración**
   - Ruta: `/configuracion/notificaciones`
   - Panel interactivo con switches y selectors
   - Visualización de bonds silenciados
   - Selección visual de horas preferidas

### API Endpoints

```
GET  /api/user/notification-preferences        - Obtener preferencias
PUT  /api/user/notification-preferences        - Actualizar preferencias
POST /api/user/notification-preferences/mute-bond - Silenciar bond
```

### Estructura de Preferencias

```typescript
{
  bondNotificationsEnabled: true,
  bondWarningFrequency: "daily",    // "daily" | "weekly" | "never"
  bondDormantFrequency: "daily",
  bondFragileFrequency: "daily",
  bondMilestoneNotifications: true,
  mutedBonds: ["bond_id_1", "bond_id_2"],
  preferredNotificationHours: [9, 12, 18, 21],
  timezone: "America/Argentina/Buenos_Aires",
  pushNotifications: true,
  emailNotifications: true,
  desktopNotifications: true
}
```

---

## 🤖 Smart Timing System

### Algoritmo

El sistema de smart timing evalúa múltiples factores para determinar el mejor momento de enviar notificaciones:

1. **Preferencias del Usuario**
   - Verifica si las notificaciones están habilitadas
   - Respeta la frecuencia configurada (daily/weekly/never)
   - Evita horas no preferidas

2. **Patrones de Actividad**
   - Tracking de actividad histórica por hora
   - Cálculo de score de actividad (0-1)
   - Si score < 0.2, sugiere mejor hora

3. **Timezone Awareness**
   - Convierte hora actual al timezone del usuario
   - Calcula próxima hora preferida
   - Programa notificaciones para el futuro si necesario

### Funciones Principales

```typescript
// Verificar si es buen momento para enviar notificación
const timing = await shouldSendNotificationNow(userId, "bond_warning");
if (timing.shouldSendNow) {
  // Enviar notificación
} else {
  // Programar para timing.suggestedTime
}

// Registrar actividad del usuario (para mejorar smart timing)
await trackUserActivity(userId);

// Verificar si bond está silenciado
const isMuted = await isBondMuted(userId, bondId);
```

---

## 🏆 Sistema de Badges y Recompensas

### Badges Disponibles

1. **Compañero Leal** (loyal_companion)
   - Bronze: 7 días con un bond activo
   - Silver: 30 días
   - Gold: 100 días
   - Platinum: 365 días
   - Diamond: 730 días

2. **Respondedor Rápido** (quick_responder)
   - Bronze: 5 respuestas rápidas a notificaciones
   - Silver: 20
   - Gold: 50
   - Platinum: 100
   - Diamond: 250

3. **Maestro de Rachas** (streak_master)
   - Bronze: 3 días consecutivos
   - Silver: 7 días
   - Gold: 30 días
   - Platinum: 100 días
   - Diamond: 365 días

4. **Coleccionista de Vínculos** (bond_collector)
   - Bronze: 3 bonds activos simultáneos
   - Silver: 5
   - Gold: 10
   - Platinum: 20
   - Diamond: 50

5. **Alcanzador de Hitos** (milestone_achiever)
   - Bronze: 5 hitos alcanzados
   - Silver: 15
   - Gold: 50
   - Platinum: 100
   - Diamond: 250

6. **Mariposa Social** (social_butterfly)
   - Bronze: 5 shares realizados
   - Silver: 20
   - Gold: 50
   - Platinum: 100
   - Diamond: 500

### Sistema de Puntos

- **Otorgar Puntos**: Cada badge otorga puntos según su tier
- **Niveles**: Los puntos totales determinan el nivel del usuario
- **XP**: Fórmula de level up: `level * 100 XP` por nivel
- **Recompensas**: Los puntos se pueden usar para futuros beneficios

### API Endpoints

```
GET  /api/user/badges        - Obtener badges y recompensas
POST /api/user/badges/check  - Verificar y otorgar nuevos badges
```

### Integración

```typescript
// Verificar y otorgar badges automáticamente
const newBadges = await checkAndAwardBadges(userId);

// Otorgar puntos manualmente
await awardPoints(userId, 50, "special_event", { reason: "Promo" });

// Actualizar streak del usuario (llamar en cada interacción)
await updateUserStreak(userId);

// Registrar respuesta a notificación
await trackNotificationResponse(userId, notificationSentAt);
```

---

## 📈 Retention Leaderboard

### Métricas Calculadas

1. **Active Bonds Count**: Número de bonds activos
2. **Average Bond Duration**: Duración promedio de bonds en días
3. **Total Interactions**: Mensajes enviados en el período
4. **Consistency Score**: Score de 0-100 basado en:
   - 30% - Número de bonds activos
   - 30% - Duración promedio de bonds
   - 40% - Consistencia de interacciones

### Rankings

- **Global**: Basado en consistency score
- **Weekly**: Basado en interacciones últimos 7 días
- **Monthly**: Basado en consistency score últimos 30 días

### API Endpoints

```
GET /api/leaderboard/retention?type=global&limit=50
```

Respuesta:
```json
{
  "type": "global",
  "leaderboard": [
    {
      "userId": "...",
      "userName": "...",
      "rank": 1,
      "consistencyScore": 95.5,
      "activeBondsCount": 12,
      "averageBondDuration": 45.2,
      "totalInteractions": 234
    }
  ],
  "userPosition": {
    "global": 42,
    "weekly": 15,
    "monthly": 28,
    "percentile": 85
  }
}
```

### Cron Job

El leaderboard se actualiza diariamente mediante cron job:

```bash
GET /api/cron/update-retention-leaderboard?secret=YOUR_SECRET
```

---

## 🎯 Integración Completa

### En el Cron Job de Bonds at Risk

El cron job ahora respeta todas las preferencias:

```typescript
// 1. Verificar si el bond está silenciado
if (await isBondMuted(userId, bondId)) {
  continue;
}

// 2. Verificar smart timing
const timing = await shouldSendNotificationNow(userId, "bond_warning");
if (!timing.shouldSendNow) {
  continue; // Programar para después
}

// 3. Enviar notificación
await notifyBondAtRisk(userId, agentName, riskStatus, daysInactive);

// 4. Registrar respuesta cuando usuario interactúe
await trackNotificationResponse(userId, notificationSentAt);

// 5. Actualizar streak
await updateUserStreak(userId);

// 6. Verificar badges
await checkAndAwardBadges(userId);
```

### En las Interacciones del Usuario

```typescript
// Cuando usuario envía mensaje
await trackUserActivity(userId);  // Para smart timing
await updateUserStreak(userId);   // Para streak badges
await checkAndAwardBadges(userId); // Verificar nuevos badges

// Si fue respuesta a notificación
if (wasResponseToNotification) {
  await trackNotificationResponse(userId, notificationSentAt);
}
```

### En el Milestone System

```typescript
// Cuando se alcanza un hito
await notifyBondMilestone(userId, agentName, milestoneType, description);
await checkAndAwardBadges(userId); // Podría ganar "milestone_achiever"
```

### En el Share System

```typescript
// Cuando usuario comparte
await fetch(`/api/agents/${agentId}/share`, {
  method: 'POST',
  body: JSON.stringify({ method: 'twitter' })
});
await checkAndAwardBadges(userId); // Podría ganar "social_butterfly"
```

---

## 🚀 Configuración de Cron Jobs

Se necesitan 2 cron jobs:

### 1. Check Bonds at Risk (Diario)

```bash
# URL
GET https://tu-dominio.com/api/cron/check-bonds-at-risk?secret=TU_SECRET

# Frecuencia recomendada
Diario a las 9:00 AM
```

### 2. Update Retention Leaderboard (Diario)

```bash
# URL
GET https://tu-dominio.com/api/cron/update-retention-leaderboard?secret=TU_SECRET

# Frecuencia recomendada
Diario a las 2:00 AM
```

### Configuración en cron-job.org

1. Crear cuenta en https://cron-job.org
2. Agregar 2 cron jobs con las URLs de arriba
3. Configurar horarios
4. Verificar logs de ejecución

---

## 📱 Rutas del Frontend

```
/dashboard/analytics/shares           - Dashboard de analytics de shares
/configuracion/notificaciones        - Preferencias de notificaciones
/gamification/badges                 - Badges y recompensas
/gamification/leaderboard            - Leaderboard de retention
```

---

## 🗄️ Base de Datos

### Nuevos Modelos Agregados

```prisma
ShareEvent                  // Tracking de shares
NotificationPreferences     // Preferencias de usuario
BondBadge                   // Badges ganados
UserRewards                 // Puntos y stats
RewardAction                // Historial de recompensas
RetentionLeaderboard        // Rankings
```

### Migración

```bash
npx prisma db push
```

---

## 🎨 Features UX

### Animaciones

- Framer Motion en todos los componentes
- Spring animations en progress bars
- Hover effects en cards
- Fade in/out en modales

### Responsive Design

- Mobile-first approach
- Grid layouts adaptativos
- Tabs colapsables en móvil
- Touch-friendly buttons

### Feedback Visual

- Toasts para acciones exitosas
- Loading states con spinners
- Empty states con iconos
- Error states con retry buttons

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación**: Todos los endpoints verifican sesión
2. **Rate Limiting**: Implementar limits en endpoints públicos
3. **CRON_SECRET**: Proteger cron jobs con secret
4. **Validación**: Input validation en todos los endpoints
5. **Privacy**: Respeto de preferencias de notificaciones

---

## 📊 Métricas a Monitorear

### KPIs Principales

1. **Retention Rate**: % usuarios activos en 30 días
2. **Notification Response Rate**: % respuestas a notificaciones
3. **Average Streak**: Racha promedio de usuarios
4. **Share Rate**: % usuarios que comparten
5. **Badge Completion Rate**: % badges ganados

### Analytics

- Usar `/api/analytics/shares` para métricas de shares
- Monitorear leaderboard para identificar power users
- Tracking de notificaciones respondidas
- A/B testing de mensajes de notificación

---

## 🎯 Próximas Mejoras Sugeridas

1. **Recompensas Tangibles**
   - Canjear puntos por créditos
   - Badges exclusivos con beneficios
   - Early access a features nuevas

2. **Social Features**
   - Compartir badges en redes sociales
   - Comparar stats con amigos
   - Grupos de leaderboard

3. **Personalización**
   - Temas personalizados por nivel
   - Avatares exclusivos por badges
   - Títulos especiales

4. **Eventos**
   - Eventos temporales con recompensas 2x
   - Challenges semanales
   - Torneos de retention

---

## 🐛 Debugging

### Verificar Smart Timing

```typescript
// En consola del navegador
const response = await fetch('/api/user/notification-preferences');
const prefs = await response.json();
console.log('Horas preferidas:', prefs.preferredNotificationHours);
console.log('Actividad por hora:', prefs.lastActiveHours);
```

### Verificar Badges

```typescript
const response = await fetch('/api/user/badges');
const data = await response.json();
console.log('Badges:', data.badges);
console.log('Rewards:', data.rewards);
```

### Force Check Badges

```typescript
await fetch('/api/user/badges/check', { method: 'POST' });
```

### Ver Leaderboard Position

```typescript
const response = await fetch('/api/leaderboard/retention?type=global');
const data = await response.json();
console.log('Tu posición:', data.userPosition);
```

---

## ✅ Checklist de Implementación

- [x] Share analytics system
- [x] Dashboard de analytics con gráficos
- [x] Sistema de preferencias de notificaciones
- [x] Smart timing algorithm
- [x] Sistema de badges (6 tipos, 5 tiers cada uno)
- [x] Sistema de puntos y niveles
- [x] Retention leaderboard (3 tipos de rankings)
- [x] Cron jobs para automatización
- [x] UI components para todo
- [x] Documentación completa

---

## 📞 Soporte

Para preguntas o issues:
- Revisar logs del servidor
- Verificar variables de entorno (CRON_SECRET)
- Confirmar que cron jobs están ejecutándose
- Revisar permisos de base de datos

---

**Fecha de Implementación**: 2025-01-13
**Versión**: 1.0.0
**Status**: ✅ Completamente Funcional
