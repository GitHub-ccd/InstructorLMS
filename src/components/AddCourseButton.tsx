'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddCourseToScheduleModal, { CatalogCourse } from './AddCourseToScheduleModal';

interface AddCourseButtonProps {
  catalogCourses: CatalogCourse[];
  currentInstructorCourses: { code: string; term: string }[];
  className?: string;
  buttonText?: string;
}

export default function AddCourseButton({
  catalogCourses,
  currentInstructorCourses,
  className,
  buttonText = 'Add Course to Schedule',
}: AddCourseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm'
        }
      >
        <Plus className="w-3.5 h-3.5 text-indigo-400" />
        <span>{buttonText}</span>
      </button>

      <AddCourseToScheduleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        catalogCourses={catalogCourses}
        currentInstructorCourses={currentInstructorCourses}
      />
    </>
  );
}
