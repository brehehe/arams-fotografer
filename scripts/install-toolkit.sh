#!/bin/bash

set -e

echo "=============================================="
echo " Antigravity Frontend Design Toolkit"
echo "=============================================="
echo ""

# ---------------------------------------------
# 1. Check Node.js
# ---------------------------------------------

if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js belum terinstall."
    echo "Install Node.js terlebih dahulu."
    exit 1
fi

echo "✓ Node.js: $(node -v)"
echo "✓ npm: $(npm -v)"
echo ""

# ---------------------------------------------
# 2. Check Python
# ---------------------------------------------

if command -v python3 >/dev/null 2>&1; then
    echo "✓ Python: $(python3 --version)"
else
    echo "⚠ Python 3 belum tersedia."
    echo "UI/UX Pro Max membutuhkan Python 3."
    echo ""
fi

echo ""

# ---------------------------------------------
# 3. Install Skills CLI & UI/UX Pro Max CLI
# ---------------------------------------------

echo "📦 Installing Skills & UI/UX Pro Max CLI..."

npm install -g --force skills ui-ux-pro-max-cli

echo "✓ Skills & UI/UX Pro Max CLI installed"
echo ""

# ---------------------------------------------
# 4. Initialize UI/UX Pro Max
# ---------------------------------------------

echo "🧠 Installing UI/UX Pro Max for Antigravity..."

uipro init --ai antigravity

echo "✓ UI/UX Pro Max installed"
echo ""

# ---------------------------------------------
# 5. Core Frontend Design Skills
# ---------------------------------------------

echo "🎨 Installing Frontend Design Skills..."

npx -y skills add guanyang/antigravity-skills \
    --skill frontend-design \
    --skill web-design-guidelines \
    --skill canvas-design \
    --skill vercel-react-best-practices \
    --skill vercel-composition-patterns \
    --agent antigravity

npx -y skills add sickn33/agentic-awesome-skills@tailwind-patterns \
    sickn33/agentic-awesome-skills@mobile-design \
    coreyhaines31/marketingskills@seo-audit \
    --agent antigravity

echo ""
echo "=============================================="
echo " 🎉 INSTALLATION COMPLETE"
echo "=============================================="
echo ""
echo "Installed skills:"
echo "✓ UI/UX Pro Max"
echo "✓ Frontend Design"
echo "✓ Web Design Guidelines"
echo "✓ Tailwind Patterns"
echo "✓ Mobile Design"
echo "✓ SEO Audit"
echo "✓ Accessibility Compliance"
echo "✓ Canvas Design"
echo "✓ React Best Practices"
echo "✓ React Composition Patterns"
echo ""
echo "Done."
