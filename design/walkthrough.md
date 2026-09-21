# Walkthrough: InstructorLMS Build, Test, and Cloud Setup Guide

The **InstructorLMS** web application has been fully built, structured, seeded with realistic fictitious data, and verified via Next.js production build compilation.

---

## 🚀 Part 1: How to Test the App Locally

### 1. Start the Local Server
Run the dev server inside the project root:
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to experience the application.

### 2. Visually Inspect the Seeded Database (Prisma Studio)
To inspect or edit the fictitious database records visually in your browser:
```powershell
npx prisma studio
```
This opens Prisma Studio at **[http://localhost:5555](http://localhost:5555)** where you can view all 16 students, 2 courses, attendance sessions, homework submissions, and workload logs.

---

## 🎯 Features Built & Verified (Phases 1 & 2)

1. **Instructor Access Portal & Neon Auth (`/signin`)**:
   - 1-click active instructor profile selection (Dr. Alex Vance [Admin], Prof. Sarah Connor [Instructor]).
   - Neon Auth Magic Link integration for email verification without passwords.
   - Dynamic session switching via HTTP-only cookies; dashboard and courses automatically re-scope to the chosen instructor.

2. **Institutional Admin Portal (`/admin`)**:
   - Institutional directories for Instructors, Courses, and Registered Students.
   - Create new Instructors with custom roles (`INSTRUCTOR`, `ADMIN`).
   - Create new Courses and assign instructors.
   - Register and enroll students institution-wide.

3. **Lightning Attendance Tracker (`/attendance`)**:
   - 14-day Backfill Window: Date picker allowing back-filling and editing within the last 14 days; sessions >14 days are locked.
   - Session Save button with visual confirmation toasts.
   - Clear Session button to reset/undo mistakes.
   - Quick batch shortcuts: "Mark All Present" & "Mark All Absent".

4. **Homework & Assessment Matrix (`/homework`)**:
   - Added Assessment Type support (`HOMEWORK`, `QUIZ`, `PRESENTATION`) with color-coded badges.
   - "+ Add Assignment" modal: title, type dropdown, due date, and points.
   - Category filtering pills to isolate Quizzes, Homework, or Presentations.
   - Horizontal scrolling matrix with sticky student roster column.

5. **Student Cohort Management & Soft-Delete (`/students` & `/students/[id]`)**:
   - Soft-delete removal: 1-click "Remove from Cohort" flags `isRemoved: true`.
   - Data preservation: Historical attendance and grades remain intact in the database.
   - Analytics protection: Soft-deleted students are excluded from aggregate dashboard KPIs.
   - 1-click "Restore" to reactivate students.
   - "+ Enroll Student in Class" modal to add existing students across the institution to a course.

6. **Executive Class Analytics Dashboard (`/`)**:
   - Real-time KPIs scoped to the active instructor's courses.
   - At-Risk Student Badges & Active Intervention Notes.
   - Active instructor context banner with quick "Switch Profile" button.

7. **Responsive Navigation & Mobile Refactor**:
   - Collapsible slide-over drawer with hamburger menu on mobile/tablet screens.
   - Fixed sticky sidebar on desktop (`md+`).
   - Responsive grid and card systems.

---

## 🌐 Part 2: Step-by-Step Guide to Hooking Up Neon & Vercel ($0 Cost)

### Step 1: Create your Neon Serverless PostgreSQL Database
1. Sign up/log in at **[https://neon.tech](https://neon.tech)** (free account).
2. Click **Create Project**, name it `instructor-lms`.
3. In your project dashboard under **Connection Details**, copy your Connection Strings:
   - **Pooled connection string** (starts with `postgresql://...` with `-pooler`): Save this as `DATABASE_URL`.
   - **Direct connection string** (starts with `postgresql://...` without `-pooler`): Save this as `DIRECT_URL`.

### Step 2: Switch Schema to PostgreSQL & Deploy Schema to Neon
In [`prisma/schema.prisma`](file:///E:/My_GitHub__projects/InstructorLMS/prisma/schema.prisma), update the `datasource` block to use PostgreSQL:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Then run the push and seed commands against your Neon database:
```powershell
$env:DATABASE_URL="your_neon_pooled_url_here"
$env:DIRECT_URL="your_neon_direct_url_here"

npx prisma db push
npm run seed
```

### Step 3: Deploy to Vercel
1. Log into **[https://vercel.com](https://vercel.com)** using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your repository: **`GitHub-ccd/InstructorLMS`**.
4. Under **Environment Variables**, add:
   - `DATABASE_URL` = your Neon pooled connection string
   - `DIRECT_URL` = your Neon direct connection string
5. Click **Deploy**. Vercel will automatically build your Next.js application and host it globally for **$0/month**!
