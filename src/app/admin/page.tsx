import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import AdminClient from './AdminClient';

export const revalidate = 0;

export default async function AdminPage() {
  const currentInstructor = await getActiveInstructor();

  // Enforce ADMIN role restriction
  if (!currentInstructor || currentInstructor.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Institutional Admin Access Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Your active profile (<strong className="text-slate-200">{currentInstructor?.name || 'Guest'}</strong>) is assigned standard{' '}
              <span className="text-indigo-400 font-semibold">INSTRUCTOR</span> permissions and cannot view or modify institutional directories.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Course Dashboard
            </Link>
            <Link
              href="/signin"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" /> Switch Profile (Dr. Indika Perera - Admin)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const instructors = await prisma.instructor.findMany({
    include: {
      courses: {
        include: {
          students: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      students: true,
    },
    orderBy: { code: 'asc' },
  });

  const students = await prisma.student.findMany({
    include: {
      course: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminClient
      currentInstructor={currentInstructor}
      instructors={instructors}
      courses={courses}
      students={students}
    />
  );
}
