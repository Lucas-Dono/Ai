# Sistema de Gamificación B2C - Documentación Completa

## Visión General

Sistema de gamificación completo diseñado para maximizar la retención de usuarios B2C mediante:
- Reconocimiento social
- Progresión visible
- Recompensas diarias
- Sistema de logros
- Competencia saludable

---

## Arquitectura

### Backend

#### Modelos Prisma
- **UserReputation**: Puntos, nivel, streaks, última actividad
- **UserBadge**: Badges ganados por usuario
- **Follow**: Sistema de seguimiento entre usuarios

#### APIs Implementadas

**Reputación**
- `GET /api/community/reputation/profile?userId=xxx` - Obtener reputación de usuario
- `GET /api/community/reputation/leaderboard?timeRange=week|month|all&limit=50` - Leaderboard
- `GET /api/community/reputation/badges` - Lista de badges disponibles

**Seguimiento**
- `POST /api/users/[id]/follow` - Seguir/dejar de seguir
- `GET /api/users/[id]/follow` - Estado de seguimiento y contadores

**Check-in Diario**
- `POST /api/daily-checkin` - Hacer check-in diario
- `GET /api/daily-checkin` - Estado de check-in

### Frontend

#### Páginas

1. **Perfil Público** (`/profile/[userId]`)
   - Avatar y información básica
   - Nivel y barra de progreso XP
   - Karma points total
   - Galería de badges ganados
   - Streak actual con flame icon
   - Stats detalladas
   - Tabs: Actividad, IAs Creadas, Posts, Estadísticas

2. **Leaderboard** (`/community/leaderboard`)
   - Top 100 usuarios
   - Tabs: Esta Semana, Este Mes, Todo el Tiempo
   - Destacado de tu posición
   - Categories: Top AI Creators, Top Contributors

3. **Logros** (`/achievements`)
   - Galería de todos los badges (50+)
   - Estados: Earned (color), Locked (gris)
   - Progress bars para badges incrementales
   - Filtros por categoría
   - Descripción de cómo desbloquear

4. **Recompensas Diarias** (`/daily`)
   - Widget de check-in diario
   - Visualización de streak
   - Hitos de racha con recompensas progresivas
   - Tips y consejos

---

## Sistema de Badges (50+ Badges)

### Creator Badges
- **First AI**: Creaste tu primera IA (🤖)
- **AI Master**: Creaste 10 IAs (🎯)
- **AI Legend**: Creaste 50 IAs (👑)
- **Voice Master**: Usaste voice chat 100 veces (🎤)
- **Multimodal Expert**: Usaste multimodal 50 veces (🎬)

### Engagement Badges
- **7 Day Streak**: Activo 7 días consecutivos (🔥)
- **30 Day Streak**: Activo 30 días consecutivos (⚡)
- **100 Day Streak**: Activo 100 días consecutivos (💎)
- **Early Adopter**: Uno de los primeros usuarios (🌟)
- **Power User**: Más de 1000 mensajes enviados (⚡)

### Sharer Badges
- **First Share**: Compartiste tu primera IA (🔗)
- **Popular Creator**: 100 importaciones de tus IAs (📈)
- **Liked Creator**: 1000 likes totales (❤️)

### Community Badges
- **First Post**: Creaste tu primer post (📝)
- **Discussion Starter**: Creaste 10 posts (💭)
- **Helpful**: 10 respuestas aceptadas (🆘)
- **Award Giver**: Diste 50 awards (🎁)
- **Event Winner**: Ganaste un contest (🏆)

### Level-based Badges
- **Bronce**: 100 puntos de reputación (🥉)
- **Plata**: 500 puntos de reputación (🥈)
- **Oro**: 1000 puntos de reputación (🥇)
- **Platino**: 5000 puntos de reputación (💍)
- **Diamante**: 10000 puntos de reputación (💎)

### Special Badges
- **World Builder**: Creaste un mundo (🌍)
- **Behavior Expert**: Configuraste 20 behaviors (🧠)
- **Memory Keeper**: Guardaste 100 eventos importantes (📚)

---

## Sistema de Niveles

### Fórmula de Niveles
```javascript
nivel = Math.floor(Math.sqrt(puntos / 100)) + 1
```

### XP Necesario por Nivel
- Nivel 1: 0 - 100 XP
- Nivel 2: 100 - 400 XP
- Nivel 3: 400 - 900 XP
- Nivel 5: 1,600 - 2,500 XP
- Nivel 10: 8,100 - 10,000 XP
- Nivel 20: 36,100 - 40,000 XP
- Nivel 50: 240,100 - 250,000 XP
- Nivel 100: 980,100 - 1,000,000 XP

### Recompensas por Nivel
- **Nivel 5**: Custom profile badge
- **Nivel 10**: Featured creator
- **Nivel 20**: Early access a features
- **Nivel 50**: Special role en community

---

## Sistema de Puntos (Karma)

### Acciones que Otorgan Puntos

| Acción | Puntos |
|--------|--------|
| Post creado | 5 |
| Post upvoteado | 2 |
| Post viral (1000+ upvotes) | 50 |
| Comentario creado | 2 |
| Comentario upvoteado | 1 |
| Respuesta aceptada | 15 |
| Comunidad creada | 20 |
| Tema publicado | 10 |
| Tema descargado | 1 |
| Investigación publicada | 25 |
| Evento ganado | 100 |
| Login diario | 1 |

---

## Sistema de Streaks

### Reglas
1. Check-in debe hacerse cada 24 horas
2. Si falta un día, el streak se reinicia a 1
3. El streak aumenta solo en días consecutivos

### Recompensas Progresivas
- **Día 1**: +10 karma
- **Día 3**: +35 karma
- **Día 7**: +50 karma + Badge "7 Day Streak"
- **Día 14**: +120 karma
- **Día 30**: +200 karma + Badge "30 Day Streak"
- **Día 60**: +450 karma
- **Día 100**: +500 karma + Badge "100 Day Streak"

---

## Componentes Reutilizables

### Core Components

#### UserLevelBadge
```tsx
<UserLevelBadge
  level={15}
  size="md"
  showText={true}
/>
```
Muestra el nivel del usuario con colores que cambian según el nivel.

#### StreakFlame
```tsx
<StreakFlame
  streak={30}
  size="md"
  showText={true}
/>
```
Muestra el streak actual con animación de llama.

#### BadgeCard
```tsx
<BadgeCard
  icon="🤖"
  name="First AI"
  description="Creaste tu primera IA"
  earned={true}
  earnedAt={new Date()}
  progress={5}
  maxProgress={10}
/>
```
Card individual de badge con estados earned/locked.

#### XPProgressBar
```tsx
<XPProgressBar
  currentXP={1500}
  currentLevel={15}
  nextLevelXP={1600}
  showNumbers={true}
/>
```
Barra de progreso de XP al siguiente nivel.

#### LevelUpModal
```tsx
<LevelUpModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  newLevel={16}
  rewards={['Custom profile badge', 'Special access']}
/>
```
Modal celebratorio al subir de nivel con confetti.

#### LeaderboardEntry
```tsx
<LeaderboardEntry
  rank={1}
  user={{ id, name, image }}
  level={50}
  points={25000}
  badges={[...]}
  isCurrentUser={false}
/>
```
Entry del leaderboard con información de usuario.

#### DailyCheckIn
```tsx
<DailyCheckIn onCheckIn={() => console.log('Checked in!')} />
```
Widget de check-in diario completo.

#### GamificationWidget
```tsx
<GamificationWidget />
```
Widget compacto para sidebar/dashboard con nivel, streak y accesos rápidos.

#### UserBadgeDisplay
```tsx
<UserBadgeDisplay
  badges={userBadges}
  maxDisplay={3}
  size="sm"
/>
```
Muestra badges del usuario con hover tooltip.

---

## Integraciones en UI

### Navbar/Header
```tsx
import { UserLevelBadge } from '@/components/gamification';

// Mostrar nivel junto al nombre de usuario
<UserLevelBadge level={user.level} size="sm" />
```

### Dashboard
```tsx
import { GamificationWidget, DailyCheckIn } from '@/components/gamification';

// Sidebar con widget de gamificación
<GamificationWidget />

// Dashboard con check-in diario
<DailyCheckIn />
```

### Posts/Comments
```tsx
import { UserBadgeDisplay } from '@/components/gamification';

// Mostrar mini badges en posts del usuario
<UserBadgeDisplay
  badges={author.badges}
  maxDisplay={2}
  size="sm"
/>
```

### Notificaciones
Al subir de nivel o desbloquear badge:
```tsx
import { LevelUpModal } from '@/components/gamification';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Toast simple
toast.success('¡Nuevo badge desbloqueado!', {
  description: 'First AI Creator',
});

// Modal con confetti
<LevelUpModal
  isOpen={true}
  newLevel={10}
  rewards={['Featured creator']}
/>
```

---

## Sistema de Follow

### Funcionalidad
- Seguir/dejar de seguir usuarios
- Ver feed de usuarios seguidos
- Contador de followers/following en perfil
- Notificación cuando te siguen

### Uso
```tsx
const handleFollow = async (userId: string) => {
  const res = await fetch(`/api/users/${userId}/follow`, {
    method: 'POST'
  });
  const data = await res.json();
  // data.following: true/false
};
```

---

## Animaciones y Efectos

### Confetti
Usa `canvas-confetti` para celebraciones:
```tsx
import confetti from 'canvas-confetti';

confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

### Micro-interactions
- Hover en badges: escala + rotación suave
- Click en badges: scale down
- Streak flame: pulse/bounce según valor
- Level badge: gradiente de color según nivel

---

## Mejores Prácticas

### Para Retención
1. **Mostrar progreso visible**: Siempre mostrar cuánto falta para el siguiente logro
2. **Celebrar victorias**: Modal + confetti + toast para logros importantes
3. **Recordatorios sutiles**: Widget de check-in diario en dashboard
4. **Competencia social**: Leaderboard y comparación con amigos
5. **Variedad de logros**: Múltiples caminos para ganar puntos

### Para Performance
1. Cachear datos de reputación en sesión cuando sea posible
2. Actualizar badges en background
3. Lazy load galería de badges
4. Optimistic updates en follow/unfollow

### Para UX
1. Tooltips informativos en badges locked
2. Progress bars en badges incrementales
3. Destacar usuario actual en leaderboard
4. Links a perfil desde cualquier lugar

---

## Testing

### Probar Sistema Completo
1. Crear usuario nuevo
2. Hacer check-in diario → Verificar +10 puntos
3. Crear primera IA → Verificar badge "First AI"
4. Ver perfil → Verificar stats y badges
5. Ver leaderboard → Verificar ranking
6. Seguir otro usuario → Verificar contador
7. Hacer check-in 7 días seguidos → Verificar badge "7 Day Streak"

---

## Futuras Mejoras

### Corto Plazo
- [ ] Track voice chat usage
- [ ] Track multimodal chat usage
- [ ] Sistema de awards entre usuarios
- [ ] Contests/eventos con premios

### Largo Plazo
- [ ] Clan/guild system
- [ ] Challenges semanales
- [ ] Seasonal badges
- [ ] NFT badges para top users
- [ ] Marketplace de badges custom

---

## Troubleshooting

### El streak no se actualiza
- Verificar que lastActiveDate se está guardando correctamente
- Verificar timezone del servidor
- Comprobar que el check-in no se puede hacer más de una vez por día

### Los badges no se otorgan automáticamente
- Verificar que `checkAndAwardBadges()` se llama después de acciones relevantes
- Revisar las condiciones de los badges en `reputation.service.ts`
- Comprobar stats en `getUserStats()`

### El nivel no sube
- Verificar que la fórmula de nivel se está aplicando en `addPoints()`
- Comprobar que los puntos se están sumando correctamente
- Revisar si hay un límite máximo de nivel

---

## Soporte

Para preguntas o problemas:
1. Revisar logs del servidor
2. Verificar datos en base de datos directamente
3. Probar APIs manualmente con Postman/Thunder Client
4. Revisar console del navegador para errores

---

**Sistema Completo Implementado ✅**
