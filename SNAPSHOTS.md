# 📸 Sistema de Snapshots Automáticos

Sistema de respaldo automático que crea copias de seguridad del proyecto cada 30 minutos si detecta cambios, independiente de git.

## 🚀 Inicio Rápido

### 1. Iniciar el sistema de snapshots

Abre una terminal separada y ejecuta:

```bash
npm run snapshot:watch
```

Esto iniciará un servicio que:
- Vigila cambios en tiempo real
- Crea snapshots cada 30 minutos si hay cambios
- Mantiene los últimos 20 snapshots automáticamente
- Se ejecuta continuamente hasta Ctrl+C

**💡 Recomendación:** Déjalo corriendo en una terminal separada mientras trabajas.

### 2. Listar snapshots disponibles

```bash
npm run snapshot:list
```

Muestra una tabla con todos los snapshots:
```
┌────┬─────────────────────────────────────────────────┬────────────┬──────────────────────┐
│ #  │ Nombre                                          │ Tamaño     │ Creado               │
├────┼─────────────────────────────────────────────────┼────────────┼──────────────────────┤
│  1 │ snapshot-2025-01-30T14-30-45-123Z.tar.gz       │   125.3 MB │ hace 5 minutos       │
│  2 │ snapshot-2025-01-30T14-00-15-789Z.tar.gz       │   124.8 MB │ hace 35 minutos      │
└────┴─────────────────────────────────────────────────┴────────────┴──────────────────────┘
```

### 3. Restaurar un snapshot

```bash
# Por número (recomendado)
npm run snapshot:restore 1

# O por nombre completo
npm run snapshot:restore snapshot-2025-01-30T14-30-45-123Z.tar.gz
```

⚠️ **Advertencia:** Esto sobrescribirá los archivos actuales. Se te pedirá confirmación.

Después de restaurar:
```bash
npm install          # Si package.json cambió
npm run db:push      # Si schema de Prisma cambió
```

## 📂 Estructura

```
.snapshots/                           # Directorio de snapshots (gitignored)
├── snapshot-2025-01-30T14-30-45-123Z.tar.gz
├── snapshot-2025-01-30T14-00-15-789Z.tar.gz
└── ...

scripts/snapshot/
├── config.ts                         # Configuración
├── snapshot-service.ts               # Servicio principal
├── list-snapshots.ts                 # Listar snapshots
├── restore-snapshot.ts               # Restaurar snapshot
└── README.md                         # Documentación completa

.snapshot-ignore                      # Archivos/directorios a excluir
```

## ⚙️ Configuración

### Modificar intervalo o límites

Edita `scripts/snapshot/config.ts`:

```typescript
export const DEFAULT_CONFIG: SnapshotConfig = {
  interval: 30 * 60 * 1000,    // 30 minutos (puedes cambiar a 15, 60, etc.)
  maxSnapshots: 20,             // Mantener últimos 20 snapshots
  compressionLevel: 6,          // 0-9 (mayor = más pequeño pero más lento)
  debounceTime: 5000,          // Esperar 5s después del último cambio
};
```

### Excluir archivos adicionales

Agrega patrones a `.snapshot-ignore`:

```
# Tus exclusiones personales
data/
experiments/
*.local.json
```

## 🎯 Casos de Uso

### Trabajo diario

```bash
# Terminal 1: Desarrollo
npm run dev

# Terminal 2: Snapshots automáticos
npm run snapshot:watch
```

### Antes de cambios experimentales

```bash
# Ver último snapshot
npm run snapshot:list

# Hacer cambios experimentales...

# Si algo sale mal
npm run snapshot:restore 1
```

### Recuperar trabajo perdido

```bash
# Listar snapshots
npm run snapshot:list

# Restaurar al punto anterior
npm run snapshot:restore 2

# Verificar y reinstalar
npm install
```

## 📊 Información Técnica

### ¿Qué se respalda?

✅ **SÍ se respalda:**
- Código fuente (app, components, lib, etc.)
- Configuración (package.json, tsconfig.json, etc.)
- Scripts personalizados
- Schema de Prisma
- Assets públicos

❌ **NO se respalda:**
- `node_modules/` - Dependencias (reinstalar con npm install)
- `.next/`, `build/` - Build outputs (regenerar)
- `.git/` - Historial git (separado)
- `.env*` - Variables de entorno (seguridad)
- `*.db`, `*.log` - Bases de datos y logs locales
- Build artifacts del mobile

### Espacio requerido

- **Snapshot típico**: ~120-150 MB comprimido
- **20 snapshots**: ~2.5-3 GB total
- Se limpian automáticamente los más antiguos

### Seguridad

- ✅ No respalda archivos sensibles (.env)
- ✅ Verifica espacio en disco antes de crear
- ✅ Requiere confirmación para restaurar
- ✅ Crea snapshot final al detener (Ctrl+C)

## 🔄 Snapshots vs Git

| Característica | Snapshots | Git |
|----------------|-----------|-----|
| **Propósito** | Respaldo automático | Control de versiones |
| **Frecuencia** | Cada 30 min | Cuando haces commit |
| **Automático** | ✅ Sí | ❌ No (manual) |
| **Colaboración** | ❌ Solo local | ✅ Compartido |
| **Historial** | Últimos 20 | Completo |
| **Velocidad restauración** | ⚡ Muy rápida | Rápida |

**Recomendación:** Usa ambos sistemas:
- **Snapshots**: Respaldo continuo durante desarrollo
- **Git**: Control de versiones para features completas

## 🛠️ Solución de Problemas

### "No hay snapshots disponibles"

Ejecuta el sistema por primera vez:
```bash
npm run snapshot:watch
```

Espera al menos 30 minutos con cambios en el código.

### Snapshots muy grandes

Verifica que `.snapshot-ignore` esté bien configurado:
```bash
cat .snapshot-ignore
```

No deberían incluirse `node_modules/`, `.next/`, etc.

### Error al restaurar

1. Verifica permisos de escritura
2. Asegúrate de estar en la raíz del proyecto
3. Prueba con otro snapshot

### Espacio insuficiente

```bash
# Ver espacio usado por snapshots
du -sh .snapshots/

# Reducir número de snapshots en config.ts
maxSnapshots: 10  # En lugar de 20
```

## 📚 Documentación Completa

Para información más detallada, consulta:
- `scripts/snapshot/README.md` - Documentación técnica completa
- `scripts/snapshot/config.ts` - Opciones de configuración
- `.snapshot-ignore` - Patrones de exclusión

## 💡 Tips

1. **Ejecuta siempre en terminal separada** para ver el log en tiempo real
2. **No te olvides de hacer commits en git** para cambios importantes
3. **Verifica snapshots regularmente** con `npm run snapshot:list`
4. **Restaura con cuidado** - siempre confirma antes de sobrescribir
5. **Ajusta el intervalo** según tus necesidades (15 min para proyectos críticos)

---

**Sistema creado:** 2025-01-30
**Última actualización:** 2025-01-30
