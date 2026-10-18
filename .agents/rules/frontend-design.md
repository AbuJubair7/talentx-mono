<!-- Last Updated: 2026-09-11 | TalentX frontend design system and routing flow specification -->

# Frontend Design System & Routing Flow (TalentX Standard)

## Architectural Standard
All frontend UI/UX designs, component aesthetics, and page routing flows must follow the **TalentX Design System** (`DESIGN.md`), featuring high-contrast B2B recruitment design patterns and layout conventions.

---

## 1. Visual Aesthetics & Design System

### 🎨 Color Palette & Surface Tokens
- **Backgrounds**: Ultra-clean crisp white (`#FFFFFF`) with subtle off-white backgrounds (`#F8FAFC` / `slate-50`) for card differentiation.
- **Borders & Dividers**: Thin, precise borders (`border-slate-200` / `#E2E8F0`, dark mode `border-slate-800` / `#1E293B`).
- **Typography Colors**:
  - Primary text: High-contrast rich charcoal / deep slate (`#0F172A` / `slate-900`).
  - Secondary text: Readable neutral slate (`#475569` / `slate-600`).
  - Muted / Helper text: Subtle gray (`#94A3B8` / `slate-400`).
- **Action & Accent Colors**:
  - Primary CTA: High-contrast pitch black (`#000000` / `#0F172A`) or authoritative primary emerald `bg-emerald-700` (`#047857`, 5.48:1 contrast with white text) or blue (`#1D4ED8` / `bg-blue-700`). Note: `bg-emerald-500` (`#10B981`, 2.47:1) and `bg-emerald-600` (`#059669`, 3.77:1) fail WCAG 2.1 AA for white-text button labels (< 18.66px bold).
  - Interactive Hover: Subtle background elevation transition (`bg-slate-100` / `hover:bg-slate-900/90` or `hover:bg-emerald-800`).
  - Status Pills / Badges: Soft tinted pastel backgrounds with solid text (e.g. `bg-emerald-50 text-emerald-700`, `bg-blue-50 text-blue-700`, `bg-amber-50 text-amber-700`).

### ✍️ Typography & Hierarchy
- **Font Family**: Inter, Geist Sans, or modern sans-serif system fonts.
- **Headings**: `tracking-tight font-semibold` or `font-bold` for crisp, editorial presence.
- **Body & Labels**: Clean line-heights (`leading-relaxed`), medium-weight labels (`font-medium text-slate-700`).
- **No Clutter**: Avoid excessive gradients, purple-on-dark glow effects, or decorative visual noise.

### 📐 Card & Component Border Radius Standard (STRICT)
- **Cards (Job Cards, Metric Count Cards, Content Cards)**: MUST use **`rounded-md`** (6px) for a crisp, squarish, modern B2B recruitment interface. Never use overly rounded `rounded-2xl` or `rounded-3xl` on content cards or job cards.
- **Tab Bar & Filter Pill Containers**: Outer container MUST use **`rounded-md`**; individual inner tab buttons and active indicator pills MUST use **`rounded-sm`** (2-4px) to preserve the cohesive squarish aesthetic.
- **Buttons, CTAs & Inputs**: Standard controls MUST use **`rounded-md`**.

---

## 2. Component Design Patterns

### 🔐 Authentication Pages (Split Screen Layout)
- **Desktop**: 50/50 Split Screen:
  - **Left Side (Brand Canvas)**: Dark slate or branded surface showcasing value proposition, high-impact testimonial, partner logos, or statistics.
  - **Right Side (Form Canvas)**: Centered, clean card container featuring:
    - Primary One-Click Google OAuth button.
    - Subtle "or continue with email" divider.
    - Accessible form fields with floating/clear labels and inline validation.
    - Password strength & checklist indicators.
    - Clear secondary navigation link ("Already have an account? Log in").
- **Mobile**: Stacked single-column with clean brand header.

### 💼 Job Listing & Discovery Cards
- **Compact Card Grid/List**:
  - Company logo icon + Company Name + Time posted.
  - Job Title in bold primary font.
  - Location + Work Mode (Remote, Hybrid, Onsite) + Salary range badge pills.
  - Tech stack tag pills (`React`, `.NET`, `Python`, `AI/ML`).
  - Quick action buttons ("Quick Apply", "Save", "View details").

### 📋 Multi-Step Onboarding Wizards
- Visual step progression bar / numbered breadcrumbs at top.
- Single-purpose card with clear forward ("Continue") and back buttons.
- Autosaving or draft persistence where appropriate.

---

## 3. Routing & Navigation Flow

```
Landing & Public Platform
├── /                                   → Home page with dual CTAs ("Find Startup Jobs" & "Hire Tech Talent")
├── /jobs                               → Public Job Board (filters by role, location, salary, remote)
└── /jobs/[id]                          → Job Details & 1-Click Application Modal

Authentication Flows
├── /(auth)/signup                      → Signup page with role toggle (?role=employer | ?role=candidate) & Google GIS
├── /(auth)/login                       → Login page with Google OAuth & Email/Password
├── /(auth)/verify-email                → 6-digit OTP verification screen with cooldown timer
├── /(auth)/forgot-password             → Password reset request
└── /(auth)/reset-password              → Password reset confirmation

Onboarding Flows (Post-Signup / First Login)
├── /onboarding/employer                → Employer Setup:
│   ├── Step 1: Company Profile (Name, Website, Logo, Size)
│   ├── Step 2: Hiring Needs (Roles, Tech Stack, Urgent openings)
│   └── Step 3: Complete & Launch Dashboard
└── /onboarding/candidate               → Candidate Setup:
    ├── Step 1: Role & Experience Level
    ├── Step 2: Skills & Preferred Work Modes
    ├── Step 3: AI Resume Upload & Extraction
    └── Step 4: Complete & Launch Discovery

Authenticated Workspaces
├── /employer/dashboard                 → Employer Dashboard (Active Jobs, Pipeline metrics, Inbound candidates)
├── /employer/jobs/new                  → Job Creation & Publishing Wizard
├── /employer/jobs/[id]/candidates      → Candidate Kanban / Applicant Review Pipeline
├── /employer/settings                  → Company & Billing Settings
├── /talent/dashboard                   → Candidate Dashboard (Applied Jobs, Saved Jobs, Profile Match)
└── /talent/profile                     → Candidate Public & Private Profile Editor
```

---

## 4. Frontend Implementation Rules

1. **Modular Domain Structure**:
   All new screens and components must live inside feature modules:
   `modules/[feature]/components/`, `modules/[feature]/hooks/`, `modules/[feature]/services/`, `modules/[feature]/types/`, `modules/[feature]/utils/`, `modules/[feature]/constants/`.
2. **State & Data Fetching**:
   Use **TanStack React Query** (`@tanstack/react-query`) for all server interactions and mutations.
3. **Icons & UI Primitives**:
   Use `lucide-react` for crisp vector iconography and standard shadcn/ui primitives.
4. **Mobile Responsiveness**:
   Design mobile-first with fluid responsiveness across breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
5. **Frontend File Organization (STRICT — One Concern Per File)**:
   Component files (`.tsx`) must contain **only** the component function and its directly-coupled Props interface. Everything else must live in a dedicated file:
   - Interfaces / types shared between components → `types/`
   - Pure utility functions (formatters, parsers, URL builders) → `utils/`
   - Config lookup objects, style maps, named constant objects (e.g., `STATUS_CONFIG`, `BAND_CONFIG`, `SIZE_CLASSES`, `NOTIFICATION_TYPE_CONFIG`) → `constants/`
   - API endpoint strings, hub paths, magic numbers → `constants/`
   - **The only exception**: A single `XxxProps` interface for the component's own props **may** stay in the same `.tsx` file — standard React convention. No other types, configs, or utility functions may be declared in a component file.

---

## 5. Web Accessibility Standards (WCAG 2.1 AA — Mandatory)

1. **Color Contrast Standards**:
   - **Normal Text (< 18.66px bold or < 24px regular)**: Strict minimum contrast ratio of **4.5:1** against adjacent background colors.
   - **Large Text (>= 18.66px bold or >= 24px regular) & UI Components**: Strict minimum contrast ratio of **3:1**.
   - **Solid Emerald Buttons**: White-text buttons MUST use `bg-emerald-700` (`#047857`, 5.48:1 contrast). Never use `bg-emerald-500` (2.47:1) or `bg-emerald-600` (3.77:1) for white-text button labels.
2. **Focus Visibility & Keyboard Navigation (WCAG 2.1 SC 2.4.7)**:
   - All interactive controls (buttons, links, inputs, tabs) MUST have clear, visible focus rings when focused via keyboard.
   - **Form Controls & Text Boxes (`<Input>`, `<Textarea>`, `<select>`)**: `focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0` (border color changes to emerald; no outer ring or background glow effect on click or keyboard tab).
   - **Emerald Action Buttons**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2`.
   - **Standard light surfaces (buttons, links, icon controls)**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2`.
   - **Dark surfaces**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`.
   - Never use `outline-none` without providing an explicit focus ring.
3. **Motion Reduction (WCAG 2.1 SC 2.2.2 & SC 2.3.3)**:
   - Honor user OS motion preferences via `@media (prefers-reduced-motion: reduce)`.
   - Use Tailwind's `motion-reduce:animate-none motion-reduce:transition-none` on all animated elements.
   - Auto-rotating components must disable auto-advancement when reduced motion is preferred.
4. **Accessible Carousel Architecture (WCAG 2.1 SC 2.2.2)**:
   - Container MUST declare `role="region"` and `aria-roledescription="carousel"`, along with an informative `aria-label`.
   - Slides MUST declare `role="group"` and `aria-roledescription="slide"`, labeled with their position (e.g. `aria-label="1 of 3"`).
   - Any auto-advancing carousel MUST include a visible, accessible Pause/Play toggle button.
   - MUST automatically pause rotation on mouse hover and keyboard focus.
   - Announce slide transitions politely to screen readers (`aria-live="polite"` or `aria-atomic="true"`).
