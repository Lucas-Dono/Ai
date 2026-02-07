# Sistema de Colores para Skins de Minecraft

## 🎨 Cómo Funciona el Recoloreo

El sistema usa **mapeo de luminosidad** para preservar automáticamente las sombras y highlights:

### Principio Básico

1. **Los componentes SVG están en escala de grises** (#808080, #404040, etc.)
2. **La función `recolorImage()` mapea la luminosidad al color target**
3. **Las sombras se preservan automáticamente**

### Ejemplo Visual

```
Componente Original (Grises):
  Sombra:    #404040  (gris oscuro)
  Base:      #808080  (gris medio)
  Highlight: #C0C0C0  (gris claro)

Color Target: #FF0000 (rojo)

Resultado Final:
  Sombra:    #640000  (rojo oscuro - sombra preservada)
  Base:      #FF0000  (rojo - color base)
  Highlight: #FF6666  (rojo claro - highlight preservado)
```

---

## 🎨 Uso Básico

### 1. Importar Paletas

```typescript
import {
  SKIN_TONES,
  EYE_COLORS,
  HAIR_COLORS,
  CLOTHING_COLORS
} from '@/lib/minecraft/color-palettes';
```

### 2. Crear una Skin con Colores Personalizados

```typescript
import { assembleSkin } from '@/lib/minecraft/skin-assembler';

const buffer = await assembleSkin({
  bodyGenes: { /* ... */ },
  facialGenes: { /* ... */ },
  components: {
    eyes: 'eyes_03',
    mouth: 'mouth_01',
    torso: 'torso_average_01',
    arms: 'arms_slim_01',
    legs: 'legs_average_01',
    hairFront: 'hair_short_02_bob',
    shirt: 'shirt_01',
  },
  colors: {
    skinTone: SKIN_TONES.BROWN,           // Piel marrón
    hairPrimary: HAIR_COLORS.PINK,        // Pelo rosa
    eyeColor: EYE_COLORS.VIOLET,          // Ojos violeta
    clothingPrimary: CLOTHING_COLORS.CYAN, // Ropa cyan
  },
  style: 'pixel',
  version: 1,
  generatedAt: new Date().toISOString(),
}, componentsDir);
```

---

## 📚 Paletas Disponibles

### Tonos de Piel (15 opciones)

```typescript
SKIN_TONES = {
  // Claros
  PALE: '#F5E6D3',
  FAIR: '#F0D5BE',
  LIGHT_BEIGE: '#E8C8A8',

  // Medios
  BEIGE: '#D4A574',
  TAN: '#C68642',
  OLIVE: '#B08956',

  // Oscuros
  BROWN: '#8D5524',
  DARK_BROWN: '#6B4423',
  DEEP_BROWN: '#4A2F1A',

  // Mestizos
  LIGHT_TAN: '#D9A066',
  MEDIUM_BROWN: '#9D6B3F',
  CARAMEL: '#B07D4F',

  // Especiales
  PORCELAIN: '#FFF0E1',
  SAND: '#E0C097',
  ESPRESSO: '#5C3317',
}
```

### Colores de Ojos (20+ opciones)

```typescript
EYE_COLORS = {
  // Marrones
  DARK_BROWN: '#2C1810',
  BROWN: '#5C3317',
  LIGHT_BROWN: '#8B6508',
  AMBER: '#C87137',
  HAZEL: '#8E6F3E',

  // Azules
  DARK_BLUE: '#1C3A5E',
  BLUE: '#4169E1',
  LIGHT_BLUE: '#6FA8DC',
  SKY_BLUE: '#87CEEB',
  ICE_BLUE: '#B0E0E6',

  // Verdes
  DARK_GREEN: '#228B22',
  GREEN: '#32CD32',
  LIGHT_GREEN: '#90EE90',
  EMERALD: '#50C878',
  JADE: '#00A86B',

  // Grises
  GRAY: '#808080',
  LIGHT_GRAY: '#A9A9A9',
  SILVER: '#C0C0C0',

  // Especiales
  VIOLET: '#8B00FF',
  RED: '#DC143C',
  YELLOW: '#FFD700',
  TURQUOISE: '#40E0D0',
}
```

### Colores de Pelo (30+ opciones)

```typescript
HAIR_COLORS = {
  // Negros
  BLACK: '#0A0A0A',
  JET_BLACK: '#000000',
  CHARCOAL: '#1C1C1C',

  // Marrones
  DARK_BROWN: '#3D2817',
  BROWN: '#5C4033',
  LIGHT_BROWN: '#8B6F47',
  CHESTNUT: '#825736',

  // Rubios
  PLATINUM_BLONDE: '#E5E4E2',
  BLONDE: '#F4E4C1',
  GOLDEN_BLONDE: '#E6C35C',
  SANDY_BLONDE: '#D4C4A8',
  STRAWBERRY_BLONDE: '#E5AA70',

  // Rojos
  AUBURN: '#A52A2A',
  RED: '#C1440E',
  GINGER: '#D2691E',
  COPPER: '#B87333',

  // Grises y blancos
  SALT_AND_PEPPER: '#6E6E6E',
  GRAY: '#808080',
  SILVER: '#C0C0C0',
  WHITE: '#F5F5F5',

  // Colores fantasía
  PINK: '#FF69B4',
  PURPLE: '#9370DB',
  BLUE: '#4169E1',
  GREEN: '#32CD32',
  RAINBOW: '#FF00FF',  // Para efectos especiales
  CYAN: '#00CED1',
  MAGENTA: '#FF00FF',
  MINT: '#98FF98',
  LAVENDER: '#E6E6FA',
  ROSE_GOLD: '#B76E79',
}
```

### Colores de Ropa (40+ opciones)

```typescript
CLOTHING_COLORS = {
  // Básicos
  BLACK: '#1A1A1A',
  WHITE: '#F5F5F5',
  GRAY: '#808080',

  // Rojos
  RED: '#DC143C',
  DARK_RED: '#8B0000',
  CRIMSON: '#DC143C',
  BURGUNDY: '#800020',

  // Azules
  NAVY: '#000080',
  BLUE: '#0000FF',
  ROYAL_BLUE: '#4169E1',
  SKY_BLUE: '#87CEEB',
  CYAN: '#00CED1',

  // Verdes
  DARK_GREEN: '#006400',
  GREEN: '#008000',
  LIME: '#32CD32',
  MINT: '#98FF98',
  OLIVE: '#556B2F',

  // Y muchos más...
}
```

---

## 🎭 Paletas Predefinidas Completas

Para facilitar el uso, hay **10 paletas completas** listas para usar:

```typescript
import { PRESET_PALETTES } from '@/lib/minecraft/color-palettes';

// Usar una paleta predefinida
const config = {
  /* ... */
  colors: {
    skinTone: PRESET_PALETTES.CLASSIC_STEVE.skinTone,
    hairColor: PRESET_PALETTES.CLASSIC_STEVE.hairColor,
    eyeColor: PRESET_PALETTES.CLASSIC_STEVE.eyeColor,
    clothingPrimary: PRESET_PALETTES.CLASSIC_STEVE.clothingPrimary,
    clothingSecondary: PRESET_PALETTES.CLASSIC_STEVE.clothingSecondary,
  },
};
```

### Paletas Disponibles:

1. **CLASSIC_STEVE** - Steve clásico de Minecraft
2. **CLASSIC_ALEX** - Alex clásica de Minecraft
3. **DARK_KNIGHT** - Estilo gótico con tonos oscuros
4. **FOREST_ELF** - Tonos naturales verdes
5. **FIRE_MAGE** - Tonos cálidos de fuego
6. **ICE_QUEEN** - Tonos fríos de hielo
7. **PASTEL_KAWAII** - Colores pastel suaves
8. **RAINBOW_PUNK** - Colores vibrantes y rebeldes
9. **DESERT_WARRIOR** - Tonos cálidos del desierto
10. **ARCTIC_EXPLORER** - Tonos fríos de nieve

---

## 🔧 Funciones Utilitarias

### Generar Variaciones de Color Automáticamente

```typescript
import { generateColorVariations } from '@/lib/minecraft/color-palettes';

const variations = generateColorVariations('#FF0000');
// {
//   base: '#FF0000',
//   shadow: '#B20000',      // 30% más oscuro
//   highlight: '#FF4D4D',   // 30% más claro
// }
```

### Oscurecer/Aclarar Colores Manualmente

```typescript
import { darkenColor, lightenColor } from '@/lib/minecraft/color-palettes';

const shadow = darkenColor('#FF0000', 0.7);    // 30% más oscuro
const highlight = lightenColor('#FF0000', 1.3); // 30% más claro
```

---

## 📁 Estructura de Archivos

```
lib/minecraft/
├── color-palettes.ts       # Paletas de colores predefinidas
├── skin-assembler.ts        # Ensamblador con recoloreo
└── component-generator.ts   # Generadores de componentes SVG

scripts/
└── showcase-color-palettes.ts  # Script de demostración

public/minecraft/
├── components/              # Componentes en escala de grises
│   ├── eyes/
│   ├── mouth/
│   ├── hair_front/
│   ├── shirt/
│   └── ...
└── color-showcase/          # 34 ejemplos generados
    ├── classic_steve.png
    ├── ice_queen.png
    ├── pelo_pink.png
    └── ...
```

---

## 🖼️ Ver Ejemplos Generados

Ejecuta el showcase para ver 34 skins con diferentes colores:

```bash
npx tsx scripts/showcase-color-palettes.ts
```

Las skins se generan en: `public/minecraft/color-showcase/`

### Ejemplos Incluidos:

- **10 paletas predefinidas** (Steve, Alex, Caballero Oscuro, etc.)
- **5 tonos de piel** (Pale, Beige, Tan, Brown, Dark Brown)
- **5 colores de ojos** (Brown, Blue, Green, Amber, Violet)
- **8 colores de pelo** (Black, Brown, Blonde, Red, Pink, Blue, Purple, Green)
- **6 colores de ropa** (Red, Blue, Green, Purple, Pink, Black)

---

## 💡 Tips y Trucos

### 1. Colores Personalizados

Puedes usar **cualquier color hexadecimal**:

```typescript
colors: {
  skinTone: '#A67C52',      // Color personalizado
  hairPrimary: '#9B59B6',   // Cualquier hex
  eyeColor: '#1ABC9C',
  clothingPrimary: '#E74C3C',
}
```

### 2. Las Sombras se Preservan Automáticamente

No necesitas especificar colores de sombra/highlight. El sistema los calcula automáticamente basándose en la luminosidad del gris original.

### 3. Colores Vibrantes Funcionan Perfectamente

Puedes usar colores muy saturados (como rosa neón, cyan brillante, etc.) y las sombras seguirán viéndose bien.

### 4. Múltiples Componentes Usan el Mismo Color

Por ejemplo, si especificas `hairPrimary: '#FF69B4'`, TODOS los componentes de pelo (hairFront, hairBody, hairBack, facialHair) usarán ese color con sus sombras preservadas.

---

## 🎯 Casos de Uso

### Generador de Avatares para Usuarios

```typescript
// Permitir al usuario elegir colores
const userChoices = {
  skinTone: req.body.skinTone,        // Del selector de color
  hairColor: req.body.hairColor,
  eyeColor: req.body.eyeColor,
  clothingColor: req.body.clothingColor,
};

const skin = await assembleSkin({
  /* ... */
  colors: {
    skinTone: userChoices.skinTone,
    hairPrimary: userChoices.hairColor,
    eyeColor: userChoices.eyeColor,
    clothingPrimary: userChoices.clothingColor,
  },
}, componentsDir);
```

### Generación Aleatoria

```typescript
const randomSkin = await assembleSkin({
  /* ... */
  colors: {
    skinTone: Object.values(SKIN_TONES)[Math.floor(Math.random() * 15)],
    hairPrimary: Object.values(HAIR_COLORS)[Math.floor(Math.random() * 30)],
    eyeColor: Object.values(EYE_COLORS)[Math.floor(Math.random() * 20)],
    clothingPrimary: Object.values(CLOTHING_COLORS)[Math.floor(Math.random() * 40)],
  },
}, componentsDir);
```

### Tema Dinámico

```typescript
// Cambiar colores según la hora del día, evento, etc.
const isNightTime = new Date().getHours() >= 20;

const colors = isNightTime
  ? PRESET_PALETTES.DARK_KNIGHT  // Colores oscuros de noche
  : PRESET_PALETTES.CLASSIC_STEVE; // Colores normales de día
```

---

## ⚠️ Notas Importantes

1. **Los componentes SVG DEBEN usar escala de grises** (#808080, #404040, etc.) con clases `colorizable-*`
2. **El recoloreo funciona SOLO con píxeles grises** (R ≈ G ≈ B con tolerancia de ±10)
3. **Píxeles blancos (#FFFFFF) y negros (#000000) NO se recolorean** (útil para detalles)
4. **Las sombras se calculan automáticamente**, no necesitas especificarlas

---

## 📖 Más Información

- Ver implementación completa en: `lib/minecraft/skin-assembler.ts`
- Ver paletas disponibles en: `lib/minecraft/color-palettes.ts`
- Ver ejemplos en: `public/minecraft/color-showcase/`
