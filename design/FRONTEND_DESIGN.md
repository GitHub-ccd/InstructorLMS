# Frontend Technical Design Document

## 1. Overview & Architectural Philosophy

The **InstructorLMS** frontend is designed as a high-efficiency, instructor-facing web application. It prioritizes **speed, low cognitive overhead, zero bloat, and instant interactivity**.

### Key Design Principles:
1. **Server-First Architecture**: Built using **Next.js 14 App Router** with **React Server Components (RSC)**. Data fetching occurs directly on the server at page render time, eliminating unnecessary `useEffect` data-fetching loops or client-side global state management libraries (Redux, Zustand, React Query).
2. **Server Actions for Mutations**: Data updates (marking attendance, grading homework, saving strategy notes, logging workload) are powered by Next.js **Server Actions** (`'use server'`). Mutations update the Neon PostgreSQL database directly and trigger `revalidatePath()` or `router.refresh()` for seamless, zero-reload UI updates.
3. **Responsive Dark-Theme System**: Styled with **Tailwind CSS**, featuring a curated dark palette (Slate/Zinc backdrops, Emerald accents for present/success, Amber for late/pending, Rose for absent/at-risk, Indigo for navigation).
4. **Zero Student/Public Facing Surfaces**: Designed strictly for the instructor. Layouts maximize information density while remaining clean and scannable during fast-paced classroom management.

---

## 2. Technology Stack & Key Dependencies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + Custom CSS Variables ([`src/app/globals.css`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/globals.css))
- **Iconography**: `lucide-react` (Crisp, vector UI icons)
- **Utility Functions**: `clsx` & `tailwind-merge` ([`src/lib/utils.ts`](file:///e:/My_GitHub__projects/InstructorLMS/src/lib/utils.ts))

---

## 3. Directory & Component Architecture

```
public/
└── avatars/
    ├── instructors/            # Headshots for instructors (e.g. alex-vance.jpg, sarah-connor.jpg)
    ├── students/               # Headshots for enrolled students (student-1.jpg to 6.jpg)
    ├── presets/                # Preset gallery headshots for quick admin selection
    ├── uploads/                # Local uploads and webcam capture assets
    └── default-avatar.svg      # Graceful fallback avatar vector

src/
├── app/
│   ├── layout.tsx              # Root layout with dark background & responsive Sidebar
│   ├── page.tsx                # Executive Analytics Dashboard (/)
│   ├── globals.css             # Tailwind base imports & custom global utilities
│   ├── actions/
│   │   └── course.ts           # Server Action: addExistingCourseToSchedule
│   ├── admin/
│   │   ├── page.tsx            # Institutional Admin Console (/admin - restricted to ADMIN)
│   │   ├── AdminClient.tsx     # Client view with Instructor, Course, & Student management tabs
│   │   └── actions.ts          # Server Actions: createInstructorAction, createStudentAction, createCourseAction
│   ├── announcements/
│   │   └── page.tsx            # External Announcement Builder UI (/announcements)
│   ├── api/
│   │   ├── auth/[...path]/     # Neon Auth routing handlers
│   │   └── upload-avatar/      # Avatar upload & webcam base64 storage endpoint
│   ├── attendance/
│   │   ├── page.tsx            # Lightning Attendance Matrix (/attendance)
│   │   ├── AttendanceClient.tsx # Client attendance roll-call with avatars & 14-day calendar picker
│   │   └── actions.ts          # Server Actions: saveAttendanceSession, toggleAttendanceRecord
│   ├── homework/
│   │   ├── page.tsx            # Deliverable Grade & Status Matrix (/homework)
│   │   ├── HomeworkClient.tsx  # Matrix grid with Homework, Quiz, Presentation filters & avatar column
│   │   └── actions.ts          # Server Actions: createAssignment, updateSubmissionGrade, deleteAssignment
│   ├── signin/
│   │   ├── page.tsx            # Persona switcher (Alex Vance vs Sarah Connor) & Neon Magic Link
│   │   └── SignInClient.tsx    # Interactive profile switcher client component
│   ├── students/
│   │   ├── page.tsx            # Student Roster Directory (/students)
│   │   ├── StudentsClient.tsx  # Performance cards with avatars, soft-delete archive, & enrollment modal
│   │   ├── actions.ts          # Server Actions: toggleStudentRemoval, enrollExistingStudentInCourse
│   │   └── [id]/
│   │       ├── page.tsx        # Individual Student Profile & Strategy Log (/students/[id])
│   │       └── StudentDetailClient.tsx # Student profile detail view with avatar header
│   └── workload/
│       ├── page.tsx            # Dual-Side Labor & Prep Log (/workload)
│       └── actions.ts          # Server Action: createWorkloadLog
├── components/
│   ├── Sidebar.tsx             # Persistent responsive left navigation bar with avatar & role badge
│   ├── AvatarPicker.tsx        # 3-tab avatar manager (Presets, File Upload, Live Webcam Capture)
│   ├── BackfillCalendarPicker.tsx # 14-day rolling window calendar picker for attendance backfill
│   ├── AddCourseButton.tsx     # Dynamic button launching course schedule modal
│   └── AddCourseToScheduleModal.tsx # Modal allowing instructors to adopt existing catalog courses
└── lib/
    ├── auth/                   # Neon Auth server & client utilities
    ├── prisma.ts               # Singleton Prisma Client instance for RSC & Server Actions
    └── utils.ts                # Tailwind class helper (cn)
```

---

## 4. UI Page Specifications & Interaction Patterns

### A. Navigation Sidebar ([`src/components/Sidebar.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/components/Sidebar.tsx))
- **Type**: Client Component (`'use client'`).
- **Functionality**: Uses `usePathname()` to highlight the active route. Displays logged-in instructor avatar, name, email, and role badge (`Admin` or standard instructor).
- **Routes**:
  - `📊 Overview Dashboard` (`/`)
  - `⚡ Attendance Tracker` (`/attendance`)
  - `📝 Homework Matrix` (`/homework`)
  - `👨‍🎓 Student Profiles` (`/students`)
  - `⏱️ Workload Log` (`/workload`)
  - `📢 Announcement Builder` (`/announcements`)
  - `🛡️ Admin Console` (`/admin` - restricted to `ADMIN` role)
- **Profile Switcher Link**: Prominent quick-link to `/signin` for fast role and persona switching.

---

### B. Profile Picture & Avatar System
- **Core Strategy**: Zero-blob architecture. All images are hosted as Next.js static assets under `/public/avatars/`. The database stores only relative URL strings.
- **`<AvatarPicker>` Component ([`src/components/AvatarPicker.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/components/AvatarPicker.tsx))**:
  - **Tab 1: Preset Gallery**: Instant one-click selection of pre-rendered, realistic AI-generated instructor and student headshots.
  - **Tab 2: Local File Upload**: File picker and drag-and-drop zone with instant local preview and upload to `/api/upload-avatar`.
  - **Tab 3: Live Webcam Capture**: Directly streams local webcam video using `navigator.mediaDevices.getUserMedia`, provides a live viewfinder with a snapshot shutter button, renders the captured frame to an HTML5 canvas, and submits the base64 JPEG to `/api/upload-avatar`.
- **App-Wide Avatar Presence**:
  - **Sidebar Profile Card**: Displays circular avatar of the active instructor.
  - **Executive Dashboard Header**: High-impact avatar banner badge.
  - **At-Risk Student Cards**: Displays circular student avatar beside student names.
  - **Student Roster & Detail View**: Visual avatar presentation across performance cards and detail headers.
  - **Attendance Tracker**: Rendered next to each student in the attendance roll-call roster.
  - **Homework Matrix**: Displayed within the sticky student column.

---

### C. Executive Class Analytics Dashboard (`/` - [`src/app/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/page.tsx))
- **Type**: Server Component (RSC).
- **Scoped Data Fetching**: Scopes courses, students, and stats to the active instructor, with fallback to all courses.
- **UI Design**:
  - **Top Banner**: Displays active instructor's avatar, role badge, quick course-scheduling button, and profile switcher.
  - **4 Top KPI Cards**: Active Students, Attendance %, Assessment Delivery %, Workload Hours.
  - **At-Risk Student Alerts**: Displays flagged students (<80% attendance, missing homework, active academic strategy) with student avatars.
  - **Course Scheduling Modal Launcher**: Allows instructors to schedule existing institutional catalog courses.

---

### D. Lightning Attendance Tracker (`/attendance` - [`src/app/attendance/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/attendance/page.tsx))
- **Type**: Hybrid (RSC page with interactive `AttendanceClient`).
- **Core Features**:
  - Single-click status toggling (`PRESENT`, `LATE`, `ABSENT`).
  - **Rolling 14-Day Calendar Picker (`BackfillCalendarPicker`)**: Interactive calendar enabling attendance backfilling for any date within the past 14 days, with all dates outside the 14-day window strictly disabled/grayed out.
  - Quick mass-action buttons ("All Present", "All Absent").
  - Visual student avatars in the roll-call roster.

---

### E. Homework & Assessment Matrix (`/homework` - [`src/app/homework/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/homework/page.tsx))
- **Type**: Hybrid (RSC page with interactive `HomeworkClient`).
- **Multi-Deliverable Management**: Supports **Homework**, **Quizzes**, and **Presentations** with type filtering tabs.
- **Sticky Matrix Grid**: Sticky leftmost student column with student avatars and horizontal scrollable assignment columns.
- **Server Actions**: Add assignment, delete assignment, update submission status (`MISSING`, `SUBMITTED`, `GRADED`), and live point grade entry.

---

### F. Student Roster & Performance Profiles (`/students` & `/students/[id]`)
- **Roster Page (`/students/page.tsx`)**:
  - Performance cards with avatars, attendance rate, completed homework counts, and active academic intervention indicators.
  - **Enroll Student in Class Modal**: Allows instructors to enroll any registered student from the institutional directory into their courses.
  - **Soft-Delete Archive/Restore**: Instructors can archive inactive students without losing historical grade or attendance records.
- **Profile Page (`/students/[id]/page.tsx`)**:
  - Profile header with large student avatar.
  - Comprehensive attendance record timeline and homework deliverable audit.
  - **Academic Intervention Log**: Free-form strategy notes editor with instant server action persistence.

---

### G. Institutional Admin Console (`/admin` - [`src/app/admin/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/admin/page.tsx))
- **Role Restriction**: Strictly accessible only by users with role `ADMIN` (e.g. Dr. Alex Vance). Standard instructors navigating here are greeted with an unauthorized restriction warning.
- **Core Tabs**:
  1. **Instructors**: Directory of all faculty with avatars, roles, assigned courses, and an **Add Instructor** modal featuring `<AvatarPicker>`.
  2. **Courses**: Institutional course catalog directory with an **Add Course** creation modal.
  3. **Students**: Master registered student registry with avatars, lifecycle status, and a **Register Student** modal featuring `<AvatarPicker>`.

---

### H. Dual-Side Workload & Labor Log (`/workload` - [`src/app/workload/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/workload/page.tsx))
- **Core Feature**: Form to record preparation hours, contact/teaching hours, and session notes per course.
- **Server Action**: `createWorkloadLog(courseId, date, prepHours, contactHours, notes)`.
- **UI Summary**: Visual breakdown chart comparing prep time vs contact time to monitor teaching commitments.

---

### I. External Announcement Builder (`/announcements` - [`src/app/announcements/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/announcements/page.tsx))
- **Core Feature**: Client-side interactive editor for drafting class announcements.
- **UX Details**: Live formatting preview and single-click **"Copy to Clipboard"** for publishing to external communication channels (Email, Slack, Discord, Canvas).

---

### J. Profile Switcher & Persona Authentication (`/signin` - [`src/app/signin/page.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/app/signin/page.tsx))
- **Active Persona Cards**: Quick single-click switching between test profiles:
  - **Dr. Alex Vance** (Institutional Admin persona with full catalog and student creation privileges).
  - **Prof. Sarah Connor** (Standard Instructor persona with autonomous course deliverable control and student enrollment privileges).
- **Neon Auth Magic Link**: Native passwordless magic link email authentication powered by Neon Auth.

---

## 5. How to Request Future UI Changes

When requesting frontend updates or new UI features, reference these components and patterns:

1. **Adding a New Page/View**:
   - Create a new folder under `src/app/<route-name>/page.tsx`.
   - Add the navigation link in [`src/components/Sidebar.tsx`](file:///e:/My_GitHub__projects/InstructorLMS/src/components/Sidebar.tsx).
2. **Adding Interactive Form Actions**:
   - Create a dedicated `actions.ts` file alongside `page.tsx`.
   - Mark the file with `'use server'`.
   - Call `revalidatePath('/<route-name>')` inside the server action after updating Prisma.
3. **Modifying Color Themes or UI Elements**:
   - Palette modifications are made via standard Tailwind classes (`bg-slate-900`, `border-slate-800`, `text-emerald-400`, `text-rose-400`).
   - Standard card container style: `bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm`.
