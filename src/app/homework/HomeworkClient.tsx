'use client';

import { useState } from 'react';
import { updateHomeworkSubmission } from './actions';
import { HomeworkStatus } from '@/types';
import { BookOpen } from 'lucide-react';

export default function HomeworkClient({ courses }: { courses: any[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const assignments = selectedCourse?.assignments || [];
  const students = selectedCourse?.students || [];

  const handleStatusChange = async (assignmentId: string, studentId: string, status: HomeworkStatus) => {
    await updateHomeworkSubmission(assignmentId, studentId, status);
  };

  const handleGradeChange = async (assignmentId: string, studentId: string, gradeStr: string, currentStatus: HomeworkStatus) => {
    const grade = gradeStr === '' ? null : parseFloat(gradeStr);
    const nextStatus = grade !== null ? 'GRADED' : currentStatus;
    await updateHomeworkSubmission(assignmentId, studentId, nextStatus, grade);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Homework Management Matrix</h2>
          <p className="text-sm text-slate-400 mt-1">
            Map assignments to enrolled students and manage status tags (*Missing*, *Submitted*, *Graded*).
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

      {assignments.length > 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 min-w-[180px]">Student Roster</th>
                {assignments.map((assignment: any) => (
                  <th key={assignment.id} className="p-4 min-w-[220px]">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span className="truncate">{assignment.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((student: any) => (
                <tr key={student.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 font-bold text-white">
                    {student.name}
                    <span className="block text-xs font-normal text-slate-400">{student.email}</span>
                  </td>

                  {assignments.map((assignment: any) => {
                    const sub = assignment.submissions.find((s: any) => s.studentId === student.id);
                    const currentStatus: HomeworkStatus = sub?.status || 'MISSING';
                    const grade = sub?.grade !== undefined && sub?.grade !== null ? sub.grade : '';

                    return (
                      <td key={assignment.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                handleStatusChange(assignment.id, student.id, e.target.value as HomeworkStatus)
                              }
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition ${
                                currentStatus === 'GRADED'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                  : currentStatus === 'SUBMITTED'
                                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                                  : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                              }`}
                            >
                              <option value="MISSING">Missing</option>
                              <option value="SUBMITTED">Submitted</option>
                              <option value="GRADED">Graded</option>
                            </select>

                            <input
                              type="number"
                              placeholder="Grade"
                              value={grade}
                              onChange={(e) =>
                                handleGradeChange(assignment.id, student.id, e.target.value, currentStatus)
                              }
                              className="w-16 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
          No assignments found for this course section.
        </div>
      )}
    </div>
  );
}
