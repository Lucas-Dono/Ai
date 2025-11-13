#!/bin/bash

# Circuit Prompt AI - Brand Identity Fix Script
# Automatically corrects brand naming inconsistencies across the codebase

set -e

echo "🎨 Circuit Prompt AI - Brand Identity Correction Script"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for changes
changes_made=0

echo "${BLUE}Step 1: Finding files with incorrect branding...${NC}"
echo ""

# Function to replace text in files
replace_in_files() {
    local search_pattern="$1"
    local replace_with="$2"
    local file_pattern="$3"
    local description="$4"

    echo "${YELLOW}Replacing: ${description}${NC}"

    # Find and replace using find and sed
    # Exclude node_modules, .git, build directories
    find . -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/build/*" \
        -not -path "*/dist/*" \
        -not -path "*/.next/*" \
        -not -path "*/coverage/*" \
        $file_pattern \
        -exec grep -l "$search_pattern" {} \; 2>/dev/null | while read -r file; do

        # Make the replacement
        if sed -i.bak "s/$search_pattern/$replace_with/g" "$file" 2>/dev/null; then
            echo "  ${GREEN}✓${NC} Updated: $file"
            rm -f "$file.bak"
            changes_made=$((changes_made + 1))
        else
            echo "  ${RED}✗${NC} Failed: $file"
        fi
    done
}

echo "${BLUE}Step 2: Replacing 'Creador de Inteligencias' with 'Circuit Prompt AI'...${NC}"
replace_in_files \
    "Creador de Inteligencias" \
    "Circuit Prompt AI" \
    "-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.md'" \
    "Spanish generic name → Circuit Prompt AI"

echo ""
echo "${BLUE}Step 3: Replacing 'creador-inteligencias' with 'circuit-prompt-ai'...${NC}"
replace_in_files \
    "creador-inteligencias" \
    "circuit-prompt-ai" \
    "-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.json' -o -name '*.md'" \
    "Slug correction"

echo ""
echo "${BLUE}Step 4: Replacing 'AI Creator Platform' with 'Circuit Prompt AI'...${NC}"
replace_in_files \
    "AI Creator Platform" \
    "Circuit Prompt AI" \
    "-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.md'" \
    "Generic platform name → Circuit Prompt AI"

echo ""
echo "${BLUE}Step 5: Replacing 'AI Creator' with 'Circuit Prompt AI' (in brand context)...${NC}"
# This one is more careful to avoid false positives
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/build/*" \
    -not -path "*/.next/*" \
    \( -name '*.json' \) \
    -exec grep -l '"brand".*"AI Creator"' {} \; 2>/dev/null | while read -r file; do

    sed -i.bak 's/"brand": "AI Creator"/"brand": "Circuit Prompt AI"/g' "$file"
    echo "  ${GREEN}✓${NC} Updated brand in: $file"
    rm -f "$file.bak"
    changes_made=$((changes_made + 1))
done

echo ""
echo "${BLUE}Step 6: Fixing 'CircuitPrompt' (no space) to 'Circuit Prompt'...${NC}"
replace_in_files \
    "CircuitPrompt" \
    "Circuit Prompt" \
    "-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.json'" \
    "Brand name spacing correction"

echo ""
echo "${BLUE}Step 7: Updating email templates...${NC}"
if [ -d "lib/email/templates" ]; then
    find lib/email/templates -type f \( -name '*.ts' -o -name '*.tsx' \) | while read -r file; do
        if grep -q "Creador de Inteligencias\|AI Creator Platform" "$file" 2>/dev/null; then
            sed -i.bak \
                -e 's/Creador de Inteligencias/Circuit Prompt AI/g' \
                -e 's/AI Creator Platform/Circuit Prompt AI/g' \
                "$file"
            echo "  ${GREEN}✓${NC} Updated email template: $file"
            rm -f "$file.bak"
            changes_made=$((changes_made + 1))
        fi
    done
fi

echo ""
echo "${BLUE}Step 8: Updating documentation files...${NC}"
if [ -d "docs" ]; then
    find docs -type f -name '*.md' | while read -r file; do
        if grep -q "Creador de Inteligencias\|AI Creator Platform" "$file" 2>/dev/null; then
            sed -i.bak \
                -e 's/Creador de Inteligencias/Circuit Prompt AI/g' \
                -e 's/AI Creator Platform/Circuit Prompt AI/g' \
                "$file"
            echo "  ${GREEN}✓${NC} Updated documentation: $file"
            rm -f "$file.bak"
            changes_made=$((changes_made + 1))
        fi
    done
fi

echo ""
echo "${BLUE}Step 9: Updating mobile app configuration...${NC}"
if [ -f "mobile/app.json" ]; then
    if grep -q '"name": "mobile"' mobile/app.json 2>/dev/null; then
        sed -i.bak 's/"name": "mobile"/"name": "Circuit Prompt AI"/g' mobile/app.json
        echo "  ${GREEN}✓${NC} Updated mobile app name"
        rm -f mobile/app.json.bak
        changes_made=$((changes_made + 1))
    fi

    if grep -q '"slug": "mobile"' mobile/app.json 2>/dev/null; then
        sed -i.bak 's/"slug": "mobile"/"slug": "circuit-prompt-ai"/g' mobile/app.json
        echo "  ${GREEN}✓${NC} Updated mobile app slug"
        rm -f mobile/app.json.bak
        changes_made=$((changes_made + 1))
    fi
fi

echo ""
echo "${GREEN}======================================================"
echo "✅ Brand Identity Correction Complete!"
echo "======================================================"
echo ""
echo "📊 Summary:"
echo "  - Changes made: ${changes_made} files"
echo ""
echo "🎨 Brand Identity:"
echo "  ✓ Product Name: Circuit Prompt AI"
echo "  ✓ Short Name: Circuit Prompt"
echo "  ✓ Slug: circuit-prompt-ai"
echo ""
echo "${YELLOW}⚠️  Next Steps:${NC}"
echo "  1. Review the changes with: git diff"
echo "  2. Test the application: npm run dev"
echo "  3. Check for any missed references manually"
echo "  4. Update OG images and favicons if needed"
echo "  5. Commit changes: git add . && git commit -m 'fix: Update brand identity to Circuit Prompt AI'"
echo ""
echo "${BLUE}For more information, see:${NC}"
echo "  - docs/brand/BRAND_GUIDELINES.md"
echo "  - docs/brand/DESIGN_SYSTEM.md"
echo ""
