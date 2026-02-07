# Corrección de Vulnerabilidad CSRF en Profile Endpoint

## Vulnerabilidad Detectada

**Endpoint afectado:** `PATCH /api/user/profile`
**Tipo:** CSRF (Cross-Site Request Forgery) - Parcial
**Severidad:** Media

### Problema
El endpoint PATCH profile no validaba el Origin header, permitiendo potencialmente que sitios maliciosos realicen requests en nombre de usuarios autenticados.

## Solución Implementada

### 1. Nueva Utilidad de Protección CSRF

**Archivo:** `lib/security/csrf-protection.ts`

Funciones creadas:
- `validateCSRFOrigin(req)` - Valida que el Origin sea permitido
- `checkCSRF(req)` - Helper que retorna respuesta de error si falla

**Características:**
- ✅ Valida Origin header en requests POST, PUT, PATCH, DELETE
- ✅ Usa Referer como fallback si Origin no está presente
- ✅ Permite configuración vía variables de entorno
- ✅ Logging de intentos sospechosos
- ✅ No afecta requests GET (solo lectura)

**Origins permitidos:**
- `process.env.NEXTAUTH_URL`
- `process.env.NEXT_PUBLIC_APP_URL`
- `http://localhost:3000` (desarrollo)
- `http://127.0.0.1:3000` (desarrollo)

### 2. Aplicación al Endpoint Profile

**Archivo:** `app/api/user/profile/route.ts`

```typescript
export async function PATCH(req: NextRequest) {
  // Validación CSRF agregada
  const csrfError = checkCSRF(req);
  if (csrfError) return csrfError;

  // ... resto del código
}
```

La validación ocurre ANTES de cualquier lógica de negocio, retornando 403 si el origin es inválido.

## Testing

### Tests Automatizados
**Archivo:** `lib/security/__tests__/csrf-protection.test.ts`

12 tests implementados cubriendo:
- ✅ Métodos GET (sin validación)
- ✅ PATCH/POST/PUT/DELETE con origin válido
- ✅ PATCH/POST con origin inválido
- ✅ Requests sin origin header
- ✅ Fallback a Referer header
- ✅ Respuesta de error 403

**Resultado:** 12/12 tests pasados ✅

### Tests Manuales
**Script:** `scripts/test-csrf-profile.ts`

Escenarios verificados:
1. ✅ PATCH con origin válido → Permitido
2. ✅ PATCH sin origin → Bloqueado
3. ✅ PATCH con origin malicioso → Bloqueado
4. ✅ GET sin restricciones → Permitido
5. ✅ PATCH con referer válido → Permitido

## Comportamiento de Seguridad

### Request Bloqueado (403)
```json
{
  "error": "Forbidden",
  "message": "Invalid origin - CSRF protection"
}
```

### Logging de Seguridad
Todos los intentos bloqueados se registran con:
- Método HTTP
- Origin recibido
- Origins permitidos
- URL del request
- User-Agent (si disponible)

## Referencias

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: Origin Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin)

## Próximos Pasos (Opcional)

Si se desea protección adicional:

1. **CSRF Tokens:** Implementar tokens dobles para SPA
2. **SameSite Cookies:** Asegurar que las cookies de sesión tengan `SameSite=Lax` o `Strict`
3. **Rate Limiting:** Limitar intentos fallidos por IP
4. **Monitoreo:** Alertas cuando se detectan múltiples requests CSRF

---

**Fecha de implementación:** 2026-01-08
**Estado:** ✅ Completado y Testeado
