# TalentX — AI-Assisted Recruitment Marketplace

TalentX is an AI-assisted job marketplace engineered to connect technology organizations with top-tier artificial intelligence, data, and software engineering talent.

This monorepo consolidates the full-stack codebase across the distributed backend services and the modern frontend application.

---

## Repository Structure

```
talentx-mono/
├── talentx2026q3.backend/     # ASP.NET Core Web API (.NET 10, Clean Architecture)
│   ├── src/
│   │   ├── TalentX.Domain/         # Core Domain Entities, Enums, Interfaces
│   │   ├── TalentX.Application/    # CQRS Handlers, Validators, DTOs, Mappings
│   │   ├── TalentX.Infrastructure/ # EF Core, PostgreSQL, Repositories, Identity, AWS S3
│   │   ├── TalentX.Migrations/     # Database Migrations
│   │   └── TalentX.API/            # Controllers, Routing, Middleware, DI Wiring
│   └── test/                       # 2,300+ Unit and Integration Tests (xUnit, Moq)
│
├── talentx2026q3.frontend/    # Next.js 16 Application (App Router, Tailwind CSS v4)
│   ├── app/                        # App Router Pages, Layouts, Server Actions
│   ├── modules/                    # Domain-Driven Feature Modules (Components, Hooks, Services)
│   ├── components/                 # Reusable UI Primitives (shadcn/ui base-nova)
│   └── tests/                      # 2,700+ Unit and Component Tests (Jest, RTL)
│
├── .gitignore                 # Monorepo-level git ignore rules
└── README.md                  # Project overview and documentation
```

---

## Tech Stack

### Backend (`talentx2026q3.backend`)
- **Framework**: ASP.NET Core (.NET 10 / C# 13)
- **Architecture**: Clean Architecture + CQRS via MediatR
- **Database & ORM**: PostgreSQL with Entity Framework Core (Npgsql)
- **Authentication & Security**: ASP.NET Core Identity, JWT Bearer tokens, Google OAuth 2.0, OTP verification
- **Validation**: FluentValidation
- **Cloud Storage**: AWS S3 (Chunked Multipart Upload pipeline for large media/resumes)
- **Real-Time Communication**: SignalR hubs for live alerts and notifications
- **Testing**: xUnit, FluentAssertions, Moq

### Frontend (`talentx2026q3.frontend`)
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (`base-nova` style)
- **State & Server Data**: TanStack React Query, Axios
- **Form & Validation**: React Hook Form, Zod
- **Accessibility**: WCAG 2.1 AA compliant UI design, high-contrast palette (`bg-emerald-700`)
- **Testing**: Jest, React Testing Library

---

## Key Features

- **Multi-Role Identity & Access**: Role-based access control supporting Employer, Talent, Admin, and Guest workflows.
- **Job Lifecycle & Management**: Full job creation, multi-step publishing, filtering, deadline monitoring, and server-side search.
- **Candidate Hiring Pipeline**: Interactive applicant tracking, stage transitions (Applied, Screening, Interview, Offered, Rejected), and interview coordination.
- **Resume Ingestion Pipeline**: In-memory AI resume extraction, secure PDF/DOCX processing, and S3 multipart video introduction uploads.
- **Real-Time Notifications**: SignalR-powered immediate alerts for application status changes, interviews, and job alerts.
- **Company Profiles & Reviews**: Company showcase pages, verified employee/candidate reviews, and rating breakdowns.

---

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (v15+)
- Git

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd talentx2026q3.backend
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Update database connection string in `src/TalentX.API/appsettings.Development.json` or user-secrets:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=talentx_db;Username=postgres;Password=yourpassword"
     }
   }
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update -p src/TalentX.Migrations -s src/TalentX.API
   ```

5. Run the API:
   ```bash
   dotnet run --project src/TalentX.API
   ```

The API will start at `https://localhost:5001` / `http://localhost:5000` with Swagger/OpenAPI documentation.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd talentx2026q3.frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:3000`.

---

## Running Tests

### Backend Test Suite
```bash
cd talentx2026q3.backend
dotnet test
```

### Frontend Test Suite
```bash
cd talentx2026q3.frontend
npm test
```

---

## License

This project is licensed under private proprietary terms. All rights reserved.
