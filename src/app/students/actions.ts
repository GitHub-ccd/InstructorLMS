'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleStudentRemoval(studentId: string, isRemoved: boolean) {
  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { isRemoved },
    });

    revalidatePath('/students');
    revalidatePath(`/students/${studentId}`);
    revalidatePath('/');
    revalidatePath('/attendance');
    revalidatePath('/homework');
    return { success: true, student };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function enrollExistingStudentInCourse(data: {
  name: string;
  email?: string;
  courseId: string;
}) {
  try {
    const student = await prisma.student.create({
      data: {
        name: data.name,
        email: data.email || null,
        courseId: data.courseId,
        isRemoved: false,
      },
    });

    // Populate submissions for existing assignments in the course
    const assignments = await prisma.assignment.findMany({
      where: { courseId: data.courseId },
    });

    for (const a of assignments) {
      await prisma.homeworkSubmission.create({
        data: {
          assignmentId: a.id,
          studentId: student.id,
          status: 'MISSING',
          grade: null,
        },
      });
    }

    revalidatePath('/students');
    revalidatePath('/');
    revalidatePath('/attendance');
    revalidatePath('/homework');
    return { success: true, student };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveStudentStrategy(studentId: string, strategyNotes: string) {
  const existing = await prisma.studentStrategy.findFirst({
    where: { studentId },
  });

  if (existing) {
    await prisma.studentStrategy.update({
      where: { id: existing.id },
      data: { strategyNotes },
    });
  } else {
    await prisma.studentStrategy.create({
      data: {
        studentId,
        strategyNotes,
      },
    });
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/students');
  revalidatePath('/');
  return { success: true };
}
