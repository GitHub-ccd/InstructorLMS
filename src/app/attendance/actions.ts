'use server';

import { prisma } from '@/lib/prisma';
import { AttendanceStatus } from '@/types';
import { revalidatePath } from 'next/cache';

const MAX_BACKFILL_DAYS = 14;

function checkWithin14Days(date: Date) {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  // Allow today, future same day, or up to 14 days in the past
  return diffDays <= MAX_BACKFILL_DAYS;
}

export async function toggleAttendanceRecord(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus
) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Attendance session not found.');
  }

  if (!checkWithin14Days(session.date)) {
    throw new Error(`Session is older than ${MAX_BACKFILL_DAYS} days and is locked for back-fill.`);
  }

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
  return { success: true };
}

export async function batchSaveAttendance(
  sessionId: string,
  records: { studentId: string; status: AttendanceStatus }[]
) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Attendance session not found.');
  }

  if (!checkWithin14Days(session.date)) {
    throw new Error(`Session is older than ${MAX_BACKFILL_DAYS} days and is locked.`);
  }

  for (const r of records) {
    await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: r.studentId,
        },
      },
      update: { status: r.status },
      create: {
        sessionId,
        studentId: r.studentId,
        status: r.status,
      },
    });
  }

  revalidatePath('/attendance');
  revalidatePath('/');
  return { success: true };
}

export async function clearAttendanceSessionRecords(sessionId: string) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Attendance session not found.');
  }

  if (!checkWithin14Days(session.date)) {
    throw new Error(`Session is older than ${MAX_BACKFILL_DAYS} days and is locked.`);
  }

  await prisma.attendanceRecord.deleteMany({
    where: { sessionId },
  });

  revalidatePath('/attendance');
  revalidatePath('/');
  return { success: true };
}

export async function deleteAttendanceSessionAction(sessionId: string) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error('Attendance session not found.');
  }

  if (!checkWithin14Days(session.date)) {
    throw new Error(`Session is older than ${MAX_BACKFILL_DAYS} days and cannot be deleted.`);
  }

  await prisma.attendanceRecord.deleteMany({ where: { sessionId } });
  await prisma.attendanceSession.delete({ where: { id: sessionId } });

  revalidatePath('/attendance');
  revalidatePath('/');
  return { success: true };
}

export async function createOrGetAttendanceSession(courseId: string, dateIsoString: string, notes?: string) {
  const targetDate = new Date(dateIsoString);

  if (!checkWithin14Days(targetDate)) {
    throw new Error(`Cannot create attendance session older than ${MAX_BACKFILL_DAYS} days.`);
  }

  // Check if session for this day already exists in the course
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existing = await prisma.attendanceSession.findFirst({
    where: {
      courseId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { records: true },
  });

  if (existing) {
    return existing;
  }

  const created = await prisma.attendanceSession.create({
    data: {
      courseId,
      date: targetDate,
      notes: notes || `Session on ${targetDate.toLocaleDateString()}`,
    },
    include: { records: true },
  });

  revalidatePath('/attendance');
  revalidatePath('/');
  return created;
}
