'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  toggleAttendanceRecord,
  createOrGetAttendanceSession,
  clearAttendanceSessionRecords,
  deleteAttendanceSessionAction,
  batchSaveAttendance,
} from './actions';
import { AttendanceStatus } from '@/types';
import BackfillCalendarPicker from '@/components/BackfillCalendarPicker';
import {
  Check,
  Clock,
  X,
  Calendar,
  Plus,
  Save,
  RotateCcw,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AttendanceClientProps {
  courses: any[];
  activeInstructor?: any;
}

export default function AttendanceClient({ courses, activeInstructor }: AttendanceClientProps) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const sessions = selectedCourse?.attendanceSessions || [];
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');

  const activeSession = sessions.find((s: any) => s.id === selectedSessionId) || sessions[0];
  const students = selectedCourse?.students || [];

  // Local record state for fast, responsive editing & batch saving
  const [localRecords, setLocalRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 14-day backfill date picker state
  const todayIso = new Date().toISOString().split('T')[0];
  const minDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [backfillDate, setBackfillDate] = useState(todayIso);

  // Check if active session is older than 14 days
  const isSessionLocked = activeSession
    ? (Date.now() - new Date(activeSession.date).getTime()) / (1000 * 60 * 60 * 24) > 14
    : false;

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    if (localRecords[studentId]) return localRecords[studentId];
    const rec = activeSession?.records?.find((r: any) => r.studentId === studentId);
    return (rec?.status as AttendanceStatus) || 'PRESENT';
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (isSessionLocked) return;
    setLocalRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (isSessionLocked) return;
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s: any) => {
      updated[s.id] = status;
    });
    setLocalRecords((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveSession = async () => {
    if (!activeSession || isSessionLocked) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const recordsToSave = students.map((s: any) => ({
        studentId: s.id,
        status: getStudentStatus(s.id),
      }));

      await batchSaveAttendance(activeSession.id, recordsToSave);
      setSaveToast('Attendance records saved successfully!');
      setTimeout(() => setSaveToast(null), 3000);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSession = async () => {
    if (!activeSession || isSessionLocked) return;
    if (!confirm('Are you sure you want to clear all attendance records for this session?')) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await clearAttendanceSessionRecords(activeSession.id);
      setLocalRecords({});
      setSaveToast('Session cleared. All records reset.');
      setTimeout(() => setSaveToast(null), 3000);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clear session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!activeSession || isSessionLocked) return;
    if (!confirm('Delete this attendance session completely? This cannot be undone.')) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await deleteAttendanceSessionAction(activeSession.id);
      setLocalRecords({});
      setSelectedSessionId('');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete session');
    } finally {
      setIsSaving(false);
    }
  };

  const existingSessionDates = sessions.map((s: any) => {
    const d = new Date(s.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const handleCreateOrOpenBackfill = async (targetDateStr?: string) => {
    const dateToUse = targetDateStr || backfillDate;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const session = await createOrGetAttendanceSession(
        selectedCourse.id,
        new Date(dateToUse + 'T12:00:00Z').toISOString(),
        `Session for ${new Date(dateToUse + 'T12:00:00Z').toLocaleDateString()}`
      );
      setSelectedSessionId(session.id);
      setBackfillDate(dateToUse);
      setLocalRecords({});
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to open or back-fill session');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Lightning Attendance Tracker
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              14-Day Backfill Window
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Log, backfill, save, and audit session attendance with instant server synchronization.
          </p>
        </div>

        {/* Course & Session Selector Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              const c = courses.find((crs) => crs.id === e.target.value);
              setSelectedSessionId(c?.attendanceSessions[0]?.id || '');
              setLocalRecords({});
            }}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>

          {sessions.length > 0 && (
            <select
              value={selectedSessionId}
              onChange={(e) => {
                setSelectedSessionId(e.target.value);
                setLocalRecords({});
              }}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {sessions.map((s: any) => {
                const isHist = (Date.now() - new Date(s.date).getTime()) / (1000 * 3600 * 24) > 14;
                return (
                  <option key={s.id} value={s.id}>
                    {new Date(s.date).toLocaleDateString()} {isHist ? '(Locked >14d)' : ''}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>

      {/* Backfill Calendar Picker & Quick Actions Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="font-semibold text-xs uppercase tracking-wider text-slate-400 shrink-0">
            Back-fill Calendar:
          </span>
          <BackfillCalendarPicker
            selectedDate={backfillDate}
            onSelectDate={(dateYmd) => setBackfillDate(dateYmd)}
            onOpenSession={(dateYmd) => handleCreateOrOpenBackfill(dateYmd)}
            existingSessionDates={existingSessionDates}
            isSubmitting={isSaving}
          />
        </div>

        {activeSession && !isSessionLocked && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Quick set:</span>
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium rounded-lg border border-slate-700 transition"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {saveToast && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-300 text-sm flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Session Active View */}
      {activeSession ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Top Session Status Bar */}
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">
                Session: {new Date(activeSession.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {isSessionLocked ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-slate-400" /> Locked (&gt;14 days)
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Editable Window
                </span>
              )}
            </div>

            {/* Action Buttons: Save, Clear, Delete */}
            {!isSessionLocked && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSession}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Save Session
                </button>
                <button
                  type="button"
                  onClick={handleClearSession}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                  title="Reset all student attendance statuses in this session"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSession}
                  disabled={isSaving}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-700 transition"
                  title="Delete this attendance session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Student Records List */}
          <div className="divide-y divide-slate-800/60">
            {students.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No enrolled students in this course section. Enroll students via the Admin Panel or Student Profiles.
              </div>
            ) : (
              students.map((student: any) => {
                const currentStatus = getStudentStatus(student.id);

                return (
                  <div
                    key={student.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl || '/avatars/default-avatar.svg'}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{student.name}</h4>
                        <p className="text-xs text-slate-400">{student.email || 'No email registered'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isSessionLocked}
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-60 ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Present
                      </button>

                      <button
                        type="button"
                        disabled={isSessionLocked}
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-60 ${
                          currentStatus === 'LATE'
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> Late
                      </button>

                      <button
                        type="button"
                        disabled={isSessionLocked}
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-60 ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> Absent
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-indigo-400 opacity-60" />
          <p className="font-semibold text-white">No attendance sessions found for this course.</p>
          <p className="text-xs max-w-sm mx-auto">
            Choose a date above (up to 14 days back) and click "Open / Create Date" to record attendance.
          </p>
        </div>
      )}
    </div>
  );
}
