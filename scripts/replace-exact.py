#!/usr/bin/env python3

import re

# Leer archivos
with open('lib/minecraft/component-generator.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('/tmp/head-only.txt', 'r', encoding='utf-8') as f:
    head_new = f.read()

with open('/tmp/hat-only.txt', 'r', encoding='utf-8') as f:
    hat_new = f.read()

# === Reemplazar generateHead_Base_01 ===
# Patrón que captura desde el comentario hasta el cierre de la función
head_pattern = r'(/\*\*\s*\n\s*\* Genera sprite de cabeza base - Todas las caras\s*\n\s*\* Se recolorea con skinTone\s*\n\s*\*/\s*\nexport function generateHead_Base_01\(\): string \{[\s\S]*?^\})'

match = re.search(head_pattern, content, re.MULTILINE)
if match:
    content = content[:match.start()] + head_new.strip() + '\n' + content[match.end():]
    print('✅ generateHead_Base_01 reemplazada')
else:
    print('❌ No se encontró generateHead_Base_01')
    exit(1)

# === Reemplazar generateHairShort_02_BobCut ===
hat_pattern = r'(/\*\*\s*\n\s*\* Genera sprite de pelo corto - Tipo 2: Bob Cut[\s\S]*?^\})'

match = re.search(hat_pattern, content, re.MULTILINE)
if match:
    content = content[:match.start()] + hat_new.strip() + '\n' + content[match.end():]
    print('✅ generateHairShort_02_BobCut reemplazada')
else:
    print('❌ No se encontró generateHairShort_02_BobCut')
    exit(1)

# Guardar
with open('lib/minecraft/component-generator.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ Archivo guardado exitosamente')
