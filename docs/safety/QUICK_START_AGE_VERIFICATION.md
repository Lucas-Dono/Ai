# Age Verification - Quick Start Guide

## Para Testing Inmediato

### 1. Iniciar el servidor
```bash
npm run dev
```

### 2. Crear cuenta de prueba
Ve a: `http://localhost:3000/registro`

Crea una cuenta nueva (o usa una existente sin verificación de edad).

### 3. Ir al dashboard
Ve a: `http://localhost:3000/dashboard`

Deberías ver el **AgeGate** (pantalla de verificación de edad).

### 4. Probar casos de prueba

#### Caso 1: Menor de 13 (BLOQUEADO)
```
Día: 15
Mes: 03
Año: 2015

Resultado esperado:
❌ Error: "Debes tener al menos 13 años..."
❌ No permite continuar
```

#### Caso 2: Menor 13-17 (PERMITIDO SIN NSFW)
```
Día: 15
Mes: 03
Año: 2008

Resultado esperado:
✅ Permite acceso
✅ Redirige al dashboard
```

#### Caso 3: Adulto 18+ (PERMITIDO COMPLETO)
```
Día: 15
Mes: 03
Año: 1995

Resultado esperado:
✅ Permite acceso
✅ Redirige al dashboard
```

#### Caso 4: Fecha inválida
```
Día: 31
Mes: 02
Año: 2000

Resultado esperado:
❌ Error: "La fecha ingresada no es válida"
```

### 5. Verificar en base de datos

Después de verificar edad exitosamente:

```bash
npx tsx scripts/test-age-verification.ts --db tu-email@example.com
```

Esto mostrará:
- ✅ Birth Date
- ✅ Age Verified: true
- ✅ Is Adult: true/false
- ✅ Verified At: timestamp

### 6. Verificar persistencia

1. Completa la verificación de edad
2. Refresh la página (`Ctrl+R`)
3. Navega a `/dashboard` de nuevo

**Resultado esperado**:
- ✅ AgeGate NO debe aparecer
- ✅ Dashboard carga directamente

---

## Testing Automatizado

Ejecutar tests de lógica:

```bash
npx tsx scripts/test-age-verification.ts
```

Resultado esperado:
```
📊 TEST RESULTS:
   Total: 7
   ✅ Passed: 7
   ❌ Failed: 0
   Success Rate: 100.0%

🎉 All tests passed!
```

---

## Screenshots a Tomar

1. **AgeGate inicial** (pantalla completa)
2. **Error de menor de 13** (mensaje de bloqueo)
3. **Error de fecha inválida** (31 de febrero)
4. **Campos vacíos** (botón deshabilitado)
5. **Verificación exitosa** (dashboard aparece)
6. **Database record** (salida del script de verificación)

---

## Troubleshooting

### AgeGate no aparece
```bash
# Verificar en DB que ageVerified = false
npx prisma studio

# O resetear manualmente:
UPDATE "User" SET "ageVerified" = false WHERE email = 'tu@email.com';
```

### Error "No autorizado"
- Verifica que estás logueado
- Revisa la sesión en DevTools > Application > Cookies

### Error de database
```bash
# Regenerar cliente de Prisma
npx prisma generate

# Verificar conexión a DB
npx prisma db pull
```

---

## Archivos Importantes

- **UI**: `/components/onboarding/AgeGate.tsx`
- **Wrapper**: `/components/onboarding/AgeGateWrapper.tsx`
- **API**: `/app/api/user/age-verification/route.ts`
- **Schema**: `/prisma/schema.prisma` (líneas 20-23)
- **Tests**: `/scripts/test-age-verification.ts`
- **Docs**: `/docs/safety/AGE_VERIFICATION_SYSTEM.md`

---

## Comandos Útiles

```bash
# Ver logs de la aplicación
npm run dev

# Verificar build
npm run build

# Tests automatizados
npx tsx scripts/test-age-verification.ts

# Verificar usuario específico
npx tsx scripts/test-age-verification.ts --db email@example.com

# Abrir Prisma Studio
npx prisma studio

# Ver schema de DB
npx prisma db pull
```

---

**Testing Time**: ~10 minutos
**Status**: Ready for testing

Cualquier problema, revisar:
1. Console del navegador (F12)
2. Logs del servidor (terminal con `npm run dev`)
3. Database con `npx prisma studio`
