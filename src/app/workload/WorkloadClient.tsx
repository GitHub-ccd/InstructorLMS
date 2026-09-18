'use client';

import { useState } from 'react';
import { logInstructorWorkload } from './actions';
import { Clock, Plus, BarChart3, Calendar, CheckCircle2 } from 'lucide-react';

export default function WorkloadClient({ courses }: { courses: any[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [prepTime, setPrepTime] = useState('1.5');
  const [contactHours, setContactHours] = useState('1.25');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const logs = selectedCourse?.timeLogs || [];

  const totalPrepHours = logs.reduce((sum: number, l: any) => sum + l.prepTimeHours, 0);
  const totalContactHours = logs.reduce((sum: number, l: any) => sum + l.contactHours, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await logInstructorWorkload(
      selectedCourseId,
      new Date().toISOString(),
      parseFloat(prepTime) || 0,
      parseFloat(contactHours) || 0,
      notes
    );

    setIsSubmitting(false);
    setSuccess(true);
    setNotes('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dual-Side Workload & Labor Log</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track manual preparation hours, class contact time, and app admin engagement to prevent burnout.
          </p>
        </div>

        <div>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Add New Time Log */}
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Log Session Workload
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Prep Time (Hours)</label>
              <input
                type="number"
                step="0.25"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contact Hours (Lecture/Lab)</label>
              <input
                type="number"
                step="0.25"
                value={contactHours}
                onChange={(e) => setContactHours(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Notes / Activity Log</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Slide prep, homework grading, student emails..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {success && (
              <div className="p-2.5 bg-emerald-950/80 text-emerald-300 rounded-xl border border-emerald-800/60 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Workload logged!
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Submit Workload Log'}
            </button>
          </form>
        </div>

        {/* Right: Summary Cards & Log Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Prep Hours</span>
              <div className="text-2xl font-extrabold text-indigo-400">{totalPrepHours.toFixed(2)}h</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Contact Hours</span>
              <div className="text-2xl font-extrabold text-amber-400">{totalContactHours.toFixed(2)}h</div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Recent Labor Logs</h3>

            <div className="divide-y divide-slate-800/60">
              {logs.map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">
                      {new Date(log.sessionDate).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400">{log.notes || 'No extra notes'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-indigo-400 font-bold block">{log.prepTimeHours}h Prep</span>
                    <span className="text-amber-400 font-bold">{log.contactHours}h Contact</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
