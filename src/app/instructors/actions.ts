'use server';

import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function updateInstructorAvatarAction(instructorId: string, avatarUrl: string) {
  try {
    const caller = await getActiveInstructor();
    if (!caller) {
      return { success: false, error: 'Authentication required.' };
    }

    // Must be either ADMIN or the instructor updating their own avatar
    if (caller.role !== 'ADMIN' && caller.id !== instructorId) {
      return { success: false, error: 'Unauthorized: You can only update your own profile picture.' };
    }

    const updated = await prisma.instructor.update({
      where: { id: instructorId },
      data: { avatarUrl },
    });

    revalidatePath(`/instructors/${instructorId}`);
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/attendance');
    revalidatePath('/homework');
    return { success: true, instructor: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update avatar.' };
  }
}
