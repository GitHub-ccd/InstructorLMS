import { prisma } from '@/lib/prisma';
import HomeworkClient from './HomeworkClient';

export const revalidate = 0;

export default async function HomeworkPage() {
  const courses = await prisma.course.findMany({
    include: {
      students: true,
      assignments: {
        include: {
          submissions: true,
        },
      },
    },
  });

  return <HomeworkClient courses={courses} />;
}
