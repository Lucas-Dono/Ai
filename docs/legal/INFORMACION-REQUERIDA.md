# Información Legal Requerida para Completar Políticas

## 🔴 INFORMACIÓN CRÍTICA PENDIENTE

Para completar las políticas legales de Blaniel, necesitas proporcionar la siguiente información:

### 1. Dirección Legal de CircuitPrompt (CRÍTICO)
**Requerido para**: Política de Privacidad, Términos de Servicio
**Cumplimiento**: GDPR Art. 13, Ley 25.326 (Argentina)
**Formato requerido**: Dirección completa incluyendo:
- Calle y número
- Código postal
- Ciudad
- Provincia/Estado
- País

**Ejemplo**:
```
Av. Corrientes 1234, Piso 5°, Oficina 10
C1043AAZ, Ciudad Autónoma de Buenos Aires
Argentina
```

**¿Dónde completar?**
- `/docs/legal-content-draft/privacy-part1.txt` - Línea 10
- `/docs/legal-content-draft/privacy-part2.txt` - Línea 55
- Placeholder actual: `[A completar con dirección legal registrada en Argentina]`

**Notas**:
- Puede ser domicilio fiscal registrado en AFIP
- Si eres trabajador remoto sin oficina, usa tu domicilio fiscal
- Alternativa: Casilla postal registrada

---

### 2. CUIT de CircuitPrompt (CRÍTICO)
**Requerido para**: Política de Privacidad, Registro ante AAIP
**Cumplimiento**: Ley 25.326 (Argentina)
**Formato requerido**: XX-XXXXXXXX-X

**Ejemplo**:
```
20-12345678-9
```

**¿Dónde completar?**
- `/docs/legal-content-draft/privacy-part2.txt` - Línea 55
- Placeholder actual: `[A completar]`

**Notas**:
- Debe ser el CUIT registrado en AFIP
- Requerido para registro ante AAIP

---

## 🟡 ACCIONES RECOMENDADAS (NO BLOQUEANTES)

### 3. Registro de Base de Datos ante AAIP (TÉCNICAMENTE OBLIGATORIO, ENFORCEMENT BAJO)

**¿Qué es?**
La Agencia de Acceso a la Información Pública (AAIP) de Argentina requiere que todas las bases de datos con información personal sean registradas bajo Ley 25.326 Art. 21.

**Realidad del cumplimiento:**
- En la práctica, el enforcement es históricamente limitado
- Solo 1,349 empresas registradas en 2022 (muy bajo para todo el país)
- AAIP funciona más como guía educativa que como aplicador de sanciones
- La mayoría de startups argentinas NO están registradas

**¿Cuándo hacerlo?**
- ✅ RECOMENDADO antes de captar inversión (due diligence)
- ✅ RECOMENDADO si planeas crecer significativamente
- 🟡 OPCIONAL para lanzamiento inicial/MVP

**Proceso**:
1. Accede al sitio web de AAIP: https://www.argentina.gob.ar/aaip/datospersonales/registro
2. Completa el formulario de registro de base de datos
3. Proporciona:
   - Nombre de la base de datos: "Blaniel - Usuarios y Conversaciones"
   - Finalidad: "Plataforma de creación de agentes de IA emocional"
   - Datos personales almacenados: Ver sección "Información que Recopilamos" en Política de Privacidad
   - Medidas de seguridad: Ver sección "Seguridad de la Información" en Política de Privacidad
   - CUIT de CircuitPrompt
   - Dirección legal

**Costo**: Gratuito
**Renovación**: Anual
**Plazo de respuesta**: 30-45 días hábiles

**Documentación útil**:
- Guía de registro: https://www.argentina.gob.ar/aaip/datospersonales
- Formulario online: https://www.argentina.gob.ar/aaip/datospersonales/registro
- Email de contacto: datospersonales@aaip.gob.ar

**Riesgo real de NO registrar**:
- 🟢 **Bajo** en etapa startup temprana (la mayoría no lo hace)
- 🟡 **Medio** si creces significativamente o tienes denuncia
- 🔴 **Alto** solo en caso de breach de datos o audit específico
- Multas teóricas: ARS 1,000 a 100,000 (raramente aplicadas)
- En 2022: Solo 52 sanciones en todo el país

**Beneficios de SÍ registrarse**:
- ✅ Cumplimiento legal completo
- ✅ Mejor posición en due diligence para inversión
- ✅ Protección ante denuncias o reclamos de usuarios
- ✅ Acceso a guías y recursos de AAIP

---

## 📋 CHECKLIST DE COMPLETADO

### Antes de integrar contenido de Privacidad:

- [ ] **Dirección legal obtenida** y completada en:
  - [ ] `/docs/legal-content-draft/privacy-part1.txt` (línea 10)
  - [ ] `/docs/legal-content-draft/privacy-part2.txt` (línea 55)

- [ ] **CUIT obtenido** y completado en:
  - [ ] `/docs/legal-content-draft/privacy-part2.txt` (línea 55)

### Recomendado antes de escalar (NO bloqueante):

- [ ] **Registro ante AAIP** (opcional para MVP/lanzamiento inicial)
  - [ ] Formulario completado y enviado
  - [ ] Comprobante de registro recibido
  - [ ] Número de registro asignado documentado
  - Priorizar si: vas a captar inversión, clientes B2B, o escalar significativamente

- [ ] **Verificación de información**
  - [ ] Dirección legal es la misma registrada en AFIP
  - [ ] CUIT coincide con documentación oficial
  - [ ] Todos los emails de contacto están operativos (privacy@, legal@, dpo@, etc.)

---

## 🔧 CÓMO COMPLETAR LA INFORMACIÓN

### Paso 1: Buscar y reemplazar en borradores

**Para dirección legal**:
```bash
# Buscar en privacy-part1.txt
sed -i 's/\[A completar con dirección legal registrada en Argentina\]/TU_DIRECCION_AQUI/g' docs/legal-content-draft/privacy-part1.txt

# Buscar en privacy-part2.txt
sed -i 's/\[A completar con dirección legal registrada en Argentina\]/TU_DIRECCION_AQUI/g' docs/legal-content-draft/privacy-part2.txt
```

**Para CUIT**:
```bash
sed -i 's/CUIT\/CUIT: \[A completar\]/CUIT: TU_CUIT_AQUI/g' docs/legal-content-draft/privacy-part2.txt
```

### Paso 2: Verificar cambios

Buscar que no queden placeholders:
```bash
grep -n "\[A completar" docs/legal-content-draft/*.txt
```

Debería retornar vacío si todo fue completado.

---

## 📞 CONTACTOS ÚTILES

### Registro AAIP:
- **Web**: https://www.argentina.gob.ar/aaip
- **Email**: datospersonales@aaip.gob.ar
- **Teléfono**: (011) 2821-0047
- **Dirección presencial**: Av. Pte. Gral. Julio A. Roca 710, Piso 3°, CABA

### Consulta Legal (si necesitas asesoría):
- **Estudio especializado en Privacy/GDPR en Argentina**:
  - Beccar Varela: https://www.beccarvarela.com/
  - Marval O'Farrell Mairal: https://www.marval.com/

- **Freelance**:
  - Buscar "abogado GDPR Argentina" en Fiverr o Upwork

---

## ✅ ESTADO ACTUAL

**Última actualización**: 15 de Enero, 2026

- ✅ Afirmación sobre bcrypt corregida (ahora scrypt)
- ✅ Evaluación de AAIP corregida (no crítico, enforcement bajo)
- ⏳ Dirección legal: PENDIENTE (solo para políticas completas)
- ⏳ CUIT: PENDIENTE (solo para políticas completas)
- 🟡 Registro AAIP: Opcional para lanzamiento inicial

**Próximos pasos**:
- Puedes continuar con Fase 2 (Integración de Privacidad) usando placeholders temporales
- Completar dirección/CUIT cuando esté disponible
- Considerar registro AAIP antes de captar inversión o escalar
