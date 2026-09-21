'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addExistingCourseToScheduleAction } from '@/app/actions/course';
import { BookOpen, X, Sparkles, CheckCircle2, AlertCircle, Plus, Info } from 'lucide-react';

export interface CatalogCourse {
  code: string;
  name: string;
  defaultClassLengthMinutes?: number;
}

interface AddCourseToScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogCourses: CatalogCourse[];
  currentInstructorCourses: { code: string; term: string }[];
}

export default function AddCourseToScheduleModal({
  isOpen,
  onClose,
  catalogCourses,
  currentInstructorCourses,
}: AddCourseToScheduleModalProps) {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [isPending, setIsPending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Filter out courses already on the instructor's schedule for this term
  const alreadyTaughtCodes = new Set(
    currentInstructorCourses.filter((c) => c.term === term).map((c) => c.code)
  );

  const availableCourses = catalogCourses.filter((c) => !alreadyTaughtCodes.has(c.code));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode) {
      setToast({ type: 'error', text: 'Please select a course from the institutional catalog.' });
      return;
    }

    setIsPending(true);
    setToast(null);

    const res = await addExistingCourseToScheduleAction({
      code: selectedCode,
      term,
    });

    setIsPending(false);

    if (res.success) {
      setToast({ type: 'success', text: res.message || 'Course added to schedule!' });
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } else {
      setToast({ type: 'error', text: res.error || 'Failed to add course.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950/80 rounded-xl text-indigo-400 border border-indigo-800/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Add Course to Schedule</h3>
              <p className="text-[11px] text-slate-400">Institutional Catalog Directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Institutional catalog courses are approved and managed by Administrators. Select an existing course to begin teaching and managing student cohorts.
          </span>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border-rose-800 text-rose-300'
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Academic Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Fall 2026">Fall 2026</option>
              <option value="Spring 2027">Spring 2027</option>
              <option value="Summer 2027">Summer 2027</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Approved Catalog Course
            </label>
            {availableCourses.length > 0 ? (
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">-- Choose course from catalog --</option>
                {availableCourses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300">
                You are currently teaching all catalog courses registered in this term.
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || availableCourses.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              {isPending ? (
                <span>Adding to Schedule...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add to My Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
