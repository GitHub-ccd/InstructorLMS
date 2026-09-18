'use client';

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
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance Tracker', icon: ClipboardCheck },
  { href: '/homework', label: 'Homework Matrix', icon: BookOpenCheck },
  { href: '/students', label: 'Student Profiles', icon: Users },
  { href: '/workload', label: 'Workload Log', icon: Clock },
  { href: '/announcements', label: 'Announcement Builder', icon: Megaphone },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
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
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
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
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500">
        <p className="font-medium text-slate-400">Dr. Alex Vance</p>
        <p className="truncate text-slate-500">alex.vance@instructorlms.edu</p>
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
          <span>Operating Cost:</span>
          <span className="text-emerald-400 font-semibold">$0.00/mo</span>
        </div>
      </div>
    </aside>
  );
}
