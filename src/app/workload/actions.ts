'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function logInstructorWorkload(
  courseId: string,
  sessionDateIso: string,
  prepTimeHours: number,
  contactHours: number,
  notes?: string
) {
  await prisma.instructorTimeLog.create({
    data: {
      courseId,
      sessionDate: new Date(sessionDateIso),
      prepTimeHours,
      contactHours,
      notes,
    },
  });

  revalidatePath('/workload');
  revalidatePath('/');
}
