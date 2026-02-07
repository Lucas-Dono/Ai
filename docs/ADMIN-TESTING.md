# Guía de Testing Completa - Sistema Admin

Esta guía te llevará paso a paso para probar todo el sistema de administración segura.

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener:

- [ ] Node.js y npm instalados
- [ ] PostgreSQL corriendo
- [ ] Proyecto clonado y dependencias instaladas
- [ ] Puerto 3000 y 8443 disponibles
- [ ] OpenSSL disponible en tu sistema

---

## 🚀 FASE 1: Setup Inicial

### 1. Configurar Variables de Entorno

```bash
# Generar clave maestra
openssl rand -hex 32

# Agregar a .env
echo "ADMIN_MASTER_KEY=<tu_clave_aqui>" >> .env
```

Verifica que tu `.env` tenga:
```env
DATABASE_URL="postgresql://..."
ADMIN_MASTER_KEY="<64_caracteres_hex>"
```

### 2. Ejecutar Migraciones

```bash
# Aplicar migraciones de Prisma
npx prisma migrate dev

# O si ya tienes BD:
npx prisma db push

# Verificar con Prisma Studio
npx prisma studio
```

**✅ Verificar:** Deberías ver las nuevas tablas:
- AdminAccess
- AdminCertificate
- CertificateDownloadToken
- AdminBackupCode
- AuditLog

---

## 🔐 FASE 2: Configuración de Seguridad

### 3. Setup de Certificate Authority

```bash
npm run admin:setup-ca
```

**Responde las preguntas:**
- País: AR (o el tuyo)
- Provincia: Buenos Aires (o la tuya)
- Ciudad: Buenos Aires (o la tuya)
- Resto: Enter para valores por defecto

**✅ Verificar:**
```bash
ls -la certs/ca/
# Deberías ver:
# ca.key (permisos 400)
# ca.crt
# openssl-client.cnf
# crl.pem
```

### 4. Configurar TOTP

```bash
# Reemplaza con tu email real
npm run admin:setup-totp -- admin@tudominio.com
```

**Pasos:**
1. Escanea el QR con Google Authenticator
2. **IMPORTANTE:** Guarda los 5 backup codes en lugar seguro
3. Verifica que el código se genera correctamente

**✅ Verificar en Prisma Studio:**
- Tabla `AdminAccess` tiene un registro
- Campo `totpSecret` tiene un valor cifrado

### 5. Generar Certificado Cliente

```bash
npm run admin:generate-cert -- admin@tudominio.com "Testing Laptop" 48
```

**Salida esperada:**
```
✅ Certificado generado exitosamente
═══════════════════════════════════════════════════════
📁 Archivo PKCS12: /path/to/cert.p12
🔑 Password:       xxxxxxxx
⏰ Expira:         2026-01-13T...
```

**Guarda:**
- Ruta del archivo `.p12`
- Password

### 6. Instalar Certificado en Navegador

**Chrome/Edge:**
1. `chrome://settings/certificates`
2. Pestaña "Tus certificados"
3. Importar → Seleccionar `.p12`
4. Introducir password
5. ✅ Deberías ver el certificado instalado

**Firefox:**
1. `about:preferences#privacy`
2. Ver certificados → Sus certificados
3. Importar → Seleccionar `.p12`
4. Introducir password
5. ✅ Deberías ver el certificado instalado

---

## 🖥️ FASE 3: Configuración del Servidor

### 7. Instalar Dependencias Adicionales

```bash
# SWR para data fetching
npm install swr

# Lucide React para iconos (si no está ya)
npm install lucide-react
```

### 8. Iniciar Aplicación (Desarrollo)

```bash
# Terminal 1: Next.js en puerto 3000 (público)
npm run dev

# Terminal 2 (opcional): Next.js en puerto 3001 (admin)
# PORT=3001 npm run dev
```

Por ahora, vamos a probar en desarrollo en el puerto 3000.

---

## 🧪 FASE 4: Testing de API

### 9. Probar Endpoint Dashboard (Sin NGINX)

Primero, vamos a probar la API directamente sin NGINX:

```bash
# Testing directo a la API
curl http://localhost:3000/api/admin-secure/dashboard
```

**Resultado esperado:**
```json
{
  "error": "Certificado cliente no válido o no presente"
}
```

Esto es correcto, porque sin NGINX no hay headers de certificado.

### 10. Configurar NGINX (Producción)

Edita `nginx/admin-mtls.conf`:
```bash
# Reemplazar:
- tu-dominio.com → tu dominio real o localhost
- /ruta/a/tu/proyecto/certs/ca/ca.crt → ruta absoluta
```

Copiar a NGINX:
```bash
sudo cp nginx/admin-mtls.conf /etc/nginx/sites-available/admin-mtls
sudo ln -s /etc/nginx/sites-available/admin-mtls /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Para testing local sin dominio:**
Puedes agregar a `/etc/hosts`:
```
127.0.0.1 admin.localhost
```

Y usar `admin.localhost:8443` en tu navegador.

---

## 🌐 FASE 5: Testing del Panel Web

### 11. Acceder al Admin Panel

Abre tu navegador y ve a:
```
http://localhost:3000/admin
```

**Comportamiento esperado:**
1. El navegador te pide seleccionar un certificado
2. Selecciona el certificado que instalaste
3. ✅ Deberías ver el Dashboard con estadísticas

### 12. Testing de Funcionalidades

#### Dashboard
- [ ] Ver KPIs de usuarios, agentes, mensajes
- [ ] Estadísticas se cargan correctamente
- [ ] Gráficos de distribución de planes

#### Usuarios
- [ ] Lista de usuarios se carga
- [ ] Filtro por plan funciona
- [ ] Búsqueda funciona
- [ ] Paginación funciona

#### Agentes
- [ ] Lista de agentes se carga
- [ ] Información de creador visible
- [ ] Filtros funcionan

#### Moderación
- [ ] Reportes pendientes se muestran
- [ ] Cambiar entre pendientes/resueltos

#### Audit Logs
- [ ] Logs se muestran
- [ ] Paginación funciona
- [ ] Puedes ver acciones registradas

#### Certificados
- [ ] Tu certificado aparece en la lista
- [ ] Estado "Activo" visible
- [ ] Fecha de expiración correcta

---

## 🆘 FASE 6: Testing de Recuperación

### 13. Probar Recuperación SSH + TOTP

**Escenario:** Simular que perdiste acceso.

```bash
# 1. SSH a tu servidor (o local)
ssh localhost

# 2. Ejecutar script de emergencia
cd /ruta/a/tu/proyecto
./scripts/admin/emergency-cert-ssh.sh

# 3. Introducir datos:
#    Email: admin@tudominio.com
#    TOTP: [código de Google Authenticator]

# 4. Verificar output
```

**Salida esperada:**
```
✅ TOTP válido
🔐 Generando certificado de emergencia (24h)...
✅ Certificado generado

📁 Archivo:   /path/to/emergency-cert.p12
🔑 Password:  xxxxxxxx
```

### 14. Usar Certificado de Emergencia

1. Descargar el `.p12` generado
2. Importar en navegador
3. Acceder al admin (seleccionar nuevo certificado)
4. Verificar que funciona

---

## ✅ Checklist Final

### Infraestructura
- [ ] BD tiene todas las tablas necesarias
- [ ] CA creada y funcionando
- [ ] TOTP configurado
- [ ] Certificado generado e instalado
- [ ] NGINX configurado (si aplica)

### API
- [ ] GET /dashboard funciona
- [ ] GET /users funciona
- [ ] GET /agents funciona
- [ ] GET /moderation/reports funciona
- [ ] GET /audit-logs funciona
- [ ] GET /certificates funciona

### Panel Web
- [ ] Dashboard carga correctamente
- [ ] Usuarios lista y filtra
- [ ] Agentes lista correctamente
- [ ] Moderación muestra reportes
- [ ] Audit logs muestra acciones
- [ ] Certificados lista tus certs

### Seguridad
- [ ] Certificado requerido para acceder
- [ ] Sin certificado = acceso denegado
- [ ] Audit logs registran acciones
- [ ] Recuperación SSH + TOTP funciona

### Documentación
- [ ] ADMIN-README.md leído
- [ ] ADMIN-SETUP.md leído
- [ ] ADMIN-API.md revisado
- [ ] SSH-HARDENING.md entendido

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'swr'"

```bash
npm install swr
```

### Error: "Certificate required"

Verifica:
1. Certificado instalado en navegador
2. Certificado no expirado (48h)
3. Navegador actualizado

### Error: "AdminAccess no encontrado"

```bash
# Verificar en Prisma Studio
npx prisma studio

# Debería existir registro en AdminAccess para tu email
```

### Error: TOTP inválido

Verifica:
1. Hora del servidor sincronizada: `timedatectl`
2. Código de 6 dígitos correcto
3. Usar código nuevo (cambia cada 30s)

### Panel muestra errores de API

```bash
# Verificar logs del servidor
# Terminal donde corre npm run dev

# Verificar en navegador
# F12 → Console → Ver errores

# Verificar certificado enviado
# F12 → Network → Headers → Ver X-Client-Cert-*
```

---

## 📊 Testing Avanzado

### Testing de Carga

```bash
# Apache Bench (si tienes)
ab -n 100 -c 10 -E client.p12:password https://localhost:8443/api/admin-secure/dashboard
```

### Testing de Seguridad

```bash
# Intentar acceso sin certificado
curl https://localhost:8443/api/admin-secure/dashboard
# Esperado: Connection refused o Certificate required

# Intentar con certificado revocado
npm run admin:revoke-cert -- <serial> "testing"
# Luego intentar acceder → debería denegar
```

### Testing de Audit Logs

```bash
# Hacer varias acciones en el panel
# Luego verificar en audit logs que todo se registró

# O con curl:
curl --cert client.p12:password \
  https://localhost:8443/api/admin-secure/audit-logs?limit=20
```

---

## ✨ Testing Completado

Si llegaste hasta aquí y todo funciona, **¡felicidades!** 🎉

Tienes un sistema de administración ultra-seguro con:
- ✅ mTLS con certificados de 48h
- ✅ TOTP para recuperación
- ✅ SSH como backup
- ✅ Audit logs completos
- ✅ Panel web funcional
- ✅ $0 de costo

---

## 📝 Próximos Pasos

1. **Producción:**
   - Configurar dominio real
   - SSL con Let's Encrypt
   - SSH hardening
   - Backups automáticos

2. **Mejoras:**
   - Passkeys (WebAuthn)
   - Notificaciones
   - Gráficos avanzados
   - Export de datos

3. **Monitoreo:**
   - Alertas de acceso
   - Métricas de uso
   - Reportes automáticos

¿Todo funcionando? ¡Ahora puedes administrar tu plataforma de forma segura! 🚀
