# Sistema de Snapshots Automáticos

Sistema de respaldo automático que crea copias de seguridad del proyecto cada 30 minutos si detecta cambios. Es independiente de git y permite volver a cualquier punto en el tiempo sin necesidad de hacer commits.

## 🎯 Características

- ✅ **Snapshots automáticos** cada 30 minutos si hay cambios
- ✅ **Detección inteligente** de cambios usando file watching
- ✅ **Compresión eficiente** con tar.gz (nivel 6 por defecto)
- ✅ **Exclusión automática** de node_modules, .next, build artifacts, etc.
- ✅ **Límite de almacenamiento** (mantiene últimos 20 snapshots por defecto)
- ✅ **Restauración fácil** con confirmación de seguridad
- ✅ **Gestión de espacio** con limpieza automática de snapshots antiguos

## 📦 Instalación

Las dependencias ya están instaladas:
- `chokidar` - File watching
- `archiver` - Compresión de archivos

## 🚀 Uso

### Iniciar el sistema de snapshots

```bash
npm run snapshot:watch
```

Esto iniciará el servicio que:
1. Vigila cambios en archivos del proyecto
2. Crea un snapshot cada 30 minutos si hay cambios
3. Mantiene solo los últimos 20 snapshots
4. Se ejecuta continuamente hasta que lo detengas (Ctrl+C)

**Recomendación:** Ejecuta este comando en una terminal separada mientras trabajas.

### Listar snapshots disponibles

```bash
npm run snapshot:list
```

Muestra una tabla con todos los snapshots disponibles:
- Número (para restauración rápida)
- Nombre del archivo
- Tamaño
- Fecha de creación

Ejemplo de salida:
```
📦 Snapshots Disponibles

Directorio: /proyecto/.snapshots

┌────┬─────────────────────────────────────────────────┬────────────┬──────────────────────┐
│ #  │ Nombre                                          │ Tamaño     │ Creado               │
├────┼─────────────────────────────────────────────────┼────────────┼──────────────────────┤
│  1 │ snapshot-2025-01-30T14-30-45-123Z.tar.gz       │   125.3 MB │ hace 5 minutos       │
│  2 │ snapshot-2025-01-30T14-00-15-789Z.tar.gz       │   124.8 MB │ hace 35 minutos      │
│  3 │ snapshot-2025-01-30T13-30-22-456Z.tar.gz       │   124.1 MB │ hace 1 hora          │
└────┴─────────────────────────────────────────────────┴────────────┴──────────────────────┘

Total: 3 snapshots
Tamaño total: 374.2 MB
```

### Restaurar un snapshot

```bash
# Por número (más fácil)
npm run snapshot:restore 1

# Por nombre completo
npm run snapshot:restore snapshot-2025-01-30T14-30-45-123Z.tar.gz
```

**⚠️ IMPORTANTE:**
- La restauración sobrescribirá los archivos actuales
- Se te pedirá confirmación antes de continuar
- Se recomienda hacer commit de cambios importantes antes de restaurar

Después de restaurar:
1. Verifica que todo esté correcto
2. Ejecuta `npm install` si el package.json cambió
3. Ejecuta `npm run db:push` si el schema de Prisma cambió

## ⚙️ Configuración

### Archivo `.snapshot-ignore`

Define qué archivos/directorios excluir de los snapshots. Por defecto excluye:

- `node_modules/` - Dependencias
- `.next/`, `build/`, `dist/` - Build outputs
- `.git/` - Repositorio git
- `*.db`, `*.sqlite` - Bases de datos locales
- `*.log` - Logs
- `.env*` - Variables de entorno
- Y mucho más...

Puedes agregar más patrones al archivo `.snapshot-ignore` en la raíz del proyecto.

### Configuración avanzada

Edita `scripts/snapshot/config.ts`:

```typescript
export const DEFAULT_CONFIG: SnapshotConfig = {
  snapshotDir: '.snapshots',        // Directorio de snapshots
  interval: 30 * 60 * 1000,         // Intervalo (30 min)
  maxSnapshots: 20,                 // Máximo de snapshots
  compressionLevel: 6,              // Compresión (0-9)
  debounceTime: 5000,               // Espera tras cambios (5s)
};
```

## 📊 Monitoreo

El servicio muestra información en tiempo real:

```
🚀 Iniciando servicio de snapshots automáticos...
📂 Directorio: /proyecto/.snapshots
⏱️  Intervalo: 30 minutos
📦 Máximo de snapshots: 20
🚫 Patrones de exclusión: 45

👀 Vigilando cambios en el proyecto...

📝 Archivo modificado: lib/services/message.service.ts
📝 Archivo añadido: components/NewFeature.tsx
✅ Cambios detectados y estabilizados

📦 Creando snapshot...
   Nombre: snapshot-2025-01-30T14-30-45-123Z.tar.gz
✅ Snapshot creado exitosamente
   Tamaño: 125.3 MB
   Archivos: 1,247
   Duración: 8.5s
```

## 🛡️ Seguridad

- **No respalda `.env`**: Las variables de entorno nunca se incluyen
- **Verificación de espacio**: No crea snapshots si hay < 500MB libres
- **Confirmación en restauración**: Requiere confirmación explícita
- **Snapshot final**: Crea un snapshot al detener el servicio (Ctrl+C)

## 💡 Casos de Uso

### Durante desarrollo activo
```bash
# Terminal 1: Servidor de desarrollo
npm run dev

# Terminal 2: Sistema de snapshots
npm run snapshot:watch
```

### Antes de cambios arriesgados
```bash
# Ver último snapshot
npm run snapshot:list

# Hacer cambios arriesgados...

# Si algo sale mal, restaurar
npm run snapshot:restore 1
```

### Recuperación de emergencia
```bash
# Listar snapshots
npm run snapshot:list

# Restaurar al punto anterior conocido como bueno
npm run snapshot:restore 2

# Verificar y reinstalar dependencias
npm install
npm run db:push
```

## 🔧 Solución de Problemas

### "No hay snapshots disponibles"
- El directorio `.snapshots/` aún no existe
- Ejecuta `npm run snapshot:watch` y espera al menos 30 minutos con cambios

### "Espacio insuficiente en disco"
- Limpia archivos innecesarios
- Reduce `maxSnapshots` en la configuración
- Los snapshots viejos se eliminan automáticamente

### Snapshots muy grandes
- Verifica que `.snapshot-ignore` esté configurado correctamente
- No deberían incluirse `node_modules/`, `.next/`, etc.
- Si es necesario, aumenta `compressionLevel` (pero será más lento)

### Restauración no funciona
- Verifica que tienes permisos de escritura
- Asegúrate de estar en la raíz del proyecto
- El snapshot podría estar corrupto (usa otro)

## 📈 Espacio en Disco

Estimaciones de espacio requerido:

- **Proyecto típico**: ~120-150 MB por snapshot comprimido
- **20 snapshots**: ~2.5-3 GB
- **Con build artifacts incluidos**: ~300-500 MB por snapshot

El sistema elimina automáticamente snapshots viejos para mantener el límite.

## 🤝 Integración con Git

El sistema de snapshots es **complementario** a git, no un reemplazo:

- **Git**: Para cambios significativos, features completas, colaboración
- **Snapshots**: Para respaldo automático continuo, recuperación rápida

Ambos sistemas pueden coexistir sin problemas. Los snapshots están en `.gitignore`.

## 📝 Notas

- Los snapshots son **locales** y no se sincronizan con git
- Usa snapshots para recuperación rápida durante desarrollo
- Usa git para control de versiones y colaboración
- El sistema respeta los archivos existentes al restaurar
- Puedes pausar y reanudar el servicio cuando quieras

---

**¿Preguntas o problemas?** Revisa la configuración en `scripts/snapshot/config.ts` o los logs del servicio.
