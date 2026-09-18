'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveStudentStrategy, toggleStudentRemoval } from '../actions';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserX,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

export default function StudentDetailClient({ student }: { student: any }) {
  const router = useRouter();
  const [strategyNotes, setStrategyNotes] = useState(student.strategies[0]?.strategyNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPendingRemoval, setIsPendingRemoval] = useState(false);

  const handleSaveStrategy = async () => {
    setIsSaving(true);
    await saveStudentStrategy(student.id, strategyNotes);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleRemoval = async () => {
    const nextRemoved = !student.isRemoved;
    if (nextRemoved && !confirm(`Remove ${student.name} from the active cohort? Historic records will remain preserved.`)) {
      return;
    }

    setIsPendingRemoval(true);
    await toggleStudentRemoval(student.id, nextRemoved);
    setIsPendingRemoval(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div>
        <Link
          href="/students"
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Roster
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{student.name}</h2>
              {student.isRemoved ? (
                <span className="text-xs bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-800/60 font-semibold">
                  Archived / Removed
                </span>
              ) : (
                <span className="text-xs bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                  Active Enrolled
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {student.email || 'No institutional email'} — Enrolled in{' '}
              <span className="text-indigo-400 font-semibold">
                {student.course.code}: {student.course.name}
              </span>
            </p>
          </div>

          <div>
            <button
              type="button"
              disabled={isPendingRemoval}
              onClick={handleToggleRemoval}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                student.isRemoved
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border-slate-700 hover:border-rose-800'
              }`}
            >
              {student.isRemoved ? (
                <>
                  <RotateCcw className="w-4 h-4" /> Restore to Active Cohort
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4" /> Remove from Cohort
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {student.isRemoved && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            This student has been soft-deleted from active cohort analytics. Their historical attendance and homework
            records remain stored safely in the database and will be restored immediately if reactivated.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intervention Strategy Log */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5" />
              <span>Academic Strategy & Intervention Log</span>
            </div>

            <p className="text-xs text-slate-400">
              Record personalized academic improvement strategies, peer-pairing notes, or office hour agreements.
            </p>

            <textarea
              rows={8}
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              placeholder="Write academic intervention notes here..."
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved successfully
                </span>
              ) : (
                <span className="text-xs text-slate-500">Auto-timestamped on save</span>
              )}

              <button
                onClick={handleSaveStrategy}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Strategy'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Homework History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance History */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Attendance History ({student.attendanceRecords.length} Sessions)
            </h3>

            <div className="divide-y divide-slate-800/60">
              {student.attendanceRecords.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No attendance records logged yet.</p>
              ) : (
                student.attendanceRecords.map((record: any) => (
                  <div key={record.id} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      Session Date: {new Date(record.session.date).toLocaleDateString()}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg font-semibold ${
                        record.status === 'PRESENT'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : record.status === 'LATE'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Homework Submission History */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Assessment Deliverables & Grades
            </h3>

            <div className="divide-y divide-slate-800/60">
              {student.homeworkSubmissions.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No homework deliverables assigned yet.</p>
              ) : (
                student.homeworkSubmissions.map((sub: any) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">{sub.assignment.title}</span>
                      <span className="text-[10px] text-slate-500">
                        Type: {sub.assignment.type || 'HOMEWORK'} &bull; Due: {new Date(sub.assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 font-bold">
                        {sub.grade !== null ? `${sub.grade} / ${sub.assignment.totalPoints}` : 'No Grade'}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-semibold ${
                          sub.status === 'GRADED'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : sub.status === 'SUBMITTED'
                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
