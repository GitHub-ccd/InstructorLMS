'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateHomeworkSubmission, createAssignmentAction } from './actions';
import { HomeworkStatus } from '@/types';
import {
  BookOpen,
  Plus,
  FileText,
  HelpCircle,
  Presentation,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface HomeworkClientProps {
  courses: any[];
}

export default function HomeworkClient({ courses }: { courses: any[] }) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allAssignments = selectedCourse?.assignments || [];
  const students = selectedCourse?.students || [];

  // Filter by assignment type
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  const filteredAssignments = allAssignments.filter((a: any) => {
    if (selectedTypeFilter === 'ALL') return true;
    return a.type === selectedTypeFilter;
  });

  // New Assignment Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [newAssignmentForm, setNewAssignmentForm] = useState({
    title: '',
    type: 'HOMEWORK' as 'HOMEWORK' | 'QUIZ' | 'PRESENTATION',
    dueDate: defaultDueDate,
    totalPoints: 100,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStatusChange = async (assignmentId: string, studentId: string, status: HomeworkStatus) => {
    await updateHomeworkSubmission(assignmentId, studentId, status);
  };

  const handleGradeChange = async (
    assignmentId: string,
    studentId: string,
    gradeStr: string,
    currentStatus: HomeworkStatus
  ) => {
    const grade = gradeStr === '' ? null : parseFloat(gradeStr);
    const nextStatus = grade !== null ? 'GRADED' : currentStatus;
    await updateHomeworkSubmission(assignmentId, studentId, nextStatus, grade);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsSubmitting(true);
    setToastMessage(null);

    const res = await createAssignmentAction({
      courseId: selectedCourse.id,
      title: newAssignmentForm.title,
      dueDate: newAssignmentForm.dueDate,
      totalPoints: newAssignmentForm.totalPoints,
      type: newAssignmentForm.type,
    });

    setIsSubmitting(false);

    if (res.success) {
      setToastMessage({
        type: 'success',
        text: `"${newAssignmentForm.title}" created and added to the matrix!`,
      });
      setShowAddModal(false);
      setNewAssignmentForm({
        title: '',
        type: 'HOMEWORK',
        dueDate: defaultDueDate,
        totalPoints: 100,
      });
      router.refresh();
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setToastMessage({
        type: 'error',
        text: res.error || 'Failed to create assignment',
      });
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'QUIZ':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quiz
          </span>
        );
      case 'PRESENTATION':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 flex items-center gap-1">
            <Presentation className="w-3 h-3" /> Presentation
          </span>
        );
      case 'HOMEWORK':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Homework
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Homework & Assessment Matrix</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track student deliverables across Homework, Quizzes, and Presentations with horizontal scalability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add Assignment
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              selectedTypeFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Types ({allAssignments.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('HOMEWORK')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              selectedTypeFilter === 'HOMEWORK' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Homework
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('QUIZ')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              selectedTypeFilter === 'QUIZ' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Quizzes
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('PRESENTATION')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              selectedTypeFilter === 'PRESENTATION' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" /> Presentations
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredAssignments.length} assignment columns &bull; Horizontal scroll enabled
        </span>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 border shadow-lg ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Horizontal Scrolling Matrix */}
      {filteredAssignments.length > 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {/* Sticky student name column */}
                  <th className="p-4 min-w-[200px] sticky left-0 z-20 bg-slate-900/95 border-r border-slate-800 backdrop-blur-md">
                    Student Roster
                  </th>
                  {filteredAssignments.map((assignment: any) => (
                    <th key={assignment.id} className="p-4 min-w-[240px] border-r border-slate-800/40">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        {getTypeBadge(assignment.type)}
                        <span className="text-[11px] text-slate-400 font-mono">
                          {assignment.totalPoints} pts
                        </span>
                      </div>
                      <div className="font-bold text-slate-200 truncate" title={assignment.title}>
                        {assignment.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-normal">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-900/40 transition">
                    {/* Sticky student cell */}
                    <td className="p-4 font-bold text-white sticky left-0 z-10 bg-slate-950/95 border-r border-slate-800">
                      <div>{student.name}</div>
                      <span className="text-xs font-normal text-slate-400 block truncate">{student.email || '—'}</span>
                    </td>

                    {filteredAssignments.map((assignment: any) => {
                      const sub = assignment.submissions.find((s: any) => s.studentId === student.id);
                      const currentStatus: HomeworkStatus = sub?.status || 'MISSING';
                      const grade = sub?.grade !== undefined && sub?.grade !== null ? sub.grade : '';

                      return (
                        <td key={assignment.id} className="p-4 border-r border-slate-800/40">
                          <div className="flex items-center gap-2">
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

                            <div className="relative">
                              <input
                                type="number"
                                placeholder="Pts"
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
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-indigo-400 opacity-60" />
          <p className="font-semibold text-white">No assignments found matching this filter.</p>
          <p className="text-xs max-w-sm mx-auto">
            Click "Add Assignment" to assign homework, quizzes, or presentation deliverables to this cohort.
          </p>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Add Course Assessment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={newAssignmentForm.title}
                  onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, title: e.target.value })}
                  placeholder="e.g. Midterm Project: REST API"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Type</label>
                <select
                  value={newAssignmentForm.type}
                  onChange={(e) =>
                    setNewAssignmentForm({
                      ...newAssignmentForm,
                      type: e.target.value as 'HOMEWORK' | 'QUIZ' | 'PRESENTATION',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="HOMEWORK">Homework / Programming Assignment</option>
                  <option value="QUIZ">Quiz / Knowledge Check</option>
                  <option value="PRESENTATION">Presentation / Final Project</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newAssignmentForm.dueDate}
                    onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Points</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={newAssignmentForm.totalPoints}
                    onChange={(e) =>
                      setNewAssignmentForm({ ...newAssignmentForm, totalPoints: parseInt(e.target.value) || 100 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
