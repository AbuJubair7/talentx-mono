---
name: frontend-design-system
description: >-
  Enforces modern Wellfound-inspired UI/UX design standards, strict responsive layout rules,
  consistent color tokens, accessibility, and component architecture across all devices for Next.js 16
  and Tailwind CSS v4 in TalentX. Always activate this skill before designing or implementing frontend UI.
---

# Frontend Design System & Responsive Engineering Skill

This skill enforces strict UI/UX standards, design token consistency, mobile-first responsive architecture, and accessibility across the TalentX frontend application.

---

## 🎯 1. Mandatory Workflow: Plan Before Implementing

Before writing or editing any frontend code, you **MUST** produce a clear architectural plan covering:
1. **Target Viewports & Breakpoints**: How the layout adapts between Mobile (`<640px`), Tablet (`768px - 1023px`), and Desktop (`>=1024px`).
2. **Component Breakdown**: Identifying reusable components for `components/` vs. feature-specific components for `modules/[feature]/components/`.
3. **Color & Token Mapping**: Ensuring all backgrounds, text, borders, and status accents strictly match `DESIGN.md`.
4. **State, Validation & Mutations**: React Hook Form, Zod schema, and TanStack Query hook specifications.
5. **Interaction & Feedback States**: Loading (`isPending` / `Loader2`), Error alerts, Success banners, Focus rings, and Empty states.

---

## 🎨 2. Master Color & Design System Tokens

Always use semantic Tailwind design tokens from `DESIGN.md`. **Never use arbitrary hardcoded hex values.**

### 2.1 Surfaces & Backgrounds
| Token Role | Tailwind Class | Semantic Usage |
|---|---|---|
| **Canvas Pure** | `bg-white` | Primary content cards, modals, form shells, navbar |
| **Canvas Neutral** | `bg-slate-50` / `bg-slate-50/60` | Page body background, alternating table rows, light split panels |
| **Canvas Subdued** | `bg-slate-100` | Inactive badge pills, search bars, pill hover states |
| **Dark Authority Canvas** | `bg-slate-950` / `bg-slate-900` | High-contrast showcase cards, primary CTA buttons |

### 2.2 Borders & Precision Outlines
| Token Role | Tailwind Class | Semantic Usage |
| **Subtle Neutral Border** | `border-slate-200` / `border-slate-200/90` | Standard 1px card borders, table dividers, resting input borders |
| **Active Form Control Focus** | `border-emerald-600` | Active input, textarea, select focus border only (`focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0`) |
| **Active Tab / Indicator Border** | `border-slate-900` / `focus-visible:ring-slate-900` | Active underline tab indicators, high-contrast navigation markers |

### 2.3 Typography Colors
| Token Role | Tailwind Class | Semantic Usage |
|---|---|---|
| **Text Primary** | `text-slate-900` | Headings (`h1`-`h4`), key titles, emphasis text, main metrics |
| **Text Secondary** | `text-slate-700` / `text-slate-600` | Form labels, navigation links, secondary descriptions |
| **Text Muted** | `text-slate-500` / `text-slate-400` | Subtitles, meta-tags, timestamp tags, placeholders |

### 2.4 Brand & Status Accents
| Token Role | Tailwind Class | Semantic Context |
|---|---|---|
| **Emerald Core** | `text-emerald-600`, `bg-emerald-600`, `hover:bg-emerald-700` | Primary brand accent, primary CTA buttons |
| **Emerald Soft Tint** | `bg-emerald-50`, `border-emerald-200`, `text-emerald-800` | Verified badges, status chips, success alerts |
| **Pulse Dot** | `bg-emerald-500 animate-pulse` | Live marketplace indicators (*"● Live Today"*) |
| **Destructive / Error** | `bg-red-50`, `border-red-200`, `text-red-700` | Form validation errors, destructive dialogs |
| **Warning / Pending** | `bg-amber-50`, `border-amber-200`, `text-amber-700` | OTP countdowns, drafts, pending reviews |

---

## 📱 3. Responsive Architecture & Device Parity Rules

Every screen, modal, and component **MUST** maintain functional and visual integrity across all devices.

### 3.1 Breakpoint Standards
- **Mobile (`<640px`)**: Single column stacked layouts, full-width inputs, touch-friendly buttons ($\ge 44\text{px}$ height), condensed headers, slide-over navigation.
- **Tablet (`sm:` to `md:`, `640px - 1023px`)**: 2-column balanced grids, compact gaps (`gap-3` to `gap-4`), adjusted font scale.
- **Desktop (`lg:` to `xl:`, `>=1024px`)**: Split screens (e.g. 5/7 columns), rich side panels, high information density.

### 3.2 Responsive Best Practices
1. **Never Cause Horizontal Scrolling**:
   - Always use `w-full max-w-*` on containers.
   - Use `break-words` or `truncate` for dynamic user-generated text.
   - Avoid fixed pixel widths (`w-[600px]`) on screens that may render on mobile; use `w-full max-w-[600px]`.
2. **Grid & Flex Transformation Pattern**:
   ```tsx
   // Responsive Multi-Column Form / Card Row
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
     {/* Automatically stacks cleanly on mobile, expands on desktop */}
   </div>
   ```
3. **Touch Targets**:
   - Minimum tap target height: `h-10` ($40\text{px}$) to `h-11` ($44\text{px}$) on buttons and inputs.
   - Ensure adequate spacing (`gap-2` to `gap-3`) between interactive elements.

---

## 🏗️ 4. Component Architecture & Reusability

Follow strict domain-driven modular placement:

```
talentx2026q3.frontend/
├── components/                  → Reusable cross-feature UI components (AuthCard, Stepper, PasswordInput, GoogleBtn)
│   └── ui/                      → Base atomic design primitives (Button, Input, Label, Card, Dialog)
├── modules/                     → Domain feature modules
│   └── [feature]/               → Feature slice (e.g. auth/signup, jobs, employers)
│       ├── components/          → Feature-specific components
│       ├── hooks/               → TanStack Query hooks and custom UI logic
│       ├── services/            → Axios API service calls
│       ├── schemas/             → Zod validation schemas
│       └── types/               → TypeScript interfaces and DTOs
└── app/                         → Next.js 16 App Router pages & layouts
```

### Reusability Rule:
> **If a component is or will be used in 2 or more places (e.g. Steppers, Password toggles, OAuth buttons, Filter chips), place it inside `components/`, NOT inside a local feature folder.**

---

## ♿ 5. Accessibility & State Management Checklist

1. **Semantic Structure**: Always use semantic HTML tags (`<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<form>`, `<button>`).
2. **Keyboard Navigation & Focus**: Every interactive control must have visible focus rings/borders. Form inputs and text boxes use `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border color only, no outer ring or background glow on click or keyboard tab); buttons and navigation use `focus-visible:ring-2 focus-visible:ring-slate-900` on light surfaces and `focus-visible:ring-emerald-700` on emerald buttons.
3. **Form Inputs**:
   - Always pair `<Input>` with an explicit `<Label htmlFor="...">`.
   - Display clear, inline error messages with `role="alert"`.
   - Implement real-time or `onTouched` validation with Zod.
4. **Transitions & Performance**:
   - Use subtle, polished micro-interactions (`transition-all duration-200 active:scale-[0.99]`).
   - Use Lucide vector icons with appropriate `size-*` classes.
   - Never suppress TypeScript warnings; maintain zero errors in `npx tsc --noEmit`.

---

## 🧪 6. Definition of Done for Frontend Tasks

Before completing any frontend feature or UI update, verify:
- [ ] Responsive check passed on Mobile ($375\text{px}$), Tablet ($768\text{px}$), and Desktop ($1280\text{px}+$).
- [ ] No horizontal scrollbars across any viewport size.
- [ ] Color tokens and typography strictly adhere to `DESIGN.md`.
- [ ] Form submission, error, loading, and disabled states work smoothly.
- [ ] TypeScript compilation passes cleanly (`npx tsc --noEmit`).
- [ ] Jest unit & component tests pass (`npm test`).
