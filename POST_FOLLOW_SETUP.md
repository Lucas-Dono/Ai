# Setup y Configuración - Sistema de Seguimiento de Posts

## Resumen Ejecutivo

Se han implementado 5 mejoras principales al sistema de seguimiento de posts:

1. **Filtros Avanzados** en /community/following
2. **Notificaciones por Email** con templates HTML
3. **Digests Diarios/Semanales** automatizados
4. **Dashboard de Analytics** con gráficos interactivos
5. **Exportación de Datos** en JSON y CSV

---

## Pasos de Instalación

### 1. Aplicar Migraciones de Base de Datos

```bash
# Aplicar cambios al esquema de Prisma
npx prisma migrate dev --name add-post-follow-email-features

# Generar cliente de Prisma actualizado
npx prisma generate
```

**Modelos Nuevos:**
- `EmailNotificationConfig` - Configuración de emails por usuario
- `UserActionHistory` - Historial de acciones para analytics
- `PostFollowDigest` - Registro de digests enviados

**Modelos Actualizados:**
- `PostFollower` - Agregado campo `emailNotifications`
- `User` - Agregadas relaciones con nuevos modelos

### 2. Instalar Dependencias (si no están instaladas)

```bash
npm install recharts
# Ya deberías tener: framer-motion, lucide-react, tailwind
```

### 3. Configurar Variables de Entorno

Agregar a tu archivo `.env`:

```bash
# Sistema de Emails
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp  # o 'api'

# Configuración SMTP (si usas EMAIL_PROVIDER=smtp)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com

# URL de la aplicación (importante para links en emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Cambiar en producción

# Secreto para cron jobs (IMPORTANTE en producción)
CRON_SECRET=generate-a-random-secret-here
```

**Generar CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configurar Cron Jobs

#### Opción A: Vercel (Recomendado)

El archivo `vercel.json` ya está creado con la configuración:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

Vercel ejecutará automáticamente los cron jobs en producción.

#### Opción B: Otros Servicios

Si no usas Vercel, configura cron jobs manualmente:

**Linux/Mac (crontab):**
```bash
# Editar crontab
crontab -e

# Agregar las siguientes líneas
0 9 * * * curl -X POST https://your-app.com/api/cron/daily-digest -H "Authorization: Bearer YOUR_CRON_SECRET"
0 9 * * 1 curl -X POST https://your-app.com/api/cron/weekly-digest -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**GitHub Actions:**
```yaml
name: Daily Digest
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger daily digest
        run: |
          curl -X POST https://your-app.com/api/cron/daily-digest \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 5. Testing Local

#### Probar Filtros

1. Navega a `/community/following`
2. Haz clic en "Filtros"
3. Prueba diferentes combinaciones de filtros

#### Probar Email Notifications

1. Configura tus credenciales SMTP en `.env`
2. Sigue un post
3. Haz que alguien más comente en ese post
4. Deberías recibir un email instantáneo

#### Probar Analytics

1. Navega a `/community/following/analytics`
2. Verifica que se muestren gráficos y estadísticas
3. Prueba los botones de exportación

#### Probar Digests (Manual)

```bash
# Ejecutar digest diario manualmente
curl -X POST http://localhost:3000/api/cron/daily-digest

# Ejecutar digest semanal manualmente
curl -X POST http://localhost:3000/api/cron/weekly-digest

# En desarrollo, puedes usar GET también
curl http://localhost:3000/api/cron/daily-digest
```

#### Probar Exportación

1. Navega a `/community/following/analytics`
2. Haz clic en "Exportar JSON" o "Exportar CSV"
3. Verifica que se descargue el archivo

### 6. Configurar Preferencias de Email

1. Navega a `/settings/notifications`
2. Configura tu frecuencia preferida (instant, daily, weekly, disabled)
3. Selecciona qué tipos de notificaciones quieres recibir
4. Si elegiste daily/weekly, configura el día y hora
5. Guarda las preferencias

---

## Verificación Post-Instalación

### Checklist

- [ ] Migraciones de base de datos aplicadas exitosamente
- [ ] Variables de entorno configuradas
- [ ] Sistema de emails funcionando (enviar email de prueba)
- [ ] Página de following muestra filtros correctamente
- [ ] Página de analytics carga y muestra datos
- [ ] Exportación de datos funciona (JSON y CSV)
- [ ] Cron jobs configurados (verificar en dashboard de hosting)
- [ ] Configuración de preferencias de email funciona

### Comandos de Verificación

```bash
# Verificar schema de Prisma
npx prisma validate

# Verificar que no hay migraciones pendientes
npx prisma migrate status

# Ver logs en desarrollo
npm run dev
# Navegar a las páginas y verificar console

# Probar API endpoints
curl http://localhost:3000/api/community/posts/following
curl http://localhost:3000/api/community/posts/following/analytics
curl http://localhost:3000/api/community/posts/following/preferences
```

---

## Troubleshooting

### Los emails no se envían

1. Verificar que `EMAIL_ENABLED=true`
2. Verificar credenciales SMTP
3. Verificar logs del servidor
4. Probar con un servicio SMTP conocido (Gmail, SendGrid, etc.)

### Los filtros no funcionan

1. Verificar que la API retorna datos
2. Abrir DevTools y revisar Network tab
3. Verificar que los parámetros se envían correctamente

### Los cron jobs no se ejecutan

1. Verificar configuración en Vercel (o tu hosting)
2. Verificar que el `CRON_SECRET` está configurado
3. Verificar logs de ejecución
4. Probar ejecutar manualmente primero

### Los gráficos no se muestran

1. Verificar que `recharts` está instalado
2. Verificar que hay datos en la API
3. Revisar console del browser por errores

### Error al exportar datos

1. Verificar que el usuario está autenticado
2. Verificar que hay datos para exportar
3. Revisar logs del servidor

---

## Estructura de Archivos Creados/Modificados

### Nuevos Archivos

```
lib/
  email/
    templates/
      post-follow-templates.ts          # Templates HTML para emails
  services/
    post-follow-email.service.ts        # Servicio de emails

components/
  community/
    EmailPreferencesPanel.tsx           # Panel de configuración

app/
  community/
    following/
      analytics/
        page.tsx                        # Página de analytics
  settings/
    notifications/
      page.tsx                          # Configuración de notificaciones
  api/
    community/
      posts/
        following/
          communities/
            route.ts                    # API de comunidades
          analytics/
            route.ts                    # API de analytics
          preferences/
            route.ts                    # API de preferencias
          export/
            route.ts                    # API de exportación
    cron/
      daily-digest/
        route.ts                        # Cron job diario
      weekly-digest/
        route.ts                        # Cron job semanal

vercel.json                             # Configuración de cron jobs
POST_FOLLOW_FEATURES.md                 # Documentación de features
POST_FOLLOW_SETUP.md                    # Este archivo
```

### Archivos Modificados

```
prisma/
  schema.prisma                         # Nuevos modelos agregados

lib/
  services/
    comment.service.ts                  # Agregado envío de emails

app/
  community/
    following/
      page.tsx                          # Agregados filtros
  api/
    community/
      posts/
        following/
          route.ts                      # Soporte de filtros
```

---

## Próximos Pasos Opcionales

### Mejoras de Performance

1. **Cache de Analytics**: Implementar cache para queries pesadas
2. **Background Jobs**: Mover envío de emails a queue (Bull, BullMQ)
3. **CDN para Assets**: Cachear imágenes de emails

### Mejoras de UX

1. **Onboarding**: Tutorial para nuevos usuarios
2. **Notificaciones en App**: Agregar badge de nuevos comentarios
3. **Preview de Emails**: Permitir ver preview antes de cambiar configuración

### Mejoras Técnicas

1. **Tests Automatizados**: Agregar tests unitarios y de integración
2. **Monitoring**: Agregar tracking de emails enviados/fallidos
3. **Rate Limiting**: Limitar frecuencia de emails por usuario

### Features Adicionales

1. **Notificaciones Push**: Agregar Web Push API
2. **WhatsApp/Telegram**: Integrar otros canales de notificación
3. **AI Summaries**: Resumir actividad con AI
4. **Personalización**: Permitir personalizar templates de email

---

## Soporte y Contacto

Si encuentras problemas:

1. Revisar esta documentación y `POST_FOLLOW_FEATURES.md`
2. Verificar logs del servidor
3. Revisar issues en GitHub (si aplica)
4. Contactar al equipo de desarrollo

---

## Changelog

### Versión 1.0.0 (Enero 2025)

**Agregado:**
- Sistema completo de filtros en /community/following
- Notificaciones por email con templates HTML
- Digests diarios y semanales automatizados
- Dashboard de analytics con gráficos
- Exportación de datos en JSON y CSV
- Panel de configuración de preferencias de email
- Cron jobs para digests
- Tracking de acciones de usuario
- 3 nuevos modelos en Prisma
- Documentación completa

**Modificado:**
- CommentService ahora envía emails
- PostFollower model con campo emailNotifications
- Página /community/following con UI de filtros
- API de following con soporte de query params

---

**Última actualización**: Enero 2025
**Autor**: Sistema de IA
**Versión**: 1.0.0
