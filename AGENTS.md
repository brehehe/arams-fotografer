# Project Frontend Rules & Architecture

## Stack Overview
- **Backend**: Laravel 12 (Routing, Controllers, Eloquent Models, Auth, Database)
- **Frontend Bridge**: Inertia.js (React Adapter)
- **Frontend Core**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first configuration with `@theme`)
- **UI Components**: Shadcn UI + Radix UI Primitives
- **Animations & Icons**: Framer Motion, Lucide React, Sonner (Toasts), Canvas Confetti
- **Build Tooling**: Vite 8

---

## Core Frontend Rules

1. **Architecture & Scope Boundaries**:
   - Do **NOT** modify Laravel models, migrations, controllers, or database schemas during UI-only tasks unless explicitly requested.
   - Maintain seamless props compatibility between Laravel backend controllers and Inertia page components (`resources/js/pages/...`).
   - Use TypeScript interfaces/types for all Inertia page props and form structures.

2. **Styling & Aesthetics**:
   - Build interfaces that look bespoke, professional, modern, and polished.
   - Avoid generic AI-generated aesthetics (e.g. purple gradients on plain white boxes, excessive glassy cards without structure).
   - Use Tailwind CSS v4 design tokens and CSS variables for theming and dark mode compatibility.
   - Extract reusable components into `resources/js/components/` when markup or styling is repeated.

3. **Inertia.js & React Best Practices**:
   - Use `@inertiajs/react` components (`Link`, `useForm`, `router`) for page transitions and form submissions.
   - Do not replace Inertia.js patterns with standalone API fetch calls unless specifically handling asynchronous non-page endpoints.
   - Leverage React 19 composition patterns and avoid unnecessary re-renders.

4. **Accessibility (WCAG 2.2)**:
   - Ensure full keyboard navigation support across all custom interactive components, dialogs, and dropdowns.
   - Provide clear `focus-visible` focus rings and appropriate ARIA attributes (`aria-label`, `aria-expanded`, etc.).
   - Maintain high color contrast in both light and dark modes.

5. **Responsiveness**:
   - Ensure touch-first and mobile-responsive layouts (375px mobile, 768px tablet, 1024px+ desktop).
   - Minimum touch target size of 44x44px for mobile interactive elements.

6. **Quality & Validation**:
   - Ensure `npm run types:check` and `npm run lint:check` pass cleanly without TypeScript or ESLint errors.
   - Always verify empty states, loading states (skeletons), error toasts, and confirmation dialogs.
