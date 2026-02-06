# Sistema de Alertas Estilizadas - Guía de Uso

Sistema de alertas no intrusivas que aparecen en la parte inferior de la pantalla con animaciones suaves y diseño consistente con la aplicación (negro/violeta).

## Características

- ✅ Alertas pequeñas en la parte inferior de la pantalla
- ✅ No interfieren con el navbar
- ✅ Colores negro y violeta (gradiente)
- ✅ Texto en blanco
- ✅ Desaparición al tocar
- ✅ Auto-desaparición configurable
- ✅ Haptic feedback integrado
- ✅ Animaciones suaves
- ✅ Soporte para múltiples alertas apiladas

## Instalación

El sistema ya está integrado en `App.tsx`. Solo necesitas usar el hook `useAlert()`.

## Uso Básico

```typescript
import { useAlert } from '@/contexts/AlertContext';

function MyComponent() {
  const { showAlert } = useAlert();

  const handleSuccess = () => {
    showAlert('¡Operación exitosa!', { type: 'success' });
  };

  const handleError = () => {
    showAlert('Ocurrió un error', { type: 'error' });
  };

  return (
    <Button onPress={handleSuccess}>Acción</Button>
  );
}
```

## Tipos de Alerta

### 1. Success (Éxito)
```typescript
showAlert('¡Cambios guardados correctamente!', { type: 'success' });
```
- **Color**: Negro → Violeta (#7C3AED)
- **Icono**: CheckCircle ✓
- **Uso**: Confirmaciones de acciones exitosas

### 2. Error
```typescript
showAlert('No se pudo conectar al servidor', { type: 'error' });
```
- **Color**: Negro → Violeta intenso (#9333EA)
- **Icono**: XCircle ✗
- **Uso**: Errores, fallos de validación

### 3. Warning (Advertencia)
```typescript
showAlert('Tu sesión está por expirar', { type: 'warning' });
```
- **Color**: Negro → Violeta claro (#A855F7)
- **Icono**: AlertTriangle ⚠
- **Uso**: Advertencias, situaciones que requieren atención

### 4. Info (Información)
```typescript
showAlert('Tienes 3 mensajes nuevos', { type: 'info' });
```
- **Color**: Negro → Violeta medio (#8B5CF6)
- **Icono**: Info ℹ
- **Uso**: Información general, notificaciones

## Opciones Avanzadas

### Duración Personalizada
```typescript
// Alerta de 5 segundos
showAlert('Mensaje temporal', {
  type: 'info',
  duration: 5000
});

// Alerta que no desaparece automáticamente (solo al tocar)
showAlert('Importante: lee esto', {
  type: 'warning',
  duration: 0
});
```

### Obtener ID de Alerta
```typescript
const alertId = showAlert('Procesando...', { type: 'info', duration: 0 });

// Descartar manualmente después
setTimeout(() => {
  dismissAlert(alertId);
}, 3000);
```

### Descartar Todas las Alertas
```typescript
const { dismissAll } = useAlert();

dismissAll(); // Cierra todas las alertas activas
```

## Reemplazo de Alert.alert()

### ❌ Antes (Alert nativo)
```typescript
import { Alert } from 'react-native';

Alert.alert('Error', 'No se pudo rotar la imagen');
```

### ✅ Ahora (Sistema estilizado)
```typescript
import { useAlert } from '@/contexts/AlertContext';

const { showAlert } = useAlert();
showAlert('No se pudo rotar la imagen', { type: 'error' });
```

## Ejemplos por Contexto

### Login/Registro
```typescript
// Error de validación
showAlert('Por favor completa todos los campos', { type: 'warning' });

// Error de credenciales
showAlert('Email o contraseña incorrectos', { type: 'error' });

// Registro exitoso
showAlert('¡Cuenta creada exitosamente!', { type: 'success' });
```

### Chat
```typescript
// Mensaje enviado
showAlert('Mensaje enviado', { type: 'success', duration: 2000 });

// Error de conexión
showAlert('No se pudo enviar el mensaje', { type: 'error' });

// Límite alcanzado
showAlert('Has alcanzado el límite de mensajes diarios', {
  type: 'warning',
  duration: 5000
});
```

### Configuración
```typescript
// Cambios guardados
showAlert('Configuración actualizada', { type: 'success' });

// Cambio requerido
showAlert('Debes completar tu perfil', { type: 'info' });
```

## Detalles Técnicos

### Posicionamiento
- **Bottom**: 80px desde el navbar
- **Apilamiento**: Múltiples alertas se apilan verticalmente (70px entre cada una)
- **Máximo**: 3 alertas simultáneas (configurable en `AlertProvider`)

### Animaciones
- **Entrada**: Spring desde abajo (damping: 15, stiffness: 120)
- **Salida**: Timing hacia abajo (250ms, ease-in cubic)
- **Opacidad**: Fade in/out (300ms)

### Haptic Feedback
- **Aparición**: Light impact
- **Toque**: Medium impact
- **Plataforma**: iOS y Android

### Performance
- Componentes altamente optimizados con `react-native-reanimated`
- Animaciones en el thread de UI (no bloquean JavaScript)
- Auto-limpieza de alertas antiguas

## Configuración Global

Si necesitas ajustar el límite de alertas simultáneas:

```typescript
// En App.tsx
<AlertProvider maxAlerts={5}>
  <AppContent />
</AlertProvider>
```

## Troubleshooting

### Las alertas no aparecen
- Verifica que `AlertProvider` esté en `App.tsx`
- Verifica que `AlertContainer` se renderice después de `RootNavigator`

### Las alertas se superponen con el navbar
- Ajusta `bottomPosition` en `AlertBanner.tsx` (línea del cálculo de bottom)
- Valor actual: `80 + (index * 70)`

### Las animaciones son lentas
- Asegúrate de tener `react-native-reanimated` correctamente instalado
- Ejecuta `npx pod-install` en iOS si es necesario
