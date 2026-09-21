'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createInstructorAction,
  createStudentAction,
  createCourseAction,
} from './actions';
import {
  ShieldAlert,
  UserPlus,
  BookOpen,
  GraduationCap,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import AvatarPicker from '@/components/AvatarPicker';

interface AdminClientProps {
  currentInstructor: any;
  instructors: any[];
  courses: any[];
  students: any[];
}

export default function AdminClient({
  currentInstructor,
  instructors,
  courses,
  students,
}: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'instructors' | 'courses' | 'students'>('instructors');

  // Modal states
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Form states
  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
    role: 'INSTRUCTOR' as 'INSTRUCTOR' | 'ADMIN',
    avatarUrl: '',
  });
  const [courseForm, setCourseForm] = useState({
    instructorId: instructors[0]?.id || '',
    name: '',
    code: '',
    term: 'Fall 2026',
    defaultClassLengthMinutes: 75,
  });
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    courseId: courses[0]?.id || '',
    avatarUrl: '',
  });

  const [isPending, setIsPending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setStatusMsg(null);
    const res = await createInstructorAction(instructorForm);
    setIsPending(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Instructor ${instructorForm.name} created successfully!` });
      setShowInstructorModal(false);
      setInstructorForm({ name: '', email: '', role: 'INSTRUCTOR', avatarUrl: '' });
      router.refresh();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to create instructor' });
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setStatusMsg(null);
    const res = await createCourseAction(courseForm);
    setIsPending(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Course ${courseForm.code} created successfully!` });
      setShowCourseModal(false);
      setCourseForm({
        instructorId: instructors[0]?.id || '',
        name: '',
        code: '',
        term: 'Fall 2026',
        defaultClassLengthMinutes: 75,
      });
      router.refresh();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to create course' });
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setStatusMsg(null);
    const res = await createStudentAction(studentForm);
    setIsPending(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Student ${studentForm.name} registered and enrolled!` });
      setShowStudentModal(false);
      setStudentForm({ name: '', email: '', courseId: courses[0]?.id || '', avatarUrl: '' });
      router.refresh();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to register student' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Institutional Administration
            </span>
            <span className="text-xs text-slate-400">
              Active: <strong className="text-white">{currentInstructor?.name}</strong> ({currentInstructor?.role})
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Institutional Profile & Enrollment Manager</h2>
          <p className="text-slate-400 text-sm mt-1">
            Centrally initialize instructors, configure academic courses, and enroll students.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowInstructorModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" /> Add Instructor
          </button>
          <button
            type="button"
            onClick={() => setShowCourseModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" /> Add Course
          </button>
          <button
            type="button"
            onClick={() => setShowStudentModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Register Student
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800/80 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{statusMsg.text}</div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{instructors.length}</div>
            <div className="text-xs text-slate-400">Total Instructors</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <div className="text-xs text-slate-400">Active Courses</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{students.length}</div>
            <div className="text-xs text-slate-400">Registered Students</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('instructors')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'instructors'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Instructors ({instructors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Courses ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Students ({students.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'instructors' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Instructor Directory</h3>
            <span className="text-xs text-slate-400">Controlled by Institutional Admin Policy</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-slate-400 text-xs font-semibold">
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Courses</th>
                  <th className="p-4">Total Students</th>
                  <th className="p-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {instructors.map((inst) => {
                  const studentCount = inst.courses.reduce((acc: number, c: any) => acc + (c.students?.length || 0), 0);
                  return (
                    <tr key={inst.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={inst.avatarUrl || '/avatars/default-avatar.svg'}
                            alt={inst.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow shrink-0"
                          />
                          <div>
                            <Link
                              href={`/instructors/${inst.id}`}
                              className="font-bold text-white hover:text-indigo-300 transition"
                            >
                              {inst.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{inst.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            inst.role === 'ADMIN'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                          }`}
                        >
                          {inst.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {inst.courses.map((c: any) => (
                            <span key={c.id} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {c.code}
                            </span>
                          ))}
                          {inst.courses.length === 0 && <span className="text-xs text-slate-500 italic">None assigned</span>}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{studentCount}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/instructors/${inst.id}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-semibold border border-slate-700 transition inline-flex items-center gap-1"
                        >
                          View Profile &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Course Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-slate-400 text-xs font-semibold">
                  <th className="p-4">Code</th>
                  <th className="p-4">Course Name</th>
                  <th className="p-4">Term</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Enrolled Students</th>
                  <th className="p-4">Default Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-indigo-400">{c.code}</td>
                    <td className="p-4 font-semibold text-white">{c.name}</td>
                    <td className="p-4 text-slate-400">{c.term}</td>
                    <td className="p-4 text-slate-300">{c.instructor?.name}</td>
                    <td className="p-4 text-slate-300 font-medium">{c.students?.length || 0}</td>
                    <td className="p-4 text-slate-400">{c.defaultClassLengthMinutes} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Institutional Student Roster</h3>
            <span className="text-xs text-slate-400">{students.length} Total Registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-slate-400 text-xs font-semibold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Enrolled Course</th>
                  <th className="p-4">Lifecycle Status</th>
                  <th className="p-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={s.avatarUrl || '/avatars/default-avatar.svg'}
                          alt={s.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow shrink-0"
                        />
                        <div>
                          <Link
                            href={`/students/${s.id}`}
                            className="font-bold text-white hover:text-indigo-300 transition"
                          >
                            {s.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{s.email || '—'}</td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {s.course?.code} — {s.course?.name}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.isRemoved ? (
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                          Archived / Removed
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          Active Enrolled
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/students/${s.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-semibold border border-slate-700 transition inline-flex items-center gap-1"
                      >
                        View Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructor Modal */}
      {showInstructorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Add New Instructor
              </h3>
              <button onClick={() => setShowInstructorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInstructor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Profile Picture / Avatar</label>
                <AvatarPicker
                  currentAvatarUrl={instructorForm.avatarUrl}
                  onSelect={(url: string) => setInstructorForm({ ...instructorForm, avatarUrl: url })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={instructorForm.name}
                  onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                  placeholder="Prof. Jane Doe"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={instructorForm.email}
                  onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                  placeholder="jane.doe@instructorlms.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">System Role</label>
                <select
                  value={instructorForm.role}
                  onChange={(e) => setInstructorForm({ ...instructorForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="INSTRUCTOR">INSTRUCTOR (Standard)</option>
                  <option value="ADMIN">ADMIN (Institutional Administrator)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInstructorModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Add New Course
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Instructor</label>
                <select
                  value={courseForm.instructorId}
                  onChange={(e) => setCourseForm({ ...courseForm, instructorId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  placeholder="CS301"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="Advanced Cloud Architecture"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Term</label>
                  <input
                    type="text"
                    required
                    value={courseForm.term}
                    onChange={(e) => setCourseForm({ ...courseForm, term: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class Length (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={courseForm.defaultClassLengthMinutes}
                    onChange={(e) => setCourseForm({ ...courseForm, defaultClassLengthMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Register & Enroll Student
              </h3>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Profile Picture / Avatar</label>
                <AvatarPicker
                  currentAvatarUrl={studentForm.avatarUrl}
                  onSelect={(url: string) => setStudentForm({ ...studentForm, avatarUrl: url })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Lucas Vance"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email (optional)</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="lucas.v@student.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Course Enrollment</label>
                <select
                  value={studentForm.courseId}
                  onChange={(e) => setStudentForm({ ...studentForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.instructor?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isPending ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
