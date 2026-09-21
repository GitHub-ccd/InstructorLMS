'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpenCheck,
  Users,
  Clock,
  Megaphone,
  GraduationCap,
  ShieldAlert,
  ArrowLeftRight,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentInstructor?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
}

const navItems = [
  { href: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance Tracker', icon: ClipboardCheck },
  { href: '/homework', label: 'Homework Matrix', icon: BookOpenCheck },
  { href: '/students', label: 'Student Profiles', icon: Users },
  { href: '/workload', label: 'Workload Log', icon: Clock },
  { href: '/announcements', label: 'Announcement Builder', icon: Megaphone },
];

export default function Sidebar({ currentInstructor }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const instructorName = currentInstructor?.name || 'Dr. Alex Vance';
  const instructorEmail = currentInstructor?.email || 'alex.vance@instructorlms.edu';
  const isAdmin = currentInstructor?.role === 'ADMIN';

  const NavLinks = () => (
    <div className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
            {item.label}
          </Link>
        );
      })}

      {/* Admin Panel Nav Link - Restricted to Institutional Admins */}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            pathname.startsWith('/admin')
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30'
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Admin Console
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Header (only visible on screens < md) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base">InstructorLMS</span>
            <span className="ml-2 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Instructor Only
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-300 bg-slate-800/80 border border-slate-700 hover:text-white"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-Over Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg">InstructorLMS</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-4">
            <NavLinks />
          </div>
        </div>

        {/* Mobile User Profile Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-3">
            {currentInstructor?.id ? (
              <Link
                href={`/instructors/${currentInstructor.id}`}
                onClick={() => setMobileOpen(false)}
                className="shrink-0 group"
              >
                <img
                  src={currentInstructor?.avatarUrl || '/avatars/default-avatar.svg'}
                  alt={instructorName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow transition group-hover:border-indigo-500"
                />
              </Link>
            ) : (
              <img
                src="/avatars/default-avatar.svg"
                alt={instructorName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow shrink-0"
              />
            )}
            <div className="truncate flex-1">
              <div className="flex items-center gap-1.5">
                {currentInstructor?.id ? (
                  <Link
                    href={`/instructors/${currentInstructor.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="font-bold text-slate-200 hover:text-indigo-300 truncate transition"
                  >
                    {instructorName}
                  </Link>
                ) : (
                  <p className="font-bold text-slate-200 truncate">{instructorName}</p>
                )}
                {isAdmin && (
                  <span className="text-[10px] bg-amber-950/80 text-amber-400 px-1 rounded border border-amber-800/40 shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="truncate text-slate-500 text-[11px]">{instructorEmail}</p>
              {currentInstructor?.id && (
                <Link
                  href={`/instructors/${currentInstructor.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                >
                  View Profile &rarr;
                </Link>
              )}
            </div>
          </div>
          <Link
            href="/signin"
            onClick={() => setMobileOpen(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Switch Profile
          </Link>
        </div>
      </div>

      {/* Desktop Sticky Sidebar (visible on md+) */}
      <aside className="hidden md:flex w-64 bg-slate-900/90 border-r border-slate-800 flex-col justify-between h-screen sticky top-0 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-wide">InstructorLMS</h1>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Instructor Only
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4">
            <NavLinks />
          </nav>
        </div>

        {/* Footer Info & Active Profile Switcher */}
        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-3">
          <div className="flex items-center gap-3">
            {currentInstructor?.id ? (
              <Link href={`/instructors/${currentInstructor.id}`} className="shrink-0 group">
                <img
                  src={currentInstructor?.avatarUrl || '/avatars/default-avatar.svg'}
                  alt={instructorName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow transition group-hover:border-indigo-500"
                />
              </Link>
            ) : (
              <img
                src="/avatars/default-avatar.svg"
                alt={instructorName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shadow shrink-0"
              />
            )}
            <div className="truncate flex-1">
              <div className="flex items-center gap-1.5">
                {currentInstructor?.id ? (
                  <Link
                    href={`/instructors/${currentInstructor.id}`}
                    className="font-bold text-slate-200 hover:text-indigo-300 truncate transition"
                  >
                    {instructorName}
                  </Link>
                ) : (
                  <p className="font-bold text-slate-200 truncate">{instructorName}</p>
                )}
                {isAdmin && (
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800/50 font-semibold shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="truncate text-slate-500 text-[11px]">{instructorEmail}</p>
              {currentInstructor?.id && (
                <Link
                  href={`/instructors/${currentInstructor.id}`}
                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                >
                  View Profile &rarr;
                </Link>
              )}
            </div>
          </div>

          <Link
            href="/signin"
            className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-slate-700/80 transition"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" /> Switch / Sign In
          </Link>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>Operating Cost:</span>
            <span className="text-emerald-400 font-semibold">$0.00/mo</span>
          </div>
        </div>
      </aside>
    </>
  );
}
