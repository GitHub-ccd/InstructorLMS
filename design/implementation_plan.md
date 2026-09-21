# Implementation Plan – Phase 2 Enhancements for InstructorLMS

## Goal
Add authentication, instructor management, refined attendance back‑fill, homework type support, soft‑delete for students, and responsive UI improvements. This phase builds on the existing POC and prepares the app for real‑world multi‑instructor use.

## User Review Required
> [!IMPORTANT]
> The plan reflects the decisions you just confirmed (Neon Auth, admin‑only instructor creation, 14‑day back‑fill window, assignment type field, soft‑delete flag). No further design choices are pending.

## Open Questions
> [!NOTE]
> All open questions have been answered in the previous exchange; no additional clarification needed.

## Proposed Changes
---
### 1️⃣ Authentication & Instructor Selection (Neon Auth)
- **Add Neon Auth policy** using `neon auth init` (creates `@neon/auth` configuration).
- **Create login page** `src/app/signin/page.tsx` that calls `await signInWithEmail(email)` (magic‑link) and supports OTP/MFA.
- **Persist session** via HTTP‑only cookie (`@neondatabase/auth`).
- **Update root layout** (`src/app/layout.tsx`) to read the session (`await getAuthSession()`) and expose `instructorId` to child pages via context.
- **Add instructor selector** (optional) on the dashboard that lists all instructors belonging to the same org; clicking a card updates the session cookie with the chosen instructor ID.

### 2️⃣ Instructor & Student Admin Workflow
- **Admin UI** (`src/app/admin/page.tsx`) – restricted to users with `role = "ADMIN"` (checked via Neon Auth claims).
- **Endpoints** (`src/app/api/admin/instructors/route.ts` & `students/route.ts`) to create, update, and list instructors and students.
- **Student enrollment** – In the Course view, add a **"Add Existing Student"** dropdown that searches the `Student` table and associates the selected student with the current course.

### 3️⃣ Attendance Tracker Enhancements
- **Server Actions** (`src/app/attendance/actions.ts`):
  - `createAttendanceSession(date: string, courseId: string)` → returns session ID.
  - `saveAttendanceRecords(sessionId: string, records: AttendanceRecordInput[])`.
  - `deleteAttendanceSession(sessionId: string)` (only allowed if `date` is within the last 14 days).
- **UI updates** (`src/app/attendance/page.tsx`):
  - Date picker allowing selection of any date **≤ 14 days ago**.
  - **Save** and **Clear** buttons.
  - Inline **Undo** (revert to previous state) limited to the same 14‑day window.

### 4️⃣ Homework Assignment Type Support
- **Schema change** (`prisma/schema.prisma`):
  ```prisma
  enum AssignmentType {
    HOMEWORK
    QUIZ
    PRESENTATION
  }

  model Assignment {
    id          String          @id @default(cuid())
    courseId    String
    title       String
    dueDate     DateTime
    totalPoints Int             @default(100)
    type        AssignmentType  @default(HOMEWORK) // NEW
    createdAt   DateTime        @default(now())
    // ... existing relations
  }
  ```
- **Server Action** `createAssignment(courseId, title, dueDate, type)`.
- **UI** (`src/app/homework/page.tsx`): Add **"Add Assignment"** modal with a dropdown for the type.
- **Table styling**: Wrap matrix in `<div class="overflow-x-auto">` and give each column `min-w-[200px]` so horizontal scrolling appears as assignments grow.

### 5️⃣ Soft‑Delete / Flagged Student Removal
- **Schema addition** (`prisma/schema.prisma`):
  ```prisma
  model Student {
    id          String   @id @default(cuid())
    // ... existing fields
    isRemoved   Boolean  @default(false) // NEW flag
  }
  ```
- **Server Action** `toggleStudentRemoval(studentId, removed)` – sets the flag.
- **Dashboard filtering**: Add `where: { isRemoved: false }` to all aggregate queries so removed students are excluded from analytics.
- **Retention policy**: A nightly background job (Neon Functions) will permanently purge records for students flagged `isRemoved = true` that have been inactive > 30 days.
- **Re‑activate**: Setting `isRemoved` back to `false` instantly restores the student’s historic data.

### 6️⃣ Responsive UI Refactor
- **Sidebar**: Convert to a mobile drawer (`<Dialog>` from `@headlessui/react`) that collapses on `<md` breakpoints.
- **Layouts**: Use Tailwind responsive grid utilities (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- **Tables**: Add `overflow-x-auto` wrappers and responsive font sizes (`text-sm md:text-base`).
- **Testing**: Verify with Chrome DevTools device toolbar across iPhone 14, iPad, and typical desktop widths.

---
## Verification Plan
### Automated Tests
- Run `npx prisma generate && npx prisma db push` – ensure schema migrations succeed.
- Execute existing Jest tests plus new tests for:
  - Auth session retrieval.
  - Attendance back‑fill window enforcement.
  - Assignment creation with type enum.
  - Soft‑delete flag filtering.

### Manual Verification
1. **Auth** – Sign in with a test instructor email, verify dashboard loads data scoped to that instructor.
2. **Instructor Admin** – As an admin, create a new instructor and a new student; confirm they appear in the selector.
3. **Attendance** – Create a session for 5 days ago, edit records, save, then attempt edit on a session > 14 days old (should be blocked).
4. **Homework** – Add a `QUIZ` assignment, verify it appears in the matrix, and that horizontal scroll works when many assignments exist.
5. **Student Removal** – Flag a student as removed; confirm they disappear from dashboards but remain in the DB. Reactivate and verify data returns.
6. **Responsive** – Open each page on mobile device emulation and ensure layout, navigation drawer, and table scrolling work.
7. **Deploy** – Push to `main`; Vercel should build and deploy without errors.

---
**Implementation Timeline** (approx.):
- Week 1: Auth integration + admin UI.
- Week 2: Attendance back‑fill logic & UI.
- Week 3: Assignment type schema + UI changes.
- Week 4: Soft‑delete flag and retention job.
- Week 5: Responsive refactor & QA.

Once you confirm the plan, I will begin applying the changes.
