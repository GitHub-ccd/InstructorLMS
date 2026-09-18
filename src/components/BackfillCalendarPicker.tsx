'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';

interface BackfillCalendarPickerProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateIso: string) => void;
  onOpenSession: (dateIso: string) => void;
  existingSessionDates?: string[]; // Array of 'YYYY-MM-DD' for recorded sessions
  isSubmitting?: boolean;
}

export default function BackfillCalendarPicker({
  selectedDate,
  onSelectDate,
  onOpenSession,
  existingSessionDates = [],
  isSubmitting = false,
}: BackfillCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute 14-day window bounds based on today at local midnight
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

  // Parse currently selected date for the calendar view month
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  // Keep view aligned when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days for the current viewMonth
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Helper to format Date to YYYY-MM-DD
  const formatYmd = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateAllowed = (dateObj: Date) => {
    const checkTime = dateObj.getTime();
    return checkTime >= fourteenDaysAgo.getTime() && checkTime <= today.getTime();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Construct day cells
  const dayCells = [];

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
    dayCells.push({
      date: d,
      isCurrentMonth: false,
      ymd: formatYmd(d),
      isAllowed: isDateAllowed(d),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    dayCells.push({
      date: dateObj,
      isCurrentMonth: true,
      ymd: formatYmd(dateObj),
      isAllowed: isDateAllowed(dateObj),
    });
  }

  // Next month padding days to complete grid (multiples of 7)
  const remainingCells = 42 - dayCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(viewYear, viewMonth + 1, d);
    dayCells.push({
      date: dateObj,
      isCurrentMonth: false,
      ymd: formatYmd(dateObj),
      isAllowed: isDateAllowed(dateObj),
    });
  }

  const handleSelect = (ymd: string, isAllowed: boolean) => {
    if (!isAllowed) return;
    onSelectDate(ymd);
  };

  const handleSelectAndOpen = (ymd: string, isAllowed: boolean) => {
    if (!isAllowed) return;
    onSelectDate(ymd);
    onOpenSession(ymd);
    setIsOpen(false);
  };

  // Quick shortcuts
  const selectToday = () => {
    const ymd = formatYmd(today);
    onSelectDate(ymd);
    onOpenSession(ymd);
    setIsOpen(false);
  };

  const selectYesterday = () => {
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    const ymd = formatYmd(y);
    onSelectDate(ymd);
    onOpenSession(ymd);
    setIsOpen(false);
  };

  // Formatted display of selected date
  const displaySelectedDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Select Date';

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 border transition-all duration-200 shadow-sm ${
            isOpen
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-indigo-400" />
          <span className="font-bold">{displaySelectedDate}</span>
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/40">
            ≤ 14d Backfill
          </span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onOpenSession(selectedDate)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" /> Open / Create
        </button>
      </div>

      {/* Popover Calendar Grid */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header: Month + Year + Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">
                {monthNames[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 ml-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Shortcuts */}
          <div className="flex items-center gap-2 py-2.5 border-b border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-medium">Quick pick:</span>
            <button
              type="button"
              onClick={selectToday}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition font-semibold"
            >
              Today
            </button>
            <button
              type="button"
              onClick={selectYesterday}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition font-semibold"
            >
              Yesterday
            </button>
            <span className="ml-auto text-[10px] text-slate-500 italic">
              Last 14 days active
            </span>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-2">
            {weekdayNames.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {dayCells.map((cell, idx) => {
              const isSelected = cell.ymd === selectedDate;
              const isToday = cell.ymd === formatYmd(today);
              const hasRecordedSession = existingSessionDates.includes(cell.ymd);

              if (!cell.isAllowed) {
                // Grayed out, disabled day outside the 14-day backfill window
                return (
                  <div
                    key={idx}
                    className="h-10 rounded-xl flex flex-col items-center justify-center text-slate-600/40 bg-slate-950/20 cursor-not-allowed select-none relative group"
                    title="Beyond 14-day backfill window (locked)"
                  >
                    <span className="text-xs">{cell.date.getDate()}</span>
                    <Lock className="w-2.5 h-2.5 text-slate-700/50 mt-0.5" />
                  </div>
                );
              }

              // Active, allowable date within the 14-day backfill window
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(cell.ymd, true)}
                  onDoubleClick={() => handleSelectAndOpen(cell.ymd, true)}
                  className={`h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-150 font-medium relative group ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400'
                      : isToday
                      ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 hover:bg-indigo-600 hover:text-white'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-indigo-600 hover:text-white border border-slate-700/60'
                  }`}
                  title={`${cell.ymd}${hasRecordedSession ? ' (Session Recorded)' : ''}`}
                >
                  <span className="text-xs">{cell.date.getDate()}</span>

                  {/* Indicator Dot for Recorded Session */}
                  {hasRecordedSession && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                        isSelected ? 'bg-white' : 'bg-emerald-400'
                      }`}
                      title="Attendance recorded for this date"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Legend & Action */}
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Recorded</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Locked (&gt;14d)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectAndOpen(selectedDate, true)}
              disabled={isSubmitting}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition"
            >
              Open Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
