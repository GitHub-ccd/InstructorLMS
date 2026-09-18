import { prisma } from '@/lib/prisma';
import WorkloadClient from './WorkloadClient';

export const revalidate = 0;

export default async function WorkloadPage() {
  const courses = await prisma.course.findMany({
    include: {
      timeLogs: {
        orderBy: {
          sessionDate: 'desc',
        },
      },
    },
  });

  return <WorkloadClient courses={courses} />;
}
