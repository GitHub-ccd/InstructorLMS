'use server';

import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

/**
 * Allows an instructor to add an existing course from the institutional catalog
 * to their semester teaching schedule.
 * Instructors cannot invent or create new courses from scratch (Admin-only).
 */
export async function addExistingCourseToScheduleAction(data: {
  code: string;
  term?: string;
}) {
  try {
    const caller = await getActiveInstructor();
    if (!caller) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    const term = data.term?.trim() || 'Fall 2026';
    const code = data.code.trim().toUpperCase();

    // 1. Verify this course code actually exists in the institutional catalog
    const existingCatalogCourse = await prisma.course.findFirst({
      where: { code },
      select: {
        code: true,
        name: true,
        defaultClassLengthMinutes: true,
      },
    });

    if (!existingCatalogCourse) {
      return {
        success: false,
        error: `Course code "${code}" does not exist in the institutional catalog. Only Administrators can create new course codes.`,
      };
    }

    // 2. Check if the instructor already has this course in their schedule for this term
    const alreadyTeaching = await prisma.course.findFirst({
      where: {
        instructorId: caller.id,
        code,
        term,
      },
    });

    if (alreadyTeaching) {
      return {
        success: false,
        error: `You already have ${code} (${term}) in your teaching schedule.`,
      };
    }

    // 3. Add course section to instructor's schedule
    const newCourseSection = await prisma.course.create({
      data: {
        instructorId: caller.id,
        code: existingCatalogCourse.code,
        name: existingCatalogCourse.name,
        term,
        defaultClassLengthMinutes: existingCatalogCourse.defaultClassLengthMinutes || 60,
      },
    });

    revalidatePath('/');
    revalidatePath('/attendance');
    revalidatePath('/homework');
    revalidatePath('/students');
    revalidatePath('/workload');

    return {
      success: true,
      course: newCourseSection,
      message: `${existingCatalogCourse.code} (${existingCatalogCourse.name}) added to your teaching schedule!`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add course to schedule.' };
  }
}
