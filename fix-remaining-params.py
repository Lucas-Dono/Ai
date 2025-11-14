#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_file(filepath):
    """Fix remaining Next.js 15 params usage"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern: params.id or params.userId etc (direct access without await)
    # Only fix if params is Promise type in signature
    if 'params: Promise<{' in content:
        # Fix direct access like: params.id
        content = re.sub(
            r'\bparams\.(\w+)\b',
            r'(await params).\1',
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
        for file in files:
            if file == 'route.ts':
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    print(f"Fixed: {filepath}")
                    count += 1

    print(f"\n✅ Fixed {count} files")

if __name__ == '__main__':
    main()
