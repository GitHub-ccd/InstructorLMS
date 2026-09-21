'use server';

import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
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
    const caller = await getActiveInstructor();
    if (!caller) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    // 1. Verify caller is either ADMIN or the instructor teaching this course
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return { success: false, error: 'Course not found.' };
    }

    if (caller.role !== 'ADMIN' && course.instructorId !== caller.id) {
      return {
        success: false,
        error: 'Unauthorized: Instructors can only enroll students in courses they are currently teaching.',
      };
    }

    // 2. Verify student exists in institutional registered student directory
    const existingStudent = await prisma.student.findFirst({
      where: { name: data.name },
    });

    if (!existingStudent && caller.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: Instructors cannot register new students. Only Administrators can register new students in the Admin Console.',
      };
    }

    // 3. Check if student is already enrolled in this course
    const alreadyEnrolled = await prisma.student.findFirst({
      where: {
        courseId: data.courseId,
        name: data.name,
      },
    });

    if (alreadyEnrolled) {
      if (alreadyEnrolled.isRemoved) {
        // Restore soft-deleted student
        await prisma.student.update({
          where: { id: alreadyEnrolled.id },
          data: { isRemoved: false },
        });
        revalidatePath('/students');
        revalidatePath('/');
        return { success: true, student: alreadyEnrolled, message: `${data.name} was restored to this course.` };
      }
      return { success: false, error: `${data.name} is already enrolled in this course.` };
    }

    const student = await prisma.student.create({
      data: {
        name: data.name,
        email: data.email || existingStudent?.email || null,
        courseId: data.courseId,
        avatarUrl: existingStudent?.avatarUrl || null,
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
