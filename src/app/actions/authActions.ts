'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

const INSTRUCTOR_COOKIE = 'active_instructor_id';

export async function switchInstructor(instructorId: string) {
  const cookieStore = cookies();
  cookieStore.set(INSTRUCTOR_COOKIE, instructorId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  });

  revalidatePath('/');
  revalidatePath('/attendance');
  revalidatePath('/homework');
  revalidatePath('/students');
  revalidatePath('/workload');
  revalidatePath('/announcements');
  revalidatePath('/admin');
  return { success: true };
}

export async function signOutInstructor() {
  const cookieStore = cookies();
  cookieStore.delete(INSTRUCTOR_COOKIE);
  revalidatePath('/');
  return { success: true };
}

export async function getAllInstructors() {
  return await prisma.instructor.findMany({
    include: {
      courses: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}
