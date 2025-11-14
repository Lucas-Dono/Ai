#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_page_file(filepath):
    """Fix Next.js 15 params in a page file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern 1: Fix interface/type definition
    # params: { id: string } -> params: Promise<{ id: string }>
    content = re.sub(
        r'params:\s*\{\s*([^}]+)\s*\};',
        r'params: Promise<{\1}>;',
        content
    )

    # Pattern 2: Fix usage in function body
    # const { id } = params; -> const { id } = await params;
    # But only if not already awaited
    content = re.sub(
        r'const\s+\{([^}]+)\}\s+=\s+params;',
        r'const {\1} = await params;',
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    count = 0
    for root, dirs, files in os.walk('app'):
        if '[' not in root:
            continue
        for file in files:
            if file == 'page.tsx':
                filepath = os.path.join(root, file)
                if fix_page_file(filepath):
                    print(f"Fixed: {filepath}")
                    count += 1

    print(f"\n✅ Fixed {count} page files")

if __name__ == '__main__':
    main()
