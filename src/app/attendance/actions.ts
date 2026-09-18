'use server';

import { prisma } from '@/lib/prisma';
import { AttendanceStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function toggleAttendanceRecord(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus
) {
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId,
      },
    },
    update: { status },
    create: {
      sessionId,
      studentId,
      status,
    },
  });

  revalidatePath('/attendance');
  revalidatePath('/');
}

export async function createAttendanceSession(courseId: string, dateIso: string, notes?: string) {
  const session = await prisma.attendanceSession.create({
    data: {
      courseId,
      date: new Date(dateIso),
      notes,
    },
  });

  revalidatePath('/attendance');
  return session;
}
