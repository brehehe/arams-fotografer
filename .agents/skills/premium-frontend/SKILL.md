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

---

## CORE PRINCIPLES

Create interfaces that are:

- **Professional & Polished**: High visual hierarchy, clean lines, balanced whitespace.
- **Distinctive & Intentional**: Avoid generic AI SaaS templates, purple gradients on white, or random cards.
- **Responsive & Touch-Ready**: Seamless mobile-first and desktop experiences.
- **Accessible (WCAG 2.2 AA)**: Semantic HTML, keyboard-navigable, high-contrast, focus-visible states.
- **Performant**: Smooth 60fps animations, zero layout shifts, optimized React renders.
- **Production-Ready & Type-Safe**: Strict TypeScript definitions matching Inertia page props.

---

# DESIGN & IMPLEMENTATION WORKFLOW

Always follow this structured order when crafting or improving UI:

## 1. Understand the Existing Product & Context

Before writing or altering code:
- Inspect existing Inertia page components (`resources/js/pages/...`)
- Inspect shared layouts (`resources/js/layouts/...`) and reusable components (`resources/js/components/...`)
- Inspect design tokens and Tailwind theme (`resources/css/app.css` or Tailwind v4 `@theme` configuration)
- Inspect TypeScript types / interfaces representing backend models & Inertia page props
- Inspect backend routes (`routes/web.php`) and controllers to understand data flow

> ⚠️ **Do not blindly delete or replace existing working backend connections, Inertia form helpers, or route parameters.**

---

## 2. Define Visual Direction & Personality

- **Product Purpose**: Enterprise management, SaaS dashboard, e-commerce, or portal?
- **Personality**: Minimalist elegance, technical precision, modern warmth, or high-contrast utility.
- **Color System**: Curated semantic tokens (Primary, Secondary, Accent, Background, Surface, Border, Muted, Destructive, Success, Warning).
- **Typography Scale**: Clear hierarchy with font sizes, weights, line-heights, and tracking.

---

## 3. UI/UX Architecture

Apply UI/UX Pro Max principles:
- **Information Architecture**: Logical grouping of actions, data columns, and filter controls.
- **Forms & Inputs**: Clear validation feedback, inline error messages, floating or accessible labels, proper input types.
- **Data Tables & Lists**: Density control, sticky headers, responsive horizontal scroll, batch actions, search/filter debounce.
- **Feedback & States**: Loading skeletons, empty states with clear CTAs, error boundaries, confirmation dialogs, toast notifications (Sonner).

---

## 4. Layout & Spacing Rhythm

- Use strict 4px / 8px spacing scale (`gap-2`, `gap-4`, `p-6`, `space-y-4`).
- Maintain consistent container widths and padding across all viewport breakpoints.
- Ensure aligned baseline grid for text and icon pairings.

---

## 5. Tailwind CSS v4 & Styling Best Practices

- Leverage Tailwind CSS v4 `@theme` blocks and CSS variable tokens.
- Use `cn()` (`clsx` + `tailwind-merge`) for flexible component className composition.
- Extract repeated UI patterns into clean, reusable React components rather than duplicate 30+ class strings.
- Utilize modern CSS utilities: container queries, fluid typography, subtle glassmorphism borders (`border-border/60 bg-background/95 backdrop-blur-md`).

---

## 6. Laravel + Inertia.js + React 19 Integration

### Critical Rules:
- **Preserve Backend Behavior**: Never change backend models, migrations, controllers, authorization gates, or validation logic unless explicitly requested.
- **Inertia Navigation & Forms**: Use `@inertiajs/react` components (`Link`, `useForm`, `router.visit`) properly.
- **Type Safety**: Maintain strict TypeScript typing for Inertia page props, form data, and API payloads.
- **React 19 & Hooks**: Write clean, modern React code leveraging hooks (`useState`, `useCallback`, `useMemo`), avoiding unnecessary re-renders.

---

## 7. Responsive & Mobile-First Design

Test and optimize across viewports:
- Mobile (< 640px): Bottom sheets / drawer menus, collapsible tables, touch targets >= 44x44px.
- Tablet (640px - 1024px): Adaptive sidebars, responsive 2-column grids.
- Desktop (1024px+): Multi-column layouts, expanded data tables, quick action toolbars.

---

## 8. Accessibility (WCAG 2.2 AA)

Ensure:
- Semantic HTML tags (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<button>`).
- Keyboard accessibility for all interactive elements (Enter / Space to activate, Escape to dismiss, Tab indexing).
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
- Accessible names (`aria-label`, `aria-describedby`, Radix UI primitives with built-in ARIA support).
- Sufficient color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text).

---

## 9. Performance & Micro-Interactions

- Subtle micro-animations using Framer Motion (page transitions, dialog scale-in, list staggering).
- Avoid layout shifts (CLS): define explicit aspect ratios or skeleton dimensions.
- Optimize asset loading: SVG icons (Lucide), responsive images.

---

## 10. Quality Audit & Final Polish Checklist

Before declaring any UI task complete, perform a thorough check:
- [ ] Visual Polish: Consistent borders, radii, shadows, and spacing.
- [ ] Empty & Loading States: Verified pleasant experience when no data exists.
- [ ] Dark Mode / Theme Compatibility: Colors stay readable across theme switches.
- [ ] Error Handling: Form validation and edge-case error toasts look clean.
- [ ] TypeScript & Linting: Zero build errors (`npm run types:check`, `npm run lint:check`).
- [ ] Responsive Viewports: Mobile, tablet, and desktop verified.
