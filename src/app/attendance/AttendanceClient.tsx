'use client';

import { useState } from 'react';
import { toggleAttendanceRecord, createAttendanceSession } from './actions';
import { AttendanceStatus } from '@/types';
import { Check, Clock, X, Calendar, Plus } from 'lucide-react';

export default function AttendanceClient({ courses }: { courses: any[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const sessions = selectedCourse?.attendanceSessions || [];
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');

  const activeSession = sessions.find((s: any) => s.id === selectedSessionId) || sessions[0];
  const students = selectedCourse?.students || [];

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    if (!activeSession) return;
    await toggleAttendanceRecord(activeSession.id, studentId, status);
  };

  const handleNewSession = async () => {
    const todayStr = new Date().toISOString();
    const newSess = await createAttendanceSession(selectedCourse.id, todayStr, 'New Attendance Session');
    setSelectedSessionId(newSess.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lightning Attendance Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">
            Rapid single-click attendance logging with automatic server timestamping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              const c = courses.find((crs) => crs.id === e.target.value);
              setSelectedSessionId(c?.attendanceSessions[0]?.id || '');
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
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {sessions.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.date).toLocaleDateString()} ({s.records.length} records)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleNewSession}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Session Today
          </button>
        </div>
      </div>

      {activeSession ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Session Date: {new Date(activeSession.date).toLocaleDateString()}</span>
            </div>
            <span className="text-xs text-slate-400">{students.length} Enrolled Students</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {students.map((student: any) => {
              const record = activeSession.records.find((r: any) => r.studentId === student.id);
              const currentStatus = record?.status || 'PRESENT';

              return (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition">
                  <div>
                    <h4 className="font-bold text-white text-sm">{student.name}</h4>
                    <p className="text-xs text-slate-400">{student.email || 'No email provided'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(student.id, 'PRESENT')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        currentStatus === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" /> Present
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'LATE')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        currentStatus === 'LATE'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Late
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'ABSENT')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
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
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          No attendance sessions found for this course. Click "New Session Today" to begin.
        </div>
      )}
    </div>
  );
}
