# Sistema de Administración Segura - Guía de Setup Completa

## 🎯 Descripción del Sistema

Panel de administración ultra-seguro con múltiples capas de protección:

- **mTLS**: Certificados cliente de 48h con renovación automática
- **TOTP**: Autenticación de dos factores (Google Authenticator)
- **SSH Recovery**: Sistema de recuperación de emergencia vía SSH
- **Audit Logs**: Registro completo de todas las acciones
- **Sin superficie pública**: El admin no es accesible desde internet público
- **$0 de costo**: Sin dependencias de pago

### Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────┐
│                  USO NORMAL (48h)                    │
│  Navegador + Certificado → mTLS → NGINX → Admin     │
│  + Passkey (Face ID / Huella)                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            RECUPERACIÓN DE EMERGENCIA                │
│  SSH + TOTP (Google Authenticator) →                │
│  Genera certificado 24h → Acceso restaurado         │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Prerrequisitos

### Software Necesario

```bash
# Servidor Linux (Ubuntu/Debian recomendado)
- Node.js 18+
- PostgreSQL 14+
- NGINX
- OpenSSL
- SSH configurado

# Instalación (Ubuntu/Debian)
sudo apt update
sudo apt install nginx openssl postgresql nodejs npm
```

### Dependencias del Proyecto

```bash
cd /ruta/a/tu/proyecto
npm install speakeasy qrcode bcryptjs
```

---

## 🚀 Setup Completo (Paso a Paso)

### FASE 1: Configuración de Base de Datos

#### 1. Generar clave maestra de cifrado

```bash
# Generar clave de 32 bytes (64 caracteres hex)
openssl rand -hex 32
```

#### 2. Agregar a .env

```bash
# En tu archivo .env
ADMIN_MASTER_KEY=tu_clave_generada_aqui_64_caracteres_hex
```

⚠️ **IMPORTANTE:** Esta clave cifra los secrets TOTP. **NUNCA** la compartas ni la subas a Git.

#### 3. Ejecutar migraciones

```bash
# Aplicar migraciones de Prisma
npx prisma migrate dev

# O si ya existe la BD
npx prisma db push
```

---

### FASE 2: Configuración de Certificate Authority

#### 1. Ejecutar setup de CA

```bash
npm run admin:setup-ca
```

Esto generará:
- `certs/ca/ca.key` - Clave privada de la CA (400 permisos)
- `certs/ca/ca.crt` - Certificado de la CA
- `certs/ca/openssl-client.cnf` - Config para certificados cliente
- `certs/ca/crl.pem` - Lista de revocación

#### 2. Hacer backup de la CA

```bash
# IMPORTANTE: Guardar en lugar seguro (USB cifrado, etc.)
tar -czf ca-backup-$(date +%Y%m%d).tar.gz certs/ca/
```

---

### FASE 3: Crear Primer Admin

#### 1. Asegurar que el usuario existe en la BD

```bash
# Verificar en Prisma Studio
npx prisma studio

# O por SQL
psql -U tu_usuario -d tu_database -c "SELECT id, email FROM \"User\" WHERE email = 'admin@tudominio.com';"
```

Si no existe, créalo desde tu aplicación o manualmente.

#### 2. Configurar TOTP para el admin

```bash
npm run admin:setup-totp -- admin@tudominio.com
```

Esto mostrará:
1. **QR Code** - Escanear con Google Authenticator
2. **Secret manual** - Por si no puedes escanear
3. **5 Backup codes** - Guardar en lugar seguro

**⚠️ IMPORTANTE:**
- Guarda los backup codes en password manager o papel
- Escanea el QR inmediatamente con tu móvil
- Prueba que funciona antes de continuar

#### 3. Generar certificado cliente (48h)

```bash
npm run admin:generate-cert -- admin@tudominio.com "MacBook Pro" 48
```

Esto generará:
- Archivo `.p12` (certificado para navegador)
- Password del certificado
- Fecha de expiración (48 horas)

#### 4. Instalar certificado en navegador

**Chrome/Edge:**
1. Configuración → Privacidad y seguridad → Seguridad
2. Administrar certificados → Importar
3. Seleccionar archivo `.p12`
4. Introducir password

**Firefox:**
1. Configuración → Privacidad y seguridad
2. Ver certificados → Sus certificados → Importar
3. Seleccionar archivo `.p12`
4. Introducir password

---

### FASE 4: Configuración de NGINX

#### 1. Copiar configuración

```bash
# Copiar archivo de configuración
sudo cp nginx/admin-mtls.conf /etc/nginx/sites-available/admin-mtls.conf
```

#### 2. Editar configuración

```bash
sudo nano /etc/nginx/sites-available/admin-mtls.conf
```

Reemplazar:
- `tu-dominio.com` → Tu dominio real
- `/ruta/a/tu/proyecto/certs/ca/ca.crt` → Ruta real a tu CA
- `/ruta/a/tu/proyecto/certs/ca/crl.pem` → Ruta real a tu CRL

#### 3. Obtener certificado SSL (Let's Encrypt)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

#### 4. Habilitar sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/admin-mtls.conf /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Si todo OK, recargar
sudo systemctl reload nginx
```

#### 5. Abrir puerto 8443 en firewall

```bash
# UFW
sudo ufw allow 8443/tcp

# O iptables
sudo iptables -A INPUT -p tcp --dport 8443 -j ACCEPT
```

---

### FASE 5: Configuración de SSH (Opcional pero Recomendado)

Sigue la guía: [SSH-HARDENING.md](./SSH-HARDENING.md)

Pasos clave:
1. Configurar autenticación por clave pública
2. Desactivar password authentication
3. Instalar y configurar Fail2Ban
4. Rate limiting

---

### FASE 6: Verificación del Sistema

#### 1. Probar acceso admin

```bash
# Abrir navegador en:
https://tu-dominio.com:8443/admin
```

Deberías ver:
1. El navegador solicita seleccionar certificado cliente ✅
2. Acceso al panel admin ✅

Si no funciona:
- Verifica que el certificado está instalado
- Revisa logs de NGINX: `sudo tail -f /var/log/nginx/admin-error.log`
- Verifica que Next.js está corriendo en puerto 3001

#### 2. Probar renovación de certificado

```bash
# Generar otro certificado para el mismo admin
npm run admin:generate-cert -- admin@tudominio.com "Desktop Casa" 48
```

#### 3. Probar recuperación de emergencia (SSH)

```bash
# Conectar al servidor por SSH
ssh admin@tu-servidor.com

# Ejecutar script de emergencia
cd /ruta/a/tu/proyecto
./scripts/admin/emergency-cert-ssh.sh
```

Seguir las instrucciones:
1. Ingresar email admin
2. Ingresar código TOTP (de Google Authenticator)
3. Descargar certificado generado (24h)

---

## 🔄 Uso Diario

### Acceso Normal

1. Abrir `https://tu-dominio.com:8443/admin`
2. Navegador usa certificado automáticamente
3. (Opcional) Passkey biométrico
4. ✅ Estás dentro

**El certificado se auto-renueva cada vez que entras**, así que no te preocupes por la expiración de 48h.

### Si el Certificado Expira

```bash
# Opción 1: Generar uno nuevo desde otra máquina con certificado válido
npm run admin:generate-cert -- admin@tudominio.com "Laptop" 48

# Opción 2: Recuperación de emergencia por SSH
ssh admin@tu-servidor.com
cd /ruta/a/proyecto
./scripts/admin/emergency-cert-ssh.sh
```

---

## 🛠️ Comandos Útiles

### Gestión de Certificados

```bash
# Listar todos los certificados
npm run admin:list-certs

# Listar certificados de un admin específico
npm run admin:list-certs -- admin@tudominio.com

# Revocar certificado
npm run admin:revoke-cert -- <serial-number> "stolen"

# Limpiar certificados expirados
npm run admin:cleanup-certs
```

### Gestión de TOTP

```bash
# Setup TOTP para nuevo admin
npm run admin:setup-totp -- nuevo-admin@dominio.com

# Regenerar backup codes (si los perdiste)
npm run admin:regenerate-backup-codes -- admin@dominio.com
```

### Auditoría

```bash
# Ver logs de auditoría (desde Prisma Studio)
npx prisma studio
# Ir a tabla AuditLog

# O por SQL
psql -U user -d database -c "SELECT * FROM \"AuditLog\" ORDER BY \"createdAt\" DESC LIMIT 20;"
```

---

## 🔐 Backup y Recuperación

### Backup Esencial

```bash
# 1. Backup de CA (CRÍTICO)
tar -czf ca-backup.tar.gz certs/ca/

# 2. Backup de BD (con audit logs)
pg_dump -U user database > backup-$(date +%Y%m%d).sql

# 3. Backup de .env (CLAVE MAESTRA)
# Guardar en lugar seguro, NUNCA en Git
```

### Recuperación ante Desastre

#### Si pierdes la CA

```bash
# PROBLEMA: Todos los certificados son inválidos
# SOLUCIÓN: Recrear CA y regenerar certificados

rm -rf certs/ca/
npm run admin:setup-ca
npm run admin:generate-cert -- admin@email.com "Device" 48
# Reinstalar certificado en navegador
```

#### Si pierdes ADMIN_MASTER_KEY

```bash
# PROBLEMA: No se pueden descifrar secrets TOTP
# SOLUCIÓN: Reconfigurar TOTP para cada admin

# 1. Limpiar secrets en BD
psql -c "UPDATE \"AdminAccess\" SET \"totpSecret\" = NULL;"

# 2. Reconfigurar para cada admin
npm run admin:setup-totp -- admin@email.com
```

#### Si pierdes móvil con TOTP

```bash
# OPCIÓN 1: Usar backup code
# Durante login, usar uno de los 5 backup codes guardados

# OPCIÓN 2: Acceder por SSH sin TOTP
ssh admin@servidor
# Deshabilitar TOTP temporalmente en BD
psql -c "UPDATE \"AdminAccess\" SET \"totpSecret\" = NULL WHERE id = 'xxx';"
# Reconfigurar TOTP
npm run admin:setup-totp -- admin@email.com
```

---

## 🚨 Troubleshooting

### Error: "No se puede conectar a https://dominio.com:8443"

```bash
# Verificar que NGINX está corriendo
sudo systemctl status nginx

# Verificar que el puerto 8443 está abierto
sudo netstat -tlnp | grep 8443

# Verificar logs
sudo tail -f /var/log/nginx/admin-error.log
```

### Error: "Certificate required"

- Verifica que instalaste el certificado `.p12` en tu navegador
- Verifica que el certificado no ha expirado (48h)
- Intenta reiniciar el navegador

### Error: "TOTP inválido" en SSH

- Verifica que la hora del servidor está sincronizada: `timedatectl`
- Verifica que el código tiene 6 dígitos
- Espera 30 segundos y prueba con nuevo código

### Error: "ADMIN_MASTER_KEY no configurada"

```bash
# Generar nueva clave
openssl rand -hex 32

# Agregar a .env
echo "ADMIN_MASTER_KEY=tu_clave_aqui" >> .env

# Reiniciar aplicación
pm2 restart all  # o tu método de restart
```

---

## 📚 Estructura de Archivos

```
proyecto/
├── certs/
│   ├── ca/
│   │   ├── ca.key              # Clave privada CA (CRÍTICO)
│   │   ├── ca.crt              # Certificado CA
│   │   ├── openssl-client.cnf  # Config OpenSSL
│   │   └── crl.pem             # Certificate Revocation List
│   ├── client/                 # Certificados cliente generados
│   └── temp/                   # Certificados temporales
│
├── scripts/admin/
│   ├── setup-ca.sh             # Setup de CA
│   ├── cert-manager.ts         # Gestor de certificados
│   ├── generate-cert-cli.ts    # CLI generación certificados
│   ├── setup-totp.ts           # Setup TOTP
│   ├── verify-totp.ts          # Verificación TOTP
│   └── emergency-cert-ssh.sh   # Recuperación SSH
│
├── lib/admin/
│   └── crypto.ts               # Utilidades de cifrado
│
├── nginx/
│   └── admin-mtls.conf         # Config NGINX con mTLS
│
├── docs/
│   ├── ADMIN-SETUP.md          # Este archivo
│   └── SSH-HARDENING.md        # Guía de SSH
│
└── prisma/
    ├── schema.prisma            # Schema con modelos admin
    └── migrations/              # Migraciones
```

---

## ✅ Checklist de Setup

- [ ] ADMIN_MASTER_KEY generada y en .env
- [ ] Migraciones de BD ejecutadas
- [ ] CA creada y backup guardado
- [ ] TOTP configurado y testeado
- [ ] Certificado cliente generado e instalado
- [ ] NGINX configurado con mTLS
- [ ] Puerto 8443 abierto en firewall
- [ ] SSL/TLS (Let's Encrypt) configurado
- [ ] SSH hardening aplicado
- [ ] Acceso admin verificado en navegador
- [ ] Recuperación de emergencia testeada
- [ ] Backup codes guardados en lugar seguro
- [ ] Documentación leída y entendida

---

## 🎓 Recursos Adicionales

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NGINX SSL Module](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Mozilla SSH Guidelines](https://infosec.mozilla.org/guidelines/openssh)

---

## 📞 Soporte

Si encuentras algún problema durante el setup, revisa:

1. Logs de NGINX: `/var/log/nginx/admin-error.log`
2. Logs de la aplicación
3. Tabla `AuditLog` en la BD
4. Este documento y [SSH-HARDENING.md](./SSH-HARDENING.md)
