# Ejemplo de Migración: Alert.alert() → useAlert()

Este documento muestra cómo migrar componentes que usan `Alert.alert()` al nuevo sistema de alertas estilizadas.

## Ejemplo Real: AvatarEditor.tsx

### ❌ Código Antiguo (Alert.alert)

```typescript
import React, { useState } from 'react';
import {
  View,
  Alert,  // ← Alert nativo
} from 'react-native';

export function AvatarEditor({ imageUri, onSave, onCancel, visible }: AvatarEditorProps) {
  const [editedUri, setEditedUri] = useState(imageUri);

  const applyRotation = async () => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Rotate error:', error);
      Alert.alert('Error', 'No se pudo rotar la imagen');  // ← Alert modal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  // ... más código
}
```

### ✅ Código Nuevo (useAlert)

```typescript
import React, { useState } from 'react';
import {
  View,
  // Alert eliminado ← Ya no se necesita
} from 'react-native';
import { useAlert } from '@/contexts/AlertContext';  // ← Importar hook

export function AvatarEditor({ imageUri, onSave, onCancel, visible }: AvatarEditorProps) {
  const [editedUri, setEditedUri] = useState(imageUri);
  const { showAlert } = useAlert();  // ← Hook de alertas

  const applyRotation = async () => {
    try {
      setProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const manipResult = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(manipResult.uri);
    } catch (error) {
      console.error('Rotate error:', error);
      showAlert('No se pudo rotar la imagen', { type: 'error' });  // ← Alerta estilizada
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessing(false);
    }
  };

  // ... más código
}
```

## Patrón de Migración General

### 1. Alertas Simples (Solo OK)

**Antes:**
```typescript
Alert.alert('Error', 'Mensaje de error');
```

**Después:**
```typescript
showAlert('Mensaje de error', { type: 'error' });
```

### 2. Alertas con Confirmación

**Antes:**
```typescript
Alert.alert(
  'Confirmar',
  '¿Estás seguro?',
  [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Aceptar', onPress: handleConfirm }
  ]
);
```

**Después (opción 1 - solo alerta):**
```typescript
// Para confirmaciones, mejor usar un modal personalizado
// El sistema de alertas es para notificaciones, no confirmaciones
```

**Después (opción 2 - usar para resultado):**
```typescript
// Si la confirmación ya fue hecha, mostrar resultado:
handleConfirm();
showAlert('Acción completada', { type: 'success' });
```

### 3. Alertas con Callback

**Antes:**
```typescript
Alert.alert(
  '¡Gracias por tu valoración!',
  'Tu opinión nos ayuda a mejorar.',
  [{ text: 'Cerrar', onPress: onClose }]
);
```

**Después:**
```typescript
showAlert('¡Gracias por tu valoración! Tu opinión nos ayuda a mejorar.', {
  type: 'success',
  duration: 3000
});
// Ejecutar callback inmediatamente si es necesario
onClose();
```

## Mapeo de Casos de Uso

### Validaciones de Formulario

**Antes:**
```typescript
Alert.alert(
  'Valoración requerida',
  'Por favor, selecciona al menos una estrella para valorar.',
  [{ text: 'Entendido' }]
);
```

**Después:**
```typescript
showAlert('Por favor, selecciona al menos una estrella para valorar.', {
  type: 'warning',
  duration: 4000
});
```

### Errores de Red

**Antes:**
```typescript
Alert.alert('Error de conexión', 'No se pudo conectar al servidor');
```

**Después:**
```typescript
showAlert('No se pudo conectar al servidor', {
  type: 'error',
  duration: 4000
});
```

### Operaciones Exitosas

**Antes:**
```typescript
Alert.alert('Éxito', 'Tema guardado correctamente');
```

**Después:**
```typescript
showAlert('Tema guardado correctamente', {
  type: 'success',
  duration: 2000
});
```

### Información General

**Antes:**
```typescript
Alert.alert('Información', 'Tienes 3 mensajes nuevos');
```

**Después:**
```typescript
showAlert('Tienes 3 mensajes nuevos', {
  type: 'info',
  duration: 3000
});
```

## Checklist de Migración

Para cada archivo que usa `Alert.alert()`:

- [ ] Importar `useAlert` de `@/contexts/AlertContext`
- [ ] Eliminar import de `Alert` de `react-native`
- [ ] Agregar `const { showAlert } = useAlert();` en el componente
- [ ] Reemplazar cada `Alert.alert()` con `showAlert()`
- [ ] Elegir el tipo apropiado: `success`, `error`, `warning`, `info`
- [ ] Ajustar duración si es necesario (default: 3000ms)
- [ ] Si hay callbacks en botones, ejecutarlos directamente (no como callback de alerta)
- [ ] Probar que las alertas aparezcan correctamente

## Archivos Pendientes de Migración

Estos archivos actualmente usan `Alert.alert()` y deben ser migrados:

1. `/mobile/src/components/character-creation/AvatarEditor.tsx`
   - Línea 91: Error de rotación
   - Líneas adicionales con flip/crop

2. `/mobile/src/components/chat/AgentRatingModal.tsx`
   - Validaciones de rating
   - Confirmaciones de envío

3. `/mobile/src/components/chat/ChatThemeModal.tsx`
   - Errores al guardar temas

4. `/mobile/src/screens/auth/LoginScreen.tsx`
   - Validaciones de login
   - Errores de autenticación

5. `/mobile/src/screens/auth/RegisterScreen.tsx`
   - Validaciones de registro
   - Errores de creación de cuenta

6. `/mobile/src/screens/Billing/BillingScreen.tsx`
   - Errores de carga de planes

## Beneficios de la Migración

✅ **UX Consistente**: Todas las alertas tienen el mismo diseño
✅ **No Bloquean**: El usuario puede interactuar con la app mientras ve la alerta
✅ **Mejor Diseño**: Colores y estilo consistentes con la app (negro/violeta)
✅ **Animaciones Suaves**: Entrada/salida con spring animations
✅ **Haptic Feedback**: Retroalimentación táctil integrada
✅ **Múltiples Alertas**: Soporte para apilar alertas (3 simultáneas)
✅ **Auto-Descarte**: Las alertas desaparecen automáticamente

## Notas Importantes

⚠️ **Confirmaciones**: El sistema de alertas NO es adecuado para diálogos de confirmación (Sí/No). Para esos casos, crea un modal personalizado.

⚠️ **Callbacks**: Los callbacks de botones deben ejecutarse directamente, no como callback de la alerta (ya que las alertas se descartan automáticamente).

⚠️ **Texto Largo**: Para textos muy largos (>100 caracteres), considera usar un modal en lugar de una alerta.
