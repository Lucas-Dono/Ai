# Guía de Testing - Sistema de Gamificación y Analytics

## 🧪 Pre-requisitos

Antes de empezar a testear, asegúrate de:

1. ✅ Ejecutar migración de base de datos:
   ```bash
   npx prisma db push
   ```

2. ✅ Generar el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

3. ✅ Tener el servidor corriendo:
   ```bash
   npm run dev
   ```

4. ✅ Tener una sesión de usuario activa (login)

---

## 1️⃣ Testing Share Analytics

### Test 1.1: Registrar un Share

```bash
# Reemplaza AGENT_ID con un ID real de tu base de datos
curl -X POST http://localhost:3000/api/agents/AGENT_ID/share \
  -H "Content-Type: application/json" \
  -d '{"method":"twitter"}'
```

**Expected**: Response con `success: true` y `shareEventId`

### Test 1.2: Ver Dashboard de Analytics

1. Navega a: http://localhost:3000/dashboard/analytics/shares
2. Verifica que se carguen los gráficos
3. Cambia el período (7, 30, 90 días)
4. Verifica que los datos se actualicen

**Expected**:
- Cards con números correctos
- Gráficos visibles y animados
- Top agentes con datos reales

### Test 1.3: Verificar Stats de Agente Específico

```bash
curl http://localhost:3000/api/agents/AGENT_ID/share?days=30
```

**Expected**: JSON con `totalShares`, `sharesByMethod`, `mostPopularMethod`

---

## 2️⃣ Testing Notification Preferences

### Test 2.1: Acceder a Preferencias

1. Navega a: http://localhost:3000/configuracion/notificaciones
2. Verifica que se cargue el panel
3. Verifica valores por defecto

**Expected**:
- Switches en estado correcto
- Horas preferidas visibles
- No errores en consola

### Test 2.2: Actualizar Preferencias

1. Cambiar un switch (ej: deshabilitar notificaciones de bonds)
2. Cambiar frecuencia (ej: weekly en lugar de daily)
3. Seleccionar/deseleccionar horas preferidas
4. Click en "Guardar Preferencias"

**Expected**:
- Toast de confirmación
- Datos guardados en BD
- Recarga mantiene cambios

### Test 2.3: Verificar Preferencias en API

```bash
curl http://localhost:3000/api/user/notification-preferences \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected**: JSON con todas las preferencias del usuario

---

## 3️⃣ Testing Smart Timing

### Test 3.1: Verificar Lógica de Smart Timing

1. Configura horas preferidas: solo 14:00 y 20:00
2. Ejecuta el cron job en hora no preferida (ej: 10:00 AM):
   ```bash
   curl "http://localhost:3000/api/cron/check-bonds-at-risk?secret=YOUR_SECRET"
   ```

**Expected**:
- Logs mostrando "Smart timing suggests waiting"
- Notificaciones skipped
- Response con `notificationsSkipped > 0`

### Test 3.2: Verificar Tracking de Actividad

1. Interactúa con el sistema (envía mensajes)
2. Verifica que se registre actividad:
   ```bash
   curl http://localhost:3000/api/user/notification-preferences \
     -H "Cookie: next-auth.session-token=YOUR_TOKEN"
   ```

**Expected**: `lastActiveHours` debe tener conteos por hora

---

## 4️⃣ Testing Sistema de Badges

### Test 4.1: Ver Badges Actuales

1. Navega a: http://localhost:3000/gamification/badges
2. Verifica el panel de rewards (nivel, puntos, streaks)
3. Verifica lista de badges (puede estar vacía si es nuevo usuario)

**Expected**:
- Nivel 1, 0 puntos si es nuevo usuario
- Sin badges si no ha ganado ninguno
- UI responsive y sin errores

### Test 4.2: Forzar Verificación de Badges

1. En la página de badges, click en "Verificar Nuevos"
2. O ejecutar directamente:
   ```bash
   curl -X POST http://localhost:3000/api/user/badges/check \
     -H "Cookie: next-auth.session-token=YOUR_TOKEN"
   ```

**Expected**:
- Response con cantidad de nuevos badges
- Si ganaste alguno, aparece en la UI
- Notificación/toast de confirmación

### Test 4.3: Ganar un Badge de Prueba

Para testear que funciona, puedes:

1. **Badge "Mariposa Social"**:
   - Comparte un agente 5 veces (Bronze)
   - Ejecuta check de badges
   - Deberías ganar el badge Bronze

2. **Badge "Coleccionista"**:
   - Crea 3 bonds activos
   - Ejecuta check de badges
   - Deberías ganar el badge Bronze

### Test 4.4: Verificar Sistema de Puntos

1. Gana un badge
2. Verifica que los puntos se sumen:
   ```bash
   curl http://localhost:3000/api/user/badges \
     -H "Cookie: next-auth.session-token=YOUR_TOKEN"
   ```

**Expected**: `rewards.totalPoints` debe incrementar

---

## 5️⃣ Testing Retention Leaderboard

### Test 5.1: Actualizar Leaderboard Manualmente

```bash
curl "http://localhost:3000/api/cron/update-retention-leaderboard?secret=YOUR_SECRET"
```

**Expected**:
- Response con `success: true`
- Cantidad de usuarios procesados
- Sin errores

### Test 5.2: Ver Leaderboard

1. Navega a: http://localhost:3000/gamification/leaderboard
2. Cambia entre tabs: Global, Semanal, Mensual
3. Verifica tu posición (si tienes datos)

**Expected**:
- Top 3 con colores especiales
- Tu entrada resaltada
- Rankings correctos

### Test 5.3: Verificar Posición en API

```bash
curl "http://localhost:3000/api/leaderboard/retention?type=global" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected**:
- Array de leaderboard
- `userPosition` con tus stats
- Percentil calculado

---

## 6️⃣ Testing Integración de Cron Jobs

### Test 6.1: Cron Job de Bonds at Risk

```bash
curl "http://localhost:3000/api/cron/check-bonds-at-risk?secret=YOUR_SECRET"
```

**Verificar en logs**:
- Bonds procesados
- Smart timing evaluations
- Notificaciones enviadas/skipped
- Razones de skip (muted, timing, frequency)

### Test 6.2: Verificar Respeto de Preferencias

1. Configura un bond como silenciado
2. Ejecuta cron job
3. Verifica que ese bond no reciba notificación

**Expected**: En logs debe aparecer "Bond is muted, skipping notification"

---

## 🔍 Testing de UI/UX

### Responsive Design

Testea en diferentes tamaños:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Páginas a verificar**:
- Dashboard de analytics
- Preferencias de notificaciones
- Badges
- Leaderboard

### Animaciones

Verifica que todas las animaciones funcionen:
- Fade in de componentes
- Hover effects en cards
- Progress bars animados
- Staggered animations en listas

### Loading States

Verifica loading states:
- Spinner mientras carga data
- Skeleton loaders donde aplique
- Disabled buttons durante save

### Error States

Simula errores:
- API endpoint down
- Network error
- Invalid data

**Expected**: Error messages amigables y retry buttons

---

## 🚨 Tests Críticos Pre-Deploy

### Checklist de Producción

- [ ] Analytics dashboard muestra datos reales
- [ ] Preferencias se guardan correctamente
- [ ] Smart timing respeta configuración
- [ ] Badges se otorgan correctamente
- [ ] Puntos se calculan bien
- [ ] Leaderboard se actualiza
- [ ] Cron jobs funcionan con CRON_SECRET
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del servidor
- [ ] Queries de base de datos son eficientes
- [ ] UI es responsive en mobile
- [ ] Animaciones no causan lag

### Performance Testing

1. **Load Testing de Analytics**:
   ```bash
   # Simular 100 shares
   for i in {1..100}; do
     curl -X POST http://localhost:3000/api/agents/AGENT_ID/share \
       -H "Content-Type: application/json" \
       -d '{"method":"twitter"}'
   done
   ```

   Verifica que el dashboard siga rápido

2. **Load Testing de Leaderboard**:
   - Crea datos de prueba para 1000 usuarios
   - Actualiza leaderboard
   - Verifica que la query sea < 2 segundos

---

## 🐛 Debugging

### Ver Logs del Servidor

```bash
# Filtrar por tema específico
tail -f logs/app.log | grep "badges"
tail -f logs/app.log | grep "smart timing"
tail -f logs/app.log | grep "leaderboard"
```

### Inspeccionar Base de Datos

```bash
npx prisma studio
```

Verifica:
- ShareEvent: que se registren shares
- NotificationPreferences: que se guarden preferencias
- BondBadge: que se otorguen badges
- UserRewards: que se sumen puntos
- RetentionLeaderboard: que se calculen rankings

### Console del Navegador

Abre DevTools > Console y busca:
- Errores de fetch
- Warnings de React
- Network requests fallidos

---

## ✅ Criterios de Éxito

Todo está funcionando correctamente si:

1. ✅ Puedes registrar shares y verlos en analytics
2. ✅ Puedes configurar preferencias y se respetan
3. ✅ Smart timing funciona según configuración
4. ✅ Puedes ganar badges y ver puntos
5. ✅ Leaderboard se actualiza y muestra rankings
6. ✅ Cron jobs ejecutan sin errores
7. ✅ UI es fluida y responsive
8. ✅ No hay errores en consola/logs

---

## 📞 Troubleshooting

### Problema: Analytics no muestra datos

**Solución**:
1. Verifica que existan ShareEvents en la BD
2. Verifica que la query de `/api/analytics/shares` retorne datos
3. Revisa logs del servidor

### Problema: Badges no se otorgan

**Solución**:
1. Verifica que cumples los requisitos del badge
2. Ejecuta manualmente `/api/user/badges/check`
3. Revisa logs para ver qué badges verificó
4. Verifica que `getUserStats()` retorne valores correctos

### Problema: Leaderboard vacío

**Solución**:
1. Ejecuta el cron job de actualización manualmente
2. Verifica que existan usuarios con bonds
3. Revisa logs del cron job
4. Verifica que las queries de Prisma funcionen

### Problema: Smart timing no respeta horas

**Solución**:
1. Verifica timezone en preferencias
2. Verifica que `preferredNotificationHours` tenga valores
3. Revisa logs de "Smart timing suggests waiting"
4. Verifica que la hora local esté correcta

---

**Happy Testing!** 🧪✅
