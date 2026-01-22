#!/bin/bash

# Deployment Pre-flight Check Script
# Run this before deploying to verify everything is ready

echo "🚀 IGC AI Dashboard - Deployment Pre-flight Check"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Check 1: Repository root
echo "📁 Checking repository structure..."
if [ ! -f "netlify.toml" ]; then
    echo -e "${RED}✗ netlify.toml not found at repository root${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ netlify.toml found${NC}"
fi

if [ ! -f "vercel.json" ]; then
    echo -e "${YELLOW}⚠ vercel.json not found (optional)${NC}"
else
    echo -e "${GREEN}✓ vercel.json found${NC}"
fi

if [ ! -f ".github/workflows/deploy.yml" ]; then
    echo -e "${YELLOW}⚠ GitHub Actions workflow not found (optional)${NC}"
else
    echo -e "${GREEN}✓ GitHub Actions workflow found${NC}"
fi

echo ""

# Check 2: Data files
echo "📊 Checking data files..."
DATA_DIR="insight-hub/public/data"

if [ ! -d "$DATA_DIR" ]; then
    echo -e "${RED}✗ Data directory not found: $DATA_DIR${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ Data directory exists${NC}"
    
    for file in articles.json kpis.json trends.json insights.json; do
        if [ ! -f "$DATA_DIR/$file" ]; then
            echo -e "${RED}✗ Missing: $file${NC}"
            ERRORS=$((ERRORS + 1))
        else
            SIZE=$(du -h "$DATA_DIR/$file" | cut -f1)
            echo -e "${GREEN}✓ $file ($SIZE)${NC}"
        fi
    done
fi

echo ""

# Check 3: Dependencies
echo "📦 Checking dependencies..."
cd insight-hub

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found - run 'npm install'${NC}"
else
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

cd ..
echo ""

# Check 4: Build test
echo "🔨 Testing production build..."
cd insight-hub

if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "${GREEN}✓ Build output: $DIST_SIZE${NC}"
    fi
else
    echo -e "${RED}✗ Build failed - check /tmp/build.log for details${NC}"
    ERRORS=$((ERRORS + 1))
fi

cd ..
echo ""

# Check 5: Git status
echo "🔍 Checking Git status..."
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo -e "${YELLOW}⚠ You have $UNCOMMITTED uncommitted changes${NC}"
        echo "  Run 'git status' to see them"
    else
        echo -e "${GREEN}✓ Working directory clean${NC}"
    fi
    
    # Check if on main branch
    BRANCH=$(git branch --show-current)
    if [ "$BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠ Currently on branch: $BRANCH (consider switching to main)${NC}"
    else
        echo -e "${GREEN}✓ On main branch${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Not a git repository${NC}"
fi

echo ""
echo "=================================================="

# Summary
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Deploy commands:"
    echo "  Netlify: netlify deploy --prod"
    echo "  Vercel:  vercel --prod"
    echo "  GitHub:  git push origin main"
else
    echo -e "${RED}❌ Found $ERRORS error(s). Please fix before deploying.${NC}"
    exit 1
fi
