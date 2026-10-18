---
name: accessibility-a11y
description: >-
  Enforces WCAG 2.2 AA accessibility standards across the TalentX frontend application.
  Covers keyboard navigation, focus trapping in dialogs/modals, screen reader announcements,
  accessible form controls, ARIA landmarks, and color contrast compliance.
---

# Web Accessibility (a11y) & WCAG 2.2 AA Auditing Skill

This skill ensures that all user interfaces, forms, modals, and dynamic components in TalentX are accessible to all users, including keyboard-only navigation and assistive technologies (screen readers).

---

## ⌨️ 1. Keyboard Navigation & Focus Management

Every interactive UI element must be fully operable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, Arrow keys).

### Rules:
1. **Visible Focus Rings**: Never use `outline-none` without an explicit replacement focus state. Always enforce high-contrast focus indicators:
   - **Form Controls & Text Boxes (`<Input>`, `<Textarea>`, `<select>`)**:
     ```tsx
     className="focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0"
     ```
   - **Buttons & Navigation Links (Light Surfaces)**:
     ```tsx
     className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
     ```
   - **Emerald Action Buttons**:
     ```tsx
     className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
     ```
2. **Focus Trapping in Modals & Dialogs**:
   - Modals and slide-overs (e.g. Job Application Modal, Resume Upload dialog) must trap keyboard focus inside the container while open.
   - Pressing `Escape` must close the dialog and return focus to the triggering element.
   - Use Radix UI / shadcn/ui primitives (`<Dialog>`, `<Sheet>`, `<Popover>`) which handle focus trapping and restoration automatically.
3. **Logical Tab Order**: Follow the visual reading order (left-to-right, top-to-bottom). Do not use `tabIndex > 0`. Use `tabIndex={-1}` only for elements programmatically focused via `ref.current?.focus()`.

---

## 🏷️ 2. Accessible Form Controls

Forms must provide clear semantic association between labels, helper text, and error messages.

### Form Field Best Practice:
```tsx
<div className="space-y-1.5">
  <Label htmlFor="companyName" className="text-xs font-semibold text-slate-700">
    Company Name <span className="text-red-500" aria-hidden="true">*</span>
  </Label>
  <Input
    id="companyName"
    name="companyName"
    type="text"
    placeholder="Acme AI Inc."
    aria-required="true"
    aria-invalid={errors.companyName ? 'true' : 'false'}
    aria-describedby={errors.companyName ? 'companyName-error' : 'companyName-helper'}
    className={cn(
      'h-10 rounded-xl bg-slate-50/70 text-sm',
      errors.companyName && 'border-red-500 focus-visible:ring-red-500'
    )}
    {...register('companyName')}
  />
  {errors.companyName && (
    <p id="companyName-error" role="alert" className="text-[11px] text-red-600 font-medium">
      {errors.companyName.message}
    </p>
  )}
</div>
```

---

## 📢 3. Screen Reader Announcements & ARIA Attributes

### 3.1 Dynamic Alerts & Errors
Always use `role="alert"` or `aria-live="polite"` for asynchronous notifications (e.g., OTP resend confirmations, server error banners):
```tsx
{apiError && (
  <div
    role="alert"
    aria-live="assertive"
    className="flex items-start gap-2.5 p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200"
  >
    <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
    <span className="font-medium">{apiError.message}</span>
  </div>
)}
```

### 3.2 Icon-Only Buttons
Interactive buttons containing only an icon MUST provide an accessible name via `aria-label` or `<span className="sr-only">`:
```tsx
<button
  type="button"
  onClick={() => setShowPassword((prev) => !prev)}
  aria-label={showPassword ? 'Hide password' : 'Show password'}
  className="p-1 text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-md"
>
  {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
</button>
```

### 3.3 Decorative Elements
Icons and decorative graphics must have `aria-hidden="true"` so screen readers ignore them.

---

## 🎨 4. Color Contrast Ratios (WCAG 2.2 AA)

- **Normal Text (< 18pt / 24px)**: Minimum contrast ratio of **4.5:1** against the background surface.
  - ✅ `text-slate-900` (#0F172A) on `bg-white` (#FFFFFF) $\rightarrow$ Ratio 19.8:1
  - ✅ `text-slate-700` (#334155) on `bg-slate-50` (#F8FAFC) $\rightarrow$ Ratio 9.6:1
  - ❌ Avoid `text-slate-300` or `text-slate-400` for readable body text or critical metadata.
- **Large Text ($\ge$ 18pt or bold $\ge$ 14pt)**: Minimum contrast ratio of **3:1**.
- **UI Components & Active Borders**: Minimum contrast ratio of **3:1** against adjacent background.

---

## 📱 5. Touch Target Standards

- All interactive controls (buttons, links, form inputs, checkboxes, toggle switches) must have a minimum clickable/tappable area of **$44 \times 44\text{px}$** on touch screens.
- Use Tailwind utility classes `min-h-[44px]` or `p-2.5` to maintain compliant hitboxes.

---

## 📋 Accessibility Checklist for PRs
- [ ] All inputs have explicit `<Label htmlFor="...">` associations.
- [ ] Icon-only buttons have descriptive `aria-label` or `.sr-only` text.
- [ ] Error messages have `role="alert"` and are connected via `aria-describedby`.
- [ ] Focus rings are visible on all interactive elements (`focus-visible:ring-*`).
- [ ] Modals and sheets trap keyboard focus and dismiss on `Escape`.
- [ ] Text and UI controls meet WCAG 2.2 AA contrast ratios ($\ge 4.5:1$ text, $\ge 3:1$ UI).
- [ ] Touch targets are $\ge 44 \times 44\text{px}$.
