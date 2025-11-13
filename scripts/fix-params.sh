#!/bin/bash

# Fix Next.js 15 params API
echo "🔧 Fixing Next.js 15 params API..."

# Find all route files with dynamic segments
routes=$(find app/api -type f -name "route.ts" -path "*\[*\]*")

count=0
for file in $routes; do
  # Skip auth routes (they use [...nextauth])
  if [[ $file == *"[...nextauth]"* ]]; then
    continue
  fi

  # Check if file needs fixing (has old params pattern)
  if grep -q "{ params }: { params: { [a-zA-Z]*: string" "$file"; then
    echo "Fixing: $file"

    # Use perl for multi-line regex
    perl -i -0pe 's/\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/{ params }: { params: Promise<{ $1: string }> }/g' "$file"
    perl -i -pe 's/const ([a-zA-Z]+) = params\.([a-zA-Z]+);/const { $2: $1 } = await params;/g' "$file"
    perl -i -pe 's/const \{ ([a-zA-Z]+) \} = params;/const { $1 } = await params;/g' "$file"

    ((count++))
  fi
done

echo "✅ Fixed $count files"
