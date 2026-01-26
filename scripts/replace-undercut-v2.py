#!/usr/bin/env python3

import re

# Leer archivos
with open('lib/minecraft/component-generator.ts', 'r', encoding='utf-8') as f:
    component_content = f.read()

with open('lib/minecraft/hairstyles-library.ts', 'r', encoding='utf-8') as f:
    hairlib_content = f.read()

with open('/tmp/undercut-code.txt', 'r', encoding='utf-8') as f:
    full_generated = f.read()

# Extraer HEAD de la salida generada (desde inicio hasta antes de la segunda función)
head_match = re.search(r'(/\*\*\s*\n\s*\* Genera sprite de cabeza base.*?^\})', full_generated, re.MULTILINE | re.DOTALL)
if not head_match:
    print('❌ No se encontró función HEAD en código generado')
    exit(1)

head_new = head_match.group(1)

# Extraer HAT de la salida generada (segunda función)
hat_match = re.search(r'(/\*\*\s*\n\s*\* Genera sprite de pelo corto - Tipo 2.*?^\})', full_generated, re.MULTILINE | re.DOTALL)
if not hat_match:
    print('❌ No se encontró función HAT en código generado')
    exit(1)

hat_new = hat_match.group(1)

# === Reemplazar generateHead_Base_01 en component-generator.ts ===
# Patrón más específico que solo captura hasta el primer cierre de función
head_pattern = r'(/\*\*\s*\n\s*\* Genera sprite de cabeza base - Todas las caras\s*\n\s*\* Se recolorea con skinTone\s*\n\s*\*/\s*\nexport function generateHead_Base_01\(\): string \{[\s\S]*?^  \`;\s*\n^\})'

match = re.search(head_pattern, component_content, re.MULTILINE)
if match:
    component_content = component_content[:match.start()] + head_new.strip() + '\n' + component_content[match.end():]
    print('✅ generateHead_Base_01 reemplazada')
else:
    print('❌ No se encontró generateHead_Base_01')
    exit(1)

# === Reemplazar generateHairShort_06_Undercut en hairstyles-library.ts ===
# Buscar el comentario "Tipo 6" específicamente
hat_pattern = r'(/\*\*\s*\n\s*\* Genera sprite de pelo corto - Tipo 6: Undercut[\s\S]*?^export function generateHairShort_06_Undercut[\s\S]*?^  \`;\s*\n^\})'

match = re.search(hat_pattern, hairlib_content, re.MULTILINE)
if match:
    # Limpiar el código generado antes de insertar
    # Reemplazar "Tipo 2: Bob Cut" por "Tipo 6: Undercut"
    hat_new_fixed = re.sub(
        r'Tipo 2: Bob Cut',
        'Tipo 6: Undercut',
        hat_new
    )
    # Reemplazar nombre de función
    hat_new_fixed = re.sub(
        r'export function generateHairShort_02_BobCut',
        'export function generateHairShort_06_Undercut',
        hat_new_fixed
    )

    hairlib_content = hairlib_content[:match.start()] + hat_new_fixed.strip() + '\n' + hairlib_content[match.end():]
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
