import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import HomeworkClient from './HomeworkClient';

export const revalidate = 0;

export default async function HomeworkPage() {
  const activeInstructor = await getActiveInstructor();

  let courses = await prisma.course.findMany({
    where: activeInstructor ? { instructorId: activeInstructor.id } : {},
    include: {
      students: {
        where: { isRemoved: false },
        orderBy: { name: 'asc' },
      },
      assignments: {
        include: {
          submissions: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      },
    },
  });

  if (courses.length === 0) {
    courses = await prisma.course.findMany({
      include: {
        students: {
          where: { isRemoved: false },
          orderBy: { name: 'asc' },
        },
        assignments: {
          include: {
            submissions: true,
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  return <HomeworkClient courses={courses} />;
}
