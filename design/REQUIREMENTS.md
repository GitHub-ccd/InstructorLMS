# LMS Summary Document: Locked Requirements & Intention

### 1. Core Vision & Philosophy

* **Target Audience:** Strictly **instructor-facing** internal tool. No student-facing portals, parent views, or public endpoints.
* **Cost Structure:** Absolute **zero to near-zero operating cost**, optimized for individual educators or small independent teaching workflows.
* **AI Philosophy:** No complex, heavy proprietary AI features embedded inside the codebase. Instead, instructors can use globally available free tools (like DuckDuckGo AI or Google) externally to brainstorm text, then paste or input the final output into the app.

### 2. Locked Feature Requirements

* **Lightning Attendance Tracker:** A streamlined roster checklist where instructors quickly log student status (Present, Late, Absent), automatically timestamped by date.
* **Homework Management Matrix:** A clean tracker mapping students to assignments with status tags (*Missing*, *Submitted*, *Graded*).
* **Class Analytics Dashboard:** High-level metrics showing attendance trends, homework completion velocities, and automatic flagging of "at-risk" students (e.g., crossing absentee thresholds).
* **Student Performance Profiles & Intervention Strategy Logs:** Dedicated profiles for every student keeping history, coupled with text fields where instructors write and update personalized academic improvement strategies.
* **Dual-Side Time Commitment & Workload Tracking:**
* **Instructor Input:** Class duration (contact hours) and manual prep-time logs before/after sessions.
* **App Activity Tracking:** Internal app engagement logs to measure administrative overhead.
* **Workload Summary:** A dashboard bringing together prep time, class time, and app work to prevent burnout and track overall institutional labor.


* **External Announcement Builder:** A simple text entry section where instructors paste drafted announcements (generated via outside free tools) for their own reference or distribution via preferred external media.

---

# Technical Specification (Zero/Near-Zero Operating Cost)

To achieve a **$0/month** deployment cost while utilizing **Next.js**, we leverage modern serverless free tiers that provide complete infrastructure without hitting credit card paywalls.

## 1. Locked Tech Stack

* **Frontend & Backend Framework:** **Next.js (App Router)**
* *Why:* Provides React Server Components, server actions (no need to write a separate backend API server), and seamless routing.
* *Hosting:* **Vercel (Hobby Tier - $0/month)**. Vercel natively supports Next.js with zero configuration, automated SSL, and global CDN caching.

* **Data Layer:** **Neon (Serverless Postgres)**
* *Why:* Managed serverless PostgreSQL database with a generous free tier (0.5 GiB storage, auto-scaling branching, seamless Vercel integration). Ideal for small-to-medium scale educational data workloads.

* **ORM / Query Builder:** **Prisma ORM**
* *Why:* Type-safe database access, automated schema migrations (`prisma migrate`), auto-generated client SDK, and direct support for PostgreSQL / Neon.

---

## 2. Proposed Database Schema (Relational Blueprint)

A simple relational schema can support all your locked requirements cleanly:

1. **`instructors`**: `id`, `email`, `created_at`
2. **`courses`**: `id`, `instructor_id`, `name`, `term`, `default_class_length_minutes`
3. **`students`**: `id`, `course_id`, `name`, `email` (optional reference)
4. **`attendance_sessions`**: `id`, `course_id`, `date`, `notes`
5. **`attendance_records`**: `id`, `session_id`, `student_id`, `status` (*PRESENT*, *LATE*, *ABSENT*)
6. **`assignments`**: `id`, `course_id`, `title`, `due_date`, `total_points`
7. **`homework_submissions`**: `id`, `assignment_id`, `student_id`, `status` (*MISSING*, *SUBMITTED*, *GRADED*), `grade`
8. **`student_strategies`**: `id`, `student_id`, `strategy_notes`, `updated_at`
9. **`instructor_time_logs`**: `id`, `course_id`, `session_date`, `prep_time_hours`, `contact_hours`, `notes`

---

## 3. Deployment & Maintenance Strategy ($0 Breakdown)

* **Hosting Code:** GitHub (Free) -> Connects directly to Vercel. Every time you push code updates, Vercel rebuilds your Next.js app automatically for free.
* **Database Hosting:** Neon Free Tier ($0/month).
* **ORM & Database Tooling:** Prisma Studio (Visual DB viewer & editor included with Prisma).
* **Total Estimated Monthly Cost:** **$0.00** as long as you stay within standard personal/small-scale usage limits (under 500MB database storage).
