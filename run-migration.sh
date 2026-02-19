#!/bin/bash

# ====================================
# Supabase Migration Runner
# ====================================

echo "🚀 Family Finance - Database Migration"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Instructions:${NC}"
echo "1. Open: https://supabase.com/dashboard/project/tzhhilhiheekhcpdexdc/sql/new"
echo "2. Copy the SQL from the file below"
echo "3. Paste it into the SQL Editor"
echo "4. Click 'Run'"
echo ""
echo -e "${YELLOW}📁 SQL Migration File:${NC}"
echo "   /Users/yitzi/Downloads/family-finance-manager/supabase/migrations/20260220000000_advanced_features.sql"
echo ""

# Check if file exists
SQL_FILE="./supabase/migrations/20260220000000_advanced_features.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${YELLOW}⚠️  File not found. Make sure you're in the project directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} File found!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Copy the content below:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat "$SQL_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ After running the SQL, press Enter to continue...${NC}"
read

echo ""
echo "🎉 Great! Now let's add the missing features to the code..."
