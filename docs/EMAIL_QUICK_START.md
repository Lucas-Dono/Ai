# 📧 Configuración Rápida de Emails - DonWeb

Guía de 5 minutos para configurar el sistema de emails en DonWeb.

## 🎯 TL;DR

**Usa SMTP (Mail Profesional)** - Es 11.5x más barato y suficiente para hasta 30,000 usuarios.

| Característica | SMTP | API |
|----------------|------|-----|
| **Costo anual** | $20 USD | $228 USD |
| **Límite diario** | 2,400 emails | 24,000 emails |
| **Configuración** | 5 minutos | 10 minutos |

---

## ⚡ Configuración en 5 Pasos

### 1️⃣ Crear Cuenta de Email en DonWeb

```bash
1. Ir a Panel DonWeb → Mail Profesional
2. Crear cuenta: noreply@tudominio.com
3. Establecer contraseña segura
4. Anotar las credenciales
```

### 2️⃣ Configurar Variables de Entorno

Copia esto a tu archivo `.env`:

```bash
# Proveedor de email (usar SMTP para empezar)
EMAIL_PROVIDER="smtp"

# Configuración SMTP (DonWeb Mail Profesional)
SMTP_HOST="smtp.envialosimple.email"
SMTP_PORT="587"
SMTP_USER="noreply@tudominio.com"
SMTP_PASS="tu_contraseña_aqui"
SMTP_SECURE="false"

# Datos del remitente
ENVIALOSIMPLE_FROM_EMAIL="noreply@tudominio.com"
ENVIALOSIMPLE_FROM_NAME="Circuit Prompt AI"
```

### 3️⃣ Probar Configuración

```bash
# Enviar email de prueba
npm run test:email tu-email@ejemplo.com
```

Deberías recibir un email en ~10 segundos.

### 4️⃣ Verificar Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log | grep "Email"

# O si usas PM2:
pm2 logs | grep "Email"
```

### 5️⃣ Configurar SPF/DKIM (Recomendado)

Para evitar que los emails caigan en SPAM:

```bash
1. Ir a Panel DonWeb → Tu Dominio → DNS
2. Agregar registro TXT:
   Nombre: @
   Valor: v=spf1 include:_spf.envialosimple.email ~all
```

El DKIM lo configura DonWeb automáticamente.

---

## ✅ ¡Listo!

Tu sistema de emails ya está funcionando. Los emails se enviarán automáticamente cuando:

- ✉️ Un usuario se suscribe → Email de bienvenida
- 💳 Se procesa un pago → Email de confirmación
- ⚠️ Falla un pago → Email de alerta
- 🚫 Se cancela suscripción → Email de despedida
- 🎊 Se reactiva suscripción → Email de reactivación

---

## 📊 Monitorear Uso

```bash
# Ver estadísticas diarias
npm run monitor:emails

# Configurar como cron job (Linux/Mac)
crontab -e
# Agregar esta línea:
0 22 * * * cd /path/to/app && npm run monitor:emails >> /var/log/email-usage.log
```

---

## 🔄 Migrar a API (Solo Si Superas Límites)

Si eventualmente necesitas más capacidad:

```bash
1. Contratar EnvíaloSimple Transaccional en DonWeb
2. Generar API Key en el panel
3. Cambiar en .env:
   EMAIL_PROVIDER="api"
   ENVIALOSIMPLE_API_KEY="tu_api_key_aqui"
4. Reiniciar app
```

**¡Eso es todo!** El código es el mismo, solo cambia la configuración.

---

## 🆘 Troubleshooting

### "SMTP connection failed"
```bash
# Verificar credenciales
echo $SMTP_USER  # Debe ser email completo: noreply@tudominio.com
echo $SMTP_PASS  # Sin espacios ni caracteres especiales

# Probar conexión manual
telnet smtp.envialosimple.email 587
```

### "Emails llegan a SPAM"
```bash
# Verificar SPF
dig TXT tudominio.com +short

# Debe incluir: "v=spf1 include:_spf.envialosimple.email ~all"
```

### "Rate limit exceeded"
```bash
# Ver uso actual
npm run monitor:emails

# Si supera 80%, considera migrar a API
EMAIL_PROVIDER="api"
```

---

## 📚 Más Información

- [Documentación Completa](./EMAIL_SYSTEM_DONWEB.md)
- [Soporte DonWeb](https://soporte.donweb.com/)
- [Límites de Envío](https://soporte.donweb.com/hc/es/articles/18336267150100)

---

**Tiempo total de configuración**: ~5 minutos ⏱️

¿Problemas? Revisa la [documentación completa](./EMAIL_SYSTEM_DONWEB.md) o contacta soporte.
