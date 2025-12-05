# Guía de Accesibilidad - Smart Start System

## Resumen

El sistema Smart Start ha sido diseñado con accesibilidad como prioridad, cumpliendo con los estándares **WCAG 2.1 Level AA**. Esta guía documenta todos los patrones de accesibilidad implementados y cómo usarlos correctamente.

---

## 📋 Tabla de Contenidos

1. [Componentes Accesibles](#componentes-accesibles)
2. [Navegación por Teclado](#navegación-por-teclado)
3. [Gestión de Focus](#gestión-de-focus)
4. [ARIA y Lectores de Pantalla](#aria-y-lectores-de-pantalla)
5. [Atajos de Teclado](#atajos-de-teclado)
6. [Guía para Desarrolladores](#guía-para-desarrolladores)

---

## Componentes Accesibles

### KeyboardPills

Componente para selección de opciones con navegación completa por teclado.

**Ubicación**: `components/smart-start/ui/accessible/KeyboardPills.tsx`

**Características**:
- ✅ Navegación con flechas (← → o ↑ ↓)
- ✅ Home/End para saltar al primero/último
- ✅ Enter/Space para seleccionar
- ✅ Soporte para selección múltiple o simple
- ✅ ARIA roles (`listbox`, `option`)
- ✅ Anuncios para lectores de pantalla

**Uso**:
```tsx
import { KeyboardPills } from '@/components/smart-start/ui/accessible/KeyboardPills';

<KeyboardPills
  options={[
    { id: '1', label: 'Opción 1' },
    { id: '2', label: 'Opción 2' },
  ]}
  selected={['1']}
  onChange={(selected) => console.log(selected)}
  multiple={false}
  orientation="horizontal"
/>
```

---

### AccessibleModal

Modal completamente accesible con focus trap y gestión de teclado.

**Ubicación**: `components/smart-start/ui/accessible/AccessibleModal.tsx`

**Características**:
- ✅ Focus trap (Tab cicla dentro del modal)
- ✅ Escape para cerrar
- ✅ Auto-focus en primer elemento
- ✅ Restauración de focus al cerrar
- ✅ Previene scroll del body
- ✅ Click en backdrop para cerrar
- ✅ ARIA modal completo

**Uso**:
```tsx
import { AccessibleModal } from '@/components/smart-start/ui/accessible/AccessibleModal';

<AccessibleModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título del Modal"
  description="Descripción opcional"
  size="lg"
>
  {/* Contenido del modal */}
</AccessibleModal>
```

---

### KeyboardTabs

Sistema de tabs con navegación por teclado.

**Ubicación**: `components/smart-start/ui/accessible/KeyboardTabs.tsx`

**Características**:
- ✅ Navegación con flechas entre tabs
- ✅ Auto-selección al navegar
- ✅ Soporte horizontal/vertical
- ✅ 3 variantes visuales (default, pills, underline)
- ✅ ARIA tablist completo

**Uso**:
```tsx
import { KeyboardTabs } from '@/components/smart-start/ui/accessible/KeyboardTabs';

<KeyboardTabs
  tabs={[
    { id: '1', label: 'Tab 1', content: <div>Contenido 1</div> },
    { id: '2', label: 'Tab 2', content: <div>Contenido 2</div> },
  ]}
  selectedTab={selectedTab}
  onTabChange={setSelectedTab}
/>
```

---

### FocusTrap

Componente para atrapar el focus dentro de un área específica.

**Ubicación**: `components/smart-start/ui/accessible/FocusTrap.tsx`

**Características**:
- ✅ Atrapa Tab key para ciclar dentro
- ✅ Auto-focus configurable
- ✅ Restauración de focus
- ✅ Manejo de contenido dinámico

**Uso**:
```tsx
import { FocusTrap } from '@/components/smart-start/ui/accessible/FocusTrap';

<FocusTrap active={isActive} autoFocus={true} restoreFocus={true}>
  {/* Contenido donde atrapar el focus */}
</FocusTrap>
```

---

## Navegación por Teclado

### Atajos Globales

| Atajo | Acción |
|-------|--------|
| `?` (Shift+/) | Mostrar ayuda de atajos |
| `Ctrl/Cmd + Enter` | Siguiente paso / Enviar |
| `Ctrl/Cmd + [` | Volver atrás |
| `Ctrl/Cmd + ]` | Ir adelante |
| `Ctrl/Cmd + S` | Guardar borrador |
| `Escape` | Cerrar modal / Cancelar |
| `/` | Focus en búsqueda |

### Navegación por Paso

#### GenreSelection
- `← → ↑ ↓` - Navegar entre géneros/subgéneros/arquetipos
- `Enter/Space` - Seleccionar
- `Tab` - Siguiente nivel
- `Esc` - Volver al nivel anterior

#### CharacterTypeSelection
- `← →` - Cambiar entre opciones
- `1-2` - Acceso rápido a cada opción
- `Enter` - Confirmar selección

#### CharacterSearch
- `/` - Focus en campo de búsqueda
- `↑ ↓` - Navegar resultados
- `1-9` - Selección rápida (primeros 9 resultados)
- `Enter` - Seleccionar resultado
- `← →` - Navegar filtros

---

## Gestión de Focus

### Utilidades de Focus

**Ubicación**: `lib/utils/focus.ts`

#### Clases de Focus-Visible

Usa estas clases para estilizar elementos solo cuando se navega por teclado:

```tsx
import { focusVisibleClasses } from '@/lib/utils/focus';

// Focus ring primario (acciones principales)
<button className={focusVisibleClasses.primary}>
  Botón Principal
</button>

// Focus ring secundario (acciones secundarias)
<button className={focusVisibleClasses.secondary}>
  Botón Secundario
</button>

// Focus ring para inputs
<input className={focusVisibleClasses.input} />

// Focus ring mínimo (elementos sutiles)
<button className={focusVisibleClasses.minimal}>
  Acción Sutil
</button>
```

#### Funciones de Navegación

```tsx
import {
  focusNext,
  focusPrevious,
  focusFirst,
  focusLast,
  saveFocus,
  scrollIntoViewIfNeeded
} from '@/lib/utils/focus';

// Mover focus al siguiente elemento tabbable
focusNext(currentElement, container, wrap);

// Mover focus al anterior elemento tabbable
focusPrevious(currentElement, container, wrap);

// Focus al primer elemento tabbable
focusFirst(container);

// Focus al último elemento tabbable
focusLast(container);

// Guardar y restaurar focus
const restoreFocus = saveFocus();
// ... hacer algo
restoreFocus(); // Restaura el focus

// Scroll inteligente que respeta prefers-reduced-motion
scrollIntoViewIfNeeded(element);
```

#### Roving Tabindex

Para listas con navegación por flechas:

```tsx
import { createRovingTabindex } from '@/lib/utils/focus';

const elements = [element1, element2, element3];
const rovingTabindex = createRovingTabindex(elements, 0);

// Navegar
rovingTabindex.next();
rovingTabindex.previous();
rovingTabindex.first();
rovingTabindex.last();

// O ir a un índice específico
rovingTabindex.setCurrent(2);
```

---

## ARIA y Lectores de Pantalla

### Roles ARIA Implementados

- `role="dialog"` + `aria-modal="true"` - Modales
- `role="listbox"` + `role="option"` - KeyboardPills
- `role="tablist"` + `role="tab"` + `role="tabpanel"` - KeyboardTabs
- `role="radio"` + `aria-checked` - Opciones de selección única
- `role="status"` + `aria-live="polite"` - Anuncios dinámicos

### Atributos ARIA

- `aria-labelledby` - Etiqueta elementos con ID de su título
- `aria-describedby` - Describe elementos con ID de su descripción
- `aria-selected` - Indica selección actual
- `aria-disabled` - Indica elementos deshabilitados
- `aria-expanded` - Indica estado expandido/colapsado

### Texto para Lectores de Pantalla

Usa la clase `sr-only` para texto solo visible para lectores de pantalla:

```tsx
<div>
  <span className="sr-only">
    Cargando resultados de búsqueda
  </span>
  <Loader className="animate-spin" />
</div>
```

---

## Atajos de Teclado

### Sistema de Atajos

**Ubicación**: `hooks/useKeyboardShortcuts.ts`

#### Uso Básico

```tsx
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts(
    [
      commonShortcuts.help(() => setIsOpen(true)),
      commonShortcuts.close(() => setIsOpen(false)),
      commonShortcuts.submit(handleSubmit),
      {
        key: 'k',
        ctrl: true,
        description: 'Acción personalizada',
        action: () => console.log('Custom action'),
      },
    ],
    { enabled: true }
  );
}
```

#### Atajos Comunes Predefinidos

```tsx
// Todos disponibles en commonShortcuts
commonShortcuts.commandPalette(action)  // Ctrl/Cmd + K
commonShortcuts.close(action)            // Escape
commonShortcuts.search(action)           // /
commonShortcuts.help(action)             // Shift + /
commonShortcuts.save(action)             // Ctrl/Cmd + S
commonShortcuts.submit(action)           // Ctrl/Cmd + Enter
commonShortcuts.goBack(action)           // Ctrl/Cmd + [
commonShortcuts.goForward(action)        // Ctrl/Cmd + ]
commonShortcuts.refresh(action)          // Ctrl/Cmd + R
commonShortcuts.next(action)             // N
commonShortcuts.previous(action)         // P
commonShortcuts.toggle(action)           // T
commonShortcuts.delete(action)           // Delete
```

#### Mostrar Atajos

```tsx
import { formatShortcut } from '@/hooks/useKeyboardShortcuts';

const shortcut = {
  key: 'k',
  ctrl: true,
  description: 'Búsqueda',
};

console.log(formatShortcut(shortcut)); // "Ctrl+K" or "⌘K" on Mac
```

### Help Overlay

```tsx
import {
  KeyboardShortcutsHelp,
  useKeyboardShortcutsHelp
} from '@/components/smart-start/ui/accessible/KeyboardShortcutsHelp';

function MyWizardStep() {
  const helpOverlay = useKeyboardShortcutsHelp();

  useKeyboardShortcuts([
    commonShortcuts.help(helpOverlay.toggle),
  ]);

  return (
    <div>
      {/* Tu contenido */}

      <KeyboardShortcutsHelp
        isOpen={helpOverlay.isOpen}
        onClose={helpOverlay.close}
      />
    </div>
  );
}
```

---

## Guía para Desarrolladores

### Checklist de Accesibilidad

Al crear un nuevo componente, asegúrate de:

- [ ] **Navegación por Teclado**: Todos los elementos interactivos son accesibles con Tab
- [ ] **Indicadores Visuales**: Focus visible claro para usuarios de teclado
- [ ] **ARIA Apropiado**: Roles y atributos ARIA correctos
- [ ] **Orden de Tab**: Orden lógico de navegación
- [ ] **Texto Alternativo**: Imágenes tienen alt text descriptivo
- [ ] **Contraste**: Ratio de contraste mínimo 4.5:1 para texto
- [ ] **Tamaño de Targets**: Mínimo 44x44px para elementos táctiles
- [ ] **Estados**: Hover, focus, active, disabled claramente diferenciados
- [ ] **Error Handling**: Mensajes de error descriptivos y accesibles
- [ ] **Responsive**: Funciona en todos los tamaños de pantalla

### Patrones a Seguir

#### 1. Botones Accesibles

```tsx
<button
  className={focusVisibleClasses.primary}
  aria-label="Descripción clara de la acción"
  disabled={isDisabled}
  aria-disabled={isDisabled}
>
  Texto del Botón
</button>
```

#### 2. Inputs Accesibles

```tsx
<div>
  <label htmlFor="email" className="sr-only">
    Correo Electrónico
  </label>
  <input
    id="email"
    type="email"
    className={focusVisibleClasses.input}
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-error"
  />
  {hasError && (
    <p id="email-error" role="alert">
      Error: Correo inválido
    </p>
  )}
</div>
```

#### 3. Modales Accesibles

```tsx
<AccessibleModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título Descriptivo"
  description="Descripción del propósito del modal"
>
  {/* Contenido */}
</AccessibleModal>
```

#### 4. Listas con Navegación

```tsx
<KeyboardPills
  options={options}
  selected={selected}
  onChange={handleChange}
  orientation="horizontal"
/>
```

### Testing de Accesibilidad

#### Testing Manual

1. **Solo Teclado**: Intenta completar toda la tarea sin mouse
2. **Lector de Pantalla**: Prueba con NVDA (Windows) o VoiceOver (Mac)
3. **Zoom**: Prueba con 200% de zoom
4. **Alto Contraste**: Activa modo de alto contraste del sistema

#### Testing Automatizado

```bash
# Instalar axe-core para testing
npm install --save-dev @axe-core/react

# Integrar en tests
import { axe } from '@axe-core/react';

test('no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Recursos Adicionales

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Changelog

### v2.0 - Actualización de Accesibilidad Completa
- ✅ Implementados todos los componentes base accesibles
- ✅ Sistema global de atajos de teclado
- ✅ Help overlay con todos los atajos
- ✅ Focus management completo
- ✅ Todos los pasos del wizard navegables por teclado
- ✅ WCAG 2.1 AA compliance

### v1.0 - Implementación Inicial
- Navegación básica por teclado
- Focus management básico

---

**Última actualización**: 2025-01-XX
**Mantenido por**: Equipo de Desarrollo Smart Start
