'use server';

import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import { HomeworkStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createAssignmentAction(data: {
  courseId: string;
  title: string;
  dueDate: string;
  totalPoints: number;
  type: 'HOMEWORK' | 'QUIZ' | 'PRESENTATION';
}) {
  try {
    const caller = await getActiveInstructor();
    if (!caller) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return { success: false, error: 'Course not found.' };
    }

    if (caller.role !== 'ADMIN' && course.instructorId !== caller.id) {
      return {
        success: false,
        error: 'Unauthorized: You can only create assignments for courses you are currently teaching.',
      };
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        dueDate: new Date(data.dueDate),
        totalPoints: Number(data.totalPoints) || 100,
        type: data.type,
      },
    });

    // Automatically initialize submission records for all enrolled students in course
    const students = await prisma.student.findMany({
      where: { courseId: data.courseId, isRemoved: false },
    });

    for (const s of students) {
      await prisma.homeworkSubmission.create({
        data: {
          assignmentId: assignment.id,
          studentId: s.id,
          status: 'MISSING',
          grade: null,
        },
      });
    }

    revalidatePath('/homework');
    revalidatePath('/');
    return { success: true, assignment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAssignmentAction(assignmentId: string) {
  try {
    const caller = await getActiveInstructor();
    if (!caller) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      return { success: false, error: 'Assignment not found.' };
    }

    if (caller.role !== 'ADMIN' && assignment.course.instructorId !== caller.id) {
      return {
        success: false,
        error: 'Unauthorized: You can only delete assignments for courses you are currently teaching.',
      };
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    revalidatePath('/homework');
    revalidatePath('/');
    return { success: true, message: `"${assignment.title}" was deleted.` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete assignment.' };
  }
}

export async function updateHomeworkSubmission(
  assignmentId: string,
  studentId: string,
  status: HomeworkStatus,
  grade?: number | null
) {
  await prisma.homeworkSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId,
      },
    },
    update: {
      status,
      grade: grade !== undefined ? grade : undefined,
    },
    create: {
      assignmentId,
      studentId,
      status,
      grade: grade !== undefined ? grade : null,
    },
  });

  revalidatePath('/homework');
  revalidatePath('/');
}
