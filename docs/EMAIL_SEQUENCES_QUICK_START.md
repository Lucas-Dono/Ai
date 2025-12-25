# EMAIL SEQUENCES - QUICK START GUIDE

Guía rápida para poner en marcha el sistema de email sequences en 10 minutos.

## PASO 1: Crear cuenta en Resend (3 min)

1. Ve a [resend.com/signup](https://resend.com/signup)
2. Crea cuenta (gratis, no requiere tarjeta)
3. Confirma email

## PASO 2: Verificar dominio (5 min)

### Opción A: Usar subdominio (recomendado)

1. En Resend Dashboard → **Domains** → **Add Domain**
2. Ingresa: `mail.tudominio.com`
3. Agrega los DNS records que te da Resend:
   ```
   Type: TXT
   Name: resend._domainkey.mail.tudominio.com
   Value: [copiar de Resend]

   Type: MX
   Name: mail.tudominio.com
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```
4. Espera 5-10 min a que verifique (a veces es instantáneo)

### Opción B: Usar dominio principal

Similar al anterior pero usa `tudominio.com` directamente.

## PASO 3: Obtener API Key (1 min)

1. En Resend Dashboard → **API Keys**
2. Click **Create API Key**
3. Nombre: "Production"
4. Permiso: **Full Access**
5. Copiar key (empieza con `re_`)

## PASO 4: Configurar variables de entorno (1 min)

Agrega a tu `.env` o variables de Vercel:

```bash
# Resend
RESEND_API_KEY="re_TU_API_KEY_AQUI"
RESEND_FROM_EMAIL="noreply@mail.tudominio.com"  # El que verificaste
RESEND_FROM_NAME="Blaniel"
RESEND_REPLY_TO_EMAIL="support@tudominio.com"   # Opcional

# Rate Limits (usar defaults del .env.example)
EMAIL_MAX_PER_DAY="100"
EMAIL_MAX_PER_HOUR="50"
EMAIL_BATCH_SIZE="10"
EMAIL_BATCH_DELAY_MS="1000"
```

## PASO 5: Actualizar base de datos (2 min)

```bash
# 1. Generar cliente Prisma con nuevos modelos
npx prisma generate

# 2. Aplicar cambios a DB
npx prisma db push

# 3. Seed de secuencias
npx tsx scripts/seed-email-sequences.ts
```

Deberías ver:
```
✅ Welcome sequence created
✅ Reactivation sequence created
✅ Upgrade Nudge sequence created
✅ Trial Ending sequence created

Total: 15 email templates
```

## PASO 6: Configurar webhook de Resend (2 min)

1. En Resend Dashboard → **Webhooks** → **Add Webhook**
2. **Endpoint URL**: `https://tudominio.com/api/webhooks/resend`
3. **Events** (seleccionar todos):
   - ✅ email.sent
   - ✅ email.delivered
   - ✅ email.bounced
   - ✅ email.opened
   - ✅ email.clicked
4. Click **Add Webhook**
5. Copiar Signing Secret (empezara con `whsec_`) - guardar por si lo necesitas

## PASO 7: Configurar Cron Job (3 min)

### Opción A: Vercel Cron (recomendado)

Crea o actualiza `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/email-sequences",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Luego:
```bash
git add vercel.json
git commit -m "Add email sequences cron"
git push
```

### Opción B: Cron-Job.org (alternativa)

1. Ve a [cron-job.org](https://cron-job.org)
2. Crea job:
   - URL: `https://tudominio.com/api/cron/email-sequences`
   - Schedule: `0 9 * * *` (diario 9am)
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

## PASO 8: Test (5 min)

### Test 1: Enviar email de prueba

```bash
# Desde tu proyecto
npx tsx scripts/test-email.ts
```

O crea este archivo rápido:

```typescript
// scripts/test-email.ts
import { triggerWelcomeSequence } from '@/lib/email/triggers';

// Usa tu user ID real o crea uno de test
await triggerWelcomeSequence('tu-user-id-aqui');

console.log('✅ Email sequence triggered! Check your inbox.');
```

### Test 2: Verificar cron job

```bash
# Local
curl http://localhost:3000/api/cron/email-sequences \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Producción
curl https://tudominio.com/api/cron/email-sequences \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Deberías ver:
```json
{
  "success": true,
  "duration": "523ms",
  "results": {
    "emailsProcessed": 1,
    "emailsSent": 1,
    "emailsFailed": 0
  }
}
```

### Test 3: Verificar en Resend Dashboard

1. Ve a Resend Dashboard → **Emails**
2. Deberías ver el email enviado
3. Click para ver detalles:
   - Status: Delivered
   - Opens: (después de abrir)
   - Clicks: (después de hacer click)

### Test 4: Verificar en base de datos

```sql
-- Ver secuencias activas
SELECT * FROM "EmailSequence" WHERE active = true;

-- Ver emails enviados
SELECT * FROM "EmailSent" ORDER BY "createdAt" DESC LIMIT 10;

-- Ver estado de usuarios en secuencias
SELECT * FROM "UserSequenceState" WHERE status = 'active';
```

## PASO 9: Integrar en tu app (5 min)

### 1. Trigger welcome en signup

```typescript
// app/api/auth/signup/route.ts (o donde crees usuarios)
import { triggerWelcomeSequence } from '@/lib/email/triggers';

export async function POST(request: Request) {
  // ... tu código de signup existente ...

  const newUser = await prisma.user.create({
    data: { /* ... */ }
  });

  // 🆕 Agregar esto
  await triggerWelcomeSequence(newUser.id);

  return NextResponse.json({ success: true });
}
```

### 2. Check límites en mensajes

```typescript
// app/api/agents/[id]/message/route.ts
import { checkMessageLimits } from '@/lib/email/triggers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // ... tu código de mensaje existente ...

  // 🆕 Agregar esto después de enviar mensaje
  const usage = await prisma.usage.findFirst({
    where: {
      userId: user.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  if (usage) {
    await checkMessageLimits(user.id, usage.messagesUsed);
  }

  return NextResponse.json({ success: true });
}
```

### 3. Track conversión en upgrade

```typescript
// app/api/checkout/success/route.ts (o donde procesas pagos)
import { trackConversion } from '@/lib/email/sequences/sequence.service';

export async function POST(request: Request) {
  // ... tu código de checkout existente ...

  // 🆕 Agregar esto después de upgrade exitoso
  await trackConversion({
    userId: user.id,
    sequenceId: 'upgrade_nudge', // o 'welcome', 'trial_ending', etc
    conversionType: 'upgrade',
  });

  return NextResponse.json({ success: true });
}
```

## PASO 10: Monitorear (ongoing)

### Dashboard de Resend
- Ve a [resend.com/emails](https://resend.com/emails)
- Monitorea delivery rates (debe ser >95%)
- Check bounces (debe ser <2%)
- Ver opens/clicks

### Logs de Vercel
- Vercel Dashboard → Functions → Logs
- Buscar: `/api/cron/email-sequences`
- Verificar que corre diariamente sin errores

### Métricas en DB

```sql
-- Analytics diarios por secuencia
SELECT
  s.name,
  a.date,
  a.sent,
  a.delivered,
  a.opened,
  a.clicked,
  a.converted,
  a."openRate",
  a."clickRate",
  a."conversionRate"
FROM "EmailSequenceAnalytics" a
JOIN "EmailSequence" s ON s.id = a."sequenceId"
WHERE a.date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.date DESC, s.name;
```

---

## TROUBLESHOOTING

### ❌ "Emails no se envían"

**Check**:
1. ✅ RESEND_API_KEY está configurada?
2. ✅ Dominio verificado en Resend?
3. ✅ Secuencias seeded en DB?
4. ✅ UserSequenceState existe para usuario?

**Debug**:
```sql
SELECT * FROM "UserSequenceState" WHERE "userId" = 'tu-user-id';
```

### ❌ "Cron job no ejecuta"

**Check**:
1. ✅ vercel.json está committed?
2. ✅ Deployed a Vercel?
3. ✅ CRON_SECRET configurado?

**Debug**:
```bash
# Test manual
curl https://tudominio.com/api/cron/email-sequences \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

### ❌ "Webhook no funciona"

**Check**:
1. ✅ URL correcta en Resend?
2. ✅ Eventos seleccionados?
3. ✅ Endpoint deployed?

**Debug**:
```bash
# Ver logs
Vercel Dashboard → Functions → /api/webhooks/resend
```

### ❌ "Rate limit exceeded"

**Fix**:
- Free tier: 100 emails/día
- Upgrade a Pro: $20/mes = 50,000 emails/mes

O ajusta delays:
```bash
EMAIL_MAX_PER_DAY="50"  # Reducir límite diario
```

---

## CHECKLIST FINAL

Antes de marcar como completado:

- [ ] ✅ Cuenta de Resend creada
- [ ] ✅ Dominio verificado (verde en Resend)
- [ ] ✅ API key obtenida y configurada
- [ ] ✅ Variables de entorno agregadas
- [ ] ✅ `npx prisma generate` ejecutado
- [ ] ✅ `npx prisma db push` ejecutado
- [ ] ✅ `npx tsx scripts/seed-email-sequences.ts` ejecutado exitosamente
- [ ] ✅ Webhook configurado en Resend
- [ ] ✅ Cron job configurado (vercel.json)
- [ ] ✅ Test email enviado y recibido
- [ ] ✅ Cron job testeado manualmente
- [ ] ✅ Webhook testeado (abrir/click email)
- [ ] ✅ Integrado en signup
- [ ] ✅ Integrado en mensajes
- [ ] ✅ Monitoreando métricas

---

## SIGUIENTE NIVEL

Una vez que tengas lo básico funcionando:

1. **Optimizar subject lines** - A/B test
2. **Ajustar delays** - Basado en métricas
3. **Personalizar contenido** - Segmentar por plan/uso
4. **Agregar más secuencias** - Feature announcements, etc
5. **Multi-idioma** - ES, EN, PT
6. **Smart timing** - Enviar en horario óptimo por usuario

---

## RECURSOS

- **Docs completas**: `/docs/EMAIL_SEQUENCES_SYSTEM.md`
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **React Email**: [react.email](https://react.email)
- **Resumen ejecutivo**: `/EMAIL_SEQUENCES_RESUMEN.md`

---

**Tiempo total**: ~30 minutos
**Resultado**: Sistema de emails automáticos funcionando 🚀

¡Listo para convertir usuarios!
