'use server';

import { prisma } from '@/lib/prisma';
import { HomeworkStatus } from '@/types';
import { revalidatePath } from 'next/cache';

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
