# Design System Master File — Arams Photography Management

> **LOGIC:** When building a specific page, first check `design-system/arams/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Arams Photography Management System  
**Category:** Photography / Creative Business Management Platform  
**Target Stack:** Laravel 11 + React (Inertia.js) + Tailwind CSS + Lucide Icons + Framer Motion  

---

## 1. Global Color Palette

| Role | Hex Code | CSS Variable / Tailwind | Description & Usage |
|------|----------|-------------------------|---------------------|
| **Deep Navy (Sidebar)** | `#0B1527` | `--navy-950` / `bg-[#0B1527]` | Dark premium sidebar background |
| **Navy Surface** | `#132238` | `--navy-900` / `bg-[#132238]` | Sidebar header/footer borders, active container |
| **Navy Hover** | `#1A2D4A` | `--navy-800` / `bg-[#1A2D4A]` | Sidebar menu hover state |
| **Brand Gold (Accent)** | `#C89445` | `--gold-500` / `bg-[#C89445]` | Primary CTA button, active navigation pill, brand highlight |
| **Brand Gold Hover** | `#B38036` | `--gold-600` / `hover:bg-[#B38036]` | Primary button hover |
| **Brand Gold Light** | `#FDF8EE` | `--gold-50` / `bg-[#FDF8EE]` | Accent highlight background, tag background |
| **Main Background** | `#F8FAFC` | `bg-slate-50` | Clean workspace body background |
| **Card Surface** | `#FFFFFF` | `bg-white` | Dashboard & module cards, tables, modals |
| **Card Border** | `#EDF2F7` / `#E2E8F0` | `border-slate-200` | Ultra-clean subtle borders |
| **Text Primary** | `#0F172A` | `text-slate-900` | Titles, metrics, table data, modal headers |
| **Text Secondary** | `#64748B` | `text-slate-500` | Subtitles, labels, timestamps, table headers |
| **Text Muted** | `#94A3B8` | `text-slate-400` | Icons, placeholders, subtle metadata |

### Semantic Status Badges & Accents

| Status Type | Background Hex | Text / Icon Hex | Border Hex | Example Usage |
|-------------|----------------|-----------------|------------|---------------|
| **Success** | `#ECFDF5` (`bg-emerald-50`) | `#059669` (`text-emerald-600`) | `#A7F3D0` | Selesai, Lunas, Aktif, Project Selesai |
| **Warning / Process** | `#FFFBEB` (`bg-amber-50`) | `#D97706` (`text-amber-600`) | `#FDE68A` | Sedang Dikerjakan, Draft, Sisa Tagihan, 3 hari lagi |
| **Info / In Progress** | `#EFF6FF` (`bg-blue-50`) | `#2563EB` (`text-blue-600`) | `#BFDBFE` | Dalam Proses, Total Project, Kategori Wedding |
| **Danger / Overdue** | `#FEF2F2` (`bg-red-50`) | `#DC2626` (`text-red-600`) | `#FECACA` | Overdue, Batalkan, Hapus, Tagihan Jatuh Tempo |
| **Purple Accent** | `#F5F3FF` (`bg-purple-50`) | `#7C3AED` (`text-purple-600`) | `#DDD6FE` | Event, Laporan, Project Selesai KPI |
| **Pink Accent** | `#FDF2F8` (`bg-pink-50`) | `#DB2777` (`text-pink-600`) | `#FBCFE8` | Birthday, Newborn category |

---

## 2. Typography System

- **Primary Font Family:** `Inter`, `Plus Jakarta Sans`, or `Outfit` sans-serif
- **Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
```

### Type Scale & Hierarchy

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| **Page Title** | `24px` (`text-2xl`) | `700` (Bold) | `1.25` | `#0F172A` |
| **Section Title** | `18px` (`text-lg`) | `600` (Semibold) | `1.3` | `#0F172A` |
| **Card Title / Metric Label** | `13px` (`text-xs`) | `600` (Semibold, UPPERCASE / tracking-wider) | `1.2` | `#64748B` |
| **Large Metric / Total** | `28px - 32px` (`text-3xl`) | `700` (Bold) | `1.1` | `#0F172A` |
| **Body / Table Content** | `14px` (`text-sm`) | `400` / `500` | `1.5` | `#0F172A` / `#334155` |
| **Secondary / Subtitle** | `13px` (`text-xs`) | `400` (Regular) | `1.4` | `#64748B` |
| **Badges & Tags** | `11px - 12px` (`text-xs`) | `600` (Semibold) | `1.2` | Semantic text color |

---

## 3. Layout & Structure (Desktop First & Responsive)

```text
┌────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (256px)        │ TOPBAR / HEADER (64px)                       │
│  Dark Navy #0B1527      ├──────────────────────────────────────────────┤
│  Logo + Gold Accent     │ PAGE CONTENT (max-w-7xl, p-6 / p-8)          │
│  Navigation List        │ Light Slate #F8FAFC                          │
│  Active Gold Pill       │ White Cards (#FFFFFF) with rounded-xl        │
│  User / Logout Bottom   │ Metric Stats → Quick Actions → Tables/Charts │
└─────────────────────────┴──────────────────────────────────────────────┘
```

- **Sidebar Width:** `256px` (`w-64`), Collapsible to `72px` or drawer on Mobile (<1024px)
- **Border Radius:**
  * Cards: `rounded-2xl` (16px) or `rounded-xl` (12px)
  * Buttons: `rounded-lg` (8px) or `rounded-xl` (10px)
  * Badges / Pills: `rounded-full` (9999px) or `rounded-md` (6px)
  * Avatars / Icons: `rounded-xl` / `rounded-full`
- **Shadows:**
  * Card: `shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.02)]` (clean subtle)
  * Hover / Modal: `shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)]`

---

## 4. Component Rules & Guidelines

### Primary Button
- Background: `#C89445` (Gold) or `#0B1527` (Dark Navy with Gold hover)
- Text: `#FFFFFF`
- Radius: `rounded-lg` (8px)
- Padding: `px-4 py-2.5`
- Font: `text-sm font-semibold`
- Hover: Smooth subtle brightness/scale transition (`duration-200`)

### Quick Action Card
- Background: `#FFFFFF` with colored icon square (`bg-orange-50 text-orange-500`, `bg-blue-50 text-blue-500`, `bg-emerald-50 text-emerald-500`, `bg-purple-50 text-purple-500`)
- Hover: `hover:border-slate-300 hover:shadow-md transition-all duration-200`

### Table Design
- Clean table with subtle header `bg-transparent text-slate-400 font-semibold text-xs uppercase tracking-wider`
- Row hover: `hover:bg-slate-50/70 transition-colors`
- Clean divider lines: `divide-y divide-slate-100`
- Compact pagination bar with rows per page selector, current page count, and clean page buttons.

---

## 5. Anti-Patterns (Strict Rules)

- ❌ **No AI Sparkles / Robot Icons** — Only use clean Lucide SVG icons.
- ❌ **No Heavy Neon / Cyberpunk Gradients** — Use solid clean surfaces with delicate borders.
- ❌ **No Overuse of Gold** — Gold is exclusively for active nav, primary CTAs, and selected badges.
- ❌ **No Emoji as UI Icons** — Only standard Lucide icons for UI controls.
- ❌ **No Missing Keyboard States** — Always include `focus-visible:ring-2 focus-visible:ring-amber-500/20`.
- ❌ **No Hardcoded Indonesian Rupiah Strings** — Always use centralized currency & date helpers (`Intl.NumberFormat('id-ID')`, `Intl.DateTimeFormat('id-ID')`).
