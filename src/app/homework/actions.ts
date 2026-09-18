'use server';

import { prisma } from '@/lib/prisma';
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
