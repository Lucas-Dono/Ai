#!/bin/bash

# Mobile Responsiveness Check Script
# Verifies that all mobile optimizations are in place

echo "🔍 Checking Mobile Responsiveness Implementation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
checks=0
passed=0

# Function to check file exists
check_file() {
    ((checks++))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

# Function to check pattern in file
check_pattern() {
    ((checks++))
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        return 1
    fi
}

echo "📱 Mobile Components:"
check_file "components/mobile/MobileNav.tsx" "MobileNav component exists"
check_file "components/mobile/MobileHeader.tsx" "MobileHeader component exists"
check_file "components/mobile/BottomSheet.tsx" "BottomSheet component exists"
check_file "components/mobile/index.ts" "Mobile components index exists"
echo ""

echo "📄 Core Layouts:"
check_pattern "app/layout.tsx" "viewport" "Root layout has viewport meta tag"
check_pattern "app/layout.tsx" "overflow-x-hidden" "Root layout prevents horizontal scroll"
check_pattern "app/dashboard/layout.tsx" "MobileNav" "Dashboard has MobileNav"
check_pattern "app/dashboard/layout.tsx" "MobileHeader" "Dashboard has MobileHeader"
check_pattern "app/dashboard/layout.tsx" "pb-20 lg:pb-8" "Dashboard has bottom padding for mobile nav"
echo ""

echo "🎨 CSS Utilities:"
check_pattern "app/globals.css" "safe-area-inset-top" "Safe area top utility exists"
check_pattern "app/globals.css" "safe-area-inset-bottom" "Safe area bottom utility exists"
check_pattern "app/globals.css" "touch-target" "Touch target utility exists"
check_pattern "app/globals.css" "scrollbar-hide" "Scrollbar hide utility exists"
check_pattern "app/globals.css" "animate-blob" "Blob animation exists"
echo ""

echo "🔧 Key Pages:"
check_file "app/dashboard/page.tsx" "Dashboard page exists"
check_file "app/community/page.tsx" "Community page exists"
check_file "app/agentes/[id]/page.tsx" "Agent chat page exists"
check_file "app/mobile-test/page.tsx" "Mobile test page exists"
echo ""

echo "📱 Responsive Patterns:"
check_pattern "components/dashboard-nav.tsx" "hidden lg:flex" "Dashboard nav hidden on mobile"
check_pattern "components/chat/v2/ChatHeader.tsx" "min-h-\[44px\]" "Chat header has touch-friendly buttons"
check_pattern "app/dashboard/page.tsx" "text-2xl md:text-3xl lg:text-4xl" "Dashboard has responsive typography"
check_pattern "app/community/page.tsx" "pb-20 lg:pb-0" "Community has bottom padding for mobile nav"
echo ""

echo "📚 Documentation:"
check_file "MOBILE_RESPONSIVENESS_REPORT.md" "Mobile responsiveness report exists"
check_file "MOBILE_QUICK_GUIDE.md" "Mobile quick guide exists"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "📊 Results: ${GREEN}${passed}${NC}/${checks} checks passed"

if [ $passed -eq $checks ]; then
    echo -e "${GREEN}✨ All mobile responsiveness checks passed!${NC}"
    echo ""
    echo "🎯 Next Steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Visit: http://localhost:3000/mobile-test"
    echo "  3. Test on mobile devices (F12 → Toggle Device Toolbar)"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed. Review the output above.${NC}"
    echo ""
    exit 1
fi
