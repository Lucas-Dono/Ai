# Sistema de Alertas Estilizadas para Mobile

Sistema completo de alertas no intrusivas para React Native con diseño consistente (negro/violeta), animaciones suaves y excelente UX.

## 📦 Archivos del Sistema

```
mobile/src/
├── contexts/
│   └── AlertContext.tsx         # Contexto global y hook useAlert()
├── components/alerts/
│   ├── AlertBanner.tsx          # Componente visual de alerta
│   ├── AlertContainer.tsx       # Contenedor que renderiza alertas
│   ├── AlertDemo.tsx            # Componente de demostración
│   ├── index.ts                 # Exports del módulo
│   ├── README.md                # Este archivo
│   ├── USAGE.md                 # Guía de uso detallada
│   └── MIGRATION_EXAMPLE.md     # Ejemplos de migración
└── App.tsx                      # Integración del sistema
```

## ✅ Características

- ✨ **Diseño Estilizado**: Gradientes negro → violeta con letra blanca
- 📍 **Posicionamiento Inteligente**: Parte inferior, sin interferir con navbar
- 🎭 **Animaciones Suaves**: Spring animations con react-native-reanimated
- 📳 **Haptic Feedback**: Retroalimentación táctil en iOS y Android
- 🎯 **4 Tipos**: Success, Error, Warning, Info (cada uno con su icono y color)
- ⏱️ **Auto-Descarte**: Configurable (default: 3 segundos)
- 👆 **Toque para Cerrar**: Desaparición inmediata al tocar
- 📚 **Apilamiento**: Hasta 3 alertas simultáneas
- 🚀 **Performance**: Animaciones en UI thread (no bloquean JS)

## 🚀 Inicio Rápido

### 1. El sistema ya está integrado en App.tsx

No necesitas configuración adicional. El `AlertProvider` y `AlertContainer` ya están montados.

### 2. Usar en cualquier componente

```typescript
import { useAlert } from '@/contexts/AlertContext';

function MyComponent() {
  const { showAlert } = useAlert();

  return (
    <Button
      onPress={() => showAlert('¡Éxito!', { type: 'success' })}
    >
      Acción
    </Button>
  );
}
```

## 📖 Tipos de Alerta

| Tipo | Color | Icono | Uso |
|------|-------|-------|-----|
| `success` | Negro → Violeta (#7C3AED) | ✓ CheckCircle | Confirmaciones exitosas |
| `error` | Negro → Violeta Intenso (#9333EA) | ✗ XCircle | Errores, fallos |
| `warning` | Negro → Violeta Claro (#A855F7) | ⚠ AlertTriangle | Advertencias |
| `info` | Negro → Violeta Medio (#8B5CF6) | ℹ Info | Información general |

## 🎨 Ejemplos de Uso

### Success
```typescript
showAlert('¡Cambios guardados correctamente!', { type: 'success' });
```

### Error
```typescript
showAlert('No se pudo conectar al servidor', { type: 'error' });
```

### Warning
```typescript
showAlert('Tu sesión está por expirar', { type: 'warning' });
```

### Info
```typescript
showAlert('Tienes 3 mensajes nuevos', { type: 'info' });
```

### Duración Personalizada
```typescript
// 5 segundos
showAlert('Mensaje temporal', { type: 'info', duration: 5000 });

// No desaparece (solo al tocar)
showAlert('Importante', { type: 'warning', duration: 0 });
```

## 🧪 Probar el Sistema

### Opción 1: AlertDemo Component

Para probar todas las funcionalidades, agrega la ruta de demostración:

**1. Crear la pantalla:**

```typescript
// mobile/src/screens/dev/AlertDemoScreen.tsx
import React from 'react';
import { AlertDemo } from '@/components/alerts/AlertDemo';

export function AlertDemoScreen() {
  return <AlertDemo />;
}
```

**2. Agregar ruta al navegador:**

```typescript
// En tu navegador (ejemplo: RootNavigator.tsx)
import { AlertDemoScreen } from '@/screens/dev/AlertDemoScreen';

// Agregar a tus rutas
<Stack.Screen
  name="AlertDemo"
  component={AlertDemoScreen}
  options={{ title: 'Alertas - Demo' }}
/>
```

**3. Navegar a la demo:**

```typescript
navigation.navigate('AlertDemo');
```

### Opción 2: Prueba Rápida en Cualquier Pantalla

```typescript
import { useAlert } from '@/contexts/AlertContext';

function MyScreen() {
  const { showAlert } = useAlert();

  useEffect(() => {
    // Mostrar alerta de prueba al montar
    showAlert('Sistema de alertas funcionando!', { type: 'success' });
  }, []);

  return <View>...</View>;
}
```

## 🔄 Migración desde Alert.alert()

### Antes
```typescript
import { Alert } from 'react-native';

Alert.alert('Error', 'No se pudo rotar la imagen');
```

### Después
```typescript
import { useAlert } from '@/contexts/AlertContext';

const { showAlert } = useAlert();
showAlert('No se pudo rotar la imagen', { type: 'error' });
```

Ver `MIGRATION_EXAMPLE.md` para ejemplos completos.

## 📐 Especificaciones Técnicas

### Posicionamiento
- **Bottom base**: 80px desde la parte inferior (evita navbar)
- **Apilamiento**: 70px de separación entre alertas
- **Máximo simultáneo**: 3 alertas (configurable)

### Animaciones
- **Entrada**: Spring desde abajo (damping: 15, stiffness: 120)
- **Salida**: Timing hacia abajo (250ms, ease-in cubic)
- **Opacidad**: Fade in/out (300ms)

### Duración por Defecto
- **Auto-descarte**: 3000ms (3 segundos)
- **Manual**: duration: 0 (solo se cierra al tocar)

### Haptic Feedback
- **Aparición**: Light impact
- **Toque**: Medium impact
- **Plataforma**: iOS y Android

## ⚙️ Configuración Avanzada

### Cambiar límite de alertas simultáneas

```typescript
// En App.tsx
<AlertProvider maxAlerts={5}>
  <AppContent />
</AlertProvider>
```

### Ajustar posición base

```typescript
// En AlertBanner.tsx, línea ~140
const bottomPosition = 100 + (index * 70); // Cambiar 100 para ajustar altura base
```

## 🐛 Troubleshooting

### Las alertas no aparecen
- ✅ Verifica que `AlertProvider` esté en `App.tsx`
- ✅ Verifica que `AlertContainer` se renderice después de `RootNavigator`
- ✅ Verifica que estés usando `useAlert()` dentro de un componente hijo

### Las alertas se superponen con el navbar
- Ajusta `bottomPosition` en `AlertBanner.tsx`
- Valor actual: `80 + (index * 70)`

### Las animaciones son lentas
- Verifica que `react-native-reanimated` esté instalado
- Ejecuta `npx pod-install` en iOS si es necesario

## 📚 Documentación Adicional

- **USAGE.md**: Guía completa de uso con todos los casos
- **MIGRATION_EXAMPLE.md**: Ejemplos de migración de Alert.alert()
- **AlertDemo.tsx**: Componente interactivo de demostración

## 🎯 Próximos Pasos

1. **Migrar componentes existentes**: Ver lista en `MIGRATION_EXAMPLE.md`
2. **Eliminar Alert.alert()**: Reemplazar con `showAlert()`
3. **Probar en dispositivo**: Verificar animaciones y haptics
4. **Ajustar colores**: Si necesitas variaciones de violeta

## 📝 Notas

- ⚠️ **No usar para confirmaciones**: El sistema es para notificaciones, no diálogos Sí/No
- ⚠️ **Textos cortos**: Máximo ~100 caracteres recomendados
- ⚠️ **AlertDemo.tsx**: Eliminar antes de producción (solo para desarrollo)

## 🤝 Contribuir

Si encuentras bugs o tienes sugerencias:
1. Documenta el caso de uso
2. Propón la solución
3. Actualiza la documentación si es necesario

---

**Creado**: 2026-02-06
**Versión**: 1.0.0
**Mantenedor**: Equipo Blaniel
