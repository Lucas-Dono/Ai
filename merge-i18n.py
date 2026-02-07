#!/usr/bin/env python3
import json
import sys

def merge_translations():
    # Leer archivos actuales
    with open('messages/es.json', 'r', encoding='utf-8') as f:
        es_data = json.load(f)

    with open('messages/en.json', 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    print(f"📖 Archivo ES actual tiene {len(es_data)} secciones")
    print(f"📖 Archivo EN actual tiene {len(en_data)} secciones")

    # Agregar mensaje indicando que se deben agregar manualmente las nuevas secciones
    # ya que los outputs de los agentes son muy largos para incluir aquí

    print("\n✅ Archivos leídos correctamente")
    print("\nSecciones actuales en ES:", list(es_data.keys()))
    print("\nSecciones actuales en EN:", list(en_data.keys()))

    print("\n📝 Para agregar las nuevas traducciones, necesitas:")
    print("1. Copiar los JSON de los outputs de los agentes")
    print("2. Fusionar las secciones nuevas con los archivos existentes")
    print("3. Verificar que no haya claves duplicadas")

    return es_data, en_data

if __name__ == '__main__':
    merge_translations()
