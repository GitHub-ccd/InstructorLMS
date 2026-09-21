import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getActiveInstructor } from '@/lib/auth/server';
import InstructorProfileClient from './InstructorProfileClient';

export const revalidate = 0;

export default async function InstructorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const activeInstructor = await getActiveInstructor();

  const instructor = await prisma.instructor.findUnique({
    where: { id: params.id },
    include: {
      courses: {
        include: {
          students: {
            where: { isRemoved: false },
          },
          attendanceSessions: true,
          timeLogs: {
            orderBy: {
              sessionDate: 'desc',
            },
          },
        },
        orderBy: {
          code: 'asc',
        },
      },
    },
  });

  if (!instructor) {
    notFound();
  }

  const canEdit = Boolean(
    activeInstructor &&
      (activeInstructor.id === instructor.id || activeInstructor.role === 'ADMIN')
  );

  return <InstructorProfileClient instructor={instructor as any} canEdit={canEdit} />;
}
