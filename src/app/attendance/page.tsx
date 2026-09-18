import { prisma } from '@/lib/prisma';
import AttendanceClient from './AttendanceClient';

export const revalidate = 0;

export default async function AttendancePage() {
  const courses = await prisma.course.findMany({
    include: {
      students: true,
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

  return <AttendanceClient courses={courses} />;
}
