# Comandos Git para Subir Cambios

Ejecuta estos comandos en orden para subir todos los cambios a una nueva rama en GitHub:

## 1. Verificar el estado actual

```bash
git status
```

## 2. Crear nueva rama para estos cambios

```bash
git checkout -b feature/complete-gamification-analytics-system
```

## 3. Agregar todos los archivos nuevos y modificados

```bash
git add .
```

## 4. Crear commit con mensaje descriptivo

```bash
git commit -m "feat: Implementar sistema completo de gamificación y analytics

- Dashboard de analytics para shares con gráficos interactivos
- Sistema de preferencias de notificaciones con smart timing
- Sistema completo de badges (6 tipos, 5 tiers cada uno)
- Sistema de recompensas y puntos con niveles y XP
- Retention leaderboard con 3 tipos de rankings
- Integración con cron jobs y respeto de preferencias
- UI completa con animaciones y diseño responsive
- 25+ archivos nuevos, 10+ modificados
- 7 modelos de base de datos nuevos
- 10+ endpoints API nuevos
- Documentación completa del sistema

Closes: Implementación completa de features de gamificación y analytics"
```

## 5. Push a la nueva rama

```bash
git push -u origin feature/complete-gamification-analytics-system
```

## 6. (Opcional) Crear Pull Request desde GitHub

Después del push, ve a GitHub y crea un Pull Request desde la nueva rama hacia `main` o tu rama principal.

---

## Archivos Principales Agregados

### Analytics System
- app/dashboard/analytics/shares/page.tsx
- app/api/analytics/shares/route.ts
- app/api/agents/[id]/share/route.ts

### Notification Preferences
- app/api/user/notification-preferences/route.ts
- app/configuracion/notificaciones/page.tsx
- components/notifications/NotificationPreferencesPanel.tsx
- lib/notifications/smart-timing.ts

### Gamification - Badges
- lib/gamification/badge-system.ts
- app/api/user/badges/route.ts
- app/gamification/badges/page.tsx
- components/gamification/BadgesDisplay.tsx

### Gamification - Leaderboard
- lib/gamification/retention-leaderboard.ts
- app/api/leaderboard/retention/route.ts
- app/api/cron/update-retention-leaderboard/route.ts
- app/gamification/leaderboard/page.tsx
- components/gamification/RetentionLeaderboard.tsx

### Documentation
- docs/SHARE_ANALYTICS_AND_BOND_NOTIFICATIONS.md
- docs/GAMIFICATION_AND_ANALYTICS_COMPLETE_GUIDE.md
- IMPLEMENTATION_SUMMARY.md

### Database
- prisma/schema.prisma (actualizado con 7 nuevos modelos)

---

## Verificación Antes del Push

Asegúrate de que:
- [ ] Todos los archivos importantes están en el commit
- [ ] No hay archivos sensibles (.env, etc)
- [ ] El commit message es descriptivo
- [ ] Has revisado los cambios con `git diff`

## Troubleshooting

### Si el push falla por archivos muy grandes:
```bash
git config http.postBuffer 524288000
```

### Si necesitas ver qué archivos están en el commit:
```bash
git diff --cached --name-only
```

### Si necesitas agregar archivos específicos en lugar de todos:
```bash
git add app/dashboard/analytics/
git add lib/gamification/
git add components/gamification/
git add app/api/analytics/
git add app/api/user/badges/
git add app/api/leaderboard/
git add app/api/cron/update-retention-leaderboard/
git add docs/GAMIFICATION_AND_ANALYTICS_COMPLETE_GUIDE.md
git add IMPLEMENTATION_SUMMARY.md
git add prisma/schema.prisma
# etc...
```

---

## Después del Push

1. Ve a GitHub
2. Encontrarás un banner para crear Pull Request
3. Revisa los cambios en la interfaz web
4. Agrega descripción detallada
5. Asigna reviewers si es necesario
6. Merge cuando esté listo

---

## Rollback si algo sale mal

Si necesitas deshacer el commit (antes del push):
```bash
git reset --soft HEAD~1
```

Si ya hiciste push y necesitas deshacer:
```bash
git revert HEAD
git push
```

---

**¡Listo para subir!** 🚀

Los cambios están en la rama `feature/complete-gamification-analytics-system` y son completamente funcionales.
