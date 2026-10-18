# TalentX Frontend Boilerplate

Welcome to the **TalentX Frontend Boilerplate**! This repository serves as the foundation for our frontend projects, providing a robust, scalable, and feature-driven architecture. 

It is designed to be minimal in feature code but fully configured with industry-standard tools so you can clone it and start building your feature branches immediately.

---

## 🛠 Tools & Libraries

This boilerplate is pre-configured with the following modern stack:

*   **[Next.js (App Router)](https://nextjs.org/)**: The core React framework. We use the App Router (`app/` directory) for routing, layouts, and rendering (Server & Client components).
*   **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
*   **[Shadcn UI](https://ui.shadcn.com/)**: Unstyled, accessible component primitives. You can add new components via the CLI (e.g., `npx shadcn@latest add dialog`).
*   **[TanStack Query (React Query)](https://tanstack.com/query/latest)**: Powerful asynchronous state management for data fetching, caching, and synchronization.
*   **[Axios](https://axios-http.com/)**: Promise-based HTTP client used for making API requests, integrated with interceptors for auth and error handling.
*   **[Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**: The standard testing framework and utility for writing robust unit and component tests.

---

## 📁 Folder Structure (Modular Architecture)

We strictly follow a **Domain-Driven (Modular) Architecture**. This keeps the framework layer thin and organizes business logic by feature domains.

```text
├── app/                  # Next.js App Router (Routing & Core Layout ONLY)
├── components/           # Shared global components
│   └── ui/               # Shadcn UI primitives (Button, Input, etc.)
├── hooks/                # Shared global custom hooks
├── lib/                  # Shared utilities (Axios instance, cn utility)
├── modules/              # Domain-Driven Feature Modules (Where your code goes!)
│   ├── [feature-name]/   # e.g., 'auth', 'dashboard', 'user-profile'
│   │   ├── components/   # Feature-specific UI components
│   │   ├── hooks/        # Feature-specific hooks (e.g., TanStack Query hooks)
│   │   ├── services/     # Feature-specific API calls (Axios methods)
│   │   ├── types/        # Feature-specific TypeScript interfaces
│   │   ├── __tests__/    # Co-located tests for this module
│   │   └── index.ts      # Public API for this module (Barrel export)
├── store/                # Global state stores (if using Zustand/Redux)
└── tests/                # Global test setup (e.g., render wrappers)
```

---

## 📖 Developer Guidelines & Best Practices

To maintain a clean and scalable codebase, all developers must adhere to the following guidelines:

### 1. The Module Pattern is Mandatory
Do not clutter the global `components/` or `hooks/` folders with feature-specific code. 
When building a new feature (e.g., "Job Board"):
1. Create a new folder: `modules/job-board/`.
2. Keep all its internal UI, API services, types, and hooks inside that folder.
3. Export what is needed by the pages in `modules/job-board/index.ts`.
4. In your `app/` routes, import only from the module's `index.ts` (e.g., `import { JobBoard } from '@/modules/job-board'`).

### 2. Server Components vs. Client Components
*   **Server Components (Default):** Use these for static layouts, SEO, and initial page loads in the `app/` directory.
*   **Client Components (`'use client'`):** Use these for interactive components (buttons, forms), state (`useState`), effects (`useEffect`), and anywhere you use **TanStack Query** hooks. Most of your module `components/` will likely be client components.

### 3. Data Fetching & State
*   **Do not use `useEffect` for data fetching.**
*   Write your Axios requests inside `modules/[feature]/services/`.
*   Consume those services using TanStack Query inside `modules/[feature]/hooks/`. 
*   This automatically handles loading states, error states, and caching.

### 4. Styling & UI Components
*   Use **Shadcn UI** for standard elements. If you need a new primitive (like a Select dropdown or Modal), add it via `npx shadcn@latest add <component>`.
*   Use **Tailwind CSS** for all other styling. Avoid writing custom CSS unless absolutely necessary.

### 5. Naming Conventions
*   **React Components:** PascalCase (e.g., `UserProfile.tsx`).
*   **Custom Hooks:** camelCase, prefixed with `use` (e.g., `useUserData.ts`).
*   **Services/Utils:** kebab-case or camelCase (e.g., `user.service.ts`).
*   **Types:** kebab-case (e.g., `user.types.ts`).

---

## 🚀 Getting Started

### 1. Clone & Branch
Clone the repository and immediately create your feature branch:
```bash
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the starter page.

### 4. Run Tests
Ensure your code doesn't break existing functionality before committing:
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```
