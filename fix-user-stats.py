#!/usr/bin/env python3
"""
Script para agregar campos faltantes en los mocks de getUserStats
"""
import re

# Campos que deben estar presentes
REQUIRED_FIELDS = [
    'aisCreated', 'messagesSent', 'voiceChats', 'multimodalChats',
    'worldsCreated', 'behaviorsConfigured', 'importantEvents', 'sharedAIs',
    'totalImports', 'totalLikes', 'currentStreak', 'isEarlyAdopter',
    'postCount', 'commentCount', 'receivedUpvotes', 'acceptedAnswers',
    'createdCommunities', 'researchProjects', 'researchContributions',
    'publishedThemes', 'maxPostUpvotes', 'maxThemeDownloads',
    'isModerator', 'awardsGiven', 'eventsWon'
]

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Encontrar todos los bloques mockResolvedValue que contienen getUserStats
    pattern = r"(vi\.spyOn\(ReputationService, 'getUserStats'\)\.mockResolvedValue\(\{)(.*?)(\}\) as any;)"

    def replace_mock(match):
        prefix = match.group(1)
        body = match.group(2)
        suffix = match.group(3)

        # Extraer campos existentes
        existing_fields = {}
        for line in body.split('\n'):
            line = line.strip()
            if ':' in line:
                field_match = re.match(r'(\w+):\s*(.+?),?$', line)
                if field_match:
                    field_name = field_match.group(1)
                    field_value = field_match.group(2).rstrip(',')
                    existing_fields[field_name] = field_value

        # Crear nuevo body con todos los campos
        new_lines = []
        for field in REQUIRED_FIELDS:
            if field in existing_fields:
                value = existing_fields[field]
            else:
                # Valores por defecto
                if field in ['isModerator', 'isEarlyAdopter']:
                    value = 'false'
                else:
                    value = '0'
            new_lines.append(f"      {field}: {value},")

        new_body = '\n' + '\n'.join(new_lines) + '\n    '
        return prefix + new_body + suffix

    new_content = re.sub(pattern, replace_mock, content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(new_content)

    print(f"✅ Corregido: {filepath}")

# Archivos a corregir
files = [
    '__tests__/integration/community-flow.test.ts',
    '__tests__/lib/services/reputation.service.test.ts'
]

for filepath in files:
    try:
        fix_file(filepath)
    except Exception as e:
        print(f"❌ Error en {filepath}: {e}")

print("\n✅ Todos los archivos corregidos")
