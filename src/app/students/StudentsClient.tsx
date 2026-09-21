'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleStudentRemoval, enrollExistingStudentInCourse } from './actions';
import {
  Users,
  ArrowRight,
  UserCheck,
  UserX,
  RotateCcw,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

import AddCourseButton from '@/components/AddCourseButton';
import { CatalogCourse } from '@/components/AddCourseToScheduleModal';

interface StudentsClientProps {
  students: any[];
  courses: any[];
  allRegisteredStudents: any[];
  catalogCourses?: CatalogCourse[];
}

export default function StudentsClient({
  students,
  courses,
  allRegisteredStudents,
  catalogCourses = [],
}: StudentsClientProps) {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<'active' | 'archived'>('active');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState('');
  const [targetCourseId, setTargetCourseId] = useState(courses[0]?.id || '');

  const [isPending, setIsPending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Active vs Archived filter
    if (filterMode === 'active' && s.isRemoved) return false;
    if (filterMode === 'archived' && !s.isRemoved) return false;

    // Course filter
    if (selectedCourseFilter !== 'ALL' && s.courseId !== selectedCourseFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchEmail = s.email?.toLowerCase().includes(q);
      const matchCode = s.course?.code?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCode) return false;
    }

    return true;
  });

  const handleToggleRemoval = async (studentId: string, currentRemoved: boolean, studentName: string) => {
    const nextRemoved = !currentRemoved;
    if (nextRemoved && !confirm(`Remove ${studentName} from the active cohort? Their attendance and grade history will be kept in database and can be restored.`)) {
      return;
    }

    setIsPending(true);
    setToast(null);
    const res = await toggleStudentRemoval(studentId, nextRemoved);
    setIsPending(false);

    if (res.success) {
      setToast({
        type: 'success',
        text: nextRemoved
          ? `${studentName} was removed from the active roster.`
          : `${studentName} was restored to the active roster!`,
      });
      router.refresh();
      setTimeout(() => setToast(null), 3500);
    } else {
      setToast({ type: 'error', text: res.error || 'Failed to update student status' });
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setToast(null);

    const existing = allRegisteredStudents.find((s) => s.id === selectedExistingStudentId);
    if (!existing) {
      setToast({ type: 'error', text: 'Please select a registered student from the directory.' });
      setIsPending(false);
      return;
    }

    const res = await enrollExistingStudentInCourse({
      name: existing.name,
      email: existing.email || '',
      courseId: targetCourseId,
    });

    setIsPending(false);

    if (res.success) {
      setToast({
        type: 'success',
        text: `${existing.name} was successfully enrolled in the class!`,
      });
      setShowEnrollModal(false);
      setSelectedExistingStudentId('');
      router.refresh();
      setTimeout(() => setToast(null), 3500);
    } else {
      setToast({ type: 'error', text: res.error || 'Failed to enroll student' });
    }
  };

  const activeCount = students.filter((s) => !s.isRemoved).length;
  const archivedCount = students.filter((s) => s.isRemoved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Performance & Cohort Profiles</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage cohort rosters, soft-delete inactive students, and record academic interventions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {catalogCourses.length > 0 && (
            <AddCourseButton
              catalogCourses={catalogCourses}
              currentInstructorCourses={courses.map((c) => ({ code: c.code, term: c.term }))}
              buttonText="Add Course to Schedule"
            />
          )}
          <button
            type="button"
            onClick={() => setShowEnrollModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Enroll Student in Class
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 border shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Active / Archived Toggle */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterMode('active')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                filterMode === 'active'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Active Roster ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('archived')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                filterMode === 'archived'
                  ? 'bg-rose-900 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserX className="w-3.5 h-3.5" /> Archived / Removed ({archivedCount})
            </button>
          </div>

          {/* Course filter */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Enrolled Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const absents = student.attendanceRecords.filter((r: any) => r.status === 'ABSENT').length;
            const missingHw = student.homeworkSubmissions.filter((h: any) => h.status === 'MISSING').length;
            const hasActiveStrategy = student.strategies.length > 0;

            return (
              <div
                key={student.id}
                className={`glass-card p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                  student.isRemoved
                    ? 'border-rose-900/40 bg-rose-950/10 opacity-80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl || '/avatars/default-avatar.svg'}
                        alt={student.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{student.name}</h3>
                          {student.isRemoved && (
                            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800/50">
                              Archived
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{student.email || 'No email registered'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
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

                {/* Footer with Actions: View Profile and Archive/Restore */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleRemoval(student.id, student.isRemoved, student.name)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                      student.isRemoved
                        ? 'bg-emerald-950/70 border-emerald-800/70 text-emerald-300 hover:bg-emerald-900/80'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-800'
                    }`}
                  >
                    {student.isRemoved ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" /> Remove
                      </>
                    )}
                  </button>

                  <Link
                    href={`/students/${student.id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Users className="w-10 h-10 mx-auto text-indigo-400 opacity-60" />
          <p className="font-semibold text-white">No students match your filter criteria.</p>
          <p className="text-xs">
            {filterMode === 'archived'
              ? 'No archived students in this selection.'
              : 'Enroll students using the button above or register students in the Admin Console.'}
          </p>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Enroll Student in Class
              </h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Institutional Policy Notice */}
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Institutional Policy:</strong> Student registration is restricted to Administrators. Instructors may select and enroll registered students into their active teaching sections.
              </span>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Class / Course</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Registered Student from Directory
                </label>
                <select
                  value={selectedExistingStudentId}
                  onChange={(e) => setSelectedExistingStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose registered student --</option>
                  {allRegisteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email || 'No email registered'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isPending ? 'Enrolling...' : 'Enroll in Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
