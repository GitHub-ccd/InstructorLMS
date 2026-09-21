import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import StudentsClient from './StudentsClient';

export const revalidate = 0;

export default async function StudentsPage() {
  const activeInstructor = await getActiveInstructor();

  // Get active instructor's courses, or all courses
  let courses = await prisma.course.findMany({
    where: activeInstructor ? { instructorId: activeInstructor.id } : {},
    orderBy: { code: 'asc' },
  });

  if (courses.length === 0) {
    courses = await prisma.course.findMany({
      orderBy: { code: 'asc' },
    });
  }

  const courseIds = courses.map((c) => c.id);

  // Fetch students for these courses (both active and removed so tabs can switch)
  const students = await prisma.student.findMany({
    where: {
      courseId: { in: courseIds },
    },
    include: {
      course: true,
      attendanceRecords: true,
      homeworkSubmissions: true,
      strategies: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Also fetch all registered students across the entire institution for the enrollment selector
  const allRegisteredStudents = await prisma.student.findMany({
    distinct: ['name'],
    orderBy: { name: 'asc' },
  });

  // Fetch institutional catalog courses for course scheduling
  const catalogCourses = await prisma.course.findMany({
    distinct: ['code'],
    select: {
      code: true,
      name: true,
      defaultClassLengthMinutes: true,
    },
    orderBy: { code: 'asc' },
  });

  return (
    <StudentsClient
      students={students}
      courses={courses}
      allRegisteredStudents={allRegisteredStudents}
      catalogCourses={catalogCourses}
    />
  );
}
