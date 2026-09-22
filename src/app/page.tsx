import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import AddCourseButton from '@/components/AddCourseButton';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering

export default async function DashboardPage() {
  const activeInstructor = await getActiveInstructor();
  if (!activeInstructor) {
    redirect('/signin');
  }

  // All institutional catalog courses (distinct by course code)
  const catalogCourses = await prisma.course.findMany({
    distinct: ['code'],
    select: {
      code: true,
      name: true,
      defaultClassLengthMinutes: true,
    },
    orderBy: { code: 'asc' },
  });

  // Fetch courses scoped to active instructor, or fallback to all courses
  let courses = await prisma.course.findMany({
    where: activeInstructor ? { instructorId: activeInstructor.id } : {},
    include: {
      students: {
        where: { isRemoved: false }, // EXCLUDE soft-deleted students
        include: {
          attendanceRecords: true,
          homeworkSubmissions: true,
          strategies: true,
        },
      },
      attendanceSessions: true,
      timeLogs: true,
    },
    orderBy: { code: 'asc' },
  });

  // Fallback if instructor has no courses yet
  if (courses.length === 0) {
    courses = await prisma.course.findMany({
      include: {
        students: {
          where: { isRemoved: false },
          include: {
            attendanceRecords: true,
            homeworkSubmissions: true,
            strategies: true,
          },
        },
        attendanceSessions: true,
        timeLogs: true,
      },
      orderBy: { code: 'asc' },
    });
  }

  const allStudents = courses.flatMap((c) => c.students);
  const totalStudents = allStudents.length;

  // Calculate Attendance Stats
  let totalAttendanceCount = 0;
  let presentCount = 0;

  allStudents.forEach((student) => {
    student.attendanceRecords.forEach((record) => {
      totalAttendanceCount++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        presentCount++;
      }
    });
  });

  const attendanceRate = totalAttendanceCount > 0
    ? Math.round((presentCount / totalAttendanceCount) * 100)
    : 100;

  // Calculate Homework Stats
  let totalHomeworkCount = 0;
  let completedHomeworkCount = 0;

  allStudents.forEach((student) => {
    student.homeworkSubmissions.forEach((sub) => {
      totalHomeworkCount++;
      if (sub.status === 'SUBMITTED' || sub.status === 'GRADED') {
        completedHomeworkCount++;
      }
    });
  });

  const homeworkRate = totalHomeworkCount > 0
    ? Math.round((completedHomeworkCount / totalHomeworkCount) * 100)
    : 100;

  // At Risk Students (Absent > 1 or Missing Homework > 0 or Has Active Strategy)
  const atRiskStudents = allStudents.filter((student) => {
    const absents = student.attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    const missingHw = student.homeworkSubmissions.filter((h) => h.status === 'MISSING').length;
    return absents > 0 || missingHw > 0 || student.strategies.length > 0;
  });

  // Total Prep & Teaching Hours
  let totalPrepHours = 0;
  let totalContactHours = 0;

  courses.forEach((c) => {
    c.timeLogs.forEach((log) => {
      totalPrepHours += log.prepTimeHours;
      totalContactHours += log.contactHours;
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Banner with Active Instructor Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 md:p-7 rounded-3xl border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {activeInstructor ? (
            <Link
              href={`/instructors/${activeInstructor.id}`}
              className="group relative block shrink-0"
              title="View your Instructor Profile"
            >
              <img
                src={activeInstructor.avatarUrl || '/avatars/default-avatar.svg'}
                alt={activeInstructor.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-500/40 bg-slate-800 shadow-xl transition duration-300 group-hover:border-indigo-400 group-hover:scale-105"
              />
              <span className="absolute -bottom-2 -right-1 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full border border-indigo-400 shadow-md">
                Profile
              </span>
            </Link>
          ) : (
            <img
              src="/avatars/default-avatar.svg"
              alt="Instructor"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-500/40 bg-slate-800 shadow-xl shrink-0"
            />
          )}

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Instructor Portal
              </span>
              {activeInstructor?.role === 'ADMIN' && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
              )}
              <span className="text-xs text-slate-400">
                Logged in:{' '}
                {activeInstructor ? (
                  <Link
                    href={`/instructors/${activeInstructor.id}`}
                    className="text-white hover:text-indigo-300 font-bold underline decoration-slate-600 underline-offset-4"
                  >
                    {activeInstructor.name}
                  </Link>
                ) : (
                  <strong className="text-white">Dr. Alex Vance</strong>
                )}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Class Analytics & Executive Dashboard
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time monitoring of attendance velocities, assessment completion, and instructor time commitment.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <AddCourseButton
            catalogCourses={catalogCourses}
            currentInstructorCourses={courses.map((c) => ({ code: c.code, term: c.term }))}
          />
          <Link
            href="/signin"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" /> Switch Profile
          </Link>
          <Link
            href="/attendance"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            Log Attendance <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Students</span>
            <div className="p-2 bg-slate-800/80 rounded-lg text-slate-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalStudents}</div>
          <p className="text-xs text-slate-400">Across {courses.length} active course sections</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{attendanceRate}%</div>
          <p className="text-xs text-slate-400">Present or late attendance ratio</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assessment Delivery</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">{homeworkRate}%</div>
          <p className="text-xs text-slate-400">Submitted & graded deliverables</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workload Committed</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{(totalPrepHours + totalContactHours).toFixed(1)}h</div>
          <p className="text-xs text-slate-400">{totalPrepHours}h prep + {totalContactHours}h contact</p>
        </div>
      </div>

      {/* At Risk Students & Intervention Strategy Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">At-Risk Students & Active Interventions</h3>
          </div>
          <span className="text-xs font-medium text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/50">
            {atRiskStudents.length} Flagged
          </span>
        </div>

        {atRiskStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atRiskStudents.map((student) => {
              const course = courses.find((c) => c.id === student.courseId);
              const absents = student.attendanceRecords.filter((r: any) => r.status === 'ABSENT').length;
              const missingHw = student.homeworkSubmissions.filter((h: any) => h.status === 'MISSING').length;
              const hasStrategy = student.strategies.length > 0;

              return (
                <div
                  key={student.id}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={student.avatarUrl || '/avatars/default-avatar.svg'}
                        alt={student.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow-md shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-base">{student.name}</h4>
                        <p className="text-xs text-slate-400">{course?.code} — {course?.name}</p>
                      </div>
                    </div>
                    <Link
                      href={`/students/${student.id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
                    >
                      View Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {absents > 0 && (
                      <span className="bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2.5 py-1 rounded-lg">
                        {absents} Absentee Logged
                      </span>
                    )}
                    {missingHw > 0 && (
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                        {missingHw} Missing Deliverables
                      </span>
                    )}
                    {hasStrategy && (
                      <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2.5 py-1 rounded-lg">
                        Strategy Active
                      </span>
                    )}
                  </div>

                  {hasStrategy && (
                    <p className="text-xs italic text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      "{student.strategies[0].strategyNotes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No students currently flagged as at-risk in this cohort.
          </div>
        )}
      </div>
    </div>
  );
}
