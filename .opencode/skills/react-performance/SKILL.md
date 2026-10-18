---
name: react-performance
description: >-
  Enforces Next.js 16 and React performance best practices (Vercel standard), including eliminating
  async waterfalls, optimizing React Server Components (RSC) vs Client Component boundaries,
  preventing unnecessary re-renders, and optimizing Core Web Vitals (LCP, CLS, INP).
---

# React & Next.js Performance Optimization Skill

This skill enforces high-performance React and Next.js 16 architectural patterns across the TalentX frontend application.

---

## ⚡ 1. Eliminating Async Waterfalls

Sequential `await` calls in server components or route handlers degrade Time to First Byte (TTFB).

### ❌ Anti-Pattern (Waterfall)
```tsx
// Sequential fetching blocks execution
const categories = await getCategories();
const featuredJobs = await getFeaturedJobs();
const recentCompanies = await getCompanies();
```

### ✅ Best Practice (Parallelization)
```tsx
// Parallel execution using Promise.all or Promise.allSettled
const [categories, featuredJobs, recentCompanies] = await Promise.all([
  getCategories(),
  getFeaturedJobs(),
  getCompanies()
]);
```

---

## 🧩 2. Server Components (RSC) vs. Client Component Boundaries

Next.js 16 App Router defaults to React Server Components. Keep client boundaries as deep/low in the component tree as possible.

### Rules:
1. **Push `'use client'` to the Leaves**: Never mark an entire page or large layout as `'use client'`. Extract only the interactive widget (e.g. `JobSearchBar`, `SaveJobButton`, `OtpInput`) as a client component.
2. **Pass Server Components as Children / Props**: Pass heavy server components as `children` into client wrappers to preserve server-side rendering and minimize bundle size.

```tsx
// ✅ Pass Server Component through Client Wrapper
// Client Component wrapper:
'use client'
export function FilterSlideOver({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Filters</button>
      {isOpen && <aside>{children}</aside>}
    </div>
  );
}

// Server Component page:
export default async function JobsPage() {
  const filterData = await getFilterData();
  return (
    <FilterSlideOver>
      <ServerRenderedFilterList data={filterData} />
    </FilterSlideOver>
  );
}
```

---

## 🔄 3. Preventing Unnecessary Client Re-renders

1. **Callback & Value Memoization**:
   - Wrap heavy handlers passed to child lists in `useCallback`.
   - Wrap derived calculations (e.g. complex salary filtering, full-text client matching) in `useMemo`.
2. **Stable Component Identity**:
   - Never define React components inside another component's render function (prevents remounting and losing input state).
3. **Primitive Props**:
   - Prefer passing primitive values or IDs over new object literals (`{ id: 1 }`) in JSX to allow React's shallow comparison to succeed.

---

## 🎯 4. Core Web Vitals Optimization

### 4.1 Largest Contentful Paint (LCP)
- Always set `priority` on above-the-fold hero images or company logos:
  ```tsx
  <Image
    src="/logo.png"
    alt="TalentX Logo"
    width={160}
    height={80}
    priority
    className="h-9 w-auto"
  />
  ```

### 4.2 Cumulative Layout Shift (CLS)
- Always specify explicit `width` and `height` (or `aspect-ratio`) on images, skeletons, and media containers to reserve viewport space before assets load.
- Use skeleton loaders (`Skeleton` from shadcn/ui) that match the exact height and layout of incoming content.

### 4.3 Interaction to Next Paint (INP)
- Keep event handlers lightweight. Offload non-urgent state updates using React 19 / Next.js 16 `useTransition`:
  ```tsx
  const [isPending, startTransition] = useTransition();
  const handleFilterChange = (val: string) => {
    startTransition(() => {
      setFilterQuery(val);
    });
  };
  ```

---

## 📦 5. Dynamic Imports & Code Splitting

Lazy load heavy or rarely-used client modals, rich text editors, and chart libraries using `next/dynamic`:

```tsx
import dynamic from 'next/dynamic';

const ResumePdfPreviewModal = dynamic(
  () => import('@/modules/jobs/components/resume-pdf-modal').then((mod) => mod.ResumePdfPreviewModal),
  {
    loading: () => <div className="p-8 text-center text-slate-400">Loading viewer...</div>,
    ssr: false,
  }
);
```

---

## 📋 Performance Checklist for PRs
- [ ] No sequential `await` waterfalls in server components (use `Promise.all`).
- [ ] `'use client'` directives are isolated to interactive leaf components.
- [ ] Hero images and above-the-fold assets use `priority`.
- [ ] Skeletons preserve exact layout dimensions to eliminate CLS.
- [ ] Heavy third-party libraries (PDF viewers, charts) are dynamically imported.
