# 🎬 Director Dev Console

Herramienta de desarrollo para monitorear y debuggear el Sistema de Director Conversacional desde la consola del navegador (F12).

## 🚀 Inicio Rápido

1. Abre la aplicación en tu navegador
2. Presiona **F12** para abrir las Developer Tools
3. Ve a la pestaña **Console**
4. Escribe `director.help()` para ver todos los comandos disponibles

## 📋 Comandos Disponibles

### `director.status()`
Muestra el estado completo del Director en el grupo actual.

```javascript
director.status()

// Output:
// 🎬 ESTADO DEL DIRECTOR
// ══════════════════════════════════════════════════
// Estado: ✅ ACTIVO
// Versión: 🔥 FULL
// Settings: {}
//
// 📍 Escena Actual:
//   Código: HUM_042
//   Paso: 2/3
//   Roles: { COMICO: "agent_123", RIENDO: "agent_456" }
//
// 📊 Métricas:
//   Escenas ejecutadas: 47
//   Semillas activas: 3
```

### `director.scene()`
Muestra información detallada de la escena actualmente en ejecución.

```javascript
director.scene()

// Output:
// 🎬 ESCENA ACTUAL
// ══════════════════════════════════════════════════
// Código: HUM_042
// Progreso: Paso 2 de 3
// Roles asignados:
//   COMICO: agent_abc123
//   RIENDO: agent_def456
```

### `director.seeds([estado])`
Lista todas las semillas de tensión activas en el grupo.

```javascript
// Ver todas las semillas
director.seeds()

// Filtrar por estado
director.seeds('ACTIVE')      // Solo activas
director.seeds('ESCALATING')  // Solo en escalada
director.seeds('LATENT')      // Solo latentes
director.seeds('RESOLVED')    // Solo resueltas

// Output:
// 🌱 SEMILLAS DE TENSIÓN
// ══════════════════════════════════════════════════
//
// 1. Desacuerdo sobre estrategia
//   ID: seed_abc123
//   Tipo: conflict
//   Estado: ACTIVE
//   Turno actual: 3/20
//   Escalación: 1
//   IAs involucradas: ["agent_1", "agent_2"]
//   Contenido: Hay desacuerdo sobre cómo proceder...
```

### `director.relations([agentId])`
Muestra las relaciones entre IAs del grupo.

```javascript
// Ver todas las relaciones
director.relations()

// Ver relaciones de una IA específica
director.relations('agent_123')

// Output:
// 🤝 RELACIONES IA-IA
// ══════════════════════════════════════════════════
// agent_123 → agent_456
//   Afinidad: 7.5
//   Tipo: friendship
//   Dinámicas: trust, humor_shared
//   Tensión: 0.2
//   Interacciones: 45
```

### `director.history([limite])`
Muestra el historial de escenas ejecutadas.

```javascript
// Últimas 10 escenas (por defecto)
director.history()

// Últimas N escenas
director.history(20)
director.history(50)

// Output:
// 📜 HISTORIAL DE ESCENAS
// ══════════════════════════════════════════════════
//
// 1. HUM_042 - Broma compartida
//    Iniciada: 2024-01-19 10:30:45
//    Completada: 2024-01-19 10:31:12
//    Participantes: agent_1, agent_2
//    Roles: { COMICO: agent_1, RIENDO: agent_2 }
```

### `director.metrics()`
Muestra métricas agregadas del grupo.

```javascript
director.metrics()

// Output:
// 📊 MÉTRICAS DEL GRUPO
// ══════════════════════════════════════════════════
// Escenas ejecutadas: 47
// Semillas activas: 3
//
// 💡 Métricas adicionales disponibles próximamente:
//   - Energía grupal
//   - Nivel de tensión
//   - Densidad de relaciones
//   - Categorías más usadas
```

### `director.catalog([categoria])`
Explora el catálogo de escenas disponibles.

```javascript
// Ver resumen completo
director.catalog()

// Ver escenas de una categoría específica
director.catalog('HUMOR')
director.catalog('TENSION')
director.catalog('ROMANCE')

// Output:
// 📚 CATÁLOGO DE ESCENAS
// ══════════════════════════════════════════════════
// 📊 Total de escenas: 2002
//
// Distribución por categoría:
//   COTIDIANO: 502 escenas (25.1%)
//   HUMOR: 400 escenas (20.0%)
//   DEBATE: 240 escenas (12.0%)
//   TENSION: 200 escenas (10.0%)
//   ...
```

## 🎯 Especificar GroupId Manualmente

Por defecto, los comandos detectan automáticamente el `groupId` de la URL actual. Si estás en otra página o quieres consultar otro grupo, puedes especificarlo:

```javascript
// Todos los comandos aceptan groupId como parámetro
director.status('cmkgvpv1n000mijuahs13velq')
director.scene('cmkgvpv1n000mijuahs13velq')
director.seeds('ACTIVE', 'cmkgvpv1n000mijuahs13velq')
```

## 🔍 Casos de Uso

### Debugging de Escenas

```javascript
// 1. Ver qué escena está activa
director.scene()

// 2. Verificar si hay problemas con roles
director.status()

// 3. Ver historial para entender la secuencia
director.history(5)
```

### Monitoreo de Tensión

```javascript
// 1. Ver semillas activas
director.seeds()

// 2. Filtrar solo las que están escalando
director.seeds('ESCALATING')

// 3. Ver métricas generales
director.metrics()
```

### Análisis de Relaciones

```javascript
// 1. Ver todas las relaciones
director.relations()

// 2. Enfocarse en una IA específica
director.relations('agent_123')

// 3. Verificar si hay tensiones
director.seeds()
```

### Verificación de Catálogo

```javascript
// 1. Ver distribución general
director.catalog()

// 2. Verificar categoría específica
director.catalog('HUMOR')

// 3. Comparar con estado actual
director.status()
```

## 🎨 Características

- ✅ **Auto-detección de GroupId**: Detecta automáticamente el grupo actual desde la URL
- ✅ **Filtros flexibles**: Filtra por estado, categoría, agente, etc.
- ✅ **Salida con colores**: Output legible con colores y emojis
- ✅ **Solo en desarrollo**: No se carga en producción
- ✅ **Sin dependencias**: Usa solo APIs nativas del navegador

## 🔧 Extensión

Para agregar nuevos comandos, edita `/lib/director/dev-console.ts`:

```typescript
async nuevoComando(param?: string) {
  const id = getCurrentGroupId(param);
  console.log('%c🆕 MI NUEVO COMANDO', styles.title);

  const data = await fetchAPI(`/api/groups/${id}/mi-endpoint`);
  // ... tu lógica
}
```

Luego actualiza la interfaz `DirectorGlobal` y el método `help()`.

## 📝 Notas

- Los comandos hacen fetch a los endpoints de la API
- Algunos endpoints aún no están implementados (se muestran advertencias)
- El estado se cachea automáticamente en `localStorage`
- Compatible con todos los navegadores modernos

## 🐛 Troubleshooting

**"No se pudo determinar el groupId"**
- Asegúrate de estar en una página de grupo (`/groups/[id]`)
- O especifica el groupId manualmente: `director.status('groupId')`

**"Endpoint no implementado"**
- Algunos endpoints aún están en desarrollo
- Se muestra un mensaje con la estructura esperada

**"Error de red"**
- Verifica que el servidor esté corriendo
- Revisa la consola para ver el error completo

## 🚀 Ejemplo de Flujo Completo

```javascript
// 1. Ver estado inicial
director.status()

// 2. Enviar un mensaje al grupo (desde la UI)
// ...

// 3. Ver si se activó una escena
director.scene()

// 4. Monitorear progreso
director.status()

// 5. Ver si se crearon semillas
director.seeds()

// 6. Revisar métricas finales
director.metrics()

// 7. Ver historial
director.history()
```

---

**¡Disfruta debuggeando el Director!** 🎬✨
