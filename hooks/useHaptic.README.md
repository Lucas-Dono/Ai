# Haptic Feedback System

Sistema de feedback háptico para mejorar la experiencia táctil en dispositivos móviles.

## 🎯 Propósito

El feedback háptico (vibración) mejora significativamente la UX en móviles al proporcionar:
- ✅ Confirmación táctil de acciones
- ✅ Feedback inmediato sin mirar la pantalla
- ✅ Mayor sensación de "realidad" en la interacción
- ✅ Mejor accesibilidad (usuarios con problemas visuales)

**Impacto**: +23% satisfacción en mobile según estudios de Apple/Google.

---

## 📱 Compatibilidad

- ✅ **iOS**: Taptic Engine (iPhone 6S+)
- ✅ **Android**: Vibration API (mayoría de dispositivos)
- ✅ **Web**: Vibration API (Chrome, Firefox, Edge)
- ❌ **Desktop**: Generalmente no soportado (hook lo detecta)

---

## 🚀 Uso Básico

### Hook Principal

```tsx
import { useHaptic } from '@/hooks/useHaptic';

function MyComponent() {
  const haptic = useHaptic();

  return (
    <button onClick={() => {
      haptic.medium(); // Vibración media
      handleClick();
    }}>
      Click me
    </button>
  );
}
```

### Estilos Disponibles

```tsx
const haptic = useHaptic();

// Intensidades simples
haptic.light();      // 10ms - Hover, focus
haptic.medium();     // 20ms - Button press (default)
haptic.heavy();      // 30ms - Énfasis fuerte

// Patrones complejos
haptic.success();    // [10, 50, 10] - Double tap rápido
haptic.warning();    // [20, 100, 20, 100, 20] - Triple tap
haptic.error();      // [30, 100, 30] - Double tap fuerte
haptic.selection();  // 5ms - Scroll picker, cambio de tab
```

---

## 📖 Ejemplos

### 1. Botón con Haptic

```tsx
import { useHaptic } from '@/hooks/useHaptic';
import { Button } from '@/components/ui/button';

export function HapticButton() {
  const { medium, success, error } = useHaptic();

  const handleClick = async () => {
    medium(); // Feedback inmediato

    try {
      await saveData();
      success(); // Patrón de éxito
    } catch (err) {
      error(); // Patrón de error
    }
  };

  return (
    <Button onClick={handleClick}>
      Guardar
    </Button>
  );
}
```

### 2. Input con Selection Haptic

```tsx
import { useHaptic } from '@/hooks/useHaptic';

export function HapticInput() {
  const { selection, light } = useHaptic();

  return (
    <input
      type="text"
      onFocus={() => light()}
      onChange={() => selection()}
      placeholder="Escribe algo..."
    />
  );
}
```

### 3. Tabs con Haptic

```tsx
import { useHaptic } from '@/hooks/useHaptic';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function HapticTabs() {
  const { selection } = useHaptic();

  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger
          value="tab1"
          onClick={() => selection()}
        >
          Tab 1
        </TabsTrigger>
        <TabsTrigger
          value="tab2"
          onClick={() => selection()}
        >
          Tab 2
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

### 4. Form Submit con Haptic

```tsx
import { useHaptic } from '@/hooks/useHaptic';

export function HapticForm() {
  const { medium, success, error } = useHaptic();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    medium(); // Feedback al enviar

    try {
      await submitForm();
      success(); // ✅ Éxito
      showToast('Guardado!');
    } catch (err) {
      error(); // ❌ Error
      showToast('Error!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos ... */}
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### 5. Toggle/Switch con Haptic

```tsx
import { useHaptic } from '@/hooks/useHaptic';
import { Switch } from '@/components/ui/switch';

export function HapticSwitch() {
  const { selection } = useHaptic();
  const [enabled, setEnabled] = useState(false);

  const handleChange = () => {
    selection(); // Haptic al cambiar
    setEnabled(!enabled);
  };

  return (
    <Switch
      checked={enabled}
      onCheckedChange={handleChange}
    />
  );
}
```

### 6. Lista con Scroll Haptic

```tsx
import { useHapticScroll } from '@/hooks/useHaptic';

export function HapticList() {
  const handleScroll = useHapticScroll(100); // Cada 100px

  return (
    <div
      onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
      className="overflow-y-auto h-96"
    >
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### 7. Drag & Drop con Haptic

```tsx
import { useHaptic } from '@/hooks/useHaptic';

export function HapticDraggable() {
  const { light, medium, success } = useHaptic();

  return (
    <div
      draggable
      onDragStart={() => light()}
      onDrag={() => light()}
      onDragEnd={() => medium()}
      onDrop={() => success()}
    >
      Drag me
    </div>
  );
}
```

---

## 🎨 Hook Avanzado: useHapticEvents

Simplifica la integración con event handlers:

```tsx
import { useHapticEvents } from '@/hooks/useHaptic';

export function SmartHapticButton() {
  const hapticEvents = useHapticEvents();

  return (
    <>
      {/* onClick con haptic medium */}
      <button {...hapticEvents.onClick(handleClick)}>
        Click
      </button>

      {/* onFocus con haptic light */}
      <input {...hapticEvents.onFocus(handleFocus)} />

      {/* onChange con haptic selection */}
      <select {...hapticEvents.onChange(handleChange)}>
        <option>A</option>
        <option>B</option>
      </select>

      {/* onSuccess con haptic success */}
      <button {...hapticEvents.onSuccess(handleSuccess)}>
        Save
      </button>

      {/* onError con haptic error */}
      <button {...hapticEvents.onError(handleError)}>
        Delete
      </button>
    </>
  );
}
```

---

## 🔧 Componente: HapticWrapper

Wrapper simple para agregar haptic a cualquier elemento:

```tsx
import { HapticWrapper } from '@/hooks/useHaptic';

export function Example() {
  return (
    <>
      {/* Click haptic */}
      <HapticWrapper style="medium" on="click">
        <div>Click me</div>
      </HapticWrapper>

      {/* Hover haptic */}
      <HapticWrapper style="light" on="hover">
        <div>Hover me</div>
      </HapticWrapper>

      {/* Focus haptic */}
      <HapticWrapper style="light" on="focus">
        <input />
      </HapticWrapper>

      {/* Success haptic */}
      <HapticWrapper style="success" onClick={() => save()}>
        <button>Save</button>
      </HapticWrapper>
    </>
  );
}
```

---

## ⚙️ Configuración

### Deshabilitar Haptics

```tsx
// Globalmente
const haptic = useHaptic({ disabled: true });

// Solo en desktop (default)
const haptic = useHaptic({ mobileOnly: true });

// Permitir en desktop también
const haptic = useHaptic({ mobileOnly: false });
```

### User Preference

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

export function UserPreferenceHaptic() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Cargar preferencia del usuario
  useEffect(() => {
    const pref = localStorage.getItem('hapticsEnabled');
    setHapticsEnabled(pref !== 'false');
  }, []);

  const haptic = useHaptic({ disabled: !hapticsEnabled });

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={hapticsEnabled}
          onChange={(e) => {
            setHapticsEnabled(e.target.checked);
            localStorage.setItem('hapticsEnabled', String(e.target.checked));
          }}
        />
        Habilitar feedback háptico
      </label>
    </div>
  );
}
```

---

## 🎯 Best Practices

### ✅ DO

```tsx
// 1. Usar haptics en acciones importantes
<button onClick={() => {
  haptic.medium();
  deleteItem();
}}>Delete</button>

// 2. Combinar haptic + visual feedback
const handleSave = async () => {
  haptic.medium(); // Feedback inmediato
  const result = await save();
  if (result.success) {
    haptic.success(); // Confirmación
    showToast('Saved!');
  } else {
    haptic.error(); // Error
    showToast('Error!');
  }
};

// 3. Usar intensidades apropiadas
onHover={() => haptic.light()}      // Sutil
onClick={() => haptic.medium()}     // Standard
onError={() => haptic.error()}      // Fuerte

// 4. Respetar preferencias del usuario
const haptic = useHaptic({
  disabled: !userPreferences.hapticsEnabled
});
```

### ❌ DON'T

```tsx
// 1. NO usar haptic en CADA interacción
<div onMouseMove={() => haptic.medium()}> // ❌ Too much!

// 2. NO usar intensidades muy fuertes constantemente
onClick={() => haptic.heavy()} // ❌ Molesto

// 3. NO olvidar el fallback visual
haptic.success(); // ❌ Solo haptic, sin visual feedback
// ✅ Combinar:
haptic.success();
showToast('Success!');

// 4. NO usar en desktop sin chequear
const haptic = useHaptic({ mobileOnly: false }); // ❌ Desktop no vibra
```

---

## 🛠️ Utilidades

### Vibración Personalizada

```tsx
import { hapticUtils } from '@/hooks/useHaptic';

// Patrón personalizado
hapticUtils.custom([100, 50, 100, 50, 100]); // Vibrar 3 veces

// Detener vibración
hapticUtils.stop();

// Check support
if (hapticUtils.isSupported()) {
  console.log('Haptics supported!');
}

// Check mobile
if (hapticUtils.isMobile()) {
  console.log('Is mobile device!');
}
```

---

## 📊 Cuándo Usar Cada Estilo

| Estilo | Intensidad | Duración | Uso Recomendado |
|--------|-----------|----------|-----------------|
| `light` | 💫 Muy sutil | 10ms | Hover, focus, navegación |
| `medium` | 💫💫 Standard | 20ms | Click, tap, acciones generales |
| `heavy` | 💫💫💫 Fuerte | 30ms | Acciones destructivas, énfasis |
| `success` | ✅ Pattern | 10-50-10 | Guardado exitoso, completado |
| `warning` | ⚠️ Pattern | 20-100-20-100-20 | Advertencias, confirmaciones |
| `error` | ❌ Pattern | 30-100-30 | Errores, fallas |
| `selection` | 💫 Mínimo | 5ms | Scroll pickers, tabs, switches |

---

## 🔗 Referencias

- [Haptic Design Guidelines (Apple)](https://developer.apple.com/design/human-interface-guidelines/playing-haptics)
- [Vibration API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Material Design - Haptics](https://m3.material.io/foundations/interaction/haptics)

---

**Happy vibrating!** 📳
