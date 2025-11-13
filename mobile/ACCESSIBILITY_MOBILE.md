# Sistema de Accesibilidad Visual - Aplicación Móvil (React Native)

## Resumen

Sistema completo de accesibilidad visual implementado para la aplicación móvil usando React Native, AsyncStorage, y transformaciones de color nativas.

## Características Implementadas

### 1. Filtros de Daltonismo

Transformación de colores en tiempo real para diferentes tipos de deficiencias visuales:

- **Protanopia**: Deficiencia de rojo (1% de hombres)
- **Deuteranopia**: Deficiencia de verde (1% de hombres)
- **Tritanopia**: Deficiencia de azul (raro)
- **Acromatopsia**: Visión monocromática (muy raro)

**Implementación**: Usa matrices de transformación de color RGB aplicadas dinámicamente a través del contexto `AccessibilityContext`.

### 2. Modo Alto Contraste

- Detección automática usando `AccessibilityInfo.isHighTextContrastEnabled()` (iOS)
- Ajustes manuales disponibles en configuración

### 3. Tamaños de Fuente

Tres opciones con multiplicadores aplicados dinámicamente:

- **Normal**: 1.0x (base)
- **Grande**: 1.125x (+12.5%)
- **Muy grande**: 1.25x (+25%)

### 4. Espaciado de Líneas

Multiplicadores de `lineHeight`:

- **Normal**: 1.0x
- **Cómodo**: 1.17x
- **Espacioso**: 1.33x

### 5. Reducción de Movimiento

- Detección automática usando `AccessibilityInfo.isReduceMotionEnabled()`
- Control manual disponible
- Afecta todas las animaciones y transiciones de la app

## Estructura de Archivos

```
mobile/src/
├── hooks/
│   └── useAccessibility.ts              # Hook con AsyncStorage
├── contexts/
│   └── AccessibilityContext.tsx         # Contexto con transformación de colores
├── screens/main/
│   ├── SettingsScreen.tsx               # Pantalla de configuración (modificada)
│   └── AccessibilitySettingsScreen.tsx  # Pantalla de accesibilidad
└── navigation/
    ├── types.ts                          # Tipos (modificado)
    ├── MainStack.tsx                     # Stack principal (modificado)
    └── RootNavigator.tsx                 # Navigator raíz (modificado)
```

## Uso

### Para el Usuario

1. Abrir la app móvil
2. Ir a **Perfil** → **Configuración**
3. Tocar **"Accesibilidad Visual"**
4. Seleccionar las opciones deseadas
5. Las preferencias se guardan automáticamente

### Para Desarrolladores

#### Usar el Context en Componentes

```tsx
import { useAccessibilityContext } from '../contexts/AccessibilityContext';

function MyComponent() {
  const {
    settings,
    fontSizeMultiplier,
    lineHeightMultiplier,
    getAdjustedColor
  } = useAccessibilityContext();

  return (
    <Text
      style={{
        fontSize: 16 * fontSizeMultiplier,
        lineHeight: 24 * lineHeightMultiplier,
        color: getAdjustedColor('#FFFFFF')
      }}
    >
      Texto accesible
    </Text>
  );
}
```

#### Ajustar Colores según Daltonismo

```tsx
const { getAdjustedColor } = useAccessibilityContext();

// Los colores se ajustan automáticamente
<View style={{ backgroundColor: getAdjustedColor(colors.primary[500]) }}>
  <Text style={{ color: getAdjustedColor(colors.text.primary) }}>
    Este texto se ajusta al filtro activo
  </Text>
</View>
```

#### Usar Multiplicadores de Tamaño

```tsx
const { fontSizeMultiplier, lineHeightMultiplier } = useAccessibilityContext();

const styles = StyleSheet.create({
  text: {
    fontSize: 16 * fontSizeMultiplier,
    lineHeight: 24 * lineHeightMultiplier,
  }
});
```

## Implementación Técnica

### AsyncStorage

Las preferencias se guardan en AsyncStorage bajo la clave `@accessibility_settings`:

```json
{
  "colorBlindMode": "deuteranopia",
  "highContrast": true,
  "fontSize": "large",
  "lineSpacing": "comfortable",
  "reduceMotion": false
}
```

### Transformación de Colores

Los colores se transforman usando matrices RGB científicamente precisas:

```typescript
// Ejemplo: Deuteranopia
newR = 0.625 * r + 0.375 * g;
newG = 0.7 * r + 0.3 * g;
newB = 0.3 * g + 0.7 * b;
```

### Detección del Sistema

El sistema detecta automáticamente las preferencias de accesibilidad del dispositivo:

```typescript
// Reducción de movimiento
const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();

// Alto contraste (solo iOS)
const isHighContrastEnabled = await AccessibilityInfo.isHighTextContrastEnabled?.();
```

## Diferencias con la Web

| Característica | Web | Mobile (React Native) |
|----------------|-----|----------------------|
| Filtros de color | Filtros SVG CSS | Matrices de transformación RGB |
| Persistencia | localStorage | AsyncStorage |
| Detección sistema | Media queries | AccessibilityInfo API |
| Aplicación de estilos | CSS variables | Context + multiplicadores |
| Indicador visual | Badge flotante | Badge flotante (similar) |

## Compatibilidad

- ✅ **iOS**: Soporte completo incluida detección de alto contraste
- ✅ **Android**: Soporte completo (alto contraste no disponible)
- ✅ **Expo**: Compatible con SDK 50+

## Rendimiento

- **Transformación de colores**: O(1) - Cálculo instantáneo por color
- **AsyncStorage**: Lectura inicial, luego en memoria
- **Re-renders**: Optimizados usando Context API
- **Impacto en bundle**: ~5KB adicionales

## Testing

### Probar Filtros de Daltonismo

```bash
# En el dispositivo/emulador:
1. Abrir Settings > Accessibility Settings
2. Seleccionar diferentes modos de daltonismo
3. Navegar por la app para ver los cambios
```

### Probar Detección del Sistema

```bash
# iOS: Settings > Accessibility > Motion > Reduce Motion
# Android: Settings > Accessibility > Remove animations
```

## Mejoras Futuras

1. **Más filtros**: Agregar filtros adicionales como protanomalia (parcial)
2. **Vista previa**: Mostrar preview antes de aplicar cambios
3. **Perfiles**: Guardar múltiples perfiles de accesibilidad
4. **Sincronización**: Sincronizar preferencias con backend
5. **Animaciones adaptativas**: Velocidad ajustable en lugar de on/off
6. **Teclado físico**: Atajos de teclado para cambiar opciones
7. **VoiceOver/TalkBack**: Mejorar integración con lectores de pantalla

## Recursos

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [AccessibilityInfo API](https://reactnative.dev/docs/accessibilityinfo)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [WCAG Mobile Guidelines](https://www.w3.org/WAI/standards-guidelines/mobile/)

## Troubleshooting

### Los colores no cambian

**Problema**: Los filtros de daltonismo no se aplican.
**Solución**: Asegúrate de usar `getAdjustedColor()` en todos los colores que quieras transformar.

### AsyncStorage no persiste

**Problema**: Las configuraciones no se guardan entre sesiones.
**Solución**: Verifica que AsyncStorage esté correctamente instalado y vinculado.

### Multiplicadores no funcionan

**Problema**: Los tamaños de fuente no cambian.
**Solución**: Multiplica explícitamente los valores por `fontSizeMultiplier` en tus estilos.

## Notas de Implementación

- Los colores en formato `#RRGGBB` se transforman automáticamente
- Los colores nombrados (ej: `'red'`) se retornan sin cambios
- El contexto debe estar en la raíz de la navegación para funcionar globalmente
- Las preferencias del sistema solo se aplican en la primera carga si no hay configuración previa
