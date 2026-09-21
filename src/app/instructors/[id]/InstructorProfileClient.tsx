'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateInstructorAvatarAction } from '../actions';
import AvatarPicker from '@/components/AvatarPicker';
import {
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Mail,
  Calendar,
  BookOpen,
  Users,
  Clock,
  Sparkles,
  Camera,
  Maximize2,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface InstructorProfileClientProps {
  instructor: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    createdAt: string | Date;
    courses: Array<{
      id: string;
      code: string;
      name: string;
      term: string;
      defaultClassLengthMinutes: number;
      students: Array<{ id: string }>;
      attendanceSessions: Array<{ id: string }>;
      timeLogs: Array<{
        id: string;
        sessionDate: string | Date;
        prepTimeHours: number;
        contactHours: number;
        notes: string | null;
      }>;
    }>;
  };
  canEdit: boolean;
}

export default function InstructorProfileClient({
  instructor,
  canEdit,
}: InstructorProfileClientProps) {
  const router = useRouter();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Aggregate Metrics
  const totalCourses = instructor.courses.length;
  const totalStudents = instructor.courses.reduce((acc, c) => acc + c.students.length, 0);

  let totalPrepHours = 0;
  let totalContactHours = 0;
  const allTimeLogs: Array<{
    id: string;
    courseCode: string;
    date: string | Date;
    prepHours: number;
    contactHours: number;
    notes: string | null;
  }> = [];

  instructor.courses.forEach((c) => {
    c.timeLogs.forEach((log) => {
      totalPrepHours += log.prepTimeHours;
      totalContactHours += log.contactHours;
      allTimeLogs.push({
        id: log.id,
        courseCode: c.code,
        date: log.sessionDate,
        prepHours: log.prepTimeHours,
        contactHours: log.contactHours,
        notes: log.notes,
      });
    });
  });

  allTimeLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSelectNewAvatar = async (newUrl: string) => {
    setIsUpdating(true);
    const res = await updateInstructorAvatarAction(instructor.id, newUrl);
    setIsUpdating(false);

    if (res.success) {
      setToast({ type: 'success', text: 'Profile picture updated successfully!' });
      setShowAvatarModal(false);
      router.refresh();
      setTimeout(() => setToast(null), 3500);
    } else {
      setToast({ type: 'error', text: res.error || 'Failed to update profile picture' });
    }
  };

  const avatarSrc = instructor.avatarUrl || '/avatars/default-avatar.svg';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back Navigation */}
      <div>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 md:p-8 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
          {/* Avatar Container with Hover Overlay */}
          <div className="relative group shrink-0">
            <div
              onClick={() => setShowLightbox(true)}
              className="cursor-pointer relative w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-indigo-500/30 bg-slate-800 shadow-2xl shadow-indigo-950/50 transition duration-300 group-hover:border-indigo-500/60"
            >
              <img
                src={avatarSrc}
                alt={instructor.name}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                <Maximize2 className="w-6 h-6 text-indigo-300" />
                <span>View Full Size</span>
              </div>
            </div>

            {/* Change Avatar Button */}
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg border border-indigo-400/40 transition flex items-center gap-1.5 text-xs font-bold"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Change</span>
              </button>
            )}
          </div>

          {/* Instructor Core Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                  instructor.role === 'ADMIN'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                }`}
              >
                {instructor.role === 'ADMIN' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Institutional Administrator
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Faculty Instructor
                  </>
                )}
              </span>

              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
                <Calendar className="w-3 h-3 text-slate-400" /> Member since{' '}
                {new Date(instructor.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {instructor.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>{instructor.email}</span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-2xl pt-1">
              Active educator overseeing academic curricula, assessment deliverable grading, session attendance
              verification, and personalized student interventions.
            </p>

            {canEdit && (
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-indigo-400" /> Update Profile Photo
                </button>
                <Link
                  href="/signin"
                  className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition"
                >
                  Switch Active Persona
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCourses}</div>
            <div className="text-xs text-slate-400">Assigned Courses</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
            <div className="text-xs text-slate-400">Enrolled Students</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalContactHours.toFixed(1)}h</div>
            <div className="text-xs text-slate-400">Teaching Contact Time</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalPrepHours.toFixed(1)}h</div>
            <div className="text-xs text-slate-400">Course Preparation Time</div>
          </div>
        </div>
      </div>

      {/* Teaching Schedule & Assigned Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Teaching Schedule & Course Sections
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Active curriculum and enrolled cohort sections</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
            {instructor.courses.length} Active Sections
          </span>
        </div>

        {instructor.courses.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
            No courses currently assigned to this instructor. Use the Add Course button on the Dashboard to schedule classes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructor.courses.map((course) => (
              <div
                key={course.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-white text-base mt-1.5">{course.name}</h4>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      {course.term}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block">Enrolled Cohort</span>
                      <strong className="text-white text-sm">{course.students.length} Students</strong>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block">Standard Length</span>
                      <strong className="text-white text-sm">{course.defaultClassLengthMinutes} mins</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/attendance`}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    Attendance Roster <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/homework`}
                    className="text-slate-400 hover:text-white font-medium flex items-center gap-1"
                  >
                    Homework Matrix <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workload Log Audit Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Recent Labor & Workload Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Recorded preparation and direct classroom instruction</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {allTimeLogs.length} Total Sessions Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-slate-400 text-xs font-semibold">
                <th className="p-4">Date</th>
                <th className="p-4">Course</th>
                <th className="p-4">Prep Time</th>
                <th className="p-4">Teaching Time</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {allTimeLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No workload hours logged yet.
                  </td>
                </tr>
              ) : (
                allTimeLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-white">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {log.courseCode}
                      </span>
                    </td>
                    <td className="p-4 text-purple-400 font-semibold">{log.prepHours}h</td>
                    <td className="p-4 text-amber-400 font-semibold">{log.contactHours}h</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{log.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal (Full-Size Headshot View) */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{instructor.name}</span>
                <span className="text-xs text-slate-400">({instructor.role})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
              <img src={avatarSrc} alt={instructor.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-center text-xs text-slate-400 italic">High-resolution faculty headshot asset</p>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" /> Update Profile Picture
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AvatarPicker
              currentAvatarUrl={instructor.avatarUrl || ''}
              onSelect={handleSelectNewAvatar}
              label="Select or Capture New Profile Picture"
            />

            {isUpdating && (
              <div className="text-center text-xs text-indigo-400 animate-pulse font-semibold">
                Updating profile avatar...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
