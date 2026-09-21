# System Architecture & Future Agent Guide

## 1. Executive Summary & Context for Future AI Agents

This document provides a complete technical map of **InstructorLMS**, built for human developers and future AI coding agents working on this codebase.

### Project Goals & Boundaries:
- **Use Case**: Single-instructor LMS for managing courses, attendance, homework grades, student interventions, workload logs, and class announcements.
- **Audience**: Strictly instructor-facing. There are **no student accounts, no public logins, and no external REST API surfaces**.
- **Cost Target**: **$0/month**. Hosted on Vercel (Hobby tier) with Neon Serverless PostgreSQL (Free tier).

---

## 2. Full Architecture Diagram

```
[ Instructor Browser ]
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Next.js 14 Web Application (Hosted on Vercel)              │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ React Server Components (RSC)                           │ │
│ │ - Fetches data directly via Prisma Client               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                             │                               │
│                             ▼                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Server Actions ('use server')                           │ │
│ │ - Handles mutations (attendance, grades, strategies)    │ │
│ │ - Calls revalidatePath() for zero-reload updates        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Neon Cloud Serverless PostgreSQL                            │
│                                                             │
│ - Pooled Connection (DATABASE_URL) for app web requests     │
│ - Direct Connection (DATABASE_URL_UNPOOLED) for migrations  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key File Index

| File Path | Description & Responsibility |
|-----------|------------------------------|
| [`prisma/schema.prisma`](file:///e:/My_GitHub__projects/InstructorLMS/prisma/schema.prisma) | Declarative Prisma schema for 9 models & Neon PostgreSQL setup. |
| [`prisma/seed.ts`](file:///e:/My_GitHub__projects/InstructorLMS/prisma/seed.ts) | Realistic fictitious dataset generator script (`npm run seed`). |
| [`src/lib/prisma.ts`](file:///e:/My_GitHub__projects/InstructorLMS/src/lib/prisma.ts) | Singleton Prisma Client instance avoiding connection leaks. |
| [`src/components/Sidebar.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/components/Sidebar.tsx) | Navigation sidebar component with active route highlighting. |
| [`src/app/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/page.tsx) | Dashboard view featuring KPI cards & at-risk student warnings. |
| [`src/app/attendance/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/attendance/page.tsx) | Attendance grid with instant toggle status buttons. |
| [`src/app/attendance/actions.ts`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/attendance/actions.ts) | Server Action for toggling student attendance status. |
| [`src/app/homework/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/homework/page.tsx) | Roster x Assignment matrix table with status & grade inputs. |
| [`src/app/homework/actions.ts`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/homework/actions.ts) | Server Actions for updating submission status and numeric grades. |
| [`src/app/students/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/students/page.tsx) | Student roster directory showing attendance & grade stats. |
| [`src/app/students/[id]/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/students/[id]/page.tsx) | Detailed student profile with intervention strategy notes. |
| [`src/app/students/actions.ts`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/students/actions.ts) | Server Action for saving intervention strategy notes. |
| [`src/app/workload/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/workload/page.tsx) | Workload prep vs contact time logging form & visual summary. |
| [`src/app/workload/actions.ts`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/workload/actions.ts) | Server Action for logging prep and contact hours. |
| [`src/app/announcements/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/announcements/page.tsx) | Announcement builder with live preview & clipboard copy. |
| [`neon.ts`](file:///e:/My_GitHub__projects/InstructorLMS/neon.ts) | Neon branch policy definition file. |

---

## 4. Development Workflow & Rules for AI Agents

1. **Schema Mutations**:
   - Always update [`prisma/schema.prisma`](file:///e:/My_GitHub__projects/InstructorLMS/prisma/schema.prisma) first.
   - Run `npx prisma db push` to synchronize changes to Neon Cloud.
   - Never write raw SQL migrations manually when Prisma Client is configured.

2. **Data Fetching Pattern**:
   - Always perform data queries inside Server Components (`async function Page()`) using `prisma.<model>.findMany()`.
   - Never fetch data in `useEffect` on the client side unless building a complex real-time search widget.

3. **Data Mutation Pattern**:
   - Place Server Actions in an adjacent `actions.ts` file or at the top of the file marked with `'use server'`.
   - Always include `revalidatePath('/<route>')` at the end of every Server Action to ensure UI components refresh immediately.

4. **Styling Rules**:
   - Follow the established dark palette (`bg-slate-950`, `bg-slate-900/60`, `border-slate-800`).
   - Use Lucide icons (`lucide-react`) for UI actions and status badges.
