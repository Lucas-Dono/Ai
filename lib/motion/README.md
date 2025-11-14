# Motion System - Circuit Prompt AI

Sistema centralizado de animaciones basado en Material Design 3 Motion y Framer Motion.

## 📚 Contenido

- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Variants Disponibles](#variants-disponibles)
- [Ejemplos](#ejemplos)
- [Accesibilidad](#accesibilidad)

---

## 🚀 Instalación

El sistema ya está configurado. Solo importa lo que necesites:

```typescript
import {
  fadeVariants,
  slideUpVariants,
  scaleVariants,
  staggerContainerVariants,
  staggerItemVariants,
  DURATION,
  EASING,
  TRANSITIONS,
} from '@/lib/motion/system';
```

---

## 💡 Uso Básico

### Fade In/Out

```tsx
import { motion } from 'framer-motion';
import { fadeVariants } from '@/lib/motion/system';

export function MyComponent() {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      Content que hace fade in
    </motion.div>
  );
}
```

### Modal con Scale

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { scaleVariants } from '@/lib/motion/system';

export function Modal({ isOpen, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex items-center justify-center"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Lista con Stagger

```tsx
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion/system';

export function List({ items }: ListProps) {
  return (
    <motion.ul
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={staggerItemVariants}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

---

## 🎭 Variants Disponibles

### Fade
- `fadeVariants` - Fade in/out simple

### Slide
- `slideUpVariants` - Desde abajo (modals, sheets)
- `slideDownVariants` - Desde arriba (notifications)
- `slideRightVariants` - Desde izquierda (sidebars)
- `slideLeftVariants` - Desde derecha (sidebars)

### Scale
- `scaleVariants` - Grow/shrink (modals, popovers)
- `bounceVariants` - Con bounce effect (celebrations)

### Stagger
- `staggerContainerVariants` - Container para lista
- `staggerItemVariants` - Items individuales

### Special
- `collapseVariants` - Collapse/expand (acordeones)
- `rotateVariants` - Rotar 180° (chevrons)
- `shakeVariants` - Shake para errores
- `pulseVariants` - Pulse continuo (loading)
- `glowVariants` - Glow effect (destacar)
- `swooshVariants` - Swoosh al enviar mensaje
- `sparkleVariants` - Sparkle para delight

---

## 📖 Ejemplos Completos

### Bottom Sheet (Mobile)

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { bottomSheetPreset } from '@/lib/motion/system';

export function BottomSheet({ isOpen, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={bottomSheetPreset.backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Sheet */}
          <motion.div
            variants={bottomSheetPreset.sheet}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Toast Notification

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { toastPreset } from '@/lib/motion/system';

export function Toast({ isVisible, message }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastPreset.toast}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 right-4 bg-white rounded-2xl shadow-lg p-4"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Mensaje Enviado con Swoosh

```tsx
import { motion } from 'framer-motion';
import { swooshVariants } from '@/lib/motion/system';

export function MessageBubble({ onSent }: Props) {
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(onSent, 400); // Duración del swoosh
  };

  return (
    <motion.div
      variants={swooshVariants}
      initial="initial"
      animate={sent ? 'swoosh' : 'initial'}
      className="bg-primary text-white p-3 rounded-2xl"
    >
      Tu mensaje
    </motion.div>
  );
}
```

### Acordeón

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { collapseVariants } from '@/lib/motion/system';

export function Accordion({ isOpen, children }: AccordionProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          variants={collapseVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Chevron que Rota

```tsx
import { motion } from 'framer-motion';
import { rotateVariants } from '@/lib/motion/system';
import { ChevronDown } from 'lucide-react';

export function ExpandButton({ isExpanded }: Props) {
  return (
    <motion.div
      variants={rotateVariants}
      initial="initial"
      animate={isExpanded ? 'rotated' : 'initial'}
    >
      <ChevronDown />
    </motion.div>
  );
}
```

---

## ♿ Accesibilidad

El sistema **respeta automáticamente `prefers-reduced-motion`**:

```tsx
import { respectReducedMotion, fadeVariants } from '@/lib/motion/system';

export function MyComponent() {
  return (
    <motion.div
      variants={respectReducedMotion(fadeVariants)}
      initial="hidden"
      animate="visible"
    >
      Content con animación reducida si el usuario lo prefiere
    </motion.div>
  );
}
```

Cuando el usuario tiene `prefers-reduced-motion: reduce` activado:
- ✅ Las animaciones se ejecutan instantáneamente (duration: 0)
- ✅ Se mantienen los estados finales
- ✅ No se pierde funcionalidad

---

## 🎨 Custom Animations

### Crear Transición Personalizada

```tsx
import { createTransition } from '@/lib/motion/system';

const customTransition = createTransition({
  duration: 0.4,
  delay: 0.1,
  ease: EASING.bounce,
});

<motion.div
  animate={{ scale: 1.2 }}
  transition={customTransition}
/>;
```

### Combinar Variants

```tsx
import { combineVariants, fadeVariants, slideUpVariants } from '@/lib/motion/system';

const fadeAndSlide = combineVariants(fadeVariants, slideUpVariants);

<motion.div variants={fadeAndSlide} />;
```

### Stagger Delay Personalizado

```tsx
import { getStaggerDelay } from '@/lib/motion/system';

items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: getStaggerDelay(index, 0.1) }}
  >
    {item.name}
  </motion.div>
));
```

---

## 📊 Tokens de Duración

```typescript
DURATION.instant   // 0.1s  - Instantáneo
DURATION.fast      // 0.15s - Muy rápido
DURATION.normal    // 0.25s - ⭐ Default
DURATION.moderate  // 0.35s - Medio
DURATION.slow      // 0.5s  - Lento
DURATION.slower    // 0.7s  - Muy lento
DURATION.slowest   // 1.0s  - Extra lento
```

## 📊 Easing Functions

```typescript
EASING.standard    // Para la mayoría de animaciones
EASING.decelerate  // Elementos entrando
EASING.accelerate  // Elementos saliendo
EASING.sharp       // Cambios abruptos
EASING.linear      // Progreso continuo
EASING.bounce      // Efectos lúdicos
```

---

## 🚀 Mejores Prácticas

1. **Usa presets cuando sea posible**
   ```tsx
   import { modalPreset } from '@/lib/motion/system';
   ```

2. **Respeta prefers-reduced-motion**
   ```tsx
   variants={respectReducedMotion(fadeVariants)}
   ```

3. **Usa AnimatePresence para exit animations**
   ```tsx
   <AnimatePresence mode="wait">
     {condition && <motion.div exit="exit" />}
   </AnimatePresence>
   ```

4. **Evita animar height directamente, usa scale o max-height**
   ```tsx
   // ❌ Evitar
   animate={{ height: 'auto' }}

   // ✅ Mejor
   variants={collapseVariants}
   ```

5. **Usa stagger para listas**
   ```tsx
   <motion.ul variants={staggerContainerVariants}>
     {items.map(() => (
       <motion.li variants={staggerItemVariants} />
     ))}
   </motion.ul>
   ```

---

## 📚 Referencias

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Material Design 3 Motion](https://m3.material.io/styles/motion/overview)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---

**Happy animating!** ✨
