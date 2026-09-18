import { prisma } from '@/lib/prisma';
import { getActiveInstructor } from '@/lib/auth/server';
import WorkloadClient from './WorkloadClient';

export const revalidate = 0;

export default async function WorkloadPage() {
  const activeInstructor = await getActiveInstructor();

  let courses = await prisma.course.findMany({
    where: activeInstructor ? { instructorId: activeInstructor.id } : {},
    include: {
      timeLogs: {
        orderBy: {
          sessionDate: 'desc',
        },
      },
    },
    orderBy: { code: 'asc' },
  });

  if (courses.length === 0) {
    courses = await prisma.course.findMany({
      include: {
        timeLogs: {
          orderBy: {
            sessionDate: 'desc',
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  return <WorkloadClient courses={courses} />;
}
