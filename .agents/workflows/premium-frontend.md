# Premium Frontend Workflow

Use this workflow for UI/UX feature development, redesigns, component building, and visual refinement in this Laravel + Inertia.js + React + Tailwind v4 project.

---

## Phase 1 — Inspect & Context Gathering
1. Inspect the target Inertia page (`resources/js/pages/...`) and its parent layout (`resources/js/layouts/...`).
2. Review backend Controller & route definition (`routes/web.php`) to understand props passed from Laravel.
3. Review TypeScript types and model interfaces.
4. Check existing design tokens in `resources/css/app.css` and available Shadcn components (`resources/js/components/ui/...`).

---

## Phase 2 — Design System & Visual Hierarchy
1. Consult **UI/UX Pro Max** and **Frontend Design** guidelines.
2. Select appropriate color tokens, typography scale, and elevation/shadows.
3. Plan states: Default, Hover, Active, Focus-visible, Disabled, Loading Skeleton, Empty, Error.
4. Establish responsive layout strategy for Mobile, Tablet, and Desktop.

---

## Phase 3 — Component Implementation
1. Compose UI using Shadcn/Radix primitives and custom React components.
2. Implement Tailwind CSS v4 styling with consistent spacing rhythm and typography hierarchy.
3. Wire up `@inertiajs/react` form helpers (`useForm`, `router.visit`) or interactive state management.
4. Add smooth micro-animations using Framer Motion (subtle entry transitions, drawer slide-ins, feedback effects).

---

## Phase 4 — Validation & Testing
1. **Type Safety**: Verify TypeScript compilation (`npm run types:check` or `bun run types:check`).
2. **Linting & Formatting**: Ensure code adheres to Prettier & ESLint rules (`npm run format:check`).
3. **Responsive Breakpoints**: Check Mobile (375px), Tablet (768px), and Desktop (1280px+).
4. **Form & Interactive Edge Cases**: Verify input validation, error displays, loading states, and toast notifications.

---

## Phase 5 — Auditing & Quality Assurance
1. **Accessibility**: Check keyboard navigation (Tab/Shift+Tab, Enter, Space, Escape) and ARIA attributes.
2. **Web Design Guidelines**: Ensure clean alignment, balanced whitespace, and readable contrast.
3. **Performance**: Verify zero layout shifts (CLS), fast render times, and optimized bundle dependencies.

---

## Phase 6 — Final Visual Polish
1. Unify border-radius, border opacity, and subtle dark-mode accents.
2. Polish micro-interactions (button press feedback, tooltip delays, hover states).
3. Confirm seamless integration with the overall application aesthetic.
