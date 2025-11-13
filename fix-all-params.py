#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Fix Next.js 15 params in a route file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern 1: Fix type signature
    content = re.sub(
        r'\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}',
        r'{ params }: { params: Promise<{ \1: string }> }',
        content
    )

    # Pattern 2: Fix usage: const x = params.id;
    content = re.sub(
        r'const ([a-zA-Z]+) = params\.([a-zA-Z]+);',
        r'const { \2: \1 } = await params;',
        content
    )

    # Pattern 3: Fix usage: const { id } = params;
    content = re.sub(
        r'const \{ ([a-zA-Z]+) \} = params;',
        r'const { \1 } = await params;',
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    count = 0
    for root, dirs, files in os.walk('app/api'):
        if 'nextauth' in root:
            continue
        if '[' not in root:
            continue
        for file in files:
            if file == 'route.ts':
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    print(f"Fixed: {filepath}")
                    count += 1

    print(f"\n✅ Fixed {count} files")

if __name__ == '__main__':
    main()
