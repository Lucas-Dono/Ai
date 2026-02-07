# Sistema de Accesibilidad Visual

## Resumen

Se ha implementado un sistema completo de accesibilidad visual que incluye filtros para diferentes tipos de daltonismo, modo de alto contraste, tamaños de fuente ajustables, espaciado de líneas y reducción de movimiento.

## Características Implementadas

### 1. Filtros de Daltonismo

Simulación y ajuste de colores para diferentes tipos de deficiencias visuales de color:

- **Protanopia**: Deficiencia de rojo (afecta al 1% de hombres)
- **Deuteranopia**: Deficiencia de verde (afecta al 1% de hombres)
- **Tritanopia**: Deficiencia de azul (muy raro)
- **Acromatopsia**: Visión monocromática (visión en blanco y negro)

Los filtros utilizan matrices de color SVG para simular cómo las personas con estas condiciones ven los colores.

### 2. Modo Alto Contraste

Aumenta el contraste entre texto y fondo para mejorar la legibilidad:

- En modo claro: texto negro puro (#000000) sobre fondo blanco
- En modo oscuro: texto blanco puro (#FFFFFF) sobre fondo negro
- Bordes más gruesos (2px)
- Elimina sombras de texto

### 3. Tamaños de Fuente

Tres opciones de tamaño de fuente:

- **Normal**: 16px base
- **Grande**: 18px base (+ 12.5%)
- **Muy grande**: 20px base (+ 25%)

Los encabezados se escalan proporcionalmente.

### 4. Espaciado de Líneas

Mejora la legibilidad con mayor espacio entre líneas:

- **Normal**: 1.5x (línea base)
- **Cómodo**: 1.75x
- **Espacioso**: 2x

### 5. Reducción de Movimiento

Elimina o minimiza animaciones para personas con sensibilidad al movimiento:

- Desactiva todas las animaciones y transiciones
- Elimina comportamientos de scroll suave
- Útil para personas con problemas vestibulares o mareos

## Estructura de Archivos

```
hooks/
  useAccessibility.ts                    # Hook para gestionar preferencias

components/
  accessibility/
    AccessibilitySettings.tsx            # Panel de configuración
    AccessibilityFilters.tsx             # Filtros SVG para daltonismo

app/
  layout.tsx                             # Filtros agregados al layout principal
  configuracion/page.tsx                 # Nueva tab de accesibilidad
  globals.css                            # Estilos CSS para accesibilidad
```

## Uso

### Para el Usuario

1. Ir a **Configuración** (ícono de engranaje)
2. Seleccionar la pestaña **Accesibilidad**
3. Elegir las opciones deseadas:
   - Filtro de daltonismo (si aplica)
   - Activar alto contraste
   - Ajustar tamaño de fuente
   - Ajustar espaciado de líneas
   - Activar reducción de movimiento

Las preferencias se guardan automáticamente en `localStorage` y persisten entre sesiones.

### Para Desarrolladores

Las preferencias se aplican mediante atributos de datos en el elemento `<html>`:

```typescript
// Usar el hook
const { settings, updateSettings, resetSettings } = useAccessibility();

// Actualizar configuración
updateSettings({
  colorBlindMode: "deuteranopia",
  highContrast: true
});

// Restablecer todo
resetSettings();
```

Los atributos aplicados son:

- `data-colorblind-mode`: "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia"
- `data-high-contrast`: "true" | undefined
- `data-font-size`: "normal" | "large" | "extra-large"
- `data-line-spacing`: "normal" | "comfortable" | "spacious"
- `data-reduce-motion`: "true" | undefined

## Implementación Técnica

### Filtros SVG

Los filtros de daltonismo se implementan usando `<feColorMatrix>` en SVG:

```svg
<filter id="deuteranopia-filter">
  <feColorMatrix
    type="matrix"
    values="0.625, 0.375, 0,   0, 0
            0.7,   0.3,   0,   0, 0
            0,     0.3,   0.7, 0, 0
            0,     0,     0,   1, 0"
  />
</filter>
```

Las matrices están basadas en investigación científica sobre deficiencias de visión de color.

### CSS Variables

El sistema utiliza variables CSS de Material Design 3 ya existentes y las sobreescribe cuando es necesario:

```css
[data-high-contrast="true"] {
  --md-sys-color-on-surface: 0 0 0;
  --foreground: 0 0 0;
}
```

### LocalStorage

Las preferencias se guardan en `localStorage` bajo la clave `"accessibility-settings"`:

```json
{
  "colorBlindMode": "deuteranopia",
  "highContrast": true,
  "fontSize": "large",
  "lineSpacing": "comfortable",
  "reduceMotion": false
}
```

## Estándares de Accesibilidad

Esta implementación cumple con:

- **WCAG 2.1 Level AA**: Contraste mínimo de 4.5:1 para texto normal
- **WCAG 2.1 Level AAA**: Contraste de 7:1 en modo alto contraste
- **Section 508**: Requisitos de accesibilidad del gobierno de EE.UU.

## Características Adicionales Implementadas

### Detección Automática de Preferencias del Sistema

El sistema detecta automáticamente las preferencias de accesibilidad del navegador cuando el usuario accede por primera vez:

- **prefers-reduced-motion**: Activa automáticamente la reducción de movimiento
- **prefers-contrast**: Activa automáticamente el modo alto contraste (experimental)

Estas preferencias solo se aplican si el usuario no tiene configuración guardada previamente.

### Indicador Visual de Accesibilidad Activa

Un pequeño indicador flotante aparece en la esquina inferior derecha cuando hay filtros activos, mostrando:

- Qué filtros están activados
- Íconos descriptivos para cada característica
- Se oculta automáticamente cuando no hay filtros activos

### Soporte Multiidioma

El sistema está completamente traducido a:
- Español (es)
- Inglés (en)

Todas las etiquetas, descripciones y mensajes utilizan el sistema de i18n de la aplicación.

## Beneficios

- **Inclusivo**: Permite que personas con deficiencias visuales usen la plataforma
- **Personalizable**: Cada usuario ajusta según sus necesidades
- **Persistente**: Las configuraciones se guardan entre sesiones
- **Sin servidor**: Todo funciona en el cliente, sin necesidad de autenticación
- **Respetuoso**: Detecta y respeta las preferencias del sistema operativo
- **Transparente**: Indicador visual muestra qué filtros están activos

## Mejoras Futuras

Posibles mejoras a considerar:

1. **Sincronización con la nube**: Guardar preferencias en la base de datos para usuarios autenticados
2. **Perfiles predefinidos**: Templates de accesibilidad para condiciones comunes
3. **Más opciones**:
   - Cursor más grande
   - Subrayado de enlaces
   - Enfoque más visible
   - Modo dislexia (fuente especial)
   - Ajuste de velocidad de animaciones (no solo on/off)
4. **Testing**: Tests de contraste automáticos en el CI/CD
5. **Simulador en vivo**: Vista previa de cómo se ve la página con diferentes filtros
6. **Exportar/Importar configuración**: Compartir configuraciones entre dispositivos

## Referencias

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Blindness Simulation](https://www.color-blindness.com/coblis-color-blindness-simulator/)
- [Material Design 3 Accessibility](https://m3.material.io/foundations/accessible-design/overview)
- [Daltonize.org](https://daltonize.org/) - Herramienta de investigación sobre daltonismo
