<!-- Last Updated: 2026-08-17 | Auth & User Lifecycle Architecture Specification -->

# TalentX — Authentication & User Lifecycle Specification

This document defines the **authoritative business requirements, sequence flows, and database models** for all user types across TalentX (Employers, Guests, and Talent/Candidates).

---

## 🏛️ 1. Core Principles & Business Requirements

1. **NO Sign Up Page for Talent/Candidates**:
   - There is **NO explicit public registration page** for Talent.
   - The public registration page (`/signup`) is strictly and exclusively for **Employers**.
   - Candidates/Talent browse public job listings (`/jobs`) as guest users.

2. **Just-In-Time (JIT) Talent Account Provisioning**:
   - When a guest candidate applies to a job by filling the application form (providing Name, Email, Resume, etc.), the backend automatically provisions a `User` account.
   - **Database Fields Used (NO Extra DB Columns)**:
     - `Role`: `UserRole.Talent`
     - `IsVerified`: `false`
     - `Email`: candidate's email
     - `Name`: candidate's full name
   - The backend securely generates a temporary password and emails it to the talent.

3. **Talent First Login & Mandatory Password Change**:
   - The talent receives their auto-generated temporary password via email and visits `/login`.
   - Upon successful login with the temporary password, the system detects `IsVerified == false`.
   - The system **strictly forces a redirect to `/change-password`** and blocks dashboard access until the password is updated.
   - Once the talent updates their password:
     - Backend executes `user.MarkAsVerified()` setting `IsVerified = true`.
     - Talent is redirected to the Talent Dashboard and can now view applications, update their profile, and apply to other jobs.

4. **Returning Talent Subsequent Job Applications**:
   - When a candidate applies to another job with their email:
     - Backend checks if the email is already registered.
     - If the email belongs to an existing Talent, backend sends a **10-minute temporary password / OTP** to their email.
     - Candidate confirms their application using the 10-minute code/credentials.

---

## 🔄 2. End-to-End Sequence Diagrams

### Flow A: Employer Registration & Onboarding (Standard Flow)
```mermaid
sequenceDiagram
    autonumber
    actor Employer as Employer / Founder
    participant FE as Frontend (Next.js)
    participant API as Backend (ASP.NET Core)
    participant Email as Email Service
    participant DB as Database (EF Core / PostgreSQL)

    Employer->>FE: Fills Employer Registration (/signup)
    Note right of Employer: Name, Work Email, Company Name, Password
    FE->>API: POST /api/v1/employers/register
    API->>DB: Check email duplicate (409 Conflict if exists)
    API->>DB: Create User (Role: Employer, IsVerified: false)
    API->>Email: Send Confirmation Token / OTP
    API-->>FE: 201 Created (Token sent)
    Employer->>FE: Verifies OTP / Confirmation Token (/verify-email)
    FE->>API: POST /api/v1/auth/verify-email
    API->>DB: user.MarkAsVerified() -> IsVerified = true
    API-->>FE: Set JWT + Refresh Cookie
    FE->>FE: Redirect to Employer Dashboard
```

---

### Flow B: Talent Just-In-Time Provisioning & First-Time Login
```mermaid
sequenceDiagram
    autonumber
    actor Talent as Guest Candidate
    participant FE as Frontend (Next.js)
    participant API as Backend (ASP.NET Core)
    participant Email as Email Service
    participant DB as Database (EF Core / PostgreSQL)

    Note over Talent,DB: Step 1: Job Application
    Talent->>FE: Views Public Job (/jobs/{id})
    Talent->>FE: Submits Application Form (Name, Email, Resume, Answers)
    FE->>API: POST /api/v1/jobs/{id}/apply
    API->>DB: Query User by Email
    Note right of API: Email not found -> JIT Provisioning (No extra DB columns)
    API->>DB: Create User (Role: Talent, IsVerified: false)
    API->>DB: Create JobApplication (JobId, CandidateId, ResumeUrl)
    API->>Email: Send Auto-Generated Temporary Password to Talent Email
    API-->>FE: 200 OK (Application Submitted + Account Created)

    Note over Talent,DB: Step 2: First Login & Forced Password Change
    Talent->>FE: Receives email & navigates to /login
    Talent->>FE: Submits Email + Temporary Password
    FE->>API: POST /api/v1/auth/login
    API->>DB: Validate credentials
    Note right of API: User.IsVerified == false
    API-->>FE: Returns Auth Token + Flag { isVerified: false, role: "Talent" }
    FE->>FE: Route Guard intercepts & forces redirect to /change-password
    Talent->>FE: Enters new permanent password
    FE->>API: POST /api/v1/auth/change-password
    API->>DB: Update password + user.MarkAsVerified() -> IsVerified = true
    API-->>FE: 200 OK (Password updated, IsVerified: true)
    FE->>FE: Redirects to Talent Dashboard (/talent/dashboard)
```

---

### Flow C: Returning Talent Subsequent Job Applications
```mermaid
sequenceDiagram
    autonumber
    actor Talent as Returning Candidate
    participant FE as Frontend (Next.js)
    participant API as Backend (ASP.NET Core)
    participant Email as Email Service
    participant DB as Database (EF Core / PostgreSQL)

    Talent->>FE: Submits Application Form on new job with existing Email
    FE->>API: POST /api/v1/jobs/{id}/apply
    API->>DB: Query User by Email -> Found existing Talent Profile
    API->>Email: Send 10-minute valid Temporary Password / One-Time Passcode
    API-->>FE: 200 OK (Requires 10-Min OTP verification)
    Talent->>FE: Enters 10-minute temporary password / OTP
    FE->>API: POST /api/v1/jobs/{id}/confirm-apply
    API->>DB: Create new JobApplication linked to existing TalentId
    API-->>FE: 200 OK (Application Confirmed)
```

---

## 🗄️ 3. Database Schema Alignment (Zero Extra Columns)

The lifecycle strictly utilizes the existing domain `User` entity properties:

```csharp
public class User : BaseEntity
{
    public string UserId { get; protected set; } = string.Empty;
    public string Name { get; protected set; } = string.Empty;
    public string Email { get; protected set; } = string.Empty;
    public UserRole Role { get; protected set; } // UserRole.Employer | UserRole.Talent | UserRole.Admin
    public bool IsVerified { get; protected set; } = false;

    public void MarkAsVerified()
    {
        IsVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
```

- **`IsVerified == false`**: Indicates unverified email for Employer OR first-time temporary password login for Talent.
- **`IsVerified == true`**: Indicates verified account with active dashboard access.
- **NO new or custom schema migrations required for this lifecycle.**

---

## 🖥️ 4. Frontend UI Alignment Rules

1. **Header Navigation**:
   - `Sign Up` button leads directly to `/signup` (Employer Signup).
   - Candidate navigation options: `Discover Jobs` (`/jobs`) and `Log In` (`/login`).
   - No "Sign Up as Candidate" dropdowns or links anywhere on the platform.

2. **Hero & Split Marketplace Cards**:
   - Candidate Card CTA: `Browse Startup Jobs` (`/jobs`).
   - Employer Card CTA: `Post a Job for Free` (`/signup?role=employer`).

3. **Route Guards & Middleware**:
   - Authenticated Talent with `isVerified: false` are restricted strictly to `/change-password`.
