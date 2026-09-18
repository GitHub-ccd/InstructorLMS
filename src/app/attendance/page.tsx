import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import AttendanceClient from './AttendanceClient';

export const revalidate = 0;

export default async function AttendancePage() {
  const activeInstructor = await getActiveInstructor();

  // Find courses belonging to the active instructor, or fallback to all courses
  let courses = await prisma.course.findMany({
    where: activeInstructor ? { instructorId: activeInstructor.id } : {},
    include: {
      students: {
        where: { isRemoved: false },
        orderBy: { name: 'asc' },
      },
      attendanceSessions: {
        include: {
          records: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  // If instructor has no courses yet, fall back to all courses
  if (courses.length === 0) {
    courses = await prisma.course.findMany({
      include: {
        students: {
          where: { isRemoved: false },
          orderBy: { name: 'asc' },
        },
        attendanceSessions: {
          include: {
            records: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  return <AttendanceClient courses={courses} activeInstructor={activeInstructor} />;
}
