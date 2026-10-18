---
name: daily-scrum-update
description: >-
  Prepares professional, concise Daily Scrum Standup meeting updates covering yesterday's backend & frontend
  accomplishments, today's plan, and blockers. Automatically generates separate English (scrum-update-en.md)
  and Bengali (scrum-update-bn.md) markdown files directly in the workspace root.
---

# Daily Scrum Standup Preparation Skill

This skill prepares structured, professional Daily Scrum Standup meeting updates for engineering teams. It analyzes recent commits, Jira tickets, and code changes across both **backend** and **frontend**, producing separate English and Bengali (`.md`) update files in the workspace root.

---

## 🎯 1. Output Requirements

When activated, this skill **MUST** generate two distinct markdown files in the project root:

1. **`scrum-update-en.md`** — English standup update (Bullet Points + Spoken Script).
2. **`scrum-update-bn.md`** — Bengali (বাংলা) standup update (Bullet Points + Spoken Script).

---

## 🔄 2. Step-by-Step Workflow

### Step 1: Inspect Recent Progress
Before drafting the update, inspect:
1. **Backend Git Log**: Check recent commits in `talentx2026q3.backend` (`git log -n 5 --oneline`).
2. **Frontend Git Status & Changes**: Check recent work in `talentx2026q3.frontend`.
3. **Jira Ticket Context**: Check current ticket ID (e.g. `TX26-191`), current status, and key acceptance criteria.
4. **Testing Status**: Check unit test runs and pass rates (`dotnet test`, `npm test`).

### Step 2: Extract the 3 Core Scrum Questions
- **1. What was accomplished yesterday / recently?**
  - **Backend**: Specific endpoints, CQRS commands/queries, JWT token handling, migrations, bugfixes, unit tests.
  - **Frontend**: Pages, components, Wellfound styling, responsive layouts, hooks, TanStack Query integrations.
- **2. What is the plan for today?**
  - Next features, connecting frontend to backend APIs, writing tests, refactoring, PR review preparation.
- **3. Any blockers or dependencies?**
  - If none: Explicitly state *"No blockers at the moment."*
  - If any: Clear statement of the dependency (e.g., SMTP configuration, OAuth credentials, PR review).

---

## 📄 3. Standard File Templates

### 3.1 English Template (`scrum-update-en.md`)

```markdown
# 🎙️ Daily Scrum Standup Update — [Date]
**Ticket**: [Ticket-ID] — [Ticket Summary]  
**Status**: [In Progress / In Review]

---

### 1. Yesterday's Accomplishments
- **Backend**:
  - Implemented [Feature / Endpoint name] (`POST /api/v1/...`).
  - Added JWT Access & Refresh token generation via `ITokenService`.
  - Wrote and passed comprehensive unit tests ([X]/[X] tests passing).
- **Frontend**:
  - Built/updated [Page / Component name] with Wellfound design standards.
  - Ensured full mobile and desktop responsiveness without horizontal scroll.
  - Integrated TanStack Query hooks with automatic token storage.

### 2. Today's Plan
- [ ] Implement [Next Feature / Stepper step / API connection].
- [ ] Verify responsive layout across mobile and tablet viewports.
- [ ] Run test suite and prepare PR.

### 3. Blockers / Dependencies
- **Blockers**: None. Everything is progressing as planned.

---

### 🗣️ Quick Spoken Script (30-60s)
> *"Hi everyone, yesterday on [Ticket-ID], I worked on both backend and frontend. On the backend, I completed [key backend work, e.g. JWT token issuance on OTP verification and Google sign-in] and verified all [X] unit tests are passing. On the frontend, I worked on [key frontend work, e.g. the 2-column split sign-up layout, token storage, and responsive views]. Today, my plan is to work on [today's task]. I currently have no blockers. Thanks!"*
```

---

### 3.2 Bengali Template (`scrum-update-bn.md`)

```markdown
# 🎙️ ডেইলি স্ক্রাম স্ট্যান্ডআপ আপডেট — [Date]
**টিকেট**: [Ticket-ID] — [Ticket Summary]  
**স্ট্যাটাস**: [In Progress / In Review]

---

### ১. গতকাল যা সম্পন্ন করেছি
- **ব্যাকএন্ড (Backend)**:
  - [ফিচার বা এন্ডপয়েন্টের নাম] ইমপ্লিমেন্ট করেছি (`POST /api/v1/...`)।
  - `ITokenService` এর মাধ্যমে JWT Access ও Refresh টোকেন জেনারেট করেছি।
  - ইউনিট টেস্ট কমপ্লিট করেছি ([X]/[X] টেস্ট সফলভাবে পাস করেছে)।
- **ফ্রন্টএন্ড (Frontend)**:
  - Wellfound ডিজাইন স্ট্যান্ডার্ড অনুযায়ী [পেইজ বা কম্পোনেন্ট] তৈরি/আপডেট করেছি।
  - মোবাইল ও ডেস্কটপ সব ডিভাইসে রেসপনসিভনেস নিশ্চিত করেছি।
  - TanStack Query হুক ও লোকাল স্টোরেজে টোকেন সেভ করার কাজ শেষ করেছি।

### ২. আজকের কাজের পরিকল্পনা
- [ ] [আজকের মূল কাজের তালিকা/ফিচার]।
- [ ] মোবাইল এবং ট্যাবলেট ভিউপোর্টে লেআউট ও ফাংশনালিটি টেস্ট করা।
- [ ] টেস্ট রান করা এবং PR তৈরি করা।

### ৩. কোনো ব্লকার আছে কি না?
- **ব্লকার**: বর্তমানে কোনো ব্লকার নেই। সবকিছু ঠিকঠাক চলছে।

---

### 🗣️ স্ট্যান্ডআপে বলার জন্য স্ক্রিপ্ট (Spoken Script)
> *"সবাইকে শুভ সকাল/আসসালামু আলাইকুম। গতকাল আমি [Ticket-ID] এর ব্যাকএন্ড এবং ফ্রন্টএন্ড দুইটা পার্টেই কাজ করেছি। ব্যাকএন্ডে [যেমন: OTP ভেরিফিকেশন ও Google সাইন-ইনে JWT টোকেন জেনারেশন কমপ্লিট করেছি এবং সব ইউনিট টেস্ট পাস করেছে]। ফ্রন্টএন্ডে [যেমন: সাইন-আপ ও ভেরিফিকেশনের রেসপনসিভ ডিজাইন এবং টোকেন সেভ করার ইন্টিগ্রেশন করেছি]। আজকে আমি [আজকের কাজ]-এর উপর কাজ করব। আমার কোনো ব্লকার নেই। ধন্যবাদ।"*
```

---

## 📋 4. Rules & Guidelines

1. **Be Specific & Factual**: Always cite the exact ticket number (`TX26-191`), concrete endpoints, and test counts.
2. **Keep it Concise**: Standup is a 1-2 minute update; avoid unnecessary technical minutiae.
3. **Always Update Both Files**: Never generate only one language. Write both `scrum-update-en.md` and `scrum-update-bn.md` simultaneously.
4. **Natural Spoken Tone**: The spoken script should read naturally and comfortably for speaking aloud in an agile meeting.
