'use server';

import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function createInstructorAction(data: {
  name: string;
  email: string;
  role: 'INSTRUCTOR' | 'ADMIN';
}) {
  try {
    const caller = await getActiveInstructor();
    if (caller?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Administrative role required.');
    }

    const existing = await prisma.instructor.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error('An instructor with this email already exists.');
    }

    const created = await prisma.instructor.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/signin');
    return { success: true, instructor: created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createStudentAction(data: {
  name: string;
  email?: string;
  courseId: string;
}) {
  try {
    const created = await prisma.student.create({
      data: {
        name: data.name,
        email: data.email || null,
        courseId: data.courseId,
        isRemoved: false,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/students');
    revalidatePath('/attendance');
    revalidatePath('/homework');
    return { success: true, student: created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createCourseAction(data: {
  instructorId: string;
  name: string;
  code: string;
  term: string;
  defaultClassLengthMinutes?: number;
}) {
  try {
    const caller = await getActiveInstructor();
    if (caller?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Administrative role required.');
    }

    const created = await prisma.course.create({
      data: {
        instructorId: data.instructorId,
        name: data.name,
        code: data.code,
        term: data.term,
        defaultClassLengthMinutes: data.defaultClassLengthMinutes || 60,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, course: created };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
