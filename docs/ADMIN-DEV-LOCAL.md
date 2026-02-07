# Guía de Desarrollo Local - Sistema Admin

Esta guía te muestra cómo probar el sistema admin en tu entorno local **sin necesidad de NGINX**.

## 🎯 Overview

En modo desarrollo, el sistema permite autenticación simplificada usando un header HTTP especial (`X-Dev-Admin-Email`) en lugar de certificados mTLS de NGINX. Esto facilita el testing rápido mientras mantienes todas las validaciones de seguridad.

## ⚠️ Importante

**Este modo SOLO funciona en desarrollo (`NODE_ENV=development`)**. En producción, siempre se requiere NGINX con mTLS.

---

## 📋 Setup Rápido para Desarrollo

### 1. Configurar Variables de Entorno

Asegúrate de tener en tu `.env`:

```env
# Base de datos
DATABASE_URL="postgresql://..."

# Clave maestra para cifrado
ADMIN_MASTER_KEY="tu_clave_generada_con_openssl"

# Email del admin para desarrollo (SOLO para desarrollo)
NEXT_PUBLIC_DEV_ADMIN_EMAIL="tu-email@example.com"

# Entorno de desarrollo
NODE_ENV="development"
```

### 2. Ejecutar Setup Inicial

```bash
# 1. Aplicar migraciones
npx prisma migrate dev

# 2. Crear Certificate Authority
npm run admin:setup-ca

# 3. Configurar TOTP para tu email
npm run admin:setup-totp -- tu-email@example.com

# 4. Generar certificado (necesario incluso para desarrollo)
npm run admin:generate-cert -- tu-email@example.com "Dev Laptop" 48
```

> **¿Por qué generar certificado si no uso NGINX?**
>
> El certificado se guarda en la base de datos y el middleware lo valida (expiración, revocación, etc.). En desarrollo, simplemente no se verifica contra el certificado del navegador.

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Tu aplicación estará en `http://localhost:3000`

---

## 🌐 Acceder al Admin Panel

### Opción A: Usando la Variable de Entorno (Recomendado)

Si configuraste `NEXT_PUBLIC_DEV_ADMIN_EMAIL` en tu `.env`, simplemente abre:

```
http://localhost:3000/admin
```

Los hooks de React automáticamente agregarán el header `X-Dev-Admin-Email` a todas las peticiones.

### Opción B: Usando localStorage

Si quieres cambiar el email sin editar `.env`:

1. Abre la consola del navegador (F12)
2. Ejecuta:
```javascript
localStorage.setItem('dev-admin-email', 'tu-email@example.com');
```
3. Recarga la página
4. Ahora todas las peticiones usarán ese email

### Opción C: Testing con cURL

Puedes probar la API directamente:

```bash
curl http://localhost:3000/api/admin-secure/dashboard \
  -H "X-Dev-Admin-Email: tu-email@example.com"
```

---

## 🔍 Cómo Funciona

### Flujo en Desarrollo

1. **Cliente** hace petición a `/api/admin-secure/*`
2. **Middleware** detecta `NODE_ENV=development`
3. **Middleware** lee header `X-Dev-Admin-Email`
4. **Middleware** busca el certificado activo más reciente de ese admin
5. **Middleware** valida:
   - ✅ Certificado existe
   - ✅ No está revocado
   - ✅ No ha expirado
   - ✅ AdminAccess está habilitado
6. Si todo OK, permite acceso y registra en audit log

### Flujo en Producción

1. **Cliente** hace petición HTTPS con certificado mTLS
2. **NGINX** valida certificado contra CA
3. **NGINX** inyecta headers (`X-Client-Cert-Serial`, etc.)
4. **Middleware** lee headers de NGINX
5. **Middleware** valida certificado en BD
6. Si todo OK, permite acceso

---

## 🧪 Testing de Funcionalidades

### Dashboard

```bash
curl http://localhost:3000/api/admin-secure/dashboard \
  -H "X-Dev-Admin-Email: tu-email@example.com"
```

### Listar Usuarios

```bash
curl "http://localhost:3000/api/admin-secure/users?page=1&limit=10" \
  -H "X-Dev-Admin-Email: tu-email@example.com"
```

### Ver Usuario Específico

```bash
curl http://localhost:3000/api/admin-secure/users/USER_ID \
  -H "X-Dev-Admin-Email: tu-email@example.com"
```

### Actualizar Usuario

```bash
curl http://localhost:3000/api/admin-secure/users/USER_ID \
  -X PATCH \
  -H "X-Dev-Admin-Email: tu-email@example.com" \
  -H "Content-Type: application/json" \
  -d '{"verified": true}'
```

### Listar Certificados

```bash
curl http://localhost:3000/api/admin-secure/certificates \
  -H "X-Dev-Admin-Email: tu-email@example.com"
```

---

## 🐛 Troubleshooting

### Error: "No hay certificado activo para este admin"

**Causa**: No tienes un certificado válido en la BD.

**Solución**:
```bash
# Generar certificado
npm run admin:generate-cert -- tu-email@example.com "Dev" 48

# Verificar que existe
npm run admin:list-certs -- tu-email@example.com
```

### Error: "Certificado expirado"

**Causa**: Tu certificado de 48h ya expiró.

**Solución**:
```bash
# Generar nuevo certificado
npm run admin:generate-cert -- tu-email@example.com "Dev" 48
```

### El panel muestra errores

**Verifica**:

1. **Variable de entorno configurada**:
```bash
echo $NEXT_PUBLIC_DEV_ADMIN_EMAIL
# Debe mostrar tu email
```

2. **Email correcto en localStorage**:
```javascript
// En consola del navegador
console.log(localStorage.getItem('dev-admin-email'));
```

3. **Certificado válido**:
```bash
npm run admin:list-certs -- tu-email@example.com
# Debe mostrar al menos un certificado activo
```

4. **Logs del servidor**:
```
# En la terminal donde corre npm run dev
# Deberías ver:
[DEV MODE] Buscando certificado activo para tu-email@example.com
[DEV MODE] Usando certificado: 1234567890ABCDEF...
```

### Headers no se agregan automáticamente

**Si los hooks no agregan el header**, agrega manualmente en cada petición:

```typescript
// En tu código React
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'X-Dev-Admin-Email': 'tu-email@example.com'
    }
  });
  return res.json();
};
```

---

## 🔒 Seguridad en Desarrollo

Aunque el modo desarrollo es más permisivo, todavía mantiene validaciones importantes:

✅ **Validaciones activas**:
- Certificado debe existir en BD
- Certificado no debe estar revocado
- Certificado no debe estar expirado
- AdminAccess debe estar habilitado
- Todos los accesos se registran en audit log

❌ **Validaciones desactivadas**:
- No se valida el certificado del navegador
- No se verifica el fingerprint
- No se requiere NGINX

---

## 🚀 Pasar a Producción

Cuando estés listo para producción:

1. **Configurar NGINX** (ver `docs/ADMIN-SETUP.md`)
2. **Cambiar `NODE_ENV=production`** en `.env`
3. **Eliminar `NEXT_PUBLIC_DEV_ADMIN_EMAIL`** del `.env`
4. **Reiniciar servidor**

El middleware automáticamente cambiará a modo producción y requerirá mTLS.

---

## 📊 Comandos Útiles

```bash
# Listar todos los certificados
npm run admin:list-certs

# Listar certificados de un admin
npm run admin:list-certs -- tu-email@example.com

# Generar nuevo certificado
npm run admin:generate-cert -- <email> <device> 48

# Revocar certificado
npm run admin:revoke-cert -- <serial> "testing"

# Ver audit logs en Prisma Studio
npx prisma studio
# Ir a tabla AuditLog
```

---

## 💡 Tips

### 1. Usar múltiples emails para testing

```bash
# Admin principal
npm run admin:setup-totp -- admin1@example.com
npm run admin:generate-cert -- admin1@example.com "Dev1" 48

# Admin secundario (moderador)
npm run admin:setup-totp -- moderator@example.com
npm run admin:generate-cert -- moderator@example.com "Dev2" 48

# Cambiar entre ellos
localStorage.setItem('dev-admin-email', 'admin1@example.com');
# o
localStorage.setItem('dev-admin-email', 'moderator@example.com');
```

### 2. Testing de revocación

```bash
# 1. Obtener serial del certificado
npm run admin:list-certs -- tu-email@example.com

# 2. Revocar
npm run admin:revoke-cert -- <serial> "testing"

# 3. Intentar acceder (debería fallar con "Certificado revocado")
curl http://localhost:3000/api/admin-secure/dashboard \
  -H "X-Dev-Admin-Email: tu-email@example.com"

# 4. Generar nuevo certificado
npm run admin:generate-cert -- tu-email@example.com "Dev" 48
```

### 3. Ver logs en tiempo real

Abre la terminal donde corre `npm run dev` y verás:

```
[DEV MODE] Buscando certificado activo para admin@example.com
[DEV MODE] Usando certificado: 1234567890ABCDEF...
GET /api/admin-secure/dashboard 200 in 45ms
```

---

## ✅ Checklist de Desarrollo

- [ ] Variables de entorno configuradas
- [ ] Migraciones aplicadas (`npx prisma migrate dev`)
- [ ] CA creada (`npm run admin:setup-ca`)
- [ ] TOTP configurado (`npm run admin:setup-totp`)
- [ ] Certificado generado (`npm run admin:generate-cert`)
- [ ] `NEXT_PUBLIC_DEV_ADMIN_EMAIL` en `.env`
- [ ] `NODE_ENV=development` en `.env`
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Panel admin accesible en `http://localhost:3000/admin`
- [ ] Audit logs registrando acciones

---

## 🎓 Diferencias: Desarrollo vs Producción

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| Puerto | 3000 (HTTP) | 8443 (HTTPS) |
| Certificado en navegador | No requerido | Requerido (.p12) |
| NGINX | No requerido | Requerido |
| mTLS | Simulado | Real |
| Header auth | `X-Dev-Admin-Email` | `X-Client-Cert-*` |
| Fingerprint check | Desactivado | Activo |
| Validación BD | ✅ Activa | ✅ Activa |
| Audit logs | ✅ Activos | ✅ Activos |

---

## 📚 Siguiente Paso

Una vez que todo funcione en desarrollo, sigue la guía de producción:

- **[ADMIN-SETUP.md](./ADMIN-SETUP.md)** - Setup completo para producción
- **[ADMIN-TESTING.md](./ADMIN-TESTING.md)** - Testing end-to-end

---

**✨ Happy Development!**
