#!/usr/bin/env python3

import re

# Leer archivos
with open('lib/minecraft/component-generator.ts', 'r', encoding='utf-8') as f:
    component_content = f.read()

with open('lib/minecraft/hairstyles-library.ts', 'r', encoding='utf-8') as f:
    hairlib_content = f.read()

with open('/tmp/undercut-head.txt', 'r', encoding='utf-8') as f:
    head_new = f.read()

with open('/tmp/undercut-hat.txt', 'r', encoding='utf-8') as f:
    hat_new = f.read()

# === Reemplazar generateHead_Base_01 en component-generator.ts ===
head_pattern = r'(/\*\*\s*\n\s*\* Genera sprite de cabeza base - Todas las caras[\s\S]*?^\})'

match = re.search(head_pattern, component_content, re.MULTILINE)
if match:
    component_content = component_content[:match.start()] + head_new.strip() + '\n' + component_content[match.end():]
    print('✅ generateHead_Base_01 reemplazada')
else:
    print('❌ No se encontró generateHead_Base_01')
    exit(1)

# === Reemplazar generateHairShort_06_Undercut en hairstyles-library.ts ===
hat_pattern = r'(/\*\*\s*\n\s*\* Genera sprite de pelo corto - Tipo 6: Undercut[\s\S]*?^\})'

match = re.search(hat_pattern, hairlib_content, re.MULTILINE)
if match:
    hairlib_content = hairlib_content[:match.start()] + hat_new.strip() + '\n' + hairlib_content[match.end():]
    print('✅ generateHairShort_06_Undercut reemplazada')
else:
    print('❌ No se encontró generateHairShort_06_Undercut')
    exit(1)

# Guardar
with open('lib/minecraft/component-generator.ts', 'w', encoding='utf-8') as f:
    f.write(component_content)

with open('lib/minecraft/hairstyles-library.ts', 'w', encoding='utf-8') as f:
    f.write(hairlib_content)

print('\n✅ Ambos archivos guardados exitosamente')
