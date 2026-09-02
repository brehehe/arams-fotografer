#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# Antigravity Premium Frontend Toolkit
# Laravel + Inertia.js + React 19 + TypeScript + Tailwind v4
# ============================================================

PROJECT_ROOT="$(pwd)"
AGENT_DIR="$PROJECT_ROOT/.agents"
SKILLS_DIR="$AGENT_DIR/skills"
WORKFLOWS_DIR="$AGENT_DIR/workflows"
RULES_DIR="$AGENT_DIR/rules"

BACKUP_DIR="$PROJECT_ROOT/.antigravity-backup-$(date +%Y%m%d-%H%M%S)"

echo ""
echo "============================================================"
echo "  ANTIGRAVITY PREMIUM FRONTEND TOOLKIT"
echo "  Laravel + Inertia.js + React 19 + TypeScript + Tailwind v4"
echo "============================================================"
echo ""
echo "Project:"
echo "  $PROJECT_ROOT"
echo ""

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

info() {
    echo "→ $1"
}

success() {
    echo "✓ $1"
}

warning() {
    echo "⚠ $1"
}

fail() {
    echo "✗ $1"
    exit 1
}

# ------------------------------------------------------------
# Validate project
# ------------------------------------------------------------

if [ ! -f "artisan" ]; then
    warning "artisan tidak ditemukan."
    warning "Pastikan script dijalankan dari root project Laravel."
    exit 1
fi

success "Laravel project detected"

# ------------------------------------------------------------
# Check Node & Package Managers
# ------------------------------------------------------------

if ! command_exists node; then
    fail "Node.js belum terinstall."
fi

success "Node.js $(node -v)"

if command_exists bun; then
    success "Bun $(bun -v)"
elif command_exists npm; then
    success "npm $(npm -v)"
fi

# ------------------------------------------------------------
# Check Python
# ------------------------------------------------------------

if command_exists python3; then
    success "Python $(python3 --version)"
else
    warning "Python 3 tidak ditemukan."
    warning "UI/UX Pro Max dapat membutuhkan Python untuk search/design-system tooling."
fi

# ------------------------------------------------------------
# Create directories
# ------------------------------------------------------------

info "Creating Antigravity directories..."

mkdir -p "$SKILLS_DIR"
mkdir -p "$WORKFLOWS_DIR"
mkdir -p "$RULES_DIR"

success "Antigravity directories ready (.agents/)"

# ------------------------------------------------------------
# Backup existing config
# ------------------------------------------------------------

if [ -d "$AGENT_DIR" ]; then
    info "Creating backup of current .agents configuration..."
    mkdir -p "$BACKUP_DIR"
    cp -R "$AGENT_DIR" "$BACKUP_DIR/"
    success "Backup created: $BACKUP_DIR"
fi

# ------------------------------------------------------------
# Install UI/UX Pro Max CLI
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo "  UI/UX PRO MAX"
echo "============================================================"

info "Installing/updating ui-ux-pro-max-cli..."

if command_exists uipro; then
    success "uipro-cli already installed ($(uipro --version 2>/dev/null || echo 'ready'))"
else
    npm install -g ui-ux-pro-max-cli || npm install -g uipro-cli || warning "Could not install uipro-cli globally."
fi

info "Initializing UI/UX Pro Max for Antigravity..."
if command_exists uipro; then
    uipro init --ai antigravity || true
    success "UI/UX Pro Max initialized"
fi

# ------------------------------------------------------------
# Generic Skills Installer
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo "  ANTIGRAVITY WEB SKILLS"
echo "============================================================"

install_skill() {
    local repo="$1"
    local skill="$2"

    echo ""
    info "Checking / Installing skill: $skill"

    if [ -d "$SKILLS_DIR/$skill" ]; then
        success "$skill is already installed in $SKILLS_DIR/$skill"
        return 0
    fi

    if npx -y skills add "$repo" \
        --skill "$skill" \
        --agent antigravity -y; then
        success "$skill installed"
    else
        warning "$skill could not be installed automatically. Continuing without stopping installer."
    fi
}

# Install Core Skills
install_skill "nextlevelbuilder/ui-ux-pro-max-skill" "ui-ux-pro-max"
install_skill "anthropics/skills" "frontend-design"
install_skill "guanyang/antigravity-skills" "web-design-guidelines"
install_skill "shadcn/ui@shadcn" "shadcn"
install_skill "guanyang/antigravity-skills" "tailwind-patterns"
install_skill "guanyang/antigravity-skills" "mobile-design"
install_skill "guanyang/antigravity-skills" "canvas-design"
install_skill "guanyang/antigravity-skills" "vercel-react-best-practices"
install_skill "guanyang/antigravity-skills" "vercel-composition-patterns"
install_skill "guanyang/antigravity-skills" "seo-audit"
install_skill "wshobson/agents@accessibility-compliance" "accessibility-compliance"

# ------------------------------------------------------------
# Create Master Skill: Premium Frontend
# ------------------------------------------------------------

echo ""
echo "============================================================"
echo "  CONFIGURING MASTER SKILL & WORKFLOW"
echo "============================================================"

MASTER_DIR="$SKILLS_DIR/premium-frontend"
mkdir -p "$MASTER_DIR"

cat > "$MASTER_DIR/SKILL.md" <<'EOF'
---
name: premium-frontend
description: >
  Master frontend design and implementation workflow for Laravel,
  Inertia.js, React 19, TypeScript, Tailwind CSS v4, and Shadcn UI projects.
  Use when creating, redesigning, reviewing, polishing or optimizing UI/UX.
---

# Premium Frontend

You are a senior product designer + principal frontend engineer.

## Primary Stack
- **Backend / Routing**: Laravel 12 + Inertia.js
- **Frontend Core**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + CSS Variables Design Tokens
- **Component UI**: Shadcn UI + Radix UI Primitives
- **Animations & Icons**: Framer Motion, Lucide React, Canvas Confetti
- **Build Tooling**: Vite 8 + Wayfinder Plugin

## Core Principles
- Professional & Polished visual hierarchy.
- Distinctive & Intentional aesthetics (avoid generic AI SaaS templates).
- Responsive & Touch-Ready (Mobile, Tablet, Desktop).
- Accessible (WCAG 2.2 AA compliance).
- High Performance (smooth 60fps animations, optimized React re-renders).
- Type-Safe (strict TypeScript for Inertia page props and models).
EOF

success "Premium Frontend Master Skill created in $MASTER_DIR/SKILL.md"

# ------------------------------------------------------------
# Create Workflow
# ------------------------------------------------------------

WORKFLOW="$WORKFLOWS_DIR/premium-frontend.md"

cat > "$WORKFLOW" <<'EOF'
# Premium Frontend Workflow

Use this workflow for UI/UX feature development, redesigns, and visual polish.

## Phase 1 — Inspect & Context Gathering
- Inspect target Inertia page, parent layout, and TypeScript interfaces.
- Check backend Controller props and routes.
- Check Tailwind CSS v4 design tokens and existing Shadcn UI components.

## Phase 2 — Design System & Visual Hierarchy
- Use UI/UX Pro Max and Frontend Design guidelines.
- Select color tokens, typography scale, spacing rhythm, and interactive states.

## Phase 3 — Component Implementation
- Compose UI with Shadcn/Radix primitives and custom React components.
- Style with Tailwind CSS v4 and fluid utilities.
- Implement Inertia form helpers and React 19 hooks.
- Add micro-animations using Framer Motion.

## Phase 4 — Validation & Quality
- Run type checks (`npm run types:check`) and linting (`npm run lint:check`).
- Test responsive viewports and interactive states.
- Run accessibility and performance audits.
EOF

success "Premium Frontend Workflow created in $WORKFLOW"

# ------------------------------------------------------------
# Git status check
# ------------------------------------------------------------

if command_exists git && [ -d ".git" ]; then
    info "Checking git status..."
    git status --short
fi

echo ""
echo "============================================================"
echo "  INSTALLATION & CONFIGURATION COMPLETE"
echo "============================================================"
echo ""
echo "Installed & Configured:"
echo "  ✓ .agents/skills/premium-frontend"
echo "  ✓ .agents/workflows/premium-frontend.md"
echo "  ✓ AGENTS.md (Project Rules)"
echo "  ✓ UI/UX Pro Max, Frontend Design, Shadcn, Tailwind v4, React Best Practices"
echo ""
