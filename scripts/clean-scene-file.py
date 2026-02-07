#!/usr/bin/env python3
"""
Script para limpiar fragmentos huérfanos en scene-examples.ts
"""

import re
import sys

def clean_scene_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Patrón: busca fragmentos entre "],\n\n" y "CATEGORIA: ["
    # que contienen consequences, duration, etc. huérfanos

    categories = [
        "COTIDIANO", "HUMOR", "DEBATE", "TENSION", "ROMANCE",
        "VULNERABILIDAD", "DESCUBRIMIENTO", "RECONCILIACION",
        "PROACTIVIDAD", "META"
    ]

    # Construir patrón regex para detectar fragmentos huérfanos
    # Patrón: ],\n\n + contenido huérfano + ],\n\n + CATEGORIA: [
    pattern = r'(\],\n\n)(.*?consequences.*?},\s*\},\s*\],\s*\n\n)(\s+(?:' + '|'.join(categories) + r'): \[)'

    # Contar ocurrencias antes
    matches_before = len(re.findall(pattern, content, re.DOTALL))
    print(f"Fragmentos huérfanos encontrados: {matches_before}")

    # Eliminar fragmentos huérfanos
    # Mantener solo el primer cierre y el inicio de categoría
    cleaned_content = re.sub(pattern, r'\1\3', content, flags=re.DOTALL)

    # Contar ocurrencias después
    matches_after = len(re.findall(pattern, cleaned_content, re.DOTALL))
    print(f"Fragmentos restantes: {matches_after}")

    # Guardar archivo limpio
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)

    print(f"✓ Archivo limpiado y guardado: {filepath}")
    return matches_before - matches_after

if __name__ == "__main__":
    filepath = "scripts/generate-scene-catalog/templates/scene-examples.ts"
    removed = clean_scene_file(filepath)
    print(f"\n✅ Se eliminaron {removed} fragmentos huérfanos")
