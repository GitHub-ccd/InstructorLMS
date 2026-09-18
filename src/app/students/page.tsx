import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Users, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';

export const revalidate = 0;

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      course: true,
      attendanceRecords: true,
      homeworkSubmissions: true,
      strategies: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">Student Performance Profiles</h2>
        <p className="text-sm text-slate-400 mt-1">
          Detailed academic profiles and intervention logs for every enrolled student.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => {
          const absents = student.attendanceRecords.filter((r) => r.status === 'ABSENT').length;
          const missingHw = student.homeworkSubmissions.filter((h) => h.status === 'MISSING').length;
          const hasActiveStrategy = student.strategies.length > 0;

          return (
            <div
              key={student.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{student.name}</h3>
                    <p className="text-xs text-slate-400">{student.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                    {student.course.code}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg">
                    {student.attendanceRecords.length} Sessions Logged
                  </span>
                  {absents > 0 ? (
                    <span className="bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2.5 py-1 rounded-lg">
                      {absents} Absences
                    </span>
                  ) : (
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                      100% Attendance
                    </span>
                  )}
                  {missingHw > 0 && (
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                      {missingHw} Missing HW
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {hasActiveStrategy ? 'Intervention Active' : 'Standard Progress'}
                </span>
                <Link
                  href={`/students/${student.id}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Open Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
