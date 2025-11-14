# 📧 Sistema de Emails - DonWeb

Guía completa del sistema dual de emails que soporta tanto **SMTP** (económico) como **API** (escalable).

## 🎯 Resumen Ejecutivo

El sistema soporta **dos proveedores de email** que puedes cambiar con una simple variable de entorno:

| Proveedor | Costo/Año | Límite Diario | Usuarios Soportados | Cuándo Usar |
|-----------|-----------|---------------|---------------------|-------------|
| **SMTP** (Mail Profesional) | $20 USD (~$24K ARS) | 2,400 emails | ~30,000 activos | **Empezar aquí** ⭐ |
| **API** (EnvíaloSimple) | $228 USD (~$274K ARS) | 24,000 emails | 300,000+ activos | Solo si superas límites |

**Recomendación**: Usa SMTP al inicio. Es **11.5 veces más barato** y suficiente para crecer significativamente.

---

## 📊 Análisis de Costos vs Beneficios

### ¿Cuándo usar SMTP?

**✅ SMTP es suficiente si:**
- Tienes menos de 30,000 usuarios activos
- Envías menos de 2,000 emails por día
- Quieres minimizar costos iniciales
- Recién estás empezando o validando el mercado

**Cálculo de Uso Real:**

Con **1,000 usuarios de pago**, enviarías aproximadamente:

```
📧 Emails por Evento:
├─ Nuevas suscripciones: ~20-30/día (asumiendo crecimiento 2-3% diario)
├─ Pagos mensuales: ~33/día (1,000 usuarios ÷ 30 días)
├─ Pagos fallidos: ~5-10/día (estimando 5% tasa de fallo)
├─ Cancelaciones: ~2-5/día
└─ Reactivaciones: ~1-2/día

📈 Total: ~60-80 emails/día
🎯 Uso del límite: 3% (80 de 2,400)
```

Incluso con **10,000 usuarios**, seguirías usando solo el 30% del límite:

```
Con 10,000 usuarios:
├─ Nuevas suscripciones: ~100/día
├─ Pagos mensuales: ~333/día
├─ Otros eventos: ~50/día
└─ Total: ~483 emails/día (20% del límite)
```

### ¿Cuándo escalar a API?

**🔄 Considera API cuando:**
- Superas 2,000 emails/día consistentemente
- Tienes más de 30,000 usuarios activos
- Agregas newsletters o emails masivos
- Necesitas mejor analytics y tracking
- Requieres 99.9% uptime SLA

**Indicadores para Migrar:**

```bash
# Si tu uso supera el 80% del límite por 7 días consecutivos
Daily emails > 1,920/día (80% de 2,400)

# O si experimentas throttling frecuente
Emails rechazados > 5% del volumen
```

---

## 🔧 Configuración

### 1. Configurar SMTP (Recomendado para Empezar)

#### En DonWeb:
1. Ve a **Panel DonWeb** → **Mail Profesional**
2. Crea una cuenta: `noreply@tudominio.com`
3. Anota la contraseña

#### En tu aplicación:
```bash
# .env
EMAIL_PROVIDER="smtp"

# Configuración SMTP
SMTP_HOST="smtp.envialosimple.email"
SMTP_PORT="587"
SMTP_USER="noreply@tudominio.com"
SMTP_PASS="tu_contraseña_aquí"
SMTP_SECURE="false"

# Remitente
ENVIALOSIMPLE_FROM_EMAIL="noreply@tudominio.com"
ENVIALOSIMPLE_FROM_NAME="Circuit Prompt AI"
```

#### Verificar configuración:
```typescript
import { sendTestEmail } from '@/lib/email';

// Enviar email de prueba
await sendTestEmail('tu-email@ejemplo.com');
```

### 2. Migrar a API (Solo Cuando Sea Necesario)

#### En DonWeb:
1. Ve a **Panel DonWeb** → **EnvíaloSimple Transaccional**
2. Contrata el servicio ($19/mes)
3. Genera un API Key en el panel

#### En tu aplicación:
```bash
# .env
EMAIL_PROVIDER="api"  # ← Solo cambiar esta línea

# API Key
ENVIALOSIMPLE_API_KEY="tu_api_key_aquí"

# Remitente (mismo que SMTP)
ENVIALOSIMPLE_FROM_EMAIL="noreply@tudominio.com"
ENVIALOSIMPLE_FROM_NAME="Circuit Prompt AI"
```

**¡Eso es todo!** El código es el mismo, solo cambias la variable `EMAIL_PROVIDER`.

---

## 📈 Métricas y Monitoreo

### Monitorear Uso de SMTP

Crea un script para revisar el uso diario:

```typescript
// scripts/monitor-email-usage.ts
import { prisma } from '@/lib/prisma';

async function monitorEmailUsage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Contar emails enviados hoy (desde logs)
  const emailsSentToday = await prisma.log.count({
    where: {
      level: 'info',
      message: { contains: 'Email sent successfully' },
      timestamp: { gte: today },
    },
  });

  const limit = 2400; // Límite diario SMTP
  const usagePercent = (emailsSentToday / limit) * 100;

  console.log(`📧 Emails enviados hoy: ${emailsSentToday}/${limit}`);
  console.log(`📊 Uso del límite: ${usagePercent.toFixed(1)}%`);

  if (usagePercent > 80) {
    console.warn('⚠️  ALERTA: Uso superior al 80% - Considera escalar a API');
  }

  return { emailsSentToday, limit, usagePercent };
}

monitorEmailUsage();
```

Ejecutar diariamente con cron:

```bash
# crontab -e
0 22 * * * cd /path/to/app && npm run monitor:emails >> /var/log/email-usage.log
```

### Dashboard de Métricas

```typescript
// app/api/admin/email-stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const emailStats = await prisma.log.groupBy({
    by: ['timestamp'],
    where: {
      level: 'info',
      message: { contains: 'Email sent successfully' },
      timestamp: { gte: last7Days },
    },
    _count: { id: true },
  });

  return NextResponse.json({
    stats: emailStats,
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    dailyLimit: process.env.EMAIL_PROVIDER === 'api' ? 24000 : 2400,
  });
}
```

---

## 🔍 Troubleshooting

### Error: "SMTP connection verification failed"

```bash
# Verificar credenciales
SMTP_USER="noreply@tudominio.com"  # Debe ser email completo
SMTP_PASS="tu_contraseña"  # Sin espacios ni caracteres especiales

# Verificar puerto
SMTP_PORT="587"  # Para STARTTLS
SMTP_SECURE="false"

# O usar SSL
SMTP_PORT="465"
SMTP_SECURE="true"
```

### Error: "550 Rate limit exceeded"

Has superado el límite de 100 emails/hora:

```typescript
// Solución temporal: Implementar cola con rate limiting
import { Queue } from 'bullmq';

const emailQueue = new Queue('emails', {
  limiter: {
    max: 90,  // 90 emails
    duration: 3600000,  // Por hora (bajo el límite de 100)
  },
});
```

Solución permanente: **Migrar a API**

### Emails llegan a SPAM

1. **Configurar SPF:**
   ```
   v=spf1 include:_spf.envialosimple.email ~all
   ```

2. **Configurar DKIM:**
   DonWeb lo configura automáticamente, verificar en panel.

3. **Configurar DMARC:**
   ```
   _dmarc.tudominio.com TXT "v=DMARC1; p=quarantine; rua=mailto:admin@tudominio.com"
   ```

---

## 📚 Arquitectura del Sistema

### Flujo de Envío

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Webhook/API llama a sendSubscriptionWelcomeEmail()      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. subscription-emails.ts formatea datos y genera HTML     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. lib/email/index.ts (Unified Service)                    │
│    ├─ Lee EMAIL_PROVIDER                                   │
│    ├─ Aplica sustituciones {{variable}}                    │
│    └─ Delega a SMTP o API                                  │
└────────────┬────────────────────────┬─────────────────────┘
             │                        │
      (smtp) │                        │ (api)
             ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ lib/email/smtp.ts│    │ lib/email/       │
    │ (nodemailer)     │    │ envialosimple.ts │
    └──────────────────┘    └──────────────────┘
             │                        │
             ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ DonWeb SMTP      │    │ EnvíaloSimple    │
    │ smtp.envialos... │    │ API              │
    └──────────────────┘    └──────────────────┘
```

### Archivos del Sistema

```
lib/email/
├── index.ts              # ⭐ Servicio unificado (SMTP/API)
├── smtp.ts               # Implementación SMTP (nodemailer)
├── envialosimple.ts      # Implementación API
├── subscription-emails.ts # Funciones de alto nivel
└── templates/
    └── subscription.ts   # Templates HTML

Uso en tu app:
├── app/api/webhooks/mercadopago/route.ts  # Webhooks automáticos
└── app/api/billing/cancel/route.ts        # Cancelación/reactivación
```

---

## 🚀 Plan de Escalamiento

### Fase 1: Inicio (0 - 10K usuarios)
- **Proveedor**: SMTP
- **Costo**: $20/año
- **Acción**: Monitorear métricas semanalmente

### Fase 2: Crecimiento (10K - 30K usuarios)
- **Proveedor**: SMTP (todavía)
- **Costo**: $20/año
- **Acción**: Monitorear métricas diariamente, preparar migración

### Fase 3: Escala (30K+ usuarios)
- **Proveedor**: Migrar a API
- **Costo**: $228/año
- **Acción**: Cambiar `EMAIL_PROVIDER="api"` y agregar API key

### Fase 4: Hipercrecimiento (100K+ usuarios)
- **Proveedor**: API + Múltiples cuentas o SendGrid/AWS SES
- **Costo**: Variable ($500-2000/año)
- **Acción**: Evaluar alternativas empresariales

---

## 💡 Tips de Optimización

### 1. Reducir Volumen de Emails

```typescript
// Agrupar notificaciones diarias en lugar de instantáneas
const preferences = {
  emailFrequency: 'daily' | 'weekly' | 'realtime',
};

// Respetar preferencias de usuario
if (user.emailFrequency === 'daily') {
  // Enviar digest diario a las 9am
  await scheduleDigestEmail(user, 9);
} else {
  // Enviar instantáneo
  await sendEmail(options);
}
```

### 2. Cache de Templates

```typescript
// Cachear templates renderizados
import { LRUCache } from 'lru-cache';

const templateCache = new LRUCache<string, string>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hora
});

function getCachedTemplate(key: string, generator: () => string): string {
  const cached = templateCache.get(key);
  if (cached) return cached;

  const template = generator();
  templateCache.set(key, template);
  return template;
}
```

### 3. Batch Processing

Para envíos masivos (ej: newsletters):

```typescript
import { chunk } from 'lodash';

async function sendBulkEmails(recipients: string[], html: string) {
  // Enviar en lotes de 50 cada 30 segundos
  const batches = chunk(recipients, 50);

  for (const batch of batches) {
    await Promise.all(
      batch.map(to => sendEmail({ to, subject: '...', html }))
    );
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
  }
}
```

---

## ✅ Checklist de Deployment

### Antes de Producción

- [ ] Configurar cuenta Mail Profesional en DonWeb
- [ ] Crear email `noreply@tudominio.com`
- [ ] Agregar variables de entorno al servidor
- [ ] Configurar SPF, DKIM, DMARC
- [ ] Enviar email de prueba con `sendTestEmail()`
- [ ] Verificar que emails no llegan a spam
- [ ] Configurar monitoreo de métricas
- [ ] Configurar alertas para límites (>80%)

### Después de Lanzamiento

- [ ] Monitorear logs diarios
- [ ] Revisar tasa de apertura
- [ ] Revisar tasa de spam
- [ ] Ajustar templates según feedback
- [ ] Planear migración a API si es necesario

---

## 📞 Soporte

### DonWeb
- **Panel**: https://panel.donweb.com/
- **Soporte**: https://soporte.donweb.com/
- **Email**: soporte@donweb.com

### EnvíaloSimple
- **Panel**: https://app.envialosimple.com/
- **Docs**: https://api-transaccional.envialosimple.email/
- **Soporte**: soporte@envialosimple.com

---

## 🎓 Recursos Adicionales

- [Documentación EnvíaloSimple API](https://api-transaccional.envialosimple.email/)
- [Guía SMTP DonWeb](https://soporte.donweb.com/hc/es/articles/22286062992532)
- [Límites de Envío DonWeb](https://soporte.donweb.com/hc/es/articles/18336267150100)
- [Mejores Prácticas Email Transaccional](https://www.mailgun.com/blog/email/transactional-email-best-practices/)

---

**Última actualización**: 2025-01-07

¿Preguntas? Abre un issue o contacta al equipo de desarrollo.
