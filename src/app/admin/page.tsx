import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import AdminClient from './AdminClient';

export const revalidate = 0;

export default async function AdminPage() {
  const currentInstructor = await getActiveInstructor();

  const instructors = await prisma.instructor.findMany({
    include: {
      courses: {
        include: {
          students: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const courses = await prisma.course.findMany({
    include: {
      instructor: true,
      students: true,
    },
    orderBy: { code: 'asc' },
  });

  const students = await prisma.student.findMany({
    include: {
      course: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminClient
      currentInstructor={currentInstructor}
      instructors={instructors}
      courses={courses}
      students={students}
    />
  );
}
