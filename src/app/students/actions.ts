'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
}
